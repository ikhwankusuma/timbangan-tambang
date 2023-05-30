<template>
  <div ref="component" class="component">
    <div class="wrapper">
      <div class="header">
        <div class="action">
          <round-button :icon="'mdi-close'" @clicked="$emit('exit')" />
          <round-button :icon="'mdi-check'" :primary="true" @clicked="submit" />
        </div>
        <div class="main-information">
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
          <div class="page-title">
            Sinkronisasi Timbangan
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
      <div v-if="scalesRoot" ref="scales" class="scale-field-container">
        <div class="placeholder">
          Riwayat Timbangan
        </div>
        <div
          v-for="scale in scales"
          :key="scale.id"
          v-ripple
          :data-id="scale.id"
          class="scale-field"
          :class="
            currentSelectedScale && currentSelectedScale !== scale.id
              ? 'disabled'
              : ''
          "
          :style="
            currentSelectedScale === scale.id ? 'pointer-events: none' : ''
          "
          @click="selectScale"
        >
          <div class="scale-header">
            <div class="placeholder">
              {{ scale.name }}
            </div>
            <label class="icon-container">
              <v-icon class="icon">mdi-history</v-icon>
            </label>
          </div>
          <div class="scale-value">
            <span class="value">{{ scale.weight }}</span>
            <span class="placeholder">{{ `kg (${scale.id})` }}</span>
          </div>
        </div>
      </div>
      <div v-if="tempScalesRoot" ref="tempScales" class="scale-field-container">
        <div class="placeholder">
          Timbangan Terdeteksi
        </div>
        <div
          v-for="scale in tempScales"
          :key="scale.id"
          v-ripple
          :data-id="scale.id"
          class="scale-field"
          :class="
            currentSelectedTempScale && currentSelectedTempScale !== scale.id
              ? 'disabled'
              : ''
          "
          :style="
            currentSelectedTempScale === scale.id ? 'pointer-events: none' : ''
          "
          @click="selectTempScale"
        >
          <div class="scale-header">
            <div class="placeholder">
              {{ scale.id }}
            </div>
            <label class="icon-container">
              <v-icon class="icon">mdi-weight</v-icon>
            </label>
          </div>
          <div class="scale-value">
            <span class="value">{{ scale.weight }}</span>
            <span class="placeholder">{{ `kg (${scale.id})` }}</span>
          </div>
        </div>
      </div>
      <div v-if="!tempScales.length" class="no-scales" @click="refreshSocket">
        <div class="placeholder">
          Tidak ada timbangan terdeteksi
        </div>
        <div class="icon-container">
          <v-icon class="icon">
            mdi-alert
          </v-icon>
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
      init: true,
      errorMessage: '',
      tempScales: [],
      scales: [],
      loading: false,
      currentSelectedTempScale: '',
      currentSelectedScale: '',
      currentSelectedColor: '',
      scalesPair: [],
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
  },
  watch: {
    tempScalesRoot: {
      handler(val) {
        if (val)
          this.tempScales = val.map((a) => ({
            ...a,
            weight: 0,
          }))
      },
      immediate: true,
    },
    scalesRoot: {
      handler(val) {
        if (val && this.init) {
          this.scales = val.map((a) => ({
            ...a,
            name: a.name || '',
            weight: a.weight || 0,
          }))
          this.init = false
        }
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
      const index = this.tempScales.findIndex((a) => a.id === data.id)
      if (index > -1) this.tempScales[index].weight = data.weight
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
        const scales = this.scalesPair.map((a) => {
          const scale = this.scales.find((b) => b.id === a.oldId)
          return {
            name: scale.name,
            weight: scale.weight,
            material: scale.material,
            id: a.newId,
          }
        })
        this.$store.dispatch('scales/synsScalesData', scales)
        this.$store.dispatch('scales/setScales', scales)
        setTimeout(() => {
          this.$store.dispatch('scales/setTempScales')
        }, 500)
        this.exit()
      } catch (e) {
        this.errorMessage = e.message
        this.$root.$emit('shake')
      }
    },
    changeVal({ val, input }) {
      input.model = val
    },
    randomizeColor() {
      return `rgba(${Math.round(Math.random() * 255)}, ${Math.round(
        Math.random() * 255
      )}, ${Math.round(Math.random() * 255)}, ${Math.random() * 0.75 + 0.25})`
    },
    selectScale({ target }) {
      const id = target.getAttribute('data-id')
      const index = this.scalesPair.findIndex((a) => a.oldId === id)
      if (index > -1) {
        const { newId, oldId } = this.scalesPair[index]
        const oldScaleEl = this.$refs.scales.querySelector(`[data-id=${oldId}]`)
        const newScaleEl = this.$refs.tempScales.querySelector(
          `[data-id=${newId}]`
        )
        gsap.to([oldScaleEl, newScaleEl], {
          borderColor: 'rgba(127, 127, 127, 0.15)',
          duration: 0,
        })
        this.scalesPair.splice(index, 1)
      }
      if (this.currentSelectedTempScale) {
        this.scalesPair.push({
          oldId: id,
          newId: this.currentSelectedTempScale,
          color: this.currentSelectedColor,
        })
        gsap.to(target, {
          borderColor: this.currentSelectedColor,
          duration: 0,
        })
        this.currentSelectedTempScale = ''
        this.currentSelectedScale = ''
        this.currentSelectedColor = ''
      } else {
        this.currentSelectedScale = id
        this.currentSelectedColor = this.randomizeColor()
        gsap.to(target, {
          borderColor: this.currentSelectedColor,
          duration: 0,
        })
      }
    },
    selectTempScale({ target }) {
      const id = target.getAttribute('data-id')
      const index = this.scalesPair.findIndex((a) => a.newId === id)
      if (index > -1) {
        const { newId, oldId } = this.scalesPair[index]
        const oldScaleEl = this.$refs.scales.querySelector(`[data-id=${oldId}]`)
        const newScaleEl = this.$refs.tempScales.querySelector(
          `[data-id=${newId}]`
        )
        gsap.to([oldScaleEl, newScaleEl], {
          borderColor: 'rgba(127, 127, 127, 0.15)',
          duration: 0,
        })
        this.scalesPair.splice(index, 1)
      }
      gsap.to(target, {
        borderColor: this.currentSelectedColor,
        duration: 0,
      })
      if (this.currentSelectedScale) {
        this.scalesPair.push({
          oldId: this.currentSelectedScale,
          newId: id,
          color: this.currentSelectedColor,
        })
        gsap.to(target, {
          borderColor: this.currentSelectedColor,
          duration: 0,
        })
        this.currentSelectedTempScale = ''
        this.currentSelectedScale = ''
        this.currentSelectedColor = ''
      } else {
        this.currentSelectedTempScale = id
        this.currentSelectedColor = this.randomizeColor()
        gsap.to(target, {
          borderColor: this.currentSelectedColor,
          duration: 0,
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
      margin-top: -1rem;
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
      cursor: pointer;
      position: relative;
      width: 100%;
      padding: 0.75rem;
      border: 2px solid $border-color;
      border-radius: 0.75rem;
      margin-bottom: 0.5rem;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-start;
      * {
        pointer-events: none;
      }
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
      &.disabled {
        pointer-events: none;
        opacity: 0.25;
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
