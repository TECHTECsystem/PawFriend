<template>
  <Navbar />

  <div class="container mt-4">
    <!-- Encabezado -->
    <div class="encabezado-dashboard d-flex flex-wrap justify-content-between align-items-center p-3 mb-4">
      <div class="saludo">
        <h4 class="m-0">
          Hola, {{ usuario.nombre }} <span class="rol">({{ usuario.rol }})</span>
        </h4>
      </div>
      <div class="reloj text-end">
        <p class="m-0">{{ fecha }}</p>
        <p class="m-0">{{ hora }}</p>
      </div>
    </div>

    <!-- Tarjetas KPI -->
    <div class="row mb-4">
      <div class="col-md-6 col-lg-3 mb-3" v-for="(kpi, index) in kpis" :key="index">
        <div class="card tarjeta-kpi h-100">
          <div class="card-body d-flex align-items-center">
            <i class="material-icons kpi-icon me-3">{{ kpi.icono }}</i>
            <div>
              <h5 class="card-title m-0">{{ kpi.valor }}</h5>
              <p class="card-text small">{{ kpi.titulo }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Citas y productos -->
    <div class="row">
      <!-- Citas agendadas -->
      <div class="col-md-6 mb-4">
        <div class="card h-100 tarjeta-tabla">
          <div class="card-body">
            <h5 class="card-title d-flex align-items-center">
              <i class="material-icons me-2">event_note</i>
              Citas agendadas hoy
            </h5>

            <div class="tabla-scroll">
              <table class="table table-sm align-middle mb-0">
                <thead>
                  <tr>
                    <th>Hora</th>
                    <th>Nombre</th>
                    <th>Servicio</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(cita, index) in citasPaginadas" :key="index">
                    <td>{{ cita.hora }}</td>
                    <td>{{ cita.nombre }}</td>
                    <td>{{ cita.servicio }}</td>
                  </tr>
                  <tr v-if="citasPaginadas.length === 0">
                    <td colspan="3" class="text-muted">Sin citas registradas.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="d-flex justify-content-end mt-2">
              <button class="btn btn-outline-light btn-sm me-2" :disabled="paginaCitas === 1" @click="paginaCitas--">Anterior</button>
              <button class="btn btn-outline-light btn-sm" :disabled="paginaCitas === totalPaginasCitas" @click="paginaCitas++">Siguiente</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Productos con stock bajo -->
      <div class="col-md-6 mb-4">
        <div class="card h-100 tarjeta-tabla">
          <div class="card-body">
            <h5 class="card-title d-flex align-items-center">
              <i class="material-icons me-2 text-warning">warning</i>
              Productos con stock bajo
            </h5>

            <div class="tabla-scroll">
              <table class="table table-sm align-middle mb-0">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Stock</th>
                    <th>Mínimo</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(producto, index) in productosPaginados" :key="index">
                    <td>{{ producto.nombre }}</td>
                    <td>{{ producto.stock }}</td>
                    <td>{{ producto.minimo }}</td>
                  </tr>
                  <tr v-if="productosPaginados.length === 0">
                    <td colspan="3" class="text-muted">Todo en orden.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="d-flex justify-content-end mt-2">
              <button class="btn btn-outline-light btn-sm me-2" :disabled="paginaProductos === 1" @click="paginaProductos--">Anterior</button>
              <button class="btn btn-outline-light btn-sm" :disabled="paginaProductos === totalPaginasProductos" @click="paginaProductos++">Siguiente</button>
            </div>
          </div>
        </div>
      </div>
    </div>

<!-- Accesos rápidos -->
<div class="row mb-4">
  <div
    class="col-12 col-sm-6 col-lg-3"
    v-for="(acceso, i) in accesos"
    :key="i"
  >
    <router-link :to="acceso.ruta" class="btn-acceso-grande d-flex flex-column align-items-center justify-content-center text-center">
      <i class="material-icons mb-2">{{ acceso.icono }}</i>
      <span>{{ acceso.label }}</span>
    </router-link>
  </div>
</div>



    <!-- Footer -->
  </div>
</template>

<script>
import Navbar from '../components/Navbar.vue'
import { useRouter } from 'vue-router'

export default {
  name: 'Dashboard',
  components: { Navbar },
  data() {
    return {
      usuario: { nombre: '', rol: '' },
      fecha: '',
      hora: '',
      intervalo: null,

      kpis: [
        { titulo: 'Ventas del día', valor: '$1,200', icono: 'attach_money' },
        { titulo: 'Ventas del mes', valor: '$18,450', icono: 'calendar_today' },
        { titulo: 'Clientes registrados', valor: '87', icono: 'people' },
        { titulo: 'Productos activos', valor: '312', icono: 'inventory_2' }
      ],

      accesos: [
        { label: 'Nueva venta', icono: 'point_of_sale', ruta: '/ventas' },
        { label: 'Registrar cliente', icono: 'person_add', ruta: '/clientes' },
        { label: 'Agregar producto', icono: 'add_box', ruta: '/productos' },
        { label: 'Agendar servicio', icono: 'event', ruta: '/servicios' }
      ],

      citas: [
        { hora: '09:00', nombre: 'Firulais', servicio: 'Vacunación' },
        { hora: '11:30', nombre: 'Mishi', servicio: 'Consulta general' },
        { hora: '15:00', nombre: 'Toby', servicio: 'Baño y estética' },
        { hora: '16:30', nombre: 'Luna', servicio: 'Desparacitación' },
        { hora: '18:00', nombre: 'Rocky', servicio: 'Consulta general' },
        { hora: '19:30', nombre: 'Bella', servicio: 'Vacunación' },
        { hora: '20:00', nombre: 'Max', servicio: 'Baño y estética' },
        { hora: '21:00', nombre: 'Lola', servicio: 'Desparacitación' },
        { hora: '22:00', nombre: 'Coco', servicio: 'Consulta general' },
        { hora: '23:00', nombre: 'Nina', servicio: 'Vacunación' },
        { hora: '23:30', nombre: 'Leo', servicio: 'Baño y estética' },
        { hora: '24:00', nombre: 'Duke', servicio: 'Desparacitación' },
        { hora: '01:00', nombre: 'Zoe', servicio: 'Consulta general' },
        { hora: '02:00', nombre: 'Chico', servicio: 'Vacunación' },
        { hora: '03:00', nombre: 'Luna', servicio: 'Baño y estética' }
      ],
      paginaCitas: 1,
      citasPorPagina: 5,

      productos: [
        { nombre: 'Desparasitante', stock: 2, minimo: 5 },
        { nombre: 'Croquetas Adulto', stock: 1, minimo: 10 },
        { nombre: 'Jabón antipulgas', stock: 0, minimo: 3 },
        { nombre: 'Collar antipulgas', stock: 5, minimo: 2 },
        { nombre: 'Champú', stock: 8, minimo: 5 },
        { nombre: 'Cama para perro', stock: 4, minimo: 1 },
        { nombre: 'Juguete para perro', stock: 3, minimo: 2 },
        { nombre: 'Comedero', stock: 6, minimo: 3 },
        { nombre: 'Plato de agua', stock: 7, minimo: 4 },
        { nombre: 'Correa', stock: 9, minimo: 5 }
      ],
      paginaProductos: 1,
      productosPorPagina: 5
    }
  },
  computed: {
    citasPaginadas() {
      const start = (this.paginaCitas - 1) * this.citasPorPagina
      return this.citas.slice(start, start + this.citasPorPagina)
    },
    totalPaginasCitas() {
      return Math.ceil(this.citas.length / this.citasPorPagina)
    },
    productosPaginados() {
      const start = (this.paginaProductos - 1) * this.productosPorPagina
      return this.productos.slice(start, start + this.productosPorPagina)
    },
    totalPaginasProductos() {
      return Math.ceil(this.productos.length / this.productosPorPagina)
    }
  },
  mounted() {
    this.cargarUsuario()
    this.actualizarReloj()
    this.intervalo = setInterval(this.actualizarReloj, 1000)
  },
  beforeDestroy() {
    clearInterval(this.intervalo)
  },
  methods: {
    cargarUsuario() {
      const usuarioGuardado = localStorage.getItem('usuario')
      if (!usuarioGuardado) {
        this.$router.push('/login') // Redirige si no hay sesión
        return
      }
      this.usuario = JSON.parse(usuarioGuardado)
    },
    actualizarReloj() {
      const ahora = new Date()
      const opcionesFecha = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
      this.fecha = ahora.toLocaleDateString('es-MX', opcionesFecha)
      this.hora = ahora.toLocaleTimeString('es-MX')
    }
  }
}
</script>


<style scoped>
.encabezado-dashboard {
  background-color: #7c245c;
  border-radius: 8px;
  font-family: 'Nunito Sans', sans-serif;
}

.saludo h4 {
  color: #ffffff;
  font-weight: 700;
}

.saludo .rol {
  font-size: 0.9rem;
  font-weight: normal;
  color: #e9c8dc;
}

.reloj {
  color: #e9c8dc;
}

.tarjeta-kpi {
  background-color: #fdf6f9;
  border-left: 5px solid #7c245c;
  border-radius: 8px;
  color: #7c245c;
  transition: transform 0.2s ease;
}

.tarjeta-kpi:hover {
  transform: scale(1.02);
}

.kpi-icon {
  font-size: 2.5rem;
  color: #7c245c;
}

.tarjeta-tabla {
  background-color: #a45484;
  color: white;
  border-radius: 10px;
}

.tarjeta-tabla .card-title i {
  font-size: 1.3rem;
  color: white;
}

.tabla-scroll {
  background-color: white;
  border-radius: 6px;
  padding: 0.5rem;
  overflow-x: auto;
  color: #000;
}

.tarjeta-tabla .btn {
  background-color: #cc94ac;
  color: #fff;
  border: none;
}

.tarjeta-tabla .btn:disabled {
  opacity: 0.5;
}

.btn-acceso-grande {
  background-color: #a45484;
  color: white;
  border-radius: 16px;
  padding: 2rem 1rem;
  margin-bottom: 1rem;
  font-weight: 600;
  font-size: 1rem;
  transition: background-color 0.3s ease, transform 0.2s ease;
  min-height: 130px;
  display: block;
  text-decoration: none;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
}

.btn-acceso-grande:hover {
  background-color: #cc94ac;
  transform: scale(1.02);
}

.btn-acceso-grande i {
  font-size: 2rem;
}


</style>
