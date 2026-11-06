import { Table, Column, Model, ForeignKey, DataType } from "sequelize-typescript"
import { tabla } from "../columnas"
import { Plataforma } from "../products/Plataforma"
import { Combo } from "./Combo"

@Table(tabla("combo_plataformas"))
export class ComboPlataforma extends Model {
    @ForeignKey(() => Combo) @Column({ type: DataType.INTEGER.UNSIGNED, primaryKey: true }) declare combo_id: number
    @ForeignKey(() => Plataforma) @Column({ type: DataType.INTEGER.UNSIGNED, primaryKey: true }) declare plataforma_id: number
}
