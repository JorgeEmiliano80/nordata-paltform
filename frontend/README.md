
# NordataPlatform Frontend

Frontend desarrollado en React + TypeScript + Vite para la plataforma de análisis de datos.

## Estructura del proyecto

```
frontend/
├── src/
│   ├── components/        # Componentes reutilizables
│   ├── pages/            # Páginas de la aplicación
│   ├── services/         # Servicios para APIs
│   ├── hooks/            # Custom hooks
│   ├── context/          # Context providers
│   ├── config/           # Configuraciones
│   ├── lib/              # Utilidades
│   └── styles/           # Archivos CSS globales
├── public/               # Archivos estáticos
└── dist/                 # Build de producción
```

## Instalación

```bash
cd frontend
npm install
```

## Desarrollo

```bash
npm run dev
```

El frontend se ejecutará en http://localhost:3000

## Build

```bash
npm run build
```

## Variables de entorno

Copia `.env.example` a `.env` y configura:

- `VITE_API_BASE_URL`: URL del backend API
- `VITE_APP_TITLE`: Título de la aplicación
- `VITE_APP_DESCRIPTION`: Descripción de la aplicación

## Tecnologías

- React 18
- TypeScript
- Vite
- TailwindCSS
- React Router
- React Query
- React i18next
- Lucide React (iconos)
- Recharts (gráficos)
- Sonner (notificaciones)
