<template>
  <div class="home">
    <h2>Практика 27: Базовый генератор цветовых палитр</h2>
    <BasicPaletteGenerator />
  </div>
</template>

<script>
import BasicPaletteGenerator from '../components/BasicPaletteGenerator.vue'

export default {
  name: 'HomeView',
  components: {
    BasicPaletteGenerator
  }
}
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
}

.home h2 {
  margin-bottom: 30px;
  text-align: center;
  color: #333;
}
</style>