<template>
  <div ref="component" class="component">
    <div class="wrapper">
      <div class="header">
        <div class="action">
          <round-button :icon="'mdi-close'" @clicked="exit" />
          <round-button
            :icon="'mdi-ticket-confirmation-outline'"
            @clicked="printReceipt"
          />
          <round-button
            v-if="config && config.plugins.includes(0)"
            :icon="'mdi-printer-outline'"
            @clicked="printInvoice"
          />
        </div>
        <div class="main-information">
          <div class="page-title">
            {{ `Data #${data.record}` }}
          </div>
          <div
            v-if="(data.entry_weight && data.exit_weight) || data.weight"
            :class="data.type"
            class="data-type"
          >
            Selesai
          </div>
          <div
            v-else-if="data.entry_weight"
            :class="data.type"
            class="data-type"
          >
            Timbang Masuk
          </div>
        </div>
      </div>
      <div class="scale-field">
        <div class="scale-header">
          <div class="placeholder">Hasil timbang</div>
          <div class="icon-container">
            <v-icon class="icon"> mdi-weight </v-icon>
          </div>
        </div>
        <div class="scale-value">
          <div v-if="config && config.type === 1" class="prev-value-container">
            <div class="name">Berat Bersih</div>
            <div class="value-container">
              <span class="value">{{
                data.exit_weight && data.entry_weight
                  ? `${Math.abs(data.exit_weight - data.entry_weight)
                      .toLocaleString()
                      .split(",")
                      .join(".")}`
                  : "-"
              }}</span>
              <span class="placeholder">kg</span>
            </div>
          </div>
          <div
            v-else-if="config && config.type === 2"
            class="prev-value-container"
          >
            <div class="name">Berat</div>
            <div class="value-container">
              <span class="value">{{ data.weight }}</span>
              <span class="placeholder">kg</span>
            </div>
          </div>
        </div>
      </div>
      <div class="details">
        <div class="detail">
          <div class="placeholder">
            {{
              config && config.type === 1 ? "Tanggal Masuk" : "Tanggal Timbang"
            }}
          </div>
          <div class="value">
            {{ formatDate(data.entry_date) }}
          </div>
        </div>
        <div class="detail">
          <div class="placeholder">
            {{ config && config.type === 1 ? "Waktu Masuk" : "Waktu Timbang" }}
          </div>
          <div class="value">
            {{ formatHours(data.entry_date) }}
          </div>
        </div>
      </div>
      <div v-if="config && config.type === 1" class="details">
        <div class="detail">
          <div class="placeholder">Tanggal Keluar</div>
          <div class="value">
            {{ formatDate(data.exit_date) }}
          </div>
        </div>
        <div class="detail">
          <div class="placeholder">Waktu Keluar</div>
          <div class="value">
            {{ formatHours(data.exit_date) }}
          </div>
        </div>
      </div>
      <div class="details">
        <div class="detail">
          <div class="placeholder">Nomor polisi</div>
          <div class="value">
            {{ data.license }}
          </div>
        </div>
        <div class="detail">
          <div class="placeholder">Penimbang</div>
          <div class="value">
            {{ data.operator }}
          </div>
        </div>
      </div>
      <div class="details">
        <div v-if="data.material" class="detail">
          <div class="placeholder">Material</div>
          <div class="value">
            {{ data.material }}
          </div>
        </div>
        <div v-if="data.customer || data.supplier" class="detail">
          <div class="placeholder">
            {{ data.customer ? "Customer" : "Supplier" }}
          </div>
          <div class="value">
            {{ data.customer || data.supplier }}
          </div>
        </div>
      </div>
      <div v-if="config.plugins.includes(3)" class="details">
        <div class="detail">
          <div class="placeholder">Tipe Kendaraan</div>
          <div class="value">
            {{ types[data.type] }}
          </div>
        </div>
      </div>
      <div
        v-if="data.notes"
        class="detail"
        style="margin-top: 1rem; width: 100%"
      >
        <div class="placeholder">Catatan</div>
        <div class="value">
          {{ data.notes }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import gsap from "gsap";

/* eslint-disable */
const animate = {
  init(component, cb, reverseCb) {
    const tl = gsap.timeline({
      onComplete() {
        if (cb) cb();
      },
      onReverseComplete() {
        if (reverseCb) reverseCb();
      },
    });

    const wrapper = component.children;

    tl.from(wrapper, {
      x: "100%",
      duration: 0.5,
      ease: "power2.inOut",
    });

    return tl;
  },
};
/* eslint-enable */

export default {
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      types: ["Truk Besar", "Truk Kecil"],
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
    config() {
      return this.$store.getters.config;
    },
  },
  mounted() {
    const {
      $refs: { component },
    } = this;
    this.anim = animate.init(component, null, () => {
      this.$emit("exit");
    });
  },
  methods: {
    exit() {
      this.$root.$emit("close-cameras");
      this.anim.reverse();
    },
    formatDate(x) {
      const dateObj = new Date(x);
      const date = dateObj.getDate();
      const month = dateObj.getMonth();
      const year = dateObj.getFullYear();
      return `${date} ${this.months[month].slice(0, 3)} ${year}`;
    },
    formatHours(x) {
      const dateObj = new Date(x);
      const time = `${
        dateObj.getHours() > 9 ? dateObj.getHours() : `0${dateObj.getHours()}`
      }:${
        dateObj.getMinutes() > 9
          ? dateObj.getMinutes()
          : `0${dateObj.getMinutes()}`
      }`;
      return time;
    },
    printInvoice() {
      this.$root.$emit("print-invoice", this.data);
    },
    printReceipt() {
      this.$root.$emit("print-receipt", this.data);
    },
  },
};
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
          font-family: "Consolas", "Azeret Mono", monospace;
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
          font-family: "Quicksand", sans-serif;
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
    .scale-field {
      position: relative;
      width: 100%;
      padding: 0.75rem;
      border: 1px solid $border-color;
      border-radius: 0.75rem;
      margin-bottom: 1rem;
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
      > .scale-value {
        position: relative;
        width: 100%;
        margin: 1rem 0 0 0;
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        .prev-value-container,
        .then-value-container {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          align-items: flex-start;
          .name {
            position: relative;
            font-family: "Quicksand";
            font-size: 0.6rem;
            font-weight: 400;
            margin-bottom: 0.25rem;
            color: $subtext-color;
          }
          .value-container {
            position: relative;
            display: flex;
            justify-content: flex-start;
            align-items: flex-end;
          }
        }
        .then-value-container {
          align-items: flex-end;
          .value-container {
            justify-content: flex-end;
          }
        }
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
      > .nett-value-container {
        position: relative;
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        align-items: center;
        .value-container {
          position: relative;
          padding: 0.5rem;
          border-radius: 0.5rem;
          border: 1px solid $primary-color;
          background: $primary-color;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          align-items: center;
          span.value {
            position: relative;
            font-family: "Consolas", "Azeret Mono", monospace;
            font-size: 1.25rem;
            font-weight: 700;
            line-height: 1;
            text-align: center;
            color: #fff;
          }
          span.placeholder {
            position: relative;
            margin-top: 0.25rem;
            font-family: "Quicksand";
            font-size: 0.55rem;
            font-weight: 600;
            line-height: 1;
            text-align: center;
            color: #fff;
          }
        }
        &::before {
          content: "";
          position: absolute;
          top: calc(50% - 0.5px);
          left: 0;
          width: 100%;
          height: 1px;
          background: $border-color;
        }
      }
    }
    .details {
      position: relative;
      width: 100%;
      margin-top: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      .detail:nth-child(2) {
        align-items: flex-end;
        .placeholder,
        .value {
          text-align: right;
        }
      }
    }
    .detail {
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: flex-start;
      .placeholder {
        position: relative;
        font-family: "Quicksand";
        font-size: 0.6rem;
        font-weight: 400;
        color: $subtext-color;
      }
      .value {
        position: relative;
        margin-top: 0.125rem;
        font-family: "Consolas", "Azeret Mono", monospace;
        font-size: 0.75rem;
        font-weight: 600;
        color: $text-color;
      }
      .values {
        position: relative;
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        .value {
          position: relative;
          width: 100%;
          margin-bottom: 0.125rem;
          display: flex;
          justify-content: flex-start;
          align-items: flex-start;
          .number,
          .name {
            position: relative;
            font-family: "Consolas", "Azeret Mono", monospace;
            font-size: 0.75rem;
            font-weight: 600;
            color: $text-color;
          }
          .name {
            margin-left: 0.25rem;
          }
          &:last-child {
            margin-bottom: 0;
          }
        }
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
