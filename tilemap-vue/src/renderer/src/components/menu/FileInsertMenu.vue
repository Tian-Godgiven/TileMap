<script setup lang="ts">
import { ref, computed } from 'vue';
import { useUiStore } from '../../stores/uiStore';
import { useHuabuStore } from '../../stores/huabuStore';
import { useTileStore } from '../../stores/tileStore';
import { useLineStore } from '../../stores/lineStore';
import { useObjectLibStore } from '../../stores/objectLibStore';
import { deserializeFromJson } from '../../utils/fileSerializer';

const uiStore = useUiStore();
const huabuStore = useHuabuStore();
const tileStore = useTileStore();
const lineStore = useLineStore();
const objectLibStore = useObjectLibStore();

type SelectType = 'huabu' | 'collection' | 'object';
const selectingType = ref<SelectType>('huabu');
const fileLoaded = ref(false);
const fileData = ref<any>(null);
const selectedHuabuIds = ref<Set<string>>(new Set());
const selectedCollectionKey = ref<string | null>(null);

// 自定义集合列表（用于对象导入目标）
const customCollections = computed(() =>
  Array.from(objectLibStore.collections.entries())
    .filter(([, col]) => col.collectionType !== 'default')
    .map(([key, col]) => ({ key, name: col.name }))
);

// 文件中的画布列表
const fileHuabuList = computed(() => {
  if (!fileData.value || selectingType.value !== 'huabu') return [];
  const order: string[] = fileData.value.tilemap?.huabuOrder ?? [];
  const huabus: Record<string, any> = fileData.value.tilemap?.huabus ?? {};
  return order.map((id: string) => ({ id, name: huabus[id]?.name ?? '未命名' }));
});

function changeType(type: SelectType) {
  selectingType.value = type;
  clearFile();
}

function clearFile() {
  fileLoaded.value = false;
  fileData.value = null;
  selectedHuabuIds.value = new Set();
  selectedCollectionKey.value = null;
}

async function selectFile() {
  const api = (window as any).fileAPI;
  if (!api) return;

  let extensions: string[];
  if (selectingType.value === 'collection') {
    extensions = ['json'];
  } else if (selectingType.value === 'huabu') {
    extensions = ['tilemap', 'json'];
  } else {
    extensions = ['json'];
  }

  const path = await api.openFileDialog('导入文件', extensions);
  if (!path) return;

  const content = await api.readFile(path);
  if (!content) return;

  try {
    fileData.value = JSON.parse(content);
    fileLoaded.value = true;
  } catch (e) {
    console.error('文件解析失败', e);
  }
}

function toggleHuabu(id: string) {
  if (selectedHuabuIds.value.has(id)) {
    selectedHuabuIds.value.delete(id);
  } else {
    selectedHuabuIds.value.add(id);
  }
}

async function confirm() {
  if (!fileLoaded.value || !fileData.value) return;

  if (selectingType.value === 'huabu') {
    // 将选中的画布导入到当前工作区
    const data = deserializeFromJson(fileData.value);
    for (const huabuId of selectedHuabuIds.value) {
      const huabu = data.huabus.get(huabuId);
      if (!huabu) continue;
      // 生成新 ID 避免冲突
      const newHuabuId = `huabu_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
      huabu.id = newHuabuId;
      huabuStore.huabus.set(newHuabuId, huabu);
      huabuStore.huabuOrder.push(newHuabuId);
      // 导入磁贴
      for (const tileId of huabu.tileIds) {
        const tile = data.tiles.get(tileId);
        if (tile) tileStore.tiles.set(tileId, tile);
      }
      // 导入连线
      data.lines.forEach((line, lineId) => {
        lineStore.lines.set(lineId, line);
      });
    }
  } else if (selectingType.value === 'collection') {
    // 将集合文件导入到对象库
    const col = fileData.value;
    if (col?.name && col?.objects) {
      objectLibStore.addCollection({
        name: col.name,
        fileName: `import_${Date.now()}`,
        collectionType: 'customize',
        objects: col.objects
      });
    }
  } else if (selectingType.value === 'object') {
    // 将对象添加到选中的集合
    if (!selectedCollectionKey.value) {
      alert('请选择目标集合');
      return;
    }
    const [colType, colFile] = selectedCollectionKey.value.split('_').slice(0, 2);
    objectLibStore.addObjectToCollection(colType, colFile, fileData.value);
  }

  uiStore.closeFileInsertMenu();
}

function cancel() {
  uiStore.closeFileInsertMenu();
}
</script>

<template>
  <div v-if="uiStore.fileInsertMenuVisible" class="modal-mask">
    <div id="file_insert_menu">
      <div class="flex" style="width: 100%; height: 100%">
        <!-- 左侧栏 -->
        <div id="file_insert_menu_left">
          <div id="file_insert_menu_title">导入</div>
          <div id="file_insert_menu_selectType">
            <div :class="{ selecting: selectingType === 'huabu' }" @click="changeType('huabu')">
              画布
            </div>
            <div
              :class="{ selecting: selectingType === 'collection' }"
              @click="changeType('collection')"
            >
              集合
            </div>
            <div :class="{ selecting: selectingType === 'object' }" @click="changeType('object')">
              磁贴/组合体
            </div>
          </div>
          <div id="file_insert_menu_fileButtons">
            <div class="menu_button" @click="selectFile">选择文件</div>
            <div class="menu_button" style="margin-top: 4px" @click="clearFile">清除文件</div>
          </div>
        </div>
        <!-- 右侧 -->
        <div id="file_insert_menu_right">
          <div id="file_insert_menu_information">
            <!-- 空状态 -->
            <div v-if="!fileLoaded" class="empty_info">点击此处选择导入文件</div>

            <!-- 画布 -->
            <div v-else-if="selectingType === 'huabu'" class="info_block">
              <div class="info_title">选择画布：</div>
              <div id="file_insert_menu_huabuSelect">
                <div v-if="fileHuabuList.length === 0" class="empty">无画布</div>
                <div v-for="h in fileHuabuList" :key="h.id" class="huabu_row">
                  <input
                    type="checkbox"
                    :checked="selectedHuabuIds.has(h.id)"
                    @change="toggleHuabu(h.id)"
                  />
                  <span>{{ h.name }}</span>
                </div>
              </div>
              <div class="info_end">将选中的画布添加到当前作图空间</div>
            </div>

            <!-- 集合 -->
            <div v-else-if="selectingType === 'collection'" class="info_block">
              <div class="info_title">集合内容：</div>
              <div id="file_insert_menu_collectionContainer">
                <div v-if="fileData?.objects?.length === 0" class="empty">无对象</div>
                <div v-for="(obj, i) in fileData?.objects ?? []" :key="i" class="collection_item">
                  {{ obj.type || '对象' }}
                </div>
              </div>
              <div class="info_end">将该集合添加至应用程序</div>
            </div>

            <!-- 对象 -->
            <div v-else-if="selectingType === 'object'" class="info_block">
              <div class="info_title">对象预览：</div>
              <div id="file_insert_menu_objectShow">
                <pre style="font-size: 11px; overflow: auto">{{
                  JSON.stringify(fileData, null, 2)
                }}</pre>
              </div>
              <div class="info_end">
                将该对象添加至：
                <select v-model="selectedCollectionKey">
                  <option value="">请选择集合</option>
                  <option v-for="c in customCollections" :key="c.key" :value="c.key">
                    {{ c.name }}
                  </option>
                </select>
              </div>
            </div>
          </div>
          <div id="file_insert_menu_bottom">
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

#file_insert_menu {
  width: 475px;
  height: 300px;
  background-color: var(--color-2);
  padding: 15px;
  box-sizing: content-box;
  border-radius: 4px;
}

#file_insert_menu_left {
  width: 135px;
  margin-right: 5px;
  height: 100%;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}

#file_insert_menu_title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 8px;
}

#file_insert_menu_selectType {
  background-color: var(--color-1);
  border: 1px solid var(--border-color);
  border-radius: 3px;
  padding: 5px;
  margin-bottom: 6px;

  > div {
    font-size: 16px;
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

#file_insert_menu_fileButtons {
  background-color: var(--color-1);
  border: 1px solid var(--border-color);
  border-radius: 3px;
  padding: 5px;
  text-align: center;
}

#file_insert_menu_right {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

#file_insert_menu_information {
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

.empty_info {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-4);
  font-size: 14px;
}

.info_block {
  display: flex;
  flex-direction: column;
  height: 100%;
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

#file_insert_menu_huabuSelect,
#file_insert_menu_collectionContainer,
#file_insert_menu_objectShow {
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

.collection_item {
  padding: 2px 6px;
  font-size: 13px;
  color: var(--color-4);
}

#file_insert_menu_bottom {
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
