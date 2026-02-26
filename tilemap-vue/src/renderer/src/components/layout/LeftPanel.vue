<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useLineStore } from '../../stores/lineStore';
import { useObjectLibStore } from '../../stores/objectLibStore';
import { useHuabuStore } from '../../stores/huabuStore';
import ObjectCollection from '../left/ObjectCollection.vue';

const lineStore = useLineStore();
const objectLibStore = useObjectLibStore();
const huabuStore = useHuabuStore();
const libAPI = (window as any).libAPI;

const styleOpen = ref(false);
const searchText = ref('');
const allFolded = ref(false);

const filteredCollections = computed(() => {
  const all = Array.from(objectLibStore.collections.values());
  if (!searchText.value.trim()) return all;
  const q = searchText.value.toLowerCase();
  return all
    .map((c) => ({
      ...c,
      objects: c.objects.filter((o) => o.type.toLowerCase().includes(q))
    }))
    .filter((c) => c.objects.length > 0);
});

async function loadAllLibs() {
  for (const type of ['default', 'customize', 'quickUse'] as const) {
    const files: string[] = await libAPI.listFiles(type);
    for (const fileName of files) {
      const data = await libAPI.readFile(type, fileName);
      if (data) {
        objectLibStore.addCollection({
          name: data.collection_name ?? fileName,
          fileName,
          collectionType: type,
          objects: data.collection_objects ?? []
        });
      }
    }
  }
}

async function createNewCollection() {
  const name = prompt('输入集合名称：');
  if (!name?.trim()) return;
  const fileName = `${name.trim()}.tilemap`;
  const data = { collection_name: name.trim(), collection_objects: [] };
  await libAPI.writeFile('customize', fileName, data);
  objectLibStore.addCollection({
    name: name.trim(),
    fileName,
    collectionType: 'customize',
    objects: []
  });
}

async function importCollection() {
  const result = await libAPI.importFile('customize');
  if (result) {
    objectLibStore.addCollection({
      name: result.data.collection_name ?? result.fileName,
      fileName: result.fileName,
      collectionType: 'customize',
      objects: result.data.collection_objects ?? []
    });
  }
}

function toggleConnectMode() {
  if (lineStore.connectMode) lineStore.endConnectMode();
  else lineStore.startConnectMode();
}

function toggleStylePanel() {
  styleOpen.value = !styleOpen.value;
}

function addNewHuabu() {
  const count = huabuStore.huabuOrder.length + 1;
  const huabu = huabuStore.createHuabu(`画布 ${count}`);
  huabuStore.switchHuabu(huabu.id);
}

function clearSearch() {
  searchText.value = '';
}

function toggleFoldAll() {
  allFolded.value = !allFolded.value;
}

onMounted(loadAllLibs);
</script>

<template>
  <div class="left-panel">
    <div class="button_container">
      <!-- 新建画布 -->
      <div id="create_new_huabu" class="button" @click="addNewHuabu">新建画布</div>
      <!-- 连线模式 -->
      <div id="line_connect_mode" class="button">
        <div
          id="toggle_lineConnect_mode"
          :class="{ connecting_mode: lineStore.connectMode }"
          @click="toggleConnectMode"
        >
          <span id="toggle_lineConnect_mode_title">
            {{ lineStore.connectMode ? '退出连线' : '连线模式' }}
          </span>
          <div id="lineConnect_keyboard_hint">Ctrl+L</div>
        </div>
        <div
          id="line_connect_style"
          :class="{ open: styleOpen }"
          @click.stop="toggleStylePanel"
        ></div>
      </div>

      <!-- 连线样式面板 -->
      <div v-if="styleOpen" id="line_connect_style_menu">
        <div class="style_row">
          <span>类型</span>
          <select
            :value="lineStore.defaultLineStyle.type"
            @change="
              lineStore.setDefaultStyle({ type: ($event.target as HTMLSelectElement).value as any })
            "
          >
            <option value="bezier">贝塞尔</option>
            <option value="straight">直线</option>
            <option value="flowchart">折线</option>
          </select>
        </div>
        <div class="style_row">
          <span>线型</span>
          <select
            :value="lineStore.defaultLineStyle.style"
            @change="
              lineStore.setDefaultStyle({ style: ($event.target as HTMLSelectElement).value as any })
            "
          >
            <option value="solid">实线</option>
            <option value="dashed">虚线</option>
            <option value="dotted">点线</option>
            <option value="dotdash">点虚线</option>
          </select>
        </div>
        <div class="style_row">
          <span>颜色</span>
          <input
            type="color"
            :value="lineStore.defaultLineStyle.color"
            @input="lineStore.setDefaultStyle({ color: ($event.target as HTMLInputElement).value })"
          />
        </div>
        <div class="style_row">
          <span>粗细</span>
          <input
            type="number"
            min="1"
            max="10"
            :value="lineStore.defaultLineStyle.width"
            @change="
              lineStore.setDefaultStyle({ width: Number(($event.target as HTMLInputElement).value) })
            "
          />
        </div>
        <div class="style_row">
          <span>起始箭头</span>
          <input
            type="checkbox"
            :checked="lineStore.defaultLineStyle.startArrow !== 'none'"
            @change="
              lineStore.setDefaultStyle({
                startArrow: ($event.target as HTMLInputElement).checked ? 'arrow' : 'none'
              })
            "
          />
        </div>
        <div class="style_row">
          <span>末端箭头</span>
          <input
            type="checkbox"
            :checked="lineStore.defaultLineStyle.endArrow !== 'none'"
            @change="
              lineStore.setDefaultStyle({
                endArrow: ($event.target as HTMLInputElement).checked ? 'arrow' : 'none'
              })
            "
          />
        </div>
      </div>
    </div>

    <div id="leftArea_search_object_type">
      <input v-model="searchText" type="text" placeholder="搜索对象..." />
      <div
        id="leftArea_search_object_type_input_button"
        :class="{ clear: !!searchText }"
        @click="clearSearch"
      ></div>
      <div
        id="leftArea_fold_all_collection"
        :class="allFolded ? 'unfold_all' : 'fold_all'"
        @click="toggleFoldAll"
      ></div>
    </div>
    <div id="leftArea_object_collection_container">
      <ObjectCollection
        v-for="collection in filteredCollections"
        :key="`${collection.collectionType}_${collection.fileName}`"
        :collection="collection"
        :force-fold="allFolded"
      />
    </div>
    <div id="leftArea_import">
      <div class="button" @click="importCollection">导入</div>
      <div class="button" @click="createNewCollection">新建</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.left-panel {
  width: 100%;
  height: 100%;
  position: relative;
}

.button_container {
  width: 100%;
  position: relative;
  overflow: visible;

  > div {
    width: 100%;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: 1px solid var(--border-color);
    font-size: 20px;
  }
}

.button {
  background-color: var(--color-2);
  cursor: pointer;

  &:hover {
    background-color: var(--color-3);
  }
}

#line_connect_mode {
  position: relative;
  display: flex !important;
  padding: 0 !important;
}

#toggle_lineConnect_mode {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: calc(100% - 35px);
  height: 100%;
  cursor: pointer;

  &.connecting_mode {
    outline: 2px dashed var(--focusing-color);
    background-color: var(--color-4);
    #toggle_lineConnect_mode_title {
      font-weight: bolder;
    }
    #lineConnect_keyboard_hint {
      color: var(--color-1);
    }
  }
}

#lineConnect_keyboard_hint {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-4);
  font-size: 16px;
}

#line_connect_style {
  width: 35px;
  height: 100%;
  border-left: 1px solid var(--border-color);
  background-image: url('../../assets/img/simple_arrow_right_darken.png');
  background-position: center;
  background-size: 25px;
  background-repeat: no-repeat;
  cursor: pointer;
  flex-shrink: 0;

  &.open {
    background-image: url('../../assets/img/simple_arrow_left_disabled.png');
  }

  &:hover {
    background-color: var(--color-3);
  }
}

#line_connect_style_menu {
  position: absolute;
  top: 80px;
  left: 100%;
  width: auto;
  background-color: var(--color-2);
  z-index: 20;
  box-sizing: border-box;
  border: 2px solid var(--color-5);
  border-left: none;
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
  padding: 8px 17px;
  white-space: nowrap;
  font-size: 16px;
}

.style_row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 16px;
  gap: 10px;

  select,
  input[type='number'] {
    width: 80px;
    height: 22px;
    border: 1px solid var(--border-color);
    background: var(--color-2);
    color: var(--text-color);
    padding: 2px 4px;
  }
}

#leftArea_search_object_type {
  margin: 10px 5px;
  height: 30px;
  width: calc(100% - 10px);
  display: flex;

  input {
    width: calc(100% - 60px);
    border: 1px solid var(--border-color);
    padding: 0 5px;
    background: var(--color-1);
    color: var(--text-color);
  }

  > div {
    border: 1px solid var(--border-color);
    border-left: none;
    box-sizing: border-box;
    width: 30px;
    height: 30px;
    background-repeat: no-repeat;
    background-position: center;
    cursor: pointer;
  }
}

#leftArea_search_object_type_input_button {
  background-image: url('../../assets/img/search.png');
  background-size: 65%;

  &.clear {
    background-image: url('../../assets/img/delete.svg');
  }
}

#leftArea_fold_all_collection {
  &.fold_all {
    background-size: 60%;
    background-image: url('../../assets/img/menu_up.png');
  }

  &.unfold_all {
    background-size: 60%;
    background-image: url('../../assets/img/menu_down.png');
  }
}

#leftArea_object_collection_container {
  overflow-y: auto;
  overflow-x: hidden;
  width: 100%;
  max-height: calc(100% - 280px);
}

#leftArea_import {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 70px;
  position: sticky;
  bottom: 0;
  gap: 10px;

  > div {
    width: 40%;
    height: 50px;
    display: flex;
    text-align: center;
    justify-content: center;
    align-items: center;
    background-color: var(--color-2);
    cursor: pointer;

    &:hover {
      background-color: var(--color-3);
    }
  }
}
</style>
