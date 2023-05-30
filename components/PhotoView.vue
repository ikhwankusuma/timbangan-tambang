<template>
  <div ref="panel" class="panel">
    <div v-for="(page, i) in photosPage" :key="i" class="camera-list">
      <div v-for="(row, j) in page" :key="j" class="camera-row">
        <div v-for="(photo, k) in row" id="camera" :key="k" class="camera">
          <img ref="photos" :src="`${$config.apiURL}${photo}`" />
          <div class="overlay">
            <div class="label">
              {{ photo.replace(".jpeg", "").split("-").slice(1).join("-") }}
            </div>
            <div class="label">
              {{ photo.includes("entry") ? "Timbang masuk" : "Timbang keluar" }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
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

    tl.from(component, {
      opacity: 0,
      duration: 0.25
    });

    return tl;
  },
};
/* eslint-enable */

export default {
  props: {
    scale: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      players: {},
    };
  },
  computed: {
    photos() {
      return this.scale.photos && this.scale.photos.length
        ? this.scale.photos
        : [
            ...(this.scale.entry_photos || []),
            ...(this.scale.exit_photos || []),
          ];
    },
    photosPage() {
      let i = 0;
      let j = 0;
      let k = 0;
      const arr = [];
      for (const photo of this.photos) {
        if (j === 0 && i === 0) arr[k] = [];
        if (i === 0) arr[k][j] = [];
        arr[k][j].push(photo);
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
  mounted() {
    const {
      $refs: { panel },
    } = this;
    this.anim = animate.init(panel, null, () => {
      this.$emit("exit");
    });
  },
  methods: {
    exit() {
      this.anim.reverse();
    }
  }
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
            display: flex;
            flex-direction: row;
            justify-content: space-evenly;
            font-family: "Consolas", "Azeret Mono", monospace;
            font-size: 0.6rem;
            font-weight: 600;
            color: #fff;
            line-height: 1;
            .text {
              position: relative;
              display: flex;
              flex-direction: row;
              justify-content: space-between;
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
}
</style>
