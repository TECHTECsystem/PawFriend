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
        <div class="card-header d-flex align-items-center justify-content-between">
          <input
            v-model="busqueda"
            type="text"
            placeholder="Buscar cliente..."
            class="input-busqueda"
          />
          <button class="btn-cliente" @click="abrirModalCliente" style="border-radius:50%;width:40px;height:40px;display:flex;align-items:center;justify-content:center;" v-if="permisoClientes === 1">
            <span class="material-icons">add</span>
          </button>
        </div>
        <div class="card-body p-0">
          <table class="tabla-productos mb-0">
            <thead>
              <tr style="background: var(--color-secundario); color: white">
                <th class="text-center">Nombre</th>
                <th class="text-center">Teléfono</th>
                <th class="text-center">Correo</th>
                <th class="text-center">Mascota</th>
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
                <td>
                  <div v-if="cliente.mascotas && cliente.mascotas.length">
                    <div v-for="mascota in cliente.mascotas" :key="mascota.nombre + mascota.raza" class="mb-1">
                      <span class="fw-bold">{{ mascota.nombre }}</span>
                      <span>({{ mascota.especie }})</span>
                    </div>
                  </div>
                  <div v-else>-</div>
                </td>
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
                  <label><strong>Nombre</strong></label>
                  <div v-if="!modoEdicion">{{ clienteSeleccionado.nombre }}</div>
                  <input v-else v-model="clienteSeleccionado.nombre" class="form-control" placeholder="Nombre completo" />
                </div>
                <div class="detalle-columna">
                  <label><strong>Teléfono</strong></label>
                  <div v-if="!modoEdicion">{{ clienteSeleccionado.telefono }}</div>
                  <input v-else v-model="clienteSeleccionado.telefono" class="form-control" placeholder="Teléfono" />
                </div>
                <div class="detalle-columna">
                  <label><strong>Correo</strong></label>
                  <div v-if="!modoEdicion">{{ clienteSeleccionado.correo }}</div>
                  <input v-else v-model="clienteSeleccionado.correo" class="form-control" placeholder="Correo electrónico" />
                </div>
                <div class="detalle-columna">
                  <label><strong>Mascotas</strong></label>
                  <div v-if="!modoEdicion">
                    <div v-if="clienteSeleccionado.mascotas && clienteSeleccionado.mascotas.length">
                      <div v-for="mascota in clienteSeleccionado.mascotas" :key="mascota.nombre + mascota.raza" class="mb-1">
                        <span class="fw-bold">{{ mascota.nombre }}</span>
                        <span>({{ mascota.especie }})</span>
                        <span>- {{ mascota.edad }} {{ mascota.unidad }}</span>
                        <span v-if="mascota.raza">- {{ mascota.raza }}</span>
                      </div>
                    </div>
                    <div v-else>-</div>
                  </div>
                  <div v-else>
                    <div v-if="clienteSeleccionado.mascotas && clienteSeleccionado.mascotas.length">
                      <div v-for="mascota in clienteSeleccionado.mascotas" :key="mascota.nombre + mascota.raza" class="mb-2">
                        <input v-model="mascota.nombre" class="form-control mb-1" placeholder="Nombre de la mascota" />
                        <input v-model="mascota.especie" class="form-control mb-1" placeholder="Especie (Ej. Perro)" />
                        <div class="d-flex mb-1">
                          <input v-model.number="mascota.edad" type="number" class="form-control me-2" placeholder="Edad" />
                          <select v-model="mascota.unidad" class="form-select w-auto">
                            <option value="años">Años</option>
                            <option value="meses">Meses</option>
                          </select>
                        </div>
                        <input v-model="mascota.raza" class="form-control mb-1" placeholder="Raza (opcional)" />
                        <hr v-if="clienteSeleccionado.mascotas.length > 1" />
                      </div>
                    </div>
                    <div v-else>-</div>
                  </div>
                </div>
                
              </div>
              <div class="mt-3 acciones-detalle">
                <button v-if="!modoEdicion && permisoClientes === 1" class="btn btn-editar me-2" @click="modoEdicion = true">Editar</button>
                <button v-if="modoEdicion && permisoClientes === 1" class="btn btn-guardar me-2" @click="guardarCambios">Guardar</button>
                <button v-if="modoEdicion && permisoClientes === 1" class="btn btn-eliminar me-2" @click="eliminarCliente(clienteSeleccionado.id)">Eliminar</button>
                <button v-if="modoEdicion && permisoClientes === 1" class="btn btn-agregar me-2" @click="abrirModalMascota">Agregar Mascota</button>
                <button class="btn btn-regresar" @click="limpiarSeleccion">← Regresar</button>
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

  <!-- Modal para agregar cliente -->
  <div class="modal fade" id="modalCliente" tabindex="-1" aria-labelledby="modalClienteLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
      <div class="modal-content modal-clientes-custom">
        <div class="modal-header" style="background:#b05a87;color:#fff;">
          <h5 class="modal-title" id="modalClienteLabel">Nuevo cliente</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar" style="filter:invert(1);"></button>
        </div>
        <div class="modal-body" style="background:#fdfbfc;">
          <form @submit.prevent="guardarNuevoCliente">
            <div class="container-fluid">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Nombre completo *</label>
                  <input v-model="nuevoCliente.nombre" type="text" class="form-control" placeholder="Ej. Juan Pérez" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Teléfono</label>
                  <input v-model="nuevoCliente.telefono" type="tel" class="form-control" placeholder="Opcional" />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Email</label>
                  <input v-model="nuevoCliente.correo" type="email" class="form-control" placeholder="Opcional" />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Nombre mascota *</label>
                  <input v-model="nuevoCliente.mascota.nombre" type="text" class="form-control" placeholder="Ej. Luna" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Especie *</label>
                  <input v-model="nuevoCliente.mascota.especie" type="text" class="form-control" placeholder="Ej. Perro" required />
                </div>
                <div class="col-md-3">
                  <label class="form-label">Edad *</label>
                  <input v-model.number="nuevoCliente.mascota.edad" type="number" min="0" class="form-control" required />
                </div>
                <div class="col-md-3">
                  <label class="form-label">Unidad *</label>
                  <select v-model="nuevoCliente.mascota.unidad" class="form-select" required>
                    <option value="años">Años</option>
                    <option value="meses">Meses</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Raza</label>
                  <input v-model="nuevoCliente.mascota.raza" type="text" class="form-control" placeholder="Opcional" />
                </div>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer" style="background:#fdfbfc;">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" style="background:#b05a87;border:none;">Cancelar</button>
          <button type="button" class="btn btn-primary" @click="guardarNuevoCliente" style="background:#b05a87;border:none;">Guardar</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal para agregar mascota -->
  <div
    class="modal fade"
    id="mascotaModal"
    tabindex="-1"
    aria-labelledby="mascotaModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="mascotaModalLabel">Agregar Mascota</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Cerrar"
          ></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label class="form-label">Nombre</label>
            <input
              v-model="nuevaMascota.nombre"
              type="text"
              class="form-control"
              placeholder="Ej. Luna"
            />
          </div>
          <div class="mb-3">
            <label class="form-label">Especie</label>
            <input
              v-model="nuevaMascota.especie"
              type="text"
              class="form-control"
              placeholder="Ej. Perro"
            />
          </div>
          <div class="mb-3">
            <label class="form-label">Edad</label>
            <div class="input-group">
              <input
                v-model.number="nuevaMascota.edad"
                type="number"
                min="0"
                class="form-control"
              />
              <select
                v-model="nuevaMascota.unidad"
                class="form-select"
              >
                <option value="años">Años</option>
                <option value="meses">Meses</option>
              </select>
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label">Raza</label>
            <input
              v-model="nuevaMascota.raza"
              type="text"
              class="form-control"
              placeholder="Opcional"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary"
            data-bs-dismiss="modal"
          >
            Cancelar
          </button>
          <button
            type="button"
            class="btn btn-primary"
            @click="guardarMascota"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Navbar from '../components/Navbar.vue';
import Swal from 'sweetalert2';

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
      paginaAnterior: 1,
      nuevoCliente: {
        nombre: '',
        telefono: '',
        correo: '',
        mascota: {
          nombre: '',
          especie: '',
          edad: 0,
          unidad: 'años',
          raza: ''
        }
      },
      nuevaMascota: {
        nombre: '',
        especie: '',
        edad: 0,
        unidad: 'años',
        raza: ''
      },
      permisoClientes: 0 // Nuevo: permiso para clientes
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
        // Limpiar guiones al seleccionar para editar
        const clienteLimpio = { ...cliente };
        if (clienteLimpio.telefono === '-') clienteLimpio.telefono = '';
        if (clienteLimpio.correo === '-') clienteLimpio.correo = '';
        if (Array.isArray(clienteLimpio.mascotas)) {
          clienteLimpio.mascotas = clienteLimpio.mascotas.map(m => {
            const copia = { ...m };
            if (copia.nombre === '-') copia.nombre = '';
            if (copia.especie === '-') copia.especie = '';
            if (copia.edad === '-') copia.edad = '';
            if (copia.unidad === '-') copia.unidad = '';
            if (copia.raza === '-') copia.raza = '';
            return copia;
          });
        }
        this.clienteSeleccionado = clienteLimpio;
        this.modoEdicion = false;
      }
    },
    limpiarSeleccion() {
      this.clienteSeleccionado = null;
      this.paginaActual = this.paginaAnterior;
    },
    guardarCambios() {
      if (!this.clienteSeleccionado) return;
      // Limpiar guiones en campos antes de editar
      const cliente = { ...this.clienteSeleccionado };
      if (cliente.telefono === '-') cliente.telefono = '';
      if (cliente.correo === '-') cliente.correo = '';
      if (Array.isArray(cliente.mascotas)) {
        cliente.mascotas = cliente.mascotas.map(m => {
          const copia = { ...m };
          if (copia.nombre === '-') copia.nombre = '';
          if (copia.especie === '-') copia.especie = '';
          if (copia.edad === '-') copia.edad = '';
          if (copia.unidad === '-') copia.unidad = '';
          if (copia.raza === '-') copia.raza = '';
          return copia;
        });
      }
      const payload = {
        nombre: cliente.nombre,
        telefono: cliente.telefono,
        correo: cliente.correo,
        mascotas: cliente.mascotas.map(m => ({
          id: m.id,
          nombre: m.nombre,
          especie: m.especie,
          edad: m.edad,
          unidad_edad: m.unidad,
          raza: m.raza
        }))
      };
      const token = localStorage.getItem('token');
      fetch(`http://localhost:8080/api/clientes/${cliente.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })
        .then(async res => {
          if (!res.ok) throw new Error('No se pudo actualizar');
          const data = await res.json();
          // Actualizar cliente en la lista local
          await this.cargarClientes();
          this.modoEdicion = false;
          Swal.fire('Actualizado', 'Cambios guardados correctamente', 'success');
          this.limpiarSeleccion();
        })
        .catch(() => {
          Swal.fire('Error', 'No se pudo actualizar el cliente', 'error');
        });
    },
    eliminarCliente(id) {
      Swal.fire({
        title: '¿Eliminar cliente?',
        text: 'No podrás revertir esto',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#d33'
      }).then(async res => {
        if (res.isConfirmed) {
          try {
            const token = localStorage.getItem('token');
            // Soft-delete usando el endpoint
            const response = await fetch(`http://localhost:8080/api/clientes/${id}/inactivar`, {
              method: 'PUT',
              headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('No se pudo eliminar el cliente');
            // Recargar lista de clientes (ya no aparecerá el inactivo)
            await this.cargarClientes();
            Swal.fire('Eliminado', 'Cliente eliminado', 'success');
            if (this.clienteSeleccionado && this.clienteSeleccionado.id === id) {
              this.limpiarSeleccion();
            }
          } catch (e) {
            Swal.fire('Error', 'No se pudo eliminar el cliente', 'error');
          }
        }
      });
    },
    async cargarClientes() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:8080/api/clientes', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        // Para cada cliente, obtener todas sus mascotas usando el endpoint de mascotas por cliente
        const clientesConMascotas = [];
        for (const c of data) {
          if (c.activo === 0) continue; // Omitir clientes inactivos
          let mascotas = [];
          try {
            const resMascotas = await fetch(`http://localhost:8080/api/clientes/${c.id}/mascotas`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const mascotasData = await resMascotas.json();
            if (Array.isArray(mascotasData) && mascotasData.length > 0) {
              mascotas = mascotasData.map(m => ({
                nombre: m.nombre || '-',
                especie: m.especie || '-',
                edad: m.edad ?? '-',
                unidad: m.unidad_edad || '-',
                raza: m.raza || '-'
              }));
            }
          } catch (e) {
            // Si falla la consulta de mascotas, deja el array vacío
          }
          clientesConMascotas.push({
            id: c.id,
            nombre: c.nombre,
            telefono: c.telefono || '-',
            correo: c.correo || '-',
            mascotas
          });
        }
        this.clientes = clientesConMascotas;
      } catch (err) {
        console.error(err);
        Swal.fire('Error', 'No se pudieron cargar los clientes', 'error');
      }
    },
    abrirModalCliente() {
      this.nuevoCliente = {
        nombre: '',
        telefono: '',
        correo: '',
        mascota: {
          nombre: '',
          especie: '',
          edad: 0,
          unidad: 'años',
          raza: ''
        }
      };
      const modalEl = document.getElementById('modalCliente');
      new bootstrap.Modal(modalEl).show();
    },
    async guardarNuevoCliente() {
      if (!this.nuevoCliente.nombre.trim()) {
        return Swal.fire('Error', 'El nombre del cliente es obligatorio', 'error');
      }
      if (!this.nuevoCliente.mascota.nombre.trim() || !this.nuevoCliente.mascota.especie.trim()) {
        return Swal.fire('Error', 'Nombre y especie de la mascota son obligatorios', 'error');
      }
      try {
        const token = localStorage.getItem('token');
        // 1. Crear cliente
        const res1 = await fetch('http://localhost:8080/api/clientes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            nombre: this.nuevoCliente.nombre,
            telefono: this.nuevoCliente.telefono || null,
            correo: this.nuevoCliente.correo || null
          })
        });
        const nuevo = await res1.json();
        // 2. Crear mascota asociada (igual que en ventas)
        await fetch('http://localhost:8080/api/mascotas', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            nombre: this.nuevoCliente.mascota.nombre,
            especie: this.nuevoCliente.mascota.especie,
            edad: this.nuevoCliente.mascota.edad,
            unidad_edad: this.nuevoCliente.mascota.unidad,
            raza: this.nuevoCliente.mascota.raza,
            cliente_id: nuevo.id
          })
        });
        // 3. Recargar clientes
        await this.cargarClientes();
        bootstrap.Modal.getInstance(document.getElementById('modalCliente')).hide();
        Swal.fire('Éxito', 'Cliente agregado', 'success');
      } catch (e) {
        console.error(e);
        Swal.fire('Error', 'No se pudo agregar el cliente', 'error');
      }
    },
    abrirModalMascota() {
      const modalEl = document.getElementById('mascotaModal');
      new bootstrap.Modal(modalEl).show();
    },
    guardarMascota() {
      if (!this.nuevaMascota.nombre.trim() || !this.nuevaMascota.especie.trim()) {
        return Swal.fire('Error', 'Nombre y especie son obligatorios', 'error');
      }
      this.clienteSeleccionado.mascotas.push({ ...this.nuevaMascota });
      this.nuevaMascota = { nombre: '', especie: '', edad: 0, unidad: 'años', raza: '' };
      bootstrap.Modal.getInstance(document.getElementById('mascotaModal')).hide();
      Swal.fire('Éxito', 'Mascota agregada correctamente', 'success');
    },
    async obtenerPermisosUsuario() {
      try {
        const id_usuario = localStorage.getItem('id_usuario');
        const token = localStorage.getItem('token');
        if (!id_usuario) return;
        const res = await fetch(`http://localhost:8080/api/usuarios/${id_usuario}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        this.permisoClientes = data.permiso_clientes;
      } catch (e) {
        this.permisoClientes = 0;
      }
    }
  },
  mounted() {
    this.obtenerPermisosUsuario();
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

/* Estructura principal */
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

/* Encabezado */
.container h2,
.container p.text {
  color: var(--color-negro);
}

/* Contenedor de tabla */
.card.tabla-contenedor {
  border: none;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: var(--claro);
  margin-bottom: 1.5rem;
  color: var(--color-texto);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.card-header {
  background: var(--color-suave);
  border-bottom: none;
  padding: 0.75rem 1rem;
  border-radius: 8px 8px 0 0;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
}

.input-busqueda {
  flex: 1;
  min-width: 200px;
  max-width: 400px;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  border: none;
  outline: none;
  background: var(--color-blanco);
}

/* Tabla - Versión desktop */
.tabla-productos {
  width: 100%;
  border-collapse: collapse;
  background: var(--color-blanco);
}

.tabla-productos th,
.tabla-productos td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--gris-claro);
  text-align: center;
  transition: background 0.3s;
}

.tabla-productos th {
  background: var(--color-secundario);
  color: var(--color-blanco);
  font-weight: bold;
  position: sticky;
  top: 0;
  border-bottom: 2px solid var(--primario);
}

.tabla-productos tbody tr:hover {
  background: #f7eaf3;
}

.tabla-productos tbody tr.seleccionado {
  background: #ffe3f0;
}

/* Botones */
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
  transform: translateY(-1px);
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
  transition: all 0.3s;
}

.btn-ver:hover {
  background: var(--color-primario);
  transform: scale(1.1);
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
  border-bottom: 1px solid rgba(255,255,255,0.3);
}

.detalle-columna label {
  font-weight: bold;
  margin-bottom: 0.5rem;
  display: block;
}

/* Botones de acciones */
.acciones-detalle .btn {
  border: none;
  border-radius: 8px;
  font-weight: 600;
  padding: 0.5rem 1.2rem;
  transition: background-color 0.2s ease, transform 0.1s ease;
}

/* Botón Editar */
.acciones-detalle .btn-editar {
  background-color: var(--color-suave);
  color: var(--color-blanco);
}

/* Botón Guardar */
.acciones-detalle .btn-guardar {
  background-color: var(--color-acento);
  color: var(--color-blanco);
}

/* Botón Eliminar */
.acciones-detalle .btn-eliminar {
  background-color: #a73333;
  color: var(--color-blanco);
}

/* Botón Agregar Mascota */
.acciones-detalle .btn-agregar {
  background-color: var(--color-secundario);
  color: var(--color-blanco);
}

/* Botón Regresar */
.acciones-detalle .btn-regresar {
  background-color: var(--color-primario);
  color: var(--color-blanco);
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
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  min-width: 100px;
  transition: all 0.3s;
}

.btn-pag:disabled {
  background: var(--color-secundario);
  opacity: 0.7;
}

/* Media Queries para responsividad */
@media (max-width: 992px) {
  .detalle-seccion {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}

/* Versión móvil mejorada - Mantiene estructura de tabla */
@media (max-width: 768px) {
  .tabla-productos {
    font-size: 0.9rem;
  }
  
  .tabla-productos th,
  .tabla-productos td {
    padding: 0.6rem 0.5rem;
  }
  
  /* Ocultamos columnas menos importantes */
  .tabla-productos th:nth-child(3),
  .tabla-productos td:nth-child(3) {
    display: none;
  }
  
  /* Ajustamos el ancho de columnas */
  .tabla-productos th:nth-child(1),
  .tabla-productos td:nth-child(1) {
    width: 25%;
  }
  
  .tabla-productos th:nth-child(2),
  .tabla-productos td:nth-child(2) {
    width: 35%;
    text-align: left;
  }
  
  .tabla-productos th:nth-child(4),
  .tabla-productos td:nth-child(4) {
    width: 20%;
  }
  
  .tabla-productos th:nth-child(5),
  .tabla-productos td:nth-child(5),
  .tabla-productos th:nth-child(6),
  .tabla-productos td:nth-child(6) {
    width: 10%;
  }
  
  /* Header más compacto */
  .card-header {
    padding: 0.5rem;
  }
  
  .input-busqueda {
    padding: 0.4rem 0.8rem;
    font-size: 0.9rem;
  }
  
  /* Botones más pequeños */
  .btn-cliente {
    width: 36px;
    height: 36px;
    padding: 0;
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
}

/* Ajustes para pantallas muy pequeñas */
@media (max-width: 480px) {
  .tabla-productos {
    font-size: 0.8rem;
  }
  
  .tabla-productos th,
  .tabla-productos td {
    padding: 0.4rem 0.3rem;
  }
  
  /* Ocultamos otra columna si es necesario */
  .tabla-productos th:nth-child(4),
  .tabla-productos td:nth-child(4) {
    display: none;
  }
  
  /* Paginación en columna */
  .paginacion {
    flex-direction: column;
  }
  
  .btn-pag {
    width: 100%;
  }
  
  /* Acciones en columna */
  .acciones-detalle {
    flex-direction: column;
  }
  
  .acciones-detalle .btn {
    width: 100%;
  }
}

/* Animaciones */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@keyframes fadeInTable {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>


