<template>
  <form ref="component" class="form" @keydown="submit">
    <div class="wrapper">
      <div class="header">
        <div class="action">
          <div class="button">
            <round-button :icon="'mdi-close'" @clicked="exit" />
            <div class="tooltip">
              <div class="placeholder">Keluar</div>
            </div>
          </div>
          <div class="button">
            <round-button
              :icon="'mdi-ticket-confirmation-outline'"
              @clicked="printReceipt"
            />
            <div class="tooltip">
              <div class="placeholder">Simpan & print</div>
            </div>
          </div>
          <div class="button">
            <round-button
              :icon="'mdi-check'"
              :primary="true"
              :disabled="!license || (!customer && !supplier) || !material"
              @clicked="submit"
            />
            <div class="tooltip">
              <div class="placeholder">Simpan</div>
            </div>
          </div>
        </div>
        <div class="main-information">
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
          <div class="page-title">{{ data ? "Ubah Data" : "Tambah Data" }}</div>
        </div>
      </div>
      <div v-if="!reEdit" class="scale-field">
        <div class="scale-header">
          <div class="placeholder">Hasil timbang</div>
          <div class="icon-container">
            <v-icon class="icon"> mdi-weight </v-icon>
          </div>
        </div>
        <div v-if="config && config.type === 1" class="scale-value">
          <div class="prev-value-container">
            <div class="name">Timbang masuk</div>
            <div class="value-container">
              <span class="value">{{ data ? data.entry_weight : weight }}</span>
              <span class="placeholder">kg</span>
            </div>
          </div>
          <div v-if="data" class="then-value-container">
            <div class="name">Timbang keluar</div>
            <div class="value-container">
              <span class="value">{{ weight }}</span>
              <span class="placeholder">kg</span>
            </div>
          </div>
        </div>
        <div v-if="weighError" class="error-overlay">
          <span class="message">Timbangan tidak terdeteksi</span>
          <button-input
            :label="'Refresh'"
            :loading="weighRefresh"
            style="margin-top: 1rem"
            @clicked="refreshWeigh"
          />
        </div>
      </div>
      <div class="text-input-field">
        <radio-input
          v-if="!data && config.plugins.includes(3)"
          ref="typeInput"
          :input="typeInput"
          style="margin-bottom: 1rem"
          @changed="changeVal"
        />
        <selection-input :input="materialInput" @changed="changeVal" />
        <text-input
          :input="licenseInput"
          style="margin-bottom: 0"
          @changed="changeVal"
        />
        <selection-input :input="supplierInput" @changed="changeVal" />
        <selection-input :input="customerInput" @changed="changeVal" />
        <text-area-input :input="notesInput" @changed="changeVal" />
      </div>
    </div>
  </form>
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
      },
    },
    data() {
      return {
        print: false,
        reEdit: false,
        errorMessage: "",
        typeInput: {
          label: "Tipe kendaraan",
          model: 0,
          selections: [
            {
              name: "Truk Besar",
              value: 0,
            },
            {
              name: "Truk Kecil",
              value: 1,
            },
          ],
        },
        licenseInput: {
          label: "Nomor kendaraan",
          type: "text",
          icon: "",
          rules: [this.notEmpty],
          placeholder: "L 1 K...",
          model: "",
        },
        materialInput: {
          label: "Material",
          type: "text",
          icon: "",
          placeholder: "Minyak...",
          model: "",
          disabled: false,
          selection: [],
        },
        supplierInput: {
          label: "Supplier",
          type: "text",
          icon: "",
          placeholder: "Nama supplier...",
          model: "",
          disabled: false,
          selection: [],
        },
        customerInput: {
          label: "Customer",
          type: "text",
          icon: "",
          placeholder: "Nama customer...",
          model: "",
          disabled: false,
          selection: [],
        },
        notesInput: {
          label: "Notes",
          type: "text",
          placeholder: "Catatan...",
          model: "",
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
        loading: false,
        weight: 0,
        images: [],
        weighError: false,
        weighRefresh: false,
      };
    },
    computed: {
      config() {
        return this.$store.getters.config;
      },
      license() {
        return this.licenseInput.model;
      },
      material() {
        return this.materialInput.model;
      },
      materials() {
        return this.$store.getters["scales/materials"];
      },
      supplier() {
        return this.supplierInput.model;
      },
      suppliers() {
        return this.$store.getters["scales/suppliers"];
      },
      customer() {
        return this.customerInput.model;
      },
      customers() {
        return this.$store.getters["scales/customers"];
      },
      notes() {
        return this.notesInput.model;
      },
      type() {
        return this.typeInput.model;
      },
      role() {
        return this.$store.getters["user/role"];
      },
    },
    watch: {
      supplier(val) {
        if (val) this.customerInput.disabled = true;
        else this.customerInput.disabled = false;
      },
      customer(val) {
        if (val) this.supplierInput.disabled = true;
        else this.supplierInput.disabled = false;
      },
      license(val) {
        this.licenseInput.model = val.trim();
        if (this.licenseInput.model && val)
          this.licenseInput.model = val
            .match(/[a-zA-Z]+|[0-9]+/g)
            .join(" ")
            .toUpperCase();
      },
      suppliers: {
        handler(val) {
          if (val) this.supplierInput.selection = val.map((a) => a._id);
        },
        immediate: true,
      },
      customers: {
        handler(val) {
          if (val) this.customerInput.selection = val.map((a) => a._id);
        },
        immediate: true,
      },
      materials: {
        handler(val) {
          if (val) this.materialInput.selection = val.map((a) => a._id);
        },
        immediate: true,
      },
      data: {
        handler(val) {
          if (val) {
            this.materialInput.model = val.material || "";
            this.licenseInput.model = val.license || "";
            this.customerInput.model = val.customer || "";
            this.supplierInput.model = val.supplier || "";
            this.notesInput.model = val.notes || "";
          }
        },
        immediate: true,
      },
    },
    mounted() {
      if (this.data) {
        if (this.data.exit_weight) {
          this.customerInput.disabled = true;
          this.materialInput.disabled = true;
          this.supplierInput.disabled = true;
          this.reEdit = true;
        }
      }
      const {
        $refs: { component },
      } = this;
      this.anim = animate.init(component, null, () => {
        this.$emit("exit");
      });
      this.$root.$emit("open-add-form");
      this.$root.$on("weigh-error", () => {
        this.weighError = true;
      });
      this.$root.$on("refresh-scales", () => {
        this.weighRefresh = true;
      });
      this.$root.$on("refresh-done", () => {
        this.weighRefresh = false;
        this.weighError = false;
      });
      this.$root.$on("weight-update", (weight) => {
        this.weight = weight;
      });
      this.$root.$on("images-return", (images) => {
        this.images = images;
      });
    },
    methods: {
      notEmpty(str) {
        return str && str.toString().length ? "" : "Kolom wajib diisi";
      },
      exit() {
        this.$root.$emit("close-cameras");
        this.anim.reverse();
      },
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
      refreshWeigh() {
        this.$root.$emit("refresh-weigh");
      },
      async submit(e) {
        if (
          !this.loading &&
          (!e ||
            e.type !== "keydown" ||
            (e && e.type === "keydown" && e.shiftKey && e.keyCode === 13))
        ) {
          try {
            this.loading = true;
            const {
              license,
              material,
              customer,
              supplier,
              notes,
              weight,
              config,
              type,
              print,
            } = this;
            if (!license || (!customer && !supplier) || !material)
              throw new Error("Terdapat kolom yang belum diisi");
            if (this.data) {
              const payload = {
                id: this.data._id,
                license,
                material,
                customer,
                supplier,
                notes,
                print,
                exit_weight: this.data.exit_weight
                  ? this.data.exit_weight
                  : weight,
              };
              if (this.config.plugins.includes(1)) {
                this.$root.$emit("images-request");
                payload.images = this.images;
              }
              const { message, data } = await this.$store.dispatch(
                "scales/editScale",
                payload
              );
              if (message !== "SUCCESS") throw new Error(message);
              if (this.print) this.$root.$emit("print-receipt", data);
              this.$root.$emit("new-data");
            } else {
              const payload = {
                print,
                license,
                material,
                customer,
                supplier,
                notes,
                type,
                weight: config.type === 2 ? weight : undefined,
                entry_weight: config.type === 1 ? weight : undefined,
                location: config.location,
              };
              if (this.config.plugins.includes(1)) {
                this.$root.$emit("images-request");
                payload.images = this.images;
              }
              if (!license) throw new Error("Nomor Kendaraan wajib diisi!");
              const { message, data } = await this.$store.dispatch(
                "scales/uploadScale",
                payload
              );
              if (message !== "SUCCESS") throw new Error(message);
              if (this.print) this.$root.$emit("print-receipt", data);
              this.$root.$emit("new-data");
            }
            this.exit();
          } catch (e) {
            this.loading = false;
            if (e.message === "NO_SCALES_SELECTED")
              this.errorMessage = "Silahkan pilih timbangan";
            else if (e.message === "NO_SCALES_DETECTED")
              this.errorMessage = "Tidak ada timbangan terdeteksi";
            else this.errorMessage = e.message;
            this.$root.$emit("shake");
          }
        }
      },
      printReceipt() {
        this.print = true;
        this.submit();
      },
    },
  };
</script>

<style lang="scss" scoped>
  .form {
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
          .button {
            justify-content: center;
            align-items: center;
            display: flex;
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
        .main-information {
          position: relative;
          width: 100%;
          margin-top: 2rem;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          align-items: flex-start;
          .error-message {
            position: relative;
            font-family: "Quicksand";
            font-size: 0.75rem;
            font-weight: 400;
            line-height: 1;
            color: $error-color;
          }
          .page-title {
            position: relative;
            margin: 0.25rem 0;
            font-family: "Consolas", "Azeret Mono", monospace;
            font-size: 1rem;
            font-weight: 600;
            line-height: 1;
            color: $text-color;
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
        overflow: hidden;
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
          margin: 1rem 0 0.5rem 0;
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
        > .error-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(#000, 0.75);
          padding: 0 3rem;
          box-sizing: border-box;
          backdrop-filter: blur(5px);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          span.message {
            position: relative;
            font-family: "Quicksand";
            font-size: 0.75rem;
            font-weight: 400;
            line-height: 1;
            color: #fff;
          }
        }
      }
      .details {
        position: relative;
        width: 100%;
        margin-bottom: 1rem;
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
      .text-input-field {
        position: relative;
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        > * {
          margin-bottom: 1rem;
          &:last-child {
            margin-bottom: 2rem;
          }
        }
      }
      .button-input-field {
        position: relative;
        width: 100%;
        margin-top: 0.5rem;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
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
