<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# Backend — API (NestJS + TypeORM) ✅

API del sistema de reservas implementada con **NestJS**, **TypeORM** y **PostgreSQL**.

---

## Requisitos

- Node.js >= 22
- pnpm
- PostgreSQL (o servicio compatible)

---

## Instalación

```bash
pnpm install
```

### Variables de entorno

Copia y completa el ejemplo:

```bash
cp .env.example .env
```

Variables importantes en `backend/.env`:

- `DATABASE_URL` — URL de conexión (ej: `postgresql://user:pass@localhost:5432/dbname`)
- `ACCESS_TOKEN_SECRET` — secreto para firmar JWT

---

## Scripts principales

- Desarrollo (con watch):

```bash
pnpm --filter backend start:dev
# o desde raíz
pnpm dev:backend
```

- Iniciar en producción:

```bash
pnpm --filter backend start:prod
```

- Build:

```bash
pnpm --filter backend build
```

- Linter y formateo:

```bash
pnpm --filter backend lint
pnpm --filter backend format
```

- Tests:

```bash
pnpm --filter backend test
pnpm --filter backend test:e2e
pnpm --filter backend test:cov
```

---

## Migraciones y seed

- Ejecutar migraciones:

```bash
pnpm --filter backend migration:run
```

- Generar migración:

```bash
pnpm --filter backend migration:generate -- <nombre>
```

- Revertir migración:

```bash
pnpm --filter backend migration:revert
```

- Cargar datos de prueba (seed):

```bash
pnpm --filter backend seed
```

> Asegúrate de que `DATABASE_URL` apunte a la base de datos correcta antes de aplicar migraciones o seed.

---

## API docs / Swagger

Al ejecutar la app en modo desarrollo/producción, la documentación Swagger está disponible en `/api` (ej: `http://localhost:3000/api`).

---

## Observabilidad y health

- Endpoint de health: `/health` (comprueba la conexión a la BD y otros indicadores)

---

## Despliegue

Incluye configuraciones para **Vercel** y otras plataformas; asegúrate de configurar variables de entorno (DATABASE_URL, ACCESS_TOKEN_SECRET, etc.).

---

## Contribuir

- Abre un issue para discutir cambios grandes.
- Envía PRs pequeñas y con pruebas cuando sea posible.
