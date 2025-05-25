<template>
  <Navbar />
        <!-- ENCABEZADO -->
    <div class="container">
      <h2 class="mb-1">Proveedores</h2>
      <p class="text">Control y gestión de proveedores.</p>
    </div>
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
                <th>Contacto</th>
                <th class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="proveedor in proveedoresPaginados"
                :key="proveedor.id"
                :class="{ seleccionado: proveedorSeleccionado && proveedor.id === proveedorSeleccionado.id }"
              >
                <td class="text-center align-middle">{{ proveedor.id }}</td>
                <td class="text-center align-middle">{{ proveedor.razonSocial }}</td>
                <td class="text-center align-middle">{{ proveedor.rfc }}</td>
                <td class="text-center align-middle">
                  {{ proveedor.contacto.nombre }}<br>
                  <small>{{ proveedor.contacto.email }}</small><br>
                  <small>{{ proveedor.contacto.telefono }}</small>
                </td>
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
                <button v-if="modoEdicion" class="btn me-2" style="background: darkred; color: white" @click="eliminarProveedor(proveedorSeleccionado.id_proveedor)" :disabled="guardBoton">Eliminar</button>
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
                <input v-model="nuevoProveedor.id" class="form-control" required maxlength="20" :class="{'is-invalid': v$.nuevoProveedor.id?.$error}" />
                <div v-if="v$.nuevoProveedor.id?.$error" class="invalid-feedback">
                  <span v-if="!v$.nuevoProveedor.id.required">Campo requerido.</span>
                </div>
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
          id: 'P001',
          razonSocial: 'Proveedor Uno S.A. de C.V.',
          rfc: 'PUO123456789',
          domicilioFiscal: 'Calle Falsa 123, CDMX',
          domicilioEntrega: 'Bodega 1, CDMX',
          contacto: { nombre: 'Juan Pérez', email: 'juan@proveedoruno.com', telefono: '555-1234' },
          condicionesPago: { diasNetos: 30, descuento: 5 },
          moneda: 'MXN',
          tipoCambio: 1,
          cuentaContable: '6001',
          centroCosto: 'CC01',
          transportista: 'Transportes MX',
          incoterm: 'EXW'
        },
        {
          id: 'P002',
          razonSocial: 'Distribuciones Dos S.A.',
          rfc: 'DDO987654321',
          domicilioFiscal: 'Av. Central 456, GDL',
          domicilioEntrega: 'Bodega 2, GDL',
          contacto: { nombre: 'Ana López', email: 'ana@distribucionesdos.com', telefono: '333-5678' },
          condicionesPago: { diasNetos: 15, descuento: 0 },
          moneda: 'USD',
          tipoCambio: 17.5,
          cuentaContable: '6002',
          centroCosto: 'CC02',
          transportista: 'Logística Express',
          incoterm: 'FOB'
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
        id: { required },
        razonSocial: { required, minLength: minLength(3) },
        rfc: { required, minLength: minLength(12) },
        domicilioFiscal: { required },
        domicilioEntrega: { required },
        cuentaContable: { required },
        centroCosto: { required },
        contacto: {
          nombre: { required },
          email: { required, email },
          telefono: { required }
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
      function contiene(obj, termino) {
        for (const key in obj) {
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
    },
    abrirModalNuevoProveedor() {
  this.nuevoProveedor = {
    id: '',
    razonSocial: '',
    rfc: '',
    domicilioFiscal: '',
    domicilioEntrega: '',
    contacto: {
      nombre: '',
      email: '',
      telefono: ''
    },
    condicionesPago: {
      diasNetos: 0,
      descuento: 0
    },
    moneda: '',
    tipoCambio: '',
    cuentaContable: '',
    centroCosto: '',
    transportista: '',
    incoterm: ''
  }

  if (this.v$ && this.v$.$reset) this.v$.$reset()

  const modal = new window.bootstrap.Modal(document.getElementById('modalNuevoProveedor'))
  modal.show()
}
  },
  mounted() {
    this.cargarProveedores(); // Eliminado: no se usa API, solo datos de prueba
  },
  methods: {
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
  async cargarProveedores() {
    try {
      const res = await fetch('http://localhost:8080/api/proveedores');
      if (!res.ok) throw new Error('No se pudieron cargar los proveedores');
      const data = await res.json();
      this.proveedores = data.map(p => ({
        id_proveedor: p.id_proveedor,
        id: p.codigo_interno,
        idProveedor: p.id_proveedor,
        razonSocial: p.razon_social,
        rfc: p.rfc,
        domicilioFiscal: p.domicilio_fiscal,
        domicilioEntrega: p.domicilio_entrega,
        contacto: {
          nombre: p.contacto_nombre,
          email: p.contacto_email,
          telefono: p.contacto_telefono
        },
        condicionesPago: {
          diasNetos: Number(p.condiciones_pago_dias),
          descuento: Number(p.condiciones_pago_descuento)
        },
        moneda: p.moneda,
        tipoCambio: p.tipo_cambio,
        cuentaContable: p.cuenta_contable,
        centroCosto: p.centro_costo,
        transportista: p.transportista,
        incoterm: p.incoterm
      }));
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'No se pudieron cargar los proveedores', 'error');
    }
  },
  async guardarProveedor() {
    this.v$.$touch();
    if (this.v$.$invalid) {
      Swal.fire('Campos requeridos', 'Por favor corrige los errores del formulario', 'warning');
      return;
    }
    try {
      const body = {
        codigo_interno: this.nuevoProveedor.id,
        razon_social: this.nuevoProveedor.razonSocial,
        rfc: this.nuevoProveedor.rfc,
        domicilio_fiscal: this.nuevoProveedor.domicilioFiscal,
        domicilio_entrega: this.nuevoProveedor.domicilioEntrega,
        contacto_nombre: this.nuevoProveedor.contacto.nombre,
        contacto_email: this.nuevoProveedor.contacto.email,
        contacto_telefono: this.nuevoProveedor.contacto.telefono,
        condiciones_pago_dias: this.nuevoProveedor.condicionesPago.diasNetos,
        condiciones_pago_descuento: this.nuevoProveedor.condicionesPago.descuento,
        moneda: this.nuevoProveedor.moneda,
        tipo_cambio: this.nuevoProveedor.tipoCambio,
        cuenta_contable: this.nuevoProveedor.cuentaContable,
        centro_costo: this.nuevoProveedor.centroCosto,
        transportista: this.nuevoProveedor.transportista,
        incoterm: this.nuevoProveedor.incoterm
      };
      const res = await fetch('http://localhost:8080/api/proveedores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'No se pudo registrar el proveedor');
      }
      await this.cargarProveedores();
      Swal.fire('¡Guardado!', 'Proveedor registrado correctamente', 'success');
      const modal = window.bootstrap.Modal.getInstance(document.getElementById('modalNuevoProveedor'));
      if (modal) modal.hide();
    } catch (e) {
      Swal.fire('Error', e.message || 'No se pudo registrar el proveedor', 'error');
    }
  },
  async guardarCambios() {
    this.guardBoton = true;
    try {
      const body = {
        codigo_interno: this.proveedorSeleccionado.id,
        razon_social: this.proveedorSeleccionado.razonSocial,
        rfc: this.proveedorSeleccionado.rfc,
        domicilio_fiscal: this.proveedorSeleccionado.domicilioFiscal,
        domicilio_entrega: this.proveedorSeleccionado.domicilioEntrega,
        contacto_nombre: this.proveedorSeleccionado.contacto.nombre,
        contacto_email: this.proveedorSeleccionado.contacto.email,
        contacto_telefono: this.proveedorSeleccionado.contacto.telefono,
        condiciones_pago_dias: this.proveedorSeleccionado.condicionesPago.diasNetos,
        condiciones_pago_descuento: this.proveedorSeleccionado.condicionesPago.descuento,
        moneda: this.proveedorSeleccionado.moneda,
        tipo_cambio: this.proveedorSeleccionado.tipoCambio,
        cuenta_contable: this.proveedorSeleccionado.cuentaContable,
        centro_costo: this.proveedorSeleccionado.centroCosto,
        transportista: this.proveedorSeleccionado.transportista,
        incoterm: this.proveedorSeleccionado.incoterm
      };
      const res = await fetch(`http://localhost:8080/api/proveedores/${this.proveedorSeleccionado.idProveedor}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'No se pudo actualizar el proveedor');
      }
      await this.cargarProveedores();
      Swal.fire('Actualizado', 'Proveedor actualizado con éxito', 'success');
      this.limpiarSeleccion();
    } catch (e) {
      Swal.fire('Error', e.message || 'No se pudo actualizar el proveedor', 'error');
    } finally {
      this.guardBoton = false;
    }
  },
  async eliminarProveedor(idProveedor) {
    this.guardBoton = true;
    try {
      const resSwal = await Swal.fire({
        title: '¿Eliminar proveedor?',
        text: 'No podrás revertir esto',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#d33', // Color rojo visible para el botón de confirmar
        cancelButtonColor: '#aaa'   // Color gris para el botón de cancelar
      });
      if (resSwal.isConfirmed) {
        const res = await fetch(`http://localhost:8080/api/proveedores/${idProveedor}`, { method: 'DELETE' });
        if (!res.ok && res.status !== 204) throw new Error('No se pudo eliminar el proveedor');
        await this.cargarProveedores();
        Swal.fire('Eliminado', 'Proveedor eliminado', 'success');
        if (this.proveedorSeleccionado?.idProveedor === idProveedor) this.limpiarSeleccion();
      }
    } catch (e) {
      Swal.fire('Error', e.message || 'No se pudo eliminar el proveedor', 'error');
    } finally {
      this.guardBoton = false;
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
    },
    limpiarSeleccion() {
      this.proveedorSeleccionado = null;
      this.paginaActual = this.paginaAnterior;
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

/* Header de tabla - Botones optimizados */
.card-header {
  background: var(--color-suave);
  border-bottom: none;
  padding: 0.75rem 1rem;
  border-radius: 8px 8px 0 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}

.input-busqueda {
  flex: 1;
  min-width: 200px;
  max-width: 300px;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  border: none;
  outline: none;
  background: var(--color-blanco);
  transition: all 0.3s;
  font-size: 0.9rem;
}

.input-busqueda:focus {
  border: 2px solid var(--color-acento);
  box-shadow: 0 0 0 0.2rem rgba(124,20,84,0.1);
}

/* Grupo de botones compactos */
.botones-header {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

/* Botones cabecera optimizados */
.btn-nuevo {
  background-color: var(--color-acento);
  color: white;
  font-weight: 500;
  border: none;
  border-radius: 8px;
  padding: 0.45rem 0.9rem;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  white-space: nowrap;
}

.btn-nuevo:hover {
  background-color: var(--color-primario);
  transform: translateY(-1px);
}

.btn-exportar {
  background-color: var(--color-secundario);
  color: white;
  font-weight: 500;
  border: none;
  border-radius: 8px;
  padding: 0.45rem 0.9rem;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  white-space: nowrap;
}

.btn-exportar:hover {
  background-color: var(--color-acento);
  transform: translateY(-1px);
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
  font-size: 0.9rem;
  padding: 0.6rem 0.8rem;
}

.tabla-productos td {
  text-align: left;
  vertical-align: middle;
  font-size: 0.9rem;
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

/* Botones de acción */
.btn-ver {
  background: var(--color-acento);
  border: none;
  color: white;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  font-size: 0.9rem;
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
  font-size: 1.3rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 1.5rem;
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
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
  display: block;
  font-weight: bold;
}

.detalle-columna div,
.detalle-columna input {
  font-size: 1rem;
  font-weight: 500;
}

.panel-visualizacion input.form-control,
.panel-visualizacion select.form-select {
  color: var(--color-texto);
  background: var(--color-blanco);
  box-shadow: 0 0 0 0.2rem rgba(124,20,84,0.25);
  width: 100%;
  font-size: 0.95rem;
}

/* Paginación */
.paginacion {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  flex-wrap: wrap;
}

.btn-pag {
  background: var(--color-primario);
  border: none;
  color: white;
  padding: 0.4rem 0.9rem;
  border-radius: 20px;
  font-weight: bold;
  min-width: 90px;
  font-size: 0.85rem;
  transition: all 0.3s;
}

.btn-pag:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* Modal */
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
  font-size: 1.2rem;
}

.modal-body {
  padding: 1.5rem;
  background-color: var(--color-blanco);
}

.modal-body .form-label {
  font-weight: 600;
  color: var(--color-primario);
  font-size: 0.9rem;
}

.modal-body .form-control,
.modal-body .form-select {
  border: 1px solid #ccc;
  border-radius: 10px;
  transition: all 0.3s;
  font-size: 0.9rem;
}

.modal-body .form-control:focus,
.modal-body .form-select:focus {
  border-color: var(--color-acento);
  box-shadow: 0 0 0 0.2rem rgba(124, 20, 84, 0.2);
}

.modal-footer {
  border-top: 1px solid #ddd;
  background-color: #f9f9fb;
  padding: 1rem 1.5rem;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
}

.modal-footer .btn {
  border-radius: 8px;
  padding: 0.4rem 1rem;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.modal-footer .btn-secondary {
  background-color: var(--color-primario);
  color: var(--color-blanco);
  border: none;
}

.modal-footer .btn-secondary:hover {
  background-color: var(--color-acento);
}

.modal-footer .btn-primary {
  background-color: var(--color-acento);
  color: var(--color-blanco);
  border: none;
}

.modal-footer .btn-primary:hover:not(:disabled) {
  background-color: var(--color-primario);
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

@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: stretch;
  }

  .input-busqueda {
    order: 1;
    width: 100%;
    max-width: 100%;
  }

  .botones-header {
    order: 2;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: flex-start;
    gap: 0.5rem;
    width: 100%;
  }

  .botones-header .btn-nuevo,
  .botones-header .btn-exportar {
    flex: 1 1 auto;
    justify-content: center;
    width: 100%;
  }
}


/* Versión móvil mejorada */
@media (max-width: 768px) {
  .tabla-productos {
    font-size: 0.85rem;
    min-width: 100%;
  }
  
  .tabla-productos th,
  .tabla-productos td {
    padding: 0.5rem 0.6rem;
  }
  
  /* Ocultamos columnas menos importantes */
  .tabla-productos th:nth-child(3),
  .tabla-productos td:nth-child(3) {
    display: none;
  }
  
  /* Ajustamos el ancho de columnas */
  .tabla-productos th:nth-child(1),
  .tabla-productos td:nth-child(1) {
    width: 15%;
  }
  
  .tabla-productos th:nth-child(2),
  .tabla-productos td:nth-child(2) {
    width: 25%;
  }
  
  .tabla-productos th:nth-child(4),
  .tabla-productos td:nth-child(4) {
    width: 20%;
    text-align: center;
  }
  
  .tabla-productos th:nth-child(5),
  .tabla-productos td:nth-child(5) {
    width: 10%;
    text-align: center;
  }
  
  /* Header más compacto */
  .card-header {
    padding: 0.5rem;
  }
  
  .btn-nuevo,
  .btn-exportar {
    padding: 0.35rem 0.7rem;
    font-size: 0.8rem;
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
  .modal-content {
    max-width: 95vw;
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
  .modal-body {
    padding: 1rem;
  }
  
  .modal-footer {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .modal-footer .btn {
    width: 100%;
  }
  
  /* Botones header apilados */
  .botones-header {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .btn-nuevo,
  .btn-exportar {
    width: 100%;
    justify-content: center;
  }
}
</style>
