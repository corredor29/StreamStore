import { onMounted } from 'vue'

// Mismo identificador que usa el inicio: la hoja de fuentes se añade una sola vez.
const FONT_LINK_ID = 'home-fonts-sora-manrope'
const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Sora:wght@600;700;800&display=swap'

/**
 * Carga Sora y Manrope para las vistas públicas y del cliente.
 * Solo las usan las clases `.ss-page` y `.home-type`, así que la administración no cambia.
 */
export function useClientFonts(): void {
  onMounted(() => {
    if (typeof document === 'undefined' || document.getElementById(FONT_LINK_ID)) return
    const link = document.createElement('link')
    link.id = FONT_LINK_ID
    link.rel = 'stylesheet'
    link.href = FONT_HREF
    document.head.appendChild(link)
  })
}
