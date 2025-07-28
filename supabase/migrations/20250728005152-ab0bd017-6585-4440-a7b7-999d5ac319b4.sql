-- Corregir el constraint de industry y crear el usuario master
-- Primero eliminar el constraint existente
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_industry_check;

-- Crear nuevo constraint con más opciones incluyendo Technology
ALTER TABLE public.profiles ADD CONSTRAINT profiles_industry_check 
CHECK (industry = ANY (ARRAY[
    'agronegocio'::text, 
    'varejo'::text, 
    'automotriz'::text, 
    'industria'::text, 
    'ecommerce'::text, 
    'turismo'::text, 
    'technology'::text,
    'tecnologia'::text,
    'outros'::text
]));

-- Ahora insertar el perfil del usuario master
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

-- Función para validar credenciales del usuario master
CREATE OR REPLACE FUNCTION public.validate_master_credentials(input_email text, input_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    -- Validar credenciales específicas del usuario master
    IF input_email = 'iamjorgear80@gmail.com' AND input_password = 'Jorge41304254#' THEN
        RETURN true;
    END IF;
    
    RETURN false;
END;
$function$;

-- Función para gestión de usuarios por el admin
CREATE OR REPLACE FUNCTION public.admin_manage_user(
    action_type text,
    target_user_id uuid DEFAULT NULL,
    new_email text DEFAULT NULL,
    new_password text DEFAULT NULL,
    new_full_name text DEFAULT NULL,
    new_company text DEFAULT NULL,
    new_industry text DEFAULT NULL,
    new_role user_role DEFAULT 'client'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    result_data json;
    user_exists boolean;
BEGIN
    -- Verificar que el usuario actual es admin
    IF NOT public.is_admin() THEN
        RETURN json_build_object('success', false, 'error', 'Acceso denegado: solo administradores');
    END IF;
    
    CASE action_type
        WHEN 'update_profile' THEN
            -- Actualizar perfil de usuario
            IF target_user_id IS NULL THEN
                RETURN json_build_object('success', false, 'error', 'ID de usuario requerido');
            END IF;
            
            UPDATE public.profiles SET
                full_name = COALESCE(new_full_name, full_name),
                company_name = COALESCE(new_company, company_name),
                industry = COALESCE(new_industry, industry),
                role = COALESCE(new_role, role),
                updated_at = now()
            WHERE user_id = target_user_id;
            
            result_data := json_build_object('success', true, 'message', 'Perfil actualizado');
            
        WHEN 'deactivate_user' THEN
            -- Desactivar usuario
            IF target_user_id IS NULL THEN
                RETURN json_build_object('success', false, 'error', 'ID de usuario requerido');
            END IF;
            
            UPDATE public.profiles SET
                is_active = false,
                updated_at = now()
            WHERE user_id = target_user_id;
            
            result_data := json_build_object('success', true, 'message', 'Usuario desactivado');
            
        WHEN 'activate_user' THEN
            -- Activar usuario
            IF target_user_id IS NULL THEN
                RETURN json_build_object('success', false, 'error', 'ID de usuario requerido');
            END IF;
            
            UPDATE public.profiles SET
                is_active = true,
                updated_at = now()
            WHERE user_id = target_user_id;
            
            result_data := json_build_object('success', true, 'message', 'Usuario activado');
            
        ELSE
            result_data := json_build_object('success', false, 'error', 'Acción no válida');
    END CASE;
    
    RETURN result_data;
END;
$function$;

-- Crear notificación de bienvenida para usuarios nuevos
CREATE OR REPLACE FUNCTION public.create_welcome_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    -- Crear notificación de bienvenida para nuevos usuarios
    IF NEW.role = 'client' AND NEW.is_active = true THEN
        INSERT INTO public.notifications (
            user_id,
            title,
            message,
            type
        ) VALUES (
            NEW.user_id,
            'Bienvenido a NORDATA.AI',
            '¡Bienvenido! Tu cuenta ha sido activada. Puedes comenzar a subir archivos para análisis.',
            'success'
        );
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Crear trigger para notificaciones de bienvenida
DROP TRIGGER IF EXISTS welcome_notification_trigger ON public.profiles;
CREATE TRIGGER welcome_notification_trigger
    AFTER INSERT OR UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.create_welcome_notification();