
-- Primero, verificar y actualizar la restricción de industry
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_industry_check;

-- Recrear la restricción con los valores correctos
ALTER TABLE public.profiles ADD CONSTRAINT profiles_industry_check 
CHECK (industry IN ('tecnologia', 'salud', 'finanzas', 'educacion', 'comercio', 'manufactura', 'servicios', 'otros'));

-- Asegurar que la columna industry permita NULL
ALTER TABLE public.profiles ALTER COLUMN industry DROP NOT NULL;

-- Verificar que la tabla profiles tenga la estructura correcta
ALTER TABLE public.profiles ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN full_name DROP NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN company_name DROP NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'client'::user_role;
ALTER TABLE public.profiles ALTER COLUMN accepted_terms SET DEFAULT false;
ALTER TABLE public.profiles ALTER COLUMN is_active SET DEFAULT true;

-- Limpiar cualquier dato inconsistente que pueda existir
DELETE FROM public.profiles WHERE role = 'admin' AND full_name = 'Jorge Enrique Arrieta';

-- Verificar que el enum user_role existe y tiene los valores correctos
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM ('admin', 'client');
    END IF;
END $$;
