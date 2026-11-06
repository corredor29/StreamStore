# StreamStore Backend

API REST para la venta de cuentas y pantallas de streaming (reto Campuslands).
Stack: **Node.js + Express 5 + TypeScript + MySQL/MariaDB + Sequelize**, validación **Zod**, JWT + bcrypt, AES-256-GCM, node-cron + nodemailer (Mailtrap).

> Todas las credenciales de streaming del seed son **ficticias** (`*@streamstore-demo.test`).

## Arquitectura (capas)

Cada petición baja por route → middlewares → controller → service → repository → model. Auth vive en la raíz de cada capa; el resto va en la subcarpeta de su dominio, que es la misma en todas las capas:

| Carpeta | Contenido |
|---|---|
| `products/` | plataformas, productos y cuentas/pantallas (inventario y stock) |
| `cart/` | carrito |
| `orders/` | compras, servicios que genera cada compra y alertas de vencimiento |
| `users/` | usuarios |

```
src/
  config/          config.ts (único que lee process.env), database.ts (Sequelize + modelos + withTransaction), zod.ts
  models/          columnas.ts + products/ cart/ orders/ users/ (un archivo por tabla)
  repositories/    AuthRepository.ts + products/ cart/ orders/ users/; los SELECT ... FOR UPDATE del pago están en products/
  services/        AuthService.ts, CorreoAuth.ts + products/ cart/ orders/ users/
  controllers/     AuthController.ts + products/ cart/ orders/ users/ (métodos estáticos con try/catch y ApiResponse)
  routes/          index.ts, AuthRoutes.ts, AdminRoutes.ts (/api/admin) + products/ cart/ orders/
  validators/      AuthValidators.ts, CommonValidators.ts + products/ cart/ orders/
  interfaces/      AuthUser.ts + products/ cart/ orders/ users/ (tipos de cada dominio: estados, payloads de creación, respuestas armadas)
  middlewares/     AuthMiddleware, RoleMiddleware, validateSchema, ErrorMiddleware, NotFoundMiddleware
  jobs/            node-cron de alertas de vencimiento
  utils/           apiResponse, httpError, crypto (AES-256-GCM), mailer, logger, formatters
  database/        seed.ts

database/streamStoreDb.sql      esquema SQL (fuente única) + vista v_stock_productos
database/migrations/            cambios para bases ya creadas (idempotentes)
postman/                        colección de Postman
```

`validateSchema(schema, "query" | "params")` deja el resultado en `res.locals.query` / `res.locals.params` (en Express 5 `req.query` es de solo lectura).

## Levantar

```bash
# 1. MySQL/MariaDB encendido (XAMPP: iniciar MySQL en el panel)
cp .env.example .env        # ajustar DB_*, JWT_SECRET, AES_SECRET, MAIL_*
npm install
npm run db:reset            # crea BD + tablas (database/streamStoreDb.sql) y carga seeds
npm run dev                 # http://localhost:3000/api/health
```

`npm run db:reset` **borra y recrea** las tablas.

Para conservar los datos usa `npm run migrate`. Crea la base si no existe; si está vacía crea el esquema completo sin datos demo, y si ya tiene tablas aplica en orden las migraciones de `database/migrations/`, que se pueden repetir sin daño.

| URL | Qué es |
|---|---|
| http://localhost:3000/swagger (o `/api-docs`) | Swagger UI con todos los endpoints. Haz login, copia `data.token` y pégalo en **Authorize** |
| http://localhost:3000/api/docs.json | Spec OpenAPI 3 |

Swagger UI se carga desde el CDN de cdnjs, así que esa página necesita internet. La API no.

`HOST` en `.env` va vacío por defecto: Node escucha en todas las interfaces IPv4 e IPv6, y `localhost` funciona por `127.0.0.1` y por `::1`. Con `127.0.0.1` la API solo acepta conexiones de esta máquina. Con `0.0.0.0` solo escucha IPv4 y queda visible en la red local.

### Backend y frontend juntos

Desde la raíz del repo (`StreamStore/`):

```bash
npm run install:all   # instala dependencias de backend y frontend
npm run migrate       # o npm run db:reset para datos demo
npm run dev           # backend :3000 + frontend :5173; Ctrl+C detiene ambos
```

Si uno de los dos se cae, el lanzador (`run_all.js`) detiene también el otro.

## Usuarios demo

| Rol | Email | Password |
|---|---|---|
| admin | admin@streamstore.test | Admin123* |
| cliente | cliente1@streamstore.test | Cliente123* |
| cliente | cliente2@streamstore.test | Cliente123* |

Seeds: 4 plataformas (Netflix, Disney+, Prime Video, Max), 2 productos por plataforma (cuenta completa | pantalla, 30 días),
3 cuentas por plataforma con sus pantallas, servicios que vencen en **3 días** (cliente1/Max) y **1 día** (cliente2/Max) y uno **ya vencido**
(cliente1/Netflix), y **stock bajo** en "Max - Cuenta completa" (stock 1 ≤ mínimo 2).

## Reglas de stock

- **Pantalla**: pantallas `disponible` de cuentas `disponible` de la plataforma.
- **Cuenta completa**: cuentas `disponible` cuyas pantallas están **todas** disponibles.
- Vender cuenta completa marca la cuenta `vendida_completa` y todas sus pantallas `vendida`. Vender una pantalla la marca `vendida` (esa cuenta deja de contar como completa).
- `stock_bajo = stock <= stock_minimo`.

## Compra en 2 pasos (cero sobreventa)

1. `POST /api/compras` crea la compra **pendiente** con los ítems del carrito (precios congelados). **No aparta stock** ni crea servicios.
2. `POST /api/compras/:id/pagar` (pago simulado) hace todo en **una transacción** MySQL: bloquea la compra y las plataformas (`SELECT ... FOR UPDATE`),
   toma cuentas/pantallas disponibles con `FOR UPDATE`; si no alcanzan responde **409** indicando el producto agotado y hace ROLLBACK.
   Si alcanza: marca inventario vendido, crea un servicio por unidad con su vencimiento, compra → `pagada` y vacía el carrito.
   Pagar una compra que no está `pendiente` → 409.

## Postman

Importa [`postman/StreamStore.postman_collection.json`](postman/StreamStore.postman_collection.json): 57 peticiones en 8 carpetas (Salud, Auth, Catálogo, Carrito, Compras, Servicios, Admin, Portadas y entrega de credenciales).

1. `npm run db:reset` y `npm run dev`.
2. Si tu API no está en `http://localhost:3000/api`, cambia la variable `baseUrl` de la colección.
3. Ejecútala completa con el **Runner** en orden: los logins guardan `token` y `adminToken`, y cada paso guarda el ID que usa el siguiente (producto → carrito → compra → pago → servicio → renovación).

En "Subir portada" selecciona una imagen en el campo `imagen` (form-data) antes de correrla.

Para probar "Restablecer contraseña", copia en la variable `resetToken` el token que imprime la consola del servidor después de "Recuperar contraseña".

## Contrato API (PDF del reto)

Respuestas:

| Caso | Status | Cuerpo |
|---|---|---|
| Éxito | 200 / 201 | `{ message, data }` |
| Validación (Zod) | 400 | `{ error: "Datos inválidos", errors: { campo: ["mensaje"] } }` |
| JSON mal formado | 400 | `{ error }` |
| Error de negocio | 401 / 403 / 404 / 409 | `{ error }`; el 409 de stock agotado agrega `data: { producto_id, disponible }` |
| Error inesperado | 500 | `{ error: "Error interno del servidor" }`, registrado en `logs/errors.log` |

Auth: `Authorization: Bearer <token>` (o cookie httpOnly `token`).

| Método | Ruta | Acceso | Body / notas |
|---|---|---|---|
| POST | /api/auth/register | público | `{ nombre, email, password, telefono? }` (rol cliente) |
| POST | /api/auth/login | público | `{ email, password }` → `{ token, user }` |
| GET | /api/auth/me | cliente | incluye `telefono` |
| POST | /api/auth/recuperar | público | `{ email }` → siempre 200 con el mismo mensaje; si existe, envía el enlace (RF-13) |
| POST | /api/auth/restablecer | público | `{ token, password }` → cambia la contraseña; el token sirve una vez y vence en 60 min |
| GET | /api/plataformas | público | plataformas activas |
| GET | /api/productos?plataforma=&tipo= | público | `plataforma` = id o nombre; `tipo` = `cuenta_completa`\|`pantalla`. Incluye `stock` |
| GET | /api/productos/:id | público | detalle con stock |
| GET | /api/carrito | cliente | ítems con subtotales, total y stock actual |
| POST | /api/carrito | cliente | `{ producto_id, cantidad }` (si ya está, suma) |
| PATCH | /api/carrito/:itemId | cliente | `{ cantidad }` |
| DELETE | /api/carrito/:itemId | cliente | quitar ítem |
| DELETE | /api/carrito | cliente | vaciar |
| POST | /api/compras | cliente | checkout → compra `pendiente`. Body opcional `{ metodo_pago? }` |
| POST | /api/compras/:id/pagar | cliente | pago simulado transaccional. Body opcional `{ metodo_pago? }` |
| GET | /api/compras/mias | cliente | historial |
| GET | /api/compras/:id | cliente | detalle con ítems |
| GET | /api/servicios/mios | cliente | servicios con vencimiento, `dias_restantes`, `estado` (`activo`\|`por_vencer`\|`vencido`), `estado_entrega` (`entregado`|`pendiente_asignacion`), `credenciales` (`null` si venció o aún no se entregan), `renovado` y `renovacion_de_id` |
| POST | /api/servicios/:id/renovar | cliente | agrega al carrito la renovación de ese servicio (RF-12). Ver "Renovaciones" |
| POST | /api/admin/cuentas | admin | `{ plataforma_id, email, password }` → crea `max_pantallas` pantallas según la plataforma. Sin `email`/`password` la cuenta queda pendiente de asignación; con `cantidad` (1-50) crea varias pendientes y devuelve un arreglo |
| GET | /api/admin/cuentas?plataforma_id=&credenciales= | admin | inventario (sin password) con `credenciales_asignadas`; `credenciales` = `asignadas`|`pendientes` |
| CRUD | /api/admin/plataformas[/:id] | admin | GET, POST, PUT/PATCH, DELETE (borrado lógico: `activo=false`) |
| CRUD | /api/admin/productos[/:id] | admin | GET, POST, PUT/PATCH, DELETE (borrado lógico) |
| GET | /api/admin/compras?estado=&desde=&hasta= | admin | ventas con filtros |
| GET | /api/admin/resumen | admin | totales de ventas (hoy/mes/histórico) y stock por plataforma |
| POST | /api/admin/cron/ejecutar | admin | ejecuta la revisión de vencimientos ya |
| GET | /api/admin/combos | admin | combos promocionales con sus plataformas |
| POST | /api/admin/combos | admin | crea un combo (mínimo 2 plataformas, precio promo ≤ regular) |
| PATCH | /api/admin/combos/:id | admin | edita un combo |
| PATCH | /api/admin/combos/:id/toggle | admin | activa o desactiva un combo |
| DELETE | /api/admin/combos/:id | admin | elimina un combo |

### Rutas extra

| Método | Ruta | Nota |
|---|---|---|
| GET | /api/health | estado API + DB |
| POST | /api/auth/logout | borra la cookie |
| GET | /api/plataformas/:id | con productos y stock |
| GET | /api/productos?plataforma_id= | filtro por id |
| GET | /api/servicios/:id | detalle con credenciales (dueño o admin) |
| GET | /api/admin/usuarios | usuarios sin password |
| GET | /api/admin/servicios?entrega= | todos los servicios; `entrega=pendiente_asignacion` lista los que esperan credenciales |
| PATCH/PUT | /api/admin/servicios/:id/credenciales | entrega credenciales. Ver "Inventario sin credenciales" |
| POST | /api/admin/upload | sube una portada (`multipart/form-data`, campo `imagen`). Ver "Portadas" |
| GET | /api/admin/productos/stock-bajo | productos con `stock <= stock_minimo` |
| GET | /api/admin/cuentas/:id | una cuenta con sus pantallas |

## Portadas

`POST /api/admin/upload` recibe una imagen en el campo `imagen` (`multipart/form-data`): JPG, PNG, WEBP o GIF de hasta `UPLOAD_MAX_MB` (2 MB por defecto). Se revisa la firma real del archivo, no solo el tipo que declara el cliente.

- Se guarda en `UPLOAD_DIR/portadas` (por defecto `uploads/`, fuera de git) con un nombre aleatorio y se sirve en `/uploads/portadas/<archivo>`.
- Responde `201 { url, ruta, nombre_original, tipo, tamano }`. `url` usa `PUBLIC_URL`.
- El frontend guarda esa `url` como `portada_url` al crear o editar la plataforma (`POST/PATCH /api/admin/plataformas`). `portada_url: null` la quita.
- Errores: 400 sin archivo o con otro campo, 413 si pesa más del límite, 415 si no es una imagen permitida.

## Inventario sin credenciales

El admin puede cargar cuentas solo con la plataforma y entregar el correo, la contraseña y el PIN después de la compra.

1. `POST /api/admin/cuentas { plataforma_id, cantidad? }` sin `email`/`password`: crea la cuenta y sus pantallas, que cuentan para el stock y se venden normal. Al vender, se usan primero las cuentas que ya tienen credenciales.
2. Si al pagar el servicio cae en una cuenta sin credenciales, queda con `estado_entrega: "pendiente_asignacion"` y el cliente ve `credenciales: null` en Mis servicios.
3. `GET /api/admin/servicios?entrega=pendiente_asignacion` lista lo que falta entregar.
4. `PATCH /api/admin/servicios/:id/credenciales`:

   | Campo | Uso |
   |---|---|
   | `email`, `password` | van juntos; se guardan en la cuenta (cifrado AES). Obligatorios si la cuenta aún no tiene credenciales |
   | `pin`, `perfil` | servicio de pantalla: cambian su pantalla |
   | `pantallas: [{ numero, pin?, perfil? }]` | servicio de cuenta completa: cambian esas pantallas |
   | `notificar` | por defecto `true`: envía al cliente un correo con sus datos de acceso |

   Marca el servicio como `entregado` (`entregado_at`) y responde el detalle con `credenciales` y `notificado`. También sirve para corregir credenciales ya entregadas. Las credenciales quedan en la cuenta: los demás servicios de esa cuenta siguen pendientes hasta que el admin los entregue.

## Renovaciones (RF-12)

1. `POST /api/servicios/:id/renovar` agrega al carrito una línea con `renovacion: { servicio_id, vence }`. Siempre es 1 unidad, **no consume stock** y no se duplica si se pide dos veces.
2. El checkout copia el `servicio_id` a `compra_items`.
3. Al pagar, dentro de la misma transacción: bloquea el servicio original (`FOR UPDATE`), verifica que sea del cliente, que no se haya renovado y que su cuenta no esté `inactiva`, y crea un servicio nuevo con la **misma cuenta y pantalla** (mismo perfil y PIN).
   - Empieza cuando vence el anterior, o desde ahora si ya venció, y dura `duracion_dias` del producto.
   - Apaga las alertas del servicio original para que no llegue un "venció" de algo ya renovado.
   - `servicios.renovacion_de_id` es único: un servicio solo se puede renovar una vez (sí se puede renovar la renovación).

## Migraciones

Para una base creada antes de estos cambios (sin perder datos), aplicar en orden:

```bash
mysql -u root streamStoreDb < database/migrations/20261105_add_max_pantallas_plataformas.sql
mysql -u root streamStoreDb < database/migrations/20261105_renovacion_servicios.sql
mysql -u root streamStoreDb < database/migrations/20261105_usuarios_telefono_y_reset.sql
mysql -u root streamStoreDb < database/migrations/20261105_portadas_y_entrega_credenciales.sql
```

O todas de una vez: `npm run migrate`. Son idempotentes (revisan `information_schema`), se pueden correr más de una vez. `npm run db:reset` recrea todo desde cero.

## Recuperar contraseña (RF-13)

- `POST /api/auth/recuperar` genera un token aleatorio de 32 bytes y guarda **solo su hash SHA-256** en `usuarios.reset_token_hash`, con vencimiento de 60 minutos.
- El correo lleva el enlace `CLIENT_URL/restablecer?token=<token>`; el front debe enviar ese token a `POST /api/auth/restablecer`.
- Pedir otro enlace invalida el anterior, y al usarlo se borra.
- Fuera de producción el token también se escribe en el log (`[auth] token de recuperación ...`) para poder probar sin Mailtrap.
- Los JWT ya emitidos siguen valiendo hasta que expiran (`JWT_EXPIRES_IN`).

## Correo (Mailtrap)

Variables en `.env` (ver `.env.example`, **nunca** subir valores reales):

| Variable | Valor |
|---|---|
| MAIL_HOST | `sandbox.smtp.mailtrap.io` |
| MAIL_PORT | `2525` (o 587) |
| MAIL_USER | *Username* de Mailtrap → Email Testing → Inbox → SMTP Settings |
| MAIL_PASS | *Password* del mismo panel |
| MAIL_FROM | remitente, p.ej. `StreamStore <no-reply@streamstore.test>` |

Si `MAIL_USER`/`MAIL_PASS` están vacíos los correos se **simulan** (se registran en el log como `[mail:simulado]`).
Con credenciales, `POST /api/admin/cron/ejecutar` los envía al inbox de Mailtrap al instante.

## Alertas (cron + correo)

`node-cron` (`CRON_SCHEDULE`, por defecto `0 8 * * *` en `APP_TIMEZONE`) y `POST /api/admin/cron/ejecutar` cuentan **días de calendario** hasta el vencimiento:

| Días que faltan | Correo | Asunto de ejemplo |
|---|---|---|
| 3 (o 2 si el cron no corrió antes) | `3_dias` | Tu pantalla de Netflix vence en 3 días |
| 1 | `1_dia` | Tu pantalla de Netflix vence en 1 día |
| 0 o ya pasó | `vencimiento` | Tu pantalla de Netflix vence hoy / venció |

- El correo trae el nombre del cliente, la plataforma, la modalidad, la fecha de vencimiento y un botón **Renovar** (`CLIENT_URL/mi-cuenta?renovar=<id>`).
- Después de avisar, marca como `vencido` los servicios cuya fecha ya pasó.
- Las banderas `alerta_3d_enviada / alerta_1d_enviada / alerta_vencido_enviada` evitan que un correo se repita.
- La respuesta trae `{ ejecutado_en, marcados_vencidos, "3_dias", "1_dia", vencimiento }`, cada uno con `{ encontrados, enviados, errores }`.

Con `MAIL_USER/MAIL_PASS` de Mailtrap se envía por SMTP sandbox; si están vacíos el correo se simula y se registra en el log.

## Pendiente / decisiones

- Al vencer un servicio la pantalla/cuenta **no** se libera automáticamente (habría que rotar la contraseña antes de revender).
- Pago simulado (sin pasarela real).
