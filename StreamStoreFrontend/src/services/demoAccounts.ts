// Cuentas del seed de desarrollo (StreamStoreBackend/src/database/seed.ts).
// Solo se importa dentro de `if (import.meta.env.DEV)`: Vite la elimina del build de producción,
// así estas contraseñas nunca llegan al JavaScript público.
export const DEMO_ACCOUNTS = {
  cliente: { email: 'cliente1@streamstore.test', password: 'Cliente123*', nombre: 'Laura Cliente' },
  admin: { email: 'admin@streamstore.test', password: 'Admin123*', nombre: 'Admin StreamStore' },
} as const
