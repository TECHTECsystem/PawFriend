<template>
  <Navbar />
      <div class="container enca">
      <h2 class="mb-1">Usuarios</h2>
      <p class="text">Control y gestión de trabajadores en el sistema.</p>
    </div>
  <div class="contenedor mt-4">
    <div v-if="cargandoInicial" class="d-flex justify-content-center align-items-center" style="height:200px;">
      <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div>
    </div>
    <div v-else>
      <div class="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-3">
        <div class="d-flex gap-2 flex-wrap align-items-center">
          <input v-model="busqueda" type="text" class="form-control w-auto" placeholder="Buscar usuario..." style="max-width: 300px;" />
        </div>
        <button v-if="usuarioActual.rol === 'admin'" class="btn btn-success" @click="abrirModalNuevo">
          <span class="material-icons align-middle">add</span> Nuevo Usuario
        </button>
      </div>
      <transition-group name="fade-table" tag="div">
        <div class="card tabla-usuarios" key="tabla">
          <table class="table mb-0">
            <thead>
              <tr>
                <th>Id</th>
                <th>Usuario</th>
                <th>Email</th>
                <th>Estatus</th>
                <th v-if="usuarioActual.rol === 'admin'">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="usuario in usuariosPaginados" :key="usuario.id" :class="{ 'table-active': usuarioSeleccionado && usuarioSeleccionado.id === usuario.id }">
                <td class="text-center align-middle">{{ usuario.id }}</td>
                <td class="text-center align-middle">{{ usuario.username }}</td>
                <td class="text-center align-middle">{{ usuario.email }}</td>
                <td class="text-center align-middle">
                  <span :class="usuario.activo ? 'badge bg-success' : 'badge bg-secondary'">
                    {{ usuario.activo ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td v-if="usuarioActual.rol === 'admin'" class="text-center align-middle">
                  <div class="d-flex justify-content-center gap-2">
                    <button class="btn-accion editar" @click="editarUsuario(usuario)">
                      <span class="material-icons">edit</span>
                    </button>
                    <button class="btn-accion eliminar" @click="eliminarUsuario(usuario)">
                      <span class="material-icons">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="usuariosFiltrados.length === 0">
                <td :colspan="usuarioActual.rol === 'admin' ? 5 : 4" class="text-center">No hay usuarios para mostrar.</td>
              </tr>
            </tbody>
          </table>
          <div class="d-flex justify-content-between align-items-center p-2">
            <span>Página {{ paginaActual }} de {{ totalPaginas }}</span>
            <div>
              <button class="btn btn-outline-secondary btn-sm me-2" @click="paginaActual--" :disabled="paginaActual === 1">Anterior</button>
              <button class="btn btn-outline-secondary btn-sm" @click="paginaActual++" :disabled="paginaActual >= totalPaginas">Siguiente</button>
            </div>
          </div>
        </div>
      </transition-group>
      <!-- Modal Usuario -->
      <div class="modal fade" id="modalUsuario" tabindex="-1" aria-labelledby="modalUsuarioLabel" aria-hidden="true">
        <div class="modal-dialog modal-usuario">
          <div class="modal-content animate-modal">
            <div class="modal-header">
              <h5 class="modal-title" id="modalUsuarioLabel">{{ modoEdicion ? 'Editar usuario' : 'Nuevo usuario' }}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <form @submit.prevent="guardarUsuario" novalidate>
              <div class="modal-body">
                <div class="mb-3">
                  <label class="form-label">Nombre *</label>
                  <input v-model="usuarioForm.nombre" class="form-control" :class="{'is-invalid': submitted && !usuarioForm.nombre}" required maxlength="50" />
                  <div v-if="submitted && !usuarioForm.nombre" class="invalid-feedback">Campo requerido.</div>
                </div>
                <div class="mb-3">
                  <label class="form-label">Email *</label>
                  <input v-model="usuarioForm.email" class="form-control" :class="{'is-invalid': submitted && (!usuarioForm.email || !emailValido)}" required maxlength="60" type="email" />
                  <div v-if="submitted && !usuarioForm.email" class="invalid-feedback">Campo requerido.</div>
                  <div v-else-if="submitted && !emailValido" class="invalid-feedback">Formato de email inválido.</div>
                </div>
                <div class="mb-3">
                  <label class="form-label">Usuario generado *</label>
                  <div class="input-group">
                    <input v-model="usuarioForm.username" class="form-control" />
                    <button class="btn btn-outline-secondary" type="button" @click="generarCredenciales">Generar</button>
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label">Contraseña generada *</label>
                  <input v-model="usuarioForm.password" class="form-control" />
                </div>
                <div class="mb-3">
                  <label class="form-label">Permisos *</label>
                  <table class="table table-bordered table-permisos">
                    <thead>
                      <tr>
                        <th>
                          <input type="checkbox" :checked="todosSeleccionados" :indeterminate.prop="algunosSeleccionados" @change="toggleSeleccionarTodo" />
                          Seleccionar todo
                        </th>
                        <th>Descripción</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="permiso in permisosDisponibles" :key="permiso.id">
                        <td>
                          <input type="checkbox" :value="permiso.id" v-model="usuarioForm.permisos" />
                        </td>
                        <td>{{ permiso.descripcion }}</td>
                      </tr>
                    </tbody>
                  </table>
                  <div v-if="submitted && usuarioForm.permisos.length === 0" class="text-danger small">Selecciona al menos un permiso.</div>
                </div>
                <div class="mb-3 form-check">
                  <input class="form-check-input" type="checkbox" id="activoCheck" v-model="usuarioForm.activo" />
                  <label class="form-check-label" for="activoCheck">Activo / Inactivo</label>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" @click="cerrarModal">Cancelar</button>
                <button type="button" class="btn btn-info" @click="enviarCredenciales" :disabled="!puedeGuardar">
                  <span class="material-icons align-middle">send</span> Enviar credenciales
                </button>
                <button type="submit" class="btn btn-primary" :disabled="!puedeGuardar || cargando">
                  <span v-if="cargando" class="spinner-border spinner-border-sm me-1"></span>
                  Guardar
                </button>
                <button v-if="modoEdicion && usuarioActual.rol === 'admin'" type="button" class="btn btn-danger ms-2" @click="eliminarUsuario(usuarioForm)" :disabled="cargando">
                  <span v-if="cargando" class="spinner-border spinner-border-sm me-1"></span>
                  Eliminar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <!-- Fin Modal Usuario -->
    </div>
  </div>
</template>

<script>
import Navbar from '../components/Navbar.vue';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import axios from 'axios';

export default {
  name: 'UsuariosView',
  components: { Navbar },
  data() {
    return {
      usuarioActual: { rol: 'admin' },
      cargandoInicial: true,
      usuarios: [],
      usuarioSeleccionado: null,
      modoEdicion: false,
      mostrarModal: false,
      usuarioForm: {
        id: '', nombre: '', email: '', username: '',
        password: '', permisos: [], activo: true, ultimoAcceso: ''
      },
      permisosDisponibles: [
        { id: 'ventas', descripcion: 'Gestión de ventas' },
        { id: 'productos', descripcion: 'Gestión de productos' },
        { id: 'clientes', descripcion: 'Gestión de clientes' },
        { id: 'proveedores', descripcion: 'Gestión de proveedores' },
        { id: 'servicios', descripcion: 'Gestión de servicios' },
        { id: 'usuarios', descripcion: 'Administración de usuarios' }
      ],
      busqueda: '',
      paginaActual: 1,
      usuariosPorPagina: 10,
      cargando: false,
      submitted: false
    };
  },
  computed: {
    usuariosFiltrados() {
      const filtro = this.busqueda.toLowerCase();
      function contiene(obj, termino) {
        for (const key in obj) {
          if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
          const val = obj[key];
          if (val == null) continue;
          if (typeof val === 'string' || typeof val === 'number') {
            if (val.toString().toLowerCase().includes(termino)) return true;
          } else if (Array.isArray(val)) {
            if (val.some(v => v.toString().toLowerCase().includes(termino))) return true;
          } else if (typeof val === 'object') {
            if (contiene(val, termino)) return true;
          }
        }
        return false;
      }
      return this.usuarios.filter(u => contiene(u, filtro));
    },
    usuariosPaginados() {
      const start = (this.paginaActual - 1) * this.usuariosPorPagina;
      return this.usuariosFiltrados.slice(start, start + this.usuariosPorPagina);
    },
    totalPaginas() {
      return Math.ceil(this.usuariosFiltrados.length / this.usuariosPorPagina) || 1;
    },
    todosSeleccionados() {
      return this.usuarioForm.permisos.length === this.permisosDisponibles.length && this.permisosDisponibles.length > 0;
    },
    algunosSeleccionados() {
      return this.usuarioForm.permisos.length > 0 && !this.todosSeleccionados;
    },
    puedeGuardar() {
      return (
        this.usuarioForm.nombre &&
        this.usuarioForm.email &&
        this.emailValido &&
        this.usuarioForm.username &&
        (
          (!this.modoEdicion && this.usuarioForm.password) || this.modoEdicion
        ) &&
        this.usuarioForm.permisos.length > 0
      );
    },
    emailValido() {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.usuarioForm.email);
    }
  },
  mounted() {
    this.cargarUsuarios();
  },
  methods: {
    async cargarUsuarios() {
      this.cargandoInicial = true;
      try {
        const res = await fetch('http://localhost:8080/api/usuarios');
        if (!res.ok) throw new Error('No se pudo obtener la lista de usuarios');
        const data = await res.json();
        this.usuarios = data.map(u => ({
          id: u.id,
          nombre: u.nombre,
          email: u.email,
          username: u.username,
          password: '', // nunca mostrar password
          permisos: this.backendToPermisos(u),
          activo: !!u.activo,
          ultimoAcceso: u.ultimo_acceso || ''
        }));
      } catch (e) {
        console.error(e);
        Swal.fire('Error', e.message || 'No se pudieron cargar los usuarios', 'error');
      } finally {
        this.cargandoInicial = false;
      }
    },
    backendToPermisos(u) {
      const map = [
        { key: 'ventas', field: 'permiso_ventas' },
        { key: 'productos', field: 'permiso_productos' },
        { key: 'clientes', field: 'permiso_clientes' },
        { key: 'proveedores', field: 'permiso_proveedores' },
        { key: 'servicios', field: 'permiso_servicios' },
        { key: 'usuarios', field: 'permiso_admin_usuarios' }
      ];
      return map.filter(m => u[m.field]).map(m => m.key);
    },
    permisosToBackend(permisos) {
      return {
        permiso_ventas: permisos.includes('ventas') ? 1 : 0,
        permiso_productos: permisos.includes('productos') ? 1 : 0,
        permiso_clientes: permisos.includes('clientes') ? 1 : 0,
        permiso_proveedores: permisos.includes('proveedores') ? 1 : 0,
        permiso_servicios: permisos.includes('servicios') ? 1 : 0,
        permiso_admin_usuarios: permisos.includes('usuarios') ? 1 : 0
      };
    },
    abrirModalNuevo() {
      this.usuarioForm = {
        id: '', nombre: '', email: '', username: '',
        password: '', permisos: [], activo: true, ultimoAcceso: ''
      };
      this.modoEdicion = false;
      this.submitted = false;
      this.generarCredenciales();
      this.$nextTick(() => {
        const modalEl = document.getElementById('modalUsuario');
        if (!this.modalUsuario && modalEl) {
          this.modalUsuario = new window.bootstrap.Modal(modalEl, { backdrop: true });
        }
        if (this.modalUsuario) this.modalUsuario.show();
      });
    },
    cerrarModal() {
      if (this.modalUsuario) this.modalUsuario.hide();
      this.usuarioSeleccionado = null;
      this.submitted = false;
    },
    generarCredenciales() {
      const base = (this.usuarioForm.nombre || 'usuario').toLowerCase().replace(/[^a-z0-9]/g, '');
      const random = Math.floor(Math.random() * 10000);
      this.usuarioForm.username = base.substring(0, 8) + random;
      this.usuarioForm.password = Array(10).fill(0).map(() => String.fromCharCode(97 + Math.floor(Math.random() * 26))).join('');
    },
    async guardarUsuario() {
      this.submitted = true;
      if (!this.puedeGuardar) return;
      this.cargando = true;
      let success = false;
      let errorMsg = '';
      try {
        if (this.modoEdicion) {
          // Editar usuario usando PUT al backend
          const body = {
            nombre: this.usuarioForm.nombre,
            email: this.usuarioForm.email,
            username: this.usuarioForm.username,
            activo: this.usuarioForm.activo ? 1 : 0,
            ...this.permisosToBackend(this.usuarioForm.permisos)
          };
          // Solo incluir password si el usuario la escribió
          if (this.usuarioForm.password && this.usuarioForm.password.trim() !== '') {
            body.password = this.usuarioForm.password;
          }
          const res = await fetch(`http://localhost:8080/api/usuarios/${this.usuarioForm.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          });
          if (!res.ok) throw new Error('No se pudo actualizar el usuario');
          success = true;
        } else {
          // Agregar usuario nuevo usando POST al backend
          const body = {
            nombre: this.usuarioForm.nombre,
            email: this.usuarioForm.email,
            username: this.usuarioForm.username,
            password: this.usuarioForm.password,
            activo: this.usuarioForm.activo ? 1 : 0,
            ...this.permisosToBackend(this.usuarioForm.permisos)
          };
          const res = await fetch('http://localhost:8080/api/usuarios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          });
          if (!res.ok) throw new Error('No se pudo crear el usuario');
          success = true;
        }
      } catch (e) {
        errorMsg = e.message || 'No se pudo guardar el usuario';
      } finally {
        // --- Modal cleanup: cerrar modal y limpiar backdrop ---
        if (this.modalUsuario) this.modalUsuario.hide();
        document.body.classList.remove('modal-open');
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(b => b.parentNode && b.parentNode.removeChild(b));
        // --- Recargar usuarios y limpiar formulario si es nuevo ---
        await this.cargarUsuarios();
        if (!this.modoEdicion) {
          this.usuarioForm = {
            id: '', nombre: '', email: '', username: '',
            password: '', permisos: [], activo: true, ultimoAcceso: ''
          };
          this.generarCredenciales();
        }
        this.submitted = false;
        this.cargando = false;
        // --- Mostrar alerta ---
        if (success) {
          Swal.fire('¡Guardado!', 'Usuario guardado correctamente', 'success');
        } else {
          Swal.fire('Error', errorMsg, 'error');
        }
      }
    },
    editarUsuario(usuario) {
      // Resetear el formulario completamente antes de cargar el usuario a editar
      this.usuarioForm = {
        id: '', nombre: '', email: '', username: '',
        password: '', permisos: [], activo: true, ultimoAcceso: ''
      };
      // Cargar los datos del usuario seleccionado
      this.usuarioForm = { ...usuario, permisos: [...(usuario.permisos || [])], password: '' };
      this.modoEdicion = true;
      this.submitted = false;
      this.$nextTick(() => {
        const modalEl = document.getElementById('modalUsuario');
        if (!this.modalUsuario && modalEl) {
          this.modalUsuario = new window.bootstrap.Modal(modalEl, { backdrop: true });
        }
        if (this.modalUsuario) this.modalUsuario.show();
      });
    },
    eliminarUsuario(usuario) {
      Swal.fire({
        title: '¿Eliminar usuario?',
        text: 'No podrás revertir esto',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#d33'
      }).then(async confirm => {
        if (!confirm.isConfirmed) return;
        this.cargando = true;
        this.usuarioSeleccionado = usuario;
        try {
          // Llamar al endpoint DELETE lógico
          const res = await fetch(`http://localhost:8080/api/usuarios/${usuario.id}`, {
            method: 'DELETE',
          });
          if (!res.ok) throw new Error('No se pudo eliminar el usuario');
          await this.cargarUsuarios();
          Swal.fire('Eliminado', 'Usuario eliminado', 'success');
        } catch (e) {
          console.error(e);
          Swal.fire('Error', 'No se pudo eliminar el usuario', 'error');
        } finally {
          this.cargando = false;
          this.usuarioSeleccionado = null;
        }
      });
    },
    toggleSeleccionarTodo() {
      if (this.todosSeleccionados) {
        this.usuarioForm.permisos = [];
      } else {
        this.usuarioForm.permisos = this.permisosDisponibles.map(p => p.id);
      }
    },
    enviarCredenciales() {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'info',
        title: 'Credenciales enviadas (simulado)',
        showConfirmButton: false,
        timer: 2000
      });
    },
    exportarExcel() {
      const encabezados = ['ID','Nombre','Email','Usuario','Contraseña','Permisos','Activo','Último Acceso'];
      const data = this.usuarios.map(u => [
        u.id,
        u.nombre,
        u.email,
        u.username,
        u.password,
        (u.permisos || []).join('|'),
        u.activo ? 'Activo' : 'Inactivo',
        u.ultimoAcceso || ''
      ]);
      const ws = XLSX.utils.aoa_to_sheet([encabezados, ...data]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Usuarios');
      XLSX.writeFile(wb, 'usuarios.xlsx');
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
  --color-claro: #f4f4f9;
  --color-texto: #222;
  --color-blanco: #ffffff;
  --color-error: #b00020;
}

.container.enca {
  font-family: 'Nunito Sans', sans-serif;
}

/* Tarjeta principal */
.contenedor {
  background-color: var(--color-blanco);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

/* Tarjeta tabla usuarios */
.card.tabla-usuarios {
  background: var(--color-blanco);
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: none;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

/* Tabla */
.table {
  min-width: 600px;
  width: 100%;
}

.table th {
  background-color: var(--color-secundario);
  color: var(--color-blanco);
  text-align: center;
  vertical-align: middle;
  position: sticky;
  top: 0;
}

.table td {
  text-align: center;
  vertical-align: middle;
  color: var(--color-texto);
}

.table-active {
  background-color: #ffe3f0;
}

/* Etiquetas */
.badge.bg-success {
  background-color: #28a745;
}

.badge.bg-secondary {
  background-color: #6c757d;
}

/* Botones */
.btn-outline-primary,
.btn-outline-secondary,
.btn-success {
  font-weight: 500;
  border-radius: 8px;
  white-space: nowrap;
}

.btn-outline-primary {
  border-color: var(--color-acento);
  color: var(--color-acento);
}
.btn-outline-primary:hover {
  background-color: var(--color-acento);
  color: var(--color-blanco);
}

.btn-outline-secondary {
  border-color: var(--color-primario);
  color: var(--color-primario);
}
.btn-outline-secondary:hover {
  background-color: var(--color-primario);
  color: var(--color-blanco);
}

.btn-success {
  background-color: var(--color-primario);
  border: none;
  color: var(--color-blanco);
}
.btn-success:hover {
  background-color: var(--color-acento);
}

/* Botón circular de acción */
.btn-accion {
  border: none;
  background-color: var(--color-primario);
  color: white;
  border-radius: 100px;
  width: 40px;
  height: 40px;
  font-size: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background 0.2s ease-in-out;
}
.btn-accion:hover {
  background-color: #a45484;
}
.btn-accion.editar {
  background-color: var(--color-acento);
}
.btn-accion.editar:hover {
  background-color: #a45484;
}
.btn-accion.eliminar {
  background-color: darkred;
}
.btn-accion.eliminar:hover {
  background-color: #b22222;
}

/* Modal */
.modal-usuario .modal-content {
  border-radius: 12px;
  border: 1px solid var(--color-secundario);
}
.modal-usuario .modal-header {
  background-color: var(--color-suave);
  color: var(--color-blanco);
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}
.modal-title {
  font-weight: bold;
}
.modal-body {
  background-color: var(--color-blanco);
  padding: 1.5rem;
}
.modal-body .form-label {
  font-weight: 500;
  color: var(--color-primario);
}
.modal-body .form-control:focus,
.modal-body .form-select:focus {
  border-color: var(--color-acento);
  box-shadow: 0 0 0 0.2rem rgba(124,20,84,0.2);
}
.invalid-feedback {
  color: var(--color-error);
  font-size: 0.85rem;
}
.table-permisos th {
  background-color: var(--color-secundario);
  color: var(--color-blanco);
  text-align: center;
}
.table-permisos td {
  vertical-align: middle;
}

/* Footer botones */
.modal-footer .btn-secondary {
  background-color: var(--color-primario);
  color: var(--color-blanco);
  border-radius: 8px;
}
.modal-footer .btn-info {
  background-color: var(--color-secundario);
  border: none;
  color: var(--color-blanco);
  border-radius: 8px;
}
.modal-footer .btn-primary {
  background-color: var(--color-acento);
  color: var(--color-blanco);
  border-radius: 8px;
  border: none;
}
.modal-footer .btn-danger {
  background-color: darkred;
  color: white;
  border-radius: 8px;
}

/* Animación entrada tabla */
.fade-table-enter-active, .fade-table-leave-active {
  transition: all 0.3s ease;
}
.fade-table-enter-from, .fade-table-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Media Queries para responsividad */
@media (max-width: 992px) {
  .table {
    font-size: 0.9rem;
  }
  .contenedor {
    padding: 1rem;
  }
}

@media (max-width: 768px) {
  .table {
    min-width: 100%;
  }

  /* Oculta columnas menos importantes si se desea */
  .table th:nth-child(3),
  .table td:nth-child(3) {
    display: none;
  }

  .btn-accion {
    width: 36px;
    height: 36px;
    font-size: 18px;
  }

  .modal-body {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .table th,
  .table td {
    padding: 0.5rem;
    font-size: 0.85rem;
  }

  .modal-footer {
    flex-direction: column;
    gap: 0.5rem;
  }

  .modal-footer .btn {
    width: 100%;
  }
}
</style>


