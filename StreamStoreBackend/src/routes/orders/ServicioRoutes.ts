import { Router } from "express"
import { ServicioController } from "../../controllers/orders/ServicioController"
import { AuthMiddleware } from "../../middlewares/AuthMiddleware"
import { validateSchema } from "../../middlewares/ValidateSchema"
import { idParamSchema } from "../../validators/CommonValidators"

export const ServicioRoutes = Router()

ServicioRoutes.use(AuthMiddleware)
ServicioRoutes.get("/mios", ServicioController.listMios)
ServicioRoutes.get("/:id", validateSchema(idParamSchema, "params"), ServicioController.getById)
ServicioRoutes.post("/:id/renovar", validateSchema(idParamSchema, "params"), ServicioController.renovar)
