# 4. Decisiones Técnicas 

Este documento describe las elecciones arquitectónicas y tecnológicas realizadas durante el desarrollo del backend, justificando su uso para garantizar la escalabilidad, seguridad y mantenibilidad del sistema.

## 1. Framework: NestJS
Se seleccionó **NestJS** como framework principal debido a su arquitectura modular basada en Angular, lo que permite una separación clara de responsabilidades.
- **Beneficio:** Facilita la inyección de dependencias y el testeo unitario.
- **Tipado:** El uso nativo de **TypeScript** asegura que los contratos de datos se respeten en toda la aplicación, reduciendo errores en tiempo de ejecución.

## 2. Validación de Datos: Zod y nestjs-zod
A diferencia de la arquitectura tradicional de NestJS que usa `class-validator`, este proyecto implementa **Zod**.
- **Razón:** Zod permite una validación de esquemas más estricta y dinámica. 
- **Integración:** Mediante `nestjs-zod`, se vinculan los DTOs (Data Transfer Objects) directamente con los esquemas de validación, garantizando que la entrada de datos (como en `LoginDto` o `RegisterDto`) sea exacta antes de llegar al servicio.

## 3. Seguridad y Autorización Granular
El sistema no se limita a un esquema simple de "Admin/Usuario", sino que utiliza un sistema de **Control de Acceso Basado en Permisos (PBAC)**.
- **Decoradores Personalizados:** Se crearon decoradores como `@Auth()` y `@RequirePermissions(PermissionEnum.CREATE_...)`.
- **Estrategia:** Esto permite un control total sobre qué acciones puede realizar cada usuario (ej. un usuario puede ver laboratorios pero no borrarlos), centralizando la lógica de seguridad en `Guards` de NestJS.
- **Autenticación:** Implementación de **JWT (JSON Web Tokens)** con manejo de *Refresh Tokens* para mejorar la experiencia de usuario sin comprometer la seguridad.

## 4. Desacoplamiento de Datos (Mappers y DTOs)
El proyecto implementa una capa de **Mappers** (ej. `UserMapper.toDto`).
- **Decisión:** No exponer las entidades de la base de datos directamente al cliente.
- **Razón:** Por seguridad (evitar enviar hashes de contraseñas o datos sensibles) y para permitir que la estructura de la base de datos cambie sin romper la API del cliente.

## 5. Paginación Estandarizada
Para el manejo de listas largas (especialmente en Reservaciones), se utiliza `nestjs-paginate`.
- **Justificación:** En lugar de implementar lógica manual de `skip` y `take`, esta librería estandariza los filtros, la ordenación y los metadatos de respuesta (links de página siguiente/anterior).
- **Impacto:** Mejora el rendimiento del servidor y facilita el consumo de datos desde el frontend.

## 6. Manejo de Estado en Reservaciones
Se optó por un endpoint específico para el cambio de estado (`/reservations/:id/state`).
- **Decisión:** Separar la actualización de datos generales (como fecha o descripción) de la lógica de negocio de aprobación/rechazo.
- **Razón:** Esto permite disparar eventos específicos o validaciones adicionales cuando una reserva cambia de "pendiente" a "aprobada" sin interferir con otras ediciones.

## 7. Persistencia de Datos: TypeORM
Se utiliza **TypeORM** como ORM para la interacción con la base de datos.
- **Razón:** Permite definir el esquema mediante clases (Entidades), facilitando las migraciones de base de datos y manteniendo la coherencia con el resto del código en TypeScript.

---

### Resumen del Stack Tecnológico
| Tecnología | Función |
| :--- | :--- |
| **Node.js / NestJS** | Entorno de ejecución y Framework. |
| **PostgreSQL** | Base de datos relacional (asumida por el uso de TypeORM). |
| **Zod** | Esquemas de validación. |
| **Passport / JWT** | Estrategia de autenticación. |
| **Bcrypt** | Encriptación de contraseñas. |
