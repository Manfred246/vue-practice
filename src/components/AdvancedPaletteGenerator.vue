<template>
  <div class="advanced">
    <div class="section">
      <h3>1. Продвинутая генерация</h3>
      <div class="controls">
        <div class="color-picker">
          <label>Базовый цвет:</label>
          <input type="color" v-model="baseColor" @input="generatePalette">
          <span>{{ baseColor }}</span>
          <button @click="pickRandomColor">🎲</button>
        </div>
        
        <div class="palette-types">
          <label>Тип палитры:</label>
          <div class="types">
            <button
              v-for="type in ['analogous', 'monochromatic', 'triad', 'complementary']"
              :key="type"
              @click="selectType(type)"
              :class="{ active: selectedType === type }"
            >
              {{ type === 'analogous' ? 'Аналогичная' :
                 type === 'monochromatic' ? 'Монохромная' :
                 type === 'triad' ? 'Триада' : 'Комплементарная' }}
            </button>
          </div>
        </div>
        
        <div class="moods">
          <label>Настроение:</label>
          <div class="mood-buttons">
            <button
              v-for="mood in ['calm', 'energetic', 'professional']"
              :key="mood"
              @click="selectMood(mood)"
              :class="{ active: selectedMood === mood }"
            >
              {{ mood === 'calm' ? 'Спокойные' :
                 mood === 'energetic' ? 'Энергичные' : 'Профессиональные' }}
            </button>
          </div>
        </div>
      </div>
      
      <div class="result">
        <h4>Результат:</h4>
        <div class="palette">
          <div
            v-for="(color, index) in palette"
            :key="index"
            class="color"
            :style="{ backgroundColor: color }"
            @click="copyToClipboard(color)"
          >
            {{ color }}
          </div>
        </div>
      </div>
    </div>

    <div class="section">
      <h3>2. Анализ контрастности (WCAG)</h3>
      <div class="contrast-checker">
        <div class="color-inputs">
          <div class="input-group">
            <label>Цвет текста:</label>
            <input type="color" v-model="textColor">
            <span>{{ textColor }}</span>
          </div>
          <div class="input-group">
            <label>Цвет фона:</label>
            <input type="color" v-model="bgColor">
            <span>{{ bgColor }}</span>
          </div>
        </div>
        
        <div class="preview" :style="{ backgroundColor: bgColor, color: textColor }">
          Пример текста для проверки контрастности
        </div>
        
        <div class="results">
          <div class="result-item" :class="contrast.aaNormal ? 'pass' : 'fail'">
            <span>Уровень AA (обычный текст):</span>
            <span>{{ contrast.aaNormal ? '✅ Проходит' : '❌ Не проходит' }}</span>
          </div>
          <div class="result-item" :class="contrast.aaLarge ? 'pass' : 'fail'">
            <span>Уровень AA (крупный текст):</span>
            <span>{{ contrast.aaLarge ? '✅ Проходит' : '❌ Не проходит' }}</span>
          </div>
          <div class="result-item" :class="contrast.aaaNormal ? 'pass' : 'fail'">
            <span>Уровень AAA (обычный текст):</span>
            <span>{{ contrast.aaaNormal ? '✅ Проходит' : '❌ Не проходит' }}</span>
          </div>
          <div class="result-item" :class="contrast.aaaLarge ? 'pass' : 'fail'">
            <span>Уровень AAA (крупный текст):</span>
            <span>{{ contrast.aaaLarge ? '✅ Проходит' : '❌ Не проходит' }}</span>
          </div>
          <div class="ratio">
            Соотношение контраста: <strong>{{ contrast.ratio }}:1</strong>
          </div>
        </div>
      </div>
    </div>

    <div class="section">
      <h3>3. Управление библиотекой</h3>
      <div class="library">
        <div class="save-form">
          <input 
            v-model="paletteName" 
            placeholder="Название палитры"
            @keyup.enter="savePalette"
          >
          <input 
            v-model="paletteTags" 
            placeholder="Теги через запятую"
            @keyup.enter="savePalette"
          >
          <button @click="savePalette">💾 Сохранить</button>
        </div>
        
        <div v-if="savedPalettes.length" class="saved-palettes">
          <h4>Сохранённые палитры:</h4>
          <div class="palettes-list">
            <div 
              v-for="item in savedPalettes" 
              :key="item.id"
              class="saved-palette"
              @click="loadPalette(item)"
            >
              <div class="palette-preview">
                <div
                  v-for="color in item.colors"
                  :key="color"
                  class="preview-color"
                  :style="{ backgroundColor: color }"
                ></div>
              </div>
              <div class="palette-info">
                <strong>{{ item.name }}</strong>
                <span>{{ item.tags.join(', ') }}</span>
              </div>
              <button @click.stop="deletePalette(item.id)" class="delete">🗑️</button>
            </div>
          </div>
        </div>
        <div v-else class="empty">
          Сохранённых палитр пока нет
        </div>
      </div>
    </div>

    <div class="section">
      <h3>4. Экспорт палитр</h3>
      <div class="export">
        <div class="export-formats">
          <button @click="exportCSS" :disabled="!palette.length">CSS Variables</button>
          <button @click="exportSCSS" :disabled="!palette.length">SCSS Variables</button>
          <button @click="exportJSON" :disabled="!palette.length">JSON</button>
        </div>
        
        <div v-if="exportCode" class="export-code">
          <pre>{{ exportCode }}</pre>
          <button @click="copyExportCode">📋 Копировать</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'

export default {
  name: 'AdvancedPaletteGenerator',
  setup() {
    const baseColor = ref('#667eea')
    const selectedType = ref('analogous')
    const selectedMood = ref('')
    const palette = ref([])

    const hexToHsl = (hex) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255
      const g = parseInt(hex.slice(3, 5), 16) / 255
      const b = parseInt(hex.slice(5, 7), 16) / 255
      
      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      let h, s, l = (max + min) / 2
      
      if (max === min) {
        h = s = 0
      } else {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break
          case g: h = (b - r) / d + 2; break
          case b: h = (r - g) / d + 4; break
        }
        h /= 6
      }
      
      return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
      }
    }

    const hslToHex = (h, s, l) => {
      h /= 360
      s /= 100
      l /= 100
      
      let r, g, b
      
      if (s === 0) {
        r = g = b = l
      } else {
        const hue2rgb = (p, q, t) => {
          if (t < 0) t += 1
          if (t > 1) t -= 1
          if (t < 1/6) return p + (q - p) * 6 * t
          if (t < 1/2) return q
          if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
          return p
        }
        
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s
        const p = 2 * l - q
        
        r = hue2rgb(p, q, h + 1/3)
        g = hue2rgb(p, q, h)
        b = hue2rgb(p, q, h - 1/3)
      }
      
      const toHex = (x) => Math.round(x * 255).toString(16).padStart(2, '0')
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`
    }

    const generatePalette = () => {
      const baseHsl = hexToHsl(baseColor.value)
      const colors = []
      
      if (selectedMood.value) {
        for (let i = 0; i < 5; i++) {
          let h, s, l
          switch(selectedMood.value) {
            case 'calm':
              h = 180 + Math.random() * 60
              s = 30 + Math.random() * 40
              l = 40 + Math.random() * 30
              break
            case 'energetic':
              h = Math.random() * 60
              s = 60 + Math.random() * 30
              l = 50 + Math.random() * 20
              break
            case 'professional':
              h = 200 + Math.random() * 80
              s = 10 + Math.random() * 30
              l = 30 + Math.random() * 40
              break
          }
          colors.push(hslToHex(h, s, l))
        }
      } else {
        switch(selectedType.value) {
          case 'analogous':
            colors.push(baseColor.value)
            for (let i = 1; i < 5; i++) {
              const hue = (baseHsl.h + (i * 30)) % 360
              colors.push(hslToHex(hue, baseHsl.s, baseHsl.l))
            }
            break
          case 'monochromatic':
            for (let i = 0; i < 5; i++) {
              const lightness = Math.max(10, Math.min(90, baseHsl.l + (i - 2) * 20))
              colors.push(hslToHex(baseHsl.h, baseHsl.s, lightness))
            }
            break
          case 'triad':
            colors.push(baseColor.value)
            colors.push(hslToHex((baseHsl.h + 120) % 360, baseHsl.s, baseHsl.l))
            colors.push(hslToHex((baseHsl.h + 240) % 360, baseHsl.s, baseHsl.l))
            colors.push(hslToHex((baseHsl.h + 60) % 360, baseHsl.s, baseHsl.l))
            colors.push(hslToHex((baseHsl.h + 300) % 360, baseHsl.s, baseHsl.l))
            break
          case 'complementary':
            colors.push(baseColor.value)
            colors.push(hslToHex((baseHsl.h + 180) % 360, baseHsl.s, baseHsl.l))
            for (let i = 2; i < 5; i++) {
              const hue = (baseHsl.h + (i * 60)) % 360
              colors.push(hslToHex(hue, baseHsl.s, baseHsl.l))
            }
            break
        }
      }
      
      palette.value = colors
    }

    const pickRandomColor = () => {
      baseColor.value = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
    }

    const selectType = (type) => {
      selectedType.value = type
      selectedMood.value = ''
    }

    const selectMood = (mood) => {
      selectedMood.value = mood
      selectedType.value = ''
    }

    const copyToClipboard = (text) => {
      navigator.clipboard.writeText(text)
      alert(`Скопировано: ${text}`)
    }

    const textColor = ref('#000000')
    const bgColor = ref('#ffffff')

    const getLuminance = (hex) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255
      const g = parseInt(hex.slice(3, 5), 16) / 255
      const b = parseInt(hex.slice(5, 7), 16) / 255
      
      const [rs, gs, bs] = [r, g, b].map(c => 
        c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
      )
      
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
    }

    const contrast = computed(() => {
      const l1 = getLuminance(textColor.value)
      const l2 = getLuminance(bgColor.value)
      const lighter = Math.max(l1, l2)
      const darker = Math.min(l1, l2)
      const ratio = (lighter + 0.05) / (darker + 0.05)
      
      return {
        ratio: ratio.toFixed(2),
        aaNormal: ratio >= 4.5,
        aaLarge: ratio >= 3,
        aaaNormal: ratio >= 7,
        aaaLarge: ratio >= 4.5
      }
    })

    const paletteName = ref('')
    const paletteTags = ref('')
    const savedPalettes = ref([])

    const savePalette = () => {
      if (!palette.value.length || !paletteName.value.trim()) {
        alert('Сначала создайте палитру и введите название')
        return
      }
      
      const newPalette = {
        id: Date.now(),
        name: paletteName.value,
        colors: [...palette.value],
        tags: paletteTags.value.split(',').map(t => t.trim()).filter(t => t),
        date: new Date().toISOString()
      }
      
      savedPalettes.value.unshift(newPalette)
      localStorage.setItem('paletteLibrary', JSON.stringify(savedPalettes.value))
      
      paletteName.value = ''
      paletteTags.value = ''
      alert('Палитра сохранена!')
    }

    const loadPalette = (item) => {
      palette.value = [...item.colors]
      baseColor.value = item.colors[0]
      selectedMood.value = ''
      alert(`Палитра "${item.name}" загружена`)
    }

    const deletePalette = (id) => {
      if (confirm('Удалить эту палитру?')) {
        savedPalettes.value = savedPalettes.value.filter(p => p.id !== id)
        localStorage.setItem('paletteLibrary', JSON.stringify(savedPalettes.value))
      }
    }

    const exportCode = ref('')

    const exportCSS = () => {
      let code = ':root {\n'
      palette.value.forEach((color, i) => {
        code += `  --color-${i + 1}: ${color};\n`
      })
      code += '}\n\n/* Использование: */\n/* color: var(--color-1); */'
      exportCode.value = code
    }

    const exportSCSS = () => {
      let code = ''
      palette.value.forEach((color, i) => {
        code += `$color-${i + 1}: ${color};\n`
      })
      code += '\n// Использование:\n// color: $color-1;'
      exportCode.value = code
    }

    const exportJSON = () => {
      const data = {
        name: paletteName.value || 'Color Palette',
        colors: palette.value,
        generated: new Date().toISOString()
      }
      exportCode.value = JSON.stringify(data, null, 2)
    }

    const copyExportCode = () => {
      if (exportCode.value) {
        navigator.clipboard.writeText(exportCode.value)
        alert('Код скопирован!')
      }
    }

    onMounted(() => {
      generatePalette()
      
      const saved = localStorage.getItem('paletteLibrary')
      if (saved) {
        try {
          savedPalettes.value = JSON.parse(saved)
        } catch {
          savedPalettes.value = []
        }
      }
    })

    return {
      baseColor,
      selectedType,
      selectedMood,
      palette,
      pickRandomColor,
      selectType,
      selectMood,
      generatePalette,
      copyToClipboard,
      
      textColor,
      bgColor,
      contrast,
      
      paletteName,
      paletteTags,
      savedPalettes,
      savePalette,
      loadPalette,
      deletePalette,
      
      exportCode,
      exportCSS,
      exportSCSS,
      exportJSON,
      copyExportCode
    }
  }
}
</script>

<style scoped>
.advanced {
  max-width: 1200px;
  margin: 0 auto;
}

.section {
  background: white;
  padding: 25px;
  border-radius: 10px;
  margin-bottom: 30px;
  border-left: 5px solid #667eea;
}

.section h3 {
  margin-bottom: 20px;
  color: #333;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 25px;
}

.color-picker, .palette-types, .moods {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.color-picker label, .palette-types label, .moods label {
  font-weight: bold;
  min-width: 100px;
}

.color-picker input[type="color"] {
  width: 50px;
  height: 40px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.color-picker span {
  font-family: monospace;
  font-weight: bold;
}

.color-picker button, .types button, .mood-buttons button {
  padding: 8px 16px;
  background: #f0f0f0;
  border: 2px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.types, .mood-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.types button.active, .mood-buttons button.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.result {
  margin-top: 20px;
}

.result .palette {
  display: flex;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  margin-top: 15px;
}

.result .color {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: monospace;
  font-size: 12px;
  font-weight: bold;
  color: white;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
  cursor: pointer;
  transition: transform 0.2s;
}

.result .color:hover {
  transform: scale(1.05);
}

.contrast-checker {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.color-inputs {
  display: flex;
  gap: 30px;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.input-group input[type="color"] {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.input-group span {
  font-family: monospace;
  font-weight: bold;
}

.preview {
  padding: 25px;
  border-radius: 8px;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #ddd;
}

.results {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  border-radius: 6px;
  font-weight: 500;
}

.result-item.pass {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.result-item.fail {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.ratio {
  text-align: center;
  padding: 15px;
  font-size: 18px;
  background: white;
  border-radius: 6px;
  margin-top: 10px;
}

.library {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.save-form {
  display: flex;
  gap: 10px;
}

.save-form input {
  flex: 1;
  padding: 10px 15px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.save-form button {
  padding: 10px 20px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}

.saved-palettes {
  margin-top: 20px;
}

.saved-palettes h4 {
  margin-bottom: 15px;
  color: #333;
}

.palettes-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-height: 300px;
  overflow-y: auto;
  padding: 10px;
}

.saved-palette {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.saved-palette:hover {
  border-color: #667eea;
  background: white;
}

.palette-preview {
  display: flex;
  width: 100px;
  height: 40px;
  border-radius: 6px;
  overflow: hidden;
}

.preview-color {
  flex: 1;
}

.palette-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.palette-info strong {
  color: #333;
}

.palette-info span {
  color: #666;
  font-size: 12px;
}

.saved-palette .delete {
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  cursor: pointer;
  opacity: 0.7;
}

.saved-palette .delete:hover {
  opacity: 1;
}

.empty {
  text-align: center;
  padding: 40px;
  color: #666;
  font-style: italic;
  background: #f8f9fa;
  border-radius: 8px;
}

.export-formats {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.export-formats button {
  padding: 12px 24px;
  background: #17a2b8;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.3s;
}

.export-formats button:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.export-formats button:not(:disabled):hover {
  background: #138496;
}

.export-code {
  background: #2d2d2d;
  border-radius: 8px;
  overflow: hidden;
}

.export-code pre {
  color: #f8f8f2;
  padding: 20px;
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
  max-height: 300px;
  overflow-y: auto;
}

.export-code button {
  width: 100%;
  padding: 15px;
  background: #28a745;
  color: white;
  border: none;
  border-top: 1px solid #444;
  cursor: pointer;
  font-weight: bold;
  font-size: 16px;
}

.export-code button:hover {
  background: #218838;
}

@media (max-width: 768px) {
  .color-inputs {
    flex-direction: column;
    gap: 15px;
  }
  
  .save-form {
    flex-direction: column;
  }
  
  .export-formats {
    flex-direction: column;
  }
  
  .saved-palette {
    flex-direction: column;
    align-items: stretch;
  }
  
  .palette-preview {
    width: 100%;
    height: 30px;
  }
}
</style>