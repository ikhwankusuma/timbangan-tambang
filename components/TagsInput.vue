<template>
  <div ref="input" class="input-field">
    <label
      v-if="input.label"
      :class="input.light ? 'light' : 'subtext'"
      class="label"
    >{{ input.label }}
    </label>
    <div class="input-container" :class="input.readonly ? 'readonly' : ''">
      <div class="input-wrapper">
        <div v-if="input.icon" class="icon-container">
          <v-icon class="icon">
            {{ input.icon }}
          </v-icon>
          <div class="divider" />
        </div>
        <div
          ref="chipsContainer"
          class="chips-container"
          :style="!values.length ? 'margin: 0' : ''"
        >
          <div
            v-for="(chip, i) in values"
            :key="i"
            v-ripple
            class="chip"
            @click="values.splice(i, 1)"
          >
            <span class="body-text">{{ chip }}</span>
            <div class="close-btn">
              <v-icon class="icon">
                mdi-close
              </v-icon>
            </div>
          </div>
        </div>
        <input
          v-if="(input.limit && values.length < input.limit) || !input.limit"
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
          @focus="openDd"
          @keypress.enter="keyBind"
          @keydown.up="
            ddIndex =
              ddIndex - 1 < 0 ? visibleSelectionIndex.length - 1 : ddIndex - 1
          "
          @keydown.down="
            ddIndex =
              ddIndex + 1 >= visibleSelectionIndex.length ? 0 : ddIndex + 1
          "
        >
      </div>
      <div :class="focusClass" class="border" />
      <div
        v-if="
          !input.disableIcon &&
            input.selection &&
            input.selection.length > 0 &&
            values.length < input.limit
        "
        class="chevron-icon"
        :style="ddOpened ? 'transform: rotate(180deg)' : ''"
      >
        <v-icon class="icon">
          mdi-chevron-down
        </v-icon>
      </div>
    </div>
    <div v-if="input.rules" class="error-container">
      <div class="message">
        {{ message }}
      </div>
    </div>
    <div
      ref="dropDown"
      v-click-outside="{
        handler: closeDd,
        closeConditional: closeDdCondition,
      }"
      :class="ddOpened ? 'active' : ''"
      class="drop-down"
    >
      <div
        v-for="(selection, i) in visibleSelection"
        :key="i"
        ref="ddValues"
        class="value"
        :class="visibleSelectionIndex[ddIndex] === i ? 'focus' : ''"
        :style="selection.visible ? 'display: flex' : 'display: none'"
        @click="updateModel(selection.value)"
      >
        {{ selection.value }}
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
      init: true,
      message: "",
      model: this.input.model || "",
      values:
        this.input.values && this.input.values.length ? this.input.values : [],
      ddOpenedHandler: false,
      ddIndex: -1,
      visibleSelection: [],
      inputFocused: false,
    };
  },
  computed: {
    allSelection() {
      return this.input.selection;
    },
    ddOpened() {
      return (
        this.ddOpenedHandler &&
        this.input.selection &&
        this.input.selection.length > 0
      );
    },
    visibleSelectionIndex() {
      return this.visibleSelection
        .map((a, i) => (a.visible ? i : null))
        .filter((a) => a !== null);
    },
    rootModel() {
      return this.input.model;
    },
    rootValues() {
      return this.input.values;
    },
    disabled() {
      return !!this.input.disabled;
    },
    focusClass() {
      if (this.inputFocused || this.ddOpened) return "focused";
      if (this.model || (this.values && this.values.length)) return "filled";
      return "";
    },
  },
  watch: {
    model: {
      handler(val) {
        const {
          input: { selection },
        } = this;
        const threshold = this.input.ddThreshold || 0;
        if (selection) {
          if (val.length >= threshold && !this.init) this.openDd();
          else if (val.length < threshold) this.closeDd();
          if (val.length >= threshold || val.length > 2)
            this.visibleSelection = selection.map((a) => {
              return {
                value: a,
                visible: a.toLowerCase().includes(val.toLowerCase()),
              };
            });
          else
            this.visibleSelection = selection.map((a) => {
              return {
                value: a,
                visible: true,
              };
            });
        }
        if (this.init) this.init = false;
      },
      immediate: true,
    },
    values(val) {
      const {
        input: { selection },
        validate,
      } = this;
      if (selection) {
        this.visibleSelection = selection.map((a) => {
          return {
            value: a,
            visible: !val.includes(a),
          };
        });
      }
      validate();
    },
    ddOpened(val) {
      const {
        $refs: { input, dropDown },
      } = this;
      if (val) {
        const { height } = document.body.getBoundingClientRect();
        const { bottom } = input.getBoundingClientRect();
        const space = height - bottom;
        input.style.zIndex = 999999;
        if (dropDown.getBoundingClientRect().height >= space) {
          dropDown.style.top = "auto";
          dropDown.style.bottom = this.input.label
            ? "calc(100% - 1rem)"
            : "100%";
        } else {
          dropDown.style.top = this.input.rules ? "calc(100% - 1rem)" : "100%";
          dropDown.style.bottom = "auto";
        }
      } else {
        input.style.zIndex = 1;
      }
    },
    allSelection: {
      handler(val) {
        if (val) {
          this.visibleSelection = val.map((a) => {
            return {
              value: a,
              visible: true,
            };
          });
        }
      },
      immediate: true,
    },
    rootModel(val) {
      this.model = val;
      this.init = true;
    },
    rootValues(val) {
      this.values = val;
      this.init = true;
    },
  },
  methods: {
    disable(bool) {
      if (typeof bool === "boolean") {
        this.disabled = bool;
        this.model = "";
      }
    },
    validate() {
      this.inputFocused = false;
      const {
        values,
        input: { rules },
      } = this;
      if (!rules || rules.length === 0) return false;
      const rL = rules.length;
      const vL = values.length;
      let message = "";
      for (let i = 0; i < rL; i++) {
        message = rules[i](values);
        if (message) {
          i = rL;
          this.message = message;
          return true;
        }
        for (let j = 0; j < vL; j++) {
          message = rules[i](values[j]);
          if (message) {
            j = vL;
            i = rL;
            this.message = message;
            return true;
          }
          if (i === rL - 1 && j === vL - 1) {
            this.message = "";
            return false;
          }
        }
      }
    },
    updateModel(val) {
      if (
        !this.input.limit ||
        (this.input.limit && this.values.length < this.input.limit)
      ) {
        setTimeout(() => {
          this.model = "";
          this.values.push(val);
          this.$emit("changed", {
            val: this.values,
            input: this.input,
          });
          if (this.values.length === this.input.limit) this.closeDd();
        }, 10);
      }
    },
    openDd() {
      this.inputFocused = true;
      const {
        model,
        input: { selection, ddThreshold },
      } = this;
      if (
        selection &&
        selection.length > 0 &&
        (!ddThreshold || model.length >= ddThreshold)
      ) {
        this.ddOpenedHandler = true;
        this.ddIndex = -1;
      }
    },
    closeDd() {
      this.ddOpenedHandler = false;
    },
    closeDdCondition(e) {
      // Close dropdown if the clicked target is not the same as inputfield
      const { target } = e;
      const {
        $refs: { input: inputField },
      } = this;
      const input = inputField.querySelector("input");
      return this.ddOpenedHandler && target !== input;
    },
    keyBind() {
      const {
        ddOpenedHandler,
        visibleSelection,
        visibleSelectionIndex,
        updateModel,
        model,
        input: { selection },
      } = this;
      if (
        selection &&
        selection.length > 0 &&
        ddOpenedHandler &&
        visibleSelectionIndex.length > 0 &&
        visibleSelection[visibleSelectionIndex[this.ddIndex]]
      )
        updateModel(
          visibleSelection[visibleSelectionIndex[this.ddIndex]].value
        );
      else if (visibleSelectionIndex.length === 0) updateModel(model);
    },
  },
};
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
    font-family: "Quicksand";
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
    background: $background-secondary-color;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    .input-wrapper {
      position: relative;
      width: 100%;
      height: 100%;
      overflow-x: auto;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      .icon-container {
        position: relative;
        width: 2rem;
        height: 100%;
        display: flex;
        flex-shrink: 0;
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
      .chips-container {
        position: relative;
        height: 100%;
        margin-left: 0.25rem;
        flex-shrink: 0;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        .chip {
          cursor: pointer;
          position: relative;
          height: 1.5rem;
          border-radius: 0.75rem;
          padding: 0 0.25rem 0 0.5rem;
          background: rgba($primary-color, 0.1);
          font-family: "Consolas", "Azeret Mono", monospace;
          font-size: 0.6rem;
          font-weight: 600;
          line-height: 1;
          color: $primary-color;
          margin-right: 0.25rem;
          display: flex;
          justify-content: center;
          align-items: center;
          span {
            position: relative;
            color: inherit;
            white-space: nowrap;
          }
          .close-btn {
            color: inherit;
            position: relative;
            width: 0.75rem;
            height: 0.75rem;
            border-radius: 50%;
            margin-left: 0.125rem;
            display: flex;
            justify-content: center;
            align-items: center;
            .icon {
              color: inherit;
              font-size: 0.75rem;
            }
          }
        }
      }
      input.input {
        position: relative;
        width: calc(100% - 2rem);
        height: 100%;
        flex-shrink: 0;
        padding: 0 0.55rem;
        font-family: "Consolas", "Azeret Mono", monospace;
        font-size: 0.6rem;
        font-weight: 600;
        line-height: 1;
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
      &.focused {
        border-color: $primary-color;
      }
      &.filled {
        border-color: $subtext-color;
      }
    }
    .chevron-icon {
      pointer-events: none;
      position: absolute;
      top: 0;
      right: 0;
      width: 2rem;
      height: 100%;
      transition: 0.2s transform;
      display: flex;
      justify-content: center;
      align-items: center;
      .icon {
        position: relative;
      }
    }
    &.readonly {
      pointer-events: none;
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
      font-family: "Quicksand";
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
    z-index: 4;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.5);
  }
  .drop-down {
    pointer-events: none;
    z-index: 2;
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    max-height: 7rem;
    overflow-y: auto;
    box-sizing: border-box;
    border-radius: 0.75rem;
    border: 1px solid $border-color;
    background: $background-color;
    transition: 0.125s transform cubic-bezier(0.25, 0, 0.75, 1), 0.125s opacity;
    opacity: 0;
    transform: translateY(-1rem);
    transform-origin: center top;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    .value {
      cursor: pointer;
      position: relative;
      width: 100%;
      height: 2rem;
      flex-shrink: 0;
      padding: 0 0.5rem;
      box-sizing: border-box;
      font-family: "Consolas", "Azeret Mono", monospace;
      font-size: 0.6rem;
      font-weight: 600;
      transition: 0.2s background-color;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      &.focus {
        background: #dadada !important;
      }
      &:hover {
        background: #eaeaea;
      }
    }
    &.active {
      pointer-events: all;
      opacity: 1;
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
