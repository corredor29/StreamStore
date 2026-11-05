import { DataType } from "sequelize-typescript"

export const ID = { type: DataType.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true }
export const FK = { type: DataType.INTEGER.UNSIGNED, allowNull: false }
export const tabla = (tableName: string) => ({ tableName, timestamps: true, underscored: true })
