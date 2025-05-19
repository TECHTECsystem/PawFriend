<template>
  <Navbar />
  <div class="dashboard-contenedor">
    <div class="contenido">
      <div class="card tabla-contenedor">
        <div class="card-header d-flex align-items-center">
          <input
            v-model="busqueda"
            type="text"
            placeholder="Buscar proveedor..."
            class="input-busqueda"
          />
        <button class="btn-nuevo ms-3" @click="abrirModalNuevoProveedor">
          <span class="material-icons align-middle">add</span> Nuevo proveedor
        </button>
        <button class="btn-exportar ms-2" @click="exportarExcel">
          <span class="material-icons align-middle">download</span> Exportar Excel
        </button>
        </div>
        <div class="card-body p-0">
          <table class="tabla-productos mb-0">
            <thead>
              <tr style="background: var(--color-secundario); color: white">
                <th>Código</th>
                <th>Razón Social</th>
                <th>RFC</th>
                <th>Domicilio Fiscal</th>
                <th>Domicilio Entrega</th>
                <th>Contacto</th>
                <th>Cond. Pago</th>
                <th>Moneda</th>
                <th>Cuenta Contable</th>
                <th>Centro Costo</th>
                <th>Transportista/Incoterm</th>
                <th class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="proveedor in proveedoresPaginados"
                :key="proveedor.id"
                :class="{ seleccionado: proveedorSeleccionado && proveedor.id === proveedorSeleccionado.id }"
              >
                <td>{{ proveedor.id }}</td>
                <td>{{ proveedor.razonSocial }}</td>
                <td>{{ proveedor.rfc }}</td>
                <td>{{ proveedor.domicilioFiscal }}</td>
                <td>{{ proveedor.domicilioEntrega }}</td>
                <td>
                  {{ proveedor.contacto.nombre }}<br>
                  <small>{{ proveedor.contacto.email }}</small><br>
                  <small>{{ proveedor.contacto.telefono }}</small>
                </td>
                <td>{{ proveedor.condicionesPago.diasNetos }} días, {{ proveedor.condicionesPago.descuento }}%</td>
                <td>{{ proveedor.moneda }}<span v-if="proveedor.tipoCambio"> ({{ proveedor.tipoCambio }})</span></td>
                <td>{{ proveedor.cuentaContable }}</td>
                <td>{{ proveedor.centroCosto }}</td>
                <td>{{ proveedor.transportista }}<span v-if="proveedor.incoterm"> / {{ proveedor.incoterm }}</span></td>
                <td class="text-center align-middle">
                  <div class="d-flex justify-content-center">
                    <button class="btn-ver" @click="alternarSeleccion(proveedor)" style="background: var(--color-acento); width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                      <span class="material-icons" style="font-size: 20px;">
                        {{ proveedorSeleccionado && proveedor.id === proveedorSeleccionado.id ? 'close' : 'visibility' }}
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

      <transition name="fade-slide" mode="out-in">
        <div>
          <div v-if="proveedorSeleccionado" key="detalle" class="card panel-visualizacion" style="background: var(--color-suave); color: var(--color-blanco);">
            <div class="card-body">
              <h4 class="fw-bold mb-3">Detalles del proveedor</h4>
              <div class="detalle-seccion">
                <div class="detalle-columna">
                  <label><strong>Código</strong></label>
                  <div v-if="!modoEdicion">{{ proveedorSeleccionado.id }}</div>
                  <input v-else v-model="proveedorSeleccionado.id" class="form-control" />
                </div>
                <div class="detalle-columna">
                  <label><strong>Razón Social</strong></label>
                  <div v-if="!modoEdicion">{{ proveedorSeleccionado.razonSocial }}</div>
                  <input v-else v-model="proveedorSeleccionado.razonSocial" class="form-control" />
                </div>
                <div class="detalle-columna">
                  <label><strong>RFC</strong></label>
                  <div v-if="!modoEdicion">{{ proveedorSeleccionado.rfc }}</div>
                  <input v-else v-model="proveedorSeleccionado.rfc" class="form-control" />
                </div>
                <div class="detalle-columna">
                  <label><strong>Domicilio Fiscal</strong></label>
                  <div v-if="!modoEdicion">{{ proveedorSeleccionado.domicilioFiscal }}</div>
                  <input v-else v-model="proveedorSeleccionado.domicilioFiscal" class="form-control" />
                </div>
                <div class="detalle-columna">
                  <label><strong>Domicilio Entrega</strong></label>
                  <div v-if="!modoEdicion">{{ proveedorSeleccionado.domicilioEntrega }}</div>
                  <input v-else v-model="proveedorSeleccionado.domicilioEntrega" class="form-control" />
                </div>
                <div class="detalle-columna">
                  <label><strong>Contacto</strong></label>
                  <div v-if="!modoEdicion">
                    {{ proveedorSeleccionado.contacto.nombre }}<br>
                    <small>{{ proveedorSeleccionado.contacto.email }}</small><br>
                    <small>{{ proveedorSeleccionado.contacto.telefono }}</small>
                  </div>
                  <div v-else>
                    <input v-model="proveedorSeleccionado.contacto.nombre" class="form-control mb-1" placeholder="Nombre" />
                    <input v-model="proveedorSeleccionado.contacto.email" class="form-control mb-1" placeholder="Email" />
                    <input v-model="proveedorSeleccionado.contacto.telefono" class="form-control" placeholder="Teléfono" />
                  </div>
                </div>
                <div class="detalle-columna">
                  <label><strong>Condiciones de Pago</strong></label>
                  <div v-if="!modoEdicion">{{ proveedorSeleccionado.condicionesPago.diasNetos }} días, {{ proveedorSeleccionado.condicionesPago.descuento }}%</div>
                  <div v-else class="d-flex gap-2">
                    <input v-model.number="proveedorSeleccionado.condicionesPago.diasNetos" type="number" class="form-control" placeholder="Días netos" />
                    <input v-model.number="proveedorSeleccionado.condicionesPago.descuento" type="number" class="form-control" placeholder="% Descuento" />
                  </div>
                </div>
                <div class="detalle-columna">
                  <label><strong>Moneda</strong></label>
                  <div v-if="!modoEdicion">{{ proveedorSeleccionado.moneda }}</div>
                  <input v-else v-model="proveedorSeleccionado.moneda" class="form-control mb-1" />
                  <label class="mt-1"><strong>Tipo de Cambio</strong></label>
                  <div v-if="!modoEdicion">{{ proveedorSeleccionado.tipoCambio }}</div>
                  <input v-else v-model="proveedorSeleccionado.tipoCambio" class="form-control" />
                </div>
                <div class="detalle-columna">
                  <label><strong>Cuenta Contable</strong></label>
                  <div v-if="!modoEdicion">{{ proveedorSeleccionado.cuentaContable }}</div>
                  <input v-else v-model="proveedorSeleccionado.cuentaContable" class="form-control" />
                </div>
                <div class="detalle-columna">
                  <label><strong>Centro de Costo</strong></label>
                  <div v-if="!modoEdicion">{{ proveedorSeleccionado.centroCosto }}</div>
                  <input v-else v-model="proveedorSeleccionado.centroCosto" class="form-control" />
                </div>
                <div class="detalle-columna">
                  <label><strong>Transportista/Incoterm</strong></label>
                  <div v-if="!modoEdicion">{{ proveedorSeleccionado.transportista }}<span v-if="proveedorSeleccionado.incoterm"> / {{ proveedorSeleccionado.incoterm }}</span></div>
                  <div v-else class="d-flex gap-2">
                    <input v-model="proveedorSeleccionado.transportista" class="form-control" placeholder="Transportista" />
                    <input v-model="proveedorSeleccionado.incoterm" class="form-control" placeholder="Incoterm" />
                  </div>
                </div>
              </div>
              <div class="mt-3 acciones-detalle">
                <button v-if="!modoEdicion" class="btn me-2" style="background: var(--color-primario); color: white" @click="modoEdicion = true">Editar</button>
                <button v-if="modoEdicion" class="btn me-2" style="background: var(--color-acento); color: white" @click="guardarCambios" :disabled="guardBoton">Guardar</button>
                <button v-if="modoEdicion" class="btn me-2" style="background: darkred; color: white" @click="eliminarProveedor(proveedorSeleccionado.id)" :disabled="guardBoton">Eliminar</button>
                <button class="btn btn-secondary" @click="limpiarSeleccion">← Regresar</button>
              </div>
            </div>
          </div>
          <div v-else key="mensaje" class="panel-visualizacion-inicial">
            <p>Selecciona un proveedor para ver detalles.</p>
          </div>
        </div>
      </transition>
    </div>
  </div>

  <div class="modal fade" id="modalNuevoProveedor" tabindex="-1" aria-labelledby="modalNuevoProveedorLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="modalNuevoProveedorLabel">Nuevo proveedor</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
        </div>
        <form @submit.prevent="guardarProveedor" novalidate>
          <div class="modal-body">
            <div class="row g-3">
              <div class="col-md-4">
                <label class="form-label">Código interno *</label>
                <input v-model="nuevoProveedor.id" class="form-control" required maxlength="20" />
              </div>
              <div class="col-md-8">
                <label class="form-label">Razón social *</label>
                <input v-model="nuevoProveedor.razonSocial" class="form-control" :class="{'is-invalid': v$.nuevoProveedor.razonSocial.$error}" maxlength="100" />
                <div v-if="v$.nuevoProveedor.razonSocial.$error" class="invalid-feedback">
                  <span v-if="!v$.nuevoProveedor.razonSocial.required">Campo requerido. </span>
                  <span v-if="!v$.nuevoProveedor.razonSocial.minLength">Mínimo 3 caracteres.</span>
                </div>
              </div>
              <div class="col-md-4">
                <label class="form-label">RFC *</label>
                <input v-model="nuevoProveedor.rfc" class="form-control" :class="{'is-invalid': v$.nuevoProveedor.rfc.$error}" maxlength="13" />
                <div v-if="v$.nuevoProveedor.rfc.$error" class="invalid-feedback">
                  <span v-if="!v$.nuevoProveedor.rfc.required">Campo requerido. </span>
                  <span v-if="!v$.nuevoProveedor.rfc.minLength">Mínimo 12 caracteres.</span>
                </div>
              </div>
              <div class="col-md-8">
                <label class="form-label">Domicilio fiscal *</label>
                <input v-model="nuevoProveedor.domicilioFiscal" class="form-control" required maxlength="150" />
              </div>
              <div class="col-md-8">
                <label class="form-label">Domicilio de entrega *</label>
                <input v-model="nuevoProveedor.domicilioEntrega" class="form-control" required maxlength="150" />
              </div>
              <div class="col-md-4">
                <label class="form-label">Moneda *</label>
                <select v-model="nuevoProveedor.moneda" class="form-select" :class="{'is-invalid': v$.nuevoProveedor.moneda.$error}">
                  <option v-for="m in monedas" :key="m.value" :value="m.value">{{ m.label }}</option>
                </select>
                <div v-if="v$.nuevoProveedor.moneda.$error" class="invalid-feedback">Selecciona una moneda.</div>
              </div>
              <div class="col-md-4">
                <label class="form-label">Tipo de cambio</label>
                <input v-model.number="nuevoProveedor.tipoCambio" class="form-control" type="number" min="0" step="0.01" />
              </div>
              <div class="col-md-4">
                <label class="form-label">Cuenta contable *</label>
                <input v-model="nuevoProveedor.cuentaContable" class="form-control" required maxlength="20" />
              </div>
              <div class="col-md-4">
                <label class="form-label">Centro de costo *</label>
                <input v-model="nuevoProveedor.centroCosto" class="form-control" required maxlength="20" />
              </div>
              <div class="col-md-4">
                <label class="form-label">Transportista</label>
                <input v-model="nuevoProveedor.transportista" class="form-control" maxlength="50" />
              </div>
              <div class="col-md-4">
                <label class="form-label">Incoterm</label>
                <input v-model="nuevoProveedor.incoterm" class="form-control" maxlength="10" />
              </div>
              <div class="col-md-4">
                <label class="form-label">Contacto - Nombre *</label>
                <input v-model="nuevoProveedor.contacto.nombre" class="form-control" required maxlength="50" />
              </div>
              <div class="col-md-4">
                <label class="form-label">Contacto - Email *</label>
                <input v-model="nuevoProveedor.contacto.email" class="form-control" :class="{'is-invalid': v$.nuevoProveedor.contacto.email.$error}" maxlength="60" />
                <div v-if="v$.nuevoProveedor.contacto.email.$error" class="invalid-feedback">
                  <span v-if="!v$.nuevoProveedor.contacto.email.required">Campo requerido. </span>
                  <span v-if="!v$.nuevoProveedor.contacto.email.email">Formato de email inválido.</span>
                </div>
              </div>
              <div class="col-md-4">
                <label class="form-label">Contacto - Teléfono *</label>
                <input v-model="nuevoProveedor.contacto.telefono" class="form-control" required maxlength="20" />
              </div>
              <div class="col-md-4">
                <label class="form-label">Cond. Pago - Días netos *</label>
                <input v-model.number="nuevoProveedor.condicionesPago.diasNetos" class="form-control" :class="{'is-invalid': v$.nuevoProveedor.condicionesPago.diasNetos.$error}" type="number" min="0" max="180" />
                <div v-if="v$.nuevoProveedor.condicionesPago.diasNetos.$error" class="invalid-feedback">
                  <span v-if="!v$.nuevoProveedor.condicionesPago.diasNetos.required">Campo requerido. </span>
                  <span v-if="!v$.nuevoProveedor.condicionesPago.diasNetos.numeric">Debe ser número. </span>
                  <span v-if="!v$.nuevoProveedor.condicionesPago.diasNetos.minValue">Debe ser mayor a 0.</span>
                </div>
              </div>
              <div class="col-md-4">
                <label class="form-label">Cond. Pago - % Descuento</label>
                <input v-model.number="nuevoProveedor.condicionesPago.descuento" class="form-control" :class="{'is-invalid': v$.nuevoProveedor.condicionesPago.descuento.$error}" type="number" min="0" max="100" />
                <div v-if="v$.nuevoProveedor.condicionesPago.descuento.$error" class="invalid-feedback">
                  <span v-if="!v$.nuevoProveedor.condicionesPago.descuento.numeric">Debe ser número. </span>
                  <span v-if="!v$.nuevoProveedor.condicionesPago.descuento.minValue">No puede ser negativo.</span>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="submit" class="btn btn-primary" :disabled="v$.$invalid">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  </div>

</template>


<script>
import Navbar from '../components/Navbar.vue';
import Swal from 'sweetalert2';
import useVuelidate from '@vuelidate/core';
import { required, minLength, email, numeric, minValue } from '@vuelidate/validators';
import * as XLSX from 'xlsx';

const MONEDAS = [
  { value: '', label: 'Selecciona moneda' },
  { value: 'MXN', label: 'MXN - Peso Mexicano' },
  { value: 'USD', label: 'USD - Dólar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'CAD', label: 'CAD - Dólar Canadiense' },
  { value: 'BRL', label: 'BRL - Real Brasileño' }
];

export default {
  name: 'ProveedoresView',
  components: { Navbar },
  data() {
    return {
      busqueda: '',
      proveedores: [
        {
          id: 'PRV001', razonSocial: 'Distribuidora Animalia', rfc: 'DAN123456789',
          domicilioFiscal: 'Av. Reforma 123, CDMX', domicilioEntrega: 'Bodega 2, CDMX',
          contacto: { nombre: 'Ana Torres', email: 'ana@animalia.com', telefono: '555-123-4567' },
          condicionesPago: { diasNetos: 30, descuento: 5 }, moneda: 'MXN', tipoCambio: 1,
          cuentaContable: '5010', centroCosto: 'CC01', transportista: 'DHL', incoterm: 'EXW'
        },
        {
          id: 'PRV002', razonSocial: 'VetPro S.A.', rfc: 'VPS987654321',
          domicilioFiscal: 'Calle 5 de Mayo 456, Puebla', domicilioEntrega: 'Sucursal Puebla',
          contacto: { nombre: 'Luis Pérez', email: 'luis@vetpro.com', telefono: '222-987-6543' },
          condicionesPago: { diasNetos: 15, descuento: 3 }, moneda: 'USD', tipoCambio: 17.2,
          cuentaContable: '5020', centroCosto: 'CC02', transportista: 'FedEx', incoterm: 'FOB'
        }
      ],
      proveedorSeleccionado: null,
      modoEdicion: false,
      paginaActual: 1,
      proveedoresPorPagina: 10,
      paginaAnterior: 1,
      nuevoProveedor: {
        id: '', razonSocial: '', rfc: '', domicilioFiscal: '', domicilioEntrega: '',
        contacto: { nombre: '', email: '', telefono: '' },
        condicionesPago: { diasNetos: 0, descuento: 0 }, moneda: '', tipoCambio: '',
        cuentaContable: '', centroCosto: '', transportista: '', incoterm: ''
      },
      monedas: MONEDAS,
      guardActivo: false,
      guardMensaje: 'Tienes cambios sin guardar. ¿Seguro que quieres salir?',
      guardHandler: null,
      guardBoton: false,
    };
  },
  setup() {
    const v$ = useVuelidate();
    return { v$ };
  },
  validations() {
    return {
      nuevoProveedor: {
        razonSocial: { required, minLength: minLength(3) },
        rfc: { required, minLength: minLength(12) },
        contacto: {
          email: { required, email }
        },
        condicionesPago: {
          diasNetos: { required, numeric, minValue: minValue(1) },
          descuento: { numeric, minValue: minValue(0) }
        },
        moneda: { required },
      }
    };
  },
  computed: {
    proveedoresFiltrados() {
      if (this.proveedorSeleccionado) return [this.proveedorSeleccionado];
      const filtro = this.busqueda.toLowerCase();
      // Recursivo: busca en todas las propiedades primitivas
      function contiene(obj, termino) {
        for (const key in obj) {
          if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
          const val = obj[key];
          if (val == null) continue;
          if (typeof val === 'string' || typeof val === 'number') {
            if (val.toString().toLowerCase().includes(termino)) return true;
          } else if (typeof val === 'object') {
            if (contiene(val, termino)) return true;
          }
        }
        return false;
      }
      return this.proveedores.filter(p => contiene(p, filtro));
    },
    proveedoresPaginados() {
      const start = (this.paginaActual - 1) * this.proveedoresPorPagina;
      return this.proveedoresFiltrados.slice(start, start + this.proveedoresPorPagina);
    },
    totalPaginas() {
      return Math.ceil(this.proveedoresFiltrados.length / this.proveedoresPorPagina) || 1;
    }
  },
  watch: {
    modoEdicion(val) {
      if (val) {
        this.activarGuardadoNavegacion();
      } else {
        this.removerGuardadoNavegacion();
      }
    }
  },
  mounted() {
    if (this.modoEdicion) this.activarGuardadoNavegacion();
  },
  beforeUnmount() {
    this.removerGuardadoNavegacion();
  },
  methods: {
    activarGuardadoNavegacion() {
      if (this.guardActivo) return;
      this.guardHandler = (e) => {
        e.preventDefault();
        e.returnValue = this.guardMensaje;
        return this.guardMensaje;
      };
      window.addEventListener('beforeunload', this.guardHandler);
      if (this.$router && this.$options.beforeRouteLeave == null) {
        this.$options.beforeRouteLeave = (to, from, next) => {
          if (this.modoEdicion) {
            if (confirm(this.guardMensaje)) {
              next();
            } else {
              next(false);
            }
          } else {
            next();
          }
        };
        if (this.$router && this.$router.beforeEach) {
          this.$router.beforeEach(this.$options.beforeRouteLeave);
        }
      }
      this.guardActivo = true;
    },
    removerGuardadoNavegacion() {
      if (this.guardHandler) {
        window.removeEventListener('beforeunload', this.guardHandler);
        this.guardHandler = null;
      }
      this.guardActivo = false;
    },
    alternarSeleccion(proveedor) {
      if (this.proveedorSeleccionado && this.proveedorSeleccionado.id === proveedor.id) {
        this.limpiarSeleccion();
      } else {
        this.paginaAnterior = this.paginaActual;
        this.paginaActual = 1;
        this.proveedorSeleccionado = JSON.parse(JSON.stringify(proveedor));
        this.modoEdicion = false;
      }
    },
    limpiarSeleccion() {
      this.proveedorSeleccionado = null;
      this.paginaActual = this.paginaAnterior;
    },
    async guardarCambios() {
      this.guardBoton = true;
      try {
        // Simula PUT, reemplaza por tu lógica real
        await new Promise(r => setTimeout(r, 800));
        const idx = this.proveedores.findIndex(p => p.id === this.proveedorSeleccionado.id);
        if (idx !== -1) {
          this.proveedores.splice(idx, 1, this.proveedorSeleccionado);
          Swal.fire('Actualizado', 'Cambios guardados correctamente', 'success');
          this.limpiarSeleccion();
        }
      } finally {
        this.guardBoton = false;
      }
    },
    async eliminarProveedor(id) {
      this.guardBoton = true;
      try {
        const res = await Swal.fire({
          title: '¿Eliminar proveedor?',
          text: 'No podrás revertir esto',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sí, eliminar',
          cancelButtonText: 'Cancelar',
          confirmButtonColor: 'var(--rojo)'
        });
        if (res.isConfirmed) {
          // Simula DELETE, reemplaza por tu lógica real
          await new Promise(r => setTimeout(r, 800));
          this.proveedores = this.proveedores.filter(p => p.id !== id);
          Swal.fire('Eliminado', 'Proveedor eliminado', 'success');
          if (this.proveedorSeleccionado && this.proveedorSeleccionado.id === id) {
            this.limpiarSeleccion();
          }
        }
      } finally {
        this.guardBoton = false;
      }
    },
    abrirModalNuevoProveedor() {
      this.nuevoProveedor = {
        id: '', razonSocial: '', rfc: '', domicilioFiscal: '', domicilioEntrega: '',
        contacto: { nombre: '', email: '', telefono: '' },
        condicionesPago: { diasNetos: 0, descuento: 0 }, moneda: '', tipoCambio: '',
        cuentaContable: '', centroCosto: '', transportista: '', incoterm: ''
      };
      this.v$.$reset();
      const modal = new window.bootstrap.Modal(document.getElementById('modalNuevoProveedor'));
      modal.show();
    },
    async guardarProveedor() {
      this.v$.$touch();
      if (this.v$.$invalid) {
        Swal.fire('Campos requeridos', 'Por favor corrige los errores del formulario', 'warning');
        return;
      }
      // Validación básica extra
      if (!this.nuevoProveedor.id || !this.nuevoProveedor.razonSocial || !this.nuevoProveedor.rfc || !this.nuevoProveedor.domicilioFiscal || !this.nuevoProveedor.domicilioEntrega || !this.nuevoProveedor.contacto.nombre || !this.nuevoProveedor.contacto.email || !this.nuevoProveedor.contacto.telefono || !this.nuevoProveedor.condicionesPago.diasNetos || !this.nuevoProveedor.moneda || !this.nuevoProveedor.cuentaContable || !this.nuevoProveedor.centroCosto) {
        Swal.fire('Campos requeridos', 'Por favor llena todos los campos obligatorios', 'warning');
        return;
      }
      try {
        const response = await fetch('/api/proveedores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.nuevoProveedor)
        });
        if (!response.ok) throw new Error('Error al guardar proveedor');
        const proveedorGuardado = await response.json();
        this.proveedores.push(proveedorGuardado);
        Swal.fire('¡Guardado!', 'Proveedor registrado correctamente', 'success');
        const modal = window.bootstrap.Modal.getInstance(document.getElementById('modalNuevoProveedor'));
        if (modal) modal.hide();
      } catch (e) {
        Swal.fire('Error', 'No se pudo guardar el proveedor', 'error');
      }
    },
    exportarExcel() {
      const data = this.proveedores.map(p => ({
        'Código': p.id,
        'Razón Social': p.razonSocial,
        'RFC': p.rfc,
        'Domicilio Fiscal': p.domicilioFiscal,
        'Domicilio Entrega': p.domicilioEntrega,
        'Contacto Nombre': p.contacto?.nombre,
        'Contacto Email': p.contacto?.email,
        'Contacto Teléfono': p.contacto?.telefono,
        'Cond. Pago Días Netos': p.condicionesPago?.diasNetos,
        'Cond. Pago % Descuento': p.condicionesPago?.descuento,
        'Moneda': p.moneda,
        'Tipo de Cambio': p.tipoCambio,
        'Cuenta Contable': p.cuentaContable,
        'Centro de Costo': p.centroCosto,
        'Transportista': p.transportista,
        'Incoterm': p.incoterm
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Proveedores');
      XLSX.writeFile(wb, 'proveedores.xlsx');
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
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
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
  vertical-align: middle;
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
  text-align: center;
}

.panel-visualizacion .detalle-seccion {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  margin-top: 1rem;
  border-bottom: 1px solid rgba(255,255,255,0.4);
  padding-bottom: 1.2rem;
}

.panel-visualizacion .detalle-columna label {
  color: var(--color-blanco);
  font-size: 1rem;
  margin-bottom: 0.25rem;
  display: block;
}

.panel-visualizacion .detalle-columna div,
.panel-visualizacion .detalle-columna input {
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--color-blanco);
}

.panel-visualizacion input.form-control,
.panel-visualizacion select.form-select {
  color: var(--color-texto);
  background: var(--color-blanco);
  box-shadow: 0 0 0 0.2rem rgba(124,20,84,0.25);
}

.panel-visualizacion-inicial {
  text-align: center;
  color: #666;
  padding: 2rem;
}

@media (max-width: 700px) {
  .panel-visualizacion .detalle-seccion {
    flex-direction: column;
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

@keyframes fadeInTable {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Botones cabecera */
.btn-nuevo {
  background-color: var(--color-acento);
  color: white;
  font-weight: 500;
  border: none;
  border-radius: 10px;
  padding: 0.5rem 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  transition: background 0.2s ease;
}

.btn-nuevo:hover {
  background-color: var(--color-primario);
}

.btn-exportar {
  background-color: var(--color-secundario);
  color: white;
  font-weight: 500;
  border: none;
  border-radius: 10px;
  padding: 0.5rem 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  transition: background 0.2s ease;
}

.btn-exportar:hover {
  background-color: var(--color-acento);
}

/* Estilo general del modal */
.modal-content {
  background-color: var(--color-fondo);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(124, 36, 92, 0.2);
  border: 2px solid var(--color-suave);
}

.modal-header {
  background-color: var(--color-suave);
  color: var(--color-blanco);
  padding: 1rem 1.5rem;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  border-bottom: 1px solid var(--color-acento);
}

.modal-title {
  font-weight: bold;
  font-size: 1.3rem;
}

.modal-body {
  padding: 1.5rem;
  background-color: var(--color-blanco);
}

.modal-body .form-label {
  font-weight: 600;
  color: var(--color-primario);
  font-size: 0.95rem;
}

.modal-body .form-control,
.modal-body .form-select {
  border: 1px solid #ccc;
  border-radius: 10px;
  transition: border-color 0.2s ease;
  box-shadow: none;
}

.modal-body .form-control:focus,
.modal-body .form-select:focus {
  border-color: var(--color-acento);
  box-shadow: 0 0 0 0.2rem rgba(124, 20, 84, 0.2);
}

.invalid-feedback {
  font-size: 0.8rem;
  color: #b00020;
}

/* Botones del footer */
.modal-footer {
  border-top: 1px solid #ddd;
  background-color: #f9f9fb;
  padding: 1rem 1.5rem;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
}

.modal-footer .btn-secondary {
  background-color: var(--color-primario);
  color: var(--color-blanco);
  border: none;
  border-radius: 8px;
  padding: 0.4rem 1rem;
  font-weight: 500;
  transition: background 0.2s ease;
}

.modal-footer .btn-secondary:hover {
  background-color: var(--color-acento);
}

.modal-footer .btn-primary {
  background-color: var(--color-acento);
  color: var(--color-blanco);
  border: none;
  border-radius: 8px;
  padding: 0.4rem 1rem;
  font-weight: 500;
  transition: background 0.2s ease;
}

.modal-footer .btn-primary:disabled {
  background-color: #aaa;
  cursor: not-allowed;
}

.modal-footer .btn-primary:hover:not(:disabled) {
  background-color: var(--color-primario);
}


</style>
