<template>
  <Navbar />
        <!-- ENCABEZADO -->
    <div class="container">
      <h2 class="mb-1">Servicios</h2>
      <p class="text">Control y gestión de servicios ofrecidos.</p>
    </div>
  <div class="dashboard-contenedor">
    <div class="contenido">
      <!-- Card contenedor -->
      <div class="card tabla-contenedor">
        <div class="card-header d-flex align-items-center justify-content-between">
          <input
            v-model="busqueda"
            type="text"
            placeholder="Buscar servicio..."
            class="input-busqueda"
          />
          <button class="btn-cliente" @click="abrirModalServicio" style="border-radius:50%;width:40px;height:40px;display:flex;align-items:center;justify-content:center;">
            <span class="material-icons">add</span>
          </button>
          <div v-if="errorServicios" class="alert alert-danger mt-2">{{ errorServicios }}</div>
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
                <td class="text-center align-middle">{{ servicio.clave }}</td>
                <td class="text-center align-middle">{{ servicio.nombre }}</td>
                <td class="text-center align-middle">{{ servicio.categoria }}</td>
                <td class="text-center align-middle">{{ servicio.precio | formatearMoneda }}</td>
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
                  <label><strong>Nombre</strong></label>
                  <div v-if="!modoEdicion">{{ servicioSeleccionado.nombre }}</div>
                  <input v-else v-model="servicioSeleccionado.nombre" class="form-control" />
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

      <!-- Botón para agregar nuevo servicio -->
      

      <!-- Modal para agregar servicio -->
      <div class="modal fade" id="modalServicio" tabindex="-1" aria-labelledby="modalServicioLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
          <div class="modal-content modal-productos-custom">
            <div class="modal-header" style="background:#a45484;color:#fff;">
              <h5 class="modal-title" id="modalServicioLabel">Nuevo servicio</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar" style="filter:invert(1);"></button>
            </div>
            <div class="modal-body" style="background:#fdfbfc;">
              <form @submit.prevent="guardarNuevoServicio">
                <div class="container-fluid">
                  <div class="row g-3">
                    <div class="col-md-6">
                      <label class="form-label">Clave *</label>
                      <input v-model="nuevoServicio.clave" type="text" class="form-control" placeholder="Ej. SRV001" required />
                    </div>
                    <div class="col-md-6">
                      <label class="form-label">Nombre *</label>
                      <input v-model="nuevoServicio.nombre" type="text" class="form-control" placeholder="Ej. Baño" required />
                    </div>
                    <div class="col-md-6">
                      <label class="form-label">Categoría</label>
                      <input v-model="nuevoServicio.categoria" type="text" class="form-control" placeholder="Ej. Estética" />
                    </div>
                    <div class="col-md-6">
                      <label class="form-label">Precio *</label>
                      <input v-model.number="nuevoServicio.precio" type="number" min="0" class="form-control" required />
                    </div>
                    <div class="col-12">
                      <label class="form-label">Descripción</label>
                      <textarea v-model="nuevoServicio.descripcion" class="form-control" placeholder="Descripción del servicio" rows="2"></textarea>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div class="modal-footer" style="background:#fdfbfc;">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" style="background:#a45484;border:none;">Cancelar</button>
              <button type="button" class="btn btn-primary" @click="guardarNuevoServicio" style="background:#a45484;border:none;">Guardar</button>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import Navbar from '../components/Navbar.vue';
import DOMPurify from 'dompurify';

export default {
  name: 'ServiciosView',
  components: { Navbar },
  data() {
    return {
      busqueda: '',
      servicios: [
        { id: 1, clave: 'SRV001', nombre: 'Baño', categoria: 'Estética', descripcion: 'Baño completo para mascota', precio: 200, activo: 1 },
        { id: 2, clave: 'SRV002', nombre: 'Corte de uñas', categoria: 'Estética', descripcion: 'Corte de uñas para perro o gato', precio: 80, activo: 1 },
        { id: 3, clave: 'SRV003', nombre: 'Consulta veterinaria', categoria: 'Salud', descripcion: 'Consulta general con veterinario', precio: 350, activo: 1 }
      ],
      servicioSeleccionado: null,
      modoEdicion: false,
      paginaActual: 1,
      serviciosPorPagina: 10,
      paginaAnterior: 1,
      nuevoServicio: {
        clave: '',
        nombre: '',
        categoria: '',
        descripcion: '',
        precio: 0,
        activo: 1
      },
      errorServicios: '',
      mostrarModalNuevo: false
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
      return this.servicios.filter(s =>
        Object.values(s).some(val => {
          if (typeof val === 'string') return val.toLowerCase().includes(termino);
          if (typeof val === 'number') return val.toString().includes(termino);
          return false;
        })
      );
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
    async cargarServicios() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:8080/api/servicios', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        this.servicios = Array.isArray(data) ? data.filter(s => s.activo === 1) : [];
      } catch (err) {
        console.error(err);
        if (window.Swal) {
          window.Swal.fire('Error', 'No se pudieron cargar los servicios', 'error');
        }
      }
    },
    alternarSeleccion(servicio) {
      if (this.servicioSeleccionado && this.servicioSeleccionado.id === servicio.id) {
        this.limpiarSeleccion();
      } else {
        this.paginaAnterior = this.paginaActual;
        this.paginaActual = 1;
        this.servicioSeleccionado = JSON.parse(JSON.stringify(servicio));
        this.modoEdicion = false;
      }
    },
    limpiarSeleccion() {
      this.servicioSeleccionado = null;
      this.paginaActual = this.paginaAnterior;
    },
    abrirModalServicio() {
      this.nuevoServicio = {
        clave: '',
        nombre: '',
        categoria: '',
        descripcion: '',
        precio: 0,
        activo: 1
      };
      const modalEl = document.getElementById('modalServicio');
      if (modalEl) {
        // Bootstrap 5 modal
        if (window.bootstrap) {
          new window.bootstrap.Modal(modalEl).show();
        } else {
          modalEl.style.display = 'block';
        }
      }
    },
    async guardarNuevoServicio() {
      if (!this.nuevoServicio.clave.trim() || !this.nuevoServicio.nombre.trim() || this.nuevoServicio.precio === null) {
        if (window.Swal) {
          window.Swal.fire('Error', 'Clave, nombre y precio son obligatorios', 'error');
        }
        return;
      }
      // Confirmación antes de crear
      if (window.Swal) {
        const res = await window.Swal.fire({
          title: '¿Crear nuevo servicio?',
          text: '¿Deseas guardar este nuevo servicio?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Sí, guardar',
          cancelButtonText: 'Cancelar',
          confirmButtonColor: '#7c245c'
        });
        if (!res.isConfirmed) return;
      }
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:8080/api/serviciospost', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(this.nuevoServicio)
        });
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || 'No se pudo crear el servicio');
        }
        const nuevo = await res.json();
        this.servicios.push(nuevo);
        const modalEl = document.getElementById('modalServicio');
        if (modalEl && window.bootstrap) {
          window.bootstrap.Modal.getInstance(modalEl).hide();
        }
        this.limpiarNuevoServicio();
        if (window.Swal) {
          window.Swal.fire('Éxito', 'Servicio creado correctamente', 'success');
        }
      } catch (err) {
        console.error(err);
        if (window.Swal) {
          window.Swal.fire('Error', err.message || 'No se pudo crear el servicio', 'error');
        }
      }
    },
    async guardarCambios() {
      if (!this.servicioSeleccionado) return;
      // Confirmación antes de editar
      if (window.Swal) {
        const res = await window.Swal.fire({
          title: '¿Guardar cambios?',
          text: '¿Deseas guardar los cambios en este servicio?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Sí, guardar',
          cancelButtonText: 'Cancelar',
          confirmButtonColor: '#7c245c'
        });
        if (!res.isConfirmed) return;
      }
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:8080/api/servicios/${this.servicioSeleccionado.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(this.servicioSeleccionado)
        });
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || 'No se pudo actualizar el servicio');
        }
        const actualizado = await res.json();
        const idx = this.servicios.findIndex(s => s.id === actualizado.id);
        if (idx !== -1) this.servicios.splice(idx, 1, actualizado);
        this.servicioSeleccionado = JSON.parse(JSON.stringify(actualizado));
        this.modoEdicion = false;
        if (window.Swal) {
          window.Swal.fire('Éxito', 'Servicio actualizado correctamente', 'success');
        }
      } catch (err) {
        console.error(err);
        if (window.Swal) {
          window.Swal.fire('Error', err.message || 'No se pudo actualizar el servicio', 'error');
        }
      }
    },
    async eliminarServicio(id) {
      if (!id) return;
      if (window.Swal) {
        const res = await window.Swal.fire({
          title: '¿Eliminar servicio?',
          text: 'No podrás revertir esto',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sí, eliminar',
          cancelButtonText: 'Cancelar',
          confirmButtonColor: '#d33'
        });
        if (!res.isConfirmed) return;
      }
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:8080/api/servicios/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok && res.status !== 204) throw new Error('No se pudo eliminar el servicio');
        this.servicios = this.servicios.filter(s => s.id !== id);
        this.limpiarSeleccion();
        if (window.Swal) {
          window.Swal.fire('Eliminado', 'Servicio eliminado correctamente', 'success');
        }
      } catch (err) {
        console.error(err);
        if (window.Swal) {
          window.Swal.fire('Error', err.message || 'No se pudo eliminar el servicio', 'error');
        }
      }
    },
  },
  mounted() {
    this.cargarServicios();
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

/* Estructura principal */
.container {
  font-family: 'Nunito Sans', sans-serif;
}

.dashboard-contenedor {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.contenido {
  padding: 1rem;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

/* Contenedor de tabla */
.card.tabla-contenedor {
  border: none;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  background: var(--color-fondo);
  margin-bottom: 1.5rem;
  color: var(--color-texto);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

/* Header de tabla */
.card-header {
  background: var(--color-suave);
  border-bottom: none;
  padding: 0.75rem 1rem;
  border-radius: 8px 8px 0 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.input-busqueda {
  width: 100%;
  max-width: 300px;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  border: none;
  outline: none;
  min-width: 150px;
  background: var(--color-blanco);
}

.input-busqueda:focus {
  border: 2px solid var(--color-acento);
}

/* Tabla - Versión desktop */
.tabla-productos {
  width: 100%;
  border-collapse: collapse;
  background: var(--color-blanco);
  min-width: 600px;
}

.tabla-productos th,
.tabla-productos td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(0,0,0,0.05);
  transition: all 0.3s;
}

.tabla-productos th {
  background: var(--color-secundario);
  color: var(--color-blanco);
  font-weight: bold;
  position: sticky;
  top: 0;
  text-align: center;
}

.tabla-productos td {
  text-align: left;
}

/* Última columna (acciones) centrada */
.tabla-productos td:last-child {
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

/* Botones */
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
  transition: all 0.3s;
}

.btn-ver:hover {
  background: var(--color-primario);
  transform: scale(1.1);
}

.btn-cliente {
  background: var(--color-primario);
  border: none;
  color: var(--color-blanco);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.btn-cliente:hover {
  background: var(--color-secundario);
  transform: translateY(-2px);
}

/* Panel de detalles */
.panel-visualizacion {
  background: var(--color-suave);
  color: var(--color-blanco);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
}

.panel-visualizacion .card-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.detalle-seccion {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.4);
}

.detalle-columna label {
  color: var(--color-blanco);
  font-size: 1rem;
  margin-bottom: 0.25rem;
  display: block;
  font-weight: bold;
}

.detalle-columna div {
  font-size: 1.1rem;
  font-weight: 500;
}

/* Controles de formulario */
.panel-visualizacion input.form-control,
.panel-visualizacion select.form-select {
  color: var(--color-texto);
  background: var(--color-blanco);
  box-shadow: 0 0 0 0.2rem rgba(124,20,84,0.25);
  width: 100%;
}

.descripcion-producto {
  margin-top: 1.2rem;
  font-size: 1.1rem;
  color: var(--color-blanco);
  line-height: 1.5;
}

/* Paginación */
.paginacion {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  flex-wrap: wrap;
}

.btn-pag {
  background: var(--color-primario);
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: bold;
  min-width: 100px;
  transition: all 0.3s;
}

.btn-pag:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* Modal */
.modal-fondo {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-contenido {
  background: #fff;
  border-radius: 10px;
  padding: 2rem;
  min-width: 320px;
  max-width: 90vw;
  box-shadow: 0 4px 24px rgba(0,0,0,0.18);
  width: 100%;
}

/* Animaciones */
@keyframes fadeInTable {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Media Queries para responsividad */
@media (max-width: 1200px) {
  .contenido {
    padding: 0.75rem;
  }
  
  .panel-visualizacion {
    padding: 1.25rem;
  }
}

@media (max-width: 992px) {
  .card-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .input-busqueda {
    max-width: 100%;
  }
  
  .detalle-seccion {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}

/* Versión móvil mejorada */
@media (max-width: 768px) {
  .tabla-productos {
    font-size: 0.9rem;
    min-width: 100%;
  }
  
  .tabla-productos th,
  .tabla-productos td {
    padding: 0.6rem;
  }
  
  /* Ocultamos columnas menos importantes */
  .tabla-productos th:nth-child(3),
  .tabla-productos td:nth-child(3) {
    display: none;
  }
  
  /* Ajustamos el ancho de columnas */
  .tabla-productos th:nth-child(1),
  .tabla-productos td:nth-child(1) {
    width: 20%;
  }
  
  .tabla-productos th:nth-child(2),
  .tabla-productos td:nth-child(2) {
    width: 30%;
  }
  
  .tabla-productos th:nth-child(4),
  .tabla-productos td:nth-child(4) {
    width: 20%;
    text-align: center;
  }
  
  .tabla-productos th:nth-child(5),
  .tabla-productos td:nth-child(5) {
    width: 15%;
    text-align: center;
  }
  
  /* Header más compacto */
  .card-header {
    padding: 0.5rem;
  }
  
  .input-busqueda {
    padding: 0.4rem 0.8rem;
  }
  
  /* Botones más pequeños */
  .btn-cliente {
    padding: 0.4rem 0.8rem;
  }
  
  .btn-ver {
    width: 32px;
    height: 32px;
  }
  
  /* Panel de detalles más compacto */
  .panel-visualizacion {
    padding: 1rem;
  }
  
  .detalle-seccion {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  /* Modal más ajustado */
  .modal-contenido {
    padding: 1.5rem;
  }
}

/* Ajustes para pantallas muy pequeñas */
@media (max-width: 480px) {
  .contenido {
    padding: 0.5rem;
  }
  
  .tabla-productos {
    font-size: 0.8rem;
  }
  
  .tabla-productos th,
  .tabla-productos td {
    padding: 0.4rem;
  }
  
  /* Ocultamos otra columna si es necesario */
  .tabla-productos th:nth-child(4),
  .tabla-productos td:nth-child(4) {
    display: none;
  }
  
  /* Paginación en columna */
  .paginacion {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .btn-pag {
    width: 100%;
  }
  
  /* Modal más compacto */
  .modal-contenido {
    padding: 1rem;
    min-width: 280px;
  }
}
</style>

