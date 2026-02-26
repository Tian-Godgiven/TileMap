<script setup lang="ts">
import TopBar from './TopBar.vue';
import LeftPanel from './LeftPanel.vue';
import RightPanel from './RightPanel.vue';
import HuabuArea from '../canvas/HuabuArea.vue';
import SearchMenu from '../menu/SearchMenu.vue';
import FileExportMenu from '../menu/FileExportMenu.vue';
import FileInsertMenu from '../menu/FileInsertMenu.vue';
import FileSaveAsMenu from '../menu/FileSaveAsMenu.vue';
import TreeSelectMenu from '../menu/TreeSelectMenu.vue';
import CollectionEditMenu from '../menu/CollectionEditMenu.vue';
import { useKeyboard } from '../../composables/useKeyboard';
import { useUiStore } from '../../stores/uiStore';
import { ref } from 'vue';

const uiStore = useUiStore();
useKeyboard();

const leftWidth = ref(21);
const rightWidth = ref(20);

function startResize(e: MouseEvent, side: 'left' | 'right') {
  e.preventDefault();
  const startX = e.clientX;
  const startLeft = leftWidth.value;
  const startRight = rightWidth.value;

  function onMove(e: MouseEvent) {
    const dx = e.clientX - startX;
    const totalWidth = document.body.clientWidth;
    const pct = (dx / totalWidth) * 100;
    if (side === 'left') {
      leftWidth.value = Math.max(10, Math.min(40, startLeft + pct));
    } else {
      rightWidth.value = Math.max(10, Math.min(40, startRight - pct));
    }
  }

  function onUp() {
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
  }

  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
}

function huabuWidth() {
  let w = 100;
  if (uiStore.showLeftPanel) w -= leftWidth.value;
  if (uiStore.showRightPanel) w -= rightWidth.value;
  return w + '%';
}
</script>

<template>
  <div id="tilemap">
    <div id="area_top">
      <TopBar />
    </div>
    <div id="area_bottom">
      <div v-if="uiStore.showLeftPanel" id="area_left" :style="{ width: leftWidth + '%' }">
        <LeftPanel />
      </div>
      <div
        v-if="uiStore.showLeftPanel"
        class="resize-bar"
        @mousedown="startResize($event, 'left')"
      ></div>
      <div id="area_huabu" :style="{ width: huabuWidth() }">
        <HuabuArea />
      </div>
      <div
        v-if="uiStore.showRightPanel"
        class="resize-bar"
        @mousedown="startResize($event, 'right')"
      ></div>
      <div v-if="uiStore.showRightPanel" id="area_right" :style="{ width: rightWidth + '%' }">
        <RightPanel />
      </div>
    </div>
    <SearchMenu />
    <FileExportMenu />
    <FileInsertMenu />
    <FileSaveAsMenu />
    <TreeSelectMenu ref="treeSelectMenu" />
    <CollectionEditMenu />
  </div>
</template>

<style lang="scss" scoped>
#tilemap {
  width: 100%;
  height: 100%;
}

#area_top {
  width: 100%;
  height: 118px;
  border-bottom: 2px solid var(--color-5);
}

#area_bottom {
  width: 100%;
  height: calc(100% - 120px);
  display: flex;
}

#area_left {
  flex-shrink: 0;
  height: 100%;
}

#area_huabu {
  flex-shrink: 0;
  height: 100%;
  position: relative;
  overflow: hidden;
  border-left: 2px solid var(--color-5);
  border-right: 2px solid var(--color-5);
  box-sizing: border-box;
}

#area_right {
  flex-shrink: 0;
  height: 100%;
  overflow: hidden;
}

.resize-bar {
  flex-shrink: 0;
  width: 4px;
  height: 100%;
  cursor: col-resize;
  background: transparent;
  z-index: 10;

  &:hover {
    background: var(--color-4);
    opacity: 0.3;
  }
}
</style>
