<template>
  <div
    id="customModal"
    class="modal fade"
    tabindex="-1"
    aria-labelledby="customModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header bg-teal text-white">
          <h5 id="customModalLabel" class="modal-title">輸入資料</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
            @click.prevent="closeModal"
          ></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label for="displayName" class="form-label">姓名</label>
            <input
              v-model="user.displayName"
              type="text"
              disabled
              class="form-control"
            />
          </div>
          <div class="mb-3">
            <label for="email" class="form-label">信箱</label>
            <input
              v-model="user.email"
              type="text"
              disabled
              class="form-control"
            />
          </div>
          <div class="mb-3">
            <label for="uid" class="form-label">識別碼</label>
            <input
              v-model="user.uid"
              type="text"
              disabled
              class="form-control"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-outline-secondary"
            data-bs-dismiss="modal"
            @click.prevent="closeModal"
          >
            取消
          </button>
          <button
            type="button"
            class="btn btn-outline-teal"
            data-bs-dismiss="modal"
            @click.prevent="upload"
          >
            確定
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  computed: {
    ...mapState(['user', 'features']),
  },
  methods: {
    closeModal() {
      this.$store.commit('SHOWMODAL', false);
    },
    async upload() {
      try {
        this.$store.commit('SETLOADINGSTATUS', '特徵上傳中');
        this.$store.commit('ISLOADING', true);
        await this.$store.dispatch('signup', {
          uid: this.user.uid,
          displayName: this.user.displayName,
          email: this.user.email,
          features: this.features,
        });
        this.$store.commit('SETLOADINGSTATUS', '');
        this.$store.commit('SHOWMODAL', false);
        this.$store.commit('ISLOADING', false);
      } catch (error) {
        this.$notify({
          group: 'custom-template',
          title: error.message,
        });
        this.$store.commit('SETLOADINGSTATUS', '');
        this.$store.commit('SHOWMODAL', false);
        this.$store.commit('ISLOADING', false);
      }
    },
  },
};
</script>
