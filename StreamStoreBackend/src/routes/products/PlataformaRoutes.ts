import { Router } from "express"
import { PlataformaController } from "../../controllers/products/PlataformaController"
import { validateSchema } from "../../middlewares/ValidateSchema"
import { idParamSchema } from "../../validators/CommonValidators"

export const PlataformaRoutes = Router()

PlataformaRoutes.get("/", PlataformaController.listActivas)
PlataformaRoutes.get("/:id", validateSchema(idParamSchema, "params"), PlataformaController.getById)
