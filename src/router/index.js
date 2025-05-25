import { createRouter, createWebHistory } from 'vue-router'

import Login     from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import Ventas    from '../views/Ventas.vue'
import Clientes  from '../views/Clientes.vue'
import Productos from '../views/Productos.vue'
import Servicios from '../views/Servicios.vue'
import Proveedores from '../views/Proveedores.vue'
import Usuarios  from '../views/Usuarios.vue'

const routes = [
  { path: '/',          redirect: '/login' },
  { path: '/login',     component: Login },
  { path: '/dashboard', component: Dashboard },
  { path: '/ventas',    component: Ventas,      meta: { roles: ['administrador','empleado'] } },
  { path: '/clientes',  component: Clientes,    meta: { roles: ['administrador','empleado'] } },
  { path: '/productos', component: Productos,   meta: { roles: ['administrador','empleado'] } },
  { path: '/servicios', component: Servicios,   meta: { roles: ['administrador','empleado'] } },
  { path: '/proveedores',component: Proveedores,meta: { roles: ['administrador'] } },
  { path: '/usuarios',  component: Usuarios,    meta: { roles: ['administrador'] } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// protección global por token + rol
router.beforeEach(async (to, from, next) => {
  const token      = localStorage.getItem('token')
  const id_usuario = localStorage.getItem('id_usuario')

  // Si no está logueado, cualquier ruta redirige a login
  if (!id_usuario) {
    if (to.path !== '/login') {
      return next('/login')
    } else {
      return next()
    }
  }

  // Si está logueado y entra a /login, redirige a dashboard
  if (to.path === '/login' && id_usuario) {
    return next('/dashboard')
  }

  // dejamos libre el login
  if (to.path === '/login') {
    return next()
  }

  // si no hay token/id, forzamos login
  if (!token) {
    return next('/login')
  }

  try {
    // obtenemos datos del usuario desde el endpoint
    const res = await fetch(
      `http://localhost:8080/api/usuarios/${id_usuario}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    )
    if (!res.ok) throw new Error('No autorizado')

    const user = await res.json()
    const rol  = user.rol

    // validamos el rol contra meta.roles
    if (!to.meta.roles || to.meta.roles.includes(rol)) {
      return next()
    } else {
      return next('/dashboard')
    }

  } catch (err) {
    // en caso de error (token vencido, 401, etc) limpiamos y vamos a login
    localStorage.clear()
    return next('/login')
  }
})

export default router
