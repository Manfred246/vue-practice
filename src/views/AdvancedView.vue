<template>
  <div class="advanced-view">
    <h2>Практика 28: Продвинутый генератор цветовых палитр</h2>
    <AdvancedPaletteGenerator />
  </div>
</template>

<script>
import AdvancedPaletteGenerator from '../components/AdvancedPaletteGenerator.vue'

export default {
  name: 'AdvancedView',
  components: {
    AdvancedPaletteGenerator
  }
}
</script>

<style scoped>
.advanced-view {
  max-width: 1200px;
  margin: 0 auto;
}

.advanced-view h2 {
  margin-bottom: 30px;
  text-align: center;
  color: #333;
}
</style>