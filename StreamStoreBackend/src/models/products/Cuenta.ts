import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from "sequelize-typescript"
import { FK, ID, tabla } from "../columnas"
import { Plataforma } from "./Plataforma"
import { Pantalla } from "./Pantalla"
import { EstadoCuenta } from "../../interfaces/products/Cuenta"

@Table(tabla("cuentas"))
export class Cuenta extends Model {
    @Column(ID) declare id: number
    @ForeignKey(() => Plataforma) @Column(FK) declare plataforma_id: number
    @Column({ type: DataType.STRING(150), allowNull: false }) declare email: string
    @Column({ type: DataType.STRING(512), allowNull: false }) declare password_cifrada: string
    @Column({ type: DataType.INTEGER.UNSIGNED, allowNull: false, defaultValue: 4 }) declare total_pantallas: number
    @Column({ type: DataType.ENUM("disponible", "vendida_completa", "inactiva"), allowNull: false, defaultValue: "disponible" })
    declare estado: EstadoCuenta
    @BelongsTo(() => Plataforma) declare plataforma: Plataforma
    @HasMany(() => Pantalla) declare pantallas: Pantalla[]
}
