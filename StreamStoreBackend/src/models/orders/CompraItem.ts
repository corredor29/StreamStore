import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from "sequelize-typescript"
import { FK, ID, tabla } from "../columnas"
import { Compra } from "./Compra"
import { Producto } from "../products/Producto"
import { Servicio } from "./Servicio"

@Table(tabla("compra_items"))
export class CompraItem extends Model {
    @Column(ID) declare id: number
    @ForeignKey(() => Compra) @Column(FK) declare compra_id: number
    @ForeignKey(() => Producto) @Column(FK) declare producto_id: number
    @Column({ type: DataType.INTEGER.UNSIGNED, allowNull: false }) declare cantidad: number
    @Column({ type: DataType.DECIMAL(12, 2), allowNull: false }) declare precio_unitario: string
    @Column({ type: DataType.DECIMAL(12, 2), allowNull: false }) declare subtotal: string
    @ForeignKey(() => Servicio) @Column({ type: DataType.INTEGER.UNSIGNED }) declare servicio_id: number | null
    @BelongsTo(() => Producto) declare producto: Producto
}
