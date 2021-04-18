import Vue from 'vue';
import Vuex from 'vuex';
import { Modal } from 'bootstrap/dist/js/bootstrap.bundle';
import axios from 'axios';

const vm = Vue;

Vue.use(Vuex);

export default new Vuex.Store({
  strict: import.meta.env.DEV,
  state: {
    user: {
      uid: '',
      displayName: '',
      email: '',
    },
    isSignIn: false,
    isLoading: false,
    loadingStatus: '',
    features: [],
    showModal: false,
  },
  actions: {
    async signup(context, { uid, email, displayName, features }) {
      const url = `${import.meta.env.VITE_APP_BACKEND_URL}/api/users/signup`;
      try {
        await axios.post(url, { uid, email, displayName, features });
      } catch (error) {
        vm.notify({
          group: 'custom-template',
          title: error.message,
        });
      }
    },
  },
  mutations: {
    SETUSER(state, { uid, displayName, email }) {
      state.user.uid = uid;
      state.user.displayName = displayName;
      state.user.email = email;
    },
    ISSIGNIN(state, status) {
      state.isSignIn = status;
    },
    ISLOADING(state, status) {
      state.isLoading = status;
    },
    SETLOADINGSTATUS(state, status) {
      state.loadingStatus = status;
    },
    SETFEATURES(state, features) {
      state.features = features;
    },
    SHOWMODAL(state, status) {
      const modal = new Modal('#customModal', {
        backdrop: 'static',
        keyboard: false,
      });
      state.showModal = status;
      modal[status ? 'show' : 'hide']();
    },
  },
});
