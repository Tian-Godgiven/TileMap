<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useUiStore } from '../../stores/uiStore';
import { useObjectLibStore, type ObjectTemplate } from '../../stores/objectLibStore';

const uiStore = useUiStore();
const objectLibStore = useObjectLibStore();

const editingObjects = ref<ObjectTemplate[]>([]);
const focusedIndex = ref<number | null>(null);
const editingName = ref('');

const collection = computed(() => {
  if (!uiStore.collectionEditMenuKey) return null;
  return objectLibStore.collections.get(uiStore.collectionEditMenuKey) ?? null;
});

const isCustomize = computed(() => {
  return collection.value?.collectionType === 'customize';
});

watch(
  () => uiStore.collectionEditMenuKey,
  (key) => {
    if (!key) return;
    const col = objectLibStore.collections.get(key);
    if (!col) return;

    editingObjects.value = JSON.parse(JSON.stringify(col.objects));
    editingName.value = col.name;
    focusedIndex.value = null;
  }
);

function selectObject(index: number) {
  if (focusedIndex.value === index) {
    focusedIndex.value = null;
  } else {
    focusedIndex.value = index;
  }
}

function deleteObject(index: number) {
  editingObjects.value.splice(index, 1);
  if (focusedIndex.value === index) focusedIndex.value = null;
}

function renameObject(index: number, newName: string) {
  if (editingObjects.value[index]) {
    editingObjects.value[index].type = newName;
  }
}

function moveUp(index: number) {
  if (index > 0) {
    const temp = editingObjects.value[index];
    editingObjects.value[index] = editingObjects.value[index - 1];
    editingObjects.value[index - 1] = temp;
  }
}

function moveDown(index: number) {
  if (index < editingObjects.value.length - 1) {
    const temp = editingObjects.value[index];
    editingObjects.value[index] = editingObjects.value[index + 1];
    editingObjects.value[index + 1] = temp;
  }
}

async function exportCollection() {
  if (!collection.value) return;
  const api = (window as any).fileAPI;
  if (!api) return;

  const path = await api.saveFileDialog(`${collection.value.name}.json`, ['json']);
  if (!path) return;

  const data = {
    name: collection.value.name,
    objects: editingObjects.value
  };
  await api.writeFile(path, JSON.stringify(data, null, 2));
}

async function exportObject() {
  if (focusedIndex.value === null) return;
  const obj = editingObjects.value[focusedIndex.value];
  if (!obj) return;

  const api = (window as any).fileAPI;
  if (!api) return;

  const path = await api.saveFileDialog(`${obj.type}.json`, ['json']);
  if (!path) return;

  await api.writeFile(path, JSON.stringify(obj, null, 2));
}

async function insertObject() {
  const api = (window as any).fileAPI;
  if (!api) return;

  const path = await api.openFileDialog('对象文件', ['json']);
  if (!path) return;

  const content = await api.readFile(path);
  if (!content) return;

  try {
    const obj = JSON.parse(content) as ObjectTemplate;
    editingObjects.value.push(obj);
  } catch {
    alert('文件格式错误');
  }
}

function save() {
  if (!uiStore.collectionEditMenuKey || !collection.value) return;

  const [colType, colFile] = uiStore.collectionEditMenuKey.split('_');
  objectLibStore.updateCollection(colType, colFile, {
    name: editingName.value,
    objects: editingObjects.value
  });

  objectLibStore.saveCollection(collection.value);
  uiStore.closeCollectionEditMenu();
}

function close() {
  uiStore.closeCollectionEditMenu();
}

defineExpose({});
</script>

<template>
  <div v-if="uiStore.collectionEditMenuKey" class="modal-mask">
    <div id="collection_edit_menu">
      <div class="modal_menu_title">
        集合名：
        <input v-if="isCustomize" v-model="editingName" type="text" class="name_input" />
        <div v-else class="name_display">{{ editingName }}</div>
      </div>
      <div id="collection_edit_menu_container">
        <div
          v-for="(obj, i) in editingObjects"
          :key="i"
          class="object_block"
          :class="{ block_focusing: focusedIndex === i }"
          @click="selectObject(i)"
        >
          <div class="object_preview">{{ obj.type }}</div>
          <input
            v-model="obj.type"
            type="text"
            class="object_name"
            @click.stop
            @blur="renameObject(i, obj.type)"
          />
          <div class="delete_button" @click.stop="deleteObject(i)">✕</div>
          <div class="move_buttons">
            <div class="move_up" @click.stop="moveUp(i)">▲</div>
            <div class="move_down" @click.stop="moveDown(i)">▼</div>
          </div>
        </div>
      </div>
      <div id="collection_edit_menu_button">
        <div class="button" @click="exportCollection">导出本集合</div>
        <div style="display: flex; gap: 8px">
          <div class="button" @click="close">取消</div>
          <div class="button" @click="exportObject">导出</div>
          <div class="button" @click="insertObject">导入</div>
          <div class="button" @click="save">保存</div>
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

#collection_edit_menu {
  width: 620px;
  height: 420px;
  background-color: var(--color-2);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 12px;
  display: flex;
  flex-direction: column;
}

.modal_menu_title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}

.name_input,
.name_display {
  flex: 1;
  background-color: var(--color-1);
  border: 1px solid var(--border-color);
  border-radius: 3px;
  padding: 4px 8px;
  font-size: 16px;
}

.name_input:focus {
  outline: 1px solid var(--focusing-color);
}
.name_display {
  color: var(--color-4);
}

#collection_edit_menu_container {
  flex: 1;
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
  padding: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  overflow-y: auto;
  align-content: flex-start;
}

.object_block {
  position: relative;
  width: 104px;
  height: 113px;
  background-color: var(--color-0);
  border: 1px solid var(--border-color);
  border-radius: 3px;
  padding: 5px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;

  &:hover {
    background-color: var(--color-1);
  }
  &.block_focusing {
    outline: 2px dashed var(--focusing-color);
  }
}

.object_preview {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: var(--color-4);
  overflow: hidden;
  text-overflow: ellipsis;
}

.object_name {
  width: 100%;
  font-size: 12px;
  text-align: center;
  padding: 2px;
  border: 1px solid transparent;
  background: transparent;

  &:focus {
    border-color: var(--border-color);
    background: var(--color-1);
  }
}

.delete_button {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 20px;
  height: 20px;
  background-color: var(--color-2);
  border: 1px solid var(--border-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  cursor: pointer;
  z-index: 2;

  &:hover {
    background-color: var(--color-3);
  }
}

.move_buttons {
  position: absolute;
  top: 2px;
  left: 2px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.move_up,
.move_down {
  width: 16px;
  height: 16px;
  background-color: var(--color-2);
  border: 1px solid var(--border-color);
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  cursor: pointer;

  &:hover {
    background-color: var(--color-3);
  }
}

#collection_edit_menu_button {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.button {
  padding: 6px 12px;
  background-color: var(--color-1);
  border: 1px solid var(--border-color);
  border-radius: 3px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background-color: var(--color-3);
  }
}
</style>
