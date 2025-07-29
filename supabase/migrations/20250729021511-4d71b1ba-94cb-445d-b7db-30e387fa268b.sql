
-- Crear enums adicionales
CREATE TYPE client_segment AS ENUM ('vip', 'premium', 'regular', 'new', 'at_risk', 'inactive');
CREATE TYPE behavior_event_type AS ENUM ('login', 'file_upload', 'file_process', 'chat_message', 'dashboard_view', 'result_download', 'feature_use');
CREATE TYPE recommendation_priority AS ENUM ('high', 'medium', 'low');

-- Tabla de segmentación de clientes
CREATE TABLE client_segments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    segment client_segment NOT NULL,
    score DECIMAL(10,2) DEFAULT 0,
    revenue_contribution DECIMAL(10,2) DEFAULT 0,
    activity_level INTEGER DEFAULT 0,
    risk_level INTEGER DEFAULT 0,
    last_activity TIMESTAMP WITH TIME ZONE,
    segment_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    criteria JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id)
);

-- Tabla de comportamiento y tracking
CREATE TABLE user_behavior_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    event_type behavior_event_type NOT NULL,
    event_data JSONB DEFAULT '{}',
    session_id UUID,
    ip_address INET,
    user_agent TEXT,
    file_id UUID REFERENCES files(id) ON DELETE SET NULL,
    duration_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla de métricas financieras
CREATE TABLE financial_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    revenue DECIMAL(10,2) DEFAULT 0,
    costs DECIMAL(10,2) DEFAULT 0,
    profit DECIMAL(10,2) DEFAULT 0,
    mrr DECIMAL(10,2) DEFAULT 0,
    ltv DECIMAL(10,2) DEFAULT 0,
    cac DECIMAL(10,2) DEFAULT 0,
    processing_cost DECIMAL(10,2) DEFAULT 0,
    storage_cost DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, metric_date)
);

-- Tabla de recomendaciones
CREATE TABLE client_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    recommendation_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    priority recommendation_priority DEFAULT 'medium',
    action_items JSONB DEFAULT '[]',
    potential_impact TEXT,
    implementation_effort TEXT,
    is_implemented BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'
);

-- Tabla de análisis de rendimiento
CREATE TABLE performance_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name TEXT NOT NULL,
    metric_value DECIMAL(15,4) NOT NULL,
    metric_type TEXT NOT NULL, -- 'conversion', 'usage', 'performance', etc.
    dimension_filters JSONB DEFAULT '{}',
    time_period DATE NOT NULL,
    comparison_period DATE,
    trend_direction TEXT, -- 'up', 'down', 'stable'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla de flujo de datos en tiempo real
CREATE TABLE data_flow_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
    files_uploaded_count INTEGER DEFAULT 0,
    files_processing_count INTEGER DEFAULT 0,
    files_completed_count INTEGER DEFAULT 0,
    files_failed_count INTEGER DEFAULT 0,
    total_data_volume_mb DECIMAL(12,2) DEFAULT 0,
    active_users_count INTEGER DEFAULT 0,
    databricks_jobs_running INTEGER DEFAULT 0,
    avg_processing_time_minutes DECIMAL(8,2) DEFAULT 0,
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Habilitar RLS
ALTER TABLE client_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_behavior_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_flow_metrics ENABLE ROW LEVEL SECURITY;

-- Políticas RLS - Solo admins pueden ver datos analíticos
CREATE POLICY "Admins can view all client segments" ON client_segments FOR ALL USING (is_admin());
CREATE POLICY "Admins can view all behavior tracking" ON user_behavior_tracking FOR ALL USING (is_admin());
CREATE POLICY "Admins can view all financial metrics" ON financial_metrics FOR ALL USING (is_admin());
CREATE POLICY "Admins can view all recommendations" ON client_recommendations FOR ALL USING (is_admin());
CREATE POLICY "Admins can view all performance analytics" ON performance_analytics FOR ALL USING (is_admin());
CREATE POLICY "Admins can view all data flow metrics" ON data_flow_metrics FOR ALL USING (is_admin());

-- Política para que el sistema pueda insertar datos de tracking
CREATE POLICY "System can insert behavior tracking" ON user_behavior_tracking FOR INSERT WITH CHECK (true);
CREATE POLICY "System can insert financial metrics" ON financial_metrics FOR INSERT WITH CHECK (true);
CREATE POLICY "System can insert performance analytics" ON performance_analytics FOR INSERT WITH CHECK (true);
CREATE POLICY "System can insert data flow metrics" ON data_flow_metrics FOR INSERT WITH CHECK (true);

-- Función para calcular segmentación automática de clientes
CREATE OR REPLACE FUNCTION calculate_client_segmentation(target_user_id UUID DEFAULT NULL)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_record RECORD;
    total_files INTEGER;
    successful_files INTEGER;
    total_revenue DECIMAL(10,2);
    days_since_last_activity INTEGER;
    activity_score INTEGER;
    new_segment client_segment;
BEGIN
    -- Si no se especifica usuario, procesar todos los clientes
    FOR user_record IN 
        SELECT p.user_id, p.full_name, p.created_at
        FROM profiles p 
        WHERE p.role = 'client' 
        AND (target_user_id IS NULL OR p.user_id = target_user_id)
    LOOP
        -- Calcular métricas del usuario
        SELECT 
            COUNT(*) as total,
            COUNT(CASE WHEN status = 'done' THEN 1 END) as successful
        INTO total_files, successful_files
        FROM files 
        WHERE user_id = user_record.user_id;
        
        -- Calcular revenue total (simulado por ahora)
        SELECT COALESCE(SUM(revenue), 0)
        INTO total_revenue
        FROM financial_metrics 
        WHERE user_id = user_record.user_id;
        
        -- Calcular días desde última actividad
        SELECT COALESCE(
            EXTRACT(DAY FROM (now() - MAX(created_at))), 
            EXTRACT(DAY FROM (now() - user_record.created_at))
        )
        INTO days_since_last_activity
        FROM user_behavior_tracking 
        WHERE user_id = user_record.user_id;
        
        -- Calcular score de actividad
        activity_score := LEAST(100, 
            (total_files * 10) + 
            (successful_files * 5) + 
            GREATEST(0, 30 - days_since_last_activity)
        );
        
        -- Determinar segmento
        IF total_revenue > 1000 AND activity_score > 80 THEN
            new_segment := 'vip';
        ELSIF total_revenue > 500 AND activity_score > 60 THEN
            new_segment := 'premium';
        ELSIF days_since_last_activity > 30 THEN
            new_segment := 'at_risk';
        ELSIF days_since_last_activity > 60 THEN
            new_segment := 'inactive';
        ELSIF EXTRACT(DAY FROM (now() - user_record.created_at)) < 7 THEN
            new_segment := 'new';
        ELSE
            new_segment := 'regular';
        END IF;
        
        -- Insertar o actualizar segmentación
        INSERT INTO client_segments (
            user_id, 
            segment, 
            score, 
            revenue_contribution, 
            activity_level,
            last_activity,
            criteria
        ) VALUES (
            user_record.user_id,
            new_segment,
            activity_score,
            total_revenue,
            total_files,
            now() - INTERVAL '1 day' * days_since_last_activity,
            jsonb_build_object(
                'total_files', total_files,
                'successful_files', successful_files,
                'days_inactive', days_since_last_activity
            )
        )
        ON CONFLICT (user_id) DO UPDATE SET
            segment = EXCLUDED.segment,
            score = EXCLUDED.score,
            revenue_contribution = EXCLUDED.revenue_contribution,
            activity_level = EXCLUDED.activity_level,
            last_activity = EXCLUDED.last_activity,
            criteria = EXCLUDED.criteria,
            segment_updated_at = now(),
            updated_at = now();
    END LOOP;
END;
$$;

-- Función para generar métricas de flujo de datos en tiempo real
CREATE OR REPLACE FUNCTION generate_data_flow_metrics()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_hour TIMESTAMP WITH TIME ZONE;
    files_uploaded INTEGER;
    files_processing INTEGER;
    files_completed INTEGER;
    files_failed INTEGER;
    total_volume DECIMAL(12,2);
    active_users INTEGER;
    avg_processing DECIMAL(8,2);
BEGIN
    current_hour := date_trunc('hour', now());
    
    -- Contar archivos por estado en la última hora
    SELECT 
        COUNT(CASE WHEN status = 'uploaded' AND uploaded_at >= current_hour THEN 1 END),
        COUNT(CASE WHEN status = 'processing' THEN 1 END),
        COUNT(CASE WHEN status = 'done' AND processed_at >= current_hour THEN 1 END),
        COUNT(CASE WHEN status = 'error' AND updated_at >= current_hour THEN 1 END),
        COALESCE(SUM(file_size), 0) / (1024.0 * 1024.0) -- Convert to MB
    INTO files_uploaded, files_processing, files_completed, files_failed, total_volume
    FROM files
    WHERE created_at >= current_hour;
    
    -- Contar usuarios activos en la última hora
    SELECT COUNT(DISTINCT user_id)
    INTO active_users
    FROM user_behavior_tracking
    WHERE created_at >= current_hour;
    
    -- Calcular tiempo promedio de procesamiento
    SELECT AVG(EXTRACT(EPOCH FROM (processed_at - uploaded_at)) / 60.0)
    INTO avg_processing
    FROM files
    WHERE status = 'done' AND processed_at >= current_hour;
    
    -- Insertar métricas
    INSERT INTO data_flow_metrics (
        timestamp,
        files_uploaded_count,
        files_processing_count,
        files_completed_count,
        files_failed_count,
        total_data_volume_mb,
        active_users_count,
        avg_processing_time_minutes,
        period_start,
        period_end
    ) VALUES (
        now(),
        files_uploaded,
        files_processing,
        files_completed,
        files_failed,
        total_volume,
        active_users,
        COALESCE(avg_processing, 0),
        current_hour,
        current_hour + INTERVAL '1 hour'
    );
END;
$$;

-- Función para generar recomendaciones automáticas
CREATE OR REPLACE FUNCTION generate_client_recommendations()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    client_record RECORD;
    days_inactive INTEGER;
    file_success_rate DECIMAL(5,2);
    total_files INTEGER;
BEGIN
    -- Limpiar recomendaciones expiradas
    DELETE FROM client_recommendations WHERE expires_at < now();
    
    FOR client_record IN 
        SELECT cs.user_id, cs.segment, cs.activity_level, p.full_name
        FROM client_segments cs
        JOIN profiles p ON cs.user_id = p.user_id
        WHERE p.role = 'client'
    LOOP
        -- Calcular días de inactividad
        SELECT COALESCE(
            EXTRACT(DAY FROM (now() - MAX(created_at))), 
            30
        )
        INTO days_inactive
        FROM user_behavior_tracking 
        WHERE user_id = client_record.user_id;
        
        -- Calcular tasa de éxito
        SELECT 
            COUNT(*),
            CASE 
                WHEN COUNT(*) > 0 THEN 
                    (COUNT(CASE WHEN status = 'done' THEN 1 END)::DECIMAL / COUNT(*)) * 100
                ELSE 0 
            END
        INTO total_files, file_success_rate
        FROM files 
        WHERE user_id = client_record.user_id;
        
        -- Generar recomendaciones según el segmento y comportamiento
        
        -- Recomendación para usuarios inactivos
        IF days_inactive > 14 AND NOT EXISTS (
            SELECT 1 FROM client_recommendations 
            WHERE user_id = client_record.user_id 
            AND recommendation_type = 'reactivation'
            AND created_at > now() - INTERVAL '30 days'
        ) THEN
            INSERT INTO client_recommendations (
                user_id,
                recommendation_type,
                title,
                description,
                priority,
                action_items,
                potential_impact,
                implementation_effort,
                expires_at
            ) VALUES (
                client_record.user_id,
                'reactivation',
                'Cliente Inactivo - Campaña de Reactivación',
                'Cliente sin actividad por ' || days_inactive || ' días. Implementar campaña de reengagement.',
                'high',
                '["Enviar email personalizado", "Ofrecer sesión de onboarding", "Proporcionar casos de uso específicos"]',
                'Recuperar cliente y aumentar engagement',
                'medium',
                now() + INTERVAL '30 days'
            );
        END IF;
        
        -- Recomendación para mejorar tasa de éxito
        IF file_success_rate < 70 AND total_files > 2 THEN
            INSERT INTO client_recommendations (
                user_id,
                recommendation_type,
                title,
                description,
                priority,
                action_items,
                potential_impact,
                implementation_effort,
                expires_at
            ) VALUES (
                client_record.user_id,
                'success_improvement',
                'Mejorar Tasa de Éxito en Procesamiento',
                'Tasa de éxito del ' || ROUND(file_success_rate, 1) || '%. Necesita soporte técnico.',
                'medium',
                '["Revisar formatos de archivo", "Capacitación en preparación de datos", "Soporte técnico dedicado"]',
                'Aumentar satisfacción y resultados exitosos',
                'low',
                now() + INTERVAL '20 days'
            )
            ON CONFLICT DO NOTHING;
        END IF;
        
        -- Oportunidad de upgrade para clientes regulares activos
        IF client_record.segment = 'regular' AND client_record.activity_level > 5 THEN
            INSERT INTO client_recommendations (
                user_id,
                recommendation_type,
                title,
                description,
                priority,
                action_items,
                potential_impact,
                implementation_effort,
                expires_at
            ) VALUES (
                client_record.user_id,
                'upsell_opportunity',
                'Oportunidad de Upgrade',
                'Cliente activo con potencial para plan premium.',
                'medium',
                '["Presentar funcionalidades premium", "Ofrecer trial extendido", "Análisis de ROI personalizado"]',
                'Incrementar revenue por cliente',
                'medium',
                now() + INTERVAL '45 days'
            )
            ON CONFLICT DO NOTHING;
        END IF;
        
    END LOOP;
END;
$$;

-- Triggers para updated_at
CREATE TRIGGER update_client_segments_updated_at BEFORE UPDATE ON client_segments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_financial_metrics_updated_at BEFORE UPDATE ON financial_metrics FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
