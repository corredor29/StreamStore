import crypto from "crypto"
import { withTransaction } from "../../config/database"
import { Compra } from "../../models/orders/Compra"
import { CarritoRepository } from "../../repositories/cart/CarritoRepository"
import { CompraRepository } from "../../repositories/orders/CompraRepository"
import { CuentaRepository } from "../../repositories/products/CuentaRepository"
import { PlataformaRepository } from "../../repositories/products/PlataformaRepository"
import { ProductoRepository } from "../../repositories/products/ProductoRepository"
import { ServicioRepository } from "../../repositories/orders/ServicioRepository"
import { NuevoServicio } from "../../interfaces/orders/Servicio"
import { ResumenPlataforma } from "../../interfaces/orders/Compra"
import { HttpError } from "../../utils/httpError"
import { logger } from "../../utils/logger"
import { sendMail } from "../../utils/mailer"
import { ListComprasQuery } from "../../validators/orders/CompraValidators"
import { correoConfirmacionCompra } from "./CorreoCompra"

const DAY = 24 * 60 * 60 * 1000

export class CompraService {
    constructor(
        private readonly repository: CompraRepository,
        private readonly carritoRepository: CarritoRepository,
        private readonly cuentaRepository: CuentaRepository,
        private readonly plataformaRepository: PlataformaRepository,
        private readonly servicioRepository: ServicioRepository,
        private readonly productoRepository: ProductoRepository
    ) {}

    async crearPendiente(usuarioId: number, metodoPago: string) {
        const compraId = await withTransaction(async (t) => {
            const carrito = await this.carritoRepository.lockByUsuario(usuarioId, t)
            const items = carrito ? await this.carritoRepository.findItems(carrito.id, t) : []
            if (!items.length) throw new HttpError("El carrito está vacío", 400)
            const inactivo = items.find((i) => !i.producto?.activo)
            if (inactivo) throw new HttpError(`El producto "${inactivo.producto?.nombre ?? inactivo.producto_id}" ya no está disponible`, 409)
            await this.repository.cancelarPendientes(usuarioId, t)
            const lineas = items.map((i) => ({
                producto_id: i.producto_id, cantidad: i.cantidad, servicio_id: i.servicio_id,
                precio_unitario: i.producto.precio, subtotal: Number(i.producto.precio) * i.cantidad
            }))
            const total = lineas.reduce((a, l) => a + l.subtotal, 0)
            return this.repository.createConItems({ usuario_id: usuarioId, total, metodo_pago: metodoPago }, lineas, t)
        })
        return this.getById(usuarioId, compraId)
    }

    async pagar(usuarioId: number, compraId: number, metodoPago?: string) {
        await withTransaction(async (t) => {
            const carrito = await this.carritoRepository.lockByUsuario(usuarioId, t)
            const compra = await this.repository.lockDelUsuario(compraId, usuarioId, t)
            if (!compra) throw new HttpError("Compra no encontrada", 404)
            if (compra.estado !== "pendiente") throw new HttpError(`La compra ya está ${compra.estado}`, 409)
            const items = await this.repository.findItemsConProducto(compra.id, t)
            if (!items.length) throw new HttpError("La compra no tiene ítems", 400)
            const inactivo = items.find((i) => !i.producto?.activo)
            if (inactivo) throw new HttpError(`El producto "${inactivo.producto?.nombre ?? inactivo.producto_id}" ya no está disponible`, 409)

            const nuevos = items.filter((i) => i.servicio_id === null)
            const renovaciones = items.filter((i) => i.servicio_id !== null)
            if (nuevos.length) await this.plataformaRepository.lockByIds([...new Set(nuevos.map((i) => i.producto.plataforma_id))], t)

            const ahora = new Date()
            const servicios: NuevoServicio[] = []
            for (const item of renovaciones) {
                const p = item.producto
                const original = await this.servicioRepository.lockById(item.servicio_id!, t)
                if (!original || original.usuario_id !== usuarioId) throw new HttpError("El servicio a renovar no existe", 409)
                if (await this.servicioRepository.findRenovacionDe(original.id, t)) throw new HttpError(`El servicio #${original.id} ya fue renovado`, 409)
                const cuenta = await this.cuentaRepository.findEstado(original.cuenta_id, t)
                if (!cuenta || cuenta.estado === "inactiva")
                    throw new HttpError(`La cuenta del servicio #${original.id} ya no está disponible; compra un servicio nuevo`, 409)
                const inicio = new Date(Math.max(ahora.getTime(), new Date(original.fecha_vencimiento).getTime()))
                servicios.push({
                    usuario_id: usuarioId, compra_id: compra.id, producto_id: p.id, tipo: p.tipo,
                    cuenta_id: original.cuenta_id, pantalla_id: original.pantalla_id, renovacion_de_id: original.id,
                    fecha_inicio: inicio, fecha_vencimiento: new Date(inicio.getTime() + p.duracion_dias * DAY)
                })
                await this.servicioRepository.cerrarAlertas(original, t)
            }
            const ordenados = [...nuevos].sort((a, b) =>
                a.producto.tipo === b.producto.tipo ? 0 : a.producto.tipo === "cuenta_completa" ? -1 : 1)
            for (const item of ordenados) {
                const p = item.producto
                const base = {
                    usuario_id: usuarioId, compra_id: compra.id, producto_id: p.id, tipo: p.tipo,
                    fecha_inicio: ahora, fecha_vencimiento: new Date(ahora.getTime() + p.duracion_dias * DAY)
                }
                const agotado = (disponible: number) =>
                    new HttpError(`Stock insuficiente para "${p.nombre}" (disponible: ${disponible})`, 409, { producto_id: p.id, disponible })
                if (p.tipo === "cuenta_completa") {
                    const cuentas = await this.cuentaRepository.lockCuentasCompletas(p.plataforma_id, item.cantidad, t)
                    if (cuentas.length < item.cantidad) throw agotado(cuentas.length)
                    const ids = cuentas.map((c) => c.id)
                    const pantallas = await this.cuentaRepository.lockPantallasDeCuentas(ids, t)
                    if (pantallas.some((x) => x.estado !== "disponible")) throw new HttpError(`El stock de "${p.nombre}" cambió, intenta de nuevo`, 409)
                    await this.cuentaRepository.venderCuentasCompletas(ids, t)
                    ids.forEach((cuenta_id) => servicios.push({ ...base, cuenta_id, pantalla_id: null }))
                } else {
                    const pantallas = await this.cuentaRepository.lockPantallasDisponibles(p.plataforma_id, item.cantidad, t)
                    if (pantallas.length < item.cantidad) throw agotado(pantallas.length)
                    await this.cuentaRepository.venderPantallas(pantallas.map((x) => x.id), t)
                    pantallas.forEach((x) => servicios.push({ ...base, cuenta_id: x.cuenta_id, pantalla_id: x.id }))
                }
            }
            const sinCredenciales = await this.cuentaRepository.idsSinCredenciales([...new Set(servicios.map((s) => s.cuenta_id))], t)
            for (const s of servicios) {
                const pendiente = sinCredenciales.has(s.cuenta_id)
                s.estado_entrega = pendiente ? "pendiente_asignacion" : "entregado"
                s.entregado_at = pendiente ? null : ahora
            }
            await this.servicioRepository.bulkCreate(servicios, t)
            await this.repository.marcarPagada(compra, {
                metodo_pago: metodoPago ?? compra.metodo_pago,
                pagada_at: ahora,
                referencia_pago: `SIM-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`
            }, t)
            if (carrito) await this.carritoRepository.vaciar(carrito.id, t)
        })
        const compra = await this.getById(usuarioId, compraId)
        this.enviarConfirmacion(compra)
        return compra
    }

    private enviarConfirmacion(compra: Compra) {
        if (!compra.usuario?.email) return
        const { asunto, cuerpo } = correoConfirmacionCompra(compra)
        sendMail(compra.usuario.email, asunto, cuerpo)
            .catch((e) => logger.error(`No se pudo enviar la confirmación de la compra #${compra.id}: ${e instanceof Error ? e.message : e}`))
    }

    listMias(usuarioId: number) {
        return this.repository.findAll(usuarioId)
    }

    listTodas(filtros: ListComprasQuery) {
        return this.repository.findAll(undefined, filtros)
    }

    async getById(usuarioId: number, id: number, esAdmin = false) {
        const compra = await this.repository.findById(id, esAdmin ? undefined : usuarioId)
        if (!compra) throw new HttpError("Compra no encontrada", 404)
        return compra
    }

    async resumen() {
        const ahora = new Date()
        const inicioDia = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate())
        const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1)
        const [hoy, mes, historico, pendientes, ventasPorProducto, productos] = await Promise.all([
            this.repository.totalPagadas(inicioDia),
            this.repository.totalPagadas(inicioMes),
            this.repository.totalPagadas(),
            this.repository.contarPorEstado("pendiente"),
            this.repository.ventasPorProducto(),
            this.productoRepository.findAll({})
        ])
        const ventas = new Map(ventasPorProducto.map((v) => [Number(v.producto_id), v]))
        const stock = await this.productoRepository.stockMap(productos.map((p) => p.id))
        const porPlataforma = new Map<number, ResumenPlataforma>()
        for (const p of productos) {
            const entry = porPlataforma.get(p.plataforma_id)
                ?? { plataforma_id: p.plataforma_id, plataforma: p.plataforma?.nombre ?? "", unidades_vendidas: 0, total_ventas: 0, productos: [] }
            const v = ventas.get(p.id)
            const unidades = Number(v?.unidades ?? 0)
            const total = Number(v?.total ?? 0)
            entry.unidades_vendidas += unidades
            entry.total_ventas += total
            entry.productos.push({
                producto_id: p.id, nombre: p.nombre, tipo: p.tipo, stock: stock.get(p.id) ?? 0,
                stock_minimo: p.stock_minimo, unidades_vendidas: unidades, total_ventas: total
            })
            porPlataforma.set(p.plataforma_id, entry)
        }
        return { hoy, mes, historico, pendientes, por_plataforma: [...porPlataforma.values()] }
    }
}
