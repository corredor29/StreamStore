import { Table, Column, Model, DataType } from "sequelize-typescript"
import { ID, tabla } from "../columnas"
import { Rol } from "../../interfaces/users/Usuario"

export const ATRIBUTOS_PRIVADOS_USUARIO = ["password", "reset_token_hash", "reset_token_expira"]

@Table(tabla("usuarios"))
export class Usuario extends Model {
    @Column(ID) declare id: number
    @Column({ type: DataType.STRING(120), allowNull: false }) declare nombre: string
    @Column({ type: DataType.STRING(150), allowNull: false, unique: true }) declare email: string
    @Column({ type: DataType.STRING(255), allowNull: false }) declare password: string
    @Column({ type: DataType.STRING(20) }) declare telefono: string | null
    @Column({ type: DataType.ENUM("cliente", "admin"), allowNull: false, defaultValue: "cliente" }) declare rol: Rol
    @Column({ type: DataType.CHAR(64) }) declare reset_token_hash: string | null
    @Column({ type: DataType.DATE }) declare reset_token_expira: Date | null
}
