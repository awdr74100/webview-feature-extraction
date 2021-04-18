<template>
  <div class="container-fluid px-0">
    <div class="d-flex flex-column align-items-center justify-content-center">
      <div class="p-3 w-100">
        <select v-model="deviceId" class="form-control">
          <option value="" disabled>-- Select Camera --</option>
          <option
            v-for="camera in cameras"
            :key="camera.deviceId"
            :value="camera.deviceId"
          >
            {{ camera.label }}
          </option>
        </select>
      </div>
      <div v-if="errorMessage" class="p-3 text-danger">{{ errorMessage }}</div>
      <div v-else class="p-3 text-danger">請在人臉檢測框為綠色時進行提取！</div>
      <div
        class="mx-3 overlay d-flex align-items-center justify-content-center"
      >
        <vue-web-cam
          ref="webcam"
          class="webcam"
          width="100%"
          height="100%"
          :device-id="deviceId"
          @cameras="onCameras"
          @camera-change="onCameraChange"
          @error="onError"
          @notsupported="onError"
          @video-live="onVideoLive"
        />
      </div>
      <div class="px-3 my-4">
        <button
          class="btn btn-teal text-white d-flex align-items-center justify-content-center"
          :disabled="!!errorMessage"
          @click.prevent="onCapture"
        >
          <span>提取特徵</span>
          <span v-if="spinner" class="text-white ms-3">
            <font-awesome-icon :icon="['fas', 'spinner']" spin />
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import * as faceapi from '@vladmandic/face-api';
import delay from '../utils/delay';

export default {
  beforeRouteEnter(to, from, next) {
    if (to.hash) return next(`${to.path}?${to.hash.substr(1)}`);
    return next();
  },
  data: () => ({
    deviceId: '',
    cameras: [],
    errorMessage: '',
    spinner: false,
    modelStatus: '',
  }),
  created() {
    this.$store.commit('SETLOADINGSTATUS', '相機啟動中');
    this.$store.commit('ISLOADING', true);
  },
  methods: {
    async getUserInfo() {
      try {
        const { access_token: accessToken } = this.$route.query;
        const url = `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${accessToken}`;
        const { data } = await this.axios.get(url);
        this.$store.commit('SETUSER', {
          uid: data.id,
          displayName: data.name,
          email: data.email,
        });
      } catch (error) {
        this.$notify({
          group: 'custom-template',
          title: error.message,
        });
      }
    },
    async onVideoLive() {
      if (this.modelStatus !== 'loaded') await this.loadModels();
      const webcam = document.querySelector('.webcam');
      const oldCanvas = document.querySelector('.face');
      const overlay = document.querySelector('.overlay');
      const canvas = faceapi.createCanvasFromMedia(webcam);
      const canvasSize = {
        width: webcam.clientWidth,
        height: webcam.clientHeight,
      };
      canvas.classList.add('face');
      faceapi.matchDimensions(canvas, canvasSize);
      // clear canvas
      if (oldCanvas) overlay.removeChild(oldCanvas);
      // append canvas
      overlay.appendChild(canvas);
      // close loading
      this.$store.commit('ISLOADING', false);
      this.$store.commit('SETLOADINGSTATUS', '');
      // face detection
      this.faceDetection(webcam, canvas, canvasSize, 500);
    },
    onCameras(cameras) {
      this.cameras = cameras;
      this.deviceId = cameras[0].deviceId;
    },
    onCameraChange() {
      this.$store.commit('SETLOADINGSTATUS', '相機啟動中');
      this.$store.commit('ISLOADING', true);
    },
    onError(error) {
      this.errorMessage = error;
      this.$store.commit('ISLOADING', false);
    },
    async loadModels() {
      this.$store.commit('SETLOADINGSTATUS', '模型載入中');
      await Promise.all([
        faceapi.nets.faceLandmark68TinyNet.loadFromUri('/models'),
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
      ]);
      this.modelStatus = 'loaded';
    },
    faceDetection(webcam, canvas, canvasSize, ms) {
      setInterval(async () => {
        const detections = await faceapi.detectAllFaces(
          webcam,
          new faceapi.TinyFaceDetectorOptions(),
        );
        const resizeDetections = faceapi.resizeResults(detections, canvasSize);
        canvas
          .getContext('2d')
          .clearRect(0, 0, canvasSize.width, canvasSize.height);
        resizeDetections.forEach((detection) => {
          const score = Math.ceil(detection.score * 100) / 100;
          new faceapi.draw.DrawBox(
            {
              x: detection.box.x,
              y: detection.box.y,
              width: detection.box.width,
              height: detection.box.height,
            },
            { boxColor: score > 0.85 ? '#20c997' : '#6c757d' },
          ).draw(canvas);
          new faceapi.draw.DrawTextField(
            [`${score}`],
            detection.box.bottomLeft,
            {
              backgroundColor: score > 0.85 ? '#20c997' : '#6c757d',
            },
          ).draw(canvas);
        });
      }, ms);
    },
    async onCapture() {
      const vm = this;
      const base64Array = [];
      const imageLength = 5;
      vm.$store.commit('SETFEATURES', []);
      vm.spinner = true;

      for (let i = 0; i < imageLength; i += 1) {
        base64Array.push(vm.$refs.webcam.capture());
        // eslint-disable-next-line no-await-in-loop
        if (i !== imageLength - 1) await delay(500);
      }

      try {
        const features = await Promise.all(
          base64Array.map((base64) => {
            const img = document.createElement('img');
            img.src = base64;
            return faceapi
              .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
              .withFaceLandmarks(true)
              .withFaceDescriptor()
              .then((feature) => JSON.stringify(feature.descriptor));
          }),
        );

        if (features.includes(null)) throw new Error('');

        vm.$store.commit('SETFEATURES', features);

        await this.getUserInfo();

        vm.$store.commit('SHOWMODAL', true);
        vm.spinner = false;
      } catch (error) {
        this.$notify({
          group: 'custom-template',
          title: '特徵提取失敗，請在試一次',
          duration: 5000,
        });
        vm.spinner = false;
      }
    },
  },
};
</script>
