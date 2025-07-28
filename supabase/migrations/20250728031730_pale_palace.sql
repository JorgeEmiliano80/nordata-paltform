/*
  # Configuración completa de la plataforma NORDATA.AI

  Este script recrea la base de datos desde cero con todas las tablas necesarias
  para la plataforma de procesamiento de datos y configura el usuario master admin.

  ## Nuevas Tablas
  1. **profiles** - Perfiles de usuario con roles y información de empresa
  2. **files** - Archivos subidos para procesamiento
  3. **insights** - Insights generados por IA/Databricks
  4. **chat_history** - Historial de conversaciones con el chatbot
  5. **processing_logs** - Logs de procesamiento de archivos
  6. **notifications** - Sistema de notificaciones
  7. **pending_invitations** - Gestión de invitaciones pendientes

  ## Seguridad
  - RLS habilitado en todas las tablas
  - Políticas específicas para admins y usuarios
  - Funciones security definer para operaciones sensibles

  ## Usuario Master
  - Email: iamjorgear80@gmail.com
  - Rol: admin
  - Empresa: NORDATA.AI
*/

-- Limpiar tablas existentes si existen (en orden correcto para evitar errores de FK)
DROP TABLE IF EXISTS public.insights CASCADE;
DROP TABLE IF EXISTS public.chat_history CASCADE;
DROP TABLE IF EXISTS public.processing_logs CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.files CASCADE;
DROP TABLE IF EXISTS public.pending_invitations CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.pipelines CASCADE;
DROP TABLE IF EXISTS public.datasets CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Limpiar tipos existentes
DROP TYPE IF EXISTS public.user_role CASCADE;
DROP TYPE IF EXISTS public.file_status CASCADE;
DROP TYPE IF EXISTS public.insight_type CASCADE;

-- Limpiar funciones existentes
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.generate_invitation_token() CASCADE;
DROP FUNCTION IF EXISTS public.create_invitation(TEXT, TEXT, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.validate_invitation(TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.use_invitation(UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.get_admin_dashboard() CASCADE;
DROP FUNCTION IF EXISTS public.validate_master_credentials(TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_stats(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.cleanup_file_data(UUID) CASCADE;

-- Limpiar buckets de storage
DELETE FROM storage.objects WHERE bucket_id IN ('data-files', 'processed-results', 'datasets');
DELETE FROM storage.buckets WHERE id IN ('data-files', 'processed-results', 'datasets');

-- =====================================================
-- CREAR TIPOS ENUMERADOS
-- =====================================================

CREATE TYPE public.user_role AS ENUM ('admin', 'client');
CREATE TYPE public.file_status AS ENUM ('uploaded', 'processing', 'done', 'error');
CREATE TYPE public.insight_type AS ENUM ('cluster', 'anomaly', 'trend', 'summary', 'recommendation');

-- =====================================================
-- CREAR TABLAS PRINCIPALES
-- =====================================================

-- Tabla de perfiles de usuario
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    full_name TEXT,
    company_name TEXT,
    industry TEXT CHECK (industry IN (
        'agronegocio', 'varejo', 'automotriz', 'industria', 
        'ecommerce', 'turismo', 'technology', 'tecnologia', 'outros'
    )),
    role public.user_role DEFAULT 'client',
    accepted_terms BOOLEAN DEFAULT false,
    invitation_token TEXT,
    invited_by UUID,
    invited_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla de archivos
CREATE TABLE public.files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size BIGINT,
    storage_url TEXT NOT NULL,
    databricks_job_id TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    processed_at TIMESTAMP WITH TIME ZONE,
    status public.file_status DEFAULT 'uploaded',
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla de insights
CREATE TABLE public.insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID NOT NULL,
    insight_type public.insight_type NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    data JSONB DEFAULT '{}',
    confidence_score DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla de historial de chat
CREATE TABLE public.chat_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    file_id UUID,
    message TEXT NOT NULL,
    response TEXT,
    is_user_message BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla de logs de procesamiento
CREATE TABLE public.processing_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID NOT NULL,
    user_id UUID NOT NULL,
    operation TEXT NOT NULL,
    status TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    error_details TEXT
);

-- Tabla de notificaciones
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    related_file_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla de invitaciones pendientes
CREATE TABLE public.pending_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    company_name TEXT,
    industry TEXT,
    invitation_token TEXT NOT NULL UNIQUE,
    invited_by UUID NOT NULL,
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '7 days'),
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tablas adicionales para datos procesados
CREATE TABLE public.datasets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    file_type TEXT,
    file_url TEXT,
    metadata JSONB DEFAULT '{}',
    insights JSONB DEFAULT '{}',
    row_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    dataset_id UUID,
    customer_id TEXT NOT NULL,
    name TEXT,
    email TEXT,
    age INTEGER,
    gender TEXT,
    segment TEXT,
    total_spent DECIMAL(12,2) DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    last_purchase_date DATE,
    risk_level TEXT CHECK (risk_level IN ('baixo', 'medio', 'alto')) DEFAULT 'baixo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, dataset_id, customer_id)
);

CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    dataset_id UUID,
    customer_id UUID,
    transaction_id TEXT,
    amount DECIMAL(12,2) NOT NULL,
    product_name TEXT,
    product_category TEXT,
    quantity INTEGER DEFAULT 1,
    transaction_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- CREAR FOREIGN KEYS
-- =====================================================

ALTER TABLE public.files ADD CONSTRAINT fk_files_user_id 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.insights ADD CONSTRAINT fk_insights_file_id 
    FOREIGN KEY (file_id) REFERENCES public.files(id) ON DELETE CASCADE;

ALTER TABLE public.chat_history ADD CONSTRAINT fk_chat_history_user_id 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.chat_history ADD CONSTRAINT fk_chat_history_file_id 
    FOREIGN KEY (file_id) REFERENCES public.files(id) ON DELETE CASCADE;

ALTER TABLE public.processing_logs ADD CONSTRAINT fk_processing_logs_file_id 
    FOREIGN KEY (file_id) REFERENCES public.files(id) ON DELETE CASCADE;

ALTER TABLE public.notifications ADD CONSTRAINT fk_notifications_user_id 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.notifications ADD CONSTRAINT fk_notifications_file_id 
    FOREIGN KEY (related_file_id) REFERENCES public.files(id) ON DELETE SET NULL;

ALTER TABLE public.datasets ADD CONSTRAINT fk_datasets_user_id 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.customers ADD CONSTRAINT fk_customers_user_id 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.customers ADD CONSTRAINT fk_customers_dataset_id 
    FOREIGN KEY (dataset_id) REFERENCES public.datasets(id) ON DELETE CASCADE;

ALTER TABLE public.transactions ADD CONSTRAINT fk_transactions_user_id 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.transactions ADD CONSTRAINT fk_transactions_dataset_id 
    FOREIGN KEY (dataset_id) REFERENCES public.datasets(id) ON DELETE CASCADE;

ALTER TABLE public.transactions ADD CONSTRAINT fk_transactions_customer_id 
    FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;

-- =====================================================
-- HABILITAR ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processing_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CREAR FUNCIONES AUXILIARES
-- =====================================================

-- Función para actualizar timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Función para verificar si usuario es admin
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = user_uuid AND role = 'admin'
    );
END;
$$;

-- Función para generar token de invitación
CREATE OR REPLACE FUNCTION public.generate_invitation_token()
RETURNS TEXT 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    RETURN encode(gen_random_bytes(32), 'hex');
END;
$$;

-- Función para validar credenciales del usuario master
CREATE OR REPLACE FUNCTION public.validate_master_credentials(input_email TEXT, input_password TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Validar credenciales específicas del usuario master
    IF input_email = 'iamjorgear80@gmail.com' AND input_password = 'Jorge41304254#' THEN
        RETURN true;
    END IF;
    
    RETURN false;
END;
$$;

-- Función para crear invitaciones
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
    -- Verificar si el usuario actual es admin
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Apenas administradores podem convidar usuários';
    END IF;
    
    current_admin_id := auth.uid();
    invitation_token := public.generate_invitation_token();
    
    -- Verificar si ya existe convite pendente para este email
    IF EXISTS (SELECT 1 FROM public.pending_invitations WHERE email = invite_email AND used_at IS NULL) THEN
        RAISE EXCEPTION 'Já existe um convite pendente para este email';
    END IF;
    
    -- Crear convite
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

-- Función para validar invitación
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

-- Función para usar invitación
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
    -- Buscar el convite válido
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
    
    -- Crear/atualizar perfil do usuário
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

-- Función para dashboard de admin
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

-- Función para estadísticas de usuario
CREATE OR REPLACE FUNCTION public.get_user_stats(user_uuid UUID DEFAULT auth.uid())
RETURNS TABLE(
    total_files BIGINT,
    processed_files BIGINT,
    error_files BIGINT,
    pending_files BIGINT,
    total_insights BIGINT,
    unread_notifications BIGINT,
    chat_messages BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(f.id) as total_files,
        COUNT(CASE WHEN f.status = 'done' THEN 1 END) as processed_files,
        COUNT(CASE WHEN f.status = 'error' THEN 1 END) as error_files,
        COUNT(CASE WHEN f.status IN ('uploaded', 'processing') THEN 1 END) as pending_files,
        COUNT(i.id) as total_insights,
        COUNT(CASE WHEN n.is_read = false THEN 1 END) as unread_notifications,
        COUNT(ch.id) as chat_messages
    FROM public.files f
    LEFT JOIN public.insights i ON f.id = i.file_id
    LEFT JOIN public.notifications n ON f.user_id = n.user_id
    LEFT JOIN public.chat_history ch ON f.user_id = ch.user_id
    WHERE f.user_id = user_uuid;
END;
$$;

-- Función para limpiar datos de archivo
CREATE OR REPLACE FUNCTION public.cleanup_file_data(file_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Verificar que el usuario puede eliminar este archivo
    IF NOT EXISTS (
        SELECT 1 FROM public.files 
        WHERE id = file_uuid AND user_id = auth.uid()
    ) AND NOT public.is_admin() THEN
        RAISE EXCEPTION 'No tiene permisos para eliminar este archivo';
    END IF;
    
    -- Eliminar insights relacionados
    DELETE FROM public.insights WHERE file_id = file_uuid;
    
    -- Eliminar logs de procesamiento
    DELETE FROM public.processing_logs WHERE file_id = file_uuid;
    
    -- Eliminar historial de chat relacionado
    DELETE FROM public.chat_history WHERE file_id = file_uuid;
    
    -- Eliminar notificaciones relacionadas
    DELETE FROM public.notifications WHERE related_file_id = file_uuid;
    
    -- Finalmente eliminar el archivo
    DELETE FROM public.files WHERE id = file_uuid;
END;
$$;

-- =====================================================
-- CREAR POLÍTICAS RLS
-- =====================================================

-- Políticas para profiles
CREATE POLICY "Usuários podem ver seu próprio perfil"
    ON public.profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seu próprio perfil"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins podem gerenciar todos os perfis"
    ON public.profiles FOR ALL
    USING (public.is_admin());

-- Políticas para files
CREATE POLICY "Usuários podem ver seus próprios arquivos"
    ON public.files FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios arquivos"
    ON public.files FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios arquivos"
    ON public.files FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios arquivos"
    ON public.files FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Admins podem gerenciar todos os arquivos"
    ON public.files FOR ALL
    USING (public.is_admin());

-- Políticas para insights
CREATE POLICY "Usuários podem ver insights de seus arquivos"
    ON public.insights FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.files f 
            WHERE f.id = file_id AND f.user_id = auth.uid()
        )
    );

CREATE POLICY "Sistema pode inserir insights"
    ON public.insights FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admins podem gerenciar todos os insights"
    ON public.insights FOR ALL
    USING (public.is_admin());

-- Políticas para chat_history
CREATE POLICY "Usuários podem ver seu próprio histórico de chat"
    ON public.chat_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir em seu próprio histórico de chat"
    ON public.chat_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins podem gerenciar todo o histórico de chat"
    ON public.chat_history FOR ALL
    USING (public.is_admin());

-- Políticas para processing_logs
CREATE POLICY "Usuários podem ver seus próprios logs"
    ON public.processing_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Sistema pode inserir logs"
    ON public.processing_logs FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admins podem gerenciar todos os logs"
    ON public.processing_logs FOR ALL
    USING (public.is_admin());

-- Políticas para notifications
CREATE POLICY "Usuários podem ver suas próprias notificações"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Sistema pode inserir notificações"
    ON public.notifications FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Usuários podem atualizar suas próprias notificações"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Admins podem gerenciar todas as notificações"
    ON public.notifications FOR ALL
    USING (public.is_admin());

-- Políticas para pending_invitations
CREATE POLICY "Admins podem gerenciar convites"
    ON public.pending_invitations FOR ALL
    USING (public.is_admin());

CREATE POLICY "Usuários podem ver convite válido"
    ON public.pending_invitations FOR SELECT
    USING (
        invitation_token IS NOT NULL AND
        expires_at > now() AND
        used_at IS NULL
    );

-- Políticas para datasets, customers, transactions
CREATE POLICY "Usuários podem gerenciar seus próprios datasets"
    ON public.datasets FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem gerenciar seus próprios clientes"
    ON public.customers FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem gerenciar suas próprias transações"
    ON public.transactions FOR ALL
    USING (auth.uid() = user_id);

-- =====================================================
-- CRIAR TRIGGERS
-- =====================================================

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_files_updated_at
    BEFORE UPDATE ON public.files
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para notificações automáticas
CREATE OR REPLACE FUNCTION public.create_file_notification()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Crear notificación cuando el archivo cambia de estado
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO public.notifications (
            user_id,
            title,
            message,
            type,
            related_file_id
        ) VALUES (
            NEW.user_id,
            CASE 
                WHEN NEW.status = 'processing' THEN 'Arquivo em processamento'
                WHEN NEW.status = 'done' THEN 'Processamento completado'
                WHEN NEW.status = 'error' THEN 'Erro no processamento'
                ELSE 'Estado atualizado'
            END,
            CASE 
                WHEN NEW.status = 'processing' THEN 'Seu arquivo "' || NEW.file_name || '" está sendo processado pelo Databricks.'
                WHEN NEW.status = 'done' THEN 'Seu arquivo "' || NEW.file_name || '" foi processado com sucesso. Os insights estão disponíveis.'
                WHEN NEW.status = 'error' THEN 'Houve um erro processando "' || NEW.file_name || '". ' || COALESCE(NEW.error_message, 'Contate o administrador.')
                ELSE 'O estado do seu arquivo "' || NEW.file_name || '" foi atualizado.'
            END,
            CASE 
                WHEN NEW.status = 'done' THEN 'success'
                WHEN NEW.status = 'error' THEN 'error'
                ELSE 'info'
            END,
            NEW.id
        );
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER file_status_notification_trigger
    AFTER UPDATE ON public.files
    FOR EACH ROW
    EXECUTE FUNCTION public.create_file_notification();

-- =====================================================
-- CRIAR ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para profiles
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_email ON public.profiles(user_id); -- Para buscar por email via auth

-- Índices para files
CREATE INDEX idx_files_user_id ON public.files(user_id);
CREATE INDEX idx_files_status ON public.files(status);
CREATE INDEX idx_files_uploaded_at ON public.files(uploaded_at DESC);
CREATE INDEX idx_files_user_status ON public.files(user_id, status);

-- Índices para insights
CREATE INDEX idx_insights_file_id ON public.insights(file_id);
CREATE INDEX idx_insights_type ON public.insights(insight_type);
CREATE INDEX idx_insights_file_type ON public.insights(file_id, insight_type);

-- Índices para chat_history
CREATE INDEX idx_chat_history_user_id ON public.chat_history(user_id);
CREATE INDEX idx_chat_history_file_id ON public.chat_history(file_id);
CREATE INDEX idx_chat_history_user_file ON public.chat_history(user_id, file_id);
CREATE INDEX idx_chat_history_created_at ON public.chat_history(created_at DESC);

-- Índices para processing_logs
CREATE INDEX idx_processing_logs_file_id ON public.processing_logs(file_id);
CREATE INDEX idx_processing_logs_user_id ON public.processing_logs(user_id);
CREATE INDEX idx_processing_logs_file_status ON public.processing_logs(file_id, status);

-- Índices para notifications
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_notifications_user_read ON public.notifications(user_id, is_read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- Índices para pending_invitations
CREATE INDEX idx_pending_invitations_token ON public.pending_invitations(invitation_token);
CREATE INDEX idx_pending_invitations_email ON public.pending_invitations(email);
CREATE INDEX idx_pending_invitations_expires ON public.pending_invitations(expires_at);

-- Índices para datasets, customers, transactions
CREATE INDEX idx_datasets_user_id ON public.datasets(user_id);
CREATE INDEX idx_customers_user_id ON public.customers(user_id);
CREATE INDEX idx_customers_dataset_id ON public.customers(dataset_id);
CREATE INDEX idx_customers_customer_id ON public.customers(customer_id);
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_customer_id ON public.transactions(customer_id);
CREATE INDEX idx_transactions_dataset_id ON public.transactions(dataset_id);
CREATE INDEX idx_transactions_date ON public.transactions(transaction_date);

-- =====================================================
-- CONFIGURAR STORAGE
-- =====================================================

-- Crear buckets de storage
INSERT INTO storage.buckets (id, name, public) 
VALUES ('data-files', 'data-files', false);

INSERT INTO storage.buckets (id, name, public) 
VALUES ('processed-results', 'processed-results', false);

-- Políticas de storage para data-files
CREATE POLICY "Usuários podem ver seus próprios arquivos de dados"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'data-files' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Usuários podem fazer upload de seus próprios arquivos de dados"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'data-files' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Usuários podem atualizar seus próprios arquivos de dados"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'data-files' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Usuários podem deletar seus próprios arquivos de dados"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'data-files' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Admins podem gerenciar todos os arquivos de dados"
    ON storage.objects FOR ALL
    USING (
        bucket_id = 'data-files' AND 
        public.is_admin()
    );

-- Políticas de storage para processed-results
CREATE POLICY "Usuários podem ver seus próprios resultados processados"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'processed-results' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Sistema pode inserir resultados processados"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'processed-results');

CREATE POLICY "Admins podem gerenciar todos os resultados processados"
    ON storage.objects FOR ALL
    USING (
        bucket_id = 'processed-results' AND 
        public.is_admin()
    );

-- =====================================================
-- CONFIGURAR REALTIME
-- =====================================================

-- Habilitar realtime para las tablas principales
ALTER TABLE public.files REPLICA IDENTITY FULL;
ALTER TABLE public.insights REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.chat_history REPLICA IDENTITY FULL;
ALTER TABLE public.processing_logs REPLICA IDENTITY FULL;

-- Agregar las tablas al publication de realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.files;
ALTER PUBLICATION supabase_realtime ADD TABLE public.insights;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_history;
ALTER PUBLICATION supabase_realtime ADD TABLE public.processing_logs;

-- =====================================================
-- CREAR USUARIO MASTER ADMIN
-- =====================================================

-- Insertar el perfil del usuario master
-- Usaremos un UUID específico para el usuario master
INSERT INTO public.profiles (
    user_id,
    full_name,
    company_name,
    industry,
    role,
    accepted_terms,
    is_active
) VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid, -- UUID fijo para el master
    'Jorge Enrique Arrieta',
    'NORDATA.AI',
    'technology',
    'admin',
    true,
    true
) ON CONFLICT (user_id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    industry = EXCLUDED.industry,
    role = 'admin',
    is_active = true;

-- =====================================================
-- CONFIGURACIONES FINALES
-- =====================================================

-- Revocar acceso anónimo a tablas sensibles
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
GRANT SELECT ON public.pending_invitations TO anon; -- Solo para validar invitaciones

-- Crear notificación de bienvenida para usuarios nuevos
CREATE OR REPLACE FUNCTION public.create_welcome_notification()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Crear notificación de bienvenida para nuevos usuarios
    IF NEW.role = 'client' AND NEW.is_active = true AND OLD.is_active IS DISTINCT FROM NEW.is_active THEN
        INSERT INTO public.notifications (
            user_id,
            title,
            message,
            type
        ) VALUES (
            NEW.user_id,
            'Bem-vindo à NORDATA.AI',
            '¡Bem-vindo! Sua conta foi ativada. Você pode começar a fazer upload de arquivos para análise.',
            'success'
        );
    END IF;
    
    RETURN NEW;
END;
$$;

-- Trigger para notificações de bienvenida
CREATE TRIGGER welcome_notification_trigger
    AFTER INSERT OR UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.create_welcome_notification();

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE 'Base de dados NORDATA.AI configurada com sucesso!';
    RAISE NOTICE 'Usuario master criado: iamjorgear80@gmail.com';
    RAISE NOTICE 'Todas as tabelas, políticas RLS e funções foram criadas.';
END $$;