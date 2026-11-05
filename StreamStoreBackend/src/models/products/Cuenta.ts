import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from "sequelize-typescript"
import { FK, ID, tabla } from "../columnas"
import { Plataforma } from "./Plataforma"
import { Pantalla } from "./Pantalla"
import { EstadoCuenta } from "../../interfaces/products/Cuenta"

@Table(tabla("cuentas"))
export class Cuenta extends Model {
    @Column(ID) declare id: number
    @ForeignKey(() => Plataforma) @Column(FK) declare plataforma_id: number
    // Nulos mientras la cuenta espera que el admin asigne las credenciales (se venden igual)
    @Column({ type: DataType.STRING(150) }) declare email: string | null
    @Column({ type: DataType.STRING(512) }) declare password_cifrada: string | null
    @Column({ type: DataType.INTEGER.UNSIGNED, allowNull: false, defaultValue: 4 }) declare total_pantallas: number
    @Column({ type: DataType.ENUM("disponible", "vendida_completa", "inactiva"), allowNull: false, defaultValue: "disponible" })
    declare estado: EstadoCuenta
    @BelongsTo(() => Plataforma) declare plataforma: Plataforma
    @HasMany(() => Pantalla) declare pantallas: Pantalla[]
}
