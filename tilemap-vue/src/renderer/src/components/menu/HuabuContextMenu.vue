<script setup lang="ts">
import { computed } from 'vue';
import { useHuabuStore } from '../../stores/huabuStore';
import { useClipboardStore } from '../../stores/clipboardStore';
import { useHistoryStore } from '../../stores/historyStore';
import { useTileStore } from '../../stores/tileStore';

const props = defineProps<{
  huabuId: string;
  x: number;
  y: number;
  pasteX?: number;
  pasteY?: number;
}>();

const emit = defineEmits<{
  close: [];
}>();

const huabuStore = useHuabuStore();
const clipboardStore = useClipboardStore();
const historyStore = useHistoryStore();
const tileStore = useTileStore();

const huabu = computed(() => huabuStore.huabus.get(props.huabuId));
const canUndo = computed(() => historyStore.canUndo);
const canRedo = computed(() => historyStore.canRedo);
const hasClipboard = computed(() => clipboardStore.hasClipboard());
const canReturnSource = computed(() => {
  if (!huabu.value) return false;
  return huabuStore.breadcrumb.length > 1;
});

function pasteHere() {
  const tile = clipboardStore.pasteTile();
  if (!tile || !huabu.value) return;
  tileStore.createTile(props.huabuId, {
    ...tile,
    style: {
      ...tile.style,
      left: props.pasteX ?? tile.style.left,
      top: props.pasteY ?? tile.style.top
    }
  });
  emit('close');
}

function undo() {
  historyStore.undo();
  emit('close');
}

function redo() {
  historyStore.redo();
  emit('close');
}

function returnSource() {
  if (huabuStore.breadcrumb.length > 1) {
    const prev = huabuStore.breadcrumb[huabuStore.breadcrumb.length - 2];
    huabuStore.returnToBreadcrumb(prev);
  }
  emit('close');
}

function selectAll() {
  if (!huabu.value) return;
  huabu.value.tileIds.forEach((id) => tileStore.selectTile(id));
  emit('close');
}

function clearAll() {
  if (!huabu.value) return;
  if (confirm('确认清空画布上的所有内容？')) {
    huabuStore.clearHuabu(props.huabuId);
  }
  emit('close');
}
</script>

<template>
  <div class="context-menu" :style="{ left: `${x}px`, top: `${y}px` }" @click.stop>
    <div class="menu-section">
      <div
        class="menu-item"
        :class="{ disabled: !hasClipboard }"
        @click="hasClipboard && pasteHere()"
      >
        粘贴到此处
      </div>
    </div>

    <div class="menu-section">
      <div class="menu-item" :class="{ disabled: !canUndo }" @click="canUndo && undo()">撤回</div>
      <div class="menu-item" :class="{ disabled: !canRedo }" @click="canRedo && redo()">重做</div>
    </div>

    <div class="menu-section">
      <div
        class="menu-item"
        :class="{ disabled: !canReturnSource }"
        @click="canReturnSource && returnSource()"
      >
        返回源画布
      </div>
    </div>

    <div class="menu-section">
      <div class="menu-item" @click="selectAll">全选</div>
      <div class="menu-item warning" @click="clearAll">清空</div>
    </div>
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
  min-width: 140px;
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

  &:hover {
    background: var(--color-3);
  }

  &.disabled {
    color: var(--color-4);
    cursor: default;
    &:hover {
      background: none;
    }
  }

  &.warning {
    color: var(--warning-color-1);
  }
}
</style>
