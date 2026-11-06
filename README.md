# 🎬 StreamStore — Enterprise Digital Entertainment Platform

[![Node.js Version](https://img.shields.io/badge/Node.js-v18%2B%20%7C%20v20%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Vue 3](https://img.shields.io/badge/Vue.js-v3.5%2B-4FC08D?logo=vuedotjs&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.0%2B-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-v5.0-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**StreamStore** es una solución integral y profesional de comercio electrónico y administración de servicios de streaming (Netflix, Disney+, Max, Prime Video, Spotify, Crunchyroll, Paramount+, etc.). Incluye una tienda en línea moderna, entrega inmediata y automatizada de credenciales con PIN para perfiles privados, motor transaccional con cero sobreventa y un panel de administración empresarial para control de stock, clientes y facturación.

---

## 📑 Tabla de Contenidos

- [Características Principales](#-características-principales)
- [Arquitectura del Proyecto](#-arquitectura-del-proyecto)
- [Stack Tecnológico](#-stack-tecnológico)
- [Seguridad y Protección de Datos](#-seguridad-y-protección-de-datos)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Variables de Entorno](#-variables-de-entorno)
- [Base de Datos y Semillas](#-base-de-datos-y-semillas)
- [Ejecución](#-ejecución)
- [Cuentas Demo de Prueba](#-cuentas-demo-de-prueba)
- [Flujo de Compra y Stock Transaccional](#-flujo-de-compra-y-stock-transaccional)
- [Scripts Disponibles](#-scripts-disponibles)
- [Documentación de la API (Swagger & OpenAPI)](#-documentación-de-la-api-swagger--openapi)

---

## ✨ Características Principales

### 🛍️ Para Clientes (Tienda & Experiencia de Usuario)
- **Catálogo Interactivo**: Filtrado por plataforma, búsqueda instantánea, cálculo de stock en tiempo real y vista detallada con portadas cinemáticas.
- **Carrito Persistente**: Sincronización en backend y almacenamiento en memoria global con validaciones reactivas.
- **Checkout Dinámico**: Simulación de compra y pago en un clic con protección de inventario.
- **Panel de Cliente ("Mis Servicios")**:
  - Visualización de credenciales seguras (correo, contraseña y perfil/PIN asignado).
  - Contador de días restantes y fecha de vencimiento en tiempo real.
  - Flujo de renovación de servicios con un solo botón sin duplicar cuentas.
- **Diseño Inmersivo**: Interfaz moderna en modo oscuro, animaciones inteligentes de carga y diseño totalmente responsivo.

### 🛡️ Para Administradores (Consola de Gestión)
- **Panel Ejecutivo**: Métricas en vivo de facturación diaria y mensual, pantallas libres, cuentas maestras y suscripciones activas.
- **Inventario Paginado**: Tabla de cuentas con paginación interactiva (`< 1 2 3 >`), altura fija constante y vista expandible de perfiles asignados.
- **Gestión de Plataformas**: Creación y edición de marcas de streaming con soporte para portadas vía enlace web o subida de imágenes locales (`multipart/form-data`).
- **Gestión de Cuentas Maestras**: Carga de credenciales y cantidad de pantallas por cuenta para asignación automática post-compra.
- **Cron de Vencimientos Automatizado**: Verificación automática y manual de fechas límite con envío de alertas preventivas (3 días, 1 día y vencimiento).
- **Control de Ventas y Clientes**: Historial detallado de órdenes, estados de pago y clientes registrados.

---

## 🏛️ Arquitectura del Proyecto

El repositorio está estructurado como un monorepo modular desacoplado en dos capas principales:

```
StreamStore/
├── package.json                   # Orquestador del monorepo
├── run_all.js                     # Lanzador de procesos concurrentes (Frontend + Backend)
│
├── StreamStoreFrontend/           # Cliente SPA (Single Page Application)
│   ├── src/
│   │   ├── assets/                # Iconos y estilos globales
│   │   ├── components/            # Componentes modulares reutilizables
│   │   │   ├── admin/             # Tablas, métricas y modales del panel admin
│   │   │   ├── catalog/           # Tarjetas de productos, filtros y carruseles
│   │   │   ├── checkout/          # Formulario de pago y resumen de pedido
│   │   │   ├── layout/            # Header, footer, navegación y logos
│   │   │   └── my-account/        # Tarjetas de servicios activos y credenciales
│   │   ├── layouts/               # Plantillas públicas, de cliente y administrador
│   │   ├── router/                # Vue Router con guards de autenticación y roles
│   │   ├── services/              # Clientes de API con Axios y normalizadores
│   │   ├── stores/                # Estados globales con Pinia (Auth, Carrito)
│   │   ├── types/                 # Definición estricta de tipos TypeScript
│   │   └── views/                 # Vistas de la aplicación
│   ├── public/                    # Portadas oficiales y activos estáticos
│   └── vite.config.ts             # Configuración de compilación con Vite
│
└── StreamStoreBackend/            # API REST Empresarial
    ├── src/
    │   ├── config/                # Base de datos, variables de entorno y Zod
    │   ├── controllers/           # Controladores REST organizados por dominio
    │   ├── database/              # Esquema SQL fuente, migraciones y seeders
    │   ├── interfaces/            # Tipos y contratos del backend
    │   ├── jobs/                  # Tareas programadas con node-cron
    │   ├── middlewares/           # JWT, control de roles (RBAC), validaciones y errores
    │   ├── models/                # Modelos ORM con Sequelize
    │   ├── repositories/          # Capa de acceso a datos con bloqueos transaccionales
    │   ├── routes/                # Endpoints de la API (/api/auth, /api/productos, etc.)
    │   ├── services/              # Reglas de negocio y cifrado
    │   └── utils/                 # Encriptación AES-256-GCM, respuestas API y mailer
    └── .env.example               # Plantilla segura de variables de entorno
```

---

## 💻 Stack Tecnológico

| Capa | Tecnologías |
| :--- | :--- |
| **Frontend** | Vue 3 (Composition API, `<script setup>`), TypeScript, Vite, Tailwind CSS, Pinia, Vue Router, Lucide Icons, Axios |
| **Backend** | Node.js (v18+/v20+), Express 5, TypeScript, Sequelize ORM, Zod, JWT (`jsonwebtoken`), bcryptjs, AES-256-GCM, node-cron, Nodemailer |
| **Base de Datos** | MySQL 8.0+ / MariaDB 10.4+ (soporte nativo de transacciones `SELECT ... FOR UPDATE`) |
| **Documentación** | Swagger UI / OpenAPI 3.0 |

---

## 🔒 Seguridad y Protección de Datos

Este proyecto implementa buenas prácticas de desarrollo seguro para proteger la integridad del sistema:

1. **Variables de Entorno Excluidas**: Los archivos `.env` reales se encuentran estrictamente registrados en el archivo `.gitignore` y **nunca** se suben al repositorio.
2. **Cifrado de Credenciales**: Las contraseñas maestras de cuentas de streaming se cifran en reposo en la base de datos utilizando el estándar **AES-256-GCM**.
3. **Autenticación y Roles (RBAC)**: Tokens JWT firmados con control estricto de roles (`cliente` vs `admin`) en middlewares de backend y navegación protegida en frontend.
4. **Validación Exhaustiva**: Todas las peticiones HTTP entrantes son validadas con esquemas estrictos de **Zod**, previniendo inyecciones y datos malformados.
5. **Aislamiento de Archivos Sensibles**: Scripts locales de configuración, registros (`logs/`) y directorios de carga (`uploads/`) se mantienen fuera del control de versiones.

---

## ⚙️ Requisitos Previos

Antes de comenzar, asegúrate de tener instalado en tu entorno de desarrollo:

- [Node.js](https://nodejs.org/) (versión 18.0.0 o superior recomendada).
- [npm](https://www.npmjs.com/) (incluido con Node.js).
- [MySQL](https://dev.mysql.com/downloads/) o [XAMPP](https://www.apachefriends.org/) con el servicio MySQL activo en el puerto estándar `3306`.
- [Git](https://git-scm.com/).

---

## 🚀 Instalación y Configuración

Sigue estos pasos para poner en marcha el proyecto en tu máquina local:

### 1. Clonar el repositorio
```bash
git clone https://github.com/corredor29/StreamStore.git
cd StreamStore
```

### 2. Instalar todas las dependencias
Desde la raíz del repositorio, ejecuta el script automatizado:
```bash
npm run install:all
```
*(Este comando instalará recursivamente las dependencias del orquestador, de `StreamStoreBackend` y de `StreamStoreFrontend`)*.

---

## 🔑 Variables de Entorno

Configura los archivos de entorno a partir de las plantillas de ejemplo provistas:

### En el Backend (`StreamStoreBackend`):
Copia `.env.example` a `.env`:
```bash
# Windows (PowerShell)
Copy-Item StreamStoreBackend\.env.example StreamStoreBackend\.env

# Linux / macOS
cp StreamStoreBackend/.env.example StreamStoreBackend/.env
```

Edita `StreamStoreBackend/.env` con tus credenciales locales de MySQL:
```env
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Base de datos MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=streamStoreDb
DB_USER=root
DB_PASS=tu_password_aqui

# Seguridad (Reemplaza con secretos seguros generados localmente)
JWT_SECRET=tu_clave_secreta_jwt_para_desarrollo_local
JWT_EXPIRES_IN=7d
AES_SECRET=clave_hexadecimal_de_32_bytes_para_aes_256

# Alertas por Correo (Opcional - Si están vacías, se simula en consola)
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USER=
MAIL_PASS=
MAIL_FROM=StreamStore <no-reply@streamstore.test>
```

### En el Frontend (`StreamStoreFrontend`):
Copia `.env.example` a `.env`:
```bash
# Windows (PowerShell)
Copy-Item StreamStoreFrontend\.env.example StreamStoreFrontend\.env

# Linux / macOS
cp StreamStoreFrontend/.env.example StreamStoreFrontend/.env
```

Contenido base de `StreamStoreFrontend/.env`:
```env
VITE_API_URL=http://localhost:3000/api
VITE_USE_MOCKS=false
```

---

## 🗄️ Base de Datos y Semillas

Con el servicio de MySQL en ejecución, inicializa la base de datos con las tablas y datos de prueba:

```bash
# Crea la base de datos 'streamStoreDb', aplica el esquema y carga datos demo iniciales
npm run db:reset
```

> **Nota:** Si ya tienes una base de datos existente y solo deseas aplicar migraciones incrementales sin borrar los datos existentes, utiliza `npm run migrate`.

---

## 🏃 Ejecución

Inicia la aplicación completa (Frontend y Backend en simultáneo) con un solo comando desde la raíz del proyecto:

```bash
npm run dev
```

Una vez ejecutado:
- 🌐 **Frontend (Tienda & Panel):** [http://localhost:5173](http://localhost:5173)
- ⚙️ **Backend API REST:** [http://localhost:3000/api](http://localhost:3000/api)
- 📖 **Documentación Swagger UI:** [http://localhost:3000/swagger](http://localhost:3000/swagger)

Para detener ambos servidores, presiona `Ctrl + C` en la terminal.

---

## 👥 Cuentas Demo de Prueba

El sistema incluye cuentas precargadas en los datos semilla para pruebas inmediatas:

| Rol | Correo Electrónico | Contraseña Demo | Permisos |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@streamstore.test` | `Admin123*` | Control total del inventario, catálogo, plataformas, métricas y cron |
| **Cliente 1** | `cliente1@streamstore.test` | `Cliente123*` | Compra de cuentas/pantallas, acceso a panel de servicios y renovaciones |
| **Cliente 2** | `cliente2@streamstore.test` | `Cliente123*` | Compra y panel de servicios con alertas de vencimiento próximas |

---

## 🛒 Flujo de Compra y Stock Transaccional

El sistema implementa un motor de inventario diseñado para garantizar **cero sobreventa** concurrente:

1. **Creación de Orden**: `POST /api/compras` crea la orden en estado `pendiente` con los productos del carrito y congela el precio al momento de la compra.
2. **Pago Transaccional**: `POST /api/compras/:id/pagar` ejecuta una transacción atómica protegida con `SELECT ... FOR UPDATE` en MySQL:
   - Bloquea los registros de cuentas y pantallas requeridos.
   - Si no hay suficiente inventario disponible, cancela la operación con un error `409 Conflict` y realiza un `ROLLBACK`.
   - Si el stock es suficiente, asigna las pantallas, crea los registros de servicio para el cliente, descuenta el stock, marca la compra como `pagada` y vacía el carrito del usuario.

---

## 📜 Scripts Disponibles

Ejecutables desde la raíz del proyecto:

| Comando | Acción |
| :--- | :--- |
| `npm run dev` | Inicia en paralelo el servidor Backend (puerto 3000) y el Frontend Vite (puerto 5173) |
| `npm run install:all` | Instala las dependencias en raíz, backend y frontend |
| `npm run build` | Compila frontend y backend verificando tipos TypeScript |
| `npm run db:reset` | Elimina y reconstruye la base de datos con los seeders iniciales |
| `npm run migrate` | Aplica migraciones pendientes de forma idempotente sin borrar datos |
| `npm run lint` | Ejecuta el análisis estático de código en el proyecto |

---

## 📚 Documentación de la API (Swagger & OpenAPI)

El backend expone la especificación completa de la API:
- **Interfaz Interactiva**: Navega a [http://localhost:3000/swagger](http://localhost:3000/swagger) con el backend en ejecución.
- **Especificación OpenAPI 3**: Disponible en formato JSON en [http://localhost:3000/api/docs.json](http://localhost:3000/api/docs.json).

Para probar endpoints protegidos en Swagger:
1. Envía una petición `POST /api/auth/login` con credenciales de prueba.
2. Copia el token devuelto en `data.token`.
3. Haz clic en el botón verde **Authorize** en la parte superior de Swagger UI y pega el token.

---

## 📄 Licencia

Este proyecto está bajo la Licencia [MIT](LICENSE).
