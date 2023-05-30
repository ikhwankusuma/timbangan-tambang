<template>
  <div class="cases-breakdown">
    <div class="header">
      <div class="placeholder">
        {{ data.name }}
      </div>
      <div class="icon-container">
        <v-icon class="icon">
          mdi-chart-line-variant
        </v-icon>
      </div>
    </div>
    <div class="body">
      <div class="count">
        <span class="value">{{ totalCount.toFixed(2) }}</span>
        <span class="placeholder">kg</span>
      </div>
      <div v-if="data && data.data && data.data.length" class="bar-container">
        <div
          v-for="item in items"
          :key="item._id"
          class="bar"
          :style="`background: ${item.color}; width: ${
            (item.count / totalCount) * 100
          }%`"
        >
          <div class="tooltip">
            <div class="placeholder">
              {{ item._id }}
            </div>
            <div class="value">
              {{ `${item.count.toLocaleString("de-DE")} kg` }}
            </div>
          </div>
        </div>
      </div>
      <div v-if="data && data.data && data.data.length" class="breakdown">
        <div v-for="item in items" :key="item._id" class="item">
          <div class="name-container">
            <div class="color" :style="`background: ${item.color}`" />
            <div class="name">
              {{ item._id }}
            </div>
          </div>
          <div class="total-count">
            {{ `${item.count.toLocaleString("de-DE")} kg` }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      items: [],
    };
  },
  computed: {
    totalCount() {
      return this.data.data.length
        ? this.data.data.reduce((a, b) => a + b.count, 0)
        : 0;
    },
  },
  watch: {
    data: {
      handler(val) {
        if (val.data && val.data.length)
          this.items = val.data.map((a) => ({
            ...a,
            color: this.randomizeColor(),
          }));
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    randomizeColor() {
      return `rgba(${Math.round(Math.random() * 255)}, ${Math.round(
        Math.random() * 255
      )}, ${Math.round(Math.random() * 255)}, 1)`;
    },
  },
};
</script>

<style lang="scss" scoped>
.cases-breakdown {
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
      font-family: "Quicksand";
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
    position: relative;
    width: 100%;
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    .count {
      position: relative;
      display: flex;
      justify-content: flex-start;
      align-items: flex-end;
      span.value {
        position: relative;
        font-family: "Consolas", "Azeret Mono", monospace;
        font-size: 1.25rem;
        font-weight: 700;
        line-height: 1;
      }
      span.placeholder {
        position: relative;
        margin-left: 0.25rem;
        margin-bottom: 0.125rem;
        font-family: "Quicksand";
        font-size: 0.55rem;
        font-weight: 600;
        line-height: 1;
        color: $subtext-color;
      }
    }
    .bar-container {
      position: relative;
      width: 100%;
      height: 0.25rem;
      margin: 0.5rem 0;
      border-radius: 0.125rem;
      background: $background-secondary-color;
      display: flex;
      justify-content: flex-start;
      align-items: flex-start;
      .bar {
        position: relative;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        .tooltip {
          z-index: 10;
          pointer-events: none;
          position: absolute;
          top: calc(100% + 5px);
          padding: 0.25rem 0.375rem;
          border-radius: 0.5rem;
          background: $text-color;
          transform: scale(0.75);
          opacity: 0;
          transition: 0.2s transform, 0.2s opacity;
          display: flex;
          align-items: center;
          .placeholder {
            position: relative;
            height: auto;
            width: auto;
            text-transform: capitalize;
            white-space: nowrap;
            font-size: 0.55rem;
            font-family: "Quicksand";
            font-weight: 400;
            line-height: 1;
            color: $background-secondary-color;
          }
          .value {
            position: relative;
            font-family: "Consolas", "Azeret Mono", monospace;
            font-size: 0.55rem;
            font-weight: 600;
            line-height: 1;
            margin-left: 0.25rem;
            white-space: nowrap;
            color: $background-color;
          }
          &::after {
            content: "";
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
            transform: scale(1);
          }
        }
        &:first-child {
          border-top-left-radius: 0.125rem;
          border-bottom-left-radius: 0.125rem;
        }
        &:last-child {
          border-top-right-radius: 0.125rem;
          border-bottom-right-radius: 0.125rem;
        }
      }
    }
    .breakdown {
      position: relative;
      width: 100%;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-start;
      .item {
        position: relative;
        width: 100%;
        height: 1.5rem;
        margin-bottom: 0.5rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .name-container {
          position: relative;
          height: 100%;
          display: flex;
          justify-content: flex-start;
          align-items: center;
          .color {
            position: relative;
            width: 1rem;
            height: 1rem;
            margin-right: 0.5rem;
            border-radius: 0.25rem;
            background: brown;
          }
          .name {
            position: relative;
            font-family: "Consolas", "Azeret Mono", monospace;
            font-size: 0.6rem;
            font-weight: 600;
            line-height: 1;
            color: $text-color;
          }
        }
        .total-count {
          position: relative;
          font-family: "Consolas", "Azeret Mono", monospace;
          font-size: 0.6rem;
          font-weight: 600;
          line-height: 1;
          color: $text-color;
        }
        &:last-child {
          margin: 0;
        }
      }
    }
  }
}
</style>
