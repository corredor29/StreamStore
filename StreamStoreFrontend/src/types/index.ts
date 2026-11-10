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
  coverUrl?: string | null
  color?: string | null
  activa: boolean
}

export type TipoProducto = 'CUENTA_COMPLETA' | 'PANTALLA'

export interface Producto {
  id: number
  plataformaId: number
  plataforma?: Pick<Plataforma, 'id' | 'nombre' | 'slug' | 'color' | 'logoUrl' | 'coverUrl'>
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
  metodoPago?: string | null
  referenciaPago?: string | null
  cliente?: { nombre: string; email: string } | null
  detalles: CompraDetalle[]
}

// ---------- Pagos (demostración, sin procesamiento real) ----------

export type MetodoPago = 'TARJETA' | 'NEQUI' | 'DAVIPLATA'

export type MarcaTarjeta = 'visa' | 'mastercard' | 'amex' | 'generic'

export type CardKind = 'debito'

export type CardBank = 'nu' | 'bancolombia' | 'generica' | 'bbva'

export type CardBankSkin = 'streamstore' | 'nu' | 'bancolombia' | 'generica' | 'falabella' | 'bbva'

export interface CardBankOption {
  id: CardBankSkin
  label: string
  hint: string
  accent: string
  badgeBg: string
}

export const CARD_BANKS: {
  id: CardBank
  label: string
  hint: string
  accent: string
}[] = [
  { id: 'generica', label: 'GENÉRICA', hint: 'Auto-detecta', accent: '#00ece0' },
  { id: 'nu', label: 'NU BANK', hint: 'Morada', accent: '#820AD1' },
  { id: 'bancolombia', label: 'BANCOLOMBIA', hint: 'Amarilla', accent: '#FFDD00' },
  { id: 'bbva', label: 'BBVA', hint: 'Azul', accent: '#004481' },
]

export const CARD_BANK_SKINS: CardBankOption[] = [
  { id: 'streamstore', label: 'StreamStore', hint: 'Dark Cyber', accent: '#06b6d4', badgeBg: 'bg-cyan-500/20 text-cyan-300' },
  { id: 'nu', label: 'Nu', hint: 'Morada Gold', accent: '#820AD1', badgeBg: 'bg-purple-600/20 text-purple-300' },
  { id: 'bancolombia', label: 'Bancolombia', hint: 'Amarilla', accent: '#FFDD00', badgeBg: 'bg-yellow-500/20 text-yellow-300' },
  { id: 'falabella', label: 'Falabella CMR', hint: 'Verde', accent: '#2E7D32', badgeBg: 'bg-emerald-600/20 text-emerald-300' },
  { id: 'bbva', label: 'BBVA', hint: 'Azul Aqua', accent: '#004481', badgeBg: 'bg-blue-600/20 text-blue-300' },
]

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
  perfiles?: { numero: number; perfil: string; pin: string }[]
  fechaCompra: string
  fechaVencimiento: string
  diasRestantes: number
  estado: EstadoServicio
}

// ---------- Entregas (admin) ----------

export type EstadoEntrega = 'ENTREGADO' | 'PENDIENTE'

export interface PantallaCredencial {
  numero: number
  perfil: string
  pin: string
}

export interface ServicioAdmin {
  id: number
  compraId: number
  tipo: TipoProducto
  estado: EstadoServicio
  estadoEntrega: EstadoEntrega
  entregadoAt: string | null
  fechaInicio: string
  fechaVencimiento: string
  diasRestantes: number
  producto: string
  plataforma: string
  cliente: { id: number; nombre: string; email: string } | null
  cuentaId: number
  cuentaTieneCredenciales: boolean
  pantallasCuenta: PantallaCredencial[]
  credenciales: { email: string; password: string; pantallas: PantallaCredencial[] } | null
}

export interface EntregarCredencialesPayload {
  email?: string
  password?: string
  pin?: string
  perfil?: string
  pantallas?: { numero: number; pin?: string; perfil?: string }[]
  notificar: boolean
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
  plataforma?: Pick<Plataforma, 'id' | 'nombre' | 'slug' | 'coverUrl' | 'color'>
  correo?: string | null
  coverUrl?: string | null
  credencialesPendientes?: boolean
  estado: EstadoCuenta
  totalPantallas: number
  pantallasDisponibles: number
  pantallas: Pantalla[]
}

export interface CrearPlataformaPayload {
  nombre: string
  coverUrl?: string | null
  coverFile?: File
  color?: string
  maxPantallas?: number
}

export interface ProductoCatalogo {
  id: number
  precio: number
  duracionDias: number
  nombre: string
  activo: boolean
}

export interface CrearCuentaPayload {
  plataformaId?: number
  nombrePlataforma?: string
  coverUrl?: string | null
  coverFile?: File
  correo?: string
  password?: string
  /** Precio del producto «cuenta completa» */
  precio?: number
  /** Precio del producto «1 pantalla» */
  precioPantalla?: number
  duracionDias?: number
  totalPantallas?: number
  pantallas?: Array<{ perfil: string; pin?: string }>
  esCombo?: boolean
  comboPlataformaIds?: number[]
  comboNombre?: string
  comboPrecio?: number
}

export interface ResumenAdmin {
  pantallasTotales?: number
  cuentasSinCredenciales?: number
  entregasPendientes?: number
  /** true si las cifras vienen del backend (fuente de verdad) */
  desdeServidor?: boolean
  ventasHoy: number
  ventasMes: number
  totalCuentas: number
  cuentasDisponibles: number
  pantallasDisponibles: number
  serviciosActivos: number
}

// ---------- Promociones y Combos Multi-Plataforma ----------

export interface ComboPromo {
  id: number
  nombre: string
  descripcion?: string | null
  plataformas: Array<{ id: number; nombre: string; slug: string; color?: string | null; logoUrl?: string | null }>
  precioPromo: number
  precioRegular: number
  pantallasPorPlataforma: number
  duracionDias: number
  etiquetaPromo: string
  imagenUrl?: string | null
  plantilla?: string | null
  activo: boolean
  creadoEn?: string
}

export interface CrearComboPayload {
  nombre: string
  descripcion?: string
  plataformaIds: number[]
  precioPromo: number
  precioRegular: number
  pantallasPorPlataforma: number
  duracionDias: number
  etiquetaPromo: string
  imagenUrl?: string | null
  plantilla?: string | null
  imagenFile?: File | null
  activo?: boolean
}

// ---------- Utilidades ----------

export interface ApiError {
  status: number
  message: string
  code?: string
  details?: unknown
}
