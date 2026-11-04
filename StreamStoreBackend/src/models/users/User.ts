import { Table, Column, Model, DataType } from "sequelize-typescript"

@Table({ tableName: "users", timestamps: true, underscored: true })
export class User extends Model {
    @Column({ type: DataType.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true })
    declare id: number

    @Column({ type: DataType.STRING(120), allowNull: false })
    declare name: string

    @Column({ type: DataType.STRING(150), allowNull: false, unique: true })
    declare email: string

    @Column({ type: DataType.STRING(255), allowNull: false })
    declare password: string

    @Column({ type: DataType.STRING(20), allowNull: false, defaultValue: "customer" })
    declare role: string
}
