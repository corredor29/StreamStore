import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    requiresAuth?: boolean
    role?: 'cliente' | 'admin'
    guestOnly?: boolean
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/PublicLayout.vue'),
    children: [
      { path: '', name: 'home', component: () => import('@/views/HomeView.vue'), meta: { title: 'Inicio' } },
      { path: 'catalogo', name: 'catalog', component: () => import('@/views/CatalogView.vue'), meta: { title: 'CatÃ¡logo' } },
      { path: 'productos/:id(\\d+)', name: 'product', component: () => import('@/views/ProductDetailView.vue'), props: (r) => ({ id: Number(r.params.id) }), meta: { title: 'Producto' } },
      { path: 'login', name: 'login', component: () => import('@/views/LoginView.vue'), meta: { title: 'Iniciar sesiÃ³n', guestOnly: true } },
      { path: 'registro', name: 'register', component: () => import('@/views/RegisterView.vue'), meta: { title: 'Crear cuenta', guestOnly: true } },
      { path: 'carrito', name: 'cart', component: () => import('@/views/CartView.vue'), meta: { title: 'Carrito' } },
      { path: 'checkout', name: 'checkout', component: () => import('@/views/CheckoutView.vue'), meta: { title: 'Pago', requiresAuth: true } },
    ],
  },
  {
    path: '/mi-cuenta',
    component: () => import('@/layouts/ClientLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'my-account', component: () => import('@/views/MyAccountView.vue'), meta: { title: 'Mi cuenta' } },
    ],
  },
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      { path: '', name: 'admin', component: () => import('@/views/AdminView.vue'), meta: { title: 'AdministraciÃ³n' } },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/layouts/PublicLayout.vue'),
    children: [{ path: '', name: 'not-found', component: () => import('@/views/NotFoundView.vue'), meta: { title: 'PÃ¡gina no encontrada' } }],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, _from, saved) {
    if (saved) return saved
    if (to.hash) return { el: to.hash }
    return { top: 0 }
  },
})

// Guardias de navegaciÃ³n para protecciÃ³n de rutas y separaciÃ³n de permisos
router.beforeEach((to) => {
  const auth = useAuthStore()

  // 1. Proteger rutas que requieren autenticaciÃ³n
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return {
      name: 'login',
      query: { redirect: to.fullPath },
    }
  }

  // 2. Proteger rutas administrativas (solo rol 'admin')
  if (to.meta.role === 'admin' && !auth.isAdmin) {
    return { name: 'my-account' }
  }

  // 3. Rutas exclusivas de invitados (login / registro)
  if (to.meta.guestOnly && auth.isAuthenticated) {
    return auth.isAdmin ? { name: 'admin' } : { name: 'my-account' }
  }
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} Â· StreamStore` : 'StreamStore'
})

export default router
