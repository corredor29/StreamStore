import { Transaction } from "sequelize"
import { Combo } from "../../models/promos/Combo"
import { Plataforma } from "../../models/products/Plataforma"
import { CreateComboInput } from "../../validators/promos/ComboValidators"

const conPlataformas = { model: Plataforma, attributes: ["id", "nombre", "logo_url", "portada_url"], through: { attributes: [] } }

type DatosCombo = Omit<Partial<CreateComboInput>, "plataforma_ids">

export class ComboRepository {
    findAll() {
        return Combo.findAll({ include: [conPlataformas], order: [["created_at", "DESC"], ["id", "DESC"]] })
    }

    findById(id: number) {
        return Combo.findByPk(id, { include: [conPlataformas] })
    }

    create(data: DatosCombo, t: Transaction) {
        return Combo.create(data, { transaction: t })
    }

    update(combo: Combo, data: DatosCombo, t: Transaction) {
        return combo.update(data, { transaction: t })
    }

    setPlataformas(combo: Combo, ids: number[], t: Transaction) {
        return combo.$set("plataformas", ids, { transaction: t })
    }

    delete(combo: Combo) {
        return combo.destroy()
    }
}
