import Vue from 'vue';

import { WebCam } from 'vue-web-cam';
import Loading from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/vue-loading.css';
import 'bootstrap/dist/js/bootstrap.bundle';

import App from './App.vue';
import router from './router';
import store from './store';

Vue.component('vue-web-cam', WebCam);
Vue.component('loading', Loading);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
