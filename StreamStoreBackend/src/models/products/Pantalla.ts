import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from "sequelize-typescript"
import { FK, ID, tabla } from "../columnas"
import { Cuenta } from "./Cuenta"
import { EstadoPantalla } from "../../interfaces/products/Cuenta"

@Table(tabla("pantallas"))
export class Pantalla extends Model {
    @Column(ID) declare id: number
    @ForeignKey(() => Cuenta) @Column(FK) declare cuenta_id: number
    @Column({ type: DataType.INTEGER.UNSIGNED, allowNull: false }) declare numero: number
    @Column({ type: DataType.STRING(60), allowNull: false }) declare perfil: string
    @Column({ type: DataType.STRING(10), allowNull: false }) declare pin: string
    @Column({ type: DataType.ENUM("disponible", "vendida"), allowNull: false, defaultValue: "disponible" }) declare estado: EstadoPantalla
    @BelongsTo(() => Cuenta) declare cuenta: Cuenta
}
