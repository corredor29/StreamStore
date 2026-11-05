import nodemailer from "nodemailer"
import { config } from "../config/config"
import { logger } from "./logger"

const usaSmtp = Boolean(config.mail.user && config.mail.pass)

const transporter = usaSmtp
    ? nodemailer.createTransport({ host: config.mail.host, port: config.mail.port, auth: { user: config.mail.user, pass: config.mail.pass } })
    : nodemailer.createTransport({ jsonTransport: true })

export const sendMail = async (to: string, subject: string, html: string) => {
    await transporter.sendMail({ from: config.mail.from, to, subject, html })
    if (!usaSmtp) logger.info(`[mail:simulado] -> ${to} | ${subject}`)
    return usaSmtp ? "mailtrap" : "simulado"
}

export const escapeHtml = (texto: string) =>
    texto.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;")
