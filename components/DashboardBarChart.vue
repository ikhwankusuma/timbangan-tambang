<template>
  <div class="cases-last-six-month">
    <div class="header">
      <div class="placeholder">
        {{ minimized ? data.minimized : data.name }}
      </div>
      <div class="icon-container">
        <v-icon class="icon"> mdi-chart-line-variant </v-icon>
      </div>
    </div>
    <div class="body">
      <div class="count">
        <span class="value">{{ totalCount.toFixed(2) }}</span>
        <span class="placeholder">kg</span>
      </div>
      <div v-if="!minimized" class="chart">
        <div v-for="n in 6" :key="n" class="bar-container">
          <div class="bar">
            <div
              class="filled"
              :style="`height: ${
                data.data[6 - n]
                  ? (data.data[6 - n].count / totalCount) * 100
                  : 0
              }%`"
            />
            <div class="tooltip">
              <div class="placeholder">
                {{
                  `${(
                    months[new Date().getMonth() - 6 + n] ||
                    months[10 - new Date().getMonth() + n]
                  ).slice(0, 3)}`
                }}
              </div>
              <div class="value">
                {{
                  `${
                    data.data[6 - n] ? Math.ceil(data.data[6 - n].count) : 0
                  } kg`
                }}
              </div>
            </div>
          </div>
          <div class="placeholder">
            {{
              (
                months[new Date().getMonth() - 6 + n] ||
                months[10 - new Date().getMonth() + n]
              ).slice(0, 3)
            }}
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
    minimized: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      months: [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember",
      ],
    };
  },
  computed: {
    totalCount() {
      return this.data.data.length
        ? this.data.data.reduce((a, b) => a + b.count, 0)
        : 0;
    },
  },
};
</script>

<style lang="scss" scoped>
.cases-last-six-month {
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
    .chart {
      position: relative;
      width: 100%;
      height: 10rem;
      margin-top: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      .bar-container {
        position: relative;
        width: 12.5%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        align-items: center;
        .bar {
          position: relative;
          width: 100%;
          height: calc(100% - 1.25rem);
          border-radius: 0.5rem;
          margin-bottom: 0.25rem;
          background: $background-secondary-color;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          align-items: center;
          .filled {
            position: relative;
            width: 100%;
            border-radius: 0.5rem;
            box-sizing: border-box;
            background: $primary-color;
          }
          .tooltip {
            z-index: 10;
            pointer-events: none;
            position: absolute;
            top: calc(100% + 5px);
            height: 1rem;
            padding: 0 0.375rem;
            border-radius: 0.5rem;
            background: $text-color;
            transform: scale(0.75);
            opacity: 0;
            transition: 0.2s transform, 0.2s opacity;
            display: flex;
            align-items: center;
            .placeholder {
              position: relative;
              height: 1rem;
              text-transform: capitalize;
              white-space: nowrap;
              font-size: 0.55rem;
              font-family: "Consolas", "Azeret Mono", monospace;
              font-weight: 400;
              line-height: 1.25;
              color: $background-secondary-color;
              display: flex;
              justify-content: center;
              align-items: center;
            }
            .value {
              position: relative;
              height: 1rem;
              font-family: "Consolas", "Azeret Mono", monospace;
              font-size: 0.55rem;
              font-weight: 600;
              line-height: 1.25;
              margin-left: 0.375rem;
              color: $background-color;
              white-space: nowrap;
              display: flex;
              justify-content: center;
              align-items: center;
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
        }
        .placeholder {
          position: relative;
          width: 100%;
          height: 1rem;
          text-transform: uppercase;
          font-size: 0.55rem;
          font-family: "Quicksand";
          font-weight: 400;
          line-height: 1;
          display: flex;
          justify-content: center;
          align-items: flex-end;
        }
      }
    }
  }
}
</style>
