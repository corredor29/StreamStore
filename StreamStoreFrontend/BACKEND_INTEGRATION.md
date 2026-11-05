# StreamStore — Guía de Integración Frontend ↔ Backend

Este documento detalla el contrato de comunicación REST, endpoints acordados y formatos JSON para la integración entre **StreamStoreFrontend** y **StreamStoreBackend**.

---

## 1. Configuración de Entorno

- **Variable de Entorno:** `VITE_API_URL=http://localhost:3000/api`
- **Modo Mocks:** `VITE_USE_MOCKS=false` para conectar directamente con la API real.
- **Autenticación:** Interceptor HTTP centralizado en `src/services/api.ts` que envía automáticamente el token JWT en el encabezado:
  ```http
  Authorization: Bearer <jwt_token>
  ```
- **Manejo de Errores:** Códigos estándar `400` (validación), `401` (sesión expirada / logout automático), `403` (prohibido), `404` (no encontrado), `409` (conflicto de stock) y `500` (error interno).

---

## 2. Endpoints y Contratos JSON

### 2.1. Autenticación

#### `POST /api/auth/register`
* **Payload:**
  ```json
  {
    "nombre": "Juan Pérez",
    "email": "juan@ejemplo.com",
    "password": "Password123!"
  }
  ```
* **Respuesta Esperada (201):**
  ```json
  {
    "token": "eyJhbGciOi...",
    "usuario": {
      "id": 1,
      "nombre": "Juan Pérez",
      "email": "juan@ejemplo.com",
      "rol": "cliente"
    }
  }
  ```

#### `POST /api/auth/login`
* **Payload:**
  ```json
  {
    "email": "juan@ejemplo.com",
    "password": "Password123!"
  }
  ```
* **Respuesta Esperada (200):** Idéntica estructura a register.

#### `GET /api/auth/me`
* **Headers:** `Authorization: Bearer <token>`
* **Respuesta Esperada (200):**
  ```json
  {
    "id": 1,
    "nombre": "Juan Pérez",
    "email": "juan@ejemplo.com",
    "rol": "cliente"
  }
  ```

---

### 2.2. Catálogo

#### `GET /api/plataformas`
* **Respuesta Esperada (200):**
  ```json
  [
    { "id": 1, "nombre": "Netflix", "slug": "netflix", "color": "#E50914", "activa": true },
    { "id": 2, "nombre": "Disney+", "slug": "disney", "color": "#113CCF", "activa": true },
    { "id": 3, "nombre": "Prime Video", "slug": "prime", "color": "#00A8E1", "activa": true },
    { "id": 4, "nombre": "Max", "slug": "max", "color": "#7B2FF7", "activa": true }
  ]
  ```

#### `GET /api/productos`
* **Parámetros de consulta opcionales:** `?plataforma=netflix&tipo=CUENTA_COMPLETA`
* **Respuesta Esperada (200):**
  ```json
  [
    {
      "id": 1,
      "plataformaId": 1,
      "plataforma": { "id": 1, "nombre": "Netflix", "slug": "netflix", "color": "#E50914" },
      "nombre": "Netflix Cuenta Completa",
      "tipo": "CUENTA_COMPLETA",
      "duracionDias": 30,
      "precio": 38000,
      "stock": 3,
      "activo": true
    }
  ]
  ```

---

### 2.3. Carrito

* `GET /api/carrito`: Obtiene los ítems del usuario autenticado.
* `POST /api/carrito`: `{ "productoId": 1, "cantidad": 1 }`
* `PATCH /api/carrito/:itemId`: `{ "cantidad": 2 }`
* `DELETE /api/carrito/:itemId`: Elimina un ítem específico.
* `DELETE /api/carrito`: Vacía el carrito completo.

---

### 2.4. Compras y Pagos

#### `POST /api/compras`
* Crea una orden en estado `PENDIENTE` a partir del carrito del cliente.
* **Respuesta Esperada (201):**
  ```json
  {
    "id": 5001,
    "usuarioId": 1,
    "fecha": "2026-11-05T08:00:00.000Z",
    "total": 38000,
    "estado": "PENDIENTE",
    "detalles": [
      {
        "id": 1,
        "productoId": 1,
        "cantidad": 1,
        "precioUnitario": 38000,
        "subtotal": 38000
      }
    ]
  }
  ```

#### `POST /api/compras/:id/pagar`
* **REGLA DE SEGURIDAD ESTRICTA:** El frontend NUNCA envía número de tarjeta, CVV ni fecha de vencimiento. Solo envía metadatos no sensibles de la simulación:
* **Payload:**
  ```json
  {
    "metodo": "TARJETA",
    "marca": "visa",
    "ultimos4": "4242"
  }
  ```
  *(O para Daviplata: `{ "metodo": "DAVIPLATA", "ultimos4": "4567" }`)*
* **Respuesta Esperada Aprobada (200):**
  ```json
  {
    "aprobado": true,
    "mensaje": "Pago aprobado exitosamente.",
    "compra": {
      "id": 5001,
      "estado": "PAGADA",
      "fechaPago": "2026-11-05T08:05:00.000Z"
    }
  }
  ```

---

### 2.5. Panel de Cliente (Mis Servicios)

#### `GET /api/servicios/mios`
* **Headers:** `Authorization: Bearer <token>`
* **Respuesta Esperada (200):**
  ```json
  [
    {
      "id": 101,
      "compraId": 5001,
      "plataforma": { "id": 1, "nombre": "Netflix", "slug": "netflix", "color": "#E50914" },
      "tipo": "CUENTA_COMPLETA",
      "correoAcceso": "cliente.netflix@streamstore.net",
      "passwordAcceso": "TempPass#2026",
      "perfil": "Todas las pantallas",
      "pin": null,
      "fechaCompra": "2026-11-05T08:05:00.000Z",
      "fechaVencimiento": "2026-12-05T08:05:00.000Z",
      "diasRestantes": 30,
      "estado": "ACTIVO"
    }
  ]
  ```

---

### 2.6. Panel Administrativo

* `GET /api/admin/resumen`: Estadísticas de ventas e inventario (`ventasHoy`, `ventasMes`, `totalCuentas`, `cuentasDisponibles`, `pantallasDisponibles`, `serviciosActivos`).
* `GET /api/admin/cuentas`: Listado de cuentas con pantallas y estado (`DISPONIBLE`, `PARCIAL`, `VENDIDA`, `INACTIVA`).
* `POST /api/admin/cuentas`: Cargar cuenta y configurar pantallas.
* `GET /api/admin/compras`: Registro global de ventas.
* `POST /api/admin/cron/ejecutar`: Ejecución de cron de verificación de vencimientos.
