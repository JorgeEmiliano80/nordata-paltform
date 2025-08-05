
# NORDATA.AI Backend - Node.js + TypeScript

Backend completo desarrollado en Node.js con TypeScript, PostgreSQL y Redis.

## 🚀 Stack Tecnológico

- **Node.js 18+** - Runtime principal
- **TypeScript** - Lenguaje con tipado estático
- **Express.js** - Framework web
- **PostgreSQL** - Base de datos principal
- **Redis** - Cache y sesiones
- **JWT** - Autenticación con tokens
- **Multer** - Upload de archivos
- **Winston** - Logging avanzado

## 📁 Estructura del Proyecto

```
backend/
├── src/
│   ├── config/           # Configuraciones
│   ├── controllers/      # Controladores HTTP
│   ├── middleware/       # Middlewares (auth, error handling)
│   ├── models/          # Modelos de datos
│   ├── routes/          # Definición de rutas
│   ├── services/        # Lógica de negocio
│   ├── types/           # Definiciones de tipos TypeScript
│   ├── utils/           # Utilidades
│   └── server.ts        # Punto de entrada
├── database/
│   └── migrations/      # Migraciones SQL
├── logs/               # Archivos de log
├── uploads/           # Archivos subidos
├── package.json
├── tsconfig.json
└── .env.example
```

## 🛠️ Instalación y Configuración

1. **Instalar dependencias:**
```bash
cd backend
npm install
```

2. **Configurar variables de entorno:**
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

3. **Configurar PostgreSQL:**
```bash
# Crear base de datos
createdb nordata_db

# Ejecutar migraciones
psql -d nordata_db -f database/migrations/001_initial_schema.sql
```

4. **Configurar Redis:**
```bash
# Instalar Redis (Ubuntu/Debian)
sudo apt-get install redis-server

# Iniciar Redis
redis-server
```

## 🚦 Scripts de Desarrollo

```bash
# Desarrollo con hot-reload
npm run dev

# Construir para producción
npm run build

# Ejecutar en producción
npm start

# Crear usuario master
npm run create-master-user

# Linting
npm run lint
npm run lint:fix
```

## 🔐 Autenticación

### JWT Authentication
- **Access Token**: 1 hora de duración
- **Refresh Token**: 7 días de duración (HTTP-only cookie)
- **Roles**: `admin` | `client`

### Endpoints de Auth
```
POST /api/auth/login       # Iniciar sesión
POST /api/auth/register    # Registrarse
POST /api/auth/refresh     # Renovar tokens
POST /api/auth/logout      # Cerrar sesión
GET  /api/auth/profile     # Obtener perfil
```

## 📊 API Endpoints

### Usuarios
```
GET    /api/users/me       # Perfil del usuario actual
PUT    /api/users/me       # Actualizar perfil
GET    /api/users          # Listar usuarios (admin)
GET    /api/users/:id      # Obtener usuario (admin)
PUT    /api/users/:id      # Actualizar usuario (admin)
DELETE /api/users/:id      # Eliminar usuario (admin)
```

### Archivos
```
GET    /api/files          # Listar archivos del usuario
GET    /api/files/stats    # Estadísticas de archivos
POST   /api/files/upload   # Subir archivo
GET    /api/files/:id      # Obtener archivo específico
DELETE /api/files/:id      # Eliminar archivo
POST   /api/files/:id/process # Procesar con Databricks
```

### Analytics (próximamente)
```
GET    /api/analytics/dashboard # Dashboard de analytics
```

### Chatbot (próximamente)
```
POST   /api/chatbot/message # Enviar mensaje al chatbot
```

## 🛡️ Seguridad

### Middlewares de Seguridad
- **Helmet** - Headers de seguridad
- **CORS** - Control de acceso cross-origin
- **Rate Limiting** - Limitación de requests
- **JWT Verification** - Verificación de tokens
- **Role-based Access** - Control de acceso por roles

### Variables de Entorno Críticas
```env
JWT_SECRET=tu-clave-super-secreta
JWT_REFRESH_SECRET=tu-clave-refresh-secreta
DB_PASSWORD=password-seguro
REDIS_PASSWORD=password-redis
```

## 📁 Upload de Archivos

### Configuración
- **Directorio**: `./uploads`
- **Tamaño máximo**: 50MB por defecto
- **Tipos permitidos**: CSV, JSON, XLSX
- **Storage**: Disk storage con multer

### Validaciones
- Tipo de archivo
- Tamaño máximo
- Estructura de datos

## 🗄️ Base de Datos

### Tablas Principales
- `users` - Información de usuarios
- `files` - Metadatos de archivos
- `insights` - Insights generados por IA
- `chat_history` - Historial de conversaciones
- `notifications` - Notificaciones del sistema
- `processing_logs` - Logs de procesamiento

### Funciones Útiles
```sql
-- Limpiar datos de un archivo
SELECT cleanup_file_data('file-uuid');
```

## 📝 Logging

### Niveles de Log
- `error` - Errores críticos
- `warn` - Advertencias
- `info` - Información general
- `debug` - Información de debugging

### Archivos de Log
- `logs/error.log` - Solo errores
- `logs/combined.log` - Todos los logs
- `console` - Output en desarrollo

## 🔄 Integración con Databricks

### Próxima Implementación
El sistema está preparado para integración con Databricks:

1. **File Processing Service** - Envío de archivos
2. **Job Monitoring** - Monitoreo de trabajos
3. **Callback Handling** - Recepción de resultados
4. **Insights Generation** - Generación automática

## 🐳 Deployment

### Variables de Producción
```env
NODE_ENV=production
DB_HOST=tu-servidor-postgres
REDIS_HOST=tu-servidor-redis
FRONTEND_URL=https://tu-dominio.com
```

### Recomendaciones
- Usar PM2 para gestión de procesos
- Configurar reverse proxy con Nginx
- Habilitar SSL/TLS
- Configurar monitoring con logs

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Coverage de tests
npm run test:coverage
```

---

**Desarrollado por**: NORDATA.AI Team  
**Última actualización**: Enero 2025
