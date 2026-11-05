import fs from "fs"
import path from "path"
import mysql from "mysql2/promise"
import { config } from "../config/config"

export const runMigrations = async () => {
    console.log(`Conectando a MySQL (${config.db.host}:${config.db.port}) en base '${config.db.name}'...`)
    
    // Conectar al servidor (crear base si no existe)
    const conn = await mysql.createConnection({
        host: config.db.host,
        port: config.db.port,
        user: config.db.user,
        password: config.db.password,
        multipleStatements: true
    })

    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${config.db.name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`)
    await conn.changeUser({ database: config.db.name })

    const migrationsDir = path.resolve(__dirname, "../../database/migrations")
    const files = fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith(".sql"))
        .sort()

    console.log(`Se encontraron ${files.length} migraciones en database/migrations/`)

    for (const file of files) {
        const filePath = path.join(migrationsDir, file)
        const sql = fs.readFileSync(filePath, "utf8")
        console.log(`Ejecutando migracion: ${file}...`)
        try {
            await conn.query(sql)
            console.log(`✔ Migracion aplicada: ${file}`)
        } catch (error) {
            console.error(`Error en migracion ${file}:`, error instanceof Error ? error.message : error)
            throw error
        }
    }

    await conn.end()
    console.log("✔ Todas las migraciones fueron ejecutadas exitosamente.")
}

if (require.main === module) {
    runMigrations().catch((err) => {
        console.error("Error al ejecutar migraciones:", err)
        process.exit(1)
    })
}
