import winston from "winston"

const formato = winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => `${timestamp} [${level}] ${message}`)
)

export const logger = winston.createLogger({
    level: "info",
    format: formato,
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: "logs/errors.log", level: "error" })
    ]
})
