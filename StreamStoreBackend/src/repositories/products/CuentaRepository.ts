import { Op, QueryTypes, Transaction } from "sequelize"
import { sequelize } from "../../config/database"
import { Cuenta } from "../../models/products/Cuenta"
import { Pantalla } from "../../models/products/Pantalla"
import { Plataforma } from "../../models/products/Plataforma"
import { CambiosPantalla, NuevaCuenta, NuevaPantalla } from "../../interfaces/products/Cuenta"

const includeInventario = [
    { model: Plataforma, attributes: ["id", "nombre", "portada_url", "max_pantallas"] },
    { model: Pantalla, attributes: ["id", "numero", "perfil", "estado"] }
]

export class CuentaRepository {
    findAll(plataformaId?: number, credenciales?: "asignadas" | "pendientes") {
        return Cuenta.findAll({
            where: {
                ...(plataformaId ? { plataforma_id: plataformaId } : {}),
                ...(credenciales ? { email: credenciales === "pendientes" ? { [Op.is]: null } : { [Op.not]: null } } : {})
            },
            attributes: { exclude: ["password_cifrada"] },
            include: includeInventario,
            order: [["plataforma_id", "ASC"], ["id", "ASC"], ["pantallas", "numero", "ASC"]]
        })
    }

    findById(id: number) {
        return Cuenta.findByPk(id, {
            attributes: { exclude: ["password_cifrada"] },
            include: includeInventario,
            order: [["pantallas", "numero", "ASC"]]
        })
    }

    findEstado(id: number, t: Transaction) {
        return Cuenta.findByPk(id, { attributes: ["id", "estado"], transaction: t })
    }

    findByPlataformaEmail(plataformaId: number, email: string) {
        return Cuenta.findOne({ where: { plataforma_id: plataformaId, email } })
    }

    async createConPantallas(
        cuenta: NuevaCuenta,
        pantallas: NuevaPantalla[],
        t: Transaction
    ) {
        const creada = await Cuenta.create(cuenta, { transaction: t })
        await Pantalla.bulkCreate(pantallas.map((p) => ({ ...p, cuenta_id: creada.id })), { transaction: t })
        return creada.id
    }

    lockPantallasDisponibles(plataformaId: number, limit: number, t: Transaction) {
        return sequelize.query<{ id: number; cuenta_id: number }>(
            `SELECT p.id, p.cuenta_id FROM pantallas p JOIN cuentas c ON c.id = p.cuenta_id
             WHERE c.plataforma_id = :plataformaId AND c.estado = 'disponible' AND p.estado = 'disponible'
             ORDER BY (c.email IS NULL), c.id, p.numero LIMIT :limit FOR UPDATE`,
            { type: QueryTypes.SELECT, replacements: { plataformaId, limit }, transaction: t }
        )
    }

    lockCuentasCompletas(plataformaId: number, limit: number, t: Transaction) {
        return sequelize.query<{ id: number }>(
            `SELECT c.id FROM cuentas c
             WHERE c.plataforma_id = :plataformaId AND c.estado = 'disponible'
               AND NOT EXISTS (SELECT 1 FROM pantallas p WHERE p.cuenta_id = c.id AND p.estado <> 'disponible')
             ORDER BY (c.email IS NULL), c.id LIMIT :limit FOR UPDATE`,
            { type: QueryTypes.SELECT, replacements: { plataformaId, limit }, transaction: t }
        )
    }

    lockPantallasDeCuentas(cuentaIds: number[], t: Transaction) {
        return sequelize.query<{ id: number; cuenta_id: number; estado: string }>(
            "SELECT id, cuenta_id, estado FROM pantallas WHERE cuenta_id IN (:cuentaIds) FOR UPDATE",
            { type: QueryTypes.SELECT, replacements: { cuentaIds }, transaction: t }
        )
    }

    async venderCuentasCompletas(cuentaIds: number[], t: Transaction) {
        await Cuenta.update({ estado: "vendida_completa" }, { where: { id: cuentaIds }, transaction: t })
        await Pantalla.update({ estado: "vendida" }, { where: { cuenta_id: cuentaIds }, transaction: t })
    }

    venderPantallas(pantallaIds: number[], t: Transaction) {
        return Pantalla.update({ estado: "vendida" }, { where: { id: pantallaIds }, transaction: t })
    }

    async idsSinCredenciales(cuentaIds: number[], t: Transaction) {
        if (!cuentaIds.length) return new Set<number>()
        const cuentas = await Cuenta.findAll({
            where: { id: cuentaIds, [Op.or]: [{ email: { [Op.is]: null } }, { password_cifrada: { [Op.is]: null } }] },
            attributes: ["id"], transaction: t
        })
        return new Set(cuentas.map((c) => c.id))
    }

    lockConPantallas(id: number, t: Transaction) {
        return Cuenta.findByPk(id, {
            include: [{ model: Pantalla }],
            order: [["pantallas", "numero", "ASC"]],
            transaction: t, lock: t.LOCK.UPDATE
        })
    }

    existeEmailEnPlataforma(plataformaId: number, email: string, exceptoId: number, t: Transaction) {
        return Cuenta.findOne({ where: { plataforma_id: plataformaId, email, id: { [Op.ne]: exceptoId } }, attributes: ["id"], transaction: t })
    }

    guardarCredenciales(cuenta: Cuenta, email: string, passwordCifrada: string, t: Transaction) {
        return cuenta.update({ email, password_cifrada: passwordCifrada }, { transaction: t })
    }

    actualizarPantalla(pantalla: Pantalla, cambios: CambiosPantalla, t: Transaction) {
        const definidos = Object.fromEntries(Object.entries(cambios).filter(([, v]) => v !== undefined))
        return pantalla.update(definidos, { transaction: t })
    }

    // Inventario vivo (sin cuentas inactivas): una fila agregada calculada en MySQL
    async resumenInventario() {
        const [fila] = await sequelize.query<{
            total: number | string | null
            sin_vender: number | string | null
            pantallas_totales: number | string | null
            pantallas_libres: number | string | null
            sin_credenciales: number | string | null
        }>(
            `SELECT COUNT(*) AS total,
                    COALESCE(SUM(x.libres = x.total_pantallas AND x.total_pantallas > 0), 0) AS sin_vender,
                    COALESCE(SUM(x.total_pantallas), 0) AS pantallas_totales,
                    COALESCE(SUM(x.libres), 0) AS pantallas_libres,
                    COALESCE(SUM(x.email IS NULL OR x.password_cifrada IS NULL), 0) AS sin_credenciales
             FROM (
                SELECT c.id, c.total_pantallas, c.email, c.password_cifrada,
                       COALESCE(SUM(p.estado = 'disponible'), 0) AS libres
                FROM cuentas c LEFT JOIN pantallas p ON p.cuenta_id = c.id
                WHERE c.estado <> 'inactiva'
                GROUP BY c.id, c.total_pantallas, c.email, c.password_cifrada
             ) x`,
            { type: QueryTypes.SELECT }
        )
        const total = Number(fila?.total ?? 0)
        const sinVender = Number(fila?.sin_vender ?? 0)
        return {
            total,
            sin_vender: sinVender,
            vendidas: total - sinVender,
            pantallas_totales: Number(fila?.pantallas_totales ?? 0),
            pantallas_libres: Number(fila?.pantallas_libres ?? 0),
            sin_credenciales: Number(fila?.sin_credenciales ?? 0)
        }
    }
}
