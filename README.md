# Simulador de Créditos con Análisis de Riesgo — Backend

## Información del proyecto
- **Programa:** Análisis y Desarrollo de Software — SENA 228185
- **Grupo:** 5
- **Integrante:** Cruz (Backend Developer)
- **Rol:** Lógica del servidor, base de datos, endpoints de la API, autenticación y manejo de errores

---

## Stack tecnológico
- **Runtime:** Node.js v24
- **Framework:** Express.js
- **Base de datos:** Supabase (PostgreSQL)
- **Autenticación:** Supabase Auth + JWT
- **Despliegue:** Railway

---

## Requisitos previos
- Node.js instalado (v18 o superior)
- Cuenta en Supabase con el proyecto creado
- Git instalado

---

## Instalación local

### 1. Clonar el repositorio
```bash
git clone https://github.com/USUARIO/simulador-creditos.git
cd simulador-creditos/backend
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
```bash
copy .env.example .env
```
Abrir el archivo `.env` y completar con las credenciales de Supabase:

### 4. Arrancar el servidor
```bash
npm run dev
```
El servidor queda corriendo en `http://localhost:3001`

---

## Variables de entorno requeridas

| Variable | Descripción | Dónde conseguirla |
|----------|-------------|-------------------|
| `SUPABASE_URL` | URL del proyecto de Supabase | Project Settings → API → Project URL |
| `SUPABASE_SERVICE_KEY` | Clave de servicio de Supabase | Project Settings → API → service_role |
| `PORT` | Puerto del servidor | Dejar en 3001 |

---

## Endpoints disponibles

### Autenticación (público)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/registro` | Crear cuenta nueva |
| POST | `/api/auth/login` | Iniciar sesión y obtener token |

**Ejemplo registro:**
```json
POST /api/auth/registro
{
  "email": "usuario@gmail.com",
  "password": "123456",
  "nombre_completo": "Nombre Apellido",
  "ingresos_mensuales": 3000000,
  "deudas_actuales": 500000,
  "historial_pago_score": 75
}
```

**Ejemplo login:**
```json
POST /api/auth/login
{
  "email": "usuario@gmail.com",
  "password": "123456"
}
```

---

### Productos (público)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/productos` | Listar productos de crédito disponibles |

---

### Solicitudes (requiere token)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/solicitudes` | Crear solicitud y calcular todo automáticamente |
| GET | `/api/solicitudes` | Ver mis solicitudes |
| GET | `/api/solicitudes/:id` | Ver detalle completo de una solicitud |

**Ejemplo crear solicitud:**
```json
POST /api/solicitudes
Authorization: Bearer token

{
  "producto_id": 1,
  "monto_solicitado": 10000000,
  "plazo_meses": 24
}
```

**Respuesta:**
```json
{
  "solicitud": {
    "estado": "aprobado",
    "score_riesgo": 100,
    "nivel_riesgo": "bajo"
  },
  "scoring": {
    "cuotaCalculada": 528711,
    "totalAPagar": 12689064,
    "totalIntereses": 2689064
  },
  "amortizacion_preview": [...]
}
```

---

### Admin (requiere token de administrador)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/admin/reporte` | Reporte agregado de todas las solicitudes |
| PATCH | `/api/admin/productos/:id` | Actualizar producto de crédito |
| PATCH | `/api/admin/usuarios/:id/rol` | Cambiar rol de un usuario |
| GET  | `/api/auth/perfil`   | Usuario | Ver mi perfil completo |
| PATCH | `/api/auth/perfil`  | Usuario | Actualizar datos financieros |

---

## Cómo usar el token en las peticiones

Después del login copiar el token y enviarlo en el header de cada petición: Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

---

## Motor financiero

El servicio `credito.service.js` implementa:

- **Cuota fija mensual** usando el sistema francés: `C = P * [i(1+i)^n] / [(1+i)^n - 1]`
- **Tabla de amortización** completa mes a mes con capital e interés separados
- **Scoring de riesgo** con 4 reglas de negocio: capacidad de pago, relación deuda/ingreso, historial de pagos y monto vs ingresos anuales
- **Escenarios comparativos** bajo distintas tasas y plazos

---

## Roles del sistema

| Rol | ID | Permisos |
|-----|----|----------|
| Admin | 1 | Acceso total, reportes, gestión de productos |
| Usuario | 2 | Crear y ver sus propias solicitudes |

---

## Enlace al sistema desplegado

🔗 Pendiente — Railway (próximamente)