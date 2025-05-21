<template>
  <Navbar />
        <!-- ENCABEZADO -->
    <div class="container">
      <h2 class="mb-1">Clientes</h2>
      <p class="text">Control y gestión de clientes.</p>
    </div>
  <div class="dashboard-contenedor">
    <div class="contenido">
      <div class="card tabla-contenedor">
        <div class="card-header">

          <input
            v-model="busqueda"
            type="text"
            placeholder="Buscar cliente..."
            class="input-busqueda"
          />
        </div>
        <div class="card-body p-0">
          <table class="tabla-productos mb-0">
            <thead>
              <tr style="background: var(--color-secundario); color: white">
                <th class="text-center">Nombre</th>
                <th class="text-center">Teléfono</th>
                <th class="text-center">Correo</th>
                <th class="text-center">Mascota</th>
                <th class="text-center">Edad</th>
                <th class="text-center">Raza</th>
                <th class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="cliente in clientesPaginados"
                :key="cliente.id"
                :class="{ seleccionado: clienteSeleccionado && cliente.id === clienteSeleccionado.id }"
              >
                <td>{{ cliente.nombre }}</td>
                <td>{{ cliente.telefono }}</td>
                <td>{{ cliente.correo }}</td>
                <td>{{ cliente.mascota.nombre }}</td>
                <td>{{ cliente.mascota.edad }} {{ cliente.mascota.unidad }}</td>
                <td>{{ cliente.mascota.raza }}</td>
                <td>
                  <div class="d-flex justify-content-center">
                    <button 
                      class="btn-ver" 
                      @click="alternarSeleccion(cliente)" 
                      style="background: var(--color-acento); width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center;"
                    >
                      <span class="material-icons" style="font-size: 20px;">
                        {{ clienteSeleccionado && cliente.id === clienteSeleccionado.id ? 'close' : 'visibility' }}
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
          <div v-if="clienteSeleccionado" key="detalle" class="card panel-visualizacion" style="background: var(--color-suave); color: var(--color-blanco);">
            <div class="card-body">
              <h4 class="fw-bold mb-3">Detalles del cliente</h4>
              <div class="detalle-seccion">
                <div class="detalle-columna">
                  <label><strong>Teléfono</strong></label>
                  <div v-if="!modoEdicion">{{ clienteSeleccionado.telefono }}</div>
                  <input v-else v-model="clienteSeleccionado.telefono" class="form-control" />
                </div>
                <div class="detalle-columna">
                  <label><strong>Correo</strong></label>
                  <div v-if="!modoEdicion">{{ clienteSeleccionado.correo }}</div>
                  <input v-else v-model="clienteSeleccionado.correo" class="form-control" />
                </div>
                <div class="detalle-columna">
                  <label><strong>Mascota</strong></label>
                  <div v-if="!modoEdicion">{{ clienteSeleccionado.mascota.nombre }}</div>
                  <input v-else v-model="clienteSeleccionado.mascota.nombre" class="form-control" />
                </div>
                <div class="detalle-columna">
                  <label><strong>Edad</strong></label>
                  <div v-if="!modoEdicion">{{ clienteSeleccionado.mascota.edad }} {{ clienteSeleccionado.mascota.unidad }}</div>
                  <div v-else class="d-flex">
                    <input v-model.number="clienteSeleccionado.mascota.edad" type="number" class="form-control me-2" />
                    <select v-model="clienteSeleccionado.mascota.unidad" class="form-select w-auto">
                      <option value="años">Años</option>
                      <option value="meses">Meses</option>
                    </select>
                  </div>
                </div>
                <div class="detalle-columna">
                  <label><strong>Raza</strong></label>
                  <div v-if="!modoEdicion">{{ clienteSeleccionado.mascota.raza }}</div>
                  <input v-else v-model="clienteSeleccionado.mascota.raza" class="form-control" />
                </div>
              </div>
              <div class="mt-3 acciones-detalle">
                <button v-if="!modoEdicion" class="btn me-2" style="background: var(--color-primario); color: white" @click="modoEdicion = true">Editar</button>
                <button v-if="modoEdicion" class="btn me-2" style="background: var(--color-acento); color: white" @click="guardarCambios">Guardar</button>
                <button v-if="modoEdicion" class="btn me-2" style="background: darkred; color: white" @click="eliminarCliente(clienteSeleccionado.id)">Eliminar</button>
                <button class="btn btn-secondary" @click="limpiarSeleccion">← Regresar</button>
              </div>
            </div>
          </div>
          <div v-else key="mensaje" class="panel-visualizacion-inicial">
            <p>Selecciona un cliente para ver detalles.</p>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import Navbar from '../components/Navbar.vue';
import Swal from 'sweetalert2';
import axios from 'axios';

export default {
  name: 'ClientesView',
  components: { Navbar },
  data() {
    return {
      busqueda: '',
      clientes: [],
      clienteSeleccionado: null,
      modoEdicion: false,
      paginaActual: 1,
      clientesPorPagina: 10,
      paginaAnterior: 1
    };
  },
  computed: {
    clientesFiltrados() {
      if (this.clienteSeleccionado) return [this.clienteSeleccionado];
      const filtro = this.busqueda.toLowerCase();
      return this.clientes.filter(c => {
        return (
          c.nombre.toLowerCase().includes(filtro) ||
          (c.telefono && c.telefono.toLowerCase().includes(filtro)) ||
          (c.correo && c.correo.toLowerCase().includes(filtro)) ||
          (c.mascota?.nombre && c.mascota.nombre.toLowerCase().includes(filtro)) ||
          (c.mascota?.raza && c.mascota.raza.toLowerCase().includes(filtro)) ||
          (c.mascota?.edad && c.mascota.edad.toString().includes(filtro)) ||
          (c.mascota?.unidad && c.mascota.unidad.toLowerCase().includes(filtro))
        );
      });
    },
    clientesPaginados() {
      const start = (this.paginaActual - 1) * this.clientesPorPagina;
      return this.clientesFiltrados.slice(start, start + this.clientesPorPagina);
    },
    totalPaginas() {
      return Math.ceil(this.clientesFiltrados.length / this.clientesPorPagina) || 1;
    }
  },
  methods: {
    alternarSeleccion(cliente) {
      if (this.clienteSeleccionado && this.clienteSeleccionado.id === cliente.id) {
        this.limpiarSeleccion();
      } else {
        this.paginaAnterior = this.paginaActual;
        this.paginaActual = 1;
        this.clienteSeleccionado = { ...cliente };
        this.modoEdicion = false;
      }
    },
    limpiarSeleccion() {
      this.clienteSeleccionado = null;
      this.paginaActual = this.paginaAnterior;
    },
    async cargarClientes() {
      try {
        const res = await axios.get('http://localhost:8080/clientes');
        this.clientes = res.data.map(c => ({
          id: c.id,
          nombre: c.nombre,
          telefono: c.telefono,
          correo: c.correo,
          mascota: {
            nombre: c.mascota_nombre || '-',
            edad: c.mascota_edad ?? '-',
            unidad: c.mascota_unidad || '-',
            raza: c.mascota_raza || '-'
          }
        }));
      } catch (err) {
        console.error(err);
        Swal.fire('Error', 'No se pudieron cargar los clientes', 'error');
      }
    },
    async guardarCambios() {
      if (!this.clienteSeleccionado) return;

      try {
        const res = await axios.put(`http://localhost:8080/clientes/${this.clienteSeleccionado.id}`, {
          nombre: this.clienteSeleccionado.nombre,
          telefono: this.clienteSeleccionado.telefono,
          correo: this.clienteSeleccionado.correo,
          mascota: {
            nombre: this.clienteSeleccionado.mascota?.nombre || null,
            edad: this.clienteSeleccionado.mascota?.edad || null,
            unidad: this.clienteSeleccionado.mascota?.unidad || null,
            raza: this.clienteSeleccionado.mascota?.raza || null
          }
        });

        await this.cargarClientes();
        Swal.fire('Actualizado', 'Cambios guardados correctamente', 'success');
        this.limpiarSeleccion();
      } catch (err) {
        console.error(err);
        Swal.fire('Error', 'No se pudo actualizar el cliente', 'error');
      }
    },
    eliminarCliente(id) {
      Swal.fire({
        title: '¿Eliminar cliente?',
        text: 'No podrás revertir esto',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: 'var(--rojo)'
      }).then(res => {
        if (res.isConfirmed) {
          this.clientes = this.clientes.filter(c => c.id !== id);
          Swal.fire('Eliminado', 'Cliente eliminado', 'success');
          if (this.clienteSeleccionado && this.clienteSeleccionado.id === id) {
            this.limpiarSeleccion();
          }
        }
      });
    }
  },
  mounted() {
    this.cargarClientes();
  }
};
</script>



<style scoped>
:root {
  --primario: #7c245c;
  --claro: #f4f4f9;
  --gris-claro: #e9e9e9;
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
  background: var(--claro);
  margin-bottom: 1.5rem;
  color: #000000;
}
.card-header {
  background: #a45484;
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
  border-color: #a45484;
}
.card-body {
  padding: 0;
}
.tabla-productos {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  border-radius: 0px;
  overflow: hidden;
  animation: fadeInTable 0.7s cubic-bezier(0.4,0,0.2,1);
}
.tabla-productos th,
.tabla-productos td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--gris-claro);
  border-right: 1px solid var(--gris-claro);
  text-align: left;
  transition: background 0.3s;
}
.tabla-productos th:last-child,
.tabla-productos td:last-child {
  border-right: none;
}
.tabla-productos thead th {
  background: var(--claro);
  color: white;
  border-bottom: 2px solid var(--primario);
  border-top: 1px solid var(--primario);
  font-weight: bold;
  letter-spacing: 0.5px;
}
.tabla-productos tbody tr {
  transition: background 0.3s, box-shadow 0.3s;
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
  background: #7c245c;
  border: none;
  color: #fff;
  cursor: pointer;
  border-radius: 50%;
  padding: 0.3rem 0.7rem;
  transition: background 0.2s, color 0.2s;
  box-shadow: 0 1px 4px rgba(255,152,0,0.12);
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
}
.btn-ver:hover {
  background: #a45484;
  color: #fff;
}
.paginacion {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  background: transparent;
  padding: 0.75rem;
}
.btn-pag {
  background: var(--primario);
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}
.btn-pag:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* NUEVO: mejora visual panel de detalles */
.panel-visualizacion {
  background: var(--color-suave);
  border: none;
  border-radius: 12px;
  padding: 1.5rem;
  color: var(--color-blanco);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 1rem;
}
.panel-visualizacion .card-title {
  color: var(--color-blanco);
  font-weight: bold;
  font-size: 1.5rem;
}
.panel-visualizacion .detalle-seccion {
  display: flex;
  flex-wrap: wrap;
  gap: 2.5rem 3rem;
  margin-top: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  padding-bottom: 1.2rem;
}
.panel-visualizacion .detalle-columna {
  background: none;
  border-radius: 0;
  padding: 0;
  box-shadow: none;
  min-width: 180px;
  margin-right: 2.5rem;
}
.panel-visualizacion .detalle-columna label {
  color: var(--color-blanco);
  font-size: 1.05rem;
  margin-bottom: 0.1rem;
}
.panel-visualizacion .detalle-columna div,
.panel-visualizacion .detalle-columna input {
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--color-blanco);
}

/* Edición (inputs) */
.panel-visualizacion input.form-control,
.panel-visualizacion select.form-select {
  color: var(--color-texto);
  box-shadow: 0 0 0 0.2rem rgba(124, 20, 84, 0.25);
  background-color: var(--color-blanco);
}


.panel-visualizacion-inicial {
  text-align: center;
  color: #666;
  padding: 2rem;
}
.panel-visualizacion .card-body {
  display: block;
  gap: 0;
}
@media (max-width: 700px) {
  .panel-visualizacion .detalle-seccion {
    grid-template-columns: 1fr;
  }
}
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: all 0.3s ease;
}
.fade-slide-enter-from, .fade-slide-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
.fade-slide-enter-to, .fade-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
}
.container {
  font-family: 'Nunito Sans', sans-serif;
}
@keyframes fadeInTable {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>

