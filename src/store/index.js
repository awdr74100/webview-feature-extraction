import Vue from 'vue';
import Vuex from 'vuex';
import $ from 'jquery';
import axios from 'axios';

const vm = Vue;

Vue.use(Vuex);

export default new Vuex.Store({
  strict: process.env.NODE_ENV === 'development',
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
      const url = `${process.env.VUE_APP_BASE_URL}/api/users/signup`;
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
      state.showModal = status;
      $('#userData').modal(status ? 'show' : 'hide');
    },
  },
});
