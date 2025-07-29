
# NordataPlatform - Documentación Técnica

## Índice

1. [Arquitectura General](#arquitectura-general)
2. [Autenticación y Roles](#autenticación-y-roles)
3. [Gestión de Archivos](#gestión-de-archivos)
4. [Procesamiento con Databricks](#procesamiento-con-databricks)
5. [Sistema de Chat](#sistema-de-chat)
6. [Panel de Administración](#panel-de-administración)
7. [Base de Datos](#base-de-datos)
8. [API y Endpoints](#api-y-endpoints)
9. [Cumplimiento Legal](#cumplimiento-legal)
10. [Instalación y Configuración](#instalación-y-configuración)

## Arquitectura General

### Stack Tecnológico

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Autenticación**: Supabase Auth
- **Base de Datos**: PostgreSQL con Row Level Security (RLS)
- **Storage**: Supabase Storage
- **UI**: Tailwind CSS + Radix UI + Shadcn/ui
- **Procesamiento**: Databricks (integración externa)

### Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── ui/             # Componentes de UI base
│   ├── FileUpload.tsx  # Componente de subida de archivos
│   ├── FilesList.tsx   # Lista de archivos del usuario
│   ├── Navbar.tsx      # Navegación principal
│   ├── ProtectedRoute.tsx # Rutas protegidas
│   └── AdminRoute.tsx  # Rutas solo para admin
├── context/            # Contextos de React
│   └── AuthContext.tsx # Contexto de autenticación
├── hooks/              # Hooks personalizados
│   ├── useAuth.ts      # Hook de autenticación
│   ├── useFiles.ts     # Hook para gestión de archivos
│   ├── useAdmin.ts     # Hook para funciones admin
│   ├── useChatbot.ts   # Hook para chatbot
│   └── useNotifications.ts # Hook para notificaciones
├── pages/              # Páginas principales
│   ├── Login.tsx       # Página de login
│   ├── Dashboard.tsx   # Dashboard principal
│   ├── Upload.tsx      # Página de subida de archivos
│   ├── Chatbot.tsx     # Interfaz del chatbot
│   ├── AdminPanel.tsx  # Panel de administración
│   └── PrivacyPolicy.tsx # Política de privacidad
└── integrations/       # Integraciones externas
    └── supabase/       # Configuración de Supabase
```

## Autenticación y Roles

### Sistema de Roles

El sistema implementa dos roles principales:

1. **Admin**: Puede crear usuarios, gestionar la plataforma y acceder a todos los datos
2. **Client**: Puede subir archivos, usar el chatbot y acceder solo a sus propios datos

### Flujo de Autenticación

1. **Registro**: Solo por invitación del administrador
2. **Login**: Email y contraseña
3. **Verificación**: Automática con RLS en base de datos
4. **Sesión**: Mantenida por Supabase Auth

### Hooks de Autenticación

```typescript
// src/hooks/useAuth.ts
const { user, profile, loading, signIn, signOut, isAdmin } = useAuth();
```

**Funcionalidades del Hook:**

- `signIn(email, password)`: Autentica usuario
- `signOut()`: Cierra sesión
- `isAdmin()`: Verifica si el usuario es administrador
- `fetchUserProfile()`: Obtiene perfil del usuario

## Gestión de Archivos

### Tipos de Archivo Soportados

- **CSV**: Comma Separated Values
- **JSON**: JavaScript Object Notation
- **XLSX**: Excel (OpenXML)

### Flujo de Subida

1. **Validación**: Tipo y tamaño de archivo
2. **Upload**: Supabase Storage bucket `data-files`
3. **Registro**: Información en tabla `files`
4. **Estados**: `uploaded` → `processing` → `done`/`error`

### Hook de Archivos

```typescript
// src/hooks/useFiles.ts
const { 
  files, 
  uploadFile, 
  processFile, 
  deleteFile, 
  getFileInsights 
} = useFiles();
```

**Funcionalidades:**

- `uploadFile(file)`: Sube archivo a storage y registra en DB
- `processFile(fileId)`: Envía archivo a procesamiento
- `deleteFile(fileId)`: Elimina archivo y datos relacionados
- `getFileInsights(fileId)`: Obtiene insights del archivo

### Componentes de Archivos

#### FileUpload.tsx

```typescript
interface FileUploadProps {
  onUploadComplete?: (fileId: string) => void;
  acceptedFileTypes?: string[];
  maxFileSize?: number;
  className?: string;
}
```

**Características:**

- Drag & drop funcional
- Validación de tipos y tamaños
- Barra de progreso
- Mensajes de error y éxito
- Integración completa con backend

#### FilesList.tsx

**Funcionalidades:**

- Lista archivos del usuario
- Botón "Procesar" para archivos subidos
- Botón "Ver Resultados" para archivos procesados
- Botón "Eliminar" con confirmación
- Estados visuales claros

## Procesamiento con Databricks

### Integración

El procesamiento se realiza mediante Edge Functions que se conectan con Databricks:

#### Edge Function: process-file

```typescript
// supabase/functions/process-file/index.ts
```

**Flujo:**

1. **Validación**: Autenticación y permisos
2. **Registro**: Log de inicio de procesamiento
3. **Databricks**: Envío de archivo (simulado)
4. **Asíncrono**: Procesamiento en segundo plano
5. **Callback**: Actualización de estado y generación de insights

### Estados de Procesamiento

- `uploaded`: Archivo subido, listo para procesar
- `processing`: Enviado a Databricks
- `done`: Procesamiento completado con insights
- `error`: Error en el procesamiento

### Insights Generados

Los insights se guardan en la tabla `insights` con tipos:

- `summary`: Resumen estadístico
- `trend`: Tendencias detectadas
- `anomaly`: Anomalías encontradas
- `cluster`: Agrupaciones de datos
- `recommendation`: Recomendaciones

## Sistema de Chat

### Arquitectura del Chatbot

El chatbot utiliza:

- **Frontend**: Interfaz de chat en tiempo real
- **Backend**: Edge Function para procesamiento
- **Contexto**: Archivos y conversaciones previas
- **Persistencia**: Historial completo en base de datos

### Hook de Chatbot

```typescript
// src/hooks/useChatbot.ts
const { 
  messages, 
  sendMessage, 
  fetchChatHistory, 
  clearHistory 
} = useChatbot();
```

**Funcionalidades:**

- `sendMessage(message, fileId?)`: Envía mensaje y obtiene respuesta
- `fetchChatHistory(fileId?)`: Carga historial de conversación
- `clearHistory(fileId?)`: Limpia historial

### Edge Function: chatbot

```typescript
// supabase/functions/chatbot/index.ts
```

**Características:**

- Procesamiento de lenguaje natural
- Contexto de archivos específicos
- Historial de conversación
- Respuestas inteligentes basadas en datos

### Componente Chatbot

#### Interfaz de Chat

- **Mensajes**: Diferenciados por usuario/bot
- **Timestamp**: Hora de cada mensaje
- **Contexto**: Selección de archivo específico
- **Acciones**: Botones de acción rápida
- **Historial**: Persistente entre sesiones

## Panel de Administración

### Funcionalidades del Admin

#### Gestión de Usuarios

- **Crear Invitaciones**: Sistema de invitación por email
- **Activar/Desactivar**: Control de acceso de usuarios
- **Actualizar Perfiles**: Modificar información de usuarios
- **Estadísticas**: Métricas de uso por usuario

#### Hook de Administración

```typescript
// src/hooks/useAdmin.ts
const { 
  fetchAdminData, 
  createInvitation, 
  manageUser 
} = useAdmin();
```

**Funcionalidades:**

- `fetchAdminData()`: Obtiene datos del dashboard
- `createInvitation(email, name, company, industry)`: Crea invitación
- `manageUser(action, userId, data)`: Gestiona usuarios

### Sistema de Invitaciones

#### Flujo de Invitación

1. **Creación**: Admin crea invitación
2. **Token**: Se genera token único
3. **Envío**: URL de invitación (manual/email)
4. **Registro**: Usuario se registra con token
5. **Activación**: Perfil se activa automáticamente

#### Edge Function: admin-invite-user

```typescript
// supabase/functions/admin-invite-user/index.ts
```

**Características:**

- Validación de permisos admin
- Generación de tokens únicos
- Prevención de duplicados
- Expiración automática (7 días)

## Base de Datos

### Esquema de Tablas

#### profiles
```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
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
```

#### files
```sql
CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
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
```

#### insights
```sql
CREATE TABLE insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID REFERENCES files(id) NOT NULL,
    insight_type insight_type NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    data JSONB DEFAULT '{}',
    confidence_score DECIMAL(5,4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Row Level Security (RLS)

#### Políticas de Seguridad

**Archivos (files)**:
- Usuarios ven solo sus archivos
- Admins ven todos los archivos
- Solo el propietario puede modificar

**Insights**:
- Usuarios ven insights de sus archivos
- Admins ven todos los insights
- Sistema puede insertar insights

**Chat History**:
- Usuarios ven solo su historial
- Admins ven todo el historial
- Solo el usuario puede insertar mensajes

### Funciones de Base de Datos

#### is_admin(user_uuid)
```sql
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
```
Verifica si un usuario tiene rol de administrador.

#### create_invitation(email, name, company, industry)
```sql
CREATE OR REPLACE FUNCTION create_invitation(
    invite_email TEXT,
    invite_name TEXT,
    invite_company TEXT,
    invite_industry TEXT DEFAULT NULL
)
RETURNS TEXT
```
Crea una invitación y retorna el token.

#### cleanup_file_data(file_uuid)
```sql
CREATE OR REPLACE FUNCTION cleanup_file_data(file_uuid UUID)
RETURNS VOID
```
Elimina un archivo y todos sus datos relacionados.

## API y Endpoints

### Edge Functions

#### /process-file
- **Método**: POST
- **Autenticación**: Bearer token
- **Parámetros**: `{ fileId: string }`
- **Respuesta**: `{ success: boolean, jobId?: string }`

**Funcionalidad**: Procesa un archivo subido enviándolo a Databricks.

#### /chatbot
- **Método**: POST
- **Autenticación**: Bearer token
- **Parámetros**: `{ message: string, fileId?: string, userId: string }`
- **Respuesta**: `{ success: boolean, response: string }`

**Funcionalidad**: Procesa mensajes del chatbot con contexto.

#### /admin-invite-user
- **Método**: POST
- **Autenticación**: Bearer token (admin)
- **Parámetros**: `{ email: string, fullName: string, companyName?: string, industry?: string }`
- **Respuesta**: `{ success: boolean, invitationToken: string, inviteUrl: string }`

**Funcionalidad**: Crea invitaciones para nuevos usuarios.

### Manejo de Errores

Todas las funciones implementan manejo de errores consistente:

```typescript
try {
  // Lógica principal
  return { success: true, data };
} catch (error) {
  console.error('Error:', error);
  return { success: false, error: error.message };
}
```

## Cumplimiento Legal

### LGPD (Brasil) y Ley 25.326 (Argentina)

#### Consentimiento
- **Registro**: Consentimiento explícito al registrarse
- **Procesamiento**: Consentimiento para procesamiento de datos
- **Términos**: Aceptación de términos y condiciones

#### Derechos del Usuario
- **Acceso**: Usuarios pueden ver todos sus datos
- **Rectificación**: Perfil editable por el usuario
- **Eliminación**: Función de eliminación completa de cuenta
- **Portabilidad**: Descarga de datos en formato estándar

#### Medidas de Seguridad
- **Encriptación**: Datos encriptados en tránsito y reposo
- **Acceso**: Control de acceso basado en roles
- **Auditoría**: Logs de todas las operaciones
- **Retención**: Políticas de retención de datos

### Política de Privacidad

```typescript
// src/pages/PrivacyPolicy.tsx
```

**Contenido**:
- Tipos de datos recopilados
- Finalidad del procesamiento
- Derechos del usuario
- Medidas de seguridad
- Contacto para ejercer derechos

## Instalación y Configuración

### Requisitos

- Node.js 18+
- npm o yarn
- Cuenta de Supabase
- Cuenta de Databricks (opcional para desarrollo)

### Configuración Inicial

1. **Clonar repositorio**:
```bash
git clone <repository-url>
cd nordataplatform
```

2. **Instalar dependencias**:
```bash
npm install
```

3. **Configurar variables de entorno**:
```bash
cp .env.example .env.local
```

4. **Configurar Supabase**:
   - Crear proyecto en Supabase
   - Ejecutar migraciones SQL
   - Configurar Storage buckets
   - Desplegar Edge Functions

5. **Iniciar desarrollo**:
```bash
npm run dev
```

### Configuración de Supabase

#### Buckets de Storage

```sql
-- Crear buckets necesarios
INSERT INTO storage.buckets (id, name, public) VALUES 
('data-files', 'data-files', false),
('processed-results', 'processed-results', false);
```

#### Políticas de Storage

```sql
-- Política para data-files
CREATE POLICY "Users can upload their own files" ON storage.objects
FOR INSERT WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own files" ON storage.objects
FOR SELECT USING (auth.uid()::text = (storage.foldername(name))[1]);
```

### Configuración de Databricks

#### Variables de Entorno

```bash
DATABRICKS_HOST=https://your-databricks-instance.com
DATABRICKS_TOKEN=your-databricks-token
DATABRICKS_CLUSTER_ID=your-cluster-id
```

#### Integración

Para conectar con Databricks real:

1. Modificar `supabase/functions/process-file/index.ts`
2. Implementar llamadas reales a Databricks API
3. Configurar webhooks para callbacks

### Despliegue

#### Supabase Edge Functions

```bash
supabase functions deploy process-file
supabase functions deploy chatbot
supabase functions deploy admin-invite-user
```

#### Frontend (Vercel/Netlify)

```bash
npm run build
# Seguir instrucciones de la plataforma elegida
```

### Monitoreo

#### Logs

- **Supabase**: Dashboard → Functions → Logs
- **PostgreSQL**: Dashboard → Database → Logs
- **Storage**: Dashboard → Storage → Logs

#### Métricas

- **Usuarios activos**: Panel de administración
- **Archivos procesados**: Dashboard de estadísticas
- **Mensajes de chat**: Métricas de uso

## Mantenimiento

### Actualización de Dependencias

```bash
npm update
npm audit fix
```

### Backup de Base de Datos

```bash
supabase db dump --local > backup.sql
```

### Limpieza de Datos

```sql
-- Eliminar archivos antiguos (ejemplo: >1 año)
DELETE FROM files WHERE created_at < NOW() - INTERVAL '1 year';

-- Limpiar invitaciones expiradas
DELETE FROM pending_invitations WHERE expires_at < NOW() AND used_at IS NULL;
```

### Escalabilidad

#### Optimizaciones

- **Índices**: Agregar índices para consultas frecuentes
- **Particionamiento**: Particionar tablas grandes por fecha
- **Caching**: Implementar Redis para datos frecuentes
- **CDN**: Usar CDN para archivos estáticos

#### Monitoreo de Performance

```sql
-- Consultas lentas
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC;

-- Tamaño de tablas
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Solución de Problemas

### Errores Comunes

#### Error de Autenticación
```
Token inválido o expirado
```
**Solución**: Verificar configuración de Supabase Auth y tokens.

#### Error de Subida de Archivos
```
Error al subir archivo
```
**Solución**: Verificar permisos de Storage y políticas RLS.

#### Error de Procesamiento
```
Error en procesamiento de Databricks
```
**Solución**: Verificar logs de Edge Functions y conectividad con Databricks.

### Logs de Debugging

```typescript
// Activar logs detallados
console.log('Debug info:', {
  user: user?.id,
  action: 'upload_file',
  timestamp: new Date().toISOString()
});
```

### Contacto y Soporte

Para soporte técnico:
- **Email**: support@nordataplatform.com
- **Documentación**: /docs
- **Issues**: GitHub Issues

---

*Esta documentación debe mantenerse actualizada con cada cambio en el código.*
