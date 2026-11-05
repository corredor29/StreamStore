import { ATRIBUTOS_PRIVADOS_USUARIO, Usuario } from "../../models/users/Usuario"

export class UsuarioRepository {
    findAll() {
        return Usuario.findAll({ attributes: { exclude: ATRIBUTOS_PRIVADOS_USUARIO }, order: [["id", "ASC"]] })
    }
}
