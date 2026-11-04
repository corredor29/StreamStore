# StreamStore Backend

API REST de StreamStore con Node 24, Express 5, TypeScript, Sequelize y MySQL.

## Requisitos
- Node 24 (ver `.nvmrc`)
- MySQL 8

## Instalación
```
npm install
copy .env.example .env
```
Crear la base con `database/streamStoreDb.sql`.

## Scripts
- `npm run dev` desarrollo con tsx watch
- `npm run type-check` verificación de tipos
- `npm run build` compila a `dist`
- `npm start` ejecuta la build

## Endpoints
- `GET /api/health`
- `POST /api/auth/login`
- `GET /api/auth/me`

## Estructura
`src/` en capas: config, routes, controllers, services, repositories, models, validators, middlewares, interfaces, utils. Auth vive en la raíz de cada capa; los dominios (products, cart, orders, users) en subcarpetas.

## Convenciones
4 espacios, comillas dobles, sin punto y coma, sin comentarios. Respuestas `{ message, data }` o `{ error }`.
