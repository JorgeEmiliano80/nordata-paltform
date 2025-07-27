-- Corrigir problemas de segurança identificados pelo linter

-- 1. Adicionar search_path às funções para evitar warnings de segurança
ALTER FUNCTION public.is_admin(UUID) SET search_path = public;
ALTER FUNCTION public.generate_invitation_token() SET search_path = public;
ALTER FUNCTION public.trigger_databricks_processing(UUID) SET search_path = public;

-- 2. Remover a view admin_dashboard que está expondo dados do auth.users
-- e criar uma função security definer no lugar
DROP VIEW IF EXISTS public.admin_dashboard;

-- 3. Criar função security definer para admin dashboard ao invés de view
CREATE OR REPLACE FUNCTION public.get_admin_dashboard()
RETURNS TABLE (
    user_id UUID,
    full_name TEXT,
    company_name TEXT,
    role public.user_role,
    user_created_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN,
    total_files BIGINT,
    processed_files BIGINT,
    failed_files BIGINT,
    last_upload TIMESTAMP WITH TIME ZONE,
    total_chat_messages BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Verificar se o usuário atual é admin
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Acesso negado: apenas administradores podem acessar estes dados';
    END IF;
    
    RETURN QUERY
    SELECT 
        p.user_id,
        p.full_name,
        p.company_name,
        p.role,
        p.created_at as user_created_at,
        p.is_active,
        COUNT(f.id) as total_files,
        COUNT(CASE WHEN f.status = 'done' THEN 1 END) as processed_files,
        COUNT(CASE WHEN f.status = 'error' THEN 1 END) as failed_files,
        MAX(f.uploaded_at) as last_upload,
        COUNT(ch.id) as total_chat_messages
    FROM public.profiles p
    LEFT JOIN public.files f ON p.user_id = f.user_id
    LEFT JOIN public.chat_history ch ON p.user_id = ch.user_id
    WHERE p.role = 'client'
    GROUP BY p.user_id, p.full_name, p.company_name, p.role, p.created_at, p.is_active;
END;
$$;

-- 4. Criar função para criar perfil de usuário admin inicial
CREATE OR REPLACE FUNCTION public.create_admin_user(
    admin_email TEXT,
    admin_password TEXT,
    admin_name TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_user_id UUID;
    admin_count INTEGER;
BEGIN
    -- Verificar se já existe algum admin no sistema
    SELECT COUNT(*) INTO admin_count FROM public.profiles WHERE role = 'admin';
    
    -- Se já existe admin, só outro admin pode criar novos admins
    IF admin_count > 0 AND NOT public.is_admin() THEN
        RAISE EXCEPTION 'Apenas administradores podem criar novos usuários';
    END IF;
    
    -- Esta função será usada apenas para setup inicial ou por outros admins
    -- O Supabase Auth não permite criar usuários diretamente via SQL
    -- Esta função retorna apenas um UUID para referência futura
    new_user_id := gen_random_uuid();
    
    RETURN new_user_id;
END;
$$;

-- 5. Criar função para convidar usuários (gerar token de convite)
CREATE OR REPLACE FUNCTION public.invite_user(
    invite_email TEXT,
    invite_name TEXT,
    invite_company TEXT,
    invite_industry TEXT DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    invitation_token TEXT;
    current_admin_id UUID;
BEGIN
    -- Verificar se o usuário atual é admin
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Apenas administradores podem convidar usuários';
    END IF;
    
    current_admin_id := auth.uid();
    invitation_token := public.generate_invitation_token();
    
    -- Criar um registro temporário de convite (podemos criar uma tabela separada para isso)
    INSERT INTO public.profiles (
        user_id, 
        full_name, 
        company_name, 
        industry,
        role, 
        invitation_token, 
        invited_by, 
        invited_at,
        is_active
    ) VALUES (
        gen_random_uuid(), -- UUID temporário até que o usuário se registre
        invite_name,
        invite_company,
        invite_industry,
        'client',
        invitation_token,
        current_admin_id,
        now(),
        false -- Não ativo até completar o registro
    );
    
    RETURN invitation_token;
END;
$$;

-- 6. Criar função para validar token de convite e ativar usuário
CREATE OR REPLACE FUNCTION public.activate_invited_user(
    user_uuid UUID,
    token TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    profile_exists BOOLEAN;
BEGIN
    -- Verificar se existe um perfil com esse token de convite
    SELECT EXISTS(
        SELECT 1 FROM public.profiles 
        WHERE invitation_token = token AND is_active = false
    ) INTO profile_exists;
    
    IF NOT profile_exists THEN
        RETURN false;
    END IF;
    
    -- Ativar o usuário e associar ao UUID real do auth
    UPDATE public.profiles 
    SET 
        user_id = user_uuid,
        is_active = true,
        invitation_token = NULL
    WHERE invitation_token = token AND is_active = false;
    
    RETURN true;
END;
$$;

-- 7. Criar tabela separada para convites pendentes (melhor prática)
CREATE TABLE public.pending_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    company_name TEXT,
    industry TEXT,
    invitation_token TEXT NOT NULL UNIQUE,
    invited_by UUID NOT NULL REFERENCES auth.users(id),
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '7 days'),
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS na tabela de convites
ALTER TABLE public.pending_invitations ENABLE ROW LEVEL SECURITY;

-- Políticas para pending_invitations
CREATE POLICY "Admins podem gerenciar convites" 
ON public.pending_invitations FOR ALL 
USING (public.is_admin());

-- Política para permitir que usuários com token válido vejam seu convite
CREATE POLICY "Usuários podem ver convite válido" 
ON public.pending_invitations FOR SELECT 
USING (
    invitation_token IS NOT NULL AND
    expires_at > now() AND
    used_at IS NULL
);

-- 8. Recriar função de convite usando a nova tabela
CREATE OR REPLACE FUNCTION public.create_invitation(
    invite_email TEXT,
    invite_name TEXT,
    invite_company TEXT,
    invite_industry TEXT DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    invitation_token TEXT;
    current_admin_id UUID;
BEGIN
    -- Verificar se o usuário atual é admin
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Apenas administradores podem convidar usuários';
    END IF;
    
    current_admin_id := auth.uid();
    invitation_token := public.generate_invitation_token();
    
    -- Verificar se já existe convite pendente para este email
    IF EXISTS (SELECT 1 FROM public.pending_invitations WHERE email = invite_email AND used_at IS NULL) THEN
        RAISE EXCEPTION 'Já existe um convite pendente para este email';
    END IF;
    
    -- Criar convite
    INSERT INTO public.pending_invitations (
        email,
        full_name,
        company_name,
        industry,
        invitation_token,
        invited_by
    ) VALUES (
        invite_email,
        invite_name,
        invite_company,
        invite_industry,
        invitation_token,
        current_admin_id
    );
    
    RETURN invitation_token;
END;
$$;

-- 9. Função para validar convite durante registro
CREATE OR REPLACE FUNCTION public.validate_invitation(token TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    invitation_data JSON;
BEGIN
    SELECT json_build_object(
        'valid', true,
        'email', email,
        'full_name', full_name,
        'company_name', company_name,
        'industry', industry
    ) INTO invitation_data
    FROM public.pending_invitations
    WHERE invitation_token = token 
    AND expires_at > now() 
    AND used_at IS NULL;
    
    IF invitation_data IS NULL THEN
        RETURN json_build_object('valid', false, 'message', 'Token inválido ou expirado');
    END IF;
    
    RETURN invitation_data;
END;
$$;

-- 10. Função para marcar convite como usado
CREATE OR REPLACE FUNCTION public.use_invitation(
    user_uuid UUID,
    token TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    invitation_record RECORD;
BEGIN
    -- Buscar o convite válido
    SELECT * INTO invitation_record
    FROM public.pending_invitations
    WHERE invitation_token = token 
    AND expires_at > now() 
    AND used_at IS NULL;
    
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Marcar convite como usado
    UPDATE public.pending_invitations 
    SET used_at = now()
    WHERE id = invitation_record.id;
    
    -- Criar/atualizar perfil do usuário
    INSERT INTO public.profiles (
        user_id,
        full_name,
        company_name,
        industry,
        role,
        accepted_terms,
        is_active
    ) VALUES (
        user_uuid,
        invitation_record.full_name,
        invitation_record.company_name,
        invitation_record.industry,
        'client',
        true,
        true
    ) ON CONFLICT (user_id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        company_name = EXCLUDED.company_name,
        industry = EXCLUDED.industry,
        role = EXCLUDED.role,
        is_active = EXCLUDED.is_active;
    
    RETURN true;
END;
$$;