<script setup lang="ts">
import { ref, watch } from 'vue';
import type { ObjectCollection, ObjectTemplate } from '../../stores/objectLibStore';
import { useObjectLibStore } from '../../stores/objectLibStore';
import { useHuabuStore } from '../../stores/huabuStore';
import { useTileStore } from '../../stores/tileStore';
import { useUiStore } from '../../stores/uiStore';

const props = defineProps<{ collection: ObjectCollection; forceFold?: boolean }>();

const objectLibStore = useObjectLibStore();
const huabuStore = useHuabuStore();
const tileStore = useTileStore();
const uiStore = useUiStore();
const libAPI = (window as any).libAPI;

const open = ref(true);
const renamingName = ref(false);
const nameValue = ref(props.collection.name);

function toggleOpen() {
  open.value = !open.value;
}

watch(
  () => props.forceFold,
  (val) => {
    if (val !== undefined) open.value = !val;
  }
);

async function saveToDisk() {
  await libAPI.writeFile(props.collection.collectionType, props.collection.fileName, {
    collection_name: props.collection.name,
    collection_objects: props.collection.objects
  });
}

async function commitRename() {
  renamingName.value = false;
  if (nameValue.value.trim() && nameValue.value !== props.collection.name) {
    objectLibStore.updateCollection(props.collection.collectionType, props.collection.fileName, {
      name: nameValue.value.trim()
    });
    await saveToDisk();
  }
}

async function appendFocusedTile() {
  const tile = tileStore.focusedTile;
  if (!tile) {
    alert('当前没有聚焦的磁贴');
    return;
  }
  const obj: ObjectTemplate = {
    type: tile.title || '未命名',
    objectType: 'tile',
    data: JSON.parse(JSON.stringify({ style: tile.style, props: tile.props, title: tile.title }))
  };
  objectLibStore.addObjectToCollection(
    props.collection.collectionType,
    props.collection.fileName,
    obj
  );
  await saveToDisk();
}

async function clearCollection() {
  if (!confirm('确认清空该集合？')) return;
  objectLibStore.clearCollection(props.collection.collectionType, props.collection.fileName);
  await saveToDisk();
}

async function deleteCollection() {
  if (!confirm('确认删除该集合？这也会删除对应的本地文件！')) return;
  await libAPI.deleteFile(props.collection.collectionType, props.collection.fileName);
  objectLibStore.removeCollection(props.collection.collectionType, props.collection.fileName);
}

async function exportCollection() {
  await libAPI.exportFile(props.collection.collectionType, props.collection.fileName);
}

function dropObjectOnCanvas(obj: ObjectTemplate, e: DragEvent) {
  e.preventDefault();
  const huabuId = huabuStore.activeHuabuId;
  if (!huabuId || !huabuStore.activeHuabu) return;
  const huabu = huabuStore.activeHuabu;
  const scale = huabu.scale;
  const boardEl = document.querySelector('.huabu-board') as HTMLElement;
  if (!boardEl) return;
  const rect = boardEl.getBoundingClientRect();
  const x = (e.clientX - rect.left) / scale - huabu.panX / scale;
  const y = (e.clientY - rect.top) / scale - huabu.panY / scale;
  const tile = tileStore.createTile(huabuId, {
    title: obj.type,
    style: { ...(obj.data.style as any), left: x, top: y },
    props: obj.data.props as any
  });
  huabuStore.addTileId(huabuId, tile.id);
  tileStore.focusTile(tile.id);
}
</script>

<template>
  <div class="object-collection">
    <div class="collection-header" @click="toggleOpen">
      <span
        v-if="!renamingName || collection.collectionType === 'default'"
        class="collection-name"
        @dblclick.stop="
          collection.collectionType !== 'default' &&
          ((renamingName = true), (nameValue = collection.name))
        "
        >{{ collection.name }}</span
      >
      <input
        v-else
        v-model="nameValue"
        class="collection-name-input"
        autofocus
        @blur="commitRename"
        @keydown.enter="commitRename"
        @keydown.esc="renamingName = false"
        @click.stop
      />
      <div class="collection-toolbar" @click.stop>
        <span
          class="tb-btn tb-edit"
          title="编辑集合"
          @click="
            uiStore.openCollectionEditMenu(`${collection.collectionType}_${collection.fileName}`)
          "
        ></span>
        <span class="tb-btn tb-export" title="导出" @click="exportCollection"></span>
        <span class="tb-btn tb-add" title="加入当前磁贴" @click="appendFocusedTile"></span>
        <span
          v-if="collection.collectionType === 'customize'"
          class="tb-btn tb-delete"
          title="删除集合"
          @click="deleteCollection"
        ></span>
        <span
          v-if="collection.collectionType === 'quickUse'"
          class="tb-btn tb-clear"
          title="清空"
          @click="clearCollection"
        ></span>
      </div>
    </div>
    <div v-if="open" class="collection-body">
      <div
        v-for="(obj, i) in collection.objects"
        :key="i"
        class="object-block"
        :title="obj.type"
        draggable="true"
        @dragend="dropObjectOnCanvas(obj, $event)"
      >
        <div class="object-block-preview">
          <div
            class="object-mini-tile"
            :style="{
              backgroundColor: (obj.data.style as any)?.backgroundColor ?? '#fff',
              width: '40px',
              height: '40px'
            }"
          ></div>
        </div>
        <span class="object-block-name">{{ obj.type }}</span>
      </div>
      <div v-if="collection.objects.length === 0" class="empty-hint">空</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.object-collection {
  width: 100%;
  border-bottom: 1px solid var(--border-color);
}

.collection-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px;
  background: var(--color-2);
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;

  &:hover {
    background: var(--color-3);
  }
}

.collection-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.collection-name-input {
  flex: 1;
  font-size: 13px;
  border: 1px solid var(--focusing-color);
  background: var(--color-1);
  color: var(--text-color);
}

.collection-toolbar {
  display: flex;
  gap: 4px;
  font-size: 13px;
  span {
    cursor: pointer;
    padding: 0 2px;
    &:hover {
      opacity: 0.7;
    }
  }
}

.tb-btn {
  display: inline-block;
  width: 16px;
  height: 16px;
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center;
  cursor: pointer;
  opacity: 0.7;
  &:hover {
    opacity: 1;
  }
}
.tb-edit {
  background-image: url('../../assets/img/edit.png');
}
.tb-export {
  background-image: url('../../assets/img/export.png');
}
.tb-add {
  background-image: url('../../assets/img/plus_big.png');
}
.tb-delete {
  background-image: url('../../assets/img/delete_bin.png');
}
.tb-clear {
  background-image: url('../../assets/img/clear.png');
}

.collection-body {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 6px;
  background: var(--color-1);
}

.object-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 56px;
  cursor: grab;
  &:hover .object-block-preview {
    border-color: var(--focusing-color);
  }
}

.object-block-preview {
  width: 50px;
  height: 50px;
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-0);
}

.object-mini-tile {
  border: 1px solid var(--border-color);
}

.object-block-name {
  font-size: 11px;
  text-align: center;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--color-5);
}

.empty-hint {
  font-size: 12px;
  color: var(--color-4);
  padding: 4px;
}
</style>
