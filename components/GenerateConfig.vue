<template>
  <div ref="component" class="form">
    <div class="wrapper">
      <div class="header">
        <div class="action">
          <round-button :icon="'mdi-check'" :primary="true" @clicked="submit" />
        </div>
        <div class="main-information">
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
          <div class="page-title">Konfigurasi Program</div>
        </div>
      </div>
      <div class="text-input-field">
        <switch-input
          :input="switchInput"
          style="margin-bottom: 1rem"
          @changed="changeVal"
        />
        <text-input ref="nameInput" :input="nameInput" @changed="changeVal" />
        <text-input ref="urlInput" :input="urlInput" @changed="changeVal" />
        <text-input
          ref="locationInput"
          :input="locationInput"
          @changed="changeVal"
        />
        <tags-input
          ref="pluginsInput"
          style="margin-bottom: 1rem"
          :input="pluginsInput"
          @changed="changeVal"
        />
        <text-input
          ref="phoneInput"
          :input="phoneInput"
          style="margin-bottom: 1rem"
          @changed="changeVal"
        />
        <text-input
          ref="emailInput"
          :input="emailInput"
          style="margin-bottom: 1rem"
          @changed="changeVal"
        />
        <text-area-input
          ref="addressInput"
          :input="addressInput"
          style="margin-bottom: 1rem"
          @changed="changeVal"
        />
        <radio-input
          ref="typeInput"
          :input="typeInput"
          style="margin-bottom: 1rem"
          @changed="changeVal"
        />
        <text-input
          ref="passInput"
          :input="passInput"
          style="margin-bottom: 1rem"
          @changed="changeVal"
        />
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
      loading: false,
      errorMessage: "",
      switchInput: {
        options: ["trial", "activated"],
        model: "",
      },
      nameInput: {
        label: "Nama Perusahaan",
        type: "text",
        model: "",
        placeholder: "...",
        rules: [this.notEmpty],
      },
      urlInput: {
        label: "Url center",
        type: "text",
        model: "",
        placeholder: "url.com",
        rules: [this.notEmpty],
      },
      locationInput: {
        label: "Lokasi timbangan",
        type: "text",
        model: "",
        placeholder: "...",
        rules: [this.notEmpty],
      },
      phoneInput: {
        label: "Nomor Telpon",
        type: "text",
        model: "",
        placeholder: "...",
      },
      emailInput: {
        label: "Email Perusahaan",
        type: "text",
        model: "",
        placeholder: "...",
      },
      addressInput: {
        label: "Alamat Perusahaan",
        type: "text",
        model: "",
        placeholder: "...",
      },
      typeInput: {
        label: "Tipe timbangan",
        model: 1,
        selections: [
          {
            name: "Tipe 1",
            desc: "Setiap data ditimbang dua kali, yaitu timbang masuk dan keluar.",
            value: 1,
          },
          {
            name: "Tipe 2",
            desc: "Setiap data hanya ditimbang sekali.",
            value: 2,
          },
        ],
      },
      passInput: {
        label: "Password",
        type: "password",
        model: "",
        placeholder: "...",
        rules: [this.notEmpty],
      },
      pluginsInput: {
        label: "Add-ons",
        type: "text",
        model: "",
        placeholder: "...",
        values: [],
        selection: [
          "Surat Jalan",
          "Kamera",
          "Gate Barrier",
          "Tipe Kendaraan",
        ],
      },
      pluginsSelection: [
        "Surat Jalan",
        "Kamera",
        "Gate Barrier",
        "Tipe Kendaraan",
      ],
    };
  },
  computed: {
    plugins() {
      return this.pluginsInput.values.map((a) =>
        this.pluginsSelection.indexOf(a)
      );
    },
    status() {
      return this.switchInput.model;
    },
    name() {
      return this.nameInput.model;
    },
    url() {
      return this.urlInput.model;
    },
    location() {
      return this.locationInput.model;
    },
    phone() {
      return this.phoneInput.model;
    },
    email() {
      return this.emailInput.model;
    },
    address() {
      return this.addressInput.model;
    },
    type() {
      return this.typeInput.model;
    },
    password() {
      return this.passInput.model;
    },
  },
  watch: {
    type(val) {
      this.pluginsInput.values = [];
      this.pluginsInput.model = "";
      if (val === 1) this.pluginsInput.selection = this.pluginsSelection;
      else this.pluginsInput.selection = [];
    },
  },
  mounted() {
    const {
      $refs: { component },
    } = this;
    this.anim = animate
      .init(component, null, () => {
        this.$emit("exit");
      })
      .progress(1);
  },
  methods: {
    exit() {
      this.anim.reverse();
    },
    notEmpty(str) {
      return str && str.toString().length ? "" : "Kolom wajib diisi";
    },
    notNegative(val) {
      return parseInt(val) >= 0 ? "" : "Nilai tidak boleh negatif";
    },
    changeVal({ val, input }) {
      if (typeof val === "object") input.values = val;
      else input.model = val;
    },
    async submit() {
      try {
        this.loading = true;
        const {
          status,
          name,
          location,
          url,
          phone,
          email,
          address,
          type,
          password,
          plugins,
        } = this;
        const payload = {
          status,
          name,
          location,
          url,
          password,
          phone,
          email,
          address,
          type,
          plugins,
          exp:
            status === "trial"
              ? new Date().getTime() + 30 * 86400 * 1000
              : null,
        };
        if (!name) throw new Error("Nama perusahaan wajib diisi!");
        if (!url) throw new Error("Link/url center wajib diisi!");
        const { message } = await this.$store.dispatch("createConfig", payload);
        if (message !== "SUCCESS") throw new Error(message);
        this.$emit("finished");
      } catch (e) {
        this.loading = false;
        if (e.message === "INVALID_PASSWORD")
          this.errorMessage = "Password Salah!";
        else this.errorMessage = e.message;
        this.$root.$emit("shake");
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.form {
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
        justify-content: flex-end;
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
        .error-message {
          position: relative;
          font-family: "Quicksand";
          font-size: 0.75rem;
          font-weight: 400;
          line-height: 1;
          color: $error-color;
        }
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
    .text-input-field {
      position: relative;
      width: 100%;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-start;
      .treshold {
        position: relative;
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: flex-start;
      }
      .input-row {
        position: relative;
        width: 100%;
        height: 4rem;
        overflow-y: visible;
        display: flex;
        justify-content: center;
        align-items: flex-start;
      }
    }

    .button-input-field {
      position: relative;
      width: 100%;
      margin-top: 0.5rem;
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
