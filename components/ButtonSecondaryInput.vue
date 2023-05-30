<template>
  <div
    class="button-container"
    :class="`${error ? 'err ' : ''}${outlined ? 'outlined ' : ''}${type}`"
  >
    <button
      v-ripple
      class="button"
      :class="disabled ? 'disabled' : ''"
      :style="loading ? 'pointer-events: none' : ''"
      :aria-label="label"
      @click="clicked"
    >
      <div class="label-container">
        <label class="label">{{ label }}</label>
      </div>
      <div v-if="icon" class="icon-container">
        <v-icon v-if="!loading" class="icon">
          {{ icon }}
        </v-icon>
        <v-progress-circular v-else indeterminate :size="20" :width="3" />
      </div>
    </button>
    <div v-if="typeof error === 'string'" class="error-container">
      <div class="message">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    label: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    outlined: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      default: 'primary'
    },
    error: {
      type: String,
    },
  },
  methods: {
    clicked(e) {
      e.preventDefault()
      this.$emit('clicked')
    },
  },
}
</script>

<style lang="scss" scoped>
.button-container {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  .button {
    z-index: 2;
    position: relative;
    width: 100%;
    height: 2rem;
    border-radius: 0.75rem;
    padding: 0.25rem;
    background: $primary-color;
    color: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: 0.125s background-color, 0.125s border-color;
    .icon-container {
      position: relative;
      width: 1.5rem;
      height: 1.5rem;
      background: rgba(#fff, 0.2);
      border-radius: 0.5rem;
      display: flex;
      justify-content: center;
      align-items: center;
      .icon {
        color: #fff;
        font-size: 0.85rem;
      }
    }
    .label-container {
      position: relative;
      width: calc(100% - 1.5rem);
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      label.label {
        cursor: pointer;
        position: relative;
        line-height: 1;
        font-family: 'Consolas', 'Azeret Mono', monospace;
        font-size: 0.55rem;
        font-weight: 600;
        letter-spacing: 0.125rem;
        color: inherit;
        transition: 0.125s color;
      }
    }
    &.disabled {
      pointer-events: none;
      background: $background-secondary-color;
      border-color: $background-secondary-color;
      color: $text-color;
    }
  }
  .error-container {
    z-index: 1;
    pointer-events: none;
    position: relative;
    height: 1rem;
    transition: transform 0.3s cubic-bezier(0.75, 0, 0.75, 0.2);
    transform: translateY(-100%);
    display: flex;
    justify-content: flex-start;
    align-items: center;
    .message {
      font-family: 'Quicksand';
      font-size: 0.55rem;
      font-weight: 400;
      line-height: 1;
      color: $error-color;
    }
  }
  &.err {
    .button {
      background: $error-color;
      border-color: $error-color;
    }
    .error-container {
      transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
      transform: translateY(0);
    }
  }
  &.danger {
    .button {
      background: $error-color;
      border-color: $error-color;
    }
  }
  &.outlined {
    .button {
      background: $background-color !important;
      color: $primary-color;
      padding: calc(0.25rem - 2px);
      border: 2px dashed $primary-color;
      .icon-container {
        background: rgba($primary-color, 0.1);
        .icon {
          color: $primary-color;
        }
      }
    }
    &.danger {
      .button {
        color: $error-color;
        border-color: $error-color;
      }
      .icon-container {
        background: rgba($error-color, 0.1);
        .icon {
          color: $error-color;
        }
      }
    }
  }
}
</style>
