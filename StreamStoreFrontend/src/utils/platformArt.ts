// Portada oficial de cada plataforma: la misma arte en la tienda y en el panel de administración
const PORTADAS: { claves: string[]; src: string; ancha?: boolean }[] = [
  { claves: ['disney', 'dp'], src: '/targetyas/disneycard.png', ancha: true },
  { claves: ['netflix', 'nf'], src: '/targetyas/netflixcard.svg' },
  { claves: ['max', 'hbo'], src: '/targetyas/HBO_Max.webp' },
  { claves: ['prime', 'amazon', 'pv'], src: '/targetyas/prime_video_card.svg', ancha: true },
  { claves: ['crunchyroll', 'anime'], src: '/targetyas/Crunchyroll.webp' },
  { claves: ['spotify', 'musica'], src: '/targetyas/spotify_premiun.webp', ancha: true },
  { claves: ['paramount', 'paramont'], src: '/brand_logos/paramont.png' },
  { claves: ['apple', 'appletv'], src: '/brand_logos/appletv.webp' },
]

const FALLBACK = '/brand_logos/streamstore_icon.png'

function buscar(...textos: (string | null | undefined)[]) {
  const t = textos.filter(Boolean).join(' ').toLowerCase()
  return PORTADAS.find((p) => p.claves.some((k) => t.includes(k)))
}

/** Portada para una plataforma. `propia` (la subida por el admin) tiene prioridad sobre el arte incluido. */
export function portadaPlataforma(nombre?: string | null, slug?: string | null, propia?: string | null): string {
  return propia || buscar(slug, nombre)?.src || FALLBACK
}

export function esPortadaAncha(src: string): boolean {
  return PORTADAS.some((p) => p.ancha && p.src === src)
}
