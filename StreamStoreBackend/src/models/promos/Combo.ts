import { Table, Column, Model, DataType, BelongsToMany } from "sequelize-typescript"
import { ID, tabla } from "../columnas"
import { Plataforma } from "../products/Plataforma"
import { ComboPlataforma } from "./ComboPlataforma"

@Table(tabla("combos"))
export class Combo extends Model {
    @Column(ID) declare id: number
    @Column({ type: DataType.STRING(120), allowNull: false }) declare nombre: string
    @Column({ type: DataType.STRING(255) }) declare descripcion: string | null
    @Column({ type: DataType.DECIMAL(12, 2), allowNull: false }) declare precio_promo: string
    @Column({ type: DataType.DECIMAL(12, 2), allowNull: false }) declare precio_regular: string
    @Column({ type: DataType.INTEGER.UNSIGNED, allowNull: false, defaultValue: 1 }) declare pantallas_por_plataforma: number
    @Column({ type: DataType.INTEGER.UNSIGNED, allowNull: false, defaultValue: 30 }) declare duracion_dias: number
    @Column({ type: DataType.STRING(40), allowNull: false }) declare etiqueta_promo: string
    @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true }) declare activo: boolean
    @BelongsToMany(() => Plataforma, () => ComboPlataforma) declare plataformas: Plataforma[]
}
