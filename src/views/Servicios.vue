<template>
  <Navbar />
  <div class="dashboard-contenedor">
    <div class="contenido">
      <!-- Card contenedor -->
      <div class="card tabla-contenedor">
        <div class="card-header">
          <input
            v-model="busqueda"
            type="text"
            placeholder="Buscar servicio..."
            class="input-busqueda"
          />
        </div>
        <div class="card-body p-0">
          <table class="tabla-productos mb-0">
            <thead>
              <tr style="background: var(--color-secundario); color: white">
                <th class="text-center">Clave</th>
                <th class="text-center">Nombre</th>
                <th class="text-center">Categoría</th>
                <th class="text-center">Precio</th>
                <th class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="servicio in serviciosPaginados"
                :key="servicio.id"
                :class="{ seleccionado: servicioSeleccionado && servicio.id === servicioSeleccionado.id }"
              >
                <td>{{ servicio.clave }}</td>
                <td>{{ servicio.nombre }}</td>
                <td>{{ servicio.categoria }}</td>
                <td>{{ servicio.precio | formatearMoneda }}</td>
                <td>
                  <div class="d-flex justify-content-center">
                    <button class="btn-ver" @click="alternarSeleccion(servicio)"
                      style="background: var(--color-acento); width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                      <span class="material-icons" style="font-size: 20px;">
                        {{ servicioSeleccionado && servicio.id === servicioSeleccionado.id ? 'close' : 'visibility' }}
                      </span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="card-footer paginacion">
          <button class="btn-pag" @click="paginaActual--" :disabled="paginaActual === 1">Anterior</button>
          <span>Página {{ paginaActual }} de {{ totalPaginas }}</span>
          <button class="btn-pag" @click="paginaActual++" :disabled="paginaActual >= totalPaginas">Siguiente</button>
        </div>
      </div>

      <!-- Panel de detalle -->
      <transition name="fade-slide" mode="out-in">
        <div>
          <div v-if="servicioSeleccionado" key="detalle" class="card panel-visualizacion"
            style="background: var(--color-suave); color: var(--color-blanco);">
            <div class="card-body">
              <h4 class="fw-bold mb-3">Detalles del servicio</h4>
              <div class="detalle-seccion">
                <div class="detalle-columna">
                  <label><strong>Clave</strong></label>
                  <div v-if="!modoEdicion">{{ servicioSeleccionado.clave }}</div>
                  <input v-else v-model="servicioSeleccionado.clave" class="form-control" />
                </div>
                <div class="detalle-columna">
                  <label><strong>Categoría</strong></label>
                  <div v-if="!modoEdicion">{{ servicioSeleccionado.categoria }}</div>
                  <input v-else v-model="servicioSeleccionado.categoria" class="form-control" />
                </div>
                <div class="detalle-columna">
                  <label><strong>Precio</strong></label>
                  <div v-if="!modoEdicion">{{ servicioSeleccionado.precio | formatearMoneda }}</div>
                  <input v-else type="number" v-model.number="servicioSeleccionado.precio" class="form-control" />
                </div>
              </div>
              <div class="descripcion-producto mt-3">
                <label><strong>Descripción:</strong></label>
                <div v-if="!modoEdicion">{{ servicioSeleccionado.descripcion }}</div>
                <input v-else v-model="servicioSeleccionado.descripcion" class="form-control" />
              </div>
              <div class="mt-3 acciones-detalle">
                <button v-if="!modoEdicion" class="btn me-2" style="background: var(--color-primario); color: white"
                  @click="modoEdicion = true">Editar</button>
                <button v-if="modoEdicion" class="btn me-2" style="background: var(--color-acento); color: white"
                  @click="guardarCambios">Guardar</button>
                <button v-if="modoEdicion" class="btn me-2" style="background: darkred; color: white"
                  @click="eliminarServicio(servicioSeleccionado.id)">Eliminar</button>
                <button class="btn btn-secondary" @click="limpiarSeleccion">← Regresar</button>
              </div>
            </div>
          </div>
          <div v-else key="mensaje" class="panel-visualizacion-inicial">
            <p>Selecciona un servicio para ver detalles.</p>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import Navbar from '../components/Navbar.vue';
import DOMPurify from 'dompurify';
import Swal from 'sweetalert2';

export default {
  name: 'ServiciosView',
  components: { Navbar },
  data() {
    return {
      busqueda: '',
      servicios: [
        { id: 1, clave: 'SRV001', nombre: 'Consulta general', categoria: 'Consulta', precio: 350, descripcion: 'Atención médica general para mascotas.' },
        { id: 2, clave: 'SRV002', nombre: 'Vacunación', categoria: 'Prevención', precio: 250, descripcion: 'Aplicación de vacunas para perros y gatos.' },
        { id: 3, clave: 'SRV003', nombre: 'Desparasitación', categoria: 'Prevención', precio: 180, descripcion: 'Desparasitación interna y externa.' },
        { id: 4, clave: 'SRV004', nombre: 'Cirugía menor', categoria: 'Cirugía', precio: 1200, descripcion: 'Procedimientos quirúrgicos menores.' },
        { id: 5, clave: 'SRV005', nombre: 'Esterilización', categoria: 'Cirugía', precio: 950, descripcion: 'Esterilización de perros y gatos.' },
        { id: 6, clave: 'SRV006', nombre: 'Limpieza dental', categoria: 'Higiene', precio: 600, descripcion: 'Limpieza dental profesional para mascotas.' },
        { id: 7, clave: 'SRV007', nombre: 'Rayos X', categoria: 'Diagnóstico', precio: 700, descripcion: 'Estudios radiográficos veterinarios.' },
        { id: 8, clave: 'SRV008', nombre: 'Ultrasonido', categoria: 'Diagnóstico', precio: 850, descripcion: 'Ultrasonido abdominal y diagnóstico.' },
        { id: 9, clave: 'SRV009', nombre: 'Baño y corte', categoria: 'Estética', precio: 300, descripcion: 'Baño y corte de pelo para mascotas.' },
        { id: 10, clave: 'SRV010', nombre: 'Guardería', categoria: 'Cuidado', precio: 400, descripcion: 'Cuidado temporal de mascotas.' }
      ],
      servicioSeleccionado: null,
      modoEdicion: false,
      paginaActual: 1,
      serviciosPorPagina: 10,
      paginaAnterior: 1
    };
  },
  filters: {
    formatearMoneda(value) {
      return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
    }
  },
  computed: {
    serviciosFiltrados() {
      if (this.servicioSeleccionado) return [this.servicioSeleccionado];
      const termino = DOMPurify.sanitize(this.busqueda).toLowerCase().trim();
      if (!termino) return this.servicios;
      return this.servicios.filter(s => Object.values(s).some(val => {
        if (typeof val === 'string') return val.toLowerCase().includes(termino);
        if (typeof val === 'number') return val.toString().includes(termino);
        return false;
      }));
    },
    serviciosPaginados() {
      const start = (this.paginaActual - 1) * this.serviciosPorPagina;
      return this.serviciosFiltrados.slice(start, start + this.serviciosPorPagina);
    },
    totalPaginas() {
      return Math.ceil(this.serviciosFiltrados.length / this.serviciosPorPagina) || 1;
    }
  },
  methods: {
    alternarSeleccion(servicio) {
      if (this.servicioSeleccionado && this.servicioSeleccionado.id === servicio.id) {
        this.limpiarSeleccion();
      } else {
        this.paginaAnterior = this.paginaActual;
        this.paginaActual = 1;
        this.servicioSeleccionado = { ...servicio };
        this.modoEdicion = false;
      }
    },
    limpiarSeleccion() {
      this.servicioSeleccionado = null;
      this.paginaActual = this.paginaAnterior;
    },
    guardarCambios() {
      const idx = this.servicios.findIndex(s => s.id === this.servicioSeleccionado.id);
      if (idx !== -1) {
        this.servicios.splice(idx, 1, this.servicioSeleccionado);
        Swal.fire('Actualizado', 'Cambios guardados correctamente', 'success');
        this.limpiarSeleccion();
      }
    },
    eliminarServicio(id) {
      Swal.fire({
        title: '¿Eliminar servicio?',
        text: 'No podrás revertir esto',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: 'var(--rojo)'
      }).then(res => {
        if (res.isConfirmed) {
          this.servicios = this.servicios.filter(s => s.id !== id);
          Swal.fire('Eliminado', 'Servicio eliminado', 'success');
          if (this.servicioSeleccionado && this.servicioSeleccionado.id === id) {
            this.limpiarSeleccion();
          }
        }
      });
    }
  }
};
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
  --color-negro: #000000;
}

.dashboard-contenedor {
  display: flex;
  flex-direction: column;
}
.contenido {
  padding: 1rem;
}

.card.tabla-contenedor {
  border: none;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  background: var(--color-fondo);
  margin-bottom: 1.5rem;
  color: var(--color-texto);
}

.card-header {
  background: var(--color-suave);
  border-bottom: none;
  padding: 0.75rem 1rem;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.input-busqueda {
  width: 100%;
  max-width: 300px;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  border: none;
  outline: none;
}
.input-busqueda:focus {
  border: 2px solid var(--color-acento);
}

.tabla-productos {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: var(--color-blanco);
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  overflow: hidden;
  animation: fadeInTable 0.7s ease;
}

.tabla-productos th,
.tabla-productos td {
  padding: 0.75rem 1rem;
  border-bottom: none;
  border-right: none;
  text-align: left;
  transition: background 0.3s;
}

/* Títulos centrados */
.tabla-productos thead th {
  background: var(--color-secundario);
  color: var(--color-blanco);
  font-weight: bold;
  text-align: center;
}

/* Última columna (acciones) centrada */
.tabla-productos td:last-child,
.tabla-productos th:last-child {
  text-align: center;
}

.tabla-productos tbody tr:hover {
  background: #f7eaf3;
  box-shadow: 0 2px 8px rgba(124,36,92,0.08);
}

.tabla-productos tbody tr.seleccionado {
  background: #ffe3f0;
  box-shadow: 0 2px 12px rgba(124,36,92,0.12);
}

.btn-ver {
  background: var(--color-acento);
  border: none;
  color: white;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}
.btn-ver:hover {
  background: var(--color-primario);
}

.paginacion {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
}
.btn-pag {
  background: var(--color-primario);
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: bold;
}
.btn-pag:disabled {
  background: #ccc;
}

.panel-visualizacion {
  background: var(--color-suave);
  color: var(--color-blanco);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
}
.panel-visualizacion .card-title {
  font-size: 1.5rem;
  font-weight: bold;
}
.panel-visualizacion .detalle-seccion {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  margin-top: 1rem;
  border-bottom: 1px solid rgba(255,255,255,0.4);
  padding-bottom: 1.2rem;
}
.panel-visualizacion .detalle-columna label,
.panel-visualizacion .descripcion-producto label {
  color: var(--color-blanco);
  font-size: 1rem;
  margin-bottom: 0.25rem;
  display: block;
}
.panel-visualizacion .detalle-columna div,
.panel-visualizacion .descripcion-producto div {
  font-size: 1.1rem;
  font-weight: 500;
}
.panel-visualizacion input.form-control,
.panel-visualizacion select.form-select {
  color: var(--color-texto);
  background: var(--color-blanco);
  box-shadow: 0 0 0 0.2rem rgba(124,20,84,0.25);
}
.descripcion-producto {
  margin-top: 1.2rem;
  font-size: 1.1rem;
  color: var(--color-blanco);
  line-height: 1.5;
}
.panel-visualizacion-inicial {
  text-align: center;
  color: #666;
  padding: 2rem;
}

@keyframes fadeInTable {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 700px) {
  .panel-visualizacion .detalle-seccion {
    flex-direction: column;
  }
}
</style>

