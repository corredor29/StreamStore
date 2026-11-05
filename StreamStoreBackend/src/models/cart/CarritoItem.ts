import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from "sequelize-typescript"
import { FK, ID, tabla } from "../columnas"
import { Carrito } from "./Carrito"
import { Producto } from "../products/Producto"
import { Servicio } from "../orders/Servicio"

@Table(tabla("carrito_items"))
export class CarritoItem extends Model {
    @Column(ID) declare id: number
    @ForeignKey(() => Carrito) @Column(FK) declare carrito_id: number
    @ForeignKey(() => Producto) @Column(FK) declare producto_id: number
    @Column({ type: DataType.INTEGER.UNSIGNED, allowNull: false, defaultValue: 1 }) declare cantidad: number
    @ForeignKey(() => Servicio) @Column({ type: DataType.INTEGER.UNSIGNED }) declare servicio_id: number | null
    @BelongsTo(() => Producto) declare producto: Producto
    @BelongsTo(() => Servicio) declare servicio: Servicio | null
}
