# 🖥️ StreamStore Frontend

Aplicación web Single Page Application (SPA) desarrollada con **Vue 3**, **TypeScript**, **Vite** y **Tailwind CSS** para la plataforma StreamStore.

---

## 🚀 Tecnologías

- **Framework**: [Vue 3](https://vuejs.org/) (Composition API con sintaxis `<script setup>`).
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/) con verificación estricta (`vue-tsc`).
- **Empaquetador**: [Vite](https://vitejs.dev/) para recarga instantánea en desarrollo (HMR) y empaquetado optimizado para producción.
- **Estilos**: [Tailwind CSS v3](https://tailwindcss.com/) con diseño moderno en modo oscuro.
- **Gestión de Estado**: [Pinia](https://pinia.vuejs.org/) para manejo reactivo de sesión (`auth`) y carrito de compras (`cart`).
- **Enrutamiento**: [Vue Router 4](https://router.vuejs.org/) con guards de navegación y control de acceso por roles.
- **Iconografía**: [Lucide Vue Next](https://lucide.dev/) para iconos SVG limpios y optimizados.
- **Cliente HTTP**: [Axios](https://axios-http.com/) con interceptores de autenticación y manejo tipado de respuestas.

---

## 📁 Estructura del Código Fuente (`src/`)

```
src/
├── assets/                  # Estilos CSS globales y logotipos
├── components/
│   ├── admin/               # Tablas, métricas KPI y modales del panel de control
│   │   ├── AccountsTable.vue          # Tabla de cuentas con paginación interactiva
│   │   ├── AccountCreateModal.vue     # Modal para registrar cuentas maestras
│   │   ├── PlatformCreateModal.vue    # Modal para registrar plataformas
│   │   ├── AdminSummaryCards.vue      # Tarjetas de resumen ejecutivo
│   │   ├── AdminSalesTable.vue        # Registro y filtros de compras
│   │   └── AdminServicesTable.vue     # Servicios asignados a clientes
│   ├── catalog/             # Tarjetas de productos, carruseles y filtros
│   ├── checkout/            # Proceso de pago y confirmación
│   ├── common/              # Modales, alertas y spinners reutilizables
│   ├── layout/              # Header, footer, logos y navegación
│   └── my-account/          # Gestión de servicios del cliente y credenciales
├── layouts/                 # Plantillas de diseño (Público, Cliente, Administrador)
├── router/                  # Definición de rutas protegidas y públicas
├── services/                # Servicios de comunicación con el backend REST
├── stores/                  # Stores de Pinia (auth, cart)
├── types/                   # Tipos e interfaces TypeScript del dominio
└── views/                   # Vistas principales de la aplicación
```

---

## 🛠️ Desarrollo Local

Desde la carpeta `StreamStoreFrontend`:

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción (con verificación de tipos)
npm run build

# Previsualizar la compilación de producción
npm run preview
```

El servidor local se iniciará en `http://localhost:5173`.
