<template>
  <div ref="component" class="component">
    <div class="wrapper">
      <div class="header">
        <div class="action">
          <round-button :icon="'mdi-close'" @clicked="exit()" />
          <round-button :icon="'mdi-check'" :primary="true" @clicked="submit" />
        </div>
        <div class="main-information">
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
          <div class="page-title">
            Aktifkan Program
          </div>
        </div>
      </div>
      <div class="body">
        <div class="input-row">
          <text-input :input="codeInput" @changed="changeVal" />
        </div>
        <div style="height: 2rem" class="input-row">
          <div
            v-ripple
            class="confirm-btn btn"
            :style="loading ? 'pointer-events: none' : ''"
            :class="!code ? 'disabled' : ''"
            @click="submit"
          />
        </div>
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
      errorMessage: '',
      codeInput: {
        label: 'Kode aktivasi',
        type: 'text',
        model: '',
        placeholder: '...',
        rules: [this.notEmpty],
      },

      loading: false,
    }
  },
  computed: {
    code() {
      return this.codeInput.model
    },
  },
  watch: {},
  mounted() {
    const {
      $refs: { component },
    } = this
    this.anim = animate.init(component, null, () => {
      this.$emit('exit')
    })
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
        const { code, $store } = this
        const { message } = await $store.dispatch('activateApp', {
          code,
        })
        console.log(code)
        if (message === 'SUCCESS') this.exit()
        else throw new Error(message)
      } catch (e) {
        this.loading = false
        switch (e.message) {
          case 'INVALID_REQUEST':
            this.errorMessage = 'Semua kolom wajib diisi'
            break
          case 'USER_ALREADY_EXIST':
            this.errorMessage = 'Username tersebut telah dipakai'
            break
          default:
            this.errorMessage = 'Terjadi masalah, silahkan coba lagi'
            break
        }
      }
    },
  },
}
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
    * {
      flex-shrink: 0;
    }

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
          font-family: 'Consolas', 'Azeret Mono', monospace;
          font-size: 1rem;
          font-weight: 600;
          line-height: 1;
          color: $text-color;
        }
        .data-type {
          position: relative;
          height: 1rem;
          padding: 0 0.5rem;
          border-radius: 0.5rem;
          background: rgba($primary-color, 0.1);
          font-family: 'Quicksand', sans-serif;
          font-size: 0.55rem;
          font-weight: 600;
          line-height: 1;
          white-space: nowrap;
          color: $primary-color;
          display: flex;
          justify-content: center;
          align-items: center;
          &.subtract {
            background: rgba($error-color, 0.1);
            color: $error-color;
          }
        }
      }
    }
    .body {
      position: relative;
      width: 100%;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: center;
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
