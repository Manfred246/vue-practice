<template>
  <div class="basic">
    <div class="controls">
      <button @click="generateRandomPalette" class="generate-btn">
        Случайная палитра
      </button>
      <div class="settings">
        <div class="setting">
          <label>Цветов:</label>
          <select v-model="colorCount" @change="generateRandomPalette">
            <option value="3">3</option>
            <option value="5">5</option>
            <option value="7">7</option>
          </select>
        </div>
        <div class="setting">
          <label>Формат:</label>
          <select v-model="colorFormat">
            <option value="hex">HEX</option>
            <option value="rgb">RGB</option>
          </select>
        </div>
      </div>
    </div>

    <div class="palette">
      <div 
        v-for="(color, index) in colors" 
        :key="index"
        class="color"
        :style="{ backgroundColor: color.hex }"
        @click="copyColor(color)"
      >
        <span class="color-value">
          {{ colorFormat === 'hex' ? color.hex : color.rgb }}
        </span>
        <button 
          class="lock-btn"
          @click.stop="toggleLock(index)"
          :title="color.locked ? 'Разблокировать' : 'Заблокировать'"
        >
          {{ color.locked ? '🔒' : '🔓' }}
        </button>
      </div>
    </div>

    <div v-if="notification" class="notification">
      Скопировано: {{ copiedColor }}
    </div>

    <div class="preview">
      <h3>Превью</h3>
      <button @click="darkMode = !darkMode">
        {{ darkMode ? 'Светлый фон' : 'Тёмный фон' }}
      </button>
      <div class="preview-content" :class="{ dark: darkMode }">
        <div class="mockup">
          <div class="header" :style="{ backgroundColor: colors[0]?.hex || '#667eea' }">
            Заголовок
          </div>
          <div class="body">
            <button :style="{ backgroundColor: colors[1]?.hex || '#4ecdc4' }">
              Кнопка
            </button>
            <div class="card" :style="{ borderColor: colors[2]?.hex || '#ddd' }">
              Карточка
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'

export default {
  name: 'BasicPaletteGenerator',
  setup() {
    const colors = ref([])
    const colorCount = ref(5)
    const colorFormat = ref('hex')
    const darkMode = ref(false)
    const notification = ref(false)
    const copiedColor = ref('')

    const generateRandomColor = () => {
      const hex = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
      const r = parseInt(hex.slice(1, 3), 16)
      const g = parseInt(hex.slice(3, 5), 16)
      const b = parseInt(hex.slice(5, 7), 16)
      
      return {
        hex,
        rgb: `rgb(${r}, ${g}, ${b})`,
        locked: false
      }
    }

    const generateRandomPalette = () => {
      const lockedColors = colors.value.filter(c => c.locked)
      const newColors = []
      
      for (let i = 0; i < colorCount.value; i++) {
        if (i < lockedColors.length) {
          newColors.push({ ...lockedColors[i] })
        } else {
          newColors.push(generateRandomColor())
        }
      }
      
      colors.value = newColors
      saveToStorage()
    }

    const copyColor = (color) => {
      const text = colorFormat.value === 'hex' ? color.hex : color.rgb
      navigator.clipboard.writeText(text).catch(() => {
        const textarea = document.createElement('textarea')
        textarea.value = text
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      })
      
      copiedColor.value = text
      notification.value = true
      setTimeout(() => notification.value = false, 2000)
    }

    const toggleLock = (index) => {
      colors.value[index].locked = !colors.value[index].locked
      saveToStorage()
    }

    const saveToStorage = () => {
      localStorage.setItem('basicPalette', JSON.stringify({
        colors: colors.value,
        colorCount: colorCount.value,
        colorFormat: colorFormat.value,
        darkMode: darkMode.value
      }))
    }

    const loadFromStorage = () => {
      const saved = localStorage.getItem('basicPalette')
      if (saved) {
        try {
          const data = JSON.parse(saved)
          colors.value = data.colors || []
          colorCount.value = data.colorCount || 5
          colorFormat.value = data.colorFormat || 'hex'
          darkMode.value = data.darkMode || false
          if (!colors.value.length) generateRandomPalette()
        } catch {
          generateRandomPalette()
        }
      } else {
        generateRandomPalette()
      }
    }

    onMounted(loadFromStorage)
    
    watch([colorCount, colorFormat, darkMode], saveToStorage)
    
    watch(colorCount, (newVal) => {
      const lockedCount = colors.value.filter(c => c.locked).length
      if (lockedCount > newVal) {
        let unlocked = 0
        colors.value.forEach(color => {
          if (color.locked && unlocked < lockedCount - newVal) {
            color.locked = false
            unlocked++
          }
        })
      }
      generateRandomPalette()
    })

    return {
      colors,
      colorCount,
      colorFormat,
      darkMode,
      notification,
      copiedColor,
      generateRandomPalette,
      copyColor,
      toggleLock
    }
  }
}
</script>

<style scoped>
.basic {
  max-width: 800px;
  margin: 0 auto;
}

.controls {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
}

.generate-btn {
  padding: 12px 24px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  margin-bottom: 15px;
}

.settings {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.setting {
  display: flex;
  align-items: center;
  gap: 8px;
}

.palette {
  display: flex;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
}

.color {
  flex: 1;
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 10px;
}

.color-value {
  background: rgba(255,255,255,0.9);
  padding: 6px 12px;
  border-radius: 15px;
  font-family: monospace;
  font-size: 12px;
  font-weight: bold;
}

.lock-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  background: rgba(255,255,255,0.8);
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
}

.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #28a745;
  color: white;
  padding: 10px 20px;
  border-radius: 6px;
  z-index: 1000;
}

.preview {
  background: white;
  padding: 20px;
  border-radius: 8px;
}

.preview h3 {
  margin-bottom: 15px;
}

.preview-content {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 6px;
  margin-top: 15px;
}

.preview-content.dark {
  background: #2c3e50;
}

.mockup {
  max-width: 400px;
  margin: 0 auto;
  background: white;
  border-radius: 6px;
  overflow: hidden;
}

.header {
  padding: 20px;
  color: white;
  text-align: center;
}

.body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.body button {
  padding: 10px 20px;
  background: #4ecdc4;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.card {
  padding: 15px;
  border: 2px solid #ddd;
  border-radius: 4px;
  text-align: center;
}
</style>