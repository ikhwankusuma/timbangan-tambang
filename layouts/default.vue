<template>
  <div ref="layout" class="main-layout">
    <main class="body">
      <header v-if="config" class="header">
        <div v-if="modeState === 'mobile' && !token" class="header-action">
          <div v-ripple class="login-button" @click="openLoginPanel = true">
            <span>login</span>
          </div>
        </div>
        <div v-else-if="modeState === 'mobile'" class="header-action logged-in">
          <div class="user">
            <div class="name-container">
              <div class="name">
                {{ name }}
              </div>
              <div class="username">
                {{ role }}
              </div>
            </div>
            <round-button
              :icon="'mdi-chevron-down'"
              @clicked="openUserActions = true"
            />
            <div
              v-if="openUserActions"
              v-click-outside="{ handler: () => (openUserActions = false) }"
              class="actions-container"
              @click="openUserActions = false"
            >
              <div
                v-if="role === 'owner'"
                v-ripple
                class="action"
                @click="openConfigFirm = true"
              >
                <v-icon class="icon"> mdi-information-outline </v-icon>
                <div class="name">Informasi perusahaan</div>
              </div>
              <div v-if="role === 'owner'" class="divider" />
              <div
                v-if="role !== 'operator' && config.plugins.includes(1)"
                v-ripple
                class="action"
                @click="openConfigCamera = true"
              >
                <v-icon class="icon"> mdi-camera-outline </v-icon>
                <div class="name">Atur kamera</div>
              </div>
              <div
                v-if="role !== 'operator'"
                v-ripple
                class="action"
                @click="openUserManagement = true"
              >
                <v-icon class="icon"> mdi-account-multiple-outline </v-icon>
                <div class="name">Atur pengguna</div>
              </div>
              <div
                v-if="role !== 'operator'"
                v-ripple
                class="action"
                @click="openSupplierManagement = true"
              >
                <v-icon class="icon"> mdi-badge-account-outline </v-icon>
                <div class="name">Atur supplier</div>
              </div>
              <div
                v-if="role !== 'operator'"
                v-ripple
                class="action"
                @click="openCustomerManagement = true"
              >
                <v-icon class="icon"> mdi-briefcase-account-outline </v-icon>
                <div class="name">Atur customer</div>
              </div>

              <div
                v-if="
                  config && config.status === 'trial' && role !== 'operator'
                "
                class="divider"
              />
              <div
                v-if="
                  config && config.status === 'trial' && role !== 'operator'
                "
                v-ripple
                class="action"
                @click="openActivateApp = true"
              >
                <v-icon class="icon"> mdi-star-outline </v-icon>
                <div class="name">Aktivasi</div>
              </div>
              <div class="divider" />
              <div v-ripple class="action error" @click="logout">
                <v-icon class="icon"> mdi-logout-variant </v-icon>
                <div class="name">Keluar</div>
              </div>
            </div>
          </div>
        </div>
        <div class="title-wrapper">
          <h3
            v-if="config.address || config.email || config.phone"
            class="sub-title"
          >
            {{ config.address || config.email || config.phone }}
          </h3>
          <h1 class="main-title">
            {{ config.name }}
          </h1>
        </div>
        <div v-if="config.plugins.includes(2)" class="button-wrapper">
          <button-input
            :label="'tutup palang'"
            style="width: 10rem; margin-right: 1rem"
            class="err"
            @clicked="gateHandler('close')"
          />
          <button-input
            :label="'buka palang'"
            style="width: 10rem"
            @clicked="gateHandler('open')"
          />
        </div>
        <div
          v-if="config.status === 'trial' && modeState === 'desktop'"
          class="trial-status"
        >
          <div class="placeholder">
            {{ `Masa trial akan habis pada ${formatDate(config.expiration)}` }}
          </div>
        </div>
      </header>
      <div v-if="token" class="page-container">
        <nuxt />
        <camera-view
          v-if="config.plugins && config.plugins.includes(1)"
          ref="cameras"
          :visible="!!openConfigCamera || !!openAddData || !!editData"
          :edit="openConfigCamera"
        />
        <photo-view
          v-if="viewData && config.plugins && config.plugins.includes(1)"
          ref="photos"
          :scale="viewData"
        />
      </div>
    </main>
    <div v-if="modeState === 'desktop'" class="layout-details">
      <div v-if="!token" class="header">
        <div v-ripple class="login-button" @click="openLoginPanel = true">
          <span>login</span>
        </div>
      </div>
      <div v-else class="header logged-in">
        <div class="button">
          <round-button
            :icon="'mdi-plus'"
            :primary="true"
            @clicked="openAddData = true"
          />
          <div class="tooltip">
            <div class="placeholder">Tambah data</div>
          </div>
        </div>

        <div class="user">
          <div class="name-container">
            <div class="name">
              {{ name }}
            </div>
            <div class="username">
              {{ role }}
            </div>
          </div>
          <round-button
            :icon="openUserActions ? 'mdi-chevron-up' : 'mdi-chevron-down'"
            @clicked="openUserActions = true"
          />
          <div
            v-if="openUserActions"
            v-click-outside="{ handler: () => (openUserActions = false) }"
            class="actions-container"
            @click="openUserActions = false"
          >
            <div
              v-if="role === 'owner'"
              v-ripple
              :style="loadingExport ? 'pointer-events: none' : ''"
              :class="!datas.length ? 'disabled' : ''"
              class="action"
              @click="exportAsExcel"
            >
              <v-icon class="icon"> mdi-file-excel-box-outline </v-icon>
              <span class="name">Export Excel</span>
              <div v-if="loadingExport" class="loader">
                <v-progress-circular indeterminate :size="20" :width="3" />
              </div>
            </div>
            <div
              v-if="role === 'owner'"
              v-ripple
              class="action"
              @click="backupData"
            >
              <v-icon class="icon"> mdi-download-outline </v-icon>
              <h3 class="name">Backup data</h3>
            </div>
            <div
              v-if="role === 'owner'"
              v-ripple
              class="action"
              @click="openRestoreData = true"
            >
              <v-icon class="icon"> mdi-backup-restore </v-icon>
              <h3 class="name">Restore data</h3>
            </div>
            <div
              v-if="role === 'owner'"
              v-ripple
              class="action"
              @click="openConfigFirm = true"
            >
              <v-icon class="icon"> mdi-information-outline </v-icon>
              <div class="name">Informasi perusahaan</div>
            </div>
            <div v-if="role === 'owner'" class="divider" />
            <div
              v-if="role !== 'operator' && config.plugins.includes(1)"
              v-ripple
              class="action"
              @click="openConfigCamera = true"
            >
              <v-icon class="icon"> mdi-camera-outline </v-icon>
              <div class="name">Atur kamera</div>
            </div>
            <div
              v-if="role !== 'operator'"
              v-ripple
              class="action"
              @click="openUserManagement = true"
            >
              <v-icon class="icon"> mdi-account-multiple-outline </v-icon>
              <div class="name">Atur pengguna</div>
            </div>
            <div
              v-if="role !== 'operator'"
              v-ripple
              class="action"
              @click="openSupplierManagement = true"
            >
              <v-icon class="icon"> mdi-badge-account-outline </v-icon>
              <div class="name">Atur supplier</div>
            </div>
            <div
              v-if="role !== 'operator'"
              v-ripple
              class="action"
              @click="openCustomerManagement = true"
            >
              <v-icon class="icon"> mdi-briefcase-account-outline </v-icon>
              <div class="name">Atur customer</div>
            </div>
            <div
              v-if="role !== 'operator'"
              v-ripple
              class="action"
              @click="openMaterialManagement = true"
            >
              <v-icon class="icon"> mdi-shape-outline </v-icon>
              <div class="name">Atur material</div>
            </div>
            <div
              v-if="config && config.status === 'trial' && role !== 'operator'"
              class="divider"
            />
            <div
              v-if="config && config.status === 'trial' && role !== 'operator'"
              v-ripple
              class="action"
              @click="openActivateApp = true"
            >
              <v-icon class="icon"> mdi-star-outline </v-icon>
              <div class="name">Aktivasi</div>
            </div>
            <div class="divider" />
            <div v-ripple class="action error" @click="logout">
              <v-icon class="icon"> mdi-logout-variant </v-icon>
              <div class="name">Keluar</div>
            </div>
          </div>
        </div>
      </div>
      <dashboard-bar-chart :data="dataSummary" :minimized="filteredSummary" />
      <dashboard-counter :data="customerSummary" />
      <dashboard-counter :data="supplierSummary" />
    </div>
    <generate-config
      v-if="openGenerateConfig"
      @exit="openGenerateConfig = false"
      @finished="openLoginPanel = true"
    />
    <configure-firm v-if="openConfigFirm" @exit="openConfigFirm = false" />
    <login-panel v-if="openLoginPanel" @exit="openLoginPanel = false" />
    <add-scale
      v-if="openAddData || editData"
      :data="editData"
      @exit="
        openAddData = null;
        editData = null;
      "
    />
    <customer-management
      v-if="openCustomerManagement"
      @exit="openCustomerManagement = false"
      @open="openAddCustomer = true"
    />
    <user-management
      v-if="openUserManagement"
      @exit="openUserManagement = false"
      @openAdd="openAddUser = true"
    />
    <supplier-management
      v-if="openSupplierManagement"
      @exit="openSupplierManagement = false"
      @open="openAddSupplier = true"
    />
    <material-management
      v-if="openMaterialManagement"
      @exit="openMaterialManagement = false"
      @open="openAddMaterial = true"
    />
    <add-user v-if="openAddUser" @exit="openAddUser = false" />
    <add-customer v-if="openAddCustomer" @exit="openAddCustomer = false" />
    <add-material v-if="openAddMaterial" @exit="openAddMaterial = false" />
    <add-supplier v-if="openAddSupplier" @exit="openAddSupplier = false" />
    <edit-user v-if="editUser" :user-data="editUser" @exit="editUser = null" />
    <activate-app v-if="openActivateApp" @exit="openActivateApp = false" />
    <restore-data v-if="openRestoreData" @exit="openRestoreData = false" />
    <edit-customer
      v-if="editCustomer"
      :customer-data="editCustomer"
      @exit="editCustomer = null"
    />
    <edit-supplier
      v-if="editSupplier"
      :supplier-data="editSupplier"
      @exit="editSupplier = null"
    />
    <edit-material
      v-if="editMaterial"
      :material-data="editMaterial"
      @exit="editMaterial = null"
    />
    <view-data v-if="viewData" :data="viewData" @exit="viewData = null" />
    <configure-camera
      v-if="openConfigCamera"
      @exit="openConfigCamera = false"
    />
    <iframe
      v-if="printInvoice"
      ref="printInvoice"
      class="print-invoice"
      :src="`${$config.baseURL}/print-invoice`"
      frameborder="0"
    />
    <iframe
      v-if="printReceipt"
      ref="printreceipt"
      class="print-receipt"
      :src="`${$config.baseURL}/print-receipt`"
      frameborder="0"
    />
  </div>
</template>

<script>
import io from "socket.io-client";

export default {
  data() {
    return {
      socket: null,
      editUser: null,
      loadingExport: false,
      openRestoreData: false,
      openUserActions: false,
      openFiltersContainer: false,
      openAddUser: false,
      editCustomer: null,
      editSupplier: null,
      editMaterial: null,
      openLoginPanel: false,
      openConfigFirm: false,
      openConfigCamera: false,
      openActivateApp: false,
      openAddMaterial: false,
      openAddCustomer: false,
      openAddSupplier: false,
      openGenerateConfig: false,
      openUserManagement: false,
      openMaterialManagement: false,
      openCustomerManagement: false,
      openSupplierManagement: false,
      openAddData: false,
      printInvoice: false,
      printReceipt: false,
      viewData: null,
      editData: null,
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
      operatorSocket: null,
      init: true,
      dataFilled: false,
    };
  },
  computed: {
    modeState() {
      return this.$store.getters.mode;
    },
    isExpired() {
      if (this.status === "activated") return false;
      return new Date(this.expiration).getTime() <= new Date().getTime();
    },
    config() {
      return this.$store.getters.config;
    },
    scaleType() {
      return !this.init && this.config ? this.config.type : null;
    },
    token() {
      return this.$store.getters["user/token"];
    },
    datas() {
      return this.$store.getters["scales/datas"];
    },
    name() {
      return this.$store.getters["user/name"];
    },
    limit() {
      return this.$store.getters["scales/limit"];
    },
    role() {
      return this.$store.getters["user/role"];
    },
    summary() {
      return this.$store.getters["scales/summary"];
    },
    dataSummary() {
      const { weights } = this.summary;
      return {
        name: "Penimbangan 6 Bulan Terakhir",
        minimized: "Total penimbangan",
        data: weights || [],
      };
    },
    customerSummary() {
      const { customers } = this.summary;
      return {
        name: "Rincian customer",
        data: customers || [],
      };
    },
    supplierSummary() {
      const { suppliers } = this.summary;
      return {
        name: "Rincian supplier",
        data: suppliers || [],
      };
    },
    materialSummary() {
      const { materials } = this.summary;
      return {
        name: "Rincian material",
        data: materials || [],
      };
    },
    filteredSummary() {
      const { filtered } = this.summary;
      return !!filtered;
    },
  },
  watch: {
    config: {
      handler(val) {
        if (!val) this.openGenerateConfig = true;
        else if (val && !this.token) this.openLoginPanel = true;
      },
      immediate: true,
    },
    scaleType(val) {
      if (val) {
        this.socket = io(`${this.$config.apiURL}/weigh`, {
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 10,
        });
        this.socket.emit("start-weighing");
        this.socket.on("weigh-error", () => {
          this.$root.$emit("weigh-error");
        });
        this.socket.on("weigh-refresh-done", () => {
          setTimeout(() => {
            this.$root.$emit("refresh-done");
            this.socket.emit("start-weighing");
          }, 500);
        });
        this.socket.on("weigh-refresh-error", () => {
          setTimeout(() => {
            this.$root.$emit("refresh-done");
            this.$root.$emit("weigh-error");
          }, 500);
        });
        this.socket.on("weigh-disconnected", () => {
          this.$root.$emit("refresh-scales");
          this.socket.emit("refresh-scales");
        });
        this.socket.on("weight-update", ({ weight }) => {
          this.$root.$emit("weight-update", weight);
          if (this.dataFilled && weight <= 50) {
            this.dataFilled = false;
            setTimeout(() => {
              this.socket.emit("close-barrier");
            }, 2000);
          }
        });
        this.$root.$on("refresh-weigh", () => {
          this.$root.$emit("refresh-scales");
          this.socket.emit("refresh-weigh");
        });
        this.$root.$on("open-add-form", () => {
          this.socket.emit("start-weighing");
        });
        this.$root.$on("new-data", () => {
          this.$store.dispatch("scales/loadSummary");
          if (this.config.plugins.includes(2)) {
            this.dataFilled = true;
            this.socket.emit("open-barrier");
          }
        });
        // this.socket.emit("open-barrier");
      }
    },
    token: {
      handler(val) {
        if (val && this.config.url) {
          this.operatorSocket = io(
            `${this.$config.env === "production" ? "https://" : ""}${
              this.$config.env === "production"
                ? this.config.url
                : "http://localhost:8000"
            }/online`,
            {
              reconnection: true,
              reconnectionDelay: 1000,
              reconnectionDelayMax: 5000,
              reconnectionAttempts: 10,
              path: this.$config.env === "production" ? "/api/socket.io" : "",
            }
          );
          this.operatorSocket.emit("join", this.config.location);
        }
      },
      immediate: true,
    },
    openLoginPanel() {
      setTimeout(() => {
        this.openGenerateConfig = false;
      }, 1000);
    },
  },
  mounted() {
    this.$store.dispatch("scales/loadSummary");
    this.$store.dispatch("scales/uploadScales");
    this.init = false;
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
    window.addEventListener("resize", () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    });
    this.mediaQuery = window.matchMedia("(max-width: 1024px)");
    this.mediaQuery.addListener(this.resizeHandler);
    this.resizeHandler(this.mediaQuery);
    this.$root.$on("shake", () => {
      this.$refs.layout.classList.add("shake");
      setTimeout(() => {
        this.$refs.layout.classList.remove("shake");
      }, 500);
    });
    this.$root.$on("close-cameras", () => {
      const {
        $refs: { cameras, photos },
      } = this;
      if (cameras) cameras.exit();
      if (photos) photos.exit();
    });
    this.$root.$on("view-data", (data) => {
      this.viewData = data;
      setTimeout(() => {
        this.addScale = null;
        this.openLoginPanel = false;
        this.openUserActions = false;
        this.openGenerateConfig = false;
        this.openConfigFirm = false;
        this.openAddUser = false;
        this.openAddCustomer = false;
        this.openAddSupplier = false;
        this.openUserManagement = false;
        this.openCustomerManagement = false;
        this.openSupplierManagement = false;
        this.openScalesConfiguration = false;
      }, 1000);
    });
    this.$root.$on("user-edit", (data) => {
      this.editUser = data;
    });
    this.$root.$on("customer-edit", (data) => {
      this.editCustomer = data;
    });
    this.$root.$on("material-edit", (data) => {
      this.editMaterial = data;
    });
    this.$root.$on("supplier-edit", (data) => {
      this.editSupplier = data;
    });
    this.$root.$on("edit-data", (data) => {
      this.editData = data;
    });
    this.$root.$on("print-invoice", (data) => {
      localStorage.setItem("invoice-data", JSON.stringify(data));
      this.printInvoice = false;
      setTimeout(() => {
        this.printInvoice = true;
        setTimeout(() => {
          this.$refs.printInvoice.focus();
        }, 100);
      }, 50);
    });
    this.$root.$on("print-receipt", (data) => {
      localStorage.setItem("receipt-data", JSON.stringify(data));
      this.printReceipt = false;
      setTimeout(() => {
        this.printReceipt = true;
      }, 5);
    });
    if (this.config.plugins && this.config.plugins.includes(1))
      this.$store.dispatch("cameras/load");
  },
  methods: {
    closeAddData() {
      this.openAddData = false;
      this.editData = null;
      this.skip = 0;
      this.$store.dispatch("scales/load", {
        query: this.fullQuery,
        reset: true,
      });
    },
    async exportAsExcel() {
      this.loadingExport = true;
      const query = this.$store.getters["scales/query"];
      const startDate = this.$store.getters["scales/startDate"];
      const endDate = this.$store.getters["scales/endDate"];
      const queryString = `
        ${query ? `&material=${query}` : ""}${
        query ? `&supplier=${query}` : ""
      }${query ? `&customer=${query}` : ""}${query ? `&license=${query}` : ""}${
        startDate ? `&start_date=${startDate}` : ""
      }${endDate ? `&end_date=${endDate}` : ""}
      `.trim();
      const fileSaver = require("file-saver");
      const { data } = await this.$axios({
        url: `${this.$config.apiURL}/scales?${queryString}&export_excel=true`,
        method: "GET",
        responseType: "blob",
      });
      fileSaver(data, "export.xlsx");
      this.loadingExport = false;
    },
    formatDate(x) {
      const dateObj = new Date(x);
      const date = dateObj.getDate();
      const month = dateObj.getMonth();
      const year = dateObj.getFullYear();
      return `${date} ${this.months[month].slice(0, 3)} ${year}`;
    },
    async loadMoreData([entry]) {
      const { isIntersecting } = entry;
      if (isIntersecting && !this.limit) {
        this.loading = true;
        await this.$store.dispatch("scales/load");
        this.loading = false;
      }
    },
    changeSkip(val) {
      this.$store.dispatch("scales/setQueries", { skip: val });
    },
    changeVal({ val, input }) {
      input.model = val;
    },
    gateHandler(val) {
      if (val === "open") {
        this.socket.emit("open-barrier");
      } else if (val === "close") {
        this.socket.emit("close-barrier");
      }
    },
    resizeHandler(e) {
      if (e.matches) this.$store.dispatch("changeMode", "mobile");
      else this.$store.dispatch("changeMode", "desktop");
    },
    openAddScalePanel(data) {
      this.addScale = data;
    },
    async backupData() {
      this.userActionsOpened = false;
      try {
        const { data } = await this.$axios.get(
          `${this.$config.apiURL}/admin/backup-data`
        );
        if (data.message !== "SUCCESS") throw new Error(data.message);
        const json = JSON.stringify(data.payload);
        const blob = new Blob([json], { type: "text/json" });
        if (window.navigator.msSaveOrOpenBlob) {
          window.navigator.msSaveBlob(blob, "backup.json");
        } else {
          const el = window.document.createelent("a");
          el.href = window.URL.createObjectURL(blob);
          el.download = "backup.json";
          document.body.appendChild(el);
          el.click();
          document.body.removeChild(el);
        }
      } catch (e) {
        this.$store.dispatch("alerts/add", {
          type: "error",
          message: e.message,
        });
      }
    },
    logout() {
      this.operatorSocket.disconnect();
      this.$store.dispatch("user/logout");
      this.openLoginPanel = true;
    },
  },
};
</script>

<style lang="scss" scoped>
.main-layout {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  overflow: hidden;
  main.body {
    z-index: 10000;
    position: relative;
    width: calc(100vw - 20rem);
    background: $background-color;
    height: 100vh;
    overflow-x: visible;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    header.header {
      position: relative;
      width: 100%;
      height: 5.5rem;
      padding: 0 2rem;
      box-sizing: border-box;
      display: flex;
      justify-content: space-between;
      align-items: center;
      .title-wrapper {
        position: relative;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
        h1.main-title {
          font-family: "Consolas", "Azeret Mono", monospace;
          line-height: 1;
          transform: translateY(0.125rem);
        }
        h3.sub-title {
          color: $subtext-color;
          font-family: "Quicksand";
          line-height: 1;
          margin-bottom: 0.375rem;
          transform: translateY(0.125rem);
        }
      }
      .button-wrapper {
        position: relative;
        height: 100%;
        display: flex;
        justify-content: flex-end;
        align-items: center;
      }
      .trial-status {
        position: absolute;
        top: 0;
        right: 0;
        width: 100%;
        height: 1rem;
        background: $error-color;
        display: flex;
        justify-content: center;
        align-items: center;
        .placeholder {
          position: relative;
          font-family: "Quicksand";
          font-size: 0.65rem;
          font-weight: 600;
          color: #fff;
          margin-right: 1rem;
          line-height: 1;
          color: inherit;
        }
      }
    }
    .page-container {
      z-index: 10000;
      position: relative;
      width: 100%;
      height: calc(100% - 5.5rem);
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-start;
    }
  }
  .layout-details {
    z-index: 0;
    position: relative;
    width: 20rem;
    height: 100vh;
    padding: 0 2rem;
    background: $background-color;
    border-left: 1px solid $border-color;
    box-sizing: border-box;
    overflow-y: auto;
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
      height: 5.5rem;
      box-sizing: border-box;
      display: flex;
      justify-content: space-between;
      align-items: center;
      .login-button {
        cursor: pointer;
        position: relative;
        height: 1.5rem;
        padding: 0 0.5rem;
        border: 1px solid $border-color;
        border-radius: 0.75rem;
        box-sizing: border-box;
        font-family: "Consolas", "Azeret Mono", monospace;
        font-size: 0.75rem;
        font-weight: 500;
        line-height: 1;
        color: $subtext-color;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .square-btn {
        cursor: pointer;
        position: relative;
        height: 2rem;
        border-radius: 12px;
        padding: 0 0.5rem;
        box-sizing: border-box;
        background: $border-color;
        display: flex;
        justify-content: center;
        align-items: center;
        .icon {
          color: $font-color;
        }
        span.text {
          position: relative;
          margin-left: 0.25rem;
          font-family: "Quicksand";
          font-weight: 600;
          font-size: 0.6rem;
        }
        .loader {
          position: absolute;
          width: 100%;
          height: 100%;
          background: $border-color;
          border-radius: 12px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        &.disabled {
          pointer-events: none;
          opacity: 0.5;
        }
        &:last-child {
          margin: 0;
        }
      }
      .user {
        position: relative;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .name-container {
          margin-right: 0.5rem;
          position: relative;
          height: 100%;
          display: flex;
          padding-left: 0.5rem;
          flex-direction: column;
          justify-content: center;
          align-items: flex-end;
          .name {
            justify-content: flex-end;
            position: relative;
            font-family: "Consolas", "Azeret Mono", monospace;
            font-size: 0.75rem;
            font-weight: 600;
            line-height: 1;
            color: $text-color;
          }
          .username {
            position: relative;
            font-family: "Quicksand";
            font-size: 0.6rem;
            font-weight: 400;
            line-height: 1;
            color: $subtext-color;
          }
        }
        .action-btn {
          cursor: pointer;
          position: relative;
          max-width: 2.5rem;
          max-height: 2rem;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: auto;
        }
        .actions-container {
          z-index: 1000000;
          position: absolute;
          top: 100%;
          right: 0;
          border-radius: 0.75rem;
          background: $background-color;
          border: 1px solid $border-color;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          align-items: flex-start;
          .action {
            cursor: pointer;
            position: relative;
            width: 10rem;
            height: 2rem;
            flex-shrink: 0;
            background: rgba(255, 255, 255, 0);
            transition: 0.25s background-color;
            padding: 0 0.5rem;
            box-sizing: border-box;
            display: flex;
            justify-content: flex-start;
            align-items: center;
            .loader {
              position: absolute;
              width: 100%;
              height: 100%;
              background: $border-color;
              border-radius: 12px;
              display: flex;
              justify-content: center;
              align-items: center;
            }
            &.disabled {
              pointer-events: none;
              opacity: 0.5;
            }
            .icon {
              font-size: 1rem;
            }
            .name {
              font-family: "Quicksand";
              font-size: 0.65rem;
              font-weight: 600;
              margin-left: 0.5rem;
            }
            &.error {
              color: $error-color;
              .icon {
                color: inherit;
              }
              h3.name {
                color: inherit;
              }
            }
            &:hover {
              background: rgba(230, 230, 230, 0.5);
            }
          }
          .divider {
            position: relative;
            width: calc(100% - 1rem);
            height: 1px;
            flex-shrink: 0;
            margin: 0 0.5rem;
            background: rgba(0, 0, 0, 0.05);
          }
        }
      }
      .button {
        justify-content: center;
        align-items: center;
        display: flex;
        .tooltip {
          z-index: 10;
          pointer-events: none;
          position: absolute;
          top: calc(70%);
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
            font-size: 0.6rem;
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
    .filter-field {
      z-index: 100000;
      position: relative;
      width: 100%;
      margin-bottom: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      .filter-button {
        z-index: 10000;
        cursor: pointer;
        position: absolute;
        top: 0.25rem;
        right: 0.25rem;
        width: 1.5rem;
        height: 1.5rem;
        border-radius: 0.5rem;
        color: #fff;
        background: $primary-color;
        display: flex;
        justify-content: center;
        align-items: center;
        .icon {
          font-size: 0.75rem;
          color: inherit;
        }
      }
      .filters-container {
        z-index: 1000000;
        position: absolute;
        top: 100%;
        right: 0;
        width: 100%;
        border-radius: 0.75rem;
        background: $background-color;
        padding: 0.75rem;
        border: 1px solid $border-color;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        .input-field {
          position: relative;
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
      }
    }
    .datas-wrapper {
      position: relative;
      width: 100%;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-start;
      .scale {
        cursor: pointer;
        position: relative;
        width: 100%;
        margin-bottom: 0.5rem;
        border: 1px solid $border-color;
        border-radius: 0.5rem;
        padding: 0.75rem;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        .detail {
          position: relative;
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          .data {
            position: relative;
            width: 50%;
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
              color: $subtext-color;
            }
            .value {
              position: relative;
              margin-top: 0.25rem;
              font-family: "Consolas", "Azeret Mono", monospace;
              font-size: 0.75rem;
              font-weight: 600;
              line-height: 1;
              color: $text-color;
            }
            &:last-child {
              align-items: flex-end;
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
  }
  &.shake {
    animation: shake 0.25s infinite;
  }
  .init-panel {
    z-index: 10000;
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: $background-color;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    .logo {
      position: relative;
      width: 4rem;
      height: 4rem;
      display: flex;
      justify-self: center;
      align-items: center;
    }
    .name {
      position: relative;
      padding: 0 2rem;
      margin-top: 0.5rem;
      font-family: "Quicksand";
      font-size: 0.75rem;
      font-weight: 600;
      line-height: 1.2;
      text-align: center;
    }
  }
  iframe {
    z-index: -1;
    position: fixed;
    top: -1000vh;
    left: 0;
    width: 100vw;
    height: 100vh;
  }
  @media only screen and (max-width: 1024px) {
    main.body {
      width: 100vw;
      overflow-y: auto;
      header.header {
        height: auto;
        padding: 1rem;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        .header-action {
          position: relative;
          width: 100%;
          margin-bottom: 2rem;
          box-sizing: border-box;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          .login-button {
            cursor: pointer;
            position: relative;
            height: 1.5rem;
            padding: 0 0.5rem;
            border: 1px solid $border-color;
            border-radius: 0.75rem;
            box-sizing: border-box;
            font-family: "Consolas", "Azeret Mono", monospace;
            font-size: 0.75rem;
            font-weight: 500;
            line-height: 1;
            color: $subtext-color;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .user {
            position: relative;
            height: 1.5rem;
            display: flex;
            justify-content: flex-start;
            align-items: center;
            .name-container {
              position: relative;
              width: 10rem;
              height: 100%;
              margin-right: 0.5rem;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              align-items: flex-end;
              .name {
                position: relative;
                font-family: "Consolas", "Azeret Mono", monospace;
                font-size: 0.75rem;
                font-weight: 600;
                line-height: 1;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                color: $text-color;
              }
              .username {
                position: relative;
                font-family: "Quicksand";
                font-size: 0.6rem;
                font-weight: 400;
                line-height: 1;
                color: $subtext-color;
              }
            }
            .actions-container {
              z-index: 1000000;
              position: absolute;
              top: 100%;
              right: 0;
              border-radius: 0.75rem;
              background: $background-color;
              border: 1px solid $border-color;
              display: flex;
              flex-direction: column;
              justify-content: flex-start;
              align-items: flex-start;
              .action {
                cursor: pointer;
                position: relative;
                width: 10rem;
                height: 2rem;
                flex-shrink: 0;
                background: rgba(255, 255, 255, 0);
                transition: 0.25s background-color;
                padding: 0 0.5rem;
                box-sizing: border-box;
                display: flex;
                justify-content: flex-start;
                align-items: center;
                .icon {
                  font-size: 1rem;
                }
                .name {
                  font-family: "Quicksand";
                  font-size: 0.65rem;
                  font-weight: 600;
                  margin-left: 0.5rem;
                }
                &.error {
                  color: $error-color;
                  .icon {
                    color: inherit;
                  }
                  h3.name {
                    color: inherit;
                  }
                }
                &:hover {
                  background: rgba(230, 230, 230, 0.5);
                }
                &:first-child {
                  border-top-left-radius: 18px;
                  border-top-right-radius: 18px;
                }
                &:last-child {
                  border-bottom-left-radius: 18px;
                  border-bottom-right-radius: 18px;
                }
              }
              .divider {
                position: relative;
                width: calc(100% - 1rem);
                height: 1px;
                flex-shrink: 0;
                margin: 0 0.5rem;
                background: rgba(0, 0, 0, 0.05);
              }
            }
          }
        }
        .title-wrapper {
          padding-right: 1rem;
          h1.main-title {
            line-height: 1.15;
            transform: none;
          }
          h3.sub-title {
            transform: none;
          }
        }
      }
    }
  }
}
</style>

<style lang="scss">
::-webkit-scrollbar {
  display: none;
}
// :root {
//   filter: invert(100%) hue-rotate(180deg);
// }
input,
textarea {
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
  user-select: text;
}
html,
body {
  font-family: "Quicksand", -apple-system, BlinkMacSystemFont, "Segoe UI",
    Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 24px;
  color: $text-color;
  word-spacing: 1px;
  width: 100%;
  height: 100%;
  line-height: 1.5;
  margin: 0;
  padding: 0;
  overflow: hidden;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  @media only screen and (max-width: 1599px) {
    font-size: 21px;
  }
  @media only screen and (max-width: 1479px) {
    font-size: 20px;
  }
  @media only screen and (max-width: 1379px) {
    font-size: 19px;
  }
  @media only screen and (max-width: 1319px) {
    font-size: 18px;
  }
  @media only screen and (max-width: 1024px) {
    font-size: 24px;
  }
  @media only screen and (max-width: 360px) and (min-width: 321px) {
    font-size: 21px;
  }
  @media only screen and (max-width: 320px) {
    font-size: 19px;
  }
}
h1 {
  font-size: 0.9rem;
}
h2 {
  font-size: 0.75rem;
}
h3 {
  font-size: 0.65rem;
}
h4 {
  font-size: 0.6rem;
}
h5 {
  font-size: 0.55rem;
}
p {
  font-size: 0.55rem;
  font-weight: 400;
  padding: 0 !important;
  margin: 0 !important;
  line-height: 1.25;
}

@keyframes shake {
  0% {
    transform: translate(1px, 1px);
  }
  10% {
    transform: translate(-1px, -2px);
  }
  20% {
    transform: translate(-3px, 0px);
  }
  30% {
    transform: translate(3px, 2px);
  }
  40% {
    transform: translate(1px, -1px);
  }
  50% {
    transform: translate(-1px, 2px);
  }
  60% {
    transform: translate(-3px, 1px);
  }
  70% {
    transform: translate(3px, 1px);
  }
  80% {
    transform: translate(-1px, -1px);
  }
  90% {
    transform: translate(1px, 2px);
  }
  100% {
    transform: translate(1px, -2px);
  }
}
</style>
