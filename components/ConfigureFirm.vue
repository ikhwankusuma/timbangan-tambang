<template>
  <div ref="component" class="form">
    <div class="wrapper">
      <div class="header">
        <div class="action">
          <round-button :icon="'mdi-close'" @clicked="exit" />
          <round-button
            :icon="'mdi-check'"
            :primary="true"
            :loading="loading"
            @clicked="submit"
          />
        </div>
        <div class="main-information">
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
          <div class="page-title">
            Ubah Informasi Perusahaan
          </div>
        </div>
      </div>
      <div class="text-input-field">
        <text-input ref="nameInput" :input="nameInput" @changed="changeVal" />
        <text-input ref="phoneInput" :input="phoneInput" @changed="changeVal" />
        <text-input ref="emailInput" :input="emailInput" @changed="changeVal" />
        <text-area-input
          ref="addressInput"
          :input="addressInput"
          @changed="changeVal"
        />
      </div>
    </div>
  </div>
</template>

<script>
import gsap from 'gsap'
/* eslint-disable */
const animate = {
  init(component, cb, reverseCb) {
    const tl = gsap.timeline({
      onComplete() {
        if (cb) cb()
      },
      onReverseComplete() {
        if (reverseCb) reverseCb()
      },
    })
    const wrapper = component.children
    tl.from(wrapper, {
      x: '100%',
      duration: 0.5,
      ease: 'power2.inOut',
    })
    return tl
  },
}
/* eslint-enable */
export default {
  data() {
    return {
      loading: false,
      errorMessage: '',
      nameInput: {
        label: 'Nama Perusahaan',
        type: 'text',
        model: '',
        placeholder: '...',
        rules: [this.notEmpty],
        readonly: true,
      },
      phoneInput: {
        label: 'Nomor Telefon',
        type: 'tel',
        model: '',
        placeholder: '...',
        rules: [this.notEmpty],
      },
      emailInput: {
        label: 'Email',
        type: 'text',
        model: '',
        placeholder: '...',
        rules: [this.notEmpty],
      },
      addressInput: {
        label: 'Alamat',
        model: '',
        placeholder: '...',
        rules: [this.notEmpty],
      },
    }
  },
  computed: {
    phone() {
      return this.phoneInput.model
    },
    email() {
      return this.emailInput.model
    },
    address() {
      return this.addressInput.model
    },
    config() {
      return this.$store.getters.config
    },
  },
  mounted() {
    const {
      $refs: { component },
    } = this
    this.anim = animate.init(
      component,
      () => {
        if (this.config) {
          this.nameInput.model = this.config.name
          this.phoneInput.model = this.config.phone || ''
          this.emailInput.model = this.config.email || ''
          this.addressInput.model = this.config.address || ''
        }
      },
      () => {
        this.$emit('exit')
      }
    )
  },
  methods: {
    exit() {
      this.anim.reverse()
    },
    notEmpty(str) {
      return str && str.toString().length ? '' : 'Kolom wajib diisi'
    },
    changeVal({ val, input }) {
      input.model = val
    },
    async submit() {
      try {
        this.loading = true
        const { phone, email, address } = this
        const payload = {
          phone,
          email,
          address,
        }
        const { message } = await this.$store.dispatch('editConfig', payload)
        if (message !== 'SUCCESS') throw new Error(message)
        this.exit()
      } catch (e) {
        this.loading = false
        this.errorMessage = e.message
        this.$root.$emit('shake')
      }
    },
  },
}
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
        .error-message {
          position: relative;
          font-family: 'Quicksand';
          font-size: 0.75rem;
          font-weight: 400;
          line-height: 1;
          color: $error-color;
        }
        .page-title {
          position: relative;
          margin: 0.25rem 0;
          font-family: 'Consolas', 'Azeret Mono', monospace;
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
