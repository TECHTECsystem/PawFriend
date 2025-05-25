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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'

const router = useRouter()

// Leer token y ID desde localStorage
const token = localStorage.getItem('token')
const id_usuario = localStorage.getItem('id_usuario')

// Estado reactivo para guardar los datos del usuario traídos desde el endpoint
const usuario = ref({ nombre: '', rol: '' })

// Definición completa del menú con roles permitidos
const menuCompleto = [
  { nombre: 'Inicio', ruta: '/dashboard', icono: 'home',       roles: ['administrador', 'empleado'] },
  { nombre: 'Ventas', ruta: '/ventas',     icono: 'point_of_sale', roles: ['administrador', 'empleado'] },
  { nombre: 'Clientes', ruta: '/clientes', icono: 'people',     roles: ['administrador', 'empleado'] },
  { nombre: 'Inventario', ruta: '/productos', icono: 'inventory_2', roles: ['administrador', 'empleado'] },
  { nombre: 'Servicios', ruta: '/servicios', icono: 'pets',       roles: ['administrador', 'empleado'] },
  { nombre: 'Compras', ruta: '/proveedores', icono: 'shopping_cart', roles: ['administrador'] },
  { nombre: 'Usuarios', ruta: '/usuarios', icono: 'person',      roles: ['administrador'] },
  
]

// Filtrar el menú en base al rol obtenido desde el backend
const menu = computed(() =>
  menuCompleto.filter(item => item.roles.includes(usuario.value.rol))
)

// Función para cerrar sesión
const cerrarSesion = () => {
  Swal.fire({
    title: '¿Cerrar sesión?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, salir',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#7c245c'
  }).then(result => {
    if (result.isConfirmed) {
      localStorage.removeItem('token')
      localStorage.removeItem('id_usuario')
      router.push('/login')
    }
  })
}

// Al montar el componente, buscamos los datos del usuario en el backend
onMounted(async () => {
  if (!token || !id_usuario) {
    router.push('/login')
    return
  }

  try {
    const res = await fetch(`http://localhost:8080/api/usuarios/${id_usuario}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`)
    }

    const data = await res.json()
    usuario.value = data
  } catch (err) {
    console.error('No se pudo cargar el usuario:', err)
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo verificar tu sesión. Inicia sesión de nuevo.',
      confirmButtonColor: '#7c245c'
    }).then(() => {
      localStorage.removeItem('token')
      localStorage.removeItem('id_usuario')
      router.push('/login')
    })
  }
})

// Sticky/shrink navbar al hacer scroll
onMounted(() => {
  const navbar = document.querySelector('.fondo-navbar')
  function handleScroll() {
    if (window.scrollY > 10) {
      navbar.classList.add('shrink')
    } else {
      navbar.classList.remove('shrink')
    }
  }
  window.addEventListener('scroll', handleScroll)
  // Limpieza
  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
  })
})
</script>


<style scoped>
.fondo-navbar {
  background-color: #7c245c;
  font-family: 'Nunito Sans', sans-serif;
  padding: 1.2rem 2rem; /* Más grande en modo normal */
  transition: padding 0.25s cubic-bezier(0.4,0,0.2,1), box-shadow 0.25s;
  position: sticky;
  top: 0;
  z-index: 1050;
  box-shadow: 0 2px 8px rgba(124,36,92,0.08);
}

.fondo-navbar.shrink {
  padding: 0.5rem 1rem; /* Tamaño actual al hacer scroll */
  box-shadow: 0 4px 16px rgba(124,36,92,0.13);
}

.logo-navbar {
  width: 56px;
  height: 56px;
  object-fit: contain;
  border-radius: 50%;
  transition: width 0.25s, height 0.25s;
}

.fondo-navbar.shrink .logo-navbar {
  width: 40px;
  height: 40px;
}

.texto-logo {
  font-weight: bold;
  font-size: 1.5rem;
  color: #ffffff;
  transition: font-size 0.25s;
}

.fondo-navbar.shrink .texto-logo {
  font-size: 1.2rem;
}

/* Aumenta espacio entre elementos del menú */
.navbar-nav .nav-item {
  margin-right: 1.5rem;
}

/* Alineación de íconos */
.nav-link {
  color: #cc94ac !important; /* Color ACENTO cuando NO está activo */
  background: transparent;
  font-weight: 500;
  transition: color 0.3s ease, background 0.3s ease, transform 0.3s;
  display: flex;
  align-items: center;
}

.nav-link.router-link-active,
.nav-link:focus,
.nav-link:hover {
  color: #fff !important; /* Blanco cuando está activo o hover */
  background: transparent;
  border-radius: 0;
  transform: none;
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
