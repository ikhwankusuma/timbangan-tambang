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
            Restore Data
          </div>
        </div>
      </div>
      <div class="body">
        <label
          v-ripple
          for="file-input"
          class="option"
          :style="
            loading ? 'justify-content: center; pointer-events: none' : ''
          "
        >
          <v-icon v-if="!loading" class="icon">mdi-upload-outline</v-icon>
          <h3 v-if="!loading" class="name">Pilih file</h3>
          <v-progress-circular v-else indeterminate :size="20" :width="3" />
        </label>
        <input
          id="file-input"
          type="file"
          name="pics"
          accept="application/JSON"
          @change="restoreData"
        >
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
    changeVal({ val, input }) {
      input.model = val
    },
    restoreData({ target }) {
      this.loading = true
      try {
        const file = target.files[0]
        if (file) {
          const fileReader = new FileReader()
          fileReader.onload = async ({ target: { result } }) => {
            try {
              const payload = JSON.parse(result)
              const { data } = await this.$axios.post(
                `${this.$config.apiURL}/admin/restore-data`,
                { payload }
              )
              if (data.message === 'SUCCESS') this.exit()
              else throw new Error('Gagal memuat data, silahkan coba lagi.')
            } catch (e) {
              this.loading = false
              this.$store.dispatch('alerts/add', {
                type: 'error',
                message:
                  e.message === 'Request failed with status code 500'
                    ? 'Data tersebut sudah dipulihkan.'
                    : e.message,
              })
            }
          }
          fileReader.readAsText(file)
        } else throw new Error('Gagal memuat data, silahkan coba lagi.')
      } catch (e) {
        this.loading = false
        this.$store.dispatch('alerts/add', {
          type: 'error',
          message: e.message,
        })
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
      padding: 0 1rem 1rem 1rem;
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
      .btn {
        cursor: pointer;
        position: relative;
        width: 100%;
        height: 2rem;
        border-radius: 0.25rem;
        font-family: 'Quicksand';
        font-size: 0.65rem;
        font-weight: 600;
        background: $primary-color;
        display: flex;
        justify-content: center;
        align-items: center;
        transition: 0.25s background-color, 0.25s color;
        color: #fff;
        &.disabled {
          pointer-events: none;
          // background: rgba($font-color, 0.2);
          // color: $font-color;
        }
      }
      .option {
        cursor: pointer;
        touch-action: none;
        position: relative;
        width: 100%;
        height: 2rem;
        padding: 0.5rem 0;
        border-radius: 9px;
        border: 1px solid $border-color;
        box-sizing: border-box;
        background: rgba($primary-color, 0);
        display: flex;
        justify-content: flex-start;
        align-items: center;
        transition: 0.25s color, 0.25s background-color, 0.25s border-color;
        .icon {
          position: relative;
          width: 2rem;
          height: 2rem;
          color: inherit;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        h3.name {
          font-family: 'Quicksand';
          color: inherit;
        }
        &.active {
          background: rgba($primary-color, 0.2);
          border-color: $primary-color;
          color: $primary-color;
        }
        &.disabled {
          pointer-events: none;
          opacity: 0.5;
        }
        &:last-child {
          margin-bottom: 0;
        }
      }
      input#file-input {
        display: none;
        z-index: -1;
        position: absolute;
        opacity: 0;
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
