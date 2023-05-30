<template>
  <div class="print-container">
    <div class="body">
      <nuxt />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.print-container {
  position: fixed;
  width: 11in;
  height: 8.5in;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  .body {
    position: relative;
    width: 9cm;
    height: 100%;
  }
}
</style>

<style lang="scss">
html,
body {
  position: relative;
  width: 11in;
  height: 8.5in;
  margin: 0;
  padding: 0;
}
</style>
