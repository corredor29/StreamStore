import { Sequelize } from "sequelize-typescript"
import { config } from "./config"
import { models } from "../models"

export const sequelize = new Sequelize({
    dialect: "mysql",
    host: config.db.host,
    port: config.db.port,
    database: config.db.name,
    username: config.db.user,
    password: config.db.password,
    timezone: config.db.timezone,
    logging: false,
    models
})
