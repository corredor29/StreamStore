import dotenv from "dotenv"

dotenv.config()

const env = process.env.NODE_ENV ?? "development"

const secreto = (nombre: string, valorDesarrollo: string) => {
    const valor = process.env[nombre]
    if (valor) return valor
    if (env === "production") throw new Error(`Falta la variable de entorno ${nombre}`)
    return valorDesarrollo
}

export const config = {
    env,
    port: Number(process.env.PORT ?? 3000),
    host: process.env.HOST || undefined,
    appTimezone: process.env.APP_TIMEZONE ?? "America/Bogota",
    db: {
        host: process.env.DB_HOST ?? "localhost",
        port: Number(process.env.DB_PORT ?? 3306),
        name: process.env.DB_NAME ?? "streamStoreDb",
        user: process.env.DB_USER ?? "root",
        password: process.env.DB_PASSWORD ?? "",
        timezone: process.env.DB_TIMEZONE ?? "-05:00"
    },
    jwt: {
        secret: secreto("JWT_SECRET", "dev_secret"),
        expiresIn: process.env.JWT_EXPIRES_IN ?? "1d"
    },
    aesSecret: secreto("AES_SECRET", "dev_aes_secret_cambiar"),
    publicUrl: (process.env.PUBLIC_URL ?? `http://localhost:${process.env.PORT ?? 3000}`).replace(/\/$/, ""),
    uploads: {
        dir: process.env.UPLOAD_DIR ?? "uploads",
        maxMb: Number(process.env.UPLOAD_MAX_MB ?? 2)
    },
    corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
    clientUrl: (process.env.CLIENT_URL ?? process.env.CORS_ORIGIN ?? "http://localhost:5173").replace(/\/$/, ""),
    mail: {
        host: process.env.MAIL_HOST ?? "sandbox.smtp.mailtrap.io",
        port: Number(process.env.MAIL_PORT ?? 2525),
        user: process.env.MAIL_USER ?? "",
        pass: process.env.MAIL_PASS ?? "",
        from: process.env.MAIL_FROM ?? "StreamStore <no-reply@streamstore.test>"
    },
    cron: {
        enabled: (process.env.CRON_ENABLED ?? "true") === "true",
        schedule: process.env.CRON_SCHEDULE ?? "0 8 * * *"
    }
}
