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

-- Función para crear notificaciones automáticas
CREATE OR REPLACE FUNCTION public.create_file_notification()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para notificaciones automáticas
DROP TRIGGER IF EXISTS file_status_notification_trigger ON public.files;
CREATE TRIGGER file_status_notification_trigger
    AFTER UPDATE ON public.files
    FOR EACH ROW
    EXECUTE FUNCTION public.create_file_notification();

-- Función para limpiar archivos y datos relacionados
CREATE OR REPLACE FUNCTION public.cleanup_file_data(file_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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

-- Función para obtener estadísticas del usuario
CREATE OR REPLACE FUNCTION public.get_user_stats(user_uuid uuid DEFAULT auth.uid())
RETURNS TABLE(
    total_files bigint,
    processed_files bigint,
    error_files bigint,
    pending_files bigint,
    total_insights bigint,
    unread_notifications bigint,
    chat_messages bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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

-- Índices adicionales para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_files_user_status ON public.files(user_id, status);
CREATE INDEX IF NOT EXISTS idx_files_created_at ON public.files(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_insights_file_type ON public.insights(file_id, insight_type);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_chat_history_user_file ON public.chat_history(user_id, file_id);
CREATE INDEX IF NOT EXISTS idx_processing_logs_file_status ON public.processing_logs(file_id, status);

-- Configuración de seguridad adicional
-- Asegurar que solo usuarios autenticados puedan acceder
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
GRANT SELECT ON public.pending_invitations TO anon; -- Solo para validar invitaciones