import { Table, Column, Model, ForeignKey, HasMany } from "sequelize-typescript"
import { FK, ID, tabla } from "../columnas"
import { Usuario } from "../users/Usuario"
import { CarritoItem } from "./CarritoItem"

@Table(tabla("carritos"))
export class Carrito extends Model {
    @Column(ID) declare id: number
    @ForeignKey(() => Usuario) @Column({ ...FK, unique: true }) declare usuario_id: number
    @HasMany(() => CarritoItem) declare items: CarritoItem[]
}
