<template>
  <div class="component">
    <div class="header">
      <div class="placeholder">
        {{ scale.name }}
      </div>
      <div class="icon-container">
        <v-icon class="icon">
          mdi-history
        </v-icon>
      </div>
    </div>
    <div
      v-if="data[0]"
      v-ripple
      class="body"
      @click="openAddScalePanel(data[0])"
    >
      <div class="scale before">
        <span class="txt">Sebelum</span>
        <div class="count">
          <span class="value">{{
            Math.round(data[0].total_weight - data[0].diff_weight).toLocaleString('de-DE')
          }}</span>
          <span class="placeholder">kg</span>
        </div>
      </div>
      <div class="icon-container">
        <v-icon class="icon">
          mdi-swap-horizontal
        </v-icon>
      </div>
      <div class="scale after">
        <span class="txt">Sesudah</span>
        <div class="count">
          <span class="value">{{ data[0].total_weight }}</span>
          <span class="placeholder">kg</span>
        </div>
      </div>
      <div class="tooltip">
        <div class="placeholder">
          Selisih
        </div>
        <div class="value">
          {{ `${Math.round(data[0].diff_weight).toLocaleString('de-DE')} kg` }}
        </div>
      </div>
    </div>
    <div v-else class="body">
      <div class="placeholder">
        Tidak ada data
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    scale: {
      type: Object,
      required: true,
    },
    data: {
      type: Array,
      required: true,
    },
  },

  methods: {
    openAddScalePanel(data) {
      this.$emit('add-data', {
        name: this.scale.name,
        id: this.scale.id,
        material: this.scale.material,
        diff_weight: data.diff_weight,
        total_weight: data.total_weight,
        date: data.date,
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.component {
  position: relative;
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.75rem;
  margin-bottom: 0.5rem;
  border: 1px solid $border-color;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  > .header {
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
  > .body {
    cursor: pointer;
    position: relative;
    width: 100%;
    height: 4rem;
    margin-top: 0.8rem;
    border-radius: 0.5rem;
    border: 1px solid $border-color;
    padding: 0 0.75rem;
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .scale {
      position: relative;
      width: calc(50% - 0.75rem);
      height: 100%;
      box-sizing: border-box;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      display: flex;
      span.txt {
        font-family: 'Quicksand';
        font-size: 0.55rem;
        font-weight: 600;
        margin-bottom: 0.25rem;
      }
      .count {
        position: relative;
        cursor: pointer;
        display: flex;
        overflow: hidden;
        justify-content: flex-start;
        align-items: flex-end;
        span.value {
          position: relative;
          font-family: 'Consolas', 'Azeret Mono', monospace;
          font-size: 1.2rem;
          font-weight: 700;
          line-height: 1;
        }
        span.placeholder {
          position: relative;
          width: auto;
          height: auto;
          margin-left: 0.25rem;
          margin-bottom: 0.125rem;
          font-family: 'Quicksand';
          font-size: 0.55rem;
          font-weight: 600;
          line-height: 1;
          color: $subtext-color;
        }
      }
      &.before {
        &:hover {
          .date-before {
            opacity: 1;
          }
        }
      }
      &.after {
        align-items: flex-end;
        &:hover {
          .date-after {
            opacity: 1;
          }
        }
      }
    }
    .icon-container {
      position: relative;
      width: 1.5rem;
      height: 1.5rem;
      border-radius: 0.75rem;
      background: $background-secondary-color;
      display: flex;
      justify-content: center;
      align-items: center;
      .icon {
        font-size: 0.6rem;
      }
    }
    .placeholder {
      cursor: default;
      position: relative;
      width: 100%;
      height: 100%;
      text-align: center;
      font-size: 0.65rem;
      font-family: 'Quicksand';
      font-weight: 500;
      color: $subtext-color;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .tooltip {
      z-index: 10;
      pointer-events: none;
      position: absolute;
      top: calc(100% + 5px);
      left: 50%;
      padding: 0.25rem 0.375rem;
      border-radius: 0.5rem;
      background: $text-color;
      transform: scale(0.75) translateX(-50%);
      opacity: 0;
      transition: 0.2s transform, 0.2s opacity;
      transform-origin: 0% 0%;
      display: flex;
      align-items: center;
      .placeholder {
        position: relative;
        height: auto;
        width: auto;
        text-transform: capitalize;
        white-space: nowrap;
        font-size: 0.55rem;
        font-family: 'Quicksand';
        font-weight: 400;
        line-height: 1;
        color: $background-secondary-color;
      }
      .value {
        position: relative;
        font-family: 'Consolas', 'Azeret Mono', monospace;
        font-size: 0.55rem;
        font-weight: 600;
        line-height: 1;
        margin-left: 0.25rem;
        white-space: nowrap;
        color: $background-color;
      }
      &::after {
        content: '';
        position: absolute;
        bottom: 100%;
        left: 50%;
        margin-left: -5px;
        border-width: 5px;
        border-style: solid;
        border-color: transparent transparent $text-color transparent;
      }
    }
    &:hover {
      .tooltip {
        opacity: 1;
        transform: scale(1) translateX(-50%);
      }
    }
  }
}
</style>
