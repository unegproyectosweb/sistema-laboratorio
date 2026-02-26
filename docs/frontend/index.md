# Frontend Docs — UNEG Lab

---

Documentación funcional del cliente web (React + React Router + Vite).

## Alcance del frontend

La aplicación cubre autenticación, flujo de reservas y paneles privados para usuarios autenticados.

Rutas principales definidas en `frontend/src/routes.ts`:

- Públicas: `/login`, `/register`, `/administrador/registrar-administrador`, `/logout`
- Privadas: `/`, `/reservas`, `/reservas/:id`, `/reservas/nueva`, `/dashboard`, `/config`

## Stack principal y Usos

- **[React 19](https://react.dev/):**
  - **Uso:** Construcción de componentes funcionales y manejo de UI reactiva.
  - **Ejemplos en el proyecto:**
    - Uso del nuevo `React Compiler` para optimización automática de re-renders.
    - Manejo de carga progresiva mediante el componente `Skeleton` y `HydrateFallback` en `root.tsx`.

- **[React Router 7](https://reactrouter.com/):**
  - **Uso:** Enrutamiento del lado del cliente y orquestación de layouts.
  - **Ejemplos en el proyecto:**
    - Estructura de rutas centralizada en `src/routes.ts` con layouts anidados (`AuthLayout`, `PrivateLayout`).
    - Protección de rutas privadas validando la sesión en el layout base mediante el hook `useUser`.

- **[shadcn/ui](https://ui.shadcn.com/):**
  - **Uso:** Colección de componentes de UI reutilizables y accesibles.
  - **Ejemplos en el proyecto:**
    - Componentes base en `src/components/ui/` (botones, diálogos, tablas, calendarios).
    - Barras laterales dinámicas con el componente `AppSidebar`.

- **[TanStack Query v5](https://tanstack.com/query/latest):**
  - **Uso:** Sincronización de datos con la API.
  - **Ejemplos en el proyecto:**
    - `reservationsSearchQueryOptions`: Hook centralizado para búsqueda y filtrado de reservas con caché automática.
    - `useUpdateReservationState`: Mutación para aprobar/rechazar solicitudes de reserva con invalidación de caché.

- **[Zustand](https://zustand.pmnd.rs/):**
  - **Uso:** Estado global persistente en el cliente.
  - **Ejemplos en el proyecto:**
    - `authStore` (`src/lib/auth.ts`): Gestión centralizada de tokens JWT y metadatos del usuario logueado, persistiendo la identidad pero no el access token por seguridad.

- **[React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/):**
  - **Uso:** Gestión y validación de formularios.
  - **Ejemplos en el proyecto:**
    - Integración con `zodResolver` en `RegisterForm` y `LoginForm`.
    - Uso de esquemas compartidos (`@uneg-lab/api-types`) para garantizar la paridad de tipos entre cliente y servidor.

- **[ky](https://github.com/sindresorhus/ky):**
  - **Uso:** Cliente HTTP con soporte para interceptores.
  - **Ejemplos en el proyecto:**
    - Interceptor `beforeRequest`: Inyección automática del header de autorización en cada petición.
    - Interceptor `afterResponse`: Implementación de *silent refresh* de token ante errores 401 para mantener la sesión activa sin redirigir al login.

## Estructura relevante

```text
frontend/
├── src/
│   ├── components/   # UI reutilizable y componentes de dominio
│   ├── lib/          # cliente API, auth, query client
│   ├── routes/       # pantallas por ruta
│   ├── services/     # operaciones y acceso a datos por dominio
│   └── root.tsx      # providers globales (query, theme, toaster)
├── vite.config.ts
└── vercel.json
```

## Ejecución local

Desde la raíz del monorepo:

```bash
pnpm install
pnpm dev:frontend
```

Comandos útiles:

```bash
pnpm --filter frontend dev
pnpm --filter frontend build
pnpm --filter frontend preview
pnpm --filter frontend typecheck
pnpm --filter frontend lint
pnpm --filter frontend test
pnpm --filter frontend test:run
pnpm --filter frontend test:coverage
```

## Variables de entorno usadas por frontend

- `VITE_API_URL`: URL base del backend (sin `/api`, el cliente lo agrega).

## Convenciones

- Mantener mensajes de error y UX en español.
- Reutilizar esquemas/tipos de `@uneg-lab/api-types` para contratos de API.
- Preservar el patrón de sesión actual: access token en memoria + refresh token por cookie httpOnly.
