# Guía de Despliegue del Backend

Esta guía describe el proceso de preparación, construcción y despliegue del backend de NestJS contenido en el monorepo.

## 1) Preparación

Requisitos:
- **Node.js 22+**
- **pnpm**
- **Base de Datos:** PostgreSQL (u otra compatible configurada en TypeORM).

Desde la raíz del repositorio, instala las dependencias:
```bash
pnpm install
```

## 2) Variables de Entorno

El backend requiere un archivo `.env` (o variables configuradas en el entorno de despliegue) con los siguientes valores mínimos:

| Variable | Requerida | Descripción | Ejemplo |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | Sí | URL de conexión a PostgreSQL | `postgres://user:pass@host:5432/db` |
| `JWT_SECRET` | Sí | Clave secreta para firmar tokens JWT | `una_clave_muy_segura` |
| `PORT` | No | Puerto donde correrá el servidor | `3000` |
| `FRONTEND_URL` | Sí | URL del frontend para habilitar CORS | `https://mi-app.vercel.app` |
| `NODE_ENV` | Sí | Entorno de ejecución | `production` |

## 3) Construcción (Build)

El backend utiliza `tsdown` para compilar el código de TypeScript a JavaScript optimizado.

Ejecuta el build desde la raíz:
```bash
pnpm --filter backend build
```

**Artefacto generado:**
- La salida se encuentra en `backend/dist/main.cjs`.

## 4) Base de Datos y Migraciones

Antes de iniciar el servicio en producción, es necesario sincronizar el esquema de la base de datos:

**Ejecutar migraciones:**
```bash
pnpm --filter backend migration:run
```

**Opcional (Poblar datos iniciales):**
```bash
pnpm --filter backend seed
```

## 5) Ejecución en Producción

Para poner en marcha el servidor una vez construido, utiliza el siguiente comando:

```bash
pnpm --filter backend start:prod
```
*(Internamente ejecuta `node dist/main`, asegurando que el servidor use los archivos compilados).*

### Despliegue en PaaS (Render / Railway / DigitalOcean)

Si utilizas una plataforma de despliegue automático, configura los siguientes comandos:
1.  **Build Command:** `pnpm install && pnpm --filter backend build`
2.  **Start Command:** `pnpm --filter backend migration:run && pnpm --filter backend start:prod`

## 6) Checklist de Integración

- [ ] **CORS:** Verifica que `FRONTEND_URL` coincida exactamente con la URL de Vercel para permitir peticiones.
- [ ] **Cookies:** Si usas Refresh Tokens vía Cookies, asegúrate de que el backend esté sobre **HTTPS** para que las cookies con `Secure: true` funcionen.
- [ ] **Health Check:** Puedes verificar que el servidor responda correctamente en `GET /api/health` (si está implementado) o mediante `GET /api/users` para probar la conexión a la base de datos.

---

### Notas sobre Scripts del `package.json`
- `typecheck`: Se ejecuta automáticamente antes del build para asegurar que no hay errores de tipos.
- `tsdown`: Es la herramienta encargada de empaquetar el backend en un archivo `.cjs` compatible con el entorno de ejecución de Node.js.
