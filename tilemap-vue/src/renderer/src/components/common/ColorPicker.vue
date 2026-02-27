<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue';
import iro from '@jaames/iro';

interface Props {
  modelValue: string;
  visible: boolean;
  x?: number;
  y?: number;
  position?: 'side' | 'down';
}

const props = withDefaults(defineProps<Props>(), {
  position: 'down'
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  confirm: [value: string];
  close: [];
}>();

const colorpickerRef = ref<HTMLElement>();
const inputValue = ref(props.modelValue);
const menuExpanded = ref(false);
const memoryColors = ref<string[]>([]);

let colorPicker: any = null;

onMounted(() => {
  generateSelectColors();
});

watch(
  () => props.modelValue,
  (newVal) => {
    if (colorPicker && newVal) {
      colorPicker.color.set(newVal);
      inputValue.value = newVal;
    }
  }
);

watch(
  () => props.visible,
  async (visible) => {
    if (!visible) {
      colorPicker = null;
      return;
    }
    await nextTick();
    const pickerEl = colorpickerRef.value?.querySelector('#colorpicker_wheel');
    if (!pickerEl) return;
    colorPicker = new iro.ColorPicker(pickerEl, {
      width: 160,
      margin: 6,
      layoutDirection: 'horizontal',
      layout: [
        { component: iro.ui.Wheel },
        { component: iro.ui.Slider, options: { sliderType: 'saturation' } },
        { component: iro.ui.Slider, options: { sliderType: 'value' } },
        { component: iro.ui.Slider, options: { sliderType: 'alpha' } }
      ]
    });
    colorPicker.on('color:change', (color: any) => {
      inputValue.value = color.hex8String.toUpperCase();
    });
    if (props.modelValue) {
      colorPicker.color.set(props.modelValue);
      inputValue.value = props.modelValue;
    }
  }
);

function onInputChange() {
  if (isValidColor(inputValue.value) && colorPicker) {
    colorPicker.color.set(inputValue.value);
  }
}

function confirm() {
  addToMemory(inputValue.value);
  emit('confirm', inputValue.value);
  emit('update:modelValue', inputValue.value);
}

function cancel() {
  emit('close');
}

function copyColor() {
  navigator.clipboard.writeText(inputValue.value);
}

function toggleMenu() {
  menuExpanded.value = !menuExpanded.value;
}

function addToMemory(color: string) {
  memoryColors.value = [color, ...memoryColors.value.filter((c) => c !== color)].slice(0, 12);
}

function selectMemoryColor(color: string) {
  if (colorPicker) colorPicker.color.set(color);
}

function clearMemory() {
  memoryColors.value = [];
}

const selectColors = ref<string[]>([]);

function generateSelectColors() {
  const colors: string[] = [];

  // 第一行：透明 + 黑白渐变
  colors.push('transparent');
  for (let i = 10; i >= 0; i--) {
    const val = Math.round(255 * i * 0.1);
    colors.push(`rgb(${val},${val},${val})`);
  }

  // 6 行色彩渐变
  for (let row = 1; row <= 6; row++) {
    let max: number, min: number;
    if (row < 4) {
      max = 255;
      min = 64 * (4 - row);
    } else if (row === 4) {
      max = 255;
      min = 0;
    } else {
      max = 64 * (8 - row);
      min = 0;
    }
    const mid = (max + min) / 2;

    let r = max,
      g = min,
      b = min;
    for (let col = 1; col <= 12; col++) {
      if (col > 1 && col <= 3) {
        g = g !== mid ? mid : max;
      } else if (col > 3 && col <= 5) {
        r = r !== mid ? mid : min;
      } else if (col > 5 && col <= 7) {
        b = b !== mid ? mid : max;
      } else if (col > 7 && col <= 9) {
        g = g !== mid ? mid : min;
      } else if (col > 9 && col <= 11) {
        r = r !== mid ? mid : max;
      } else if (col > 11) {
        b = mid;
      }
      colors.push(`rgb(${r},${g},${b})`);
    }
  }

  selectColors.value = colors;
}

function selectColor(color: string) {
  if (colorPicker) colorPicker.color.set(color);
}

function isValidColor(value: string): boolean {
  const hex = /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
  const rgb = /^rgb\(\s*\d+,\s*\d+,\s*\d+\)$/;
  const rgba = /^rgba\(\s*\d+,\s*\d+,\s*\d+,\s*[\d.]+\)$/;
  return hex.test(value) || rgb.test(value) || rgba.test(value) || value === 'transparent';
}
</script>

<template>
  <div
    v-if="visible"
    ref="colorpickerRef"
    class="colorpicker"
    :style="{ left: `${x}px`, top: `${y}px` }"
    @click.stop
  >
    <div id="colorpicker_wheel"></div>

    <div class="colorpicker-input">
      <div class="cp-swatch" :style="{ backgroundColor: inputValue, backgroundImage: inputValue === 'transparent' ? undefined : 'none' }"></div>
      <input v-model="inputValue" @input="onInputChange" />
      <button class="cp-btn cp-confirm" title="确认" @click="confirm"></button>
      <button class="cp-btn cp-copy" title="复制" @click="copyColor"></button>
      <button
        class="cp-btn cp-toggle"
        :class="menuExpanded ? 'cp-up' : 'cp-down'"
        title="展开/收起"
        @click="toggleMenu"
      ></button>
    </div>

    <div v-show="menuExpanded" class="colorpicker-menu">
      <!-- 记忆区 -->
      <div class="colorpicker-section">
        <div class="section-title">记忆</div>
        <div class="colorpicker-memory">
          <div
            v-for="(color, idx) in memoryColors"
            :key="idx"
            class="colorblock"
            :style="{ backgroundColor: color, backgroundImage: color === 'transparent' ? undefined : 'none' }"
            @click="selectMemoryColor(color)"
          ></div>
          <div class="colorblock delete" title="清空" @click="clearMemory">×</div>
        </div>
      </div>

      <!-- 选择区 -->
      <div class="colorpicker-section">
        <div class="section-title">选择</div>
        <div class="colorpicker-select">
          <div
            v-for="(color, idx) in selectColors"
            :key="idx"
            class="colorblock"
            :style="{ backgroundColor: color, backgroundImage: color === 'transparent' ? undefined : 'none' }"
            @click="selectColor(color)"
          ></div>
        </div>
      </div>
    </div>

    <div class="colorpicker-bottom">
      <button @click="confirm">应用</button>
      <button @click="cancel">关闭</button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.colorpicker {
  position: fixed;
  z-index: 10000;
  background: var(--color-1);
  border: 1px solid var(--color-5);
  border-radius: 8px;
  padding: 10px;
  width: 290px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.4);
  box-sizing: border-box;
}

#colorpicker_wheel {
  margin-bottom: 8px;
  display: flex;
  justify-content: center;
}

.colorpicker-input {
  display: flex;
  align-items: center;
  height: 28px;
  width: 100%;
  margin-bottom: 6px;
  gap: 4px;

  input {
    box-sizing: border-box;
    height: 26px;
    flex: 1;
    min-width: 0;
    background: var(--color-2);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    color: var(--text-color);
    font-size: 12px;
    padding: 0 6px;
    outline: none;
    font-family: monospace;

    &:focus {
      border-color: var(--focusing-color);
    }
  }
}

.cp-swatch {
  width: 26px;
  height: 26px;
  border-radius: 4px;
  border: 1px solid var(--border-color);
  flex-shrink: 0;
  background-image: url('../../assets/img/colorblock_transparent.jpg');
  background-size: cover;
}

.cp-btn {
  width: 26px;
  height: 26px;
  padding: 0;
  background-repeat: no-repeat;
  background-size: 70%;
  background-position: center;
  border: 1px solid var(--border-color);
  background-color: var(--color-2);
  border-radius: 4px;
  cursor: pointer;
  flex-shrink: 0;

  &:hover {
    background-color: var(--color-3);
    border-color: var(--focusing-color);
  }
}

.cp-confirm {
  background-image: url('../../assets/img/check.png');
}
.cp-copy {
  background-image: url('../../assets/img/copy.png');
}
.cp-down {
  background-image: url('../../assets/img/menu_up.png');
}
.cp-up {
  background-image: url('../../assets/img/menu_down.png');
}

.colorpicker-menu {
  width: 100%;
  border-top: 1px solid var(--border-color);
  padding-top: 6px;
  margin-top: 2px;
}

.colorpicker-section {
  margin-bottom: 6px;
}

.section-title {
  font-size: 11px;
  font-weight: bold;
  color: var(--color-4);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 4px 2px;
}

.colorpicker-memory,
.colorpicker-select {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
}

.colorblock {
  width: 20px;
  height: 20px;
  cursor: pointer;
  box-sizing: border-box;
  border-radius: 3px;
  border: 1px solid transparent;
  background-image: url('../../assets/img/colorblock_transparent.jpg');
  background-size: cover;

  &:hover {
    border-color: var(--focusing-color);
    transform: scale(1.15);
  }

  &.delete {
    background: var(--warning-color-1);
    background-image: none;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    color: white;
    font-weight: bold;
    border-radius: 3px;
  }
}

.colorpicker-bottom {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--border-color);

  button {
    height: 26px;
    width: 56px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    color: var(--text-color);
    background: var(--color-2);

    &:first-child {
      background: var(--focusing-color);
      color: #fff;
      border-color: var(--focusing-color);
    }

    &:hover {
      filter: brightness(1.15);
    }
  }
}
</style>
