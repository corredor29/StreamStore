import { Router } from "express"
import { ProductoController } from "../../controllers/products/ProductoController"
import { validateSchema } from "../../middlewares/ValidateSchema"
import { idParamSchema } from "../../validators/CommonValidators"
import { listProductosQuerySchema } from "../../validators/products/ProductoValidators"

export const ProductoRoutes = Router()

ProductoRoutes.get("/", validateSchema(listProductosQuerySchema, "query"), ProductoController.list)
ProductoRoutes.get("/:id", validateSchema(idParamSchema, "params"), ProductoController.getById)
