import "reflect-metadata"
import fs from "fs"
import path from "path"
import bcrypt from "bcrypt"
import mysql from "mysql2/promise"
import { config } from "../config/config"
import { sequelize } from "../config/database"
import { Carrito } from "../models/cart/Carrito"
import { Compra } from "../models/orders/Compra"
import { CompraItem } from "../models/orders/CompraItem"
import { Cuenta } from "../models/products/Cuenta"
import { Pantalla } from "../models/products/Pantalla"
import { Plataforma } from "../models/products/Plataforma"
import { Producto } from "../models/products/Producto"
import { Servicio } from "../models/orders/Servicio"
import { Usuario } from "../models/users/Usuario"
import { encrypt } from "../utils/crypto"

const DAY = 24 * 60 * 60 * 1000
const HOUR = 60 * 60 * 1000

const runSchema = async () => {
    const sql = fs.readFileSync(path.resolve(__dirname, "../../database/streamStoreDb.sql"), "utf8")
        .replace(/streamStoreDb/g, config.db.name)
    const conn = await mysql.createConnection({
        host: config.db.host, port: config.db.port, user: config.db.user, password: config.db.password, multipleStatements: true
    })
    await conn.query(sql)
    await conn.end()
}

const main = async () => {
    await runSchema()
    console.log("✔ Esquema creado")

    const [admin, adminLegacy, c1, cLegacy, c2] = await Usuario.bulkCreate([
        { nombre: "Admin StreamStore", email: "admin@streamstore.test", password: await bcrypt.hash("Admin123*", 10), telefono: "+57 300 000 0000", rol: "admin" },
        { nombre: "Admin StreamStore", email: "admin@streamstore.com", password: await bcrypt.hash("adminpassword", 10), telefono: "+57 300 000 0000", rol: "admin" },
        { nombre: "Laura Cliente", email: "cliente1@streamstore.test", password: await bcrypt.hash("Cliente123*", 10), telefono: "+57 300 000 0001", rol: "cliente" },
        { nombre: "Carlos Cliente", email: "cliente@streamstore.com", password: await bcrypt.hash("password123", 10), telefono: "+57 300 000 0001", rol: "cliente" },
        { nombre: "Andres Cliente", email: "cliente2@streamstore.test", password: await bcrypt.hash("Cliente123*", 10), telefono: "+57 300 000 0002", rol: "cliente" }
    ])
    await Carrito.bulkCreate([{ usuario_id: c1.id }, { usuario_id: cLegacy.id }, { usuario_id: c2.id }, { usuario_id: admin.id }, { usuario_id: adminLegacy.id }])

    const defs = [
        { nombre: "Netflix", slug: "NF", pantallas: 4, completa: 45000, pantalla: 15000 },
        { nombre: "Disney+", slug: "DP", pantallas: 4, completa: 38000, pantalla: 12000 },
        { nombre: "Prime Video", slug: "PV", pantallas: 3, completa: 25000, pantalla: 9000 },
        { nombre: "Max", slug: "MX", pantallas: 4, completa: 35000, pantalla: 11000 }
    ]
    const productos: Record<string, { completa: Producto; pantalla: Producto }> = {}
    const cuentas: Record<string, Cuenta[]> = {}
    for (const d of defs) {
        const plataforma = await Plataforma.create({ nombre: d.nombre, descripcion: `Suscripción ${d.nombre} por 30 días`, max_pantallas: d.pantallas })
        const completa = await Producto.create({
            plataforma_id: plataforma.id, nombre: `${d.nombre} - Cuenta completa 30 días`, tipo: "cuenta_completa",
            precio: d.completa, duracion_dias: 30, stock_minimo: d.slug === "MX" ? 2 : 1
        })
        const pantalla = await Producto.create({
            plataforma_id: plataforma.id, nombre: `${d.nombre} - 1 pantalla 30 días`, tipo: "pantalla",
            precio: d.pantalla, duracion_dias: 30, stock_minimo: 2
        })
        productos[d.slug] = { completa, pantalla }
        cuentas[d.slug] = []
        for (let n = 1; n <= 3; n++) {
            const cuenta = await Cuenta.create({
                plataforma_id: plataforma.id,
                email: `${d.slug.toLowerCase()}.cuenta${n}@streamstore-demo.test`,
                password_cifrada: encrypt(`Demo-${d.slug}-00${n}!`),
                total_pantallas: d.pantallas
            })
            await Pantalla.bulkCreate(Array.from({ length: d.pantallas }, (_, i) => ({
                cuenta_id: cuenta.id, numero: i + 1, perfil: `Perfil ${i + 1}`, pin: String(1000 + n * 100 + i + 1)
            })))
            cuentas[d.slug].push(cuenta)
        }
    }
    console.log("✔ 4 plataformas, 8 productos, 12 cuentas con pantallas")

    const ahora = Date.now()
    const ventas = [
        { usuario: c1, slug: "MX", cuentaIdx: 0, vence: ahora + 3 * DAY },
        { usuario: c2, slug: "MX", cuentaIdx: 1, vence: ahora + DAY },
        { usuario: c1, slug: "NF", cuentaIdx: 0, vence: ahora - HOUR }
    ]
    for (const v of ventas) {
        const producto = productos[v.slug].pantalla
        const cuenta = cuentas[v.slug][v.cuentaIdx]
        const pantalla = await Pantalla.findOne({ where: { cuenta_id: cuenta.id, numero: 1 } })
        await pantalla!.update({ estado: "vendida" })
        const inicio = new Date(v.vence - 30 * DAY)
        const compra = await Compra.create({
            usuario_id: v.usuario.id, total: producto.precio, estado: "pagada", metodo_pago: "simulado",
            referencia_pago: `SEED-${cuenta.id}`, pagada_at: inicio
        })
        await CompraItem.create({ compra_id: compra.id, producto_id: producto.id, cantidad: 1, precio_unitario: producto.precio, subtotal: producto.precio })
        await Servicio.create({
            usuario_id: v.usuario.id, compra_id: compra.id, producto_id: producto.id, cuenta_id: cuenta.id, pantalla_id: pantalla!.id,
            tipo: "pantalla", fecha_inicio: inicio, fecha_vencimiento: new Date(v.vence)
        })
    }
    console.log("✔ Servicios demo: vence en 3d (cliente1/Max), 1d (cliente2/Max), vencido (cliente1/Netflix)")
    console.log("✔ Stock bajo: 'Max - Cuenta completa' (stock 1 <= mínimo 2)")
    console.log("\nUsuarios:\n  admin@streamstore.test / Admin123*\n  cliente1@streamstore.test / Cliente123*\n  cliente2@streamstore.test / Cliente123*")
    await sequelize.close()
}

main().catch(async (e) => {
    console.error("✖ Seed falló:", e instanceof Error ? e.message : e)
    await sequelize.close().catch(() => undefined)
    process.exit(1)
})
