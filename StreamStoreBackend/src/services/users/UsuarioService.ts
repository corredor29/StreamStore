import { UsuarioRepository } from "../../repositories/users/UsuarioRepository"

export class UsuarioService {
    constructor(private readonly repository: UsuarioRepository) {}

    list() {
        return this.repository.findAll()
    }
}
