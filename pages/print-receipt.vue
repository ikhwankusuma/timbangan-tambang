<template>
  <div class="receipt-container">
    <h1 class="title">{{ config.name }}</h1>
    <div v-if="data" class="data-row">
      <p class="placeholder">Nomor Record</p>
      <p class="divider">:</p>
      <p class="value">
        {{ data.record ? data.record : "-" }}
      </p>
    </div>
    <div v-if="data && data.entry_weight" class="data-row">
      <p class="placeholder">Nomor Polisi</p>
      <p class="divider">:</p>
      <p class="value" style="font-size: 14px; font-weight: bold">
        {{ data.license ? data.license : "-" }}
      </p>
    </div>
    <div v-if="data" class="data-row">
      <p class="placeholder">Material</p>
      <p class="divider">:</p>
      <p class="value">{{ data.material ? data.material : "-" }}</p>
    </div>
    <div v-if="data && data.customer" class="data-row">
      <p class="placeholder">Customer</p>
      <p class="divider">:</p>
      <p class="value">{{ data.customer }}</p>
    </div>
    <div v-if="data && data.supplier" class="data-row">
      <p class="placeholder">Supplier</p>
      <p class="divider">:</p>
      <p class="value">{{ data.supplier }}</p>
    </div>
    <div v-if="data" class="data-row">
      <p class="placeholder">Masuk</p>
      <p class="divider">:</p>
      <p class="value">
        {{ data.entry_date ? formatDate(data.entry_date) : "-" }}
      </p>
    </div>
    <div
      v-if="data && data.entry_weight"
      class="data-row"
      style="margin-bottom: 12px"
    >
      <p class="placeholder">Keluar</p>
      <p class="divider">:</p>
      <p class="value">
        {{ data.exit_date ? formatDate(data.exit_date) : "-" }}
      </p>
    </div>
    <div v-if="data && data.entry_weight" class="data-row">
      <p class="placeholder">Bruto</p>
      <p class="divider">:</p>
      <p class="value" style="font-size: 14px; font-weight: bold">
        {{
          data.entry_weight && data.exit_weight
            ? data.entry_weight > data.exit_weight
              ? `${data.entry_weight} kg`
              : `${data.exit_weight} kg`
            : `${data.entry_weight} kg`
        }}
      </p>
    </div>
    <div
      v-if="data && data.entry_weight"
      class="data-row"
      style="padding-bottom: 6px; border-bottom: 1px solid #000"
    >
      <p class="placeholder">Tara</p>
      <p class="divider">:</p>
      <p class="value" style="font-size: 14px; font-weight: bold">
        {{
          data.entry_weight && data.exit_weight
            ? data.entry_weight > data.exit_weight
              ? `${data.exit_weight} kg`
              : `${data.entry_weight} kg`
            : "-"
        }}
      </p>
    </div>
    <div v-if="data && data.entry_weight" class="data-row">
      <p class="placeholder">Netto</p>
      <p class="divider">:</p>
      <p class="value" style="font-size: 14px; font-weight: bold">
        {{
          data.exit_weight && data.entry_weight
            ? `${Math.abs(data.exit_weight - data.entry_weight)} kg`
            : "-"
        }}
      </p>
    </div>
    <div v-if="data && config.type === 2" class="data-row">
      <p class="placeholder">Berat</p>
      <p class="divider">:</p>
      <p class="value" style="font-size: 14px; font-weight: bold">
        {{ data.weight ? `${data.weight} kg` : "0 kg" }}
      </p>
    </div>
    <br v-if="data && data.notes" />
    <div v-if="data && data.notes" class="data-row notes">
      <p class="placeholder">CATATAN</p>
      <p class="divider">:</p>
      <p class="value">{{ data.notes ? data.notes : "" }}</p>
    </div>
    <!-- <div v-if="data && data.notes" class="data-row">
    </div> -->
    <!-- <br v-if="data && data.notes" /> -->
    <p style="text-align: center; width: 100%">Penimbang,</p>
    <br />
    <br />
    <p style="text-align: center; width: 100%">Admin</p>
  </div>
</template>

<script>
export default {
  layout: "print",
  data() {
    return {
      data: null,
    };
  },
  computed: {
    config() {
      return this.$store.getters.config;
    },
  },
  mounted() {
    this.data = JSON.parse(localStorage.getItem("receipt-data"));
    setTimeout(() => {
      localStorage.removeItem("receipt-data");
      window.print();
    }, 100);
  },
  methods: {
    formatDate(x) {
      const dateObj = new Date(x);
      const date = dateObj.getDate();
      const month = dateObj.getMonth() + 1;
      const year = dateObj.getFullYear();
      const hours = dateObj.getHours();
      const minutes = dateObj.getMinutes();
      return `${date > 9 ? date : `0${date}`}-${
        month > 9 ? month : `0${month}`
      }-${`${year}`.substr(2, 2)} ${hours > 9 ? hours : `0${hours}`}:${
        minutes > 9 ? minutes : `0${minutes}`
      }`;
    },
  },
};
</script>

<style lang="scss" scoped>
.receipt-container {
  position: relative;
  width: 100%;
  height: 11cm;
  //margin-top: 0.5rem;
  background: #fff;
  color: #000;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  * {
    font-family: "Arial" !important;
  }
  p {
    font-size: 12px;
    font-weight: 500;
  }
  h1.title {
    position: relative;
    width: 100%;
    font-size: 14px;
    padding-bottom: 12px;
    margin-bottom: 12px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-bottom: 1px solid #000;
  }
  .data-row {
    position: relative;
    width: 100%;
    margin-bottom: 6px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    p.divider {
      position: absolute;
      top: 0;
      left: 90px;
    }
  }
}
</style>
