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
            placeholder="Buscar producto..."
            class="input-busqueda"
          />
        </div>
        <div class="card-body p-0">
          <table class="tabla-productos mb-0">
            <thead>
              <tr style="background: var(--color-secundario); color: white">
                <th>SKU</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th class="text-center">Stock</th>
                <th class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="producto in productosPaginados"
                :key="producto.id"
                :class="{ seleccionado: productoSeleccionado && producto.id === productoSeleccionado.id }"
              >
                <td>{{ producto.sku }}</td>
                <td>{{ producto.nombre }}</td>
                <td>{{ producto.categoria }}</td>
                <td>{{ producto.precio | formatearMoneda }}</td>
                <td class="text-center align-middle">
                  <div class="d-flex justify-content-center align-items-center gap-2">
                    <button class="btn-stock" @click="cambiarStock(producto, -1)">-</button>
                    <span class="stock-valor">{{ producto.stock }}</span>
                    <button class="btn-stock" @click="cambiarStock(producto, 1)">+</button>
                  </div>
                </td>
                <td class="text-center align-middle">
                  <div class="d-flex justify-content-center">
                    <button class="btn-ver" @click="alternarSeleccion(producto)" style="background: var(--color-acento); width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                      <span class="material-icons" style="font-size: 20px;">
                        {{ productoSeleccionado && producto.id === productoSeleccionado.id ? 'close' : 'visibility' }}
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
          <div v-if="productoSeleccionado" key="detalle" class="card panel-visualizacion" style="background: var(--color-suave); color: var(--color-blanco);">
            <div class="card-body">
              <h4 class="fw-bold mb-3">Detalles del producto</h4>
              <div class="detalle-seccion">
                <div class="detalle-columna">
                  <label><strong>SKU</strong></label>
                  <div v-if="!modoEdicion">{{ productoSeleccionado.sku }}</div>
                  <input v-else v-model="productoSeleccionado.sku" class="form-control" />
                </div>
                <div class="detalle-columna">
                  <label><strong>Categoría</strong></label>
                  <div v-if="!modoEdicion">{{ productoSeleccionado.categoria }}</div>
                  <input v-else v-model="productoSeleccionado.categoria" class="form-control" />
                </div>
                <div class="detalle-columna">
                  <label><strong>Precio</strong></label>
                  <div v-if="!modoEdicion">{{ productoSeleccionado.precio | formatearMoneda }}</div>
                  <input v-else type="number" v-model.number="productoSeleccionado.precio" class="form-control" />
                </div>
                <div class="detalle-columna">
                  <label><strong>Stock</strong></label>
                  <div v-if="!modoEdicion">{{ productoSeleccionado.stock }}</div>
                  <input v-else type="number" v-model.number="productoSeleccionado.stock" class="form-control" />
                </div>
              </div>
              <div class="descripcion-producto mt-3">
                <label><strong>Descripción:</strong></label>
                <div v-if="!modoEdicion">{{ productoSeleccionado.descripcion }}</div>
                <input v-else v-model="productoSeleccionado.descripcion" class="form-control" />
              </div>
              <div class="mt-3 acciones-detalle">
                <button v-if="!modoEdicion" class="btn me-2" style="background: var(--color-primario); color: white" @click="modoEdicion = true">Editar</button>
                <button v-if="modoEdicion" class="btn me-2" style="background: var(--color-acento); color: white" @click="guardarCambios">Guardar</button>
                <button v-if="modoEdicion" class="btn me-2" style="background: darkred; color: white" @click="eliminarProducto(productoSeleccionado.id)">Eliminar</button>
                <button class="btn btn-secondary" @click="limpiarSeleccion">← Regresar</button>
              </div>
            </div>
          </div>
          <div v-else key="mensaje" class="panel-visualizacion-inicial">
            <p>Selecciona un producto para ver detalles.</p>
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
  name: 'InventarioProductos',
  components: { Navbar },
  data() {
    return {
      busqueda: '',
      productos: [],
      productoSeleccionado: null,
      modoEdicion: false,
      paginaActual: 1,
      productosPorPagina: 10,
      paginaAnterior: 1
    };
  },
  filters: {
    formatearMoneda(value) {
      return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
    }
  },
  computed: {
    productosFiltrados() {
      if (this.productoSeleccionado) return [this.productoSeleccionado];
      const termino = DOMPurify.sanitize(this.busqueda).toLowerCase().trim();
      if (!termino) return this.productos;
      return this.productos.filter(p => Object.values(p).some(val => {
        if (typeof val === 'string') return val.toLowerCase().includes(termino);
        if (typeof val === 'number') return val.toString().includes(termino);
        return false;
      }));
    },
    productosPaginados() {
      const start = (this.paginaActual - 1) * this.productosPorPagina;
      return this.productosFiltrados.slice(start, start + this.productosPorPagina);
    },
    totalPaginas() {
      return Math.ceil(this.productosFiltrados.length / this.productosPorPagina) || 1;
    }
  },
  methods: {
    alternarSeleccion(producto) {
      if (this.productoSeleccionado && this.productoSeleccionado.id === producto.id) {
        this.limpiarSeleccion();
      } else {
        this.paginaAnterior = this.paginaActual;
        this.paginaActual = 1;
        this.productoSeleccionado = { ...producto };
        this.modoEdicion = false;
      }
    },
    limpiarSeleccion() {
      this.productoSeleccionado = null;
      this.paginaActual = this.paginaAnterior;
    },
    guardarCambios() {
      const idx = this.productos.findIndex(p => p.id === this.productoSeleccionado.id);
      if (idx !== -1) {
        this.productos.splice(idx, 1, this.productoSeleccionado);
        Swal.fire('Actualizado', 'Cambios guardados correctamente', 'success');
        this.limpiarSeleccion();
      }
    },
    eliminarProducto(id) {
      Swal.fire({
        title: '¿Eliminar producto?',
        text: 'No podrás revertir esto',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: 'var(--rojo)'
      }).then(res => {
        if (res.isConfirmed) {
          this.productos = this.productos.filter(p => p.id !== id);
          Swal.fire('Eliminado', 'Producto eliminado', 'success');
          if (this.productoSeleccionado && this.productoSeleccionado.id === id) {
            this.limpiarSeleccion();
          }
        }
      });
    },
    cambiarStock(producto, cantidad) {
      const idx = this.productos.findIndex(p => p.id === producto.id);
      if (idx !== -1) {
        const nuevoStock = this.productos[idx].stock + cantidad;
        if (nuevoStock >= 0) this.productos[idx].stock = nuevoStock;
      }
    }
  },
  mounted() {
    this.productos = [
      { id: 1, sku: 'VET001', nombre: 'Alimento para perro adulto', categoria: 'Alimentos', precio: 650, stock: 25, descripcion: 'Alimento balanceado para perros adultos de todas las razas.' },
      { id: 2, sku: 'VET002', nombre: 'Alimento para gato esterilizado', categoria: 'Alimentos', precio: 720, stock: 18, descripcion: 'Alimento premium para gatos esterilizados, bajo en calorías.' },
      { id: 3, sku: 'VET003', nombre: 'Juguete mordedera para perro', categoria: 'Juguetes', precio: 120, stock: 40, descripcion: 'Juguete resistente para la limpieza dental de perros.' },
      { id: 4, sku: 'VET004', nombre: 'Rascador para gato', categoria: 'Accesorios', precio: 350, stock: 12, descripcion: 'Rascador de sisal para gatos, ayuda a mantener sus uñas sanas.' },
      { id: 5, sku: 'VET005', nombre: 'Shampoo antipulgas', categoria: 'Higiene', precio: 180, stock: 30, descripcion: 'Shampoo especial para eliminar pulgas y garrapatas.' },
      { id: 6, sku: 'VET006', nombre: 'Collar isabelino', categoria: 'Accesorios', precio: 95, stock: 22, descripcion: 'Collar protector para evitar que las mascotas se laman heridas.' },
      { id: 7, sku: 'VET007', nombre: 'Pipeta antiparasitaria', categoria: 'Medicamentos', precio: 210, stock: 15, descripcion: 'Pipeta para el control de parásitos externos en perros y gatos.' },
      { id: 8, sku: 'VET008', nombre: 'Cama ortopédica para perro', categoria: 'Accesorios', precio: 890, stock: 8, descripcion: 'Cama ergonómica para perros con problemas articulares.' },
      { id: 9, sku: 'VET009', nombre: 'Transportadora pequeña', categoria: 'Accesorios', precio: 540, stock: 10, descripcion: 'Transportadora plástica para mascotas pequeñas.' },
      { id: 10, sku: 'VET010', nombre: 'Cepillo desenredante', categoria: 'Higiene', precio: 75, stock: 35, descripcion: 'Cepillo para desenredar y eliminar pelo muerto en mascotas.' }
    ];
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

.tabla-productos th:last-child,
.tabla-productos td:last-child {
  border-right: none;
}

.tabla-productos thead th {
  background: var(--color-secundario);
  color: var(--color-blanco);
  font-weight: bold;
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

.btn-stock {
  background: var(--color-blanco);
  border: 1px solid var(--color-secundario);
  color: var(--color-primario);
  font-size: 1.1rem;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  margin: 0 4px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s;
}
.btn-stock:hover {
  background: var(--color-claro);
  color: var(--color-acento);
}

.stock-valor {
  display: inline-block;
  min-width: 30px;
  text-align: center;
  font-weight: bold;
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

