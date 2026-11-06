import { Request, Response, Router } from "express"

type Acceso = "publico" | "cliente" | "admin"
type Op = {
    acceso?: Acceso
    body?: Record<string, unknown>
    multipart?: string
    query?: string[]
    status?: number
    descripcion?: string
}

const ok = { description: "OK: `{ message, data }`" }
const errores = {
    "400": { description: "Datos inválidos: `{ error, errors }`" },
    "401": { description: "Sin token o token inválido" },
    "403": { description: "Sin permisos" },
    "404": { description: "No encontrado" },
    "409": { description: "Conflicto (duplicado, stock agotado, estado inválido)" }
}

const operacion = (tag: string, resumen: string, op: Op = {}) => {
    const acceso = op.acceso ?? (tag === "Admin" ? "admin" : "cliente")
    return {
        tags: [tag],
        summary: resumen,
        ...(op.descripcion && { description: op.descripcion }),
        ...(acceso === "publico" ? { security: [] } : {}),
        ...(op.query && { parameters: op.query.map((name) => ({ name, in: "query", required: false, schema: { type: "string" } })) }),
        ...(op.body && {
            requestBody: { required: true, content: { "application/json": { schema: { type: "object" }, example: op.body } } }
        }),
        ...(op.multipart && {
            requestBody: {
                required: true,
                content: {
                    "multipart/form-data": {
                        schema: { type: "object", required: [op.multipart], properties: { [op.multipart]: { type: "string", format: "binary" } } }
                    }
                }
            }
        }),
        responses: { [String(op.status ?? 200)]: ok, ...errores }
    }
}

const rutas: [string, string, ReturnType<typeof operacion>][] = [
    ["get", "/health", operacion("Salud", "Estado de la API y la base", { acceso: "publico" })],

    ["post", "/auth/register", operacion("Auth", "Registro de cliente", {
        acceso: "publico", status: 201, body: { nombre: "Cliente Demo", email: "demo@streamstore.test", password: "Demo123*", telefono: "+57 300 123 4567" }
    })],
    ["post", "/auth/login", operacion("Auth", "Login (devuelve token JWT)", {
        acceso: "publico", body: { email: "admin@streamstore.test", password: "Admin123*" },
        descripcion: "Copia `data.token` y pégalo en el botón **Authorize**."
    })],
    ["get", "/auth/me", operacion("Auth", "Usuario actual")],
    ["post", "/auth/logout", operacion("Auth", "Cerrar sesión (borra la cookie)", { acceso: "publico" })],
    ["post", "/auth/recuperar", operacion("Auth", "Pedir enlace para recuperar contraseña", { acceso: "publico", body: { email: "cliente2@streamstore.test" } })],
    ["post", "/auth/restablecer", operacion("Auth", "Restablecer contraseña con el token", { acceso: "publico", body: { token: "<64 caracteres hex>", password: "Nueva123*" } })],

    ["get", "/plataformas", operacion("Catálogo", "Plataformas activas", { acceso: "publico" })],
    ["get", "/plataformas/{id}", operacion("Catálogo", "Plataforma con productos y stock", { acceso: "publico" })],
    ["get", "/productos", operacion("Catálogo", "Productos con stock", { acceso: "publico", query: ["plataforma", "plataforma_id", "tipo"] })],
    ["get", "/productos/{id}", operacion("Catálogo", "Detalle de producto con stock", { acceso: "publico" })],

    ["get", "/carrito", operacion("Carrito", "Ver carrito")],
    ["post", "/carrito", operacion("Carrito", "Agregar producto (si ya está, suma)", { status: 201, body: { producto_id: 1, cantidad: 1 } })],
    ["delete", "/carrito", operacion("Carrito", "Vaciar carrito")],
    ["patch", "/carrito/{itemId}", operacion("Carrito", "Cambiar cantidad", { body: { cantidad: 2 } })],
    ["delete", "/carrito/{itemId}", operacion("Carrito", "Quitar ítem")],

    ["post", "/compras", operacion("Compras", "Checkout: crea la compra pendiente", { status: 201, body: { metodo_pago: "simulado" } })],
    ["get", "/compras/mias", operacion("Compras", "Mis compras")],
    ["get", "/compras/{id}", operacion("Compras", "Detalle de compra")],
    ["post", "/compras/{id}/pagar", operacion("Compras", "Pago simulado (transaccional)", { body: { metodo_pago: "simulado" } })],

    ["get", "/servicios/mios", operacion("Servicios", "Mis servicios con credenciales")],
    ["get", "/servicios/{id}", operacion("Servicios", "Detalle de servicio (dueño o admin)")],
    ["post", "/servicios/{id}/renovar", operacion("Servicios", "Agregar la renovación al carrito", { status: 201 })],

    ["get", "/admin/usuarios", operacion("Admin", "Usuarios")],
    ["post", "/admin/upload", operacion("Admin", "Subir portada (JPG, PNG, WEBP o GIF)", { status: 201, multipart: "imagen" })],
    ["get", "/admin/plataformas", operacion("Admin", "Plataformas (incluye inactivas)")],
    ["post", "/admin/plataformas", operacion("Admin", "Crear plataforma", {
        status: 201, body: { nombre: "Crunchyroll", descripcion: "Anime", portada_url: "http://localhost:3000/uploads/portadas/archivo.png", max_pantallas: 4 }
    })],
    ["patch", "/admin/plataformas/{id}", operacion("Admin", "Editar plataforma", { body: { descripcion: "Actualizada", portada_url: null } })],
    ["delete", "/admin/plataformas/{id}", operacion("Admin", "Desactivar plataforma")],
    ["get", "/admin/productos", operacion("Admin", "Productos (incluye inactivos)", { query: ["plataforma", "plataforma_id", "tipo"] })],
    ["get", "/admin/productos/stock-bajo", operacion("Admin", "Productos con stock bajo")],
    ["post", "/admin/productos", operacion("Admin", "Crear producto", {
        status: 201, body: { plataforma_id: 1, nombre: "Pantalla 30 días", tipo: "pantalla", precio: 9000, duracion_dias: 30, stock_minimo: 2 }
    })],
    ["patch", "/admin/productos/{id}", operacion("Admin", "Editar producto", { body: { precio: 9500 } })],
    ["delete", "/admin/productos/{id}", operacion("Admin", "Desactivar producto")],
    ["get", "/admin/cuentas", operacion("Admin", "Inventario de cuentas", { query: ["plataforma_id", "credenciales"] })],
    ["get", "/admin/cuentas/{id}", operacion("Admin", "Cuenta con sus pantallas")],
    ["post", "/admin/cuentas", operacion("Admin", "Cargar cuenta (sin email/password queda pendiente de asignación)", {
        status: 201, body: { plataforma_id: 1, email: "cuenta@streamstore-demo.test", password: "Demo-123!" },
        descripcion: "Para cuentas pendientes envía solo `{ plataforma_id, cantidad }`."
    })],
    ["get", "/admin/compras", operacion("Admin", "Compras con filtros", { query: ["estado", "desde", "hasta"] })],
    ["get", "/admin/resumen", operacion("Admin", "Resumen de ventas y stock")],
    ["get", "/admin/servicios", operacion("Admin", "Servicios", { query: ["entrega"] })],
    ["patch", "/admin/servicios/{id}/credenciales", operacion("Admin", "Entregar credenciales y avisar al cliente", {
        body: { email: "cuenta@streamstore-demo.test", password: "Demo-123!", pin: "4321", perfil: "Cliente", notificar: true },
        descripcion: "En servicios de cuenta completa usa `pantallas: [{ numero, pin, perfil }]` en vez de `pin`/`perfil`."
    })],
    ["post", "/admin/cron/ejecutar", operacion("Admin", "Ejecutar ya la revisión de vencimientos")],
    ["get", "/admin/combos", operacion("Admin", "Combos promocionales con sus plataformas")],
    ["post", "/admin/combos", operacion("Admin", "Crear combo (mínimo 2 plataformas)", {
        status: 201,
        body: { nombre: "Combo Dúo: Netflix + Max", plataforma_ids: [1, 4], precio_promo: 32000, precio_regular: 48000, pantallas_por_plataforma: 1, duracion_dias: 30, etiqueta_promo: "COMBO DÚO 2X1" }
    })],
    ["patch", "/admin/combos/{id}", operacion("Admin", "Editar combo", { body: { precio_promo: 30000 } })],
    ["patch", "/admin/combos/{id}/toggle", operacion("Admin", "Activar o desactivar combo")],
    ["delete", "/admin/combos/{id}", operacion("Admin", "Eliminar combo")]
]

const paths: Record<string, Record<string, unknown>> = {}
for (const [metodo, ruta, op] of rutas) {
    const params = [...ruta.matchAll(/\{(\w+)\}/g)].map(([, name]) => ({ name, in: "path", required: true, schema: { type: "integer" } }))
    paths[ruta] ??= params.length ? { parameters: params } : {}
    paths[ruta][metodo] = op
}

export const openApiSpec = {
    openapi: "3.0.3",
    info: {
        title: "StreamStore API",
        version: "1.0.0",
        description: "Respuestas `{ message, data }`. Haz login en **Auth → /auth/login**, copia `data.token` y pégalo en **Authorize**."
    },
    servers: [{ url: "/api" }],
    components: { securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" } } },
    security: [{ bearerAuth: [] }],
    paths
}

const swaggerHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>StreamStore API - Swagger UI</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui.min.css" />
</head>
<body style="margin:0;background:#fafafa">
  <div id="swagger-ui"></div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-bundle.min.js"></script>
  <script>
    window.onload = () => {
      window.ui = SwaggerUIBundle({ url: "/api/docs.json", dom_id: "#swagger-ui", deepLinking: true, persistAuthorization: true })
    }
  </script>
</body>
</html>`

export const DocsRoutes = Router()

DocsRoutes.get("/api/docs.json", (_req: Request, res: Response) => res.json(openApiSpec))
DocsRoutes.get(["/swagger", "/api-docs"], (_req: Request, res: Response) => res.type("html").send(swaggerHtml))
