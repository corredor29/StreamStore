import { Router } from "express"
import { sequelize } from "../config/database"
import { ApiResponse } from "../utils/apiResponse"
import { AuthRoutes } from "./AuthRoutes"
import { AdminRoutes } from "./AdminRoutes"
import { CarritoRoutes } from "./cart/CarritoRoutes"
import { CompraRoutes } from "./orders/CompraRoutes"
import { PlataformaRoutes } from "./products/PlataformaRoutes"
import { ProductoRoutes } from "./products/ProductoRoutes"
import { ServicioRoutes } from "./orders/ServicioRoutes"
import { ComboController } from "../controllers/promos/ComboController"

export const router = Router()

router.get("/health", async (_req, res) => {
    let database = "conectada"
    try {
        await sequelize.authenticate()
    } catch {
        database = "desconectada"
    }
    return ApiResponse.success(res, "StreamStore API operativa", { status: "ok", database, timestamp: new Date().toISOString() })
})

router.use("/auth", AuthRoutes)
router.use("/plataformas", PlataformaRoutes)
router.use("/productos", ProductoRoutes)
router.get("/combos", ComboController.listActivos)
router.use("/carrito", CarritoRoutes)
router.use("/compras", CompraRoutes)
router.use("/servicios", ServicioRoutes)
router.use("/admin", AdminRoutes)
