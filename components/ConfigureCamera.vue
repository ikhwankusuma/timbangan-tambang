<template>
  <div ref="component" class="component">
    <div class="wrapper">
      <div class="header">
        <div class="action">
          <round-button :icon="'mdi-close'" @clicked="exit" />
          <round-button
            :icon="'mdi-check'"
            :primary="true"
            :disabled="!playing"
            @clicked="submit"
          />
        </div>
        <div class="main-information">
          <div class="page-title">Atur kamera</div>
        </div>
      </div>
      <div class="camera">
        <canvas id="canvas-1" />
        <div v-if="message" class="overlay">
          <span v-if="!loading" class="message">{{ message }}</span>
          <v-progress-circular v-else indeterminate :size="20" :width="3" />
        </div>
      </div>
      <div class="text-input-field">
        <text-input :input="ipInput" @changed="changeVal" />
        <text-input :input="labelInput" @changed="changeVal" />
        <text-input
          :input="usernameInput"
          style="margin-bottom: 1rem"
          @changed="changeVal"
        />
        <text-input
          :input="passwordInput"
          style="margin-bottom: 2rem"
          @changed="changeVal"
        />
        <button-input
          :label="'Sambungkan'"
          :loading="loading"
          style="margin-bottom: 2rem"
          @clicked="test"
        />
      </div>
    </div>
  </div>
</template>

<script>
import gsap from "gsap";
import { loadPlayer } from "rtsp-relay/browser";

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

    const wrapper = component.children;

    tl.from(wrapper, {
      x: "100%",
      duration: 0.5,
      ease: "power2.inOut",
    });

    return tl;
  },
};
/* eslint-enable */

export default {
  data() {
    return {
      player: null,
      message: "Coba sambungkan kamera",
      scales: [],
      error: false,
      playing: false,
      loading: false,
      ipInput: {
        label: "Alamat IP",
        type: "text",
        icon: "",
        rules: [this.notEmpty],
        placeholder: "1.2.3.4",
        model: "",
      },
      labelInput: {
        label: "Label kamera",
        type: "text",
        icon: "",
        rules: [this.notEmpty],
        placeholder: "...",
        model: "",
      },
      usernameInput: {
        label: "Username",
        type: "text",
        icon: "",
        placeholder: "...",
        model: "",
      },
      passwordInput: {
        label: "Password",
        type: "text",
        icon: "",
        placeholder: "...",
        model: "",
      },
    };
  },
  computed: {
    cameras() {
      return this.$store.getters["cameras/cameras"];
    },
    ip() {
      return this.ipInput.model;
    },
    label() {
      return this.labelInput.model;
    },
    password() {
      return this.passwordInput.model;
    },
    username() {
      return this.usernameInput.model;
    },
  },
  mounted() {
    const {
      $refs: { component },
    } = this;
    this.anim = animate.init(component, null, () => {
      this.$emit("exit");
    });
  },
  beforeDestroy() {
    if (this.player) this.player.stop();
  },
  methods: {
    async test() {
      const { ip, username, password } = this;
      const index = this.cameras.findIndex((a) => a.ip === ip);
      if (index === -1) {
        if (this.player) this.player.stop();
        this.message = "";
        this.loading = true;
        this.player = await loadPlayer({
          url: `ws://localhost:7000/stream/${ip}?username=${username}&password=${password}`,
          canvas: document.getElementById("canvas-1"),
          onPlay: () => {
            this.message = "";
            this.loading = false;
            this.playing = true;
          },
          onDisconnect: () => {
            this.message = "gagal memuat rekaman";
            this.playing = false;
            this.loading = false;
            this.error = true;
          },
        });
      } else {
        this.message = "IP sudah dipakai";
      }
    },
    exit() {
      this.$root.$emit("close-cameras");
      this.anim.reverse();
    },
    notEmpty(str) {
      return str && str.toString().length ? "" : "Kolom wajib diisi";
    },
    changeVal({ val, input }) {
      input.model = val;
    },
    submit() {
      const { ip, username, password, label } = this;
      const payload = {
        ip,
        username,
        password,
        label,
      };
      this.$store.dispatch("cameras/insert", payload);
      setTimeout(() => {
        this.exit();
      }, 1000);
    },
  },
};
</script>

<style lang="scss" scoped>
.component {
  z-index: 10000;
  position: fixed;
  top: 0;
  right: 0;
  width: 20rem;
  height: 100vh;
  height: calc((var(--vh, 1vh) * 100));
  border-left: 1px solid $border-color;
  box-sizing: border-box;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  .wrapper {
    position: relative;
    width: 20rem;
    height: 100%;
    padding: 0 2rem;
    overflow-y: auto;
    background: $background-color;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    .header {
      position: relative;
      width: 100%;
      padding: 2rem 0 0 0;
      margin-bottom: 1rem;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: center;
      .action {
        position: relative;
        width: 100%;
        height: 1.5rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .main-information {
        position: relative;
        width: 100%;
        margin-top: 2rem;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        .page-title {
          position: relative;
          margin: 0.25rem 0;
          font-family: "Consolas", "Azeret Mono", monospace;
          font-size: 1rem;
          font-weight: 600;
          line-height: 1;
          color: $text-color;
        }
      }
    }
    .camera {
      position: relative;
      width: 100%;
      height: 9rem;
      border-radius: 0.75rem;
      background: #333;
      flex-shrink: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
      canvas {
        position: relative;
        width: 100%;
        height: 100%;
      }
      .overlay {
        color: #fff;
        position: absolute;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(2px);
        display: flex;
        justify-content: center;
        align-items: center;
        span.message {
          position: relative;
          font-family: "Quicksand";
          font-size: 0.75rem;
          font-weight: 400;
          line-height: 1;
          color: #fff;
        }
      }
    }
    .text-input-field {
      position: relative;
      width: 100%;
      margin-top: 1rem;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-start;
      * {
        flex-shrink: 0;
      }
    }
    .button-input-field {
      position: relative;
      width: 100%;
      margin-bottom: 1rem;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-start;
    }
  }
  @media only screen and (max-width: 1024px) {
    width: 100vw;
    .wrapper {
      width: 100%;
      padding: 0 1rem;
      .header {
        padding: 1rem 0 0 0;
        .main-information {
          margin-top: 1rem;
        }
      }
    }
  }
}
</style>
