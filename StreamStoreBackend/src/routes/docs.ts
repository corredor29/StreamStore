import { Router } from "express"

export const docsRouter = Router()

export const openApiSpec = {
    openapi: "3.0.0",
    info: {
        title: "StreamStore API",
        version: "1.0.0",
        description: "API REST de StreamStore para venta y administración de cuentas y pantallas de streaming."
    },
    servers: [
        { url: "http://localhost:3000/api", description: "Servidor Local" }
    ],
    paths: {
        "/health": {
            get: {
                summary: "Estado de la API y conexión a base de datos",
                responses: { "200": { description: "API operativa" } }
            }
        },
        "/auth/login": {
            post: {
                summary: "Iniciar sesión (JWT)",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    email: { type: "string", example: "admin@streamstore.test" },
                                    password: { type: "string", example: "Admin123*" }
                                },
                                required: ["email", "password"]
                            }
                        }
                    }
                },
                responses: { "200": { description: "Login exitoso con token y datos de usuario" } }
            }
        },
        "/auth/register": {
            post: {
                summary: "Registro de nuevo usuario",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    nombre: { type: "string", example: "Nuevo Usuario" },
                                    email: { type: "string", example: "usuario@ejemplo.com" },
                                    password: { type: "string", example: "Password123*" }
                                },
                                required: ["nombre", "email", "password"]
                            }
                        }
                    }
                },
                responses: { "201": { description: "Usuario creado exitosamente" } }
            }
        },
        "/auth/me": {
            get: {
                summary: "Perfil del usuario autenticado",
                security: [{ bearerAuth: [] }],
                responses: { "200": { description: "Datos del usuario" } }
            }
        },
        "/plataformas": {
            get: {
                summary: "Listado de plataformas de streaming",
                responses: { "200": { description: "Lista de plataformas activas" } }
            }
        },
        "/productos": {
            get: {
                summary: "Catálogo de productos (Cuentas completas y Pantallas)",
                parameters: [
                    { name: "plataforma", in: "query", schema: { type: "string" } },
                    { name: "tipo", in: "query", schema: { type: "string", enum: ["cuenta_completa", "pantalla"] } }
                ],
                responses: { "200": { description: "Lista de productos" } }
            }
        },
        "/carrito": {
            get: {
                summary: "Obtener carrito del usuario",
                security: [{ bearerAuth: [] }],
                responses: { "200": { description: "Ítems del carrito y total" } }
            },
            post: {
                summary: "Agregar producto al carrito",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    producto_id: { type: "integer", example: 1 },
                                    cantidad: { type: "integer", example: 1 }
                                }
                            }
                        }
                    }
                },
                responses: { "200": { description: "Carrito actualizado" } }
            }
        },
        "/compras": {
            post: {
                summary: "Crear orden de compra pendiente desde el carrito",
                security: [{ bearerAuth: [] }],
                responses: { "201": { description: "Compra creada" } }
            }
        },
        "/compras/{id}/pagar": {
            post: {
                summary: "Pagar y activar compra (simulación transaccional con asignación de inventario)",
                security: [{ bearerAuth: [] }],
                parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    metodo: { type: "string", example: "TARJETA" },
                                    marca: { type: "string", example: "visa" },
                                    ultimos4: { type: "string", example: "4242" }
                                }
                            }
                        }
                    }
                },
                responses: { "200": { description: "Pago aprobado o rechazado" } }
            }
        },
        "/servicios/mios": {
            get: {
                summary: "Servicios activos y credenciales de acceso del cliente",
                security: [{ bearerAuth: [] }],
                responses: { "200": { description: "Lista de servicios" } }
            }
        },
        "/admin/resumen": {
            get: {
                summary: "Métricas y resumen general del panel de administración",
                security: [{ bearerAuth: [] }],
                responses: { "200": { description: "Métricas de ventas e inventario" } }
            }
        },
        "/admin/cuentas": {
            get: {
                summary: "Listado de cuentas y pantallas de inventario",
                security: [{ bearerAuth: [] }],
                responses: { "200": { description: "Inventario admin" } }
            }
        }
    },
    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT"
            }
        }
    }
}

docsRouter.get("/docs.json", (_req, res) => {
    res.json(openApiSpec)
})
