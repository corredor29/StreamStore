// Contratos de datos del frontend.
// IMPORTANTE: los nombres de campos deben confirmarse con el JSON real del backend.

export type Rol = 'cliente' | 'admin'

export interface Usuario {
  id: number
  nombre: string
  email: string
  rol: Rol
}

export interface AuthResponse {
  token: string
  usuario: Usuario
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  nombre: string
  email: string
  password: string
}

// ---------- Catálogo ----------

export interface Plataforma {
  id: number
  nombre: string
  slug: string
  logoUrl?: string | null
  color?: string | null
  activa: boolean
}

export type TipoProducto = 'CUENTA_COMPLETA' | 'PANTALLA'

export interface Producto {
  id: number
  plataformaId: number
  plataforma?: Pick<Plataforma, 'id' | 'nombre' | 'slug' | 'color' | 'logoUrl'>
  nombre: string
  tipo: TipoProducto
  duracionDias: number
  precio: number
  stock: number
  descripcion?: string | null
  activo: boolean
}

export interface ProductoFiltros {
  plataforma?: string | number
  tipo?: TipoProducto
}

// ---------- Carrito ----------

export interface CarritoItem {
  id: number
  productoId: number
  producto: Producto
  cantidad: number
  subtotal: number
}

export interface Carrito {
  items: CarritoItem[]
  total: number
}

export interface AgregarCarritoPayload {
  productoId: number
  cantidad: number
}

// ---------- Compras ----------

export type EstadoCompra = 'PENDIENTE' | 'PAGADA' | 'RECHAZADA' | 'CANCELADA'

export interface CompraDetalle {
  id: number
  productoId: number
  producto?: Producto
  cantidad: number
  precioUnitario: number
  subtotal: number
}

export interface Compra {
  id: number
  usuarioId: number
  fecha: string
  fechaPago?: string | null
  total: number
  estado: EstadoCompra
  detalles: CompraDetalle[]
}

// ---------- Pagos (demostración, sin procesamiento real) ----------

export type MetodoPago = 'TARJETA' | 'DAVIPLATA'

export type MarcaTarjeta = 'visa' | 'mastercard' | 'amex' | 'generic'

/**
 * Payload enviado al backend al pagar. Nunca incluye número completo, CVV
 * ni fecha de vencimiento: solo metadatos no sensibles de la simulación.
 */
export interface PagoPayload {
  metodo: MetodoPago
  marca?: MarcaTarjeta
  ultimos4?: string
}

export interface PagoResultado {
  compra: Compra
  aprobado: boolean
  mensaje?: string
}

// ---------- Servicios ----------

export type EstadoServicio = 'ACTIVO' | 'POR_VENCER' | 'VENCIDO'

export interface Servicio {
  id: number
  compraId: number
  plataforma: Pick<Plataforma, 'id' | 'nombre' | 'slug' | 'color' | 'logoUrl'>
  tipo: TipoProducto
  correoAcceso: string
  passwordAcceso: string
  perfil?: string | null
  pin?: string | null
  fechaCompra: string
  fechaVencimiento: string
  diasRestantes: number
  estado: EstadoServicio
}

// ---------- Administración ----------

export type EstadoCuenta = 'DISPONIBLE' | 'PARCIAL' | 'VENDIDA' | 'INACTIVA'
export type EstadoPantalla = 'DISPONIBLE' | 'VENDIDA'

export interface Pantalla {
  id: number
  numero: number
  perfil: string
  pin?: string | null
  estado: EstadoPantalla
}

export interface CuentaAdmin {
  id: number
  plataformaId: number
  plataforma?: Pick<Plataforma, 'id' | 'nombre' | 'slug'>
  correo: string
  estado: EstadoCuenta
  totalPantallas: number
  pantallasDisponibles: number
  pantallas: Pantalla[]
}

export interface CrearCuentaPayload {
  plataformaId: number
  correo: string
  password: string
  pantallas: Array<{ perfil: string; pin?: string }>
}

export interface ResumenAdmin {
  ventasHoy: number
  ventasMes: number
  totalCuentas: number
  cuentasDisponibles: number
  pantallasDisponibles: number
  serviciosActivos: number
}

// ---------- Utilidades ----------

export interface ApiError {
  status: number
  message: string
  code?: string
  details?: unknown
}
