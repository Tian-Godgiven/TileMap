<script setup lang="ts">
import { computed, ref } from 'vue';
import { useTileStore } from '../../stores/tileStore';
import { useHuabuStore } from '../../stores/huabuStore';
import { useClipboardStore } from '../../stores/clipboardStore';
import ColorPicker from '../common/ColorPicker.vue';

const props = defineProps<{
  tileId: string;
  x: number;
  y: number;
}>();

const emit = defineEmits<{
  close: [];
}>();

const tileStore = useTileStore();
const huabuStore = useHuabuStore();
const clipboardStore = useClipboardStore();

const tile = computed(() => tileStore.tiles.get(props.tileId));

// 颜色选择器
const colorPicker = ref<{ visible: boolean; value: string; x: number; y: number }>({
  visible: false,
  value: '#ffffff',
  x: 0,
  y: 0
});

function openColorPicker(e: MouseEvent) {
  if (!tile.value) return;
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  const pw = 290;
  const x = rect.right + 4 + pw > window.innerWidth ? rect.left - pw - 4 : rect.right + 4;
  const y = Math.min(rect.top, window.innerHeight - 420);
  colorPicker.value = { visible: true, value: tile.value.style.backgroundColor, x, y };
}

function onColorConfirm(color: string) {
  if (!tile.value) return;
  tileStore.updateStyle(tile.value.id, { backgroundColor: color });
  colorPicker.value.visible = false;
}

function copyTile() {
  if (!tile.value) return;
  clipboardStore.copyTile(tile.value);
  emit('close');
}

function cutTile() {
  if (!tile.value) return;
  clipboardStore.copyTile(tile.value);
  tileStore.deleteTile(tile.value.id);
  emit('close');
}

function deleteTile() {
  if (!tile.value) return;
  tileStore.deleteTile(tile.value.id);
  emit('close');
}

function openLink() {
  if (!tile.value || !tile.value.link) return;
  window.open(tile.value.link);
  emit('close');
}

function nestOrEnterHuabu() {
  if (!tile.value) return;
  if (tile.value.nestHuabuId) {
    huabuStore.openNestedHuabu(tile.value.nestHuabuId);
  } else {
    // 创建嵌套画布
    const huabu = huabuStore.createHuabu(tile.value.title || '嵌套画布', { isNested: true });
    tileStore.setNestHuabu(tile.value.id, huabu.id);
    huabuStore.openNestedHuabu(huabu.id);
  }
  emit('close');
}

function rotateClockwise() {
  if (!tile.value) return;
  tileStore.updateStyle(tile.value.id, { angle: tile.value.style.angle + 45 });
  emit('close');
}

function rotateCounterClockwise() {
  if (!tile.value) return;
  tileStore.updateStyle(tile.value.id, { angle: tile.value.style.angle - 45 });
  emit('close');
}

function zIndexUp() {
  if (!tile.value) return;
  tileStore.updateStyle(tile.value.id, { zIndex: tile.value.style.zIndex + 1 });
  emit('close');
}

function zIndexDown() {
  if (!tile.value) return;
  tileStore.updateStyle(tile.value.id, { zIndex: Math.max(1, tile.value.style.zIndex - 1) });
  emit('close');
}

function toggleLock() {
  if (!tile.value) return;
  tileStore.toggleLock(tile.value.id);
  emit('close');
}

function toggleTextblock() {
  if (!tile.value) return;
  const state = tile.value.props.textblockShowState;
  if (state === 'enternalShow') {
    tileStore.updateProps(tile.value.id, { textblockShowState: 'enternalHide' });
  } else if (state === 'enternalHide') {
    tileStore.updateProps(tile.value.id, { textblockShowState: 'enternalShow' });
  } else {
    tileStore.updateProps(tile.value.id, { textblockShowState: 'enternalShow' });
  }
  emit('close');
}

const nestButtonText = computed(() => {
  if (!tile.value) return '嵌套画布';
  return tile.value.nestHuabuId ? '进入画布' : '嵌套画布';
});

const lockButtonText = computed(() => {
  if (!tile.value) return '锁定';
  return tile.value.props.lock ? '解锁' : '锁定';
});

const textblockButtonText = computed(() => {
  if (!tile.value) return '显示内容块';
  const state = tile.value.props.textblockShowState;
  if (state === 'enternalShow') return '永久隐藏内容块';
  if (state === 'enternalHide') return '永久显示内容块';
  return '显示内容块';
});
</script>

<template>
  <div v-if="tile" class="context-menu" :style="{ left: `${x}px`, top: `${y}px` }" @click.stop>
    <div class="menu-section">
      <div class="menu-item" @click="copyTile">复制</div>
      <div class="menu-item" @click="cutTile">剪切</div>
      <div class="menu-item" @click="deleteTile">删除</div>
    </div>

    <div class="menu-section">
      <div class="menu-item" @click="nestOrEnterHuabu">{{ nestButtonText }}</div>
      <div v-if="tile.link" class="menu-item" @click="openLink">打开链接</div>
    </div>

    <div class="menu-section">
      <div class="menu-item flex">
        颜色：
        <div
          class="color-swatch"
          :style="{ backgroundColor: tile.style.backgroundColor }"
          @click="openColorPicker"
        />
      </div>
      <div class="menu-item" @click="rotateClockwise">顺时针旋转45度</div>
      <div class="menu-item" @click="rotateCounterClockwise">逆时针旋转45度</div>
      <div class="menu-item" @click="zIndexUp">上浮1层</div>
      <div class="menu-item" @click="zIndexDown">下沉1层</div>
    </div>

    <div class="menu-section">
      <div class="menu-item" @click="toggleLock">{{ lockButtonText }}</div>
      <div class="menu-item" @click="toggleTextblock">{{ textblockButtonText }}</div>
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
</style>
