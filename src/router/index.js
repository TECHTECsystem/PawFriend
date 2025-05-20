import { createRouter, createWebHistory } from 'vue-router'

import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import Ventas from '../views/Ventas.vue'
import Clientes from '../views/Clientes.vue'
import Productos from '../views/Productos.vue'
import Servicios from '../views/Servicios.vue'
import Proveedores from '../views/Proveedores.vue'
import Usuarios from '../views/Usuarios.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/dashboard', component: Dashboard },
  { path: '/ventas', component: Ventas, meta: { roles: ['administrador', 'empleado'] } },
  { path: '/clientes', component: Clientes, meta: { roles: ['administrador', 'empleado'] } },
  { path: '/productos', component: Productos, meta: { roles: ['administrador', 'empleado'] } },
  { path: '/servicios', component: Servicios, meta: { roles: ['administrador', 'empleado'] } },
  { path: '/proveedores', component: Proveedores, meta: { roles: ['administrador'] } },
  { path: '/usuarios', component: Usuarios, meta: { roles: ['administrador'] } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

//Middleware global: protección por rol
router.beforeEach((to, from, next) => {
  const usuario = JSON.parse(localStorage.getItem('usuario'))
  const rol = usuario?.rol

  // Si la ruta no tiene restricciones, permitir
  if (!to.meta.roles || to.meta.roles.includes(rol)) {
    next()
  } else {
    // Redirigir a dashboard si no tiene permiso
    next('/dashboard')
  }
})

export default router

