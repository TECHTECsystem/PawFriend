
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './style.css'
import './assets/colors.css';


createApp(App)
  .use(router)
  .use(store) 
  .mount('#app')
