Esta documentación detalla los endpoints disponibles en el backend del proyecto, los métodos HTTP que utilizan, los parámetros requeridos y las respuestas esperadas.

## Información General
- **Base URL:** `http://localhost:3000/api` (o la URL de producción).
- **Formato de datos:** `application/json`.
- **Autenticación:** La mayoría de los endpoints requieren un **JWT Token** en el header de la petición:  
  `Authorization: Bearer <token>`

---

## 1. Autenticación (`/auth`)
Gestiona el acceso, registro y perfiles de usuario.

| Método | Endpoint | Protección | Descripción |
| :--- | :--- | :--- | :--- |
| **POST** | `/auth/login` | Público | Inicia sesión. Retorna el token y datos del usuario. |
| **POST** | `/auth/register` | Público | Registro de nuevos usuarios estándar. |
| **POST** | `/auth/register/admin` | `CREATE_ADMIN` | Registro de administradores (solo personal autorizado). |
| **POST** | `/auth/refresh` | Público | Refresca el token de acceso usando una cookie de sesión. |
| **POST** | `/auth/logout` | Público | Cierra la sesión y limpia las cookies. |
| **GET** | `/auth/me` | Autenticado | Obtiene la información del perfil del usuario actual. |

---

## 2. Usuarios (`/users`)
Gestión administrativa y consulta de usuarios.

| Método | Endpoint | Protección | Descripción |
| :--- | :--- | :--- | :--- |
| **POST** | `/users` | Autenticado | Crea un usuario manualmente. |
| **GET** | `/users` | `READ_USERS` | Lista todos los usuarios registrados. |
| **GET** | `/users/:id` | Autenticado | Obtiene detalles de un usuario por su ID. |
| **GET** | `/users/username/:username` | Autenticado | Busca un usuario por su nombre de usuario. |
| **PATCH** | `/users/:id/role` | `UPDATE_USERS` | Cambia el rol (Admin, User, etc.) de un usuario. |

---

## 3. Reservaciones (`/reservations`)
Módulo principal para la gestión de préstamos y espacios.

| Método | Endpoint | Protección | Descripción |
| :--- | :--- | :--- | :--- |
| **POST** | `/reservations` | `CREATE_RESERVATIONS` | Crea una nueva solicitud de reservación. |
| **GET** | `/reservations` | `READ_RESERVATIONS` | Lista paginada de reservaciones (Soporta filtros y búsqueda). |
| **GET** | `/reservations/stats` | `READ_RESERVATIONS` | Obtiene estadísticas generales de reservaciones. |
| **GET** | `/reservations/:id` | `READ_RESERVATIONS` | Detalle de una reservación específica. |
| **PATCH** | `/reservations/:id` | `UPDATE_RESERVATIONS` | Actualiza los datos de una reservación. |
| **PATCH** | `/reservations/:id/state` | Autenticado | Actualiza únicamente el estado (Aprobado/Rechazado) de la reserva. |
| **DELETE** | `/reservations/:id` | `DELETE_RESERVATIONS` | Elimina una reservación del sistema. |

---

## 4. Laboratorios (`/laboratories`)
Gestión de los espacios físicos (Laboratorios).

| Método | Endpoint | Protección | Descripción |
| :--- | :--- | :--- | :--- |
| **POST** | `/laboratories` | `CREATE_LABORATORIES` | Registra un nuevo laboratorio. |
| **GET** | `/laboratories` | `READ_LABORATORIES` | Lista todos los laboratorios disponibles. |
| **GET** | `/laboratories/:id` | `READ_LABORATORIES` | Detalle de un laboratorio por ID. |
| **PATCH** | `/laboratories/:id` | `UPDATE_LABORATORIES` | Modifica la información de un laboratorio. |
| **DELETE** | `/laboratories/:id` | `DELETE_LABORATORIES` | Elimina un laboratorio. |

---

## 5. Clases (`/classes`)
Gestión de las asignaturas o clases que ocupan los laboratorios.

| Método | Endpoint | Protección | Descripción |
| :--- | :--- | :--- | :--- |
| **POST** | `/classes` | Autenticado | Registra una nueva clase. |
| **GET** | `/classes` | Autenticado | Lista todas las clases. |
| **GET** | `/classes/:id` | Autenticado | Detalle de una clase específica. |
| **PATCH** | `/classes/:id` | Autenticado | Actualiza información de una clase. |
| **DELETE** | `/classes/:id` | Autenticado | Elimina una clase. |

---

## 6. Ocupaciones (`/ocupations`)
Referencia a la ocupación temporal de los espacios.

| Método | Endpoint | Protección | Descripción |
| :--- | :--- | :--- | :--- |
| **POST** | `/ocupations` | Autenticado | Crea un registro de ocupación. |
| **GET** | `/ocupations` | Autenticado | Lista ocupaciones. Permite filtrar por `?reservationId=X`. |
| **GET** | `/ocupations/:id` | Autenticado | Detalle de una ocupación. |
| **PATCH** | `/ocupations/:id` | Autenticado | Actualiza una ocupación. |
| **DELETE** | `/ocupations/:id` | Autenticado | Elimina una ocupación. |

---

## 7. Eventos (`/events`)
Gestión de eventos especiales programados.

| Método | Endpoint | Protección | Descripción |
| :--- | :--- | :--- | :--- |
| **POST** | `/events` | Autenticado | Crea un nuevo evento. |
| **GET** | `/events` | Autenticado | Lista todos los eventos. |
| **GET** | `/events/:id` | Autenticado | Obtiene información de un evento. |
| **PATCH** | `/events/:id` | Autenticado | Modifica los datos de un evento. |
| **DELETE** | `/events/:id` | Autenticado | Elimina un evento. |

---

## Modelos de Respuesta Comunes

### Éxito (JSON)
La mayoría de los endpoints retornan el objeto creado o solicitado directamente, o un mensaje de confirmación.
```json
{
  "id": 1,
  "name": "Laboratorio de Computación I",
  "status": "active"
}
```

### Paginación (Reservaciones)
Para el endpoint `GET /reservations`, se utiliza un formato paginado:
```json
{
  "data": [...],
  "meta": {
    "itemsPerPage": 10,
    "totalItems": 50,
    "currentPage": 1,
    "totalPages": 5
  },
  "links": { "first": "...", "last": "...", "next": "...", "previous": "..." }
}
```

### Errores
- **401 Unauthorized**: No se envió el token o es inválido.
- **403 Forbidden**: El usuario no tiene el permiso (`PermissionEnum`) necesario.
- **404 Not Found**: El recurso solicitado no existe.
- **400 Bad Request**: Los datos enviados no cumplen con la validación de Zod/DTO.
