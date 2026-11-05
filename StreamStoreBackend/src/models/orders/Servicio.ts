import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from "sequelize-typescript"
import { FK, ID, tabla } from "../columnas"
import { Usuario } from "../users/Usuario"
import { Compra } from "./Compra"
import { Producto } from "../products/Producto"
import { TipoProducto } from "../../interfaces/products/Producto"
import { Cuenta } from "../products/Cuenta"
import { Pantalla } from "../products/Pantalla"

@Table(tabla("servicios"))
export class Servicio extends Model {
    @Column(ID) declare id: number
    @ForeignKey(() => Usuario) @Column(FK) declare usuario_id: number
    @ForeignKey(() => Compra) @Column(FK) declare compra_id: number
    @ForeignKey(() => Producto) @Column(FK) declare producto_id: number
    @ForeignKey(() => Cuenta) @Column(FK) declare cuenta_id: number
    @ForeignKey(() => Pantalla) @Column({ type: DataType.INTEGER.UNSIGNED }) declare pantalla_id: number | null
    @Column({ type: DataType.ENUM("cuenta_completa", "pantalla"), allowNull: false }) declare tipo: TipoProducto
    @Column({ type: DataType.DATE, allowNull: false }) declare fecha_inicio: Date
    @Column({ type: DataType.DATE, allowNull: false }) declare fecha_vencimiento: Date
    @Column({ type: DataType.ENUM("activo", "vencido"), allowNull: false, defaultValue: "activo" }) declare estado: "activo" | "vencido"
    @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false }) declare alerta_3d_enviada: boolean
    @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false }) declare alerta_1d_enviada: boolean
    @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false }) declare alerta_vencido_enviada: boolean
    @ForeignKey(() => Servicio) @Column({ type: DataType.INTEGER.UNSIGNED, unique: true }) declare renovacion_de_id: number | null
    @BelongsTo(() => Usuario) declare usuario: Usuario
    @BelongsTo(() => Producto) declare producto: Producto
    @BelongsTo(() => Cuenta) declare cuenta: Cuenta
    @BelongsTo(() => Pantalla) declare pantalla: Pantalla
}
