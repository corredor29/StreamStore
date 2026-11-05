import { Router } from "express"
import { AlertaController } from "../controllers/orders/AlertaController"
import { CompraController } from "../controllers/orders/CompraController"
import { CuentaController } from "../controllers/products/CuentaController"
import { PlataformaController } from "../controllers/products/PlataformaController"
import { ProductoController } from "../controllers/products/ProductoController"
import { ServicioController } from "../controllers/orders/ServicioController"
import { UsuarioController } from "../controllers/users/UsuarioController"
import { AuthMiddleware, RoleMiddleware } from "../middlewares/AuthMiddleware"
import { validateSchema } from "../middlewares/ValidateSchema"
import { idParamSchema } from "../validators/CommonValidators"
import { UploadController } from "../controllers/UploadController"
import { uploadImagen } from "../middlewares/UploadMiddleware"
import { listComprasQuerySchema } from "../validators/orders/CompraValidators"
import { asignarCredencialesSchema, listServiciosQuerySchema } from "../validators/orders/ServicioValidators"
import { createCuentaSchema, listCuentasQuerySchema } from "../validators/products/CuentaValidators"
import { createPlataformaSchema, updatePlataformaSchema } from "../validators/products/PlataformaValidators"
import { createProductoSchema, listProductosQuerySchema, updateProductoSchema } from "../validators/products/ProductoValidators"

export const AdminRoutes = Router()

const id = validateSchema(idParamSchema, "params")

AdminRoutes.use(AuthMiddleware, RoleMiddleware("admin"))

AdminRoutes.get("/usuarios", UsuarioController.list)

AdminRoutes.post("/upload", uploadImagen("imagen"), UploadController.subirPortada)

AdminRoutes.get("/plataformas", PlataformaController.listTodas)
AdminRoutes.post("/plataformas", validateSchema(createPlataformaSchema), PlataformaController.create)
AdminRoutes.put("/plataformas/:id", id, validateSchema(updatePlataformaSchema), PlataformaController.update)
AdminRoutes.patch("/plataformas/:id", id, validateSchema(updatePlataformaSchema), PlataformaController.update)
AdminRoutes.delete("/plataformas/:id", id, PlataformaController.desactivar)

AdminRoutes.get("/productos", validateSchema(listProductosQuerySchema, "query"), ProductoController.listAdmin)
AdminRoutes.get("/productos/stock-bajo", ProductoController.listStockBajo)
AdminRoutes.post("/productos", validateSchema(createProductoSchema), ProductoController.create)
AdminRoutes.put("/productos/:id", id, validateSchema(updateProductoSchema), ProductoController.update)
AdminRoutes.patch("/productos/:id", id, validateSchema(updateProductoSchema), ProductoController.update)
AdminRoutes.delete("/productos/:id", id, ProductoController.desactivar)

AdminRoutes.get("/cuentas", validateSchema(listCuentasQuerySchema, "query"), CuentaController.list)
AdminRoutes.get("/cuentas/:id", id, CuentaController.getById)
AdminRoutes.post("/cuentas", validateSchema(createCuentaSchema), CuentaController.create)

AdminRoutes.get("/compras", validateSchema(listComprasQuerySchema, "query"), CompraController.listTodas)
AdminRoutes.get("/resumen", CompraController.resumen)
AdminRoutes.get("/servicios", validateSchema(listServiciosQuerySchema, "query"), ServicioController.listTodos)
AdminRoutes.patch("/servicios/:id/credenciales", id, validateSchema(asignarCredencialesSchema), ServicioController.asignarCredenciales)
AdminRoutes.put("/servicios/:id/credenciales", id, validateSchema(asignarCredencialesSchema), ServicioController.asignarCredenciales)
AdminRoutes.post("/cron/ejecutar", AlertaController.ejecutar)
