<template>
  <div class="panel">
    <div class="header">
      <h3 class="name">
        Filter
      </h3>
      <div v-ripple class="close-btn" @click="$emit('close-panel')">
        <v-icon class="icon">
          mdi-close
        </v-icon>
      </div>
    </div>
    <div class="body">
      <div class="input-row" style="z-index: 30">
        <selection-input
          v-if="type === 1"
          ref="statusInput"
          style="width: calc(50% - 0.25rem); margin-right: 0.25rem"
          :input="statusInput"
        />
        <selection-input
          ref="materialInput"
          :style="
            type === 1 ? 'width: calc(50% - 0.25rem); margin-left: 0.25rem' : ''
          "
          :input="materialInput"
        />
      </div>
      <div class="input-row" style="z-index: 25">
        <selection-input
          ref="customerInput"
          style="width: calc(50% - 0.25rem); margin-right: 0.25rem"
          :input="customerInput"
        />
        <selection-input
          ref="supplierInput"
          style="width: calc(50% - 0.25rem); margin-left: 0.25rem"
          :input="supplierInput"
        />
      </div>
      <div class="input-row" style="z-index: 20">
        <date-input
          ref="minDateInput"
          :input="minDateInput"
          style="width: calc(50% - 0.25rem); margin-right: 0.25rem"
        />
        <date-input
          ref="maxDateInput"
          :input="maxDateInput"
          style="width: calc(50% - 0.25rem); margin-left: 0.25rem"
        />
      </div>
      <div style="height: 2rem" class="input-row">
        <div v-ripple class="confirm-btn btn" @click="applyFilter">
          <span>Terapkan</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    filter: Object,
    materials: Array,
    customers: Array,
    suppliers: Array,
  },
  data() {
    return {
      statusInput: {
        label: 'Status',
        type: 'text',
        model: this.filter.status || '',
        placeholder: '...',
        selection: ['inside', 'completed'],
      },
      materialInput: {
        label: 'Material',
        type: 'text',
        model: this.filter.material || '',
        placeholder: '...',
        selection: this.materials || null,
      },
      customerInput: {
        label: 'Customer',
        type: 'text',
        model: this.filter.customer || '',
        placeholder: '...',
        disabled: false,
        readonly: false,
        selection: this.customers || null,
      },
      supplierInput: {
        label: 'Supplier',
        type: 'text',
        model: this.filter.supplier || '',
        placeholder: '...',
        disabled: false,
        readonly: false,
        selection: this.suppliers || null,
      },
      minDateInput: {
        label: 'Mulai dari',
        type: 'text',
        model: this.filter.minDate
          ? new Date(this.filter.minDate)
              .toISOString()
              .substr(0, 10)
              .split('-')
              .reverse()
              .join('-')
          : '',
        value: this.filter.minDate
          ? new Date(this.filter.minDate).getTime()
          : null,
        placeholder: '...',
      },
      maxDateInput: {
        label: 'Sampai dengan',
        type: 'text',
        model: this.filter.maxDate
          ? new Date(this.filter.maxDate)
              .toISOString()
              .substr(0, 10)
              .split('-')
              .reverse()
              .join('-')
          : '',
        value: this.filter.maxDate
          ? new Date(this.filter.maxDate).getTime()
          : null,
        placeholder: '...',
      },
    }
  },
  computed: {
    type() {
      return this.$store.getters.type
    },
    status() {
      return this.statusInput.model || null
    },
    material() {
      return this.materialInput.model || null
    },
    customer() {
      return this.customerInput.model || null
    },
    supplier() {
      return this.supplierInput.model || null
    },
    minDate() {
      return this.minDateInput.value || null
    },
    maxDate() {
      return this.maxDateInput.value || null
    },
  },
  watch: {
    customer: {
      handler(val) {
        if (val) {
          this.supplierInput.disabled = true
          this.supplierInput.readonly = true
        } else {
          this.supplierInput.disabled = false
          this.supplierInput.readonly = false
        }
      },
      immediate: true,
    },
    supplier: {
      handler(val) {
        if (val) {
          this.customerInput.disabled = true
          this.customerInput.readonly = true
        } else {
          this.customerInput.disabled = false
          this.customerInput.readonly = false
        }
      },
      immediate: true,
    },
  },
  methods: {
    applyFilter() {
      setTimeout(() => {
        const { status, material, customer, supplier, minDate, maxDate } = this
        this.$emit('filter-data', {
          status,
          material,
          customer,
          supplier,
          minDate,
          maxDate,
        })
      }, 100)
    },
  },
}
</script>

<style lang="scss" scoped>
.panel {
  z-index: 200;
  position: absolute;
  top: 100%;
  right: 0;
  width: 15rem;
  padding: 1rem;
  border: 1px solid $border-color;
  border-radius: 1rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  .header {
    position: relative;
    width: 100%;
    height: 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    h3.name {
      position: relative;
      line-height: 1;
      font-family: 'Quicksand';
    }
    .close-btn {
      cursor: pointer;
      position: relative;
      width: 1.5rem;
      height: 1.5rem;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
  .body {
    position: relative;
    width: 100%;
    margin-top: 0.5rem;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    .input-row {
      position: relative;
      width: 100%;
      height: 4rem;
      overflow-y: visible;
      display: flex;
      justify-content: center;
      align-items: flex-start;
    }
    .btn {
      cursor: pointer;
      position: relative;
      width: 100%;
      height: 2rem;
      border-radius: 0.25rem;
      font-family: 'Quicksand';
      font-size: 0.65rem;
      font-weight: 600;
      background: $primary-color;
      display: flex;
      justify-content: center;
      align-items: center;
      transition: 0.25s background-color, 0.25s color;
      color: #fff;
      &.disabled {
        pointer-events: none;
        background: rgba($font-color, 0.2);
        color: $font-color;
      }
    }
  }
  &::before {
    content: '';
    pointer-events: none;
    position: absolute;
    z-index: -2;
    top: calc(4rem / 3);
    right: calc(4rem / 3);
    left: calc(4rem / 3);
    bottom: calc(-4rem / 3);
    border-radius: 1rem;
    background: #cfcfcf;
    -webkit-filter: blur(86.985px);
    filter: blur(86.985px);
  }
  &::after {
    content: '';
    pointer-events: none;
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    border-radius: 1rem;
    z-index: -1;
    background: #fff;
  }
}
</style>
