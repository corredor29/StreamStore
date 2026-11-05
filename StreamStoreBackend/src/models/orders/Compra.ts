import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from "sequelize-typescript"
import { FK, ID, tabla } from "../columnas"
import { Usuario } from "../users/Usuario"
import { CompraItem } from "./CompraItem"
import { Servicio } from "./Servicio"
import { EstadoCompra } from "../../interfaces/orders/Compra"

@Table(tabla("compras"))
export class Compra extends Model {
    @Column(ID) declare id: number
    @ForeignKey(() => Usuario) @Column(FK) declare usuario_id: number
    @Column({ type: DataType.DECIMAL(12, 2), allowNull: false }) declare total: string
    @Column({ type: DataType.ENUM("pendiente", "pagada", "cancelada"), allowNull: false, defaultValue: "pendiente" }) declare estado: EstadoCompra
    @Column({ type: DataType.STRING(30), allowNull: false, defaultValue: "simulado" }) declare metodo_pago: string
    @Column({ type: DataType.STRING(60) }) declare referencia_pago: string | null
    @Column({ type: DataType.DATE }) declare pagada_at: Date | null
    @BelongsTo(() => Usuario) declare usuario: Usuario
    @HasMany(() => CompraItem) declare items: CompraItem[]
    @HasMany(() => Servicio) declare servicios: Servicio[]
}
