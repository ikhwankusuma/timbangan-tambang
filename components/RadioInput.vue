<template>
  <div class="input" :class="input.readonly ? 'readonly' : ''">
    <label
      v-if="input.label"
      :class="input.light ? 'light' : 'subtext'"
      class="label"
      >{{ input.label }}</label
    >
    <div class="selections">
      <div
        v-for="selection in input.selections"
        :key="selection.value"
        :class="input.model === selection.value ? 'active' : ''"
        class="selection"
        @click="changeVal(selection.value)"
      >
        <input class="input" type="radio" :name="input.label" :value="selection.value" :checked="input.model === selection.value" @change="changeVal(selection.value)">
        <div class="details-container">
          <div class="name-container">
            <div class="dot">
              <div class="inner-dot" />
            </div>
            <div class="name">
              {{ selection.name }}
            </div>
          </div>
          <div v-if="selection.desc" class="details">
            <div class="desc">
              {{ selection.desc }}
            </div>
          </div>
        </div>
      </div>
    </div>
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
  methods: {
    changeVal(val) {
      this.$emit("changed", {
        input: this.input,
        val,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.input {
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
  .selections {
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    .selection {
      cursor: pointer;
      position: relative;
      width: 100%;
      margin-bottom: 0.5rem;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-end;
      input.input {
        z-index: 0;
        pointer-events: none;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        &:focus ~ .details-container {
          border-color: $font-color;
          .dot {
            background: $font-color;
            .inner-dot {
              transform: scale(1);
            }
          }
        }
      }
      .details-container {
        position: relative;
        width: 100%;
        padding: 0.75rem;
        border: 2px solid $border-color;
        border-radius: 0.75rem;
        transition: 0.25s border-color;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-end;
        .name-container {
          position: relative;
          width: 100%;
          height: 0.75rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          .dot {
            position: relative;
            width: 0.75rem;
            height: 0.75rem;
            border-radius: 50%;
            background: #eee;
            display: flex;
            justify-content: center;
            align-items: center;
            transition: 0.25s background-color;
            .inner-dot {
              position: relative;
              width: 0.5rem;
              height: 0.5rem;
              border-radius: 50%;
              background: #fff;
              transform: scale(0);
              transition: 0.25s transform;
            }
          }
          .name {
            position: relative;
            width: calc(100% - 0.75rem);
            padding-left: 0.75rem;
            box-sizing: border-box;
            font-family: "Consolas", "Azeret Mono", monospace;
            font-size: 0.6rem;
            font-weight: 600;
            color: $text-color;
          }
        }
        .details {
          position: relative;
          width: calc(100% - 0.75rem);
          margin-top: 0.25rem;
          padding-left: 0.75rem;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-start;
          .desc {
            font-family: "Quicksand";
            font-size: 0.55rem;
          }
        }
      }
      &.active {
        .details-container {
          border-color: $primary-color;
          .dot {
            background: $primary-color;
            .inner-dot {
              transform: scale(1);
            }
          }
        }
      }
      &:last-child {
        margin: 0;
      }
    }

  }
}
</style>
