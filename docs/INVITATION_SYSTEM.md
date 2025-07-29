
# 📧 Sistema de Invitaciones NORDATA.AI

## 🎯 Funcionalidad General

El sistema de invitaciones de NORDATA.AI combina envío automático por email y compartir manual de enlaces, proporcionando máxima flexibilidad y confiabilidad.

## 🔧 Configuración

### Email Corporativo
- **Remitente**: `NORDATA.AI <jorgeemiliano@nordataai.com>`
- **Dominio verificado**: `www.nordataai.com` (Squarespace)
- **Servicio**: Resend API

### Variables de Entorno Requeridas
```
RESEND_API_KEY=your_resend_api_key_here
```

## 📋 Proceso de Invitación

### 1. Creación de Invitación
```
Admin → Formulario → Validación → Base de datos → Email + Enlace
```

#### Campos del Formulario:
- **Email*** (requerido)
- **Nombre completo*** (requerido) 
- **Empresa** (opcional)
- **Industria** (opcional)

### 2. Modo Híbrido (Automático + Manual)

#### ✅ Envío Automático (Preferido)
- Sistema intenta enviar email automáticamente
- Email HTML profesional con branding
- Incluye enlace directo de registro
- Confirmación visual en la interfaz

#### 🔗 Respaldo Manual (Siempre disponible)
- Enlace generado automáticamente
- Disponible para copiar/compartir
- Funciona aunque falle el email automático
- Token único y seguro

### 3. Flujo de Estados

```
Invitación Creada
    ├── Email enviado ✓ → Usuario recibe email + Enlace disponible
    └── Email falló ✗ → Solo enlace manual disponible
```

## 📧 Plantilla de Email

### Características
- **Diseño**: HTML responsive profesional
- **Branding**: Colores y logo de NORDATA.AI
- **Contenido**:
  - Saludo personalizado
  - Información de la empresa (si se proporciona)
  - Botón CTA prominente
  - URL alternativa para copiar/pegar
  - Descripción de funcionalidades
  - Información de expiración

### Asunto del Email
- Con empresa: `"Invitación a NORDATA.AI para [Empresa]"`
- Sin empresa: `"Invitación a NORDATA.AI"`

## 🔐 Seguridad y Validaciones

### Autorización
- Solo usuarios con rol `admin` pueden crear invitaciones
- Verificación de token JWT en cada request
- Validación de permisos en base de datos

### Tokens de Invitación
- **Generación**: UUID crypto-secure
- **Expiración**: 7 días automático
- **Uso único**: Se marca como usado al registrarse
- **Validación**: Verificación de expiración y uso

### Prevención de Duplicados
- Verificación de email existente
- Control de invitaciones pendientes
- Logging de todas las operaciones

## 💾 Base de Datos

### Tabla: `pending_invitations`
```sql
- id (UUID primary key)
- email (string, unique para invites pendientes)
- full_name (string)
- company_name (string, nullable)  
- industry (string, nullable)
- invitation_token (UUID, unique)
- invited_by (UUID, foreign key a admin)
- invited_at (timestamp, default now())
- expires_at (timestamp, +7 días)
- used_at (timestamp, nullable)
```

## 🎨 Interfaz de Usuario

### Panel de Admin
1. **Botón "Invitar Usuario"** → Abre modal de creación
2. **Formulario de invitación** → Campos de entrada
3. **Resultados híbridos** → Estado del envío

### Modal de Resultados
- **Cards de estado**: Email enviado/Manual
- **Indicadores visuales**: Colores y iconos diferenciados  
- **Instrucciones**: Pasos siguientes claros
- **Acciones**: Copiar enlace, cerrar

### Notificaciones Toast
- **Email exitoso**: Verde, confirmación de envío
- **Email fallido**: Naranja, instrucciones manuales
- **Información**: Azul, pasos adicionales

## 🔄 Manejo de Errores

### Errores de Email
- **API key faltante**: Fallback a modo manual
- **Dominio no verificado**: Error específico con instrucciones
- **Rate limits**: Mensaje de reintento
- **Fallos de red**: Mensaje de conexión

### Respuestas de Error
```json
{
  "success": false,
  "error": "mensaje_descriptivo",
  "emailSent": false,
  "emailError": "detalle_del_error"
}
```

### Fallbacks Automáticos
1. **Sin RESEND_API_KEY** → Modo manual únicamente
2. **Error de envío** → Enlace manual + mensaje de error
3. **Timeout** → Enlace disponible como respaldo

## 📊 Logging y Monitoreo

### Logs de Sistema
```javascript
// Creación exitosa
console.log(`Invitación creada para: ${email} por admin: ${userId}`);

// Email enviado
console.log(`Email enviado exitosamente a ${email}:`, emailData);

// Error de email  
console.error(`Error enviando email a ${email}:`, error);
```

### Métricas Sugeridas
- Tasa de envío exitoso de emails
- Tiempo de procesamiento de invitaciones
- Tasa de registro completado
- Errores por tipo

## 🚀 Funcionalidades Futuras

### Mejoras Posibles
- [ ] Plantillas de email personalizables
- [ ] Recordatorios automáticos
- [ ] Análisis de engagement de emails
- [ ] Invitaciones por lote
- [ ] Integración con calendario

### Optimizaciones
- [ ] Cache de plantillas
- [ ] Queue de emails
- [ ] Retry automático
- [ ] Métricas avanzadas

## 📞 Soporte

### Configuración de Dominio
1. Verificar dominio en [Resend Domains](https://resend.com/domains)
2. Configurar DNS según instrucciones
3. Esperar verificación completa

### Troubleshooting
- **Emails no llegan**: Verificar spam, dominio verificado
- **Enlaces no funcionan**: Verificar URL base correcta
- **Permisos**: Confirmar rol admin del usuario

---

**Versión**: 1.0.0  
**Última actualización**: 29/01/2025  
**Contacto técnico**: Jorge Emiliano (jorgeemiliano@nordataai.com)
