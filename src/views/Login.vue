<template>
  <div class="contenedor-login">
    <div class="lado-izquierdo">
      <img src="../assets/images/perro.png" alt="Imagen de perro" class="imagen-perro" />
    </div>

    <div class="lado-derecho">
      <div class="caja-login">
        <img
          src="https://cdn-icons-png.flaticon.com/512/1077/1077114.png"
          alt="avatar"
          class="avatar"
        />
        <h2>BIENVENIDO</h2>

        <form @submit.prevent="iniciarSesion">
          <div class="campo-formulario">
            <i class="material-icons">person</i>
            <input
              type="text"
              v-model="usuario"
              placeholder="Usuario"
              required
            />
          </div>

          <div class="campo-formulario">
            <i class="material-icons">lock</i>
            <input
              type="password"
              v-model="contrasena"
              placeholder="Contraseña"
              required
            />
          </div>

          <div class="recuperar-contrasena">
            <a href="#">¿Olvidaste tu contraseña?</a>
          </div>

          <button type="submit" class="boton-login">
            INICIAR SESIÓN
          </button>
        </form>

        <p v-if="error" class="mensaje-error">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import Swal from 'sweetalert2'

const usuario = ref('')
const contrasena = ref('')
const error = ref('')
const router = useRouter()
const store = useStore()

const iniciarSesion = async () => {
  error.value = ''

  if (!usuario.value || !contrasena.value) {
    Swal.fire({
      icon: 'warning',
      title: 'Campos incompletos',
      text: 'Por favor completa todos los campos.'
    })
    return
  }

  const ok = await store.dispatch('login', {
    username: usuario.value,
    password: contrasena.value
  })

  if (ok) {
    Swal.fire({
      icon: 'success',
      title: `¡Bienvenido, ${usuario.value}!`,
      text: 'Inicio de sesión exitoso',
      showConfirmButton: false,
      timer: 1500
    })
    router.push('/dashboard')
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Error de autenticación',
      text: 'Usuario o contraseña incorrectos.'
    })
    error.value = 'Usuario o contraseña incorrectos.'
  }
}
</script>



<style scoped>

.mensaje-error {
  color: red;
  margin-top: 1rem;
  font-weight: bold;
}

.contenedor-login {
  display: flex;
  min-height: 100vh;
  font-family: 'Nunito Sans', sans-serif;
}

.lado-izquierdo {
  flex: 1;
 background: radial-gradient(#e72285 0%, #781251 100%);
  display: flex;
  justify-content: center;
  align-items: center;
}

.imagen-perro {
  max-width: 70%;
  height: auto;
}

.lado-derecho {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #ffffff;
}

.caja-login {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  text-align: center;
}

.avatar {
  width: 80px;
  margin-bottom: 1rem;
}

h2 {
  font-weight: 700;
  color: #7c245c;
  margin-bottom: 2rem;
}

.campo-formulario {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #ccc;
  padding: 0.5rem 0;
}

.campo-formulario i {
  margin-right: 0.5rem;
  color: #7c245c;
}

.campo-formulario input {
  border: none;
  outline: none;
  width: 100%;
  font-size: 1rem;
  background: transparent;
}

.recuperar-contrasena {
  text-align: right;
  font-size: 0.85rem;
  margin-bottom: 1.5rem;
}

.recuperar-contrasena a {
  color: #7c245c;
  text-decoration: none;
}

.boton-login {
  background-color: #7c245c;
  color: #fff;
  border: none;
  width: 100%;
  padding: 0.75rem;
  border-radius: 30px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.boton-login:hover {
  background-color: #a45484;
}

@media (max-width: 768px) {
  .contenedor-login {
    flex-direction: column;
  }

  .lado-izquierdo {
    display: none;
  }

  .imagen-perro {
    max-width: 50%;
  }

  .lado-derecho {
    width: 100%;
    padding: 2rem;
  }

  .caja-login {
    padding: 1rem;
  }
}
</style>
