import { Router } from "express"
import { CarritoController } from "../../controllers/cart/CarritoController"
import { AuthMiddleware, RoleMiddleware } from "../../middlewares/AuthMiddleware"
import { validateSchema } from "../../middlewares/ValidateSchema"
import { addCarritoItemSchema, itemIdParamSchema, updateCarritoItemSchema } from "../../validators/cart/CarritoValidators"

export const CarritoRoutes = Router()

CarritoRoutes.use(AuthMiddleware, RoleMiddleware("cliente", "admin"))
CarritoRoutes.get("/", CarritoController.get)
CarritoRoutes.post("/", validateSchema(addCarritoItemSchema), CarritoController.addItem)
CarritoRoutes.delete("/", CarritoController.vaciar)
CarritoRoutes.patch("/:itemId", validateSchema(itemIdParamSchema, "params"), validateSchema(updateCarritoItemSchema), CarritoController.updateItem)
CarritoRoutes.delete("/:itemId", validateSchema(itemIdParamSchema, "params"), CarritoController.removeItem)
