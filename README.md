# 🚀 StreamStore — Digital Entertainment Universe

Plataforma integral de comercio electrónico para la venta y gestión de suscripciones de streaming (Netflix, Disney+, Max, Prime Video, Spotify, Crunchyroll, Paramount+, Apple TV+) con entrega automatizada de credenciales, perfiles privados con PIN y panel de cliente y administrador.

---

## 🛠️ Requisitos Previos

- **Node.js**: v18+ o v20+ instalado.
- **MySQL / MariaDB**: Recomendado (vía XAMPP, Docker o servicio local).
  - *Nota:* Si no tienes MySQL instalado, el frontend cuenta con soporte completo de **Mocks tipados** activable desde `.env`.

---

## ⚡ Guía Rápida de Inicio (1 Minuto)

### 1. Clonar el repositorio
```bash
git clone https://github.com/corredor29/StreamStore.git
cd StreamStore
```

### 2. Instalar dependencias en ambos proyectos
Desde la raíz del proyecto, ejecuta el comando que instala todo automáticamente:
```bash
npm run install:all
```

### 3. Configurar Variables de Entorno

**En el Backend (`StreamStoreBackend`):**
Copia el archivo de ejemplo y ajusta si es necesario tu usuario/contraseña de MySQL:
```bash
# En Windows (PowerShell):
Copy-Item StreamStoreBackend\.env.example StreamStoreBackend\.env

# En Linux / macOS:
cp StreamStoreBackend/.env.example StreamStoreBackend/.env
```

**En el Frontend (`StreamStoreFrontend`):**
```bash
# En Windows (PowerShell):
Copy-Item StreamStoreFrontend\.env.example StreamStoreFrontend\.env

# En Linux / macOS:
cp StreamStoreFrontend/.env.example StreamStoreFrontend/.env
```

*(Si no usas MySQL, en `StreamStoreFrontend/.env` pon `VITE_USE_MOCKS=true`)*.

---

### 4. Inicializar Base de Datos (Opcional si usas MySQL)
Crea las tablas y carga los datos de prueba iniciales (cuentas, productos y usuarios demo):
```bash
npm run db:reset
```

---

### 5. Iniciar Frontend y Backend Juntos
Desde la raíz del proyecto:
```bash
npm run dev
```

Esto levantará automáticamente:
- **Frontend (Vite + Vue 3):** [http://localhost:5173](http://localhost:5173)
- **Backend API (Express 5 + MySQL):** [http://localhost:3000/api](http://localhost:3000/api)
- **Documentación Swagger:** [http://localhost:3000/swagger](http://localhost:3000/swagger)

*(Para detener ambos procesos pulsa `Ctrl + C` en la terminal)*.

---

## 🔑 Cuentas Demo de Prueba

| Rol | Correo Electrónico | Contraseña | Acceso |
| :--- | :--- | :--- | :--- |
| **Cliente** | `cliente1@streamstore.test` | `Cliente123*` | Panel de Cliente, Mis Servicios, Compras |
| **Administrador** | `admin@streamstore.test` | `Admin123*` | Panel de Administración, Inventario, Ventas |

---

## 📁 Estructura del Proyecto

```
StreamStore/
├── package.json             # Scripts de orquestación monorepo
├── run_all.js               # Runner que levanta Frontend y Backend juntos
│
├── StreamStoreFrontend/     # SPA con Vue 3 + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── components/      # Componentes (catálogo, cuenta, checkout, admin, layout)
│   │   ├── views/           # Vistas (Home, Catálogo, Mi Cuenta, Checkout, Admin)
│   │   ├── services/        # Clientes HTTP y normalizadores de datos
│   │   ├── stores/          # Estado global con Pinia (Auth, Carrito)
│   │   └── types/           # Interfaces y tipos TypeScript
│   └── public/              # Logos oficiales y fotos cinemáticas de streaming
│
└── StreamStoreBackend/      # API REST con Node.js + Express + Sequelize
    ├── src/
    │   ├── controllers/     # Controladores por dominio (Auth, Productos, Pedidos, etc.)
    │   ├── database/        # Migraciones y seeders para MySQL
    │   ├── models/          # Modelos Sequelize
    │   ├── routes/          # Enrutamiento de la API REST
    │   └── services/        # Lógica de negocio, cifrado AES-256 y alertas automáticas
    └── .env.example         # Plantilla de variables de entorno del servidor
```

---

## 📦 Scripts Disponibles en la Raíz

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia frontend y backend simultáneamente en vivo |
| `npm run install:all` | Instala dependencias de `StreamStoreBackend` y `StreamStoreFrontend` |
| `npm run build` | Compila frontend y backend para producción verificando tipos |
| `npm run db:reset` | Ejecuta las migraciones y llena la base de datos con datos demo |
| `npm run migrate` | Ejecuta las migraciones pendientes en MySQL |
