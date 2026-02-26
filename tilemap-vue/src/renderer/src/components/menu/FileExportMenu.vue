<script setup lang="ts">
import { ref, computed } from 'vue';
import { useUiStore } from '../../stores/uiStore';
import { useHuabuStore } from '../../stores/huabuStore';
import { useTileStore } from '../../stores/tileStore';
import { useLineStore } from '../../stores/lineStore';
import { useObjectLibStore } from '../../stores/objectLibStore';
import { serializeToJson } from '../../utils/fileSerializer';

const uiStore = useUiStore();
const huabuStore = useHuabuStore();
const tileStore = useTileStore();
const lineStore = useLineStore();
const objectLibStore = useObjectLibStore();

const selectingType = ref<'huabu' | 'collection'>('huabu');
const selectedHuabuIds = ref<Set<string>>(new Set());
const selectedCollectionKey = ref<string | null>(null);

const huabuList = computed(() => {
  return huabuStore.huabuOrder.map((id) => ({
    id,
    name: huabuStore.huabus.get(id)?.name ?? '未命名'
  }));
});

const collectionList = computed(() => {
  return Array.from(objectLibStore.collections.entries())
    .filter(([, col]) => col.collectionType !== 'default')
    .map(([key, col]) => ({ key, name: col.name }));
});

function toggleHuabu(id: string) {
  if (selectedHuabuIds.value.has(id)) {
    selectedHuabuIds.value.delete(id);
  } else {
    selectedHuabuIds.value.add(id);
  }
}

function selectCollection(key: string) {
  selectedCollectionKey.value = key;
}

async function confirm() {
  const api = (window as any).fileAPI;
  if (!api) return;

  if (selectingType.value === 'huabu') {
    // 导出选中的画布
    if (selectedHuabuIds.value.size === 0) {
      alert('请选择至少一个画布');
      return;
    }

    // 创建包含选中画布的 tilemap 文件
    const exportHuabus = new Map<string, any>();
    const exportTiles = new Map<string, any>();
    const exportLines = new Map<string, any>();
    const exportOrder: string[] = [];

    for (const huabuId of selectedHuabuIds.value) {
      const huabu = huabuStore.huabus.get(huabuId);
      if (!huabu) continue;
      exportHuabus.set(huabuId, huabu);
      exportOrder.push(huabuId);

      // 收集该画布的所有磁贴和连线
      for (const tileId of huabu.tileIds) {
        const tile = tileStore.tiles.get(tileId);
        if (tile) {
          exportTiles.set(tileId, tile);
          // 收集磁贴的连线
          for (const lineId of tile.lineIds) {
            const line = lineStore.lines.get(lineId);
            if (line) exportLines.set(lineId, line);
          }
        }
      }
    }

    const json = serializeToJson(exportHuabus, exportOrder, exportTiles, exportLines, '');
    const path = await api.saveFileDialog('导出画布.tilemap', ['tilemap', 'json']);
    if (path) {
      await api.writeFile(path, JSON.stringify(json, null, 2));
    }
  } else if (selectingType.value === 'collection') {
    // 导出选中的集合
    if (!selectedCollectionKey.value) {
      alert('请选择一个集合');
      return;
    }

    const collection = objectLibStore.collections.get(selectedCollectionKey.value);
    if (!collection) return;

    const path = await api.saveFileDialog(`${collection.name}.json`, ['json']);
    if (path) {
      await api.writeFile(path, JSON.stringify(collection, null, 2));
    }
  }

  uiStore.closeFileExportMenu();
}

function cancel() {
  uiStore.closeFileExportMenu();
}
</script>

<template>
  <div v-if="uiStore.fileExportMenuVisible" class="modal-mask">
    <div id="file_export_menu">
      <div class="flex" style="width: 100%; height: 100%">
        <!-- 左侧栏 -->
        <div id="file_export_menu_left">
          <div id="file_export_menu_title">导出</div>
          <div id="file_export_menu_selectType">
            <div :class="{ selecting: selectingType === 'huabu' }" @click="selectingType = 'huabu'">
              画布
            </div>
            <div
              :class="{ selecting: selectingType === 'collection' }"
              @click="selectingType = 'collection'"
            >
              集合
            </div>
          </div>
        </div>
        <!-- 右侧 -->
        <div id="file_export_menu_right">
          <div id="file_export_menu_information">
            <!-- 画布 -->
            <div v-if="selectingType === 'huabu'">
              <div class="info_title">选择画布：</div>
              <div id="file_export_menu_huabuSelect">
                <div v-if="huabuList.length === 0" class="empty">无画布</div>
                <div v-for="h in huabuList" :key="h.id" class="huabu_row">
                  <input
                    type="checkbox"
                    :checked="selectedHuabuIds.has(h.id)"
                    @change="toggleHuabu(h.id)"
                  />
                  <span>{{ h.name }}</span>
                </div>
              </div>
              <div class="info_end">将选中的画布导出为一个工程文件</div>
            </div>
            <!-- 集合 -->
            <div v-else>
              <div class="info_title">选择一个集合：</div>
              <div id="file_export_menu_collectionContainer">
                <div v-if="collectionList.length === 0" class="empty">无集合</div>
                <div
                  v-for="c in collectionList"
                  :key="c.key"
                  class="collection_block"
                  :class="{ selected: selectedCollectionKey === c.key }"
                  @click="selectCollection(c.key)"
                >
                  {{ c.name }}
                </div>
              </div>
              <div class="info_end">将该集合导出为文件</div>
            </div>
          </div>
          <div id="file_export_menu_bottom">
            <div class="menu_button" @click="confirm">确认</div>
            <div class="menu_button" @click="cancel">取消</div>
          </div>
        </div>
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

#file_export_menu {
  width: 475px;
  height: 300px;
  background-color: var(--color-2);
  padding: 15px;
  box-sizing: content-box;
  border-radius: 4px;
}

#file_export_menu_left {
  width: 135px;
  margin-right: 5px;
  height: 100%;
  flex-shrink: 0;
}

#file_export_menu_title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 8px;
}

#file_export_menu_selectType {
  background-color: var(--color-1);
  border: 1px solid var(--border-color);
  border-radius: 3px;
  padding: 5px;

  > div {
    font-size: 18px;
    padding: 3px 6px;
    cursor: pointer;
    border-radius: 4px;

    &:hover {
      background-color: var(--color-3);
    }
    &.selecting {
      background-color: var(--color-3);
      border: 1px solid var(--border-color);
    }
  }
}

#file_export_menu_right {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

#file_export_menu_information {
  flex: 1;
  background-color: var(--color-1);
  border: 1px solid var(--border-color);
  border-radius: 3px;
  padding: 8px 10px;
  margin-bottom: 5px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.info_title {
  font-size: 16px;
  margin-bottom: 4px;
}
.info_end {
  font-size: 13px;
  color: var(--color-4);
  margin-top: 4px;
}
.empty {
  color: var(--color-4);
  font-size: 13px;
}

#file_export_menu_huabuSelect {
  flex: 1;
  overflow-y: auto;
  margin: 4px 0;
}

.huabu_row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 2px 0;
  font-size: 14px;
}

#file_export_menu_collectionContainer {
  flex: 1;
  overflow-y: auto;
  margin: 4px 0;
}

.collection_block {
  padding: 4px 10px;
  border-radius: 3px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background-color: var(--color-3);
  }
  &.selected {
    background-color: var(--color-3);
    border: 1px solid var(--border-color);
  }
}

#file_export_menu_bottom {
  display: flex;
  gap: 6px;
  justify-content: center;
}

.menu_button {
  font-size: 18px;
  height: 38px;
  width: 90px;
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
