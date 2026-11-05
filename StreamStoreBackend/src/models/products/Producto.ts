import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from "sequelize-typescript"
import { FK, ID, tabla } from "../columnas"
import { Plataforma } from "./Plataforma"
import { TipoProducto } from "../../interfaces/products/Producto"

@Table(tabla("productos"))
export class Producto extends Model {
    @Column(ID) declare id: number
    @ForeignKey(() => Plataforma) @Column(FK) declare plataforma_id: number
    @Column({ type: DataType.STRING(150), allowNull: false }) declare nombre: string
    @Column({ type: DataType.ENUM("cuenta_completa", "pantalla"), allowNull: false }) declare tipo: TipoProducto
    @Column({ type: DataType.DECIMAL(12, 2), allowNull: false }) declare precio: string
    @Column({ type: DataType.INTEGER.UNSIGNED, allowNull: false, defaultValue: 30 }) declare duracion_dias: number
    @Column({ type: DataType.INTEGER.UNSIGNED, allowNull: false, defaultValue: 2 }) declare stock_minimo: number
    @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true }) declare activo: boolean
    @BelongsTo(() => Plataforma) declare plataforma: Plataforma
}
