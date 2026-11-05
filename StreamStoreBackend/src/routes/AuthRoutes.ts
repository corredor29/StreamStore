import { Router } from "express"
import { AuthController } from "../controllers/AuthController"
import { AuthMiddleware } from "../middlewares/AuthMiddleware"
import { validateSchema } from "../middlewares/ValidateSchema"
import { loginSchema, recuperarSchema, registerSchema, restablecerSchema } from "../validators/AuthValidators"

export const AuthRoutes = Router()

AuthRoutes.post("/register", validateSchema(registerSchema), AuthController.register)
AuthRoutes.post("/login", validateSchema(loginSchema), AuthController.login)
AuthRoutes.get("/me", AuthMiddleware, AuthController.me)
AuthRoutes.post("/logout", AuthController.logout)
AuthRoutes.post("/recuperar", validateSchema(recuperarSchema), AuthController.recuperar)
AuthRoutes.post("/restablecer", validateSchema(restablecerSchema), AuthController.restablecer)
