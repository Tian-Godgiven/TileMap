<script setup lang="ts">
import { computed, ref } from 'vue';
import { useLineStore } from '../../stores/lineStore';
import { useHuabuStore } from '../../stores/huabuStore';
import { useHistoryStore } from '../../stores/historyStore';
import ColorPicker from '../common/ColorPicker.vue';

const props = defineProps<{
  lineId: string;
  x: number;
  y: number;
}>();

const emit = defineEmits<{
  close: [];
}>();

const lineStore = useLineStore();
const huabuStore = useHuabuStore();
const historyStore = useHistoryStore();

const line = computed(() => lineStore.lines.get(props.lineId));

const colorPicker = ref<{ visible: boolean; value: string; x: number; y: number }>({
  visible: false,
  value: '#000000',
  x: 0,
  y: 0
});

function openColorPicker(e: MouseEvent) {
  if (!line.value) return;
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  const pw = 290;
  const x = rect.right + 4 + pw > window.innerWidth ? rect.left - pw - 4 : rect.right + 4;
  const y = Math.min(rect.top, window.innerHeight - 420);
  colorPicker.value = { visible: true, value: line.value.style.color, x, y };
}

function onColorConfirm(color: string) {
  if (!line.value) return;
  lineStore.updateStyle(line.value.id, { color });
  colorPicker.value.visible = false;
}

function deleteLine() {
  if (!line.value) return;
  const l = line.value;
  const huabuId = huabuStore.activeHuabuId;
  if (!huabuId) return;
  const snapshot = { ...l, style: { ...l.style } };
  huabuStore.removeLineId(huabuId, l.id);
  lineStore.deleteLine(l.id);
  historyStore.push({ type: 'line-delete', lineId: snapshot.id, huabuId, snapshot });
  emit('close');
}

function onWidthChange(e: Event) {
  if (!line.value) return;
  const val = parseInt((e.target as HTMLInputElement).value);
  if (!isNaN(val) && val > 0) {
    lineStore.updateStyle(line.value.id, { width: val });
  }
}

function onStyleChange(e: Event) {
  if (!line.value) return;
  const val = (e.target as HTMLSelectElement).value as 'solid' | 'dashed' | 'dotted' | 'dotdash';
  lineStore.updateStyle(line.value.id, { style: val });
}

function onTypeChange(e: Event) {
  if (!line.value) return;
  const val = (e.target as HTMLSelectElement).value as 'straight' | 'bezier' | 'flowchart';
  lineStore.updateStyle(line.value.id, { type: val });
}

function toggleStartArrow() {
  if (!line.value) return;
  const next = line.value.style.startArrow === 'none' ? 'arrow' : 'none';
  lineStore.updateStyle(line.value.id, { startArrow: next });
}

function toggleEndArrow() {
  if (!line.value) return;
  const next = line.value.style.endArrow === 'none' ? 'arrow' : 'none';
  lineStore.updateStyle(line.value.id, { endArrow: next });
}
</script>

<template>
  <div v-if="line" class="context-menu" :style="{ left: `${x}px`, top: `${y}px` }" @click.stop>
    <div class="menu-section">
      <div class="menu-item" @click="deleteLine">删除该线条</div>
    </div>

    <div class="menu-section">
      <div class="menu-item flex">
        颜色：
        <div
          class="color-swatch"
          :style="{ backgroundColor: line.style.color }"
          @click="openColorPicker"
        />
      </div>
      <div class="menu-item flex">
        粗度：
        <input
          class="number_input"
          type="number"
          min="1"
          :value="line.style.width"
          @change="onWidthChange"
        />
      </div>
      <div class="menu-item flex">
        样式：
        <select :value="line.style.style" @change="onStyleChange">
          <option value="solid">实线</option>
          <option value="dashed">虚线</option>
          <option value="dotted">点线</option>
          <option value="dotdash">点虚线</option>
        </select>
      </div>
      <div class="menu-item flex">
        类型：
        <select :value="line.style.type" @change="onTypeChange">
          <option value="straight">直线连接</option>
          <option value="bezier">曲线连接</option>
          <option value="flowchart">折线连接</option>
        </select>
      </div>
    </div>

    <div class="menu-section">
      <div
        class="menu-item"
        :class="{ have_arrow: line.style.startArrow === 'arrow' }"
        @click="toggleStartArrow"
      >
        源箭头
      </div>
      <div
        class="menu-item"
        :class="{ have_arrow: line.style.endArrow === 'arrow' }"
        @click="toggleEndArrow"
      >
        尾箭头
      </div>
    </div>

    <ColorPicker
      v-model="colorPicker.value"
      :visible="colorPicker.visible"
      :x="colorPicker.x"
      :y="colorPicker.y"
      @confirm="onColorConfirm"
      @close="colorPicker.visible = false"
    />
  </div>
</template>

<style lang="scss" scoped>
.context-menu {
  position: fixed;
  z-index: 10000;
  background: var(--color-1);
  border: 1px solid var(--border-color);
  box-shadow: 2px 2px 12px rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  min-width: 160px;
  padding: 4px 0;
}

.menu-section {
  border-bottom: 1px solid var(--border-color);
  padding: 4px 0;

  &:last-child {
    border-bottom: none;
  }
}

.menu-item {
  padding: 6px 12px;
  cursor: pointer;
  font-size: 14px;
  color: var(--text-color);
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: var(--color-3);
  }

  &.have_arrow::after {
    content: '✓';
    margin-left: auto;
    color: var(--focusing-color);
  }
}

.color-swatch {
  width: 20px;
  height: 20px;
  border: 1px solid var(--border-color);
  border-radius: 3px;
  cursor: pointer;
  flex-shrink: 0;

  &:hover {
    outline: 2px solid var(--focusing-color);
  }
}

select {
  width: 90px;
}
</style>
