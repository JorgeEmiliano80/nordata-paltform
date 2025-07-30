
-- Agregar campos de segmentación demográfica y comercial a la tabla customers
ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS age_group TEXT,
ADD COLUMN IF NOT EXISTS registration_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS customer_type TEXT DEFAULT 'regular';

-- Crear tabla para segmentación avanzada de clientes
CREATE TABLE IF NOT EXISTS public.customer_segments_advanced (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  customer_id UUID NOT NULL REFERENCES public.customers(id),
  age_segment TEXT, -- 'young', 'adult', 'senior'
  location_segment TEXT, -- region/city grouping
  industry_segment TEXT, -- business sector
  value_segment TEXT, -- 'high_value', 'medium_value', 'low_value'
  activity_segment TEXT, -- 'active', 'moderate', 'inactive'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS en la nueva tabla
ALTER TABLE public.customer_segments_advanced ENABLE ROW LEVEL SECURITY;

-- Política para que usuarios vean solo sus segmentaciones
CREATE POLICY "Users can view their own customer segments" 
  ON public.customer_segments_advanced 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own customer segments" 
  ON public.customer_segments_advanced 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own customer segments" 
  ON public.customer_segments_advanced 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own customer segments" 
  ON public.customer_segments_advanced 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Función para calcular segmentación avanzada
CREATE OR REPLACE FUNCTION public.calculate_advanced_customer_segmentation(target_user_id uuid DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    customer_record RECORD;
    age_seg TEXT;
    location_seg TEXT;
    industry_seg TEXT;
    value_seg TEXT;
    activity_seg TEXT;
BEGIN
    FOR customer_record IN 
        SELECT c.*, u.user_id
        FROM customers c
        JOIN profiles u ON c.user_id = u.user_id
        WHERE (target_user_id IS NULL OR c.user_id = target_user_id)
    LOOP
        -- Segmentación por edad
        IF customer_record.age IS NOT NULL THEN
            IF customer_record.age < 30 THEN
                age_seg := 'young';
            ELSIF customer_record.age < 50 THEN
                age_seg := 'adult';
            ELSE
                age_seg := 'senior';
            END IF;
        ELSE
            age_seg := 'unknown';
        END IF;
        
        -- Segmentación por ubicación (agrupar por región)
        location_seg := COALESCE(customer_record.location, 'unknown');
        
        -- Segmentación por industria
        industry_seg := COALESCE(customer_record.industry, 'unknown');
        
        -- Segmentación por valor (basado en gasto total)
        IF customer_record.total_spent > 1000 THEN
            value_seg := 'high_value';
        ELSIF customer_record.total_spent > 300 THEN
            value_seg := 'medium_value';
        ELSE
            value_seg := 'low_value';
        END IF;
        
        -- Segmentación por actividad (basado en número de órdenes)
        IF customer_record.total_orders > 10 THEN
            activity_seg := 'active';
        ELSIF customer_record.total_orders > 3 THEN
            activity_seg := 'moderate';
        ELSE
            activity_seg := 'inactive';
        END IF;
        
        -- Insertar o actualizar segmentación
        INSERT INTO customer_segments_advanced (
            user_id,
            customer_id,
            age_segment,
            location_segment,
            industry_segment,
            value_segment,
            activity_segment
        ) VALUES (
            customer_record.user_id,
            customer_record.id,
            age_seg,
            location_seg,
            industry_seg,
            value_seg,
            activity_seg
        )
        ON CONFLICT (customer_id) DO UPDATE SET
            age_segment = EXCLUDED.age_segment,
            location_segment = EXCLUDED.location_segment,
            industry_segment = EXCLUDED.industry_segment,
            value_segment = EXCLUDED.value_segment,
            activity_segment = EXCLUDED.activity_segment,
            updated_at = now();
            
    END LOOP;
END;
$$;
