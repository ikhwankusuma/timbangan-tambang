<template>
  <div
    v-ripple
    :style="
      disabled
        ? 'background: #e3e3e3; border-color: #e3e3e3; pointer-events: none;'
        : ''
    "
    :class="primary ? 'primary-color' : ''"
    class="button"
    @click="$emit('clicked')"
  >
    <v-icon v-if="!loading" class="icon">
      {{ icon }}
    </v-icon>
    <div v-if="!loading" class="text">
      {{ text }}
    </div>
    <v-progress-circular v-else indeterminate :size="20" :width="3" />
  </div>
</template>

<script>
  export default {
    props: {
      icon: {
        type: String,
        required: false,
      },
      text: {
        type: String,
        required: false,
      },
      primary: {
        type: Boolean,
        default: false,
      },
      disabled: {
        type: Boolean,
        default: false,
      },
      loading: {
        type: Boolean,
        default: false,
      },
    },
  };
</script>

<style lang="scss" scoped>
  .button {
    cursor: pointer;
    position: relative;
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 50%;
    border: 1px solid $border-color;
    display: flex;
    justify-content: center;
    align-items: center;
    .icon {
      font-size: 0.85rem;
      color: inherit;
    }
    .text {
      font-family: "Consolas", "Azeret Mono", monospace;
      font-size: 0.65rem;
      font-weight: 600;
      letter-spacing: 0.125rem;
      color: inherit;
    }
    &.primary-color {
      background: $primary-color;
      border-color: $primary-color;
      color: #fff;
    }
  }
</style>
