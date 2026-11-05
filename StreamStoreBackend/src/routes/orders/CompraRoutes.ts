import { Router } from "express"
import { CompraController } from "../../controllers/orders/CompraController"
import { AuthMiddleware } from "../../middlewares/AuthMiddleware"
import { validateSchema } from "../../middlewares/ValidateSchema"
import { idParamSchema } from "../../validators/CommonValidators"
import { createCompraSchema, pagarCompraSchema } from "../../validators/orders/CompraValidators"

export const CompraRoutes = Router()

CompraRoutes.use(AuthMiddleware)
CompraRoutes.post("/", validateSchema(createCompraSchema), CompraController.create)
CompraRoutes.get("/mias", CompraController.listMias)
CompraRoutes.post("/:id/pagar", validateSchema(idParamSchema, "params"), validateSchema(pagarCompraSchema), CompraController.pagar)
CompraRoutes.get("/:id", validateSchema(idParamSchema, "params"), CompraController.getById)
