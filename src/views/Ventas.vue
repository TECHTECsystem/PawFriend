<template>
  <Navbar />

  <div class="container mt-4">
    <!-- ENCABEZADO -->
    <div class="mb-4">
      <h2 class="mb-1">Ventas</h2>
      <p class="text">Gestión y registro de productos y servicios vendidos.</p>
    </div>

    <!-- CATÁLOGO -->
    <div class="card mb-5 shadow-sm rounded-3">
      <div class="card-body">
        <h5 class="card-title text-primary fw-semibold">Catálogo de productos y servicios</h5>
        <input
          v-model="busqueda"
          type="text"
          class="form-control mb-3"
          placeholder="Buscar por nombre o código..."
        />

        <table class="table table-bordered table-sm table-hover align-middle text-center">
          <thead class="table-light">
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(producto, i) in productosPaginados"
              :key="producto.codigo"
              :class="{ 'text-decoration-line-through text-muted': producto.stock === 0 }"
            >
              <td>{{ producto.codigo }}</td>
              <td>{{ producto.nombre }}</td>
              <td>{{ producto.tipo }}</td>
              <td>${{ producto.precio }}</td>
              <td>{{ producto.stock ?? '-' }}</td>
              <td>
                <button
                  class="btn btn-outline-success btn-sm"
                  @click="agregarAlTicket(producto)"
                  :disabled="producto.tipo==='Producto' && producto.stock===0"
                >
                  <i class="material-icons">add_shopping_cart</i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Paginación catálogo -->
        <div class="d-flex justify-content-end mt-2">
          <button
            class="btn btn-outline-primary btn-sm me-2"
            :disabled="paginaCatalogo === 1"
            @click="paginaCatalogo--"
          >
            Anterior
          </button>
          <button
            class="btn btn-outline-primary btn-sm"
            :disabled="paginaCatalogo === totalPaginasCatalogo"
            @click="paginaCatalogo++"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>

    <!-- TICKET Y RESUMEN -->
    <div v-if="ticket.length" class="row mb-4 fade-in-ticket">
      <!-- TICKET -->
      <div class="col-md-8 mb-3">
        <div class="card h-100 shadow-sm rounded-3">
          <div class="card-body">
            <h5 class="card-title text-primary fw-semibold">Ticket actual</h5>
            <table class="table table-sm table-hover align-middle">
              <thead class="table-light text-center">
                <tr>
                  <th>Nombre</th>
                  <th>Cantidad</th>
                  <th>Precio</th>
                  <th>Descuento %</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, idx) in ticketPaginado" :key="item.codigo + '-' + idx">
                  <td>{{ item.nombre }}</td>
                  <td class="text-center">
                    <span v-if="item.tipo === 'Servicio'">1</span>
                    <input
                      v-else
                      type="number"
                      min="1"
                      class="form-control form-control-sm text-center"
                      v-model.number="item.cantidad"
                      @input="actualizarTotales"
                    />
                  </td>
                  <td class="text-center">${{ item.precio }}</td>
                  <td class="text-center">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      class="form-control form-control-sm text-center"
                      v-model.number="item.descuento"
                      @input="actualizarTotales"
                    />
                  </td>
                  <td class="text-center">${{ calcularTotalLinea(item) }}</td>
                  <td class="text-center">
                    <div v-if="item.tipo === 'Servicio' && mascotasCliente.length">
                      <select v-model="item.mascota_id" class="form-select form-select-sm">
                        <option disabled value="">Selecciona mascota</option>
                        <option v-for="m in mascotasCliente" :key="m.id" :value="m.id">
                          {{ m.nombre }} ({{ m.especie }})
                        </option>
                      </select>
                    </div>
                    <button class="btn btn-danger btn-sm mt-1" @click="eliminarItem(idx)">
                      <i class="material-icons">delete</i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Paginación Ticket -->
            <div class="d-flex justify-content-end mt-2">
              <button
                class="btn btn-outline-primary btn-sm me-2"
                :disabled="paginaTicket === 1"
                @click="paginaTicket--"
              >
                Anterior
              </button>
              <button
                class="btn btn-outline-primary btn-sm"
                :disabled="paginaTicket === totalPaginasTicket"
                @click="paginaTicket++"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- RESUMEN -->
<div class="col-md-4">
  <div class="card h-100 shadow-sm rounded-3 resumen-card">
    <div class="card-body">
      <h5 class="card-title text-primary fw-semibold">Resumen</h5>

      <!-- Sección Cliente -->
      <div class="accordion mb-3" id="accordionResumen">
        <div class="accordion-item">
          <h6 class="accordion-header">
            <button
              class="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#clienteCollapse"
            >
              Datos del cliente
            </button>
          </h6>
          <div
            id="clienteCollapse"
            class="accordion-collapse collapse"
            data-bs-parent="#accordionResumen"
          >
            <div class="accordion-body">
              <div class="d-flex align-items-center gap-2 flex-wrap mb-3">
                <select
                  v-model="selectedClienteId"
                  class="form-select flex-grow-1"
                  aria-label="Selecciona cliente"
                >
                  <option disabled value="">-- Selecciona cliente --</option>
                  <option
                    v-for="c in clientes"
                    :key="c.id"
                    :value="c.id"
                  >
                    {{ c.nombre }}
                  </option>
                </select>
                <button
                  class="btn btn-outline-primary"
                  type="button"
                  @click="openClienteModal"
                >
                  <i class="material-icons">add</i>
                </button>
                <button
                  v-if="selectedClienteId"
                  class="btn btn-outline-primary"
                  type="button"
                  @click="openMascotaModal"
                  title="Agregar mascota"
                >
                  <i class="material-icons">pets</i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Sección Venta -->
        <div class="accordion-item">
          <h6 class="accordion-header">
            <button
              class="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#ventaCollapse"
            >
              Detalles de la venta
            </button>
          </h6>
          <div
            id="ventaCollapse"
            class="accordion-collapse collapse"
            data-bs-parent="#accordionResumen"
          >
            <div class="accordion-body">
              <div class="mb-2">
                <label class="form-label">Observaciones:</label>
                <input
                  v-model="observaciones"
                  type="text"
                  class="form-control"
                />
              </div>
              <div class="mb-3">
                <label class="form-label">Método de pago:</label>
                <select v-model="metodoPago" class="form-select">
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="mixto">Mixto</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Totales -->
      <hr />
      <p><strong>Subtotal:</strong> <span class="text-secondary">${{ subtotal }}</span></p>
      <p><strong>Descuento total:</strong> <span class="text-secondary">${{ descuentoTotal }}</span></p>
      <h5><strong>Total a pagar:</strong> <span class="text-success">${{ total }}</span></h5>
    </div>
  </div>
</div>

    </div>

    <!-- BOTONES DE ACCIÓN -->
    <div
      v-if="ticket.length"
      class="d-flex gap-3 justify-content-end mb-5 fade-in-ticket"
    >
      <button class="btn btn-primary" @click="guardarVenta">
        <i class="material-icons me-1">check_circle</i> Guardar venta
      </button>
      <button class="btn btn-outline-danger" @click="cancelarVenta">
        <i class="material-icons me-1">cancel</i> Cancelar
      </button>
    </div>
  </div>

  <!-- Modal para crear cliente -->
  <div
    class="modal fade"
    id="clienteModal"
    tabindex="-1"
    aria-labelledby="clienteModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="clienteModalLabel">Nuevo Cliente</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Cerrar"
          ></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label class="form-label">Nombre completo</label>
            <input
              v-model="clienteForm.nombre"
              type="text"
              class="form-control"
              placeholder="Ej. Juan Pérez"
            />
          </div>
          <div class="mb-3">
            <label class="form-label">Teléfono</label>
            <input
              v-model="clienteForm.telefono"
              type="tel"
              class="form-control"
              placeholder="Opcional"
            />
          </div>
          <div class="mb-3">
            <label class="form-label">Email</label>
            <input
              v-model="clienteForm.correo"
              type="email"
              class="form-control"
              placeholder="Opcional"
            />
          </div>
          <div class="form-check mb-3">
            <input
              class="form-check-input"
              type="checkbox"
              id="tieneMascota"
              v-model="clienteForm.tieneMascota"
            />
            <label class="form-check-label" for="tieneMascota">
              ¿Tiene mascota?
            </label>
          </div>

          <div
            v-if="clienteForm.tieneMascota"
            class="border p-3 rounded"
          >
            <div class="mb-3">
              <label class="form-label">Nombre mascota</label>
              <input
                v-model="clienteForm.mascota.nombre"
                type="text"
                class="form-control"
                placeholder="Ej. Luna"
              />
            </div>
            <div class="mb-3">
              <label class="form-label">Especie</label>
              <input
                v-model="clienteForm.mascota.especie"
                type="text"
                class="form-control"
                placeholder="Ej. Perro"
              />
            </div>
            <div class="mb-3">
              <label class="form-label">Edad</label>
              <div class="input-group">
                <input
                  v-model.number="clienteForm.mascota.edad"
                  type="number"
                  min="0"
                  class="form-control"
                />
                <select
                  v-model="clienteForm.mascota.unidad_edad"
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
                v-model="clienteForm.mascota.raza"
                type="text"
                class="form-control"
                placeholder="Opcional"
              />
            </div>
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
            @click="guardarCliente"
          >
            Guardar
          </button>
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
                v-model="nuevaMascota.unidad_edad"
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
import Navbar from '../components/Navbar.vue'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import Swal from 'sweetalert2'

export default {
  name: 'Ventas',
  components: { Navbar },

  data() {
    return {
      busqueda: '',
      // clientes y selección
      clientes: [],
      selectedClienteId: '',
      mascotasCliente: [], // Mascotas del cliente seleccionado
      clienteForm: {
        nombre: '',
        telefono: '',
        correo: '',
        tieneMascota: false,
        mascota: {
          nombre: '',
          especie: '',
          edad: 0,
          unidad_edad: 'años',
          raza: ''
        }
      },
      // datos de mascota para la venta
      mascotaNombre: '',
      mascotaEdad: 0,
      mascotaUnidadEdad: 'años',
      mascotaEspecie: '',
      mascotaRaza: '',
      // venta
      observaciones: '',
      metodoPago: 'efectivo',
      usuarioId: null,
      // catálogo y ticket
      productos: [],
      ticket: [],
      paginaCatalogo: 1,
      productosPorPagina: 10,
      paginaTicket: 1,
      itemsPorTicket: 10,
      // reloj
      fecha: '',
      hora: '',
      intervalo: null,
      // nueva mascota
      nuevaMascota: {
        nombre: '',
        especie: '',
        raza: '',
        edad: 0,
        unidad_edad: 'años'
      }
    }
  },

  computed: {
    clienteSeleccionado() {
      return this.clientes.find(c => c.id === this.selectedClienteId) || {}
    },
    productosFiltrados() {
      const filtro = this.busqueda.toLowerCase()
      return this.productos
        .filter(
          p =>
            p.nombre.toLowerCase().includes(filtro) ||
            (p.codigo && p.codigo.toLowerCase().includes(filtro))
        )
        .sort((a, b) => {
          const stockA = a.tipo === 'Servicio' ? 1 : a.stock ?? 0
          const stockB = b.tipo === 'Servicio' ? 1 : b.stock ?? 0
          return Number(stockB > 0) - Number(stockA > 0)
        })
    },
    productosPaginados() {
      const start = (this.paginaCatalogo - 1) * this.productosPorPagina
      return this.productosFiltrados.slice(start, start + this.productosPorPagina)
    },
    totalPaginasCatalogo() {
      return Math.ceil(this.productosFiltrados.length / this.productosPorPagina)
    },
    ticketPaginado() {
      const start = (this.paginaTicket - 1) * this.itemsPorTicket
      return this.ticket.slice(start, start + this.itemsPorTicket)
    },
    totalPaginasTicket() {
      return Math.ceil(this.ticket.length / this.itemsPorTicket)
    },
    subtotal() {
      return this.ticket.reduce((sum, item) => sum + item.precio * item.cantidad, 0)
    },
    descuentoTotal() {
      return this.ticket.reduce(
        (sum, item) =>
          sum + item.precio * item.cantidad * (item.descuento / 100),
        0
      )
    },
    total() {
      return (this.subtotal - this.descuentoTotal).toFixed(2)
    },
    hayServicioEnTicket() {
      return this.ticket.some(item => item.tipo === 'Servicio')
    }
  },

  watch: {
    selectedClienteId(newVal) {
      this.cargarMascotasCliente(newVal)
      // Limpiar selección de mascota en servicios del ticket al cambiar cliente
      this.ticket.forEach(item => {
        if (item.tipo === 'Servicio') item.mascota_id = ''
      })
    }
  },

  async mounted() {
    const token = localStorage.getItem('token')
    if (!token) return this.$router.push('/login')
    this.usuarioId = +localStorage.getItem('id_usuario')
    await this.cargarClientes(token)
    await this.cargarCatalogo(token)
    this.actualizarReloj()
    this.intervalo = setInterval(this.actualizarReloj, 1000)
  },

  beforeUnmount() {
    clearInterval(this.intervalo)
  },

  methods: {
    actualizarReloj() {
      const ahora = new Date()
      this.fecha = ahora.toLocaleDateString('es-MX', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      this.hora = ahora.toLocaleTimeString('es-MX')
    },

    // clientes
    async cargarClientes(token) {
      try {
        const res = await fetch('http://localhost:8080/api/clientes', {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.clientes = await res.json()
      } catch (e) {
        console.error(e)
        Swal.fire('Error', 'No se pudieron cargar los clientes', 'error')
      }
    },
    openClienteModal() {
      this.clienteForm = {
        nombre: '',
        telefono: '',
        correo: '',
        tieneMascota: false,
        mascota: { nombre: '', especie: '', edad: 0, unidad_edad: 'años', raza: '' }
      }
      const modalEl = document.getElementById('clienteModal')
      new bootstrap.Modal(modalEl).show()
    },
    async guardarCliente() {
      // nuevos clientes
      if (!this.clienteForm.nombre.trim()) {
        return Swal.fire('Error', 'El nombre es obligatorio', 'error')
      }
      const token = localStorage.getItem('token')
      try {
        // crear cliente
        const res1 = await fetch('http://localhost:8080/api/clientes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            nombre: this.clienteForm.nombre,
            telefono: this.clienteForm.telefono || null,
            correo: this.clienteForm.correo || null
          })
        })
        const nuevo = await res1.json()
        this.clientes.push(nuevo)
        this.selectedClienteId = nuevo.id

        // si hay mascota
        if (this.clienteForm.tieneMascota) {
          await fetch('http://localhost:8080/api/mascotas', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              ...this.clienteForm.mascota,
              cliente_id: nuevo.id
            })
          })
        }

        bootstrap.Modal.getInstance(
          document.getElementById('clienteModal')
        ).hide()
        Swal.fire('Éxito', 'Cliente registrado', 'success')
      } catch (e) {
        console.error(e)
        Swal.fire('Error', 'No se pudo registrar el cliente', 'error')
      }
    },
    async cargarMascotasCliente(clienteId) {
      if (!clienteId) {
        this.mascotasCliente = []
        return
      }
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`http://localhost:8080/api/clientes/${clienteId}/mascotas`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.mascotasCliente = await res.json()
      } catch (e) {
        console.error(e)
        this.mascotasCliente = []
      }
    },

    // catálogo
    async cargarCatalogo(token) {
      try {
        const res = await fetch('http://localhost:8080/api/catalogo', {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.productos = await res.json()
      } catch (e) {
        console.error(e)
        Swal.fire('Error', 'No se pudo cargar el catálogo.', 'error')
      }
    },

    agregarAlTicket(producto) {
      const esServicio = producto.tipo === 'Servicio'
      if (esServicio) {
        // Los servicios siempre se agregan como una nueva línea, cantidad fija en 1
        this.ticket.push({
          id: producto.id, // <-- importante para el backend
          codigo: producto.codigo,
          nombre: producto.nombre,
          tipo: producto.tipo,
          precio: producto.precio,
          cantidad: 1,
          descuento: 0,
          mascota_id: '' // Para seleccionar mascota
        })
      } else {
        const existe = this.ticket.find(i => i.codigo === producto.codigo)
        if (existe) {
          if (producto.stock > 0) {
            existe.cantidad++
            producto.stock--
          } else {
            Swal.fire('Sin stock', `No hay stock de ${producto.nombre}`, 'warning')
          }
        } else {
          this.ticket.push({
            id: producto.id, // <-- importante para el backend
            codigo: producto.codigo,
            nombre: producto.nombre,
            tipo: producto.tipo,
            precio: producto.precio,
            cantidad: 1,
            descuento: 0
          })
          if (producto.stock !== undefined) producto.stock--
        }
      }
    },

    calcularTotalLinea(item) {
      return (item.precio * item.cantidad * (1 - item.descuento / 100)).toFixed(2)
    },

    eliminarItem(idx) {
      const item = this.ticket[idx]
      const prod = this.productos.find(p => p.codigo === item.codigo)
      if (prod && prod.stock !== undefined && item.tipo !== 'Servicio') {
        prod.stock += item.cantidad
      }
      this.ticket.splice(idx, 1)
    },

    async guardarVenta() {
      if (!this.selectedClienteId) {
        return Swal.fire('Error', 'Selecciona un cliente', 'error')
      }
      // Validar que cada servicio tenga mascota seleccionada si hay mascotas disponibles
      const serviciosSinMascota = this.ticket.filter(i => i.tipo === 'Servicio' && this.mascotasCliente.length && !i.mascota_id)
      if (serviciosSinMascota.length) {
        return Swal.fire('Error', 'Selecciona una mascota para cada servicio', 'error')
      }
      const confirm = await Swal.fire({
        title: '¿Confirmar venta?',
        html: `
          <p><strong>Cliente:</strong> ${this.clienteSeleccionado.nombre}</p>
          <p><strong>Total:</strong> $${this.total}</p>
          <p><strong>Método de pago:</strong> ${this.metodoPago}</p>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Confirmar'
      })
      if (!confirm.isConfirmed) return

      const token = localStorage.getItem('token')
      // Armar payload según requerimiento
      let mascotaVentaId = null
      const primerServicioConMascota = this.ticket.find(i => i.tipo === 'Servicio' && i.mascota_id)
      if (primerServicioConMascota) {
        mascotaVentaId = primerServicioConMascota.mascota_id
      }
      const payload = {
        cliente_id: this.selectedClienteId,
        mascota_id: mascotaVentaId,
        usuario_id: this.usuarioId,
        observaciones: this.observaciones,
        metodo_pago: this.metodoPago,
        productos: this.ticket
          .filter(i => i.tipo === 'Producto')
          .map(i => ({
            producto_id: i.id,
            cantidad: i.cantidad,
            precio_unitario: i.precio
          })),
        servicios: this.ticket
          .filter(i => i.tipo === 'Servicio')
          .map(i => ({
            servicio_id: i.id,
            precio_unitario: i.precio
          }))
      }

      try {
        // 1. POST venta
        const res = await fetch('http://localhost:8080/api/ventas', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        })
        const data = await res.json()
        if (!res.ok) {
          const detalle = data.detalle ? ' – ' + data.detalle : ''
          throw new Error((data.error || 'Error al guardar venta') + detalle)
        }
        // 2. Actualizar stock de productos vendidos
        for (const prod of payload.productos) {
          await fetch(`http://localhost:8080/api/productos/${prod.producto_id}/stock`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ cantidad: prod.cantidad })
          })
        }
        // 3. Éxito: mostrar, PDF, limpiar, recargar catálogo
        Swal.fire('¡Listo!', 'Venta #' + data.venta_id + ' registrada', 'success')
        this.generarPDF()
        this.cancelarVenta()
        await this.cargarCatalogo(token)
      } catch (err) {
        console.error(err)
        Swal.fire('Error al registrar venta', err.message, 'error')
      }
    },

    cancelarVenta() {
      this.ticket.forEach(item => {
        if (item.tipo === 'Producto') {
          const prod = this.productos.find(p => p.id === item.id)
          prod.stock += item.cantidad
        }
      })
      this.ticket = []
      this.selectedClienteId = ''
      this.mascotaNombre = ''
      this.mascotaEspecie = ''
      this.mascotaRaza = ''
      this.mascotaEdad = 0
      this.mascotaUnidadEdad = 'años'
      this.observaciones = ''
      this.metodoPago = 'efectivo'
    },

    generarPDF() {
      const doc = new jsPDF()
      doc.setFontSize(18)
      doc.text('Paw Friend Veterinaria', 14, 20)
      doc.setFontSize(11)
      doc.text(`Fecha: ${new Date().toLocaleDateString('es-MX')}`, 150, 20)
      doc.text(`Cliente: ${this.clienteSeleccionado.nombre}`, 14, 38)
      if (this.hayServicioEnTicket) {
        doc.text(`Mascota: ${this.mascotaNombre}`, 14, 44)
        doc.text(`Especie: ${this.mascotaEspecie}`, 14, 50)
      }
      autoTable(doc, {
        startY: this.hayServicioEnTicket ? 60 : 50,
        head: [['Producto', 'Cant.', 'Precio', 'Descuento', 'Total']],
        body: this.ticket.map(item => [
          item.nombre,
          item.cantidad,
          `$${item.precio}`,
          `${item.descuento}%`,
          `$${this.calcularTotalLinea(item)}`
        ])
      })
      const finalY = doc.lastAutoTable.finalY + 10
      doc.text(`Subtotal: $${this.subtotal}`, 150, finalY)
      doc.text(`Total a pagar: $${this.total}`, 150, finalY + 6)
      doc.save(`Ticket_${Date.now()}.pdf`)
    },

    actualizarTotales() {
      this.ticket = [...this.ticket]
    },

    // mascotas
    openMascotaModal() {
      if (!this.selectedClienteId) {
        return Swal.fire('Error', 'Selecciona un cliente primero', 'error')
      }
      this.nuevaMascota = {
        nombre: '',
        especie: '',
        edad: 0,
        unidad_edad: 'años',
        raza: ''
      }
      const modalEl = document.getElementById('mascotaModal')
      new bootstrap.Modal(modalEl).show()
    },
    async guardarMascota() {
      if (!this.nuevaMascota.nombre.trim() || !this.nuevaMascota.especie.trim()) {
        return Swal.fire('Error', 'Nombre y especie son obligatorios', 'error')
      }
      try {
        const token = localStorage.getItem('token')
        await fetch(`http://localhost:8080/api/mascotas`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            ...this.nuevaMascota,
            cliente_id: this.selectedClienteId
          })
        })
        await this.cargarMascotasCliente(this.selectedClienteId)
        bootstrap.Modal.getInstance(document.getElementById('mascotaModal')).hide()
        Swal.fire('Éxito', 'Mascota agregada', 'success')
      } catch (e) {
        console.error(e)
        Swal.fire('Error', 'No se pudo agregar la mascota', 'error')
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
  --color-claro: #f4f4f9;
  --color-texto: #222;
  --color-blanco: #ffffff;
  --color-error: #b00020;
  --color-stock-bajo: #ffe3f0;
}

.container {
  font-family: 'Nunito Sans', sans-serif;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem;
}

.card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  background: var(--color-blanco);
}

.card-title,
h5.text-primary {
  color: white !important;
}

.table {
  width: 100%;
  min-width: 600px;
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #dee2e6;
}

.table thead {
  background-color: #f3e4ec;
  color: #7c245c;
  font-weight: bold;
}

.table th,
.table td {
  color: #222;
  text-align: center;
  padding: 0.75rem;
}

.table-hover tbody tr:hover {
  background-color: #fdf0f6;
  transition: background-color 0.2s ease-in-out;
}

.table tbody tr.sin-stock {
  background-color: var(--color-stock-bajo);
  color: #888;
  text-decoration: line-through;
}

.text-muted {
  font-style: italic;
}

.swal2-popup {
  font-family: 'Nunito Sans', sans-serif !important;
}

input.form-control,
select.form-select {
  border-radius: 10px;
  color: var(--color-texto);
  width: 100%;
}

input.form-control::placeholder,
select.form-select::placeholder {
  color: #999;
  font-style: italic;
}

input.form-control:focus,
select.form-select:focus {
  border-color: var(--color-acento);
  box-shadow: 0 0 0 0.2rem rgba(124, 20, 84, 0.25);
  outline: none;
}

.btn {
  border-radius: 100px;
  font-weight: 600;
  background-color: var(--color-primario);
  color: var(--color-blanco);
  display: inline-flex;
  align-items: center;
  gap: 0.4em;
  transition: background 0.2s ease-in-out;
  white-space: nowrap;
  padding: 0.5rem 1.2rem;
}

.btn:hover {
  background-color: var(--color-suave);
}

.btn-outline-primary {
  background-color: transparent;
  border: 2px solid var(--color-acento);
  color: var(--color-acento);
}

.btn-outline-primary:hover {
  background-color: var(--color-acento);
  color: var(--color-blanco);
}

.btn-outline-danger {
  border: 2px solid darkred;
  background-color: transparent;
  color: darkred;
}

.btn-outline-danger:hover {
  background-color: darkred;
  color: var(--color-blanco);
}

.btn-secondary {
  background-color: var(--color-primario);
  color: var(--color-blanco);
  border: none;
}

.btn-secondary:hover {
  background-color: var(--color-suave);
}

.btn-sm {
  padding: 0.4rem 0.7rem;
}

.btn-accion {
  background-color: var(--color-acento);
  border: none;
  color: white;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background 0.2s ease-in-out;
}

.btn-accion:hover {
  background-color: var(--color-suave);
}

.btn-accion.eliminar {
  background-color: darkred;
}

.btn-accion.eliminar:hover {
  background-color: #b22222;
}

.accordion-button:not(.collapsed) {
  background-color: #a45484;
  color: white;
}

.accordion-button:hover {
  background-color: #7c245c;
  color: white;
}

.accordion-button:not(.collapsed)::after,
.accordion-button:hover::after {
  filter: brightness(0) invert(1);
}

.material-icons {
  font-size: 22px;
  vertical-align: middle;
}

.fade-in-ticket {
  animation: fadeInTicket 0.7s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fadeInTicket {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.ticket-card,
.resumen-card {
  border: 1.5px solid #d1c4e9;
  background: var(--color-blanco);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(124, 36, 92, 0.08);
  margin-top: 1rem;
  padding: 1rem;
}

.ticket-table th,
.ticket-table td {
  background: var(--color-blanco);
  color: var(--color-texto);
  border-bottom: 1px solid var(--color-claro);
}

.ticket-table thead th {
  background: var(--color-secundario);
  color: var(--color-blanco);
  font-weight: bold;
}

.resumen-card label,
.resumen-card h5 {
  color: var(--color-texto) !important;
}

.resumen-card p {
  color: #222;
}

.resumen-card h5 span {
  font-weight: bold;
  font-size: 1.25rem;
  color: #28a745;
}

.resumen-num {
  color: var(--color-primario);
  font-weight: bold;
  font-size: 1.1em;
}

/* Responsividad */
@media (max-width: 992px) {
  .container {
    padding: 0.75rem;
  }

  .ticket-card,
  .resumen-card {
    padding: 1rem;
  }

  .btn {
    font-size: 0.95rem;
  }
}

@media (max-width: 768px) {
  .table {
    font-size: 0.9rem;
    min-width: 100%;
  }

  .table th:nth-child(3),
  .table td:nth-child(3) {
    display: none;
  }

  .btn {
    padding: 0.4rem 0.8rem;
    font-size: 0.9rem;
  }

  .btn-accion {
    width: 36px;
    height: 36px;
    font-size: 18px;
  }

  .ticket-card,
  .resumen-card {
    padding: 0.8rem;
  }
}

@media (max-width: 480px) {
  .table th,
  .table td {
    padding: 0.4rem;
    font-size: 0.8rem;
  }

  .ticket-card,
  .resumen-card {
    padding: 0.6rem;
  }

  .btn {
    width: 100%;
    text-align: center;
    justify-content: center;
  }
}
</style>



