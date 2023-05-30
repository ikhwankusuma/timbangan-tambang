<template>
  <div class="invoice-container">
    <div class="row-one">
      <div class="col-third">
        <h1 class="name">{{ config.name }}</h1>
        <p class="address">{{ config.address }}</p>
      </div>
      <div class="col-third">
        <h1 class="name">SURAT JALAN</h1>
        <h2 class="name">PENGANTAR ANGKUTAN</h2>
        <h3 class="name">{{ data ? data.material.toUpperCase() : "" }}</h3>
      </div>
      <div class="col-third">
        <div class="top">
          <span class="placeholder">No. Record</span>
          <h3 class="value">{{ data ? data.record : "" }}</h3>
        </div>
        <div class="bottom">
          <span class="placeholder">Tanggal</span>
          <h3 class="value">{{ formatDate(new Date()) }}</h3>
        </div>
      </div>
    </div>
    <div class="row-two">
      <div class="left">
        <div class="val-row">
          <span class="placeholder">No. Kendaraan:</span>
          <h3 class="value">{{ data ? data.license : "" }}</h3>
        </div>
        <div class="val-row">
          <span class="placeholder">Transportir:</span>
          <h3 class="value">
            ...................................................
          </h3>
        </div>
        <div class="val-row">
          <span class="placeholder">Nama Sopir:</span>
          <h3 class="value">
            ...................................................
          </h3>
        </div>
      </div>
      <div class="right">
        <div class="val-row">
          <span class="placeholder">Kepada:</span>
        </div>
        <div class="val-row">
          <h3 class="value">
            {{ data ? data.customer || data.supplier || "" : "" }}
          </h3>
        </div>
        <div class="val-row">
          <h3 class="value"></h3>
        </div>
      </div>
    </div>
    <div class="row-two">
      <div class="col-one">
        <div class="header">
          <div class="val-row">
            <span class="placeholder">BERAT MUATAN (KG)</span>
          </div>
          <div class="val-row">
            <div class="col-third">
              <span class="placeholder">BRUTO</span>
            </div>
            <div class="col-third">
              <span class="placeholder">TARA</span>
            </div>
            <div class="col-third">
              <span class="placeholder">NETTO</span>
            </div>
          </div>
        </div>
        <div class="body">
          <div class="col-third">
            <h2 class="value">
              {{
                data
                  ? data.entry_weight.toLocaleString().split(",").join(".")
                  : 0
              }}
            </h2>
          </div>
          <div class="col-third">
            <h2 class="value">
              {{
                data
                  ? data.exit_weight.toLocaleString().split(",").join(".")
                  : 0
              }}
            </h2>
          </div>
          <div class="col-third">
            <h2 class="value">
              {{
                data && data.status === "completed"
                  ? Math.abs(data.exit_weight - data.entry_weight)
                      .toLocaleString()
                      .split(",")
                      .join(".")
                  : 0
              }}
            </h2>
          </div>
        </div>
      </div>
      <div class="col-two">
        <div class="header">
          <span class="placeholder">Keterangan</span>
        </div>
        <div class="body" style="padding: 6px; box-sizing: border-box">
          <h3 class="value">{{ data ? data.notes : "" }}</h3>
        </div>
      </div>
    </div>
    <div class="row-one">
      <div class="col-one">
        <div class="col-three">
          <div class="val-row">
            <p class="italic">Dibuat rangkap 3</p>
          </div>
          <div class="val-row">
            <p>Lbr 1. asli untuk transportir pembawa barang</p>
          </div>
          <div class="val-row">
            <p>Lbr 2. untuk penerima barang</p>
          </div>
          <div class="val-row">
            <p>Lbr 3. untuk arsip gudang</p>
          </div>
        </div>
        <div class="col-four">
          <div class="header">
            <span class="placeholder italic">Penerima</span>
          </div>
        </div>
      </div>
      <div class="col-two">
        <div class="col-four">
          <div class="header">
            <span class="placeholder italic">Pengemudi / Sopir</span>
          </div>
        </div>
        <div class="col-three">
          <div class="header">
            <span class="placeholder">Dikeluarkan / Gudang</span>
          </div>
          <div class="body">
            <div class="col-one"></div>
            <div class="col-two"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      data: null,
    };
  },
  computed: {
    config() {
      return this.$store.getters.config;
    },
    name() {
      return this.$store.getters.name;
    },
    address() {
      return this.$store.getters.address;
    },
  },
  mounted() {
    this.data = JSON.parse(localStorage.getItem("invoice-data"));
    setTimeout(() => {
      localStorage.removeItem("invoice-data");
      window.print();
    }, 100);
  },
  methods: {
    formatRecord(x) {
      if (x >= 10000) return x;
      else if (x >= 1000) return `0${x}`;
      else if (x >= 100) return `00${x}`;
      else if (x >= 10) return `000${x}`;
      else return `0000${x}`;
    },
    formatDate(x) {
      const dateObj = new Date(x);
      const date = dateObj.getDate();
      const month = dateObj.getMonth() + 1;
      const year = dateObj.getFullYear();
      const hours = dateObj.getHours();
      const minutes = dateObj.getMinutes();
      return `${date > 9 ? date : `0${date}`}-${
        month > 9 ? month : `0${month}`
      }-${year} ${hours > 9 ? hours : `0${hours}`}:${
        minutes > 9 ? minutes : `0${minutes}`
      }`;
    },
  },
};
</script>

<style lang="scss" scoped>
.invoice-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 95vh;
  border: 1px solid #000;
  margin-top: 0.5rem;
  background: #fff;
  color: #000;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  * {
    font-family: "Arial" !important;
    h1 {
      font-size: 18px;
    }
    h2 {
      font-size: 16px;
    }
    h3 {
      font-size: 14px;
    }
    p {
      font-size: 12px;
    }
  }
  > * {
    border-bottom: 1px solid #000;
    box-sizing: border-box;
    span.placeholder {
      font-size: 14px;
      text-align: left;
    }
    &:last-child {
      border: 0;
    }
  }
  .row-one {
    position: relative;
    width: 100%;
    height: 20%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .col-third {
      position: relative;
      width: calc(100% / 3);
      height: 100%;
      border-left: 1px solid #000;
      border-right: 1px solid #000;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      h1.name {
        text-align: center;
        text-transform: uppercase;
      }
      p.address {
        text-align: center;
      }
      .top {
        position: relative;
        width: 100%;
        height: calc(100% * 2 / 3);
        border-bottom: 1px solid #000;
        padding: 0 6px;
        box-sizing: border-box;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .bottom {
        position: relative;
        width: 100%;
        height: calc(100% / 3);
        padding: 0 6px;
        box-sizing: border-box;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      &:first-child {
        border: 0;
      }
      &:last-child {
        border: 0;
      }
    }
    .col-one,
    .col-two {
      position: relative;
      width: calc(50% - 0.5px);
      height: 100%;
      display: flex;
      justify-content: flex-start;
      align-items: flex-start;
      > * {
        border-right: 1px solid #000;
        &:last-child {
          border: 0;
        }
      }
      .col-three {
        position: relative;
        width: calc(100% * 2 / 3);
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        .header {
          position: relative;
          width: 100%;
          height: 20%;
          border-bottom: 1px solid #000;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .body {
          position: relative;
          width: 100%;
          height: 80%;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .val-row {
          position: relative;
          width: 100%;
          height: 20%;
          padding: 0 6px;
          box-sizing: border-box;
          display: flex;
          justify-content: flex-start;
          align-items: center;
          p.italic {
            font-style: italic;
          }
        }
      }
      .col-four {
        position: relative;
        width: calc(100% / 3);
        height: 100%;
        padding: 0 6px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        .header {
          position: relative;
          height: 20%;
          border-bottom: 1px solid #000;
          display: flex;
          justify-content: center;
          align-items: center;
          span.placeholder.italic {
            font-style: italic;
          }
        }
      }
    }
    .col-one {
      border-right: 1px solid #000;
    }
  }
  .row-two {
    position: relative;
    width: 100%;
    height: 30%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .left,
    .right {
      position: relative;
      width: 50%;
      height: 100%;
      padding: 12px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      .val-row {
        position: relative;
        width: 100%;
        height: 36px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    }
    .col-one,
    .col-two {
      position: relative;
      width: calc(50% - 0.5px);
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-start;
      .header {
        position: relative;
        width: 100%;
        height: 20%;
        box-sizing: border-box;
        border-bottom: 1px solid #000;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }
    }
    .col-one {
      border-right: 1px solid #000;
      .header {
        .val-row {
          position: relative;
          width: 100%;
          height: calc(50% - 0.5px);
          border-bottom: 1px solid #000;
          display: flex;
          justify-content: center;
          align-items: center;
          &:last-child {
            border: 0;
          }
          .col-third {
            position: relative;
            width: calc(100% / 3);
            height: 100%;
            border-right: 1px solid #000;
            box-sizing: border-box;
            display: flex;
            justify-content: center;
            align-items: center;
            &:last-child {
              border: 0;
            }
          }
        }
      }
      .body {
        position: relative;
        width: 100%;
        height: 80%;
        display: flex;
        justify-content: center;
        align-items: center;
        .col-third {
          position: relative;
          width: calc(100% / 3);
          height: 100%;
          border-right: 1px solid #000;
          box-sizing: border-box;
          display: flex;
          justify-content: center;
          align-items: center;
          &:last-child {
            border: 0;
          }
        }
      }
    }
  }
}
</style>
