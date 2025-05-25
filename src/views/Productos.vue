<template>
  <Navbar />
      <!-- ENCABEZADO -->
    <div class="container">
      <h2 class="mb-1">Inventario</h2>
      <p class="text">Control y gestión de productos en inventario.</p>
    </div>
  <div class="dashboard-contenedor">
    <div class="contenido">
      <!-- Card contenedor -->
      <div class="card tabla-contenedor">
        <div class="card-header d-flex align-items-center justify-content-between">
          <input
            v-model="busqueda"
            type="text"
            placeholder="Buscar producto..."
            class="input-busqueda"
          />
          <button class="btn-cliente" @click="abrirModalProducto" style="border-radius:50%;width:40px;height:40px;display:flex;align-items:center;justify-content:center;">
            <span class="material-icons">add</span>
          </button>
        </div>
        <div class="card-body p-0">
          <table class="tabla-productos mb-0">
            <thead>
              <tr style="background: var(--color-secundario); color: white">
                <th class="text-center">SKU</th>
                <th class="text-center">Nombre</th>
                <th class="text-center">Categoría</th>
                <th class="text-center">Precio</th>
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
                <td >{{ producto.sku }}</td>
                <td class="text-center align-middle">{{ producto.nombre }}</td>
                <td class="text-center align-middle">{{ producto.categoria }}</td>
                <td class="text-center align-middle">{{ producto.precio | formatearMoneda }}</td>
                <td class="text-center align-middle">
                  <div class="d-flex justify-content-center align-items-center gap-2">
                    
                    <span class="stock-valor">{{ producto.stock }}</span>
                    
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
                  <label><strong>Nombre</strong></label>
                  <div v-if="!modoEdicion">{{ productoSeleccionado.nombre }}</div>
                  <input v-else v-model="productoSeleccionado.nombre" class="form-control" />
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
                <div class="detalle-columna">
                  <label><strong>Stock mínimo</strong></label>
                  <div v-if="!modoEdicion">{{ productoSeleccionado.stock_minimo }}</div>
                  <input v-else type="number" v-model.number="productoSeleccionado.stock_minimo" class="form-control" />
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

  <!-- Modal para agregar producto -->
  <div class="modal fade" id="modalProducto" tabindex="-1" aria-labelledby="modalProductoLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
      <div class="modal-content modal-productos-custom">
        <div class="modal-header" style="background:#a45484;color:#fff;">
          <h5 class="modal-title" id="modalProductoLabel">Nuevo producto</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar" style="filter:invert(1);"></button>
        </div>
        <div class="modal-body" style="background:#fdfbfc;">
          <form @submit.prevent="guardarNuevoProducto">
            <div class="container-fluid">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">SKU *</label>
                  <input v-model="nuevoProducto.sku" type="text" class="form-control" placeholder="Ej. 12345" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Nombre *</label>
                  <input v-model="nuevoProducto.nombre" type="text" class="form-control" placeholder="Ej. Shampoo para perro" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Categoría</label>
                  <input v-model="nuevoProducto.categoria" type="text" class="form-control" placeholder="Ej. Higiene" />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Precio *</label>
                  <input v-model.number="nuevoProducto.precio" type="number" min="0" class="form-control" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Stock *</label>
                  <input v-model.number="nuevoProducto.stock" type="number" min="0" class="form-control" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Stock mínimo</label>
                  <input v-model.number="nuevoProducto.stock_minimo" type="number" min="0" class="form-control" />
                </div>
                <div class="col-12">
                  <label class="form-label">Descripción</label>
                  <textarea v-model="nuevoProducto.descripcion" class="form-control" placeholder="Descripción del producto" rows="2"></textarea>
                </div>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer" style="background:#fdfbfc;">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" style="background:#a45484;border:none;">Cancelar</button>
          <button type="button" class="btn btn-primary" @click="guardarNuevoProducto" style="background:#a45484;border:none;">Guardar</button>
        </div>
      </div>
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
      paginaAnterior: 1,
      nuevoProducto: {
        sku: '',
        nombre: '',
        categoria: '',
        descripcion: '',
        precio: 0,
        stock: 0,
        stock_minimo: 0
      }
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
      return this.productos.filter(p =>
        Object.values(p).some(val => {
          if (typeof val === 'string') return val.toLowerCase().includes(termino);
          if (typeof val === 'number') return val.toString().includes(termino);
          return false;
        })
      );
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
    async guardarCambios() {
      if (!this.productoSeleccionado) return;
      try {
        const token = localStorage.getItem('token');
        const prod = { ...this.productoSeleccionado };
        const res = await fetch(`http://localhost:8080/api/productos/${prod.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            sku: prod.sku,
            nombre: prod.nombre,
            categoria: prod.categoria,
            descripcion: prod.descripcion,
            precio: prod.precio,
            stock: prod.stock,
            stock_minimo: prod.stock_minimo,
            activo: prod.activo
          })
        });
        if (!res.ok) throw new Error('No se pudo actualizar el producto');
        await this.cargarProductos();
        Swal.fire('Actualizado', 'Cambios guardados correctamente', 'success');
        this.limpiarSeleccion();
      } catch (e) {
        Swal.fire('Error', 'No se pudo actualizar el producto', 'error');
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
        confirmButtonColor: '#d33'
      }).then(async res => {
        if (res.isConfirmed) {
          try {
            const token = localStorage.getItem('token');
            // Soft-delete: solo marca activo=0
            const response = await fetch(`http://localhost:8080/api/productos/${id}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok && response.status !== 204) throw new Error('No se pudo eliminar el producto');
            await this.cargarProductos();
            Swal.fire('Eliminado', 'Producto eliminado correctamente', 'success');
            this.limpiarSeleccion();
          } catch (e) {
            Swal.fire('Error', 'No se pudo eliminar el producto', 'error');
          }
        }
      });
    },
    async cambiarStock(producto, cantidad) {
      const idx = this.productos.findIndex(p => p.id === producto.id);
      if (idx !== -1) {
        const nuevoStock = this.productos[idx].stock + cantidad;
        if (nuevoStock >= 0) {
          // Actualiza localmente
          this.productos[idx].stock = nuevoStock;
          // Llama al endpoint para guardar el cambio
          try {
            const token = localStorage.getItem('token');
            const prod = { ...this.productos[idx] };
            const res = await fetch(`http://localhost:8080/api/productos/${prod.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({
                sku: prod.sku,
                nombre: prod.nombre,
                categoria: prod.categoria,
                descripcion: prod.descripcion,
                precio: prod.precio,
                stock: prod.stock,
                stock_minimo: prod.stock_minimo,
                activo: prod.activo
              })
            });
            if (!res.ok) throw new Error('No se pudo actualizar el stock');
          } catch (e) {
            Swal.fire('Error', 'No se pudo actualizar el stock', 'error');
            // Si falla, revierte el cambio local
            this.productos[idx].stock -= cantidad;
          }
        }
      }
    },
    async cargarProductos() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:8080/api/productos', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        // Solo productos activos
        this.productos = Array.isArray(data) ? data.filter(p => p.activo === 1) : [];
      } catch (err) {
        console.error(err);
        Swal.fire('Error', 'No se pudieron cargar los productos', 'error');
      }
    },
    abrirModalProducto() {
      this.nuevoProducto = {
        sku: '',
        nombre: '',
        categoria: '',
        descripcion: '',
        precio: 0,
        stock: 0,
        stock_minimo: 0
      };
      const modalEl = document.getElementById('modalProducto');
      new bootstrap.Modal(modalEl).show();
    },
    async guardarNuevoProducto() {
      if (!this.nuevoProducto.sku.trim() || !this.nuevoProducto.nombre.trim() || this.nuevoProducto.precio === null || this.nuevoProducto.stock === null) {
        return Swal.fire('Error', 'SKU, nombre, precio y stock son obligatorios', 'error');
      }
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:8080/api/productos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            sku: this.nuevoProducto.sku,
            nombre: this.nuevoProducto.nombre,
            categoria: this.nuevoProducto.categoria || null,
            descripcion: this.nuevoProducto.descripcion || null,
            precio: this.nuevoProducto.precio,
            stock: this.nuevoProducto.stock,
            stock_minimo: this.nuevoProducto.stock_minimo || 0
          })
        });
        if (!res.ok) throw new Error('No se pudo agregar el producto');
        await this.cargarProductos();
        bootstrap.Modal.getInstance(document.getElementById('modalProducto')).hide();
        Swal.fire('Éxito', 'Producto agregado', 'success');
      } catch (e) {
        console.error(e);
        Swal.fire('Error', 'No se pudo agregar el producto', 'error');
      }
    },
  },
  mounted() {
    this.cargarProductos();
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
  text-align: left;
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

.tabla-productos tbody tr:hover {
  background: #f7eaf3;
  box-shadow: 0 2px 8px rgba(124,36,92,0.08);
}

.tabla-productos tbody tr.seleccionado {
  background: #ffe3f0;
  box-shadow: 0 2px 12px rgba(124,36,92,0.12);
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
  transform: translateY(-2px);
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

/* Controles de stock */
.btn-stock {
  background: var(--color-blanco);
  border: 1px solid var(--color-secundario);
  color: var(--color-primario);
  font-size: 1.1rem;
  border-radius: 100px;
  width: 28px;
  height: 28px;
  margin: 0 4px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
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

/* Mensaje inicial */
.panel-visualizacion-inicial {
  text-align: center;
  color: #666;
  padding: 2rem;
}

/* Tipografía */
.container {
  font-family: 'Nunito Sans', sans-serif;
}

/* Animaciones */
@keyframes fadeInTable {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(10px);
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

/* Versión móvil mejorada - Mantiene estructura de tabla */
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
  .tabla-productos td:nth-child(5),
  .tabla-productos th:nth-child(6),
  .tabla-productos td:nth-child(6) {
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
  
  /* Acciones en columna */
  .acciones-detalle {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .acciones-detalle .btn {
    width: 100%;
  }
}
</style>

