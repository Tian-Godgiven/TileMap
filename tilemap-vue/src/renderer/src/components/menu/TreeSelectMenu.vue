<script setup lang="ts">
import { ref, computed } from 'vue';
import { useHuabuStore } from '../../stores/huabuStore';
import { useTileStore } from '../../stores/tileStore';

const huabuStore = useHuabuStore();
const tileStore = useTileStore();

type TargetType = 'huabu' | 'tile';
type RangeType = 'file' | 'huabu';

interface TreeSelectState {
  visible: boolean;
  title: string;
  range: RangeType;
  target: TargetType;
  resolve: ((val: string) => void) | null;
  reject: ((val: false) => void) | null;
}

const state = ref<TreeSelectState>({
  visible: false,
  title: '',
  range: 'file',
  target: 'huabu',
  resolve: null,
  reject: null
});

const selectedId = ref<string | null>(null);

// 树形数据
const treeItems = computed(() => {
  const items: { id: string; name: string; type: 'huabu' | 'tile'; indent: number }[] = [];

  if (state.value.range === 'file') {
    for (const huabuId of huabuStore.huabuOrder) {
      const huabu = huabuStore.huabus.get(huabuId);
      if (!huabu) continue;
      items.push({ id: huabuId, name: huabu.name, type: 'huabu', indent: 0 });
      if (state.value.target === 'tile') {
        for (const tileId of huabu.tileIds) {
          const tile = tileStore.tiles.get(tileId);
          if (tile)
            items.push({ id: tileId, name: tile.title || '(无标题)', type: 'tile', indent: 1 });
        }
      }
    }
  } else if (state.value.range === 'huabu') {
    const activeId = huabuStore.activeHuabuId;
    if (activeId) {
      const huabu = huabuStore.huabus.get(activeId);
      if (huabu) {
        items.push({ id: activeId, name: huabu.name, type: 'huabu', indent: 0 });
        for (const tileId of huabu.tileIds) {
          const tile = tileStore.tiles.get(tileId);
          if (tile)
            items.push({ id: tileId, name: tile.title || '(无标题)', type: 'tile', indent: 1 });
        }
      }
    }
  }

  return items;
});

function show(range: RangeType, target: TargetType): Promise<string> {
  return new Promise((resolve, reject) => {
    selectedId.value = null;
    state.value = {
      visible: true,
      title: target === 'huabu' ? '选择画布：' : '选择磁贴：',
      range,
      target,
      resolve,
      reject
    };
  });
}

function selectItem(id: string, type: 'huabu' | 'tile') {
  if (type === state.value.target) {
    selectedId.value = id;
  }
}

function confirm() {
  state.value.visible = false;
  if (selectedId.value && state.value.resolve) {
    state.value.resolve(selectedId.value);
  } else if (state.value.reject) {
    state.value.reject(false);
  }
}

function cancel() {
  state.value.visible = false;
  if (state.value.reject) state.value.reject(false);
}

defineExpose({ show });
</script>

<template>
  <div v-if="state.visible" class="modal-mask">
    <div id="tree_select_menu">
      <div class="modal_menu_title">{{ state.title }}</div>
      <div id="tree_select_menu_container">
        <div
          v-for="item in treeItems"
          :key="item.id"
          class="tree_row"
          :class="{
            tree_select_menu_selected: selectedId === item.id,
            selectable: item.type === state.target,
            'tree-huabu': item.type === 'huabu',
            'tree-tile': item.type === 'tile'
          }"
          :style="{ paddingLeft: item.indent * 16 + 8 + 'px' }"
          @click="selectItem(item.id, item.type)"
        >
          <span class="tree-icon">{{ item.type === 'huabu' ? '🗂' : '▪' }}</span>
          <span>{{ item.name }}</span>
        </div>
      </div>
      <div id="tree_select_menu_button">
        <div class="menu_button" @click="confirm">确认</div>
        <div class="menu_button" @click="cancel">取消</div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 500;
  display: flex;
  align-items: center;
  justify-content: center;
}

#tree_select_menu {
  width: 300px;
  max-height: calc(100vh - 200px);
  background-color: var(--color-2);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal_menu_title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 6px;
}

#tree_select_menu_container {
  max-height: 250px;
  overflow-y: auto;
  margin-bottom: 10px;
  border: 1px solid var(--border-color);
  border-radius: 3px;
  background: var(--color-1);
}

.tree_row {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  font-size: 13px;
  cursor: default;

  &.selectable {
    cursor: pointer;
    &:hover {
      background: var(--color-2);
    }
  }

  &.tree-huabu {
    font-weight: bold;
  }
  &.tree-tile {
    color: var(--color-5);
  }

  &.tree_select_menu_selected {
    background-color: var(--color-3) !important;
    font-weight: bold;
    border-radius: 3px;
  }
}

.tree-icon {
  font-size: 12px;
}

#tree_select_menu_button {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.menu_button {
  font-size: 16px;
  height: 34px;
  width: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-1);
  border: 1px solid var(--border-color);
  border-radius: 3px;
  cursor: pointer;

  &:hover {
    background-color: var(--color-3);
  }
}
</style>
