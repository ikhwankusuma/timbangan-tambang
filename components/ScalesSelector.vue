<template>
  <div class="scales-wrapper">
    <div v-if="noScales || scaleNotConfigured" class="no-scales">
      <div v-if="scaleNotConfigured" class="placeholder">
        Konfigurasi timbangan diperlukan
      </div>
      <div v-else class="placeholder">
        Tidak ada timbangan terdeteksi
      </div>
      <div class="icon-container">
        <v-icon class="icon">
          mdi-alert
        </v-icon>
      </div>
    </div>
    <div v-if="scales.length && noScales" class="main-information">
      <!-- <div class="page-title">Timbangan Terakhir</div> -->
      <div class="placeholder">
        Timbangan Terakhir
      </div>
    </div>
    <div
      v-for="(scale, i) in scales"
      :key="i"
      v-ripple
      :class="i === activeIndex ? 'active' : ''"
      class="scale-field"
      @click="activeIndex = i"
    >
      <div class="scale-header">
        <div class="placeholder">
          {{ scale.name || scale.path }}
        </div>
      </div>
      <div class="scale-value">
        <span class="value">{{ scale.weight }}</span>
        <span class="placeholder">kg</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      activeIndex: -1,
      scales: [],
    }
  },
  computed: {
    scalesRoot() {
      return this.$store.getters['scales/scales']
    },
    tempScalesRoot() {
      return this.$store.getters['scales/tempScales']
    },
    scaleNotConfigured() {
      return (
        (this.tempScalesRoot && this.tempScalesRoot.length) ||
        !!this.scalesRoot.find((a) => !a.name)
      )
    },
    noScales() {
      return this.tempScalesRoot && !this.tempScalesRoot.length
    },
  },
  watch: {
    scalesRoot: {
      handler(val) {
        // if (!this.scaleNotConfigured && this.tempScalesRoot === null)
        this.scales = val.map((a) => ({
          ...a,
          weight: a.weight || 0,
        }))
      },
      immediate: true,
    },
    activeIndex(val) {
      this.$emit('changed', this.scales[val])
    },
  },
  mounted() {
    this.$root.$on('weight-update', (data) => {
      const index = this.scales.findIndex((a) => a.id === data.id)
      if (index > -1) this.scales[index].weight = data.weight
    })
  },
  methods: {
    getScaleValue() {
      try {
        if (!this.scales.length) throw new Error('NO_SCALES_DETECTED')
        if (this.activeIndex === -1) throw new Error('NO_SCALES_SELECTED')
        return this.scales[this.activeIndex]
      } catch (e) {
        return e.message
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.scales-wrapper {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  .no-scales {
    position: relative;
    width: 100%;
    padding: 0.75rem;
    margin-bottom: 1rem;
    border-radius: 0.75rem;
    border: 2px solid $error-color;
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
  .main-information {
    position: relative;
    width: 100%;
    // margin-bottom: 1rem;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    .page-title {
      position: relative;
      margin: 0.25rem 0;
      font-family: 'Consolas', 'Azeret Mono', monospace;
      font-size: 0.75rem;
      font-weight: 600;
      line-height: 1;
      color: $text-color;
    }
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
    transition: 0.2s border-color;
    > .scale-header {
      position: relative;
      padding: 0;
      width: 100%;
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
      .icon-container {
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
    &.active {
      border-color: $primary-color;
      .icon {
        color: $primary-color;
      }
    }
  }
}
</style>
