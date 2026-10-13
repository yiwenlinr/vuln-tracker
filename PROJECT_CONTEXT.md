# VULN TRACKER — Contexto del Proyecto

> Archivo para dar contexto completo del proyecto a herramientas de IA.
> Última actualización: 2026-10-12

---

## ¿Qué es Vuln Tracker?

Vuln Tracker es una aplicación web full-stack para registrar y gestionar hallazgos de seguridad (vulnerabilidades) en sitios web y activos tecnológicos. Centraliza la información de vulnerabilidades, permite hacer seguimiento del estado de remediación y presenta métricas en un dashboard.

**Objetivo principal:** ser una herramienta de gestión de vulnerabilidades para equipos de seguridad ofensiva/defensiva, útil durante pentests o programas de bug bounty internos.

---

## Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Runtime backend | Node.js | 24 |
| Framework backend | Express | 5.2.1 |
| Base de datos | MySQL | 8.0 |
| Autenticación | JWT + bcrypt | jwt 9.0.3 / bcrypt 6.0.0 |
| Validación backend | Zod | 4.3.6 |
| Seguridad HTTP | Helmet, CORS, express-rate-limit | - |
| Framework frontend | React | 19.2.0 |
| Build tool | Vite | 7.3.1 |
| Routing frontend | React Router DOM | 7.13.1 |
| HTTP client | Axios | 1.13.6 |
| Infraestructura | Docker Compose (solo MySQL) | - |

---

## Estructura de Archivos

```
vuln-tracker/
├── backend/
│   ├── src/
│   │   ├── controllers/                 # auth, findings, sites, stats
│   │   ├── db/
│   │   │   ├── pool.js                  # Pool de conexiones MySQL
│   │   │   ├── schema.sql               # Esquema (se carga solo en un volumen nuevo de Docker)
│   │   │   └── seed-admin.js            # Crea o promueve un usuario admin
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js       # requireAuth (JWT) y requireRole (RBAC)
│   │   │   ├── validate.middleware.js   # Valida params/body con esquemas Zod
│   │   │   └── rateLimit.middleware.js  # Límites para login y registro
│   │   ├── validators/                  # Esquemas Zod por recurso
│   │   ├── routes/                      # auth, findings, sites, stats, users
│   │   ├── app.js                       # App de Express (rutas, 404, error handler)
│   │   └── server.js                    # Entry point: valida env, ping a la BD, listen
│   ├── test/                            # Tests con node:test + supertest (BD simulada)
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx               # Topbar, navegación, usuario y logout
│   │   │   ├── ProtectedRoute.jsx       # Guard de rutas (token presente y no expirado)
│   │   │   ├── FindingFormFields.jsx    # Campos compartidos crear/editar hallazgo
│   │   │   └── FindingDetail.jsx        # Vista de detalle y edición de un hallazgo
│   │   │   └── Badge.jsx                # Etiqueta de color con el texto en español
│   │   ├── pages/                       # Login, Dashboard, Sites, Findings, Users (solo admin)
│   │   ├── services/
│   │   │   ├── api.js                   # Axios: añade el JWT y gestiona los 401
│   │   │   └── session.js               # Sesión en localStorage y helpers de rol
│   │   ├── utils/
│   │   │   ├── findings.js              # Constantes y conversión de formularios
│   │   │   └── i18n.js                  # Etiquetas en español y formato de fechas es-419
│   │   ├── App.jsx                      # Router principal
│   │   └── main.jsx
│   ├── .env.example
│   └── package.json
│
├── docker-compose.yml
├── .env.example                         # Credenciales de MySQL para docker-compose
└── PROJECT_CONTEXT.md                   # Este archivo
```

---

## Base de Datos — Esquema

### Tabla `users`
```sql
id            INT AUTO_INCREMENT PRIMARY KEY
name          VARCHAR(100) NOT NULL
email         VARCHAR(150) NOT NULL UNIQUE
password_hash VARCHAR(255) NOT NULL
role          ENUM('admin','analyst','viewer') DEFAULT 'analyst'
created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

### Tabla `sites`
```sql
id          INT AUTO_INCREMENT PRIMARY KEY
name        VARCHAR(120) NOT NULL
url         VARCHAR(255) NOT NULL
owner       VARCHAR(120) NULL
environment ENUM('prod','dev','staging') DEFAULT 'prod'
criticality ENUM('low','medium','high') DEFAULT 'medium'
status      ENUM('active','archived') DEFAULT 'active'
created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

### Tabla `findings`
```sql
id             INT AUTO_INCREMENT PRIMARY KEY
site_id        INT NOT NULL (FK → sites.id ON DELETE CASCADE)
title          VARCHAR(180) NOT NULL
severity       ENUM('critical','high','medium','low') DEFAULT 'low'
status         ENUM('open','in_progress','fixed','accepted','false_positive') DEFAULT 'open'
owasp          VARCHAR(10) NULL
cwe            VARCHAR(20) NULL
cvss_score     DECIMAL(3,1) NULL
description    TEXT NULL
evidence       TEXT NULL
recommendation TEXT NULL
created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at     TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

**Relaciones:** un `site` tiene muchos `findings` (1:N), con borrado en cascada.

---

## API Endpoints

| Método | Ruta | Roles | Descripción |
|--------|------|-------|-------------|
| POST | `/auth/register` | Público (5/hora por IP) | Registro; el rol siempre es `analyst` |
| POST | `/auth/login` | Público (5 fallos/15 min por IP) | Login, devuelve JWT |
| GET | `/auth/me` | Cualquier usuario autenticado | Payload del token |
| GET | `/sites` | Cualquier usuario autenticado | Listar sitios |
| POST | `/sites` | admin, analyst | Crear sitio |
| PATCH | `/sites/:id/archive` | admin | Archivar sitio (soft-delete) |
| PATCH | `/sites/:id/restore` | admin | Restaurar un sitio archivado |
| GET | `/findings` | Cualquier usuario autenticado | Listar hallazgos con nombre de sitio |
| GET | `/findings/site/:siteId` | Cualquier usuario autenticado | Hallazgos de un sitio |
| POST | `/findings` | admin, analyst | Crear hallazgo (solo en sitios activos) |
| PATCH | `/findings/:id` | admin, analyst | Actualizar solo los campos enviados; `null` vacía un campo |
| GET | `/stats` | Cualquier usuario autenticado | Estadísticas del dashboard |
| GET | `/users` | admin | Listar usuarios (sin hash de contraseña) |
| PATCH | `/users/:id/role` | admin | Cambiar el rol de otro usuario (aplica en su próximo login) |
| GET | `/health` | Público | Health check |

Errores: `400` (validación, con `errors[]` por campo), `401` (sin token o token inválido), `403` (rol insuficiente), `404`, `429` (rate limit). Todos los mensajes de la API están en español latinoamericano neutro (Zod usa `z.locales.es()`).

**Puertos:** backend → 4000 | frontend (dev) → 5173 | MySQL → 127.0.0.1:3306

---

## Funcionalidades Implementadas

### 1. Autenticación y roles
- Registro y login con bcrypt (10 rounds) y JWT (expiración configurable, 1h por defecto)
- Roles: `viewer` (solo lectura), `analyst` (crear/editar), `admin` (además archiva sitios)
- La UI oculta las acciones que el rol no permite; el backend las aplica igualmente
- Token en localStorage; el interceptor de Axios añade `Authorization: Bearer` y, ante un 401, limpia la sesión y redirige al login
- `ProtectedRoute` comprueba también que el token no haya expirado

- Página "Usuarios" (solo admin) para cambiar roles; un admin no puede cambiar su propio rol

### 2. Gestión de sitios
- Crear sitios (nombre, URL http/https, responsable, entorno, criticidad)
- Listar sitios, archivarlos (con confirmación) y restaurarlos

### 3. Gestión de hallazgos
- Crear hallazgos vinculados a un sitio activo
- Clasificación: OWASP, CWE, CVSS (0–10)
- Ciclo de vida: `open` → `in_progress` → `fixed`, más `accepted` y `false_positive`
- Botón "Advance Status" para `open` e `in_progress`
- Vista de detalle (descripción, evidencia, recomendación, fechas) y edición
- Filtros por sitio, severidad y estado

### 4. Dashboard
- Sitios totales, activos y archivados
- Total de hallazgos y desglose por severidad y por estado

---

## Seguridad — Estado Actual

### Implementado
- Hashing de contraseñas con bcrypt; contraseñas de 8 a 72 caracteres
- `JWT_SECRET` obligatorio de 32 caracteres como mínimo (el servidor no arranca sin él)
- RBAC en todas las rutas de escritura
- Validación con Zod de params y body en todas las rutas (tipos, enums, longitudes iguales al esquema SQL)
- Prepared statements con mysql2 y `stringifyObjects: true` contra la inyección de objetos
- Rate limiting en login y registro
- Helmet, CORS configurable (`CORS_ORIGIN`), handler 404 y error handler global
- MySQL publicado solo en localhost; credenciales en `.env`

### Pendiente / gaps
- JWT en localStorage (vulnerable a XSS; considerar cookies httpOnly)
- El registro sigue siendo público (cualquiera obtiene una cuenta `analyst`)
- No hay audit trail de quién creó o modificó cada hallazgo o sitio
- Un cambio de rol no afecta a los tokens ya emitidos hasta que expiran (1h)
- Sin CI

---

## Posibles mejoras futuras
- Exportación de reportes (PDF/CSV)
- Asignación de hallazgos a usuarios e historial de cambios
- Paginación en el servidor
- Integración con una calculadora CVSS
- Notificaciones de hallazgos críticos
- Servicios de backend y frontend en docker-compose

---

## Cómo ejecutar el proyecto

```bash
# 1. Base de datos (crea las tablas solas si el volumen es nuevo)
cp .env.example .env                  # cambiar contraseñas
docker compose up -d

# 2. Backend
cd backend
cp .env.example .env                  # DB_* iguales al .env raíz; generar JWT_SECRET
npm install
ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=... npm run seed:admin
npm run dev
npm test                              # 28 tests, no necesitan la BD

# 3. Frontend
cd frontend
npm install
npm run dev                           # http://localhost:5173
```
