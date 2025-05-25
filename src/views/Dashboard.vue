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
      <div class="col-md-6 col-lg-3 mb-3" v-for="(kpi, index) in kpisFormateados" :key="index">
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
      <!-- Productos más vendidos -->
      <div class="col-md-6 mb-4">
        <div class="card h-100 tarjeta-tabla">
          <div class="card-body">
            <h5 class="card-title d-flex align-items-center">
              <i class="material-icons me-2">trending_up</i>
              Productos y servicios más vendidos
            </h5>

            <div class="tabla-scroll">
              <table class="table table-sm align-middle mb-0">
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Nombre</th>
                    <th>Cantidad vendida</th>
                    <th>Ingreso total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in topVendidosPaginados" :key="index">
                    <td>{{ item.tipo }}</td>
                    <td>{{ item.nombre }}</td>
                    <td>{{ item.total_vendido }}</td>
                    <td>${{ Number(item.ingreso_total).toFixed(2) }}</td>
                  </tr>
                  <tr v-if="topVendidosPaginados.length === 0">
                    <td colspan="4" class="text-muted">Sin ventas registradas.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="d-flex justify-content-end mt-2">
              <button class="btn btn-outline-light btn-sm me-2" :disabled="paginaTopProductos === 1" @click="paginaTopProductos--">Anterior</button>
              <button class="btn btn-outline-light btn-sm" :disabled="paginaTopProductos === totalPaginasTopVendidos" @click="paginaTopProductos++">Siguiente</button>
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
import Swal from 'sweetalert2'

export default {
  name: 'Dashboard',
  components: { Navbar },
  data() {
    return {
      usuario: { nombre: '', rol: '' },
      fecha: '',
      hora: '',
      intervalo: null,
      kpis: {
        ventasDia: 0,
        ventasMes: 0,
        clientes: 0,
        productosActivos: 0
      },
      accesos: [
        { label: 'Nueva venta', icono: 'point_of_sale', ruta: '/ventas' },
        { label: 'Registrar cliente', icono: 'person_add', ruta: '/clientes' },
        { label: 'Agregar producto', icono: 'add_box', ruta: '/productos' },
        { label: 'Agendar servicio', icono: 'event', ruta: '/servicios' }
      ],
      citas: [],
      paginaCitas: 1,
      citasPorPagina: 5,
      productos: [],
      paginaProductos: 1,
      productosPorPagina: 5,
      topProductos: [],
      paginaTopProductos: 1,
      topProductosPorPagina: 5,
      topServicios: [],
      paginaTopServicios: 1,
      topServiciosPorPagina: 5
    }
  },
  computed: {
    kpisFormateados() {
      return [
        { titulo: 'Ventas del día', valor: `$${this.kpis.ventasDia.toFixed(2)}`, icono: 'attach_money' },
        { titulo: 'Ventas del mes', valor: `$${this.kpis.ventasMes.toFixed(2)}`, icono: 'calendar_today' },
        { titulo: 'Clientes registrados', valor: this.kpis.clientes, icono: 'people' },
        { titulo: 'Productos activos', valor: this.kpis.productosActivos, icono: 'inventory_2' }
      ]
    },
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
    },
    topVendidosPaginados() {
      const todos = [
        ...this.topProductos.map(p => ({ tipo: 'Producto', ...p })),
        ...this.topServicios.map(s => ({ tipo: 'Servicio', ...s }))
      ]
      const start = (this.paginaTopProductos - 1) * this.topProductosPorPagina
      return todos.slice(start, start + this.topProductosPorPagina)
    },
    totalPaginasTopVendidos() {
      const total = this.topProductos.length + this.topServicios.length
      return Math.ceil(total / this.topProductosPorPagina) || 1
    }
  },
  mounted() {
    const token = localStorage.getItem('token')
    const id_usuario = localStorage.getItem('id_usuario')
    if (!token || !id_usuario) {
      this.$router.push('/login')
      return
    }

    this.actualizarReloj()
    this.intervalo = setInterval(this.actualizarReloj, 1000)

    this.obtenerUsuario(token, id_usuario)
    this.obtenerDashboard(token)
  },
  beforeUnmount() {
    clearInterval(this.intervalo)
  },
  methods: {
    actualizarReloj() {
      const ahora = new Date()
      const opcionesFecha = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }
      this.fecha = ahora.toLocaleDateString('es-MX', opcionesFecha)
      this.hora = ahora.toLocaleTimeString('es-MX')
    },
    async obtenerUsuario(token, id_usuario) {
      try {
        const res = await fetch(`http://localhost:8080/api/usuarios/${id_usuario}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        this.usuario = { nombre: data.nombre, rol: data.rol }
      } catch (err) {
        console.error('Error al cargar usuario:', err)
        Swal.fire({
          icon: 'error',
          title: 'Sesión expirada',
          text: 'Por favor, inicia sesión de nuevo.',
          confirmButtonColor: '#7c245c'
        }).then(() => {
          localStorage.clear()
          this.$router.push('/login')
        })
      }
    },
    async obtenerDashboard(token) {
      try {
        const res = await fetch('http://localhost:8080/api/dashboard', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()

        // Asignar KPIs
        this.kpis.ventasDia        = data.ventasDia
        this.kpis.ventasMes        = data.ventasMes
        this.kpis.clientes         = data.clientes
        this.kpis.productosActivos = data.productosActivos

        // Asignar citas
        this.citas = data.citasHoy.map(c => ({
          hora: c.hora,
          nombre: c.cliente_id,    // Asume que tu endpoint incluye nombre; si no, haría join en backend
          servicio: c.servicio_id   // Igual que arriba
        }))

        // Asignar productos con stock bajo
        this.productos = data.productosStockBajo.map(p => ({
          nombre: p.nombre,
          stock: p.stock,
          minimo: p.stock_minimo
        }))

        // Asignar productos más vendidos
        this.topProductos = data.topProductos.map(p => ({
          nombre: p.nombre,
          total_vendido: p.total_vendido,
          ingreso_total: p.ingreso_total
        }))

        // Asignar servicios más vendidos
        this.topServicios = data.topServicios.map(s => ({
          nombre: s.nombre,
          total_vendido: s.veces_vendido,
          ingreso_total: s.ingreso_total
        }))
      } catch (err) {
        console.error('Error al cargar dashboard:', err)
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los datos del dashboard.',
          confirmButtonColor: '#7c245c'
        })
      }
    }
  }
}
</script>

<style scoped>
:root {
  --color-primario: #7c245c;
  --color-secundario: #cc8bab;
  --color-acento: #7c1454;
  --color-suave: #a45484;
  --color-claro: #cc94ac;
  --color-fondo: #fdfbfc;
  --color-texto: #2b2b2b;
  --color-blanco: #ffffff;
  --color-gris: #e9e9e9;
}

.encabezado-dashboard {
  background-color: var(--color-primario);
  border-radius: 8px;
  font-family: 'Nunito Sans', sans-serif;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.saludo h4 {
  color: var(--color-blanco);
  font-weight: 700;
  margin: 0;
}

.saludo .rol {
  font-size: 0.9rem;
  font-weight: normal;
  color: #e9c8dc;
}

.reloj {
  color: #e9c8dc;
  text-align: right;
  flex-shrink: 0;
}

.tarjeta-kpi {
  background-color: #fdf6f9;
  border-left: 5px solid var(--color-primario);
  border-radius: 8px;
  color: var(--color-primario);
  transition: transform 0.2s ease;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.tarjeta-kpi:hover {
  transform: scale(1.02);
}

.kpi-icon {
  font-size: 2.5rem;
  color: var(--color-primario);
}

.tarjeta-tabla {
  background-color: var(--color-suave);
  color: var(--color-blanco);
  border-radius: 10px;
  padding: 1rem;
}

.tarjeta-tabla .card-title {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.tarjeta-tabla .card-title i {
  font-size: 1.3rem;
  color: var(--color-blanco);
}

.tabla-scroll {
  background-color: var(--color-blanco);
  border-radius: 6px;
  padding: 0.5rem;
  overflow-x: auto;
  color: #000;
}

.tarjeta-tabla .btn {
  background-color: var(--color-claro);
  color: var(--color-blanco);
  border: none;
  font-weight: 600;
}

.tarjeta-tabla .btn:disabled {
  opacity: 0.5;
}

.btn-acceso-grande {
  background-color: var(--color-suave);
  color: var(--color-blanco);
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
  text-align: center;
}

.btn-acceso-grande:hover {
  background-color: var(--color-claro);
  transform: scale(1.02);
}

.btn-acceso-grande i {
  font-size: 2rem;
  display: block;
  margin-bottom: 0.5rem;
}

/* RESPONSIVE BREAKPOINTS */
@media (max-width: 992px) {
  .encabezado-dashboard {
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
  }

  .tarjeta-kpi {
    flex-direction: column;
    text-align: center;
  }

  .btn-acceso-grande {
    padding: 1.5rem 1rem;
    font-size: 0.95rem;
  }
}

@media (max-width: 576px) {
  .btn-acceso-grande {
    padding: 1rem 0.8rem;
    font-size: 0.9rem;
    min-height: 100px;
  }

  .kpi-icon {
    font-size: 2rem;
  }

  .tarjeta-kpi {
    font-size: 0.95rem;
  }

  .reloj {
    width: 100%;
    text-align: left;
  }
}
</style>

