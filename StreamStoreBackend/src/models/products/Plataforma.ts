import { Table, Column, Model, DataType, HasMany } from "sequelize-typescript"
import { ID, tabla } from "../columnas"
import { Producto } from "./Producto"
import { Cuenta } from "./Cuenta"

@Table(tabla("plataformas"))
export class Plataforma extends Model {
    @Column(ID) declare id: number
    @Column({ type: DataType.STRING(80), allowNull: false, unique: true }) declare nombre: string
    @Column({ type: DataType.STRING(255) }) declare descripcion: string | null
    @Column({ type: DataType.STRING(255) }) declare logo_url: string | null
    @Column({ type: DataType.STRING(500) }) declare portada_url: string | null
    @Column({ type: DataType.INTEGER.UNSIGNED, allowNull: false, defaultValue: 4 }) declare max_pantallas: number
    @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true }) declare activo: boolean
    @HasMany(() => Producto) declare productos: Producto[]
    @HasMany(() => Cuenta) declare cuentas: Cuenta[]
}
