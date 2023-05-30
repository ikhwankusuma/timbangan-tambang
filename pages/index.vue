<template>
  <div class="index-container">
    <div class="header">
      <div class="search-field">
        <text-input :input="searchInput" @changed="changeVal" />
      </div>
      <div v-if="modeState === 'desktop'" class="filter-field">
        <selection-input
          v-if="config && config.plugins && config.plugins.includes(3)"
          :input="typeInput"
          style="width: 10rem; margin-right: 0.5rem"
          @changed="changeVal"
        />
        <date-input
          :input="startDateInput"
          style="width: 10rem; margin-right: 0.5rem"
          @changed="changeVal"
        />
        <date-input
          :input="endDateInput"
          style="width: 10rem"
          @changed="changeVal"
        />
      </div>
      <div :class="loading ? 'loading' : ''" class="border-bottom">
        <div class="bar" />
        <div class="bar" />
      </div>
    </div>
    <div class="body">
      <div class="table-body">
        <div v-for="data in datas" :key="data.record" class="scale">
          <div class="details">
            <div class="main-details">
              <div class="data" style="width: 10%">
                <div class="placeholder">Record</div>
                <div class="value">
                  {{ data.record }}
                </div>
              </div>
              <div class="data customer" style="width: 15%">
                <div class="placeholder">
                  {{ data.customer ? "Customer" : "Supplier" }}
                </div>
                <div class="value">
                  {{ data.customer || data.supplier }}
                </div>
              </div>
              <div class="data customer" style="width: 15%">
                <div class="placeholder">Nomor kendaraan</div>
                <div class="value">
                  {{ data.license }}
                </div>
              </div>
              <div class="data date" style="width: 15%">
                <div class="placeholder">
                  Tanggal
                  {{ config && config.type === 1 ? "Keluar" : "Timbang" }}
                </div>
                <div class="value">
                  {{ formatDate(data.entry_date) }}
                </div>
              </div>
              <div
                v-if="config && config.type === 2"
                class="data date"
                style="width: 15%"
              >
                <div class="placeholder">Timbang</div>
                <div class="value">{{ data.weight }} Kg</div>
              </div>
              <div
                v-if="config && config.type === 1"
                class="status-action"
                style="width: 15%"
              >
                <div class="status">
                  {{ data.exit_weight ? "selesai" : "di dalam" }}
                </div>
                <div
                  v-if="data.exit_weight"
                  v-ripple
                  class="action"
                  @click="$root.$emit('view-data', data)"
                >
                  <div class="tooltip">
                    <div class="placeholder">Lihat data</div>
                  </div>
                  <v-icon class="icon"> mdi-eye-outline </v-icon>
                </div>
                <div
                  v-ripple
                  class="action"
                  @click="$root.$emit('edit-data', data)"
                >
                  <div class="tooltip">
                    <div class="placeholder">Ubah data</div>
                  </div>
                  <v-icon class="icon"> mdi-pencil-outline </v-icon>
                </div>
              </div>
              <div
                v-else-if="config && config.type === 2"
                class="status-action"
                style="width: 15%"
              >
                <div
                  v-if="modeState === 'desktop'"
                  v-ripple
                  class="action"
                  @click="$root.$emit('view-data', data)"
                >
                  <v-icon class="icon"> mdi-eye-outline </v-icon>
                </div>
              </div>
            </div>
          </div>
          <div v-if="config && config.type === 1" class="weights">
            <div class="entry" style="width: 15%">
              <div class="placeholder">Masuk</div>
              <div class="value">
                {{
                  data.entry_weight
                    ? `${data.entry_weight
                        .toLocaleString()
                        .split(",")
                        .join(".")} Kg`
                    : "-"
                }}
              </div>
            </div>
            <div class="exit" style="width: 15%">
              <div class="placeholder">Keluar</div>
              <div class="value">
                {{
                  data.exit_weight
                    ? `${data.exit_weight
                        .toLocaleString()
                        .split(",")
                        .join(".")} Kg`
                    : "-"
                }}
              </div>
            </div>
            <div class="netto" style="width: 15%">
              <div class="placeholder">Bersih</div>
              <div class="value">
                {{
                  data.exit_weight && data.entry_weight
                    ? `${Math.abs(data.exit_weight - data.entry_weight)
                        .toLocaleString()
                        .split(",")
                        .join(".")} Kg`
                    : "-"
                }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-intersect="loadMoreData" class="end-list">
        <div v-if="limit" class="limit">Akhir dari daftar</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      searchInput: {
        placeholder: "Cari data...",
        icon: "mdi-magnify",
        model: "",
      },
      typeInput: {
        placeholder: "Tipe kendaraan",
        icon: "mdi-scatter-plot-outline",
        model: "",
        selection: ["Truk Besar", "Truk Kecil"],
      },
      startDateInput: {
        placeholder: "Mulai dari...",
        icon: "mdi-calendar-outline",
        model: "",
        allowYesterday: true,
      },
      endDateInput: {
        placeholder: "Sampai dengan...",
        icon: "mdi-calendar",
        model: "",
        allowYesterday: true,
      },
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
      searchTimeout: null,
      loading: false,
    };
  },
  computed: {
    modeState() {
      return this.$store.getters.mode;
    },
    scales() {
      return this.$store.getters["scales/scales"];
    },
    datas() {
      return this.$store.getters["scales/datas"];
    },
    customers() {
      return this.$store.getters["scales/customers"];
    },
    suppliers() {
      return this.$store.getters["scales/suppliers"];
    },
    limit() {
      return this.$store.getters["scales/limit"];
    },
    config() {
      return this.$store.getters.config;
    },
    query() {
      return this.searchInput.model;
    },
    type() {
      return this.typeInput.model;
    },
    startDate() {
      const [d, m, y] = this.startDateInput.model.split("-");
      return d && m && y ? new Date(y, m - 1, d).valueOf() : "";
    },
    endDate() {
      const [d, m, y] = this.endDateInput.model.split("-");
      return d && m && y ? new Date(y, m - 1, d).valueOf() : "";
    },
  },
  watch: {
    query(val) {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(async () => {
        this.changeSkip(0);
        this.$store.dispatch("scales/setQueries", { query: val });
        this.loading = true;
        await this.$store.dispatch("scales/load");
        await this.$store.dispatch("scales/loadSummary");
        this.loading = false;
      }, 500);
    },
    async type(val) {
      this.changeSkip(0);
      this.$store.dispatch("scales/setQueries", {
        type: this.typeInput.selection.indexOf(val),
      });
      this.loading = true;
      await this.$store.dispatch("scales/load");
      await this.$store.dispatch("scales/loadSummary");
      this.loading = false;
    },
    async startDate(val) {
      this.changeSkip(0);
      this.$store.dispatch("scales/setQueries", { startDate: val });
      this.loading = true;
      await this.$store.dispatch("scales/load");
      await this.$store.dispatch("scales/loadSummary");
      this.loading = false;
    },
    async endDate(val) {
      this.changeSkip(0);
      this.$store.dispatch("scales/setQueries", { endDate: val });
      this.loading = true;
      await this.$store.dispatch("scales/load");
      await this.$store.dispatch("scales/loadSummary");
      this.loading = false;
    },
  },
  methods: {
    changeVal({ val, input }) {
      input.model = val;
    },
    formatDate(x) {
      const dateObj = new Date(x);
      const date = dateObj.getDate();
      const month = dateObj.getMonth();
      const year = dateObj.getFullYear();
      return `${date} ${this.months[month].slice(0, 3)} ${year}`;
    },
    changeSkip(val) {
      this.$store.dispatch("scales/setQueries", { skip: val });
    },
    async loadMoreData([entry]) {
      const { isIntersecting } = entry;
      if (isIntersecting && !this.limit) {
        this.loading = true;
        await this.$store.dispatch("scales/load");
        this.loading = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.index-container {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  * {
    flex-shrink: 0;
  }
  .header {
    position: relative;
    width: 100%;
    height: 3rem;
    padding: 0 2rem 1rem 2rem;
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .search-field {
      position: relative;
      width: 10rem;
      height: 2rem;
      display: flex;
      justify-content: flex-start;
      align-items: center;
    }
    .filter-field {
      z-index: 100000;
      position: relative;
      height: 2rem;
      display: flex;
      justify-content: flex-end;
      align-items: center;
    }
    .border-bottom {
      position: absolute;
      top: 100%;
      left: 0;
      width: 100%;
      height: 1px;
      background: #ececec;
      transition: 0.5s transform, 1s background-color;
      overflow: hidden;
      .bar {
        position: absolute;
        background: #ececec;
        height: 100%;
        transition: inherit;
        &:first-child {
          animation: increase 2s infinite;
        }
        &:last-child {
          animation: decrease 2s 0.5s infinite;
        }
      }
      &.loading {
        transform: scaleY(4);
        background: rgba($primary-color, 0.1);
        // transition: 0.25s transform, 0.25s background-color;
        .bar {
          transform: scaleY(4);
          background: $primary-color;
        }
      }
    }
  }
  .body {
    position: relative;
    width: 100%;
    height: calc(100vh - 7.5rem);
    padding: 1rem 2rem 0 2rem;
    box-sizing: border-box;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    .table-body {
      position: relative;
      width: 100%;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-start;
      .scale {
        position: relative;
        width: 100%;
        margin-bottom: 0.75rem;
        border: 1px solid $border-color;
        border-radius: 0.5rem;
        padding: 0.75rem;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        .details {
          position: relative;
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          .main-details,
          .secondary-details {
            position: relative;
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            .data {
              position: relative;
              width: 50%;
              height: 100%;
              padding: 0.125rem 0;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              justify-content: flex-start;
              align-items: flex-start;
              .placeholder {
                position: relative;
                font-family: "Quicksand";
                font-size: 0.6rem;
                font-weight: 400;
                text-align: right;
                line-height: 1;
                color: $subtext-color;
              }
              .value {
                position: relative;
                width: 100%;
                font-family: "Consolas", "Azeret Mono", monospace;
                font-size: 0.75rem;
                font-weight: 600;
                margin-top: 0.25rem;
                line-height: 1;
                color: $text-color;
                text-overflow: ellipsis;
                overflow: hidden;
              }
            }
            .status-action {
              width: 20%;
              height: 100%;
              display: flex;
              justify-content: flex-end;
              align-items: center;
              .status {
                position: relative;
                height: 2rem;
                padding: 0 0.5rem;
                border-radius: 0.5rem;
                background: rgba($primary-color, 0.1);
                // margin-right: 0.75rem;
                font-family: "Consolas", "Azeret Mono", monospace;
                font-size: 0.65rem;
                font-weight: 600;
                line-height: 1;
                white-space: nowrap;
                color: $primary-color;
                display: flex;
                justify-content: center;
                align-items: center;
              }
              .action {
                cursor: pointer;
                position: relative;
                width: 2rem;
                height: 2rem;
                margin-left: 0.5rem;
                flex-shrink: 0;
                border-radius: 0.5rem;
                border: 1px solid $border-color;
                display: flex;
                justify-content: center;
                align-items: center;
                .tooltip {
                  z-index: 10;
                  pointer-events: none;
                  position: absolute;
                  top: calc(100% + 5px);
                  height: 1rem;
                  padding: 0.5rem;
                  border-radius: 0.5rem;
                  background: $text-color;
                  transform: scale(0.75);
                  opacity: 0;
                  transition: 0.2s transform, 0.2s opacity;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  .placeholder {
                    position: relative;
                    height: 1rem;
                    text-transform: capitalize;
                    white-space: nowrap;
                    font-size: 0.8rem;
                    font-family: "Consolas", "Azeret Mono", monospace;
                    font-weight: 400;
                    line-height: 1.25;
                    color: $background-secondary-color;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                  }
                }
                &:hover {
                  .tooltip {
                    opacity: 1;
                    transform: scale(1);
                  }
                }
              }
            }
          }
        }
        .weights {
          position: relative;
          width: 100%;
          margin-top: 0.75rem;
          padding: 0.5rem;
          box-sizing: border-box;
          border: 1px solid $border-color;
          border-radius: 0.5rem;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          > * {
            margin-right: 20%;
            position: relative;
            width: 30%;
            height: 100%;
            padding: 0.125rem 0;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            align-items: flex-start;
            .placeholder {
              position: relative;
              font-family: "Quicksand";
              font-size: 0.6rem;
              font-weight: 400;
              text-align: right;
              line-height: 1;
              color: $subtext-color;
            }
            .value {
              position: relative;
              width: 100%;
              font-family: "Consolas", "Azeret Mono", monospace;
              font-size: 0.75rem;
              font-weight: 600;
              margin-top: 0.25rem;
              line-height: 1;
              color: $text-color;
              text-overflow: ellipsis;
              overflow: hidden;
            }
          }
        }
      }
    }
    .end-list {
      position: relative;
      width: 100%;
      height: 2rem;
      margin-bottom: 1rem;
      flex-shrink: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      .limit {
        position: relative;
        font-size: 0.65rem;
        font-family: "Quicksand";
        font-weight: 500;
        color: $subtext-color;
      }
    }
  }
  @keyframes increase {
    from {
      left: -5%;
      width: 5%;
    }
    to {
      left: 130%;
      width: 100%;
    }
  }
  @keyframes decrease {
    from {
      left: -80%;
      width: 80%;
    }
    to {
      left: 110%;
      width: 10%;
    }
  }
  @media only screen and (max-width: 1024px) {
    .header {
      height: auto;
      padding: 0 1rem;
      .search-field {
        width: 100%;
      }
      .border-bottom {
        display: none;
      }
    }
    .body {
      height: auto;
      padding: 0 1rem;
      .table-body {
        .scale {
          padding: 0.75rem 0.75rem 0.625rem 0.75rem;
          .details {
            flex-direction: column;
            .main-details,
            .secondary-details {
              width: 100%;
              flex-wrap: wrap;
              .data {
                width: 50% !important;
                height: auto;
                margin-bottom: 0.125rem;
                flex-shrink: 0;
              }
              .data:nth-child(2n) {
                align-items: flex-end;
                .value {
                  text-align: right;
                }
              }
            }
            .secondary-details {
              margin-top: 0.5rem;
            }
          }
          .weights {
            > * {
              width: calc(100% - 0.75rem);
            }
          }
        }
      }
    }
  }
}
</style>
