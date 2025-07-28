# Welcome to your Lovable project

## NORDATA.AI - Plataforma de Procesamiento de Datos

Esta es una plataforma completa de análisis de datos que permite a los usuarios:

- **Upload de archivos**: CSV, Excel, JSON para procesamiento
- **Análisis con IA**: Insights automáticos generados por Databricks
- **Chat inteligente**: Conversación con IA sobre los datos
- **Dashboard completo**: Visualización de métricas y análisis
- **Gestión de usuarios**: Sistema de invitaciones y roles

### Configuración de la Base de Datos

La base de datos ha sido configurada con las siguientes tablas principales:

1. **profiles** - Perfiles de usuario con roles y información de empresa
2. **files** - Archivos subidos para procesamiento
3. **insights** - Insights generados por IA/Databricks
4. **chat_history** - Historial de conversaciones con el chatbot
5. **processing_logs** - Logs de procesamiento de archivos
6. **notifications** - Sistema de notificaciones
7. **pending_invitations** - Gestión de invitaciones pendientes
8. **datasets, customers, transactions** - Datos procesados y analizados

### Funcionalidades Implementadas

- ✅ Sistema de autenticación con Supabase
- ✅ Row Level Security (RLS) en todas las tablas
- ✅ Sistema de invitaciones por email
- ✅ Upload y procesamiento de archivos
- ✅ Integración con Databricks para análisis
- ✅ Chatbot con IA (OpenAI)
- ✅ Dashboard de administración
- ✅ Notificaciones en tiempo real
- ✅ Análisis de clientes y segmentación
- ✅ Métricas de negocio y KPIs

## Project info

**URL**: https://lovable.dev/projects/dabcbcd3-532f-4a38-9ed3-ee8822d33b3e

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/dabcbcd3-532f-4a38-9ed3-ee8822d33b3e) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/dabcbcd3-532f-4a38-9ed3-ee8822d33b3e) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
