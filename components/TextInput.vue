<template>
  <div ref="inputField" class="input-field">
    <label
      v-if="input.label"
      :class="input.light ? 'light' : 'subtext'"
      class="label"
    >{{ input.label }}</label>
    <div class="input-container">
      <input
        ref="input"
        v-model="model"
        :type="input.type"
        class="input"
        :class="input.readonly ? 'invincible' : ''"
        :placeholder="input.placeholder"
        :readonly="input.readonly || disabled"
        :tabindex="input.readonly || disabled ? '-1' : '0'"
        :autocomplete="input.autocomplete || ''"
        :style="input.icon ? '' : 'width: 100%; padding-left: 0.75rem;'"
        @blur="validate"
        @input="updateModel"
      >
      <div v-if="input.icon" class="icon-container">
        <v-icon class="icon">
          {{ input.icon }}
        </v-icon>
        <div class="divider" />
      </div>
      <div class="border" />
      <div v-if="input.append" class="append subtext">
        <h4>{{ input.append }}</h4>
      </div>
    </div>
    <div v-if="input.rules" class="error-container">
      <div class="message">
        {{ message }}
      </div>
    </div>
    <div v-if="disabled" class="overlay" />
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
      message: '',
      model: this.input.model || '',
    }
  },
  computed: {
    rootModel() {
      return this.input.model
    },
    disabled() {
      return !!this.input.disabled
    }
  },
  watch: {
    rootModel(val) {
      this.model = val
    },
  },
  methods: {
    disable(bool) {
      if (typeof bool === 'boolean') {
        this.disabled = bool
        this.model = ''
      }
    },
    validate() {
      const value = this.model
      const { rules } = this.input
      const { inputField: input } = this.$refs
      if (!rules || rules.length === 0) return
      const rL = rules.length
      let message = ''
      for (let i = 0; i < rL; i++) {
        message = rules[i](value)
        if (message) {
          i = rL
          this.message = message
          input.classList.add('err')
          return true
        }
        if (i === rL - 1) {
          input.classList.remove('err')
        }
      }
    },
    updateModel() {
      let { model: val } = this
      if (this.input.placeholder === 'hh') {
        val = Math.abs(parseInt(val))
        if (isNaN(val)) val = '00'
        else if (val > 23) {
          val = '23'
        } else if (val < 10) val = `0${val}`
      } else if (this.input.placeholder === 'MM') {
        val = Math.abs(parseInt(val))
        if (isNaN(val)) val = '00'
        else if (val > 59) val = '59'
        else if (val < 10) val = `0${val}`
      }
      this.model = val
      this.$emit('changed', {
        val,
        input: this.input,
      })
    },
    focus() {
      this.$refs.input.focus()
    },
  },
}
</script>

<style lang="scss" scoped>
.input-field {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  label.label {
    position: relative;
    height: 1rem;
    font-family: 'Quicksand';
    font-size: 0.55rem;
    font-weight: 600;
    line-height: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    transform: translateX(0.75rem);
    &.light {
      font-weight: 400;
    }
  }
  .input-container {
    z-index: 2;
    position: relative;
    width: 100%;
    height: 2rem;
    border-radius: 0.75rem;
    overflow: hidden;
    background: $background-secondary-color;
    display: flex;
    flex-direction: row-reverse;
    justify-content: flex-start;
    align-items: center;
    .icon-container {
      position: relative;
      width: 2rem;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      .icon {
        position: relative;
        font-size: 0.85rem;
      }
      .divider {
        position: absolute;
        top: calc(50% - 0.25rem);
        right: 0;
        width: 1px;
        height: 0.5rem;
        background: $subtext-color;
        opacity: 0.25;
      }
    }
    .border {
      pointer-events: none;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border-radius: 0.75rem;
      box-sizing: border-box;
      border: 2px solid $background-secondary-color;
      transition: border-color 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    }
    input.input {
      position: relative;
      width: calc(100% - 2rem);
      height: 100%;
      padding: 0 0.55rem;
      font-family: 'Consolas', 'Azeret Mono', monospace;
      font-size: 0.6rem;
      font-weight: 600;
      color: $text-color;
      &.invincible {
        pointer-events: none;
      }
      &:not(:placeholder-shown) {
        ~ .border {
          border-color: $subtext-color;
        }
      }
      &:focus {
        outline: none;
        ~ .border {
          border-color: $primary-color;
        }
      }
    }
    .append {
      position: absolute;
      top: 0;
      right: 0;
      width: 2rem;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      h4 {
        position: relative;
        font-family: 'Quicksand';
      }
    }
  }
  .error-container {
    z-index: 1;
    pointer-events: none;
    position: relative;
    width: 100%;
    height: 1rem;
    transition: transform 0.3s cubic-bezier(0.75, 0, 0.75, 0.2);
    transform: translateY(-100%);
    display: flex;
    justify-content: flex-start;
    align-items: center;
    .message {
      transform: translateX(0.75rem);
      font-family: 'Quicksand';
      font-size: 0.55rem;
      font-weight: 400;
      line-height: 1;
      color: $error-color;
    }
  }
  &.err {
    .border {
      border-color: $error-color !important;
    }
    .error-container {
      transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
      transform: translateY(0);
    }
  }
  .overlay {
    z-index: 9999;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.5);
  }
}
</style>
