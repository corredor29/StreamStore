import { Router } from "express"
import { loginController, meController } from "../controllers/AuthController"
import { ValidateSchema } from "../middlewares/ValidateSchema"
import { AuthMiddleware } from "../middlewares/AuthMiddleware"
import { loginSchema } from "../validators/AuthValidator"

export const authRoutes = Router()

authRoutes.post("/login", ValidateSchema(loginSchema), loginController)
authRoutes.get("/me", AuthMiddleware, meController)
