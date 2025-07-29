
-- Crear enum para roles de usuario
CREATE TYPE user_role AS ENUM ('admin', 'client');

-- Crear enum para estado de archivos
CREATE TYPE file_status AS ENUM ('uploaded', 'processing', 'done', 'error');

-- Crear enum para tipos de insight
CREATE TYPE insight_type AS ENUM ('cluster', 'anomaly', 'trend', 'summary', 'recommendation');

-- Tabla de perfiles de usuario
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    company_name TEXT,
    industry TEXT,
    role user_role NOT NULL DEFAULT 'client',
    accepted_terms BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    invitation_token TEXT,
    invited_by UUID REFERENCES auth.users(id),
    invited_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla de invitaciones pendientes
CREATE TABLE pending_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    company_name TEXT,
    industry TEXT,
    invitation_token TEXT NOT NULL UNIQUE,
    invited_by UUID REFERENCES auth.users(id) NOT NULL,
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '7 days'),
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla de archivos
CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size BIGINT,
    storage_url TEXT NOT NULL,
    databricks_job_id TEXT,
    status file_status DEFAULT 'uploaded',
    error_message TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    processed_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla de insights
CREATE TABLE insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID REFERENCES files(id) ON DELETE CASCADE NOT NULL,
    insight_type insight_type NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    data JSONB DEFAULT '{}',
    confidence_score DECIMAL(5,4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla de historial de chat
CREATE TABLE chat_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    file_id UUID REFERENCES files(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    response TEXT,
    is_user_message BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla de logs de procesamiento
CREATE TABLE processing_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID REFERENCES files(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    operation TEXT NOT NULL,
    status TEXT NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    error_details TEXT,
    details JSONB DEFAULT '{}'
);

-- Tabla de notificaciones
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    related_file_id UUID REFERENCES files(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);

-- Políticas RLS para pending_invitations
CREATE POLICY "Admins podem gerenciar convites" ON pending_invitations FOR ALL USING (is_admin());
CREATE POLICY "Usuários podem ver convite válido" ON pending_invitations FOR SELECT USING (invitation_token IS NOT NULL AND expires_at > now() AND used_at IS NULL);

-- Políticas RLS para files
CREATE POLICY "Usuários podem ver seus próprios arquivos" ON files FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem inserir seus próprios arquivos" ON files FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários podem atualizar seus próprios arquivos" ON files FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem deletar seus próprios arquivos" ON files FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins podem ver todos os arquivos" ON files FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

-- Políticas RLS para insights
CREATE POLICY "Usuários podem ver insights de seus arquivos" ON insights FOR SELECT USING (EXISTS (SELECT 1 FROM files f WHERE f.id = insights.file_id AND f.user_id = auth.uid()));
CREATE POLICY "Sistema pode inserir insights" ON insights FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins podem ver todos os insights" ON insights FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

-- Políticas RLS para chat_history
CREATE POLICY "Usuários podem ver seu próprio histórico de chat" ON chat_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem inserir em seu próprio histórico de chat" ON chat_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins podem ver todo o histórico de chat" ON chat_history FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

-- Políticas RLS para processing_logs
CREATE POLICY "Usuários podem ver seus próprios logs" ON processing_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Sistema pode inserir logs" ON processing_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins podem ver todos os logs" ON processing_logs FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

-- Políticas RLS para notifications
CREATE POLICY "Usuários podem ver suas próprias notificações" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem atualizar suas próprias notificações" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Sistema pode inserir notificações" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins podem ver todas as notificações" ON notifications FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

-- Función para verificar si un usuario es admin
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE user_id = user_uuid AND role = 'admin'
    );
END;
$$;

-- Función para generar tokens de invitación
CREATE OR REPLACE FUNCTION generate_invitation_token()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    RETURN encode(gen_random_bytes(32), 'hex');
END;
$$;

-- Función para crear invitación
CREATE OR REPLACE FUNCTION create_invitation(
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
    IF NOT is_admin() THEN
        RAISE EXCEPTION 'Apenas administradores podem convidar usuários';
    END IF;
    
    current_admin_id := auth.uid();
    invitation_token := generate_invitation_token();
    
    -- Verificar si ya existe convite pendiente para este email
    IF EXISTS (SELECT 1 FROM pending_invitations WHERE email = invite_email AND used_at IS NULL) THEN
        RAISE EXCEPTION 'Já existe um convite pendente para este email';
    END IF;
    
    -- Crear convite
    INSERT INTO pending_invitations (
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

-- Función para usar invitación
CREATE OR REPLACE FUNCTION use_invitation(user_uuid UUID, token TEXT)
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
    FROM pending_invitations
    WHERE invitation_token = token 
    AND expires_at > now() 
    AND used_at IS NULL;
    
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Marcar convite como usado
    UPDATE pending_invitations 
    SET used_at = now()
    WHERE id = invitation_record.id;
    
    -- Crear/atualizar perfil del usuario
    INSERT INTO profiles (
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

-- Función para obtener datos del panel admin
CREATE OR REPLACE FUNCTION get_admin_dashboard()
RETURNS TABLE(
    user_id UUID,
    full_name TEXT,
    company_name TEXT,
    role user_role,
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
    -- Verificar si el usuario actual es admin
    IF NOT is_admin() THEN
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
    FROM profiles p
    LEFT JOIN files f ON p.user_id = f.user_id
    LEFT JOIN chat_history ch ON p.user_id = ch.user_id
    WHERE p.role = 'client'
    GROUP BY p.user_id, p.full_name, p.company_name, p.role, p.created_at, p.is_active;
END;
$$;

-- Función para limpiar datos de archivo
CREATE OR REPLACE FUNCTION cleanup_file_data(file_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Verificar que el usuario puede eliminar este archivo
    IF NOT EXISTS (
        SELECT 1 FROM files 
        WHERE id = file_uuid AND user_id = auth.uid()
    ) AND NOT is_admin() THEN
        RAISE EXCEPTION 'No tiene permisos para eliminar este archivo';
    END IF;
    
    -- Eliminar insights relacionados
    DELETE FROM insights WHERE file_id = file_uuid;
    
    -- Eliminar logs de procesamiento
    DELETE FROM processing_logs WHERE file_id = file_uuid;
    
    -- Eliminar historial de chat relacionado
    DELETE FROM chat_history WHERE file_id = file_uuid;
    
    -- Eliminar notificaciones relacionadas
    DELETE FROM notifications WHERE related_file_id = file_uuid;
    
    -- Finalmente eliminar el archivo
    DELETE FROM files WHERE id = file_uuid;
END;
$$;

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Aplicar trigger a tablas que necesiten updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_files_updated_at BEFORE UPDATE ON files FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Trigger para crear notificaciones cuando cambia el estado del archivo
CREATE OR REPLACE FUNCTION create_file_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Crear notificación cuando el archivo cambia de estado
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO notifications (
            user_id,
            title,
            message,
            type,
            related_file_id
        ) VALUES (
            NEW.user_id,
            CASE 
                WHEN NEW.status = 'processing' THEN 'Archivo en procesamiento'
                WHEN NEW.status = 'done' THEN 'Procesamiento completado'
                WHEN NEW.status = 'error' THEN 'Error en procesamiento'
                ELSE 'Estado actualizado'
            END,
            CASE 
                WHEN NEW.status = 'processing' THEN 'Su archivo "' || NEW.file_name || '" está siendo procesado por Databricks.'
                WHEN NEW.status = 'done' THEN 'Su archivo "' || NEW.file_name || '" ha sido procesado exitosamente. Los insights están disponibles.'
                WHEN NEW.status = 'error' THEN 'Hubo un error procesando "' || NEW.file_name || '". ' || COALESCE(NEW.error_message, 'Contacte al administrador.')
                ELSE 'El estado de su archivo "' || NEW.file_name || '" ha sido actualizado.'
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

CREATE TRIGGER file_status_notification AFTER UPDATE ON files FOR EACH ROW EXECUTE PROCEDURE create_file_notification();
