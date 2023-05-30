<template>
  <div ref="panel" class="panel" :style="visible ? '' : 'pointer-events: none'">
    <div v-for="(page, i) in camerasPage" :key="i" class="camera-list">
      <div v-for="(row, j) in page" :key="j" class="camera-row">
        <div v-for="(camera, k) in row" :key="k" class="camera">
          <canvas ref="camera" :data-label="camera.label" />
          <div class="overlay">
            <div class="label">{{ camera.label }}</div>
            <round-button
              v-if="edit"
              :icon="'mdi-delete'"
              @clicked="deleteCamera(camera.ip)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { loadPlayer } from "rtsp-relay/browser";
import gsap from "gsap";

/* eslint-disable */
const animate = {
  init(component, cb, reverseCb) {
    const tl = gsap.timeline({
      onComplete() {
        if (cb) cb();
      },
      onReverseComplete() {
        if (reverseCb) reverseCb();
      },
    });

    tl.to(component, {
      opacity: 1,
      duration: 0.25,
    });

    return tl;
  },
};
/* eslint-enable */

export default {
  props: {
    edit: { type: Boolean },
    visible: { type: Boolean },
  },
  data() {
    return {
      players: {},
    };
  },
  computed: {
    cameras() {
      return this.$store.getters["cameras/cameras"];
    },
    camerasPage() {
      let i = 0;
      let j = 0;
      let k = 0;
      const arr = [];
      for (const camera of this.cameras) {
        if (j === 0 && i === 0) arr[k] = [];
        if (i === 0) arr[k][j] = [];
        arr[k][j].push(camera);
        i++;
        if (i === 2) {
          j++;
          i = 0;
        }
        if (j === 2) {
          k++;
          j = 0;
        }
      }
      return arr;
    },
  },
  watch: {
    cameras(val) {
      for (const player of Object.values(this.players)) {
        player.destroy();
      }
      setTimeout(async () => {
        this.players = {};
        for (let i = 0; i < val.length; i++) {
          const camera = val[i];
          const { ip, username, password } = camera;
          const player = await loadPlayer({
            url: `ws://localhost:7000/stream/${ip}?username=${username}&password=${password}`,
            canvas: this.$refs.camera[i],
            preserveDrawingBuffer: true,
          });
          this.players[ip] = player;
        }
      }, 100);
    },
    visible(val) {
      if (val) {
        this.anim = animate.init(this.$refs.panel, null, () => {
          this.$emit("exit");
        });
      }
    },
  },
  async mounted() {
    this.$root.$on("images-request", () => {
      this.getImages();
    });
    for (let i = 0; i < this.cameras.length; i++) {
      const camera = this.cameras[i];
      const { ip, username, password } = camera;
      const player = await loadPlayer({
        url: `ws://localhost:7000/stream/${ip}?username=${username}&password=${password}`,
        canvas: this.$refs.camera[i],
        preserveDrawingBuffer: true,
      });
      this.players[ip] = player;
    }
  },
  beforeDestroy() {
    for (const player of Object.values(this.players)) {
      player.destroy();
    }
  },
  methods: {
    exit() {
      if (this.anim) {
        this.anim.reverse();
      }
    },
    deleteCamera(ip) {
      this.$store.dispatch("cameras/remove", ip);
    },
    getImages() {
      const images = this.cameras;
      this.$root.$emit("images-return", images);
    },
  },
};
</script>

<style lang="scss" scoped>
.panel {
  z-index: 1000000;
  position: absolute;
  width: 100%;
  height: 100%;
  right: 0;
  top: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  opacity: 0;
  box-sizing: border-box;
  overflow: hidden;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  .camera-list {
    position: relative;
    width: 100%;
    height: 100%;
    padding: 1rem 2rem;
    box-sizing: border-box;
    grid-gap: 1rem;
    display: flex;
    grid-gap: 1rem;
    flex-shrink: 0;
    flex-wrap: wrap;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    .camera-row {
      position: relative;
      width: 100%;
      height: 13.5vw;
      grid-gap: 1rem;
      display: flex;
      justify-content: center;
      align-items: center;
      .camera {
        position: relative;
        width: 24vw;
        height: 13.5vw;
        border-radius: 0.75rem;
        background: red;
        display: flex;
        overflow: hidden;
        &::after {
          content: "";
          pointer-events: none;
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
        }
        .overlay {
          z-index: 2;
          color: #fff;
          position: absolute;
          width: 100%;
          padding: 0.75rem;
          box-sizing: border-box;
          display: flex;
          justify-content: space-between;
          align-items: center;
          .label {
            position: relative;
            font-family: "Consolas", "Azeret Mono", monospace;
            font-size: 0.6rem;
            font-weight: 600;
            color: #fff;
            line-height: 1;
          }
        }
      }
    }
  }
}
</style>
