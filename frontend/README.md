
# Frontend - NORDATA.AI Platform

Este directorio contiene toda la aplicación frontend de la plataforma NORDATA.AI.

## Estructura del Proyecto

### Páginas Principales (`src/pages/`)
- `Landing.tsx` - Página de inicio
- `Login.tsx` - Página de autenticación
- `Register.tsx` - Registro de usuarios
- `Dashboard.tsx` - Dashboard principal
- `Upload.tsx` - Subida de archivos
- `Settings.tsx` - Configuraciones de usuario
- `NotFound.tsx` - Página 404
- `Unauthorized.tsx` - Acceso denegado

### Componentes (`src/components/`)

#### UI Components (`src/components/ui/`)
- Componentes base de Shadcn/ui
- `button.tsx`, `card.tsx`, `input.tsx`, etc.

#### Componentes de Negocio
- `Navbar.tsx` - Navegación principal
- `FileUpload.tsx` - Subida de archivos
- `FilesList.tsx` - Lista de archivos
- `PipelinesList.tsx` - Lista de pipelines

#### Componentes de Admin (`src/components/admin/`)
- `AdminDashboard.tsx` - Dashboard administrativo
- `AdminUserInviteDialog.tsx` - Diálogo de invitación
- `AdminUsersList.tsx` - Lista de usuarios

#### Analytics (`src/components/analytics/`)
- `BehaviorAnalyticsDashboard.tsx`
- `ClientSegmentsDashboard.tsx`
- `DataFlowDashboard.tsx`
- `FinancialDashboard.tsx`
- `PerformanceDashboard.tsx`

#### Tracking (`src/components/tracking/`)
- `TrackingProvider.tsx` - Provider de tracking
- `TrackedButton.tsx` - Botón con tracking
- `TrackedInput.tsx` - Input con tracking
- `TrackedTabs.tsx` - Tabs con tracking

### Hooks Personalizados (`src/hooks/`)
- `useAuth.ts` - Autenticación
- `useAdmin.ts` - Funciones de admin
- `useFiles.ts` - Gestión de archivos
- `useUpload.ts` - Subida de archivos
- `useAnalytics.ts` - Analytics
- `useBehaviorTracking.ts` - Tracking de comportamiento
- `useCustomerSegmentation.ts` - Segmentación

### Contextos (`src/context/`)
- `AuthContext.tsx` - Contexto de autenticación
- `CurrencyContext.tsx` - Contexto de monedas

### Servicios (`src/services/`)
- `fileProcessingService.ts` - Procesamiento de archivos
- `analyticsService.ts` - Servicios de analytics

### Utilidades (`src/lib/`)
- `utils.ts` - Utilidades generales
- `supabase.ts` - Cliente de Supabase

## Tecnologías Utilizadas
- **React 18** - Framework principal
- **TypeScript** - Tipado estático
- **Vite** - Build tool
- **Tailwind CSS** - Estilos
- **Shadcn/ui** - Componentes UI
- **React Router** - Navegación
- **React Query** - Estado del servidor
- **React Hook Form** - Formularios
- **Recharts** - Gráficos
- **i18next** - Internacionalización

## Configuración
- `tailwind.config.ts` - Configuración de Tailwind
- `vite.config.ts` - Configuración de Vite
- `tsconfig.json` - Configuración de TypeScript
