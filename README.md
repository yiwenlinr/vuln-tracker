# Vuln Tracker

Vuln Tracker es una aplicación web orientada al registro y seguimiento de hallazgos de seguridad en sitios o activos tecnológicos. El objetivo del proyecto es centralizar información sobre vulnerabilidades, su estado y métricas generales para facilitar su gestión mediante un dashboard.

## Tecnologías utilizadas

- Node.js + Express 5
- MySQL 8 (Docker Compose)
- JWT para autenticación y bcrypt para el hash de contraseñas
- Zod para validación
- React 19 + Vite
- DBeaver para administración de base de datos

## Cómo ejecutarlo

```bash
cp .env.example .env && docker compose up -d          # MySQL, crea las tablas en un volumen nuevo
cd backend && cp .env.example .env && npm install      # completar DB_* y JWT_SECRET
ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=... npm run seed:admin
npm run dev                                            # API en http://localhost:4000
npm test                                               # tests del backend (no necesitan la BD)
cd ../frontend && npm install && npm run dev           # App en http://localhost:5173
```

En PowerShell, las variables del seed se definen con `$env:ADMIN_EMAIL="..."; $env:ADMIN_PASSWORD="..."` antes de `npm run seed:admin`.

## Roles

| Rol | Permisos |
|-----|----------|
| viewer | Solo lectura |
| analyst | Crear sitios, crear y editar hallazgos |
| admin | Lo anterior + archivar/restaurar sitios y gestionar usuarios |

Los usuarios nuevos se registran como `analyst`. El primer admin se crea con `npm run seed:admin`; después, los roles se cambian desde la página "Usuarios".

## Último avance

- Interfaz y mensajes de la API en español latinoamericano neutro
- Gestión de usuarios y roles, restaurar sitios archivados, confirmaciones y avisos de éxito
- 28 tests del backend con node:test + supertest

- Seguridad: RBAC, validación con Zod, rate limiting en auth, comprobación de `JWT_SECRET`
- Hallazgos: vista de detalle, edición y filtros por sitio, severidad y estado
- Docker carga el esquema automáticamente; credenciales en `.env`
- UI con layout compartido, login con el tema oscuro y diseño adaptable a móvil

## Próximos pasos

- CI que ejecute lint y tests
- Exportar reportes (PDF/CSV)
- Historial de cambios y asignación de hallazgos
