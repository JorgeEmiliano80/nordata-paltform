
-- Limpiar completamente la base de datos manteniendo solo el usuario admin
-- Primero, obtener el user_id del admin principal
DO $$
DECLARE
    admin_user_id uuid;
BEGIN
    -- Encontrar el usuario admin principal (basado en el email del master user)
    SELECT user_id INTO admin_user_id 
    FROM profiles 
    WHERE role = 'admin' 
    AND (full_name = 'Jorge Emiliano' OR user_id IN (
        SELECT id FROM auth.users WHERE email = 'iamjorgear80@gmail.com'
    ))
    LIMIT 1;
    
    -- Si encontramos el admin, proceder con la limpieza
    IF admin_user_id IS NOT NULL THEN
        -- Eliminar todos los registros excepto del admin
        
        -- Limpiar tablas relacionadas con archivos y procesamiento
        DELETE FROM insights WHERE file_id IN (
            SELECT id FROM files WHERE user_id != admin_user_id
        );
        DELETE FROM processing_logs WHERE user_id != admin_user_id;
        DELETE FROM chat_history WHERE user_id != admin_user_id;
        DELETE FROM notifications WHERE user_id != admin_user_id;
        DELETE FROM files WHERE user_id != admin_user_id;
        
        -- Limpiar datos de clientes y segmentación
        DELETE FROM customer_segments_advanced WHERE user_id != admin_user_id;
        DELETE FROM customers WHERE user_id != admin_user_id;
        DELETE FROM transactions WHERE user_id != admin_user_id;
        DELETE FROM datasets WHERE user_id != admin_user_id;
        DELETE FROM pipelines WHERE user_id != admin_user_id;
        
        -- Limpiar métricas y analytics
        DELETE FROM client_segments WHERE user_id != admin_user_id;
        DELETE FROM client_recommendations WHERE user_id != admin_user_id;
        DELETE FROM user_behavior_tracking WHERE user_id != admin_user_id;
        DELETE FROM financial_metrics WHERE user_id != admin_user_id;
        
        -- Limpiar todas las invitaciones pendientes
        DELETE FROM pending_invitations;
        
        -- Eliminar perfiles de usuarios que no sean admin
        DELETE FROM profiles WHERE user_id != admin_user_id;
        
        -- Limpiar métricas del sistema (opcional, mantener historial)
        -- DELETE FROM data_flow_metrics;
        -- DELETE FROM performance_analytics;
        
        RAISE NOTICE 'Base de datos limpiada exitosamente. Mantenido usuario admin: %', admin_user_id;
    ELSE
        RAISE NOTICE 'No se encontró usuario admin para preservar. Abortando limpieza por seguridad.';
    END IF;
END $$;

-- Reiniciar secuencias si es necesario
-- (En este caso usamos UUIDs, pero por si acaso)

-- Verificar el estado final
SELECT 
    'profiles' as tabla, 
    COUNT(*) as registros_restantes,
    COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins
FROM profiles
UNION ALL
SELECT 'pending_invitations', COUNT(*), 0 FROM pending_invitations
UNION ALL
SELECT 'files', COUNT(*), 0 FROM files
UNION ALL
SELECT 'customers', COUNT(*), 0 FROM customers
UNION ALL
SELECT 'chat_history', COUNT(*), 0 FROM chat_history;
