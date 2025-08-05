
# NORDATA.AI Platform

Plataforma completa de análisis de datos con inteligencia artificial que integra Databricks para procesamiento avanzado.

## Estructura del Proyecto

```
├── backend/                 # Backend completo
│   ├── supabase/           # Edge Functions y configuración
│   │   ├── functions/      # Edge Functions de Supabase
│   │   └── config.toml     # Configuración de Supabase
│   └── README.md           # Documentación del backend
│
├── frontend/               # Frontend completo
│   ├── src/               # Código fuente React
│   │   ├── components/    # Componentes React
│   │   ├── pages/         # Páginas principales
│   │   ├── hooks/         # Hooks personalizados
│   │   ├── context/       # Contextos React
│   │   ├── services/      # Servicios
│   │   └── lib/           # Utilidades
│   └── README.md          # Documentación del frontend
│
├── package.json           # Dependencias del proyecto
├── tailwind.config.ts     # Configuración de Tailwind
├── vite.config.ts         # Configuración de Vite
└── README.md              # Este archivo
```

## Arquitectura

### Backend
- **Supabase**: Backend as a Service con PostgreSQL
- **Edge Functions**: Lógica de servidor en Deno
- **Databricks**: Procesamiento de datos
- **Row Level Security**: Seguridad granular

### Frontend  
- **React 18 + TypeScript**: Framework principal
- **Tailwind CSS**: Estilos
- **Shadcn/ui**: Componentes UI
- **React Query**: Estado del servidor
- **Vite**: Build tool

## Funcionalidades Principales

### Sistema de Usuarios
- ✅ Autenticación completa
- ✅ Roles (admin/client)
- ✅ Gestión de usuarios por admin
- ✅ Sistema de invitaciones

### Procesamiento de Datos
- ✅ Subida de archivos (CSV, JSON, XLSX)
- ✅ Integración con Databricks
- ✅ Generación de insights con IA
- ✅ Monitoreo de trabajos

### Analytics Avanzado
- ✅ Dashboard de comportamiento
- ✅ Segmentación de clientes
- ✅ Métricas financieras
- ✅ Recomendaciones automáticas

### Tracking y Monitoreo
- ✅ Tracking de interacciones
- ✅ Analytics de comportamiento
- ✅ Métricas de performance
- ✅ Logs de procesamiento

## Instalación

### Prerrequisitos
- Node.js 18+
- Cuenta de Supabase
- Configuración de Databricks (opcional)

### Configuración
1. Clonar el repositorio
2. Instalar dependencias: `npm install`
3. Configurar variables de entorno
4. Ejecutar migraciones de base de datos
5. Iniciar desarrollo: `npm run dev`

## Scripts Disponibles

```bash
npm run dev          # Desarrollo
npm run build        # Build para producción
npm run preview      # Preview del build
npm run lint         # Linting
npm run type-check   # Verificación de tipos
```

## Variables de Entorno

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABRICKS_WORKSPACE_URL=
DATABRICKS_TOKEN=
DATABRICKS_JOB_ID=
```

## Contribución

1. Fork del proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## Licencia

Propiedad de NORDATA.AI - Todos los derechos reservados.
