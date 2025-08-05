
# Backend - NORDATA.AI Platform

Este directorio contiene toda la lógica del backend de la plataforma NORDATA.AI.

## Estructura

### Supabase Edge Functions
- `functions/master-auth/` - Autenticación maestra del sistema
- `functions/admin-create-user/` - Creación de usuarios por administradores
- `functions/admin-get-users/` - Obtención de lista de usuarios
- `functions/admin-invite-user/` - Sistema de invitaciones
- `functions/process-file/` - Procesamiento de archivos con Databricks
- `functions/check-job-status/` - Monitoreo de trabajos de Databricks
- `functions/handle-databricks-callback/` - Callback de Databricks
- `functions/chatbot/` - Sistema de chatbot con IA
- `functions/setup-master-user/` - Setup inicial del usuario maestro

### Configuración
- `config.toml` - Configuración de Supabase
- `migrations/` - Migraciones de base de datos

### Base de Datos

#### Tablas Principales
- `profiles` - Perfiles de usuarios
- `files` - Archivos subidos
- `insights` - Insights generados por IA
- `chat_history` - Historial de conversaciones
- `processing_logs` - Logs de procesamiento
- `notifications` - Notificaciones del sistema
- `client_segments` - Segmentación de clientes
- `user_behavior_tracking` - Tracking de comportamiento

#### Funciones de BD
- `is_admin()` - Verificar permisos de admin
- `calculate_client_segmentation()` - Segmentación automática
- `generate_client_recommendations()` - Recomendaciones
- `cleanup_file_data()` - Limpieza de datos

## Tecnologías
- **Supabase**: Backend as a Service
- **PostgreSQL**: Base de datos
- **Edge Functions**: Deno runtime
- **Row Level Security**: Seguridad granular
