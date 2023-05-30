<template>
  <div ref="component" class="component">
    <div class="wrapper">
      <div class="header">
        <div class="action">
          <round-button :icon="'mdi-close'" @clicked="exit" />
          <round-button :icon="'mdi-check'" :primary="true" @clicked="submit" />
        </div>
        <div class="main-information">
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
          <div class="page-title">
            Atur Timbangan
          </div>
        </div>
      </div>
      <div class="button-input-field">
        <button-secondary-input
          :label="'Refresh'"
          :icon="'mdi-refresh'"
          :loading="loading"
          :outlined="true"
          @clicked="refreshSocket"
        />
      </div>
      <div v-if="!scales.length" class="no-scales" @click="refreshSocket">
        <div class="placeholder">
          Tidak ada timbangan terdeteksi
        </div>
        <div class="icon-container">
          <v-icon class="icon">
            mdi-close
          </v-icon>
        </div>
      </div>
      <div
        v-for="(scale, i) in scales"
        :key="scale.id"
        class="scale-field previous-data"
      >
        <div class="scale-header">
          <div class="input-field">
            <input
              :id="`scale-name-${i}`"
              v-model="scale.name"
              type="text"
              class="scale-name"
              :placeholder="scale.id"
            >
            <div class="border" />
          </div>
          <label v-ripple :for="`scale-name-${i}`" class="icon-container">
            <v-icon class="icon">mdi-pencil</v-icon>
          </label>
        </div>
        <div class="scale-value" :style="config.type !== 1 ? 'margin-bottom: 0;' : ''">
          <span class="value">{{ scale.weight }}</span>
          <span class="placeholder">{{ `kg (${scale.id})` }}</span>
        </div>
        <div v-if="config.type === 1" class="text-input-field">
          <text-input :input="scale.input" @changed="changeVal" />
        </div>
      </div>
    </div>
    <sync-scales
      v-if="tempScalesRoot && scalesRoot && scalesRoot.length"
      @exit="exit"
    />
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
      scales: [],
      loading: false,
    }
  },
  computed: {
    tempScalesRoot() {
      return this.$store.getters['scales/tempScales']
    },
    scalesRoot() {
      return this.$store.getters['scales/scales']
    },
    scalesName() {
      return this.scales.map((a) => a.name || a.id)
    },
    config() {
      return this.$store.getters.config
    },
  },
  watch: {
    scalesRoot: {
      handler(val) {
        if (val)
          this.scales = val.map((a) => ({
            ...a,
            name: a.name || '',
            weight: a.weight || 0,
            input: {
              placeholder: 'Material',
              model: a.material || '',
            },
          }))
      },
      immediate: true,
    },
    tempScalesRoot: {
      handler(val) {
        if (val && val.length && (!this.scalesRoot || !this.scalesRoot.length))
          this.scales = val.map((a) => ({
            ...a,
            name: a.name || '',
            weight: a.weight || 0,
            input: {
              placeholder: 'Material',
              model: a.material || '',
            },
          }))
      },
      immediate: true,
    },
  },
  mounted() {
    const {
      $refs: { component },
    } = this
    this.anim = animate.init(component, null, () => {
      this.$emit('exit')
    })
    this.$root.$on('weight-update', (data) => {
      const index = this.scales.findIndex((a) => a.id === data.id)
      if (index > -1) this.scales[index].weight = data.weight
    })
    this.$root.$on('refresh-scales', () => {
      this.loading = true
    })
    this.$root.$on('refresh-done', () => {
      this.loading = false
    })
  },
  methods: {
    exit() {
      this.anim.reverse()
    },
    refreshSocket() {
      this.loading = true
      this.$root.$emit('refresh-socket')
    },
    submit() {
      try {
        const scales = this.scales.map((a) => ({
          name: a.name || a.id,
          id: a.id,
          material: a.input.model || '',
        }))
        if (
          this.tempScalesRoot &&
          this.tempScalesRoot.length &&
          (!this.scalesRoot || !this.scalesRoot.length)
        ) {
          this.$store.dispatch('scales/setTempScales')
        }
        if (
          this.scalesName
            .filter((a, i) => this.scalesName.indexOf(a) !== i)
            .length
        )
          throw new Error('Nama timbangan tidak boleh sama!')
        this.$store.dispatch('scales/setScales', scales)
        this.exit()
      } catch (e) {
        this.errorMessage = e.message
        this.$root.$emit('shake')
      }
    },
    changeVal({ val, input }) {
      input.model = val
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
    .no-scales {
      position: relative;
      width: 100%;
      padding: 0.75rem;
      border-radius: 0.75rem;
      border: 2px solid $error-color;
      margin-top: 0.5rem;
      color: $error-color;
      display: flex;
      justify-content: space-between;
      align-items: center;
      .placeholder {
        position: relative;
        font-family: 'Quicksand';
        font-size: 0.65rem;
        font-weight: 600;
        line-height: 1;
        color: inherit;
      }
      .icon-container {
        position: relative;
        width: 1.5rem;
        height: 1.5rem;
        border-radius: 0.5rem;
        background: rgba($error-color, 0.1);
        display: flex;
        justify-content: center;
        align-items: center;
        .icon {
          font-size: 0.85rem;
          color: inherit;
        }
      }
    }
    .scale-field-container {
      position: relative;
      width: 100%;
      margin-bottom: 1rem;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-start;
      .placeholder {
        position: relative;
        font-family: 'Quicksand';
        font-size: 0.65rem;
        font-weight: 600;
        margin-bottom: 0.25rem;
        color: inherit;
      }
    }
    .scale-field {
      position: relative;
      width: 100%;
      padding: 0.75rem;
      border: 1px solid $border-color;
      border-radius: 0.75rem;
      margin-bottom: 0.5rem;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-start;
      > .scale-header {
        position: relative;
        padding: 0;
        width: 100%;
        height: 1.5rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .placeholder {
          position: relative;
          font-family: 'Quicksand';
          font-size: 0.65rem;
          font-weight: 600;
          line-height: 1;
        }
        .input-field {
          position: relative;
          left: -0.375rem;
          height: 100%;
          display: flex;
          justify-content: flex-start;
          align-items: flex-start;
          input.scale-name {
            position: relative;
            height: 100%;
            padding: 0 0.375rem;
            border-radius: 0.5rem;
            margin: 0;
            box-sizing: content-box;
            font-family: 'Quicksand';
            font-size: 0.65rem;
            font-weight: 600;
            line-height: 1;
            &:focus {
              outline: none;
              & + .border {
                border-color: $subtext-color;
              }
            }
            & + .border {
              content: '';
              pointer-events: none;
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              border: 2px solid $background-color;
              box-sizing: border-box;
              border-radius: 0.5rem;
              transition: border-color 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            }
          }
        }
        .icon-container {
          cursor: pointer;
          position: relative;
          width: 1.5rem;
          height: 1.5rem;
          border-radius: 0.5rem;
          background: $background-secondary-color;
          display: flex;
          justify-content: center;
          align-items: center;
          .icon {
            font-size: 0.85rem;
          }
        }
      }
      .scale-value {
        position: relative;
        margin: 1rem 0 0.5rem 0;
        display: flex;
        justify-content: flex-start;
        align-items: flex-end;
        span.value {
          position: relative;
          font-family: 'Consolas', 'Azeret Mono', monospace;
          font-size: 1.25rem;
          font-weight: 700;
          line-height: 1;
        }
        span.placeholder {
          position: relative;
          margin-left: 0.25rem;
          margin-bottom: 0.125rem;
          font-family: 'Quicksand';
          font-size: 0.55rem;
          font-weight: 600;
          line-height: 1;
          color: $subtext-color;
        }
      }
      &:last-child {
        margin-bottom: 0;
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
