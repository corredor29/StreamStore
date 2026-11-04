import { Table, Column, Model, DataType } from "sequelize-typescript"

@Table({ tableName: "products", timestamps: true, underscored: true })
export class Product extends Model {
    @Column({ type: DataType.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true })
    declare id: number

    @Column({ type: DataType.STRING(150), allowNull: false })
    declare name: string

    @Column({ type: DataType.DECIMAL(12, 2), allowNull: false })
    declare price: string

    @Column({ type: DataType.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 })
    declare stock: number
}
