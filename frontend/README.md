# Frontend — Aplicación cliente (React + TypeScript) ✅

Interfaz de usuario del sistema de reservas. Implementada con React 19, Vite y Tailwind CSS.

---

## Requisitos

- Node.js >= 22
- pnpm

---

## Instalación

Desde la raíz del monorepo:

```bash
pnpm install
# o solo en frontend
pnpm --filter frontend install
```

---

## Scripts útiles

- Desarrollo (HMR):

```bash
pnpm --filter frontend dev
# o desde raíz
pnpm dev:frontend
```

- Compilar producción:

```bash
pnpm --filter frontend build
```

- Previsualizar build:

```bash
pnpm --filter frontend preview
```

- Generar tipos y comprobar:

```bash
pnpm --filter frontend typecheck
```

- Lint:

```bash
pnpm --filter frontend lint
```

- Tests (Vitest):

```bash
pnpm --filter frontend test
pnpm --filter frontend test:run
pnpm --filter frontend test:coverage
```

---

## Testing

Se usan `vitest` y `@testing-library/react`. Ejecuta `pnpm --filter frontend test` para tests en modo watch o `pnpm --filter frontend test:run` para ejecución única.

---

## Despliegue

Se incluye configuración para desplegar en **Vercel**. Asegúrate de configurar las variables de entorno en la plataforma (ej. `VITE_HOSTNAME_BACKEND`).

---

## Contribuciones

- Escribe tests para nuevas funcionalidades.
- Respeta las reglas de lint y formato antes de enviar PRs.
