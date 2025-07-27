-- Criar enums para roles, status de arquivos e tipos de insights
CREATE TYPE public.user_role AS ENUM ('admin', 'client');
CREATE TYPE public.file_status AS ENUM ('uploaded', 'processing', 'done', 'error');
CREATE TYPE public.insight_type AS ENUM ('cluster', 'anomaly', 'trend', 'summary', 'recommendation');

-- Alterar tabela profiles para incluir novos campos necessários
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role public.user_role DEFAULT 'client';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS accepted_terms BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS invitation_token TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS invited_by UUID REFERENCES auth.users(id);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS invited_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Criar tabela de arquivos
CREATE TABLE public.files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- Criar tabela de insights
CREATE TABLE public.insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID NOT NULL REFERENCES public.files(id) ON DELETE CASCADE,
    insight_type public.insight_type NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    data JSONB DEFAULT '{}',
    confidence_score DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de histórico de chat
CREATE TABLE public.chat_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    file_id UUID REFERENCES public.files(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    response TEXT,
    is_user_message BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de logs de processamento
CREATE TABLE public.processing_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID NOT NULL REFERENCES public.files(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    operation TEXT NOT NULL,
    status TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    error_details TEXT
);

-- Criar tabela de notificações
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    related_file_id UUID REFERENCES public.files(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS em todas as novas tabelas
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processing_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para files
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

CREATE POLICY "Admins podem ver todos os arquivos" 
ON public.files FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- Criar políticas RLS para insights
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

CREATE POLICY "Admins podem ver todos os insights" 
ON public.insights FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- Criar políticas RLS para chat_history
CREATE POLICY "Usuários podem ver seu próprio histórico de chat" 
ON public.chat_history FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir em seu próprio histórico de chat" 
ON public.chat_history FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins podem ver todo o histórico de chat" 
ON public.chat_history FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- Criar políticas RLS para processing_logs
CREATE POLICY "Usuários podem ver seus próprios logs" 
ON public.processing_logs FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Sistema pode inserir logs" 
ON public.processing_logs FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins podem ver todos os logs" 
ON public.processing_logs FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- Criar políticas RLS para notifications
CREATE POLICY "Usuários podem ver suas próprias notificações" 
ON public.notifications FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Sistema pode inserir notificações" 
ON public.notifications FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Usuários podem atualizar suas próprias notificações" 
ON public.notifications FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins podem ver todas as notificações" 
ON public.notifications FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- Criar índices para melhor performance
CREATE INDEX idx_files_user_id ON public.files(user_id);
CREATE INDEX idx_files_status ON public.files(status);
CREATE INDEX idx_files_uploaded_at ON public.files(uploaded_at);
CREATE INDEX idx_insights_file_id ON public.insights(file_id);
CREATE INDEX idx_insights_type ON public.insights(insight_type);
CREATE INDEX idx_chat_history_user_id ON public.chat_history(user_id);
CREATE INDEX idx_chat_history_file_id ON public.chat_history(file_id);
CREATE INDEX idx_processing_logs_file_id ON public.processing_logs(file_id);
CREATE INDEX idx_processing_logs_user_id ON public.processing_logs(user_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_profiles_role ON public.profiles(role);

-- Criar triggers para updated_at
CREATE TRIGGER update_files_updated_at
    BEFORE UPDATE ON public.files
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Criar função para verificar se usuário é admin
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = user_uuid AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar função para gerar token de convite
CREATE OR REPLACE FUNCTION public.generate_invitation_token()
RETURNS TEXT AS $$
BEGIN
    RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Criar função para processar arquivo no Databricks
CREATE OR REPLACE FUNCTION public.trigger_databricks_processing(file_uuid UUID)
RETURNS VOID AS $$
BEGIN
    -- Esta função será chamada via edge function
    -- Aqui apenas registramos o log inicial
    INSERT INTO public.processing_logs (file_id, user_id, operation, status, details)
    SELECT 
        file_uuid,
        f.user_id,
        'databricks_trigger',
        'initiated',
        jsonb_build_object('timestamp', now())
    FROM public.files f
    WHERE f.id = file_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar buckets de storage
INSERT INTO storage.buckets (id, name, public) 
VALUES ('data-files', 'data-files', false);

INSERT INTO storage.buckets (id, name, public) 
VALUES ('processed-results', 'processed-results', false);

-- Criar políticas de storage para data-files
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

-- Criar políticas de storage para processed-results
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

-- Criar view para dashboard do admin
CREATE OR REPLACE VIEW public.admin_dashboard AS
SELECT 
    u.id as user_id,
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
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
LEFT JOIN public.files f ON u.id = f.user_id
LEFT JOIN public.chat_history ch ON u.id = ch.user_id
WHERE p.role = 'client'
GROUP BY u.id, p.full_name, p.company_name, p.role, p.created_at, p.is_active;