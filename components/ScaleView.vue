<template>
  <div class="scales-wrapper">
    <div v-if="!scales.length || scaleNotConfigured" class="no-scales">
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
    <div v-for="(scale, i) in scales" :key="i" class="scale-field">
      <div class="scale-header">
        <div class="placeholder">
          {{ scale.name || scale.path }}
        </div>
        <div class="icon-container">
          <v-icon class="icon">
            mdi-weight
          </v-icon>
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
  },
  watch: {
    scalesRoot: {
      handler(val) {
        if (!this.scaleNotConfigured && this.tempScalesRoot === null)
          this.scales = val.map((a) => ({
            ...a,
            weight: a.weight || 0,
          }))
      },
      immediate: true,
    },
  },
  mounted() {
    this.$root.$on('weight-update', (data) => {
      const index = this.scales.findIndex((a) => a.id === data.id)
      if (index > -1) this.scales[index].weight = data.weight
    })
  },
}
</script>

<style lang="scss" scoped>
.scales-wrapper {
  z-index: 0;
  position: relative;
  width: 40%;
  margin-right: 1rem;
  margin-bottom: 0.5rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
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
  }
}
</style>
