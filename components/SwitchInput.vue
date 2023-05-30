<template>
  <div class="input" :class="input.readonly ? 'readonly' : ''">
    <div
      :class="model === input.options[0] ? 'active' : ''"
      class="label"
      @click="model = input.options[0]"
    >
      {{ input.options[0] }}
    </div>
    <div
      :class="model === input.options[1] ? 'active' : ''"
      class="label"
      @click="model = input.options[1]"
    >
      {{ input.options[1] }}
    </div>
    <div
      :style="model === input.options[1] ? 'transform: translateX(100%)' : ''"
      class="switch"
    />
  </div>
</template>

<script>
export default {
  props: {
    input: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      model: '',
    }
  },
  computed: {
    rootModel() {
      return this.input.model
    },
  },
  watch: {
    model(val) {
      this.$emit('changed', {
        val,
        input: this.input,
      })
    },
    rootModel(val) {
      this.model = val
    },
  },
  mounted() {
    this.model = this.input.options[0]
  },
}
</script>

<style lang="scss" scoped>
.input {
  position: relative;
  width: 100%;
  height: 2rem;
  border-radius: 0.75rem;
  background: $background-secondary-color;
  display: flex;
  justify-content: space-between;
  align-items: center;
  .label {
    cursor: pointer;
    z-index: 2;
    position: relative;
    width: 50%;
    height: 100%;
    color: $subtext-color;
    font-size: 0.65rem;
    font-weight: 600;
    font-family: 'Quicksand';
    display: flex;
    justify-content: center;
    align-items: center;
    transition: 0.2s color ease-in-out;
    &.active {
      color: #fff;
    }
  }
  .switch {
    z-index: 1;
    position: absolute;
    top: 0.25rem;
    left: 0.25rem;
    width: calc(50% - 0.25rem);
    height: calc(100% - 0.5rem);
    background: $primary-color;
    border-radius: 0.5rem;
    transition: 0.2s transform ease-in-out;
  }
  &.readonly {
    pointer-events: none;
    background: rgba($background-secondary-color, 0.5);
    h4.label:not(.active) {
      color: rgba(0, 0, 0, 0.1);
    }
  }
}
</style>
