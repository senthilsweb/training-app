<template>
  <div class="error column a-center j-center t-center">
    <h3 class="m00 mb05">
      Ups! Coś poszło nie tak.
    </h3>
    <div class="pt05 pb0">
      <p class="m00">
        Kod błędu:
      </p>
      <p class="m00">{{ error.statusCode }}: {{ error.message }}</p>
    </div>
    <button type="button" class="button-primary mt1" @click="reload">
      Odśwież
    </button>
  </div>
</template>

<script>
export default {
  props: ["error"],
  methods: {
    reload() {
      window.location.reload()
    },
  },
}
</script>

<style lang="scss" scoped>
.error {
  height: 100vh;
}
</style>
