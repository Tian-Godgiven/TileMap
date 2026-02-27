<script setup lang="ts">
import { ref, watch } from 'vue';
import type { ObjectCollection, ObjectTemplate } from '../../stores/objectLibStore';
import { useObjectLibStore } from '../../stores/objectLibStore';
import { useHuabuStore } from '../../stores/huabuStore';
import { useTileStore } from '../../stores/tileStore';
import { useHistoryStore } from '../../stores/historyStore';
import { useUiStore } from '../../stores/uiStore';
import MiniTile from '../common/MiniTile.vue';
import { useConfirm } from '../../composables/useConfirm';

const props = defineProps<{ collection: ObjectCollection; forceFold?: boolean }>();

const objectLibStore = useObjectLibStore();
const huabuStore = useHuabuStore();
const tileStore = useTileStore();
const historyStore = useHistoryStore();
const uiStore = useUiStore();
const libAPI = (window as any).libAPI;
const { confirm } = useConfirm();

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
  await libAPI.writeFile(props.collection.collectionType, props.collection.fileName, JSON.parse(JSON.stringify({
    collection_name: props.collection.name,
    collection_objects: props.collection.objects
  })));
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
  if (!(await confirm('确认清空该集合？'))) return;
  objectLibStore.clearCollection(props.collection.collectionType, props.collection.fileName);
  await saveToDisk();
}

async function deleteCollection() {
  if (!(await confirm('确认删除该集合？这也会删除对应的本地文件！'))) return;
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
  const x = (e.clientX - rect.left) / scale;
  const y = (e.clientY - rect.top) / scale;
  const tile = tileStore.createTile(huabuId, {
    title: obj.type,
    style: { ...(obj.data.style as any), left: x, top: y },
    props: obj.data.props as any
  });
  huabuStore.addTileId(huabuId, tile.id);
  tileStore.focusTile(tile.id);
  historyStore.push({ type: 'tile-create', tileId: tile.id, huabuId, snapshot: { ...tile, style: { ...tile.style }, props: { ...tile.props } } });
}

function onDragStart(obj: ObjectTemplate, e: DragEvent) {
  if (!e.dataTransfer) return;

  // 存储对象数据
  e.dataTransfer.effectAllowed = 'copy';
  e.dataTransfer.setData('application/json', JSON.stringify(obj));

  // 获取当前画布的缩放比例
  const huabu = huabuStore.activeHuabu;
  const scale = huabu?.scale ?? 1;

  // 创建幻影元素
  const ghost = document.createElement('div');
  ghost.style.position = 'absolute';
  ghost.style.top = '-9999px';
  ghost.style.opacity = '0.7';
  ghost.style.pointerEvents = 'none';

  // 渲染真实尺寸的 tile，应用画布缩放
  const style = obj.data.style as any;
  const width = (style.width ?? 100) * scale;
  const height = (style.height ?? 100) * scale;
  ghost.style.width = `${width}px`;
  ghost.style.height = `${height}px`;
  ghost.style.backgroundColor = style.backgroundColor ?? '#fff';
  ghost.style.border = `${(style.borderWidth ?? 2) * scale}px ${style.borderStyle ?? 'solid'} ${style.borderColor ?? 'black'}`;
  ghost.style.borderRadius = `${(style.borderRadius ?? 0) * scale}px`;
  ghost.style.fontSize = `${(style.fontSize ?? 30) * scale}px`;
  ghost.style.display = 'flex';
  ghost.style.alignItems = 'center';
  ghost.style.justifyContent = 'center';

  if (obj.data.props?.showTitle && obj.data.title) {
    ghost.textContent = obj.data.title;
  }

  document.body.appendChild(ghost);
  e.dataTransfer.setDragImage(ghost, 0, 0);

  // 清理幻影元素
  setTimeout(() => document.body.removeChild(ghost), 0);
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
        @dragstart="onDragStart(obj, $event)"
      >
        <div class="object-block-preview">
          <MiniTile :tile-data="obj.data" :size="44" />
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
  background-color: var(--color-0);
  width: 100%;
  display: flex;
  padding: 5px;
  overflow: hidden;
  flex-wrap: wrap;
  box-sizing: border-box;
}

.object-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  border-radius: 10px;
  width: 66px;
  min-height: 75px;
  padding: 5px 0;
  margin: 0 3px;
  cursor: grab;
  &:hover {
    background-color: var(--color-3);
  }
}

.object-block-preview {
  width: 100%;
  height: 50px;
  overflow: hidden;
}

.object-block-name {
  margin-top: 5px;
  font-size: 14px;
  height: 20px;
  text-align: center;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty-hint {
  font-size: 12px;
  color: var(--color-4);
  padding: 4px;
}
</style>
