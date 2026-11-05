import { Transaction } from "sequelize"
import { Sequelize } from "sequelize-typescript"
import { config } from "./config"
import { Usuario } from "../models/users/Usuario"
import { Plataforma } from "../models/products/Plataforma"
import { Producto } from "../models/products/Producto"
import { Cuenta } from "../models/products/Cuenta"
import { Pantalla } from "../models/products/Pantalla"
import { Carrito } from "../models/cart/Carrito"
import { CarritoItem } from "../models/cart/CarritoItem"
import { Compra } from "../models/orders/Compra"
import { CompraItem } from "../models/orders/CompraItem"
import { Servicio } from "../models/orders/Servicio"

export const sequelize = new Sequelize({
    dialect: "mysql",
    host: config.db.host,
    port: config.db.port,
    database: config.db.name,
    username: config.db.user,
    password: config.db.password,
    timezone: config.db.timezone,
    logging: false,
    models: [Usuario, Plataforma, Producto, Cuenta, Pantalla, Carrito, CarritoItem, Compra, CompraItem, Servicio]
})

export const withTransaction = <T>(fn: (t: Transaction) => Promise<T>) => sequelize.transaction(fn)
