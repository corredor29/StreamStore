import fs from "fs"
import path from "path"
import mysql from "mysql2/promise"
import { config } from "../config/config"

const raiz = path.resolve(__dirname, "../../database")
const nombreDb = config.db.name.replace(/`/g, "")

// Base vacía: crea el esquema completo (ya incluye todas las migraciones), sin datos demo.
// Base existente: aplica las migraciones en orden; son idempotentes, se pueden repetir sin daño.
export const runMigrations = async () => {
    console.log(`Conectando a MySQL (${config.db.host}:${config.db.port}), base '${nombreDb}'...`)
    const conn = await mysql.createConnection({
        host: config.db.host, port: config.db.port, user: config.db.user, password: config.db.password, multipleStatements: true
    })
    try {
        await conn.query(`CREATE DATABASE IF NOT EXISTS \`${nombreDb}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`)
        await conn.changeUser({ database: nombreDb })

        const [tablas] = await conn.query("SELECT COUNT(*) AS n FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'usuarios'", [nombreDb])
        if (Number((tablas as { n: number }[])[0].n) === 0) {
            const esquema = fs.readFileSync(path.join(raiz, "streamStoreDb.sql"), "utf8").replace(/streamStoreDb/g, nombreDb)
            await conn.query(esquema)
            console.log("✔ Base vacía: esquema completo creado (para datos demo usa npm run db:reset)")
            return
        }

        const archivos = fs.readdirSync(path.join(raiz, "migrations")).filter((f) => f.endsWith(".sql")).sort()
        console.log(`${archivos.length} migraciones en database/migrations/`)
        for (const archivo of archivos) {
            await conn.query(fs.readFileSync(path.join(raiz, "migrations", archivo), "utf8"))
            console.log(`✔ ${archivo}`)
        }
        console.log("✔ Migraciones aplicadas")
    } finally {
        await conn.end()
    }
}

if (require.main === module) {
    runMigrations().catch((error) => {
        console.error("✖ Migración falló:", error instanceof Error ? error.message : error)
        process.exit(1)
    })
}
