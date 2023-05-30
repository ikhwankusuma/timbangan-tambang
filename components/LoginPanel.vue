<template>
  <form ref="component" class="component" @keypress.enter="submit">
    <div class="wrapper">
      <div class="header">
        <div class="action">
          <div v-ripple class="btn" @click="exit">
            <v-icon class="icon">
              mdi-close
            </v-icon>
          </div>
        </div>
        <div class="main-information">
          <div class="greet">
            Silahkan login untuk melanjutkan
          </div>
          <div class="name">
            {{ config.name }}
          </div>
        </div>
      </div>
      <div class="text-input-field">
        <text-input
          ref="usernameInput"
          :input="usernameInput"
          @changed="changeVal"
        />
        <text-input
          ref="passwordInput"
          :input="passwordInput"
          @changed="changeVal"
        />
      </div>
      <div class="button-input-field">
        <button-input
          :error="error"
          :label="'masuk'"
          :loading="loading"
          :disabled="!username || !password"
          @clicked="submit"
        />
      </div>
    </div>
  </form>
</template>

<script>
import gsap from 'gsap'

/* eslint-disabled */
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

    tl.from(
      wrapper,
      {
        x: '100%',
        duration: 0.5,
        ease: 'power2.inOut',
      },
      '<0'
    )

    return tl
  },
}
/* eslint-enabled */

export default {
  data() {
    return {
      usernameInput: {
        label: 'Username',
        type: 'text',
        placeholder: 'jdoe321',
        icon: 'mdi-account-outline',
        rules: [this.notEmpty],
        model: '',
      },
      passwordInput: {
        label: 'Password',
        type: 'password',
        placeholder: 'hush',
        icon: 'mdi-key-outline',
        rules: [this.notEmpty],
        model: '',
      },
      loading: false,
      error: '',
    }
  },
  computed: {
    username() {
      return this.usernameInput.model
    },
    password() {
      return this.passwordInput.model
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
        this.$refs.usernameInput.focus()
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
    changeVal({ val, input }) {
      input.model = val
    },
    notEmpty(val) {
      return val.trim().length > 0 ? '' : 'Kolom wajib diisi!'
    },
    async submit() {
      try {
        this.loading = true
        const { message } = await this.$store.dispatch('user/login', {
          username: this.username,
          password: this.password,
        })
        if (message !== 'SUCCESS') throw new Error(message)
        this.loading = false
        this.exit()
      } catch (e) {
        this.loading = false
        this.$root.$emit('shake')
        this.error = 'Kombinasi username dan password salah'
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
    .header {
      position: relative;
      width: 100%;
      padding-top: 2rem;
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
        .btn {
          cursor: pointer;
          position: relative;
          width: 1.5rem;
          height: 1.5rem;
          border-radius: 50%;
          border: 1px solid $border-color;
          display: flex;
          justify-content: center;
          align-items: center;
          .icon {
            font-size: 0.85rem;
          }
        }
      }
      .main-information {
        position: relative;
        width: 100%;
        margin-top: 2rem;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        .greet {
          position: relative;
          font-family: 'Quicksand';
          font-size: 0.75rem;
          font-weight: 400;
          line-height: 1;
          color: $subtext-color;
        }
        .name {
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
    .text-input-field,
    .button-input-field {
      position: relative;
      width: 100%;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-start;
    }
    .button-input-field {
      margin-top: 1rem;
    }
  }
  @media only screen and (max-width: 1024px) {
    width: 100vw;
    .wrapper {
      width: 100%;
      padding: 0 1rem;
      .header {
        padding-top: 1rem;
      }
    }
  }
}
</style>
