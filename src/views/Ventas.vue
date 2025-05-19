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
        <input v-model="busqueda" type="text" class="form-control mb-3" placeholder="Buscar por nombre o código..." />

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
              :key="i"
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
                  :disabled="producto.stock === 0"
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
    <div v-if="ticket.length > 0" class="row mb-4 fade-in-ticket">
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
                <tr v-for="(item, index) in ticketPaginado" :key="index">
                  <td>{{ item.nombre }}</td>
                  <td class="text-center">
                    <input
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
                    <button class="btn btn-danger btn-sm" @click="eliminarItem(index)">
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

            <div class="mb-2">
              <label class="form-label">Cliente:</label>
              <input v-model="cliente" type="text" class="form-control" placeholder="Cliente general" />
            </div>
            <div class="mb-2">
              <label class="form-label">Observaciones:</label>
              <input v-model="observaciones" type="text" class="form-control" />
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

            <hr />
            <p><strong>Subtotal:</strong> <span class="text-secondary">${{ subtotal }}</span></p>
            <p><strong>Descuento total:</strong> <span class="text-secondary">${{ descuentoTotal }}</span></p>
            <h5><strong>Total a pagar:</strong> <span class="text-success">${{ total }}</span></h5>
          </div>
        </div>
      </div>
    </div>

    <!-- BOTONES DE ACCIÓN -->
    <div v-if="ticket.length > 0" class="d-flex gap-3 justify-content-end mb-5 fade-in-ticket">
      <button class="btn btn-primary" @click="guardarVenta">
        <i class="material-icons me-1">check_circle</i> Guardar venta
      </button>
      <button class="btn btn-outline-danger" @click="cancelarVenta">
        <i class="material-icons me-1">cancel</i> Cancelar
      </button>
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
      cliente: '',
      observaciones: '',
      metodoPago: 'efectivo',
      ticket: [],
      historialVentas: [],
      productosOriginal: [],
      paginaCatalogo: 1,
      productosPorPagina: 10,
      paginaTicket: 1,
      itemsPorTicket: 10,
      productos: [
        { codigo: 'P001', nombre: 'Croquetas Adulto', tipo: 'Producto', precio: 250, stock: 10 },
        { codigo: 'S001', nombre: 'Consulta general', tipo: 'Servicio', precio: 150 },
        { codigo: 'P002', nombre: 'Desparasitante', tipo: 'Producto', precio: 80, stock: 5 },
        { codigo: 'S002', nombre: 'Baño y estética', tipo: 'Servicio', precio: 200 },
        { codigo: 'P003', nombre: 'Juguete', tipo: 'Producto', precio: 100, stock: 0 },
        { codigo: 'P004', nombre: 'Correa', tipo: 'Producto', precio: 50, stock: 2 },
        { codigo: 'P005', nombre: 'Peine', tipo: 'Producto', precio: 25, stock: 6 },
        { codigo: 'P006', nombre: 'Cama Grande', tipo: 'Producto', precio: 400, stock: 1 },
        { codigo: 'P007', nombre: 'Champú', tipo: 'Producto', precio: 70, stock: 8 },
        { codigo: 'P008', nombre: 'Transportadora', tipo: 'Producto', precio: 300, stock: 5 },
        { codigo: 'P009', nombre: 'Comedero', tipo: 'Producto', precio: 60, stock: 3 }
      ]
    }
  },
  computed: {
    productosFiltrados() {
      const filtro = this.busqueda.toLowerCase()
      return this.productos
        .filter(p => p.nombre.toLowerCase().includes(filtro) || p.codigo.toLowerCase().includes(filtro))
        .sort((a, b) => {
          const stockA = a.tipo === 'Servicio' ? 1 : (a.stock ?? 0)
          const stockB = b.tipo === 'Servicio' ? 1 : (b.stock ?? 0)
          return (stockB > 0) - (stockA > 0)
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
      return this.ticket.reduce((sum, item) => sum + (item.precio * item.cantidad), 0)
    },
    descuentoTotal() {
      return this.ticket.reduce((sum, item) => {
        const descuento = item.precio * item.cantidad * (item.descuento / 100)
        return sum + descuento
      }, 0)
    },
    total() {
      return (this.subtotal - this.descuentoTotal).toFixed(2)
    }
  },
  methods: {
    agregarAlTicket(producto) {
      const ticketItem = this.ticket.find(item => item.codigo === producto.codigo)
      const productoRef = this.productos.find(p => p.codigo === producto.codigo)
      const esServicio = producto.tipo === 'Servicio'

      if (ticketItem) {
        if (esServicio || (productoRef.stock && productoRef.stock > 0)) {
          ticketItem.cantidad++
          if (!esServicio) productoRef.stock--
        }
      } else {
        this.ticket.push({
          ...producto,
          cantidad: 1,
          descuento: 0
        })
        if (!esServicio) productoRef.stock--
      }
    },
    calcularTotalLinea(item) {
      const total = item.precio * item.cantidad * (1 - item.descuento / 100)
      return total.toFixed(2)
    },
    eliminarItem(index) {
      const item = this.ticket[index]
      const productoRef = this.productos.find(p => p.codigo === item.codigo)
      if (productoRef && productoRef.stock !== undefined && item.tipo !== 'Servicio') {
        productoRef.stock += item.cantidad
      }
      this.ticket.splice(index, 1)
    },
    guardarVenta() {
  if (this.ticket.length === 0) {
    Swal.fire({
      icon: 'warning',
      title: 'Ticket vacío',
      text: 'No hay productos ni servicios en el ticket.',
      confirmButtonColor: '#7c245c'
    })
    return
  }

  Swal.fire({
    title: '¿Deseas guardar la venta?',
    text: `Total: $${this.total}`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, guardar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#7c245c',
    cancelButtonColor: '#aaa'
  }).then((result) => {
    if (result.isConfirmed) {
      const nuevaVenta = {
        folio: `VTA-${this.historialVentas.length + 1}`.padStart(8, '0'),
        fecha: new Date().toLocaleString('es-MX'),
        cliente: this.cliente || 'Cliente general',
        total: this.total
      }

      this.historialVentas.push(nuevaVenta)
      this.generarPDF()
      this.cancelarVenta()

      Swal.fire({
        icon: 'success',
        title: 'Venta guardada',
        text: 'La venta se registró correctamente.',
        confirmButtonColor: '#7c245c'
      })
    }
  })
},



    cancelarVenta() {
      this.ticket.forEach(item => {
        const productoRef = this.productos.find(p => p.codigo === item.codigo)
        if (productoRef && productoRef.stock !== undefined && item.tipo !== 'Servicio') {
          productoRef.stock += item.cantidad
        }
      })
      this.ticket = []
      this.cliente = ''
      this.observaciones = ''
      this.metodoPago = 'efectivo'
    },
    generarPDF() {
  if (this.ticket.length === 0) {
    Swal.fire({
      icon: 'warning',
      title: 'Sin productos',
      text: 'Agrega al menos un producto al ticket antes de generar el PDF.',
      confirmButtonColor: '#7c245c'
    })
    return
  }

  const doc = new jsPDF()

  // Encabezado
  doc.setFontSize(18)
  doc.setTextColor(33, 37, 41)
  doc.text('Paw Friend Veterinaria', 14, 20)

  doc.setFontSize(11)
  doc.setTextColor(100)
  doc.text('Calle Independencia 123, Oaxaca de Juárez', 14, 26)
  doc.text('Tel: 951-123-4567', 14, 31)

  doc.setTextColor(33, 37, 41)
  doc.text(`Fecha: ${new Date().toLocaleDateString('es-MX')}`, 150, 20)
  doc.text(`Hora: ${new Date().toLocaleTimeString('es-MX')}`, 150, 26)
  doc.text(`Cliente: ${this.cliente || 'Cliente general'}`, 14, 38)

  // Tabla de productos
  autoTable(doc, {
    startY: 45,
    head: [['Producto', 'Cantidad', 'Precio', 'Descuento', 'Total']],
    body: this.ticket.map(item => [
      item.nombre,
      item.cantidad,
      `$${item.precio}`,
      `${item.descuento}%`,
      `$${this.calcularTotalLinea(item)}`
    ]),
    headStyles: {
      fillColor: [124, 36, 92], // color #7c245c
      halign: 'center'
    },
    styles: {
      fontSize: 10,
      cellPadding: 4
    }
  })

  // Totales
  const finalY = doc.lastAutoTable.finalY + 10
  doc.setFontSize(11)
  doc.text(`Subtotal: $${this.subtotal}`, 150, finalY)
  doc.text(`Descuento total: $${this.descuentoTotal}`, 150, finalY + 6)
  doc.setFontSize(13)
  doc.text(`Total a pagar: $${this.total}`, 150, finalY + 14)

  // Guardar PDF
  doc.save(`Ticket_${new Date().getTime()}.pdf`)
},

    actualizarTotales() {
      this.ticket = [...this.ticket]
    }
  }
}
</script>

<style scoped>
.container {
  font-family: 'Nunito Sans', sans-serif;
}

.card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.card-title {
  color: #7c245c;
  font-weight: bold;
}

.table {
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
.table th, .table td {
  color: #222;
}

.btn-paginacion {
  border-radius: 20px;
  font-weight: 600;
  color: #ffffff;
  border-color: #dee2e6;
}

.table-sm td,
.table-sm th {
  padding: 0.75rem;
  vertical-align: middle;
}

.btn {
  border-radius: 30px;
  font-weight: 600;
  background-color: #7c245c;
  color: #ffffff;
}
.btn:hover {
  background-color: #a53f72;
}

input.form-control,
select.form-select {
  border-radius: 10px;
}

.text-muted {
  font-style: italic;
}

.swal2-popup {
  font-family: 'Nunito Sans', sans-serif !important;
}

.fade-in-ticket {
  animation: fadeInTicket 0.7s cubic-bezier(0.4,0,0.2,1);
}
@keyframes fadeInTicket {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.ticket-card, .resumen-card {
  border: 1.5px solid #d1c4e9;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(124,36,92,0.08);
}
.ticket-table th, .ticket-table td {
  background: #fff;
  color: #222;
  border-bottom: 1px solid #e9e9e9;
}
.ticket-table thead th {
  background: #f3e4ec;
  color: #7c245c;
  font-weight: bold;
}
.resumen-card label,
.resumen-card p,
.resumen-card h5 {
  color: #222 !important;
}
.resumen-num {
  color: #7c245c;
  font-weight: bold;
  font-size: 1.1em;
}
.btn, .btn-sm, .btn-success, .btn-danger, .btn-outline-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.4em;
}
.btn .material-icons,
.btn-sm .material-icons {
  vertical-align: middle;
  font-size: 1.1em;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.btn.btn-success.btn-sm {
  justify-content: center;
  align-items: center;
  padding: 0.35rem 0.7rem;
}

/* ✅ CAMBIOS A SOLICITUD */

/* Evita títulos azules (ej. "Ticket actual") */
.card-title {
  color: #ffffff !important;
}

/* Botones outline-primary con borde y texto blanco */
.btn-outline-primary {
  color: #ffffff;
  border-color: #ffffff;
}
.btn-outline-primary:hover {
  background-color: #ffffff;
  color: #7c245c;
}

/* Evita contorno azul al enfocar */
.btn:focus,
.btn-outline-primary:focus,
input:focus,
select:focus {
  outline: none;
  box-shadow: 0 0 0 0.2rem rgba(255, 255, 255, 0.4);
}

/* Íconos blancos también */
.btn .material-icons,
.btn-sm .material-icons {
  color: #ffffff;
}

input.form-control:focus,
select.form-select:focus {
  border-color: #7c1454; 
  box-shadow: 0 0 0 0.2rem rgba(124, 20, 84, 0.25);
  outline: none;
}

select.form-select {
  color: #222;
}
</style>

