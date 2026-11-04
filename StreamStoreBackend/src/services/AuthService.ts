import bcrypt from "bcrypt"
import jwt, { SignOptions } from "jsonwebtoken"
import { config } from "../config/config"
import { findUserByEmail } from "../repositories/AuthRepository"
import { HttpError } from "../utils/httpError"

export const login = async (email: string, password: string) => {
    const user = await findUserByEmail(email)
    if (!user || !(await bcrypt.compare(password, user.password))) throw new HttpError(401, "Credenciales inválidas")
    const payload = { id: user.id, email: user.email, role: user.role }
    const token = jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn as SignOptions["expiresIn"] })
    return { token, user: payload }
}
