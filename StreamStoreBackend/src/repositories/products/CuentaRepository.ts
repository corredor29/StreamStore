import { QueryTypes, Transaction } from "sequelize"
import { sequelize } from "../../config/database"
import { Cuenta } from "../../models/products/Cuenta"
import { Pantalla } from "../../models/products/Pantalla"
import { Plataforma } from "../../models/products/Plataforma"
import { NuevaCuenta, NuevaPantalla } from "../../interfaces/products/Cuenta"

const includeInventario = [
    { model: Plataforma, attributes: ["id", "nombre"] },
    { model: Pantalla, attributes: ["id", "numero", "perfil", "estado"] }
]

export class CuentaRepository {
    findAll(plataformaId?: number) {
        return Cuenta.findAll({
            where: plataformaId ? { plataforma_id: plataformaId } : {},
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
             ORDER BY c.id, p.numero LIMIT :limit FOR UPDATE`,
            { type: QueryTypes.SELECT, replacements: { plataformaId, limit }, transaction: t }
        )
    }

    lockCuentasCompletas(plataformaId: number, limit: number, t: Transaction) {
        return sequelize.query<{ id: number }>(
            `SELECT c.id FROM cuentas c
             WHERE c.plataforma_id = :plataformaId AND c.estado = 'disponible'
               AND NOT EXISTS (SELECT 1 FROM pantallas p WHERE p.cuenta_id = c.id AND p.estado <> 'disponible')
             ORDER BY c.id LIMIT :limit FOR UPDATE`,
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
}
