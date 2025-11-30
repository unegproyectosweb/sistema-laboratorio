# Sistema de Gestión de Horarios de Laboratorios - Villa Asia

Este proyecto es un sistema web full-stack diseñado para administrar y gestionar eficientemente los horarios de los laboratorios en la sede de Villa Asia. La aplicación permite a estudiantes y profesores consultar y reservar espacios de laboratorio de manera organizada.

## ✨ Características Principales

El sistema cuenta con una serie de funcionalidades orientadas a facilitar la gestión de los laboratorios:

*   **Autenticación de Usuarios:**
    *   Registro e inicio de sesión seguros para estudiantes y docentes.
    *   Hashing de contraseñas utilizando **Argon2** para máxima seguridad.
    *   Implementación de **JSON Web Tokens (JWT)** con mecanismo de refresco para mantener la sesión activa de forma segura.
    *   Funcionalidad completa de cierre de sesión.
*   **Gestión de Horarios:**
    *   Visualización de la disponibilidad de los laboratorios en una interfaz clara e intuitiva.
    *   Creación, modificación y eliminación de reservas de horarios (CRUD).
    *   Sistema de roles y permisos para diferenciar acciones entre administradores, profesores y estudiantes.
*   **Interfaz Moderna:**
    *   Frontend desarrollado con **React** y **TypeScript** para una experiencia de usuario dinámica y robusta.
    *   Diseño responsive adaptable a diferentes dispositivos.

## 🛠️ Tech Stack

Este proyecto es un monorepo gestionado con **pnpm workspaces** y está construido con las siguientes tecnologías:

*   **Frontend:** React, TypeScript.
*   **Backend:** Node.js, Express (o similar), TypeScript.
*   **Base de Datos:** (Especificar la base de datos, ej: PostgreSQL, MongoDB).
*   **Autenticación:** JWT, Argon2.
*   **Herramientas de Desarrollo:** ESLint, Prettier, PNPM.

## 📁 Estructura del Proyecto

El repositorio está organizado en un monorepo para facilitar el desarrollo y la escalabilidad:

```
├── .vscode/              # Configuración de VSCode
├── backend/              # Contiene toda la lógica del servidor y la API
├── frontend/             # Contiene la aplicación cliente desarrollada en React
├── packages/
│   └── common/           # Código compartido (tipos, interfaces, etc.)
├── .gitignore            # Archivos ignorados por Git
├── .prettierrc           # Reglas de formato de código
├── eslint.config.js      # Configuración de ESLint
├── package.json          # Dependencias y scripts del proyecto raíz
├── pnpm-lock.yaml        # Lockfile de dependencias de PNPM
└── pnpm-workspace.yaml   # Definición del workspace de PNPM
```

## 🚀 Cómo Empezar

Sigue estos pasos para configurar y ejecutar el proyecto en tu entorno local.

### **Prerrequisitos**

*   Node.js (v18 o superior)
*   pnpm (v8 o superior)

### **Instalación**

1.  **Haz un Fork del repositorio:**
    Primero, haz un fork del repositorio original `https://github.com/davbrito/proyecto-desarrollo-web` a tu propia cuenta de GitHub.

2.  **Clona tu fork:**
    Ahora, clona el repositorio desde tu cuenta. Reemplaza `<TU-USUARIO-DE-GITHUB>` con tu nombre de usuario.
    ```bash
    git clone https://github.com/<TU-USUARIO-DE-GITHUB>/proyecto-desarrollo-web.git
    cd proyecto-desarrollo-web
    ```

2.  **Instala las dependencias:**
    Desde la raíz del proyecto, pnpm instalará las dependencias de todos los workspaces.
    ```bash
    pnpm install
    ```

3.  **Configura las variables de entorno:**
    En el directorio `backend`, renombra el archivo `.env.example` a `.env` y completa las variables requeridas (credenciales de la base de datos, secretos de JWT, etc.).
    ```bash
    cp backend/.env.example backend/.env
    ```

### **Ejecución**

Puedes ejecutar el frontend y el backend simultáneamente desde la raíz del proyecto.

1.  **Iniciar el entorno de desarrollo:**
    ```bash
    pnpm dev
    ```

2.  **Abrir la aplicación:**
    *   El frontend estará disponible en `http://localhost:5173`.
    *   El servidor backend se ejecutará en `http://localhost:3000`.

## 📜 Scripts Disponibles

Estos son algunos de los scripts principales que puedes ejecutar desde la raíz del proyecto:

*   `pnpm dev`: Inicia el frontend y el backend en modo de desarrollo.
*   `pnpm build`: Compila las aplicaciones de frontend y backend para producción.
*   `pnpm lint`: Ejecuta ESLint para analizar el código en busca de errores.
*   `pnpm format`: Formatea todo el código del proyecto utilizando Prettier.
