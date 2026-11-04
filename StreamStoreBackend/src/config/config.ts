import dotenv from "dotenv"

dotenv.config()

export const config = {
    env: process.env.NODE_ENV ?? "development",
    port: Number(process.env.PORT ?? 3000),
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
        secret: process.env.JWT_SECRET ?? "dev_secret",
        expiresIn: process.env.JWT_EXPIRES_IN ?? "1d"
    },
    corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173"
}
