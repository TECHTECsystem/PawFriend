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
  { path: '/ventas', component: Ventas },
  { path: '/clientes', component: Clientes },
  { path: '/productos', component: Productos },
  { path: '/servicios', component: Servicios },
  { path: '/proveedores', component: Proveedores },
  { path: '/usuarios', component: Usuarios },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
