import { User } from "../models/users/User"

export const findUserByEmail = (email: string) => {
    return User.findOne({ where: { email } })
}
