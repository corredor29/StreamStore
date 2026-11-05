import bcrypt from "bcrypt"
import crypto from "crypto"
import jwt, { SignOptions } from "jsonwebtoken"
import { config } from "../config/config"
import { AuthRepository } from "../repositories/AuthRepository"
import { HttpError } from "../utils/httpError"
import { logger } from "../utils/logger"
import { sendMail } from "../utils/mailer"
import { AuthUser } from "../interfaces/AuthUser"
import { Usuario } from "../models/users/Usuario"
import { LoginInput, RecuperarInput, RegisterInput, RestablecerInput } from "../validators/AuthValidators"
import { correoRecuperacion, MINUTOS_VIGENCIA_RESET } from "./CorreoAuth"

const hashToken = (token: string) => crypto.createHash("sha256").update(token).digest("hex")

export class AuthService {
    constructor(private readonly repository: AuthRepository) {}

    private firmar(user: Usuario) {
        const payload: AuthUser = { id: user.id, email: user.email, nombre: user.nombre, rol: user.rol }
        const token = jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn as SignOptions["expiresIn"] })
        return { token, user: { ...payload, telefono: user.telefono ?? null } }
    }

    async register(data: RegisterInput) {
        if (await this.repository.findByEmail(data.email)) throw new HttpError("El email ya está registrado", 409)
        const password = await bcrypt.hash(data.password, 10)
        const user = await this.repository.create({ nombre: data.nombre, email: data.email, password, telefono: data.telefono ?? null, rol: "cliente" })
        return this.firmar(user)
    }

    async login(data: LoginInput) {
        const user = await this.repository.findByEmail(data.email)
        if (!user || !(await bcrypt.compare(data.password, user.password))) throw new HttpError("Credenciales inválidas", 401)
        return this.firmar(user)
    }

    async me(id: number) {
        const user = await this.repository.findById(id)
        if (!user) throw new HttpError("Usuario no encontrado", 404)
        return user
    }

    async recuperar(data: RecuperarInput) {
        const user = await this.repository.findByEmail(data.email)
        if (!user) return
        const token = crypto.randomBytes(32).toString("hex")
        await this.repository.guardarTokenReset(user, hashToken(token), new Date(Date.now() + MINUTOS_VIGENCIA_RESET * 60 * 1000))
        const { asunto, cuerpo } = correoRecuperacion(user.nombre, token)
        sendMail(user.email, asunto, cuerpo)
            .catch((e) => logger.error(`No se pudo enviar el correo de recuperación a ${user.email}: ${e instanceof Error ? e.message : e}`))
        if (config.env !== "production") logger.info(`[auth] token de recuperación para ${user.email}: ${token}`)
    }

    async restablecer(data: RestablecerInput) {
        const user = await this.repository.findByTokenResetVigente(hashToken(data.token), new Date())
        if (!user) throw new HttpError("El enlace no es válido o ya venció. Solicita uno nuevo", 400)
        await this.repository.cambiarPassword(user, await bcrypt.hash(data.password, 10))
    }
}
