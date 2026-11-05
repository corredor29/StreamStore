import { Op, Transaction } from "sequelize"
import { Cuenta } from "../../models/products/Cuenta"
import { Pantalla } from "../../models/products/Pantalla"
import { Plataforma } from "../../models/products/Plataforma"
import { Producto } from "../../models/products/Producto"
import { Servicio } from "../../models/orders/Servicio"
import { Usuario } from "../../models/users/Usuario"
import { EstadoEntrega, FlagsAlerta, NuevoServicio } from "../../interfaces/orders/Servicio"

const includeResumen = [
    { model: Producto, attributes: ["id", "nombre", "tipo"] },
    { model: Cuenta, attributes: ["id", "plataforma_id"], include: [{ model: Plataforma, attributes: ["id", "nombre"] }] }
]

const includeCredenciales = [
    { model: Producto, attributes: ["id", "nombre", "tipo"] },
    {
        model: Cuenta,
        attributes: ["id", "plataforma_id", "email", "password_cifrada"],
        include: [{ model: Plataforma, attributes: ["id", "nombre"] }, { model: Pantalla, attributes: ["id", "numero", "perfil", "pin"] }]
    },
    { model: Pantalla, attributes: ["id", "numero", "perfil", "pin"] }
]

const includeAlerta = [{ model: Usuario, attributes: ["id", "nombre", "email"] }, ...includeResumen]

export class ServicioRepository {
    findByUsuarioConCredenciales(usuarioId: number) {
        return Servicio.findAll({ where: { usuario_id: usuarioId }, include: includeCredenciales, order: [["fecha_vencimiento", "ASC"]] })
    }

    findAllConUsuario(entrega?: EstadoEntrega) {
        return Servicio.findAll({
            where: entrega ? { estado_entrega: entrega } : {},
            include: [...includeResumen, { model: Usuario, attributes: ["id", "nombre", "email"] }],
            order: [["fecha_vencimiento", "ASC"]]
        })
    }

    findConCredencialesYUsuario(id: number) {
        return Servicio.findByPk(id, { include: [...includeCredenciales, { model: Usuario, attributes: ["id", "nombre", "email"] }] })
    }

    marcarEntregado(servicio: Servicio, t: Transaction) {
        return servicio.update({ estado_entrega: "entregado", entregado_at: new Date() }, { transaction: t })
    }

    findConCredenciales(id: number, usuarioId?: number) {
        return Servicio.findOne({ where: usuarioId ? { id, usuario_id: usuarioId } : { id }, include: includeCredenciales })
    }

    bulkCreate(servicios: NuevoServicio[], t: Transaction) {
        return Servicio.bulkCreate(servicios, { transaction: t })
    }

    findDelUsuario(id: number, usuarioId: number) {
        return Servicio.findOne({ where: { id, usuario_id: usuarioId } })
    }

    lockById(id: number, t: Transaction) {
        return Servicio.findByPk(id, { transaction: t, lock: t.LOCK.UPDATE })
    }

    findRenovacionDe(servicioId: number, t?: Transaction) {
        return Servicio.findOne({ where: { renovacion_de_id: servicioId }, attributes: ["id"], transaction: t })
    }

    cerrarAlertas(servicio: Servicio, t: Transaction) {
        return servicio.update({ alerta_3d_enviada: true, alerta_1d_enviada: true, alerta_vencido_enviada: true }, { transaction: t })
    }

    marcarVencidos(ahora: Date) {
        return Servicio.update({ estado: "vencido" }, { where: { estado: "activo", fecha_vencimiento: { [Op.lte]: ahora } } })
    }

    findPendientesDeAviso(hasta: Date) {
        return Servicio.findAll({
            where: { alerta_vencido_enviada: false, fecha_vencimiento: { [Op.lte]: hasta } },
            include: includeAlerta,
            order: [["fecha_vencimiento", "ASC"]]
        })
    }

    marcarAlerta(servicio: Servicio, flags: FlagsAlerta) {
        return servicio.update(flags)
    }
}
