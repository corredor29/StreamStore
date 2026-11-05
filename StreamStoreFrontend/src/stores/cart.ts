import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { CarritoItem, Producto } from '@/types'

export const useCartStore = defineStore('cart', () => {
  const items = ref<CarritoItem[]>([])

  const count = computed(() => items.value.reduce((acc, i) => acc + i.cantidad, 0))
  const total = computed(() => items.value.reduce((acc, i) => acc + i.subtotal, 0))

  function addItem(producto: Producto, cantidad = 1): { success: boolean; message?: string } {
    if (producto.stock <= 0) {
      return { success: false, message: 'Producto agotado.' }
    }

    const existing = items.value.find((i) => i.productoId === producto.id)
    if (existing) {
      const nuevaCantidad = existing.cantidad + cantidad
      if (nuevaCantidad > producto.stock) {
        return {
          success: false,
          message: `Stock máximo disponible alcanzado (${producto.stock} unidades).`,
        }
      }
      existing.cantidad = nuevaCantidad
      existing.subtotal = existing.cantidad * producto.precio
      return { success: true }
    }

    if (cantidad > producto.stock) {
      return {
        success: false,
        message: `Solo hay ${producto.stock} unidad(es) disponible(s).`,
      }
    }

    items.value.push({
      id: Date.now() + Math.floor(Math.random() * 1000),
      productoId: producto.id,
      producto,
      cantidad,
      subtotal: producto.precio * cantidad,
    })

    return { success: true }
  }

  function updateQuantity(itemId: number, cantidad: number): boolean {
    const item = items.value.find((i) => i.id === itemId)
    if (!item) return false
    if (cantidad <= 0) {
      removeItem(itemId)
      return true
    }
    if (cantidad > item.producto.stock) return false
    item.cantidad = cantidad
    item.subtotal = item.cantidad * item.producto.precio
    return true
  }

  function removeItem(itemId: number): void {
    items.value = items.value.filter((i) => i.id !== itemId)
  }

  function clear(): void {
    items.value = []
  }

  return { items, count, total, addItem, updateQuantity, removeItem, clear }
})
