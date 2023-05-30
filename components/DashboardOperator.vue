<template>
  <div class="operators-list">
    <div class="header">
      <div class="placeholder">
        {{ data.name }}
      </div>
      <div class="icon-container">
        <v-icon class="icon">
          mdi-account-multiple-outline
        </v-icon>
      </div>
    </div>
    <div class="body">
      <div v-for="(item, i) in data.data" :key="i" class="item">
        <div class="name-container">
          <div class="name">
            {{ item.id }}
          </div>
        </div>
        <div class="status" :class="item.status">
          <div class="name">
            {{ item.status }}
          </div>
          <div class="color" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
}
</script>

<style lang="scss" scoped>
.operators-list {
  position: relative;
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.75rem;
  margin-bottom: 0.5rem;
  border: 1px solid $border-color;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  > .header {
    position: relative;
    padding: 0;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .placeholder {
      position: relative;
      font-family: 'Quicksand';
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
  > .body {
    position: relative;
    width: 100%;
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    .item {
      position: relative;
      width: 100%;
      height: 1.5rem;
      margin-bottom: 0.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      .name-container {
        position: relative;
        height: 100%;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        .color {
          position: relative;
          width: 1rem;
          height: 1rem;
          margin-right: 0.5rem;
          border-radius: 0.25rem;
          background: brown;
        }
        .name {
          position: relative;
          font-family: 'Consolas', 'Azeret Mono', monospace;
          font-size: 0.6rem;
          font-weight: 600;
          line-height: 1;
          color: $text-color;
        }
      }
      .status {
        position: relative;
        height: 100%;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        .name {
          position: relative;
          font-family: 'Consolas', 'Azeret Mono', monospace;
          font-size: 0.6rem;
          font-weight: 600;
          line-height: 1;
          color: inherit;
        }
        .color {
          position: relative;
          width: 1rem;
          height: 1rem;
          margin-left: 0.5rem;
          border-radius: 0.25rem;
          background: $primary-color;
        }
        &.online {
          color: $primary-color;
          .color {
            background: $primary-color;
          }
        }
        &.offline {
          color: $error-color;
          .color {
            background: $error-color;
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
