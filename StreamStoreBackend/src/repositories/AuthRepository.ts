import { Op } from "sequelize"
import { ATRIBUTOS_PRIVADOS_USUARIO, Usuario } from "../models/users/Usuario"
import { NuevoUsuario } from "../interfaces/users/Usuario"

export class AuthRepository {
    findByEmail(email: string) {
        return Usuario.findOne({ where: { email } })
    }

    findById(id: number) {
        return Usuario.findByPk(id, { attributes: { exclude: ATRIBUTOS_PRIVADOS_USUARIO } })
    }

    create(data: NuevoUsuario) {
        return Usuario.create(data)
    }

    guardarTokenReset(usuario: Usuario, hash: string, expira: Date) {
        return usuario.update({ reset_token_hash: hash, reset_token_expira: expira })
    }

    findByTokenResetVigente(hash: string, ahora: Date) {
        return Usuario.findOne({ where: { reset_token_hash: hash, reset_token_expira: { [Op.gt]: ahora } } })
    }

    cambiarPassword(usuario: Usuario, passwordHash: string) {
        return usuario.update({ password: passwordHash, reset_token_hash: null, reset_token_expira: null })
    }
}
