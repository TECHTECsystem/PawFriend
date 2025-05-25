import { createStore } from 'vuex';

export default createStore({
  state: {
    token: localStorage.getItem('token') || null,
    id_usuario: localStorage.getItem('id_usuario') || null
  },
  mutations: {
    setAuth(state, { token, id_usuario }) {
      state.token = token;
      state.id_usuario = id_usuario;
    },
    clearAuth(state) {
      state.token = null;
      state.id_usuario = null;
    }
  },
  actions: {
    async login({ commit }, credenciales) {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/login`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credenciales)
          }
        );
        const data = await res.json();
        if (!res.ok) return false;

        // persistir en localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('id_usuario', data.id_usuario);

        // guardar en Vuex
        commit('setAuth', {
          token: data.token,
          id_usuario: data.id_usuario
        });
        return true;
      } catch (e) {
        console.error('Error en login:', e);
        return false;
      }
    },
    logout({ commit }) {
      localStorage.removeItem('token');
      localStorage.removeItem('id_usuario');
      commit('clearAuth');
    }
  },
  getters: {
    isAuthenticated: state => !!state.token,
    getToken: state => state.token,
    getUserId: state => state.id_usuario
  }
});
