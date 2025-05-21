<template>
  <nav class="navbar navbar-expand-lg fondo-navbar shadow-sm">
    <div class="container-fluid">
      <router-link to="/dashboard" class="navbar-brand d-flex align-items-center gap-2">
        <img src="../assets/images/perro.png" alt="Logo" class="logo-navbar" />
        <span class="texto-logo">Paw Friend</span>
      </router-link>

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
          <li v-for="item in menu" :key="item.nombre" class="nav-item">
            <router-link :to="item.ruta" class="nav-link nav-animada">
              <i class="material-icons me-1">{{ item.icono }}</i>{{ item.nombre }}
            </router-link>
          </li>
        </ul>
        <button class="btn btn-cerrar" @click="cerrarSesion">
          <i class="material-icons me-1">logout</i>
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import { computed } from 'vue'

const router = useRouter()
const usuario = JSON.parse(localStorage.getItem('usuario')) || { rol: 'empleado' }

const menuCompleto = [
  { nombre: 'Inicio', ruta: '/dashboard', icono: 'home', roles: ['administrador', 'empleado'] },
  { nombre: 'Ventas', ruta: '/ventas', icono: 'point_of_sale', roles: ['administrador', 'empleado'] },
  { nombre: 'Clientes', ruta: '/clientes', icono: 'people', roles: ['administrador', 'empleado'] },
  { nombre: 'Inventario', ruta: '/productos', icono: 'inventory_2', roles: ['administrador', 'empleado'] },
  { nombre: 'Servicios', ruta: '/servicios', icono: 'pets', roles: ['administrador', 'empleado'] },
  { nombre: 'Compras', ruta: '/proveedores', icono: 'shopping_cart', roles: ['administrador'] },
  { nombre: 'Usuarios', ruta: '/usuarios', icono: 'person', roles: ['administrador'] }
]


const menu = computed(() => {
  return menuCompleto.filter(item => item.roles.includes(usuario.rol))
})

const cerrarSesion = () => {
  Swal.fire({
    title: '¿Cerrar sesión?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, salir',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#7c245c'
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.removeItem('usuario')
      router.push('/login')
    }
  })
}
</script>

<style scoped>
.fondo-navbar {
  background-color: #7c245c;
  font-family: 'Nunito Sans', sans-serif;
  padding: 0.5rem 1rem;
}

.logo-navbar {
  width: 40px;
  height: 40px;
  object-fit: contain;
  border-radius: 50%;
}

.texto-logo {
  font-weight: bold;
  font-size: 1.2rem;
  color: #ffffff;
}

/* Aumenta espacio entre elementos del menú */
.navbar-nav .nav-item {
  margin-right: 1.5rem;
}

/* Alineación de íconos */
.nav-link {
  color: #ffffff !important;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
}

.nav-link i {
  font-size: 20px;
  margin-right: 6px;
  vertical-align: middle;
}

/* Hover */
.nav-link:hover,
.nav-link.router-link-active {
  color: #cc94ac !important;
  transform: translateY(-2px);
}

/* Botón de cerrar sesión */
.btn-cerrar {
  margin-left: 1rem;
  background-color: transparent;
  color: #fff;
  border-radius: 50%;
  padding: 0.4rem;
  transition: color 0.3s ease;
  border: none;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-cerrar i {
  font-size: 20px;
}

.btn-cerrar:hover {
  color: #cc94ac;
}

</style>
