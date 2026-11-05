// Datos simulados TEMPORALES que reproducen el contrato acordado.
// Se usan solo cuando VITE_USE_MOCKS=true. Todos los datos son ficticios.
import type { Plataforma, Producto } from '@/types'

export const mockPlataformas: Plataforma[] = [
  { id: 1, nombre: 'Netflix', slug: 'netflix', color: '#E50914', activa: true },
  { id: 2, nombre: 'Disney+', slug: 'disney', color: '#113CCF', activa: true },
  { id: 3, nombre: 'Prime Video', slug: 'prime', color: '#00A8E1', activa: true },
  { id: 4, nombre: 'Max', slug: 'max', color: '#7B2FF7', activa: true },
]

const ref = (id: number) => {
  const p = mockPlataformas.find((x) => x.id === id)!
  return { id: p.id, nombre: p.nombre, slug: p.slug, color: p.color }
}

export const mockProductos: Producto[] = [
  { id: 1, plataformaId: 1, plataforma: ref(1), nombre: 'Netflix Cuenta Completa', tipo: 'CUENTA_COMPLETA', duracionDias: 30, precio: 38000, stock: 3, activo: true },
  { id: 2, plataformaId: 1, plataforma: ref(1), nombre: 'Netflix Pantalla', tipo: 'PANTALLA', duracionDias: 30, precio: 12000, stock: 10, activo: true },
  { id: 3, plataformaId: 2, plataforma: ref(2), nombre: 'Disney+ Cuenta Completa', tipo: 'CUENTA_COMPLETA', duracionDias: 30, precio: 30000, stock: 0, activo: true },
  { id: 4, plataformaId: 2, plataforma: ref(2), nombre: 'Disney+ Pantalla', tipo: 'PANTALLA', duracionDias: 30, precio: 9000, stock: 6, activo: true },
  { id: 5, plataformaId: 3, plataforma: ref(3), nombre: 'Prime Video Cuenta Completa', tipo: 'CUENTA_COMPLETA', duracionDias: 30, precio: 25000, stock: 2, activo: true },
  { id: 6, plataformaId: 3, plataforma: ref(3), nombre: 'Prime Video Pantalla', tipo: 'PANTALLA', duracionDias: 30, precio: 8000, stock: 0, activo: true },
  { id: 7, plataformaId: 4, plataforma: ref(4), nombre: 'Max Cuenta Completa', tipo: 'CUENTA_COMPLETA', duracionDias: 30, precio: 28000, stock: 1, activo: true },
  { id: 8, plataformaId: 4, plataforma: ref(4), nombre: 'Max Pantalla', tipo: 'PANTALLA', duracionDias: 30, precio: 9500, stock: 8, activo: true },
]
