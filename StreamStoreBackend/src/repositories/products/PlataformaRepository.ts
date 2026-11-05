import { QueryTypes, Transaction } from "sequelize"
import { sequelize } from "../../config/database"
import { Plataforma } from "../../models/products/Plataforma"
import { Producto } from "../../models/products/Producto"
import { CreatePlataformaInput, UpdatePlataformaInput } from "../../validators/products/PlataformaValidators"

export class PlataformaRepository {
    findActivas() {
        return Plataforma.findAll({ where: { activo: true }, order: [["nombre", "ASC"]] })
    }

    findAll() {
        return Plataforma.findAll({ order: [["nombre", "ASC"]] })
    }

    findById(id: number) {
        return Plataforma.findByPk(id)
    }

    findByIdConProductosActivos(id: number) {
        return Plataforma.findByPk(id, { include: [{ model: Producto, where: { activo: true }, required: false }] })
    }

    findByNombre(nombre: string) {
        return Plataforma.findOne({ where: { nombre } })
    }

    create(data: CreatePlataformaInput) {
        return Plataforma.create(data)
    }

    update(plataforma: Plataforma, data: UpdatePlataformaInput) {
        return plataforma.update(data)
    }

    lockByIds(ids: number[], t: Transaction) {
        return sequelize.query("SELECT id FROM plataformas WHERE id IN (:ids) ORDER BY id FOR UPDATE", {
            type: QueryTypes.SELECT, replacements: { ids }, transaction: t
        })
    }
}
