<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useFileStore } from '../../stores/fileStore';
import { useHistoryStore } from '../../stores/historyStore';
import { useUiStore } from '../../stores/uiStore';
import { useHuabuStore } from '../../stores/huabuStore';
import { useTileStore } from '../../stores/tileStore';
import { useLineStore } from '../../stores/lineStore';
import { useClipboardStore } from '../../stores/clipboardStore';
import DropdownMenu from '../common/DropdownMenu.vue';
import type { MenuItem } from '../common/DropdownMenu.vue';
import { useConfirm } from '../../composables/useConfirm';

const fileStore = useFileStore();
const historyStore = useHistoryStore();
const uiStore = useUiStore();
const { confirm } = useConfirm();
const huabuStore = useHuabuStore();
const tileStore = useTileStore();
const lineStore = useLineStore();
const clipboardStore = useClipboardStore();

const openMenu = ref<string | null>(null);
const isFullScreen = ref(false);

onMounted(() => {
  fileStore.loadRecentFiles();
});

function toggleMenu(name: string) {
  openMenu.value = openMenu.value === name ? null : name;
}

function closeMenu() {
  openMenu.value = null;
}

async function newFile() {
  if (fileStore.modified) {
    if (!(await confirm('当前文件未保存，是否继续？'))) return;
  }
  huabuStore.huabus.clear();
  huabuStore.huabuOrder = [];
  tileStore.tiles.clear();
  lineStore.lines.clear();
  historyStore.clear();
  fileStore.clearFile();
  huabuStore.init();
  closeMenu();
}

function copyTile() {
  const tile = tileStore.focusedTile;
  if (tile) clipboardStore.copyTile(tile);
  closeMenu();
}

function cutTile() {
  const tile = tileStore.focusedTile;
  if (tile && huabuStore.activeHuabuId) {
    clipboardStore.copyTile(tile);
    const snapshot = { ...tile, style: { ...tile.style }, props: { ...tile.props } };
    huabuStore.removeTileId(huabuStore.activeHuabuId, tile.id);
    tileStore.deleteTile(tile.id);
    historyStore.push({ type: 'tile-delete', tileId: snapshot.id, huabuId: huabuStore.activeHuabuId, snapshot });
  }
  closeMenu();
}

function deleteTile() {
  const tile = tileStore.focusedTile;
  if (tile && huabuStore.activeHuabuId) {
    const snapshot = { ...tile, style: { ...tile.style }, props: { ...tile.props } };
    huabuStore.removeTileId(huabuStore.activeHuabuId, tile.id);
    tileStore.deleteTile(tile.id);
    historyStore.push({ type: 'tile-delete', tileId: snapshot.id, huabuId: huabuStore.activeHuabuId, snapshot });
  }
  closeMenu();
}

function pasteTile() {
  if (clipboardStore.hasClipboard() && huabuStore.activeHuabuId) {
    const newTile = clipboardStore.pasteTile();
    if (newTile) {
      const id = `tile_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      newTile.id = id;
      newTile.lineIds = [];
      newTile.nestHuabuId = null;
      tileStore.tiles.set(id, newTile);
      huabuStore.addTileId(huabuStore.activeHuabuId, id);
      tileStore.focusTile(id);
      historyStore.push({ type: 'tile-create', tileId: id, huabuId: huabuStore.activeHuabuId, snapshot: { ...newTile } });
    }
  }
  closeMenu();
}

async function openRecentFile(path: string) {
  if (fileStore.modified) {
    if (!(await confirm('当前文件未保存，是否继续？'))) return;
  }
  fileStore.openFileByPath(path);
  closeMenu();
}

function toggleFullScreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
    isFullScreen.value = true;
  } else {
    document.exitFullscreen();
    isFullScreen.value = false;
  }
  closeMenu();
}

function openDevTools() {
  const ipcRenderer = (window as any).ipcRenderer;
  if (ipcRenderer) ipcRenderer.send('open-devtools');
}

const fileMenuItems = computed<MenuItem[]>(() => [
  { label: '新建', hint: 'Ctrl+N', action: newFile },
  { label: '打开', hint: 'Ctrl+O', action: () => { fileStore.openFile(); closeMenu(); } },
  { label: '保存', hint: 'Ctrl+S', action: () => { fileStore.saveFile(); closeMenu(); } },
  { label: '另存为', action: () => { fileStore.saveFileAs(); closeMenu(); } },
  { label: '导出为图片/HTML', action: () => { uiStore.openFileSaveAsMenu(); closeMenu(); } },
  { label: '导入', action: () => { uiStore.openFileInsertMenu(); closeMenu(); } },
  { label: '导出', action: () => { uiStore.openFileExportMenu(); closeMenu(); } },
  {
    label: '最近打开',
    submenu: fileStore.recentFiles.length === 0
      ? [{ label: '无最近文件', disabled: true }]
      : fileStore.recentFiles.map(f => ({ label: f.name, action: () => openRecentFile(f.path) }))
  }
]);

const editMenuItems = computed<MenuItem[]>(() => [
  { label: '撤销', hint: 'Ctrl+Z', action: () => { historyStore.undo(); closeMenu(); } },
  { label: '重做', hint: 'Ctrl+Y', action: () => { historyStore.redo(); closeMenu(); } },
  { label: '剪切', hint: 'Ctrl+X', action: cutTile },
  { label: '复制', hint: 'Ctrl+C', action: copyTile },
  { label: '粘贴', hint: 'Ctrl+V', action: pasteTile },
  { label: '删除', hint: 'Delete', action: deleteTile },
]);

const displayMenuItems = computed<MenuItem[]>(() => [
  { label: `${uiStore.showTopAbility ? '隐藏' : '显示'}顶部工具栏`, action: () => { uiStore.toggleTopAbility(); closeMenu(); } },
  { label: `${uiStore.showLeftPanel ? '隐藏' : '显示'}左侧功能栏`, action: () => { uiStore.toggleLeftPanel(); closeMenu(); } },
  { label: `${uiStore.showRightPanel ? '隐藏' : '显示'}右侧编辑栏`, action: () => { uiStore.toggleRightPanel(); closeMenu(); } },
  { label: isFullScreen.value ? '退出全屏' : '全屏', action: toggleFullScreen },
]);

const otherMenuItems = computed<MenuItem[]>(() => [
  { label: '浅色主题', action: () => { uiStore.setTheme('light'); closeMenu(); } },
  { label: '深色主题', action: () => { uiStore.setTheme('dark'); closeMenu(); } },
  { label: `自动保存：${fileStore.autoSave ? '开' : '关'}`, action: () => { fileStore.toggleAutoSave(); closeMenu(); } },
]);

const aboutMenuItems: MenuItem[] = [
  { label: '打开开发者工具', action: () => { openDevTools(); closeMenu(); } },
];
</script>

<template>
  <div class="container">
    <div class="left-menu-wrapper" @mouseleave="closeMenu">
      <div id="top_ability_left">
        <DropdownMenu class="menu-first" label="文件" name="file" :open-menu="openMenu" :items="fileMenuItems" @toggle="toggleMenu" />
        <DropdownMenu label="编辑" name="edit" :open-menu="openMenu" :items="editMenuItems" @toggle="toggleMenu" />
        <DropdownMenu label="界面" name="display" :open-menu="openMenu" :items="displayMenuItems" @toggle="toggleMenu" />
        <DropdownMenu label="其他" name="other" :open-menu="openMenu" :items="otherMenuItems" @toggle="toggleMenu" />
        <DropdownMenu class="menu-last" label="关于" name="about" :open-menu="openMenu" :items="aboutMenuItems" @toggle="toggleMenu" />
      </div>
    </div>

    <div
      id="topAbility_saveReminder"
      class="topAbility_block"
      :class="{ unsave: fileStore.modified, saved: !fileStore.modified }"
      @click="fileStore.saveFile()"
    >
      {{ fileStore.modified ? '当前内容未保存 | 点击此处保存' : '当前内容均已保存' }}
    </div>

    <div id="top_ability_right">
      <div
        id="topAbility_toggleTextblockShow"
        class="topAbility_block icon_block"
        title="切换文本块显示"
        :class="uiStore.showTextblock ? 'show-textblock' : 'hide-textblock'"
        @click="uiStore.toggleTextblock()"
      ></div>
      <div
        id="top_ability_search"
        class="topAbility_block icon_block"
        title="搜索 Ctrl+F"
        @click="uiStore.toggleSearchMenu()"
      ></div>
      <div
        id="top_ability_theme"
        class="topAbility_block icon_block"
        title="切换主题"
        :class="uiStore.theme === 'light' ? 'theme-light' : 'theme-dark'"
        @click="uiStore.setTheme(uiStore.theme === 'light' ? 'dark' : 'light')"
      ></div>
      <div
        id="top_ability_fullscreen"
        class="topAbility_block icon_block"
        title="全屏"
        :class="isFullScreen ? 'fullscreen-exit' : 'fullscreen-enter'"
        @click="toggleFullScreen"
      ></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.container {
  display: flex;
  justify-content: space-between;
  flex-grow: 1;
}

.left-menu-wrapper {
  display: flex;
  align-items: flex-start;
}

#top_ability_left {
  display: flex;
  height: 38px;
  box-sizing: border-box;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  overflow: hidden;
}

:deep(.menu-first) {
  border-top-left-radius: 5px;
}

:deep(.menu-last) {
  border-top-right-radius: 5px;
}

#topAbility_saveReminder {
  height: 34px;
  font-size: 16px;
  border: 1px solid var(--border-color);
  border-radius: 5px;
  text-align: center;
  padding: 0 5px;
  display: flex;
  align-items: center;
  cursor: pointer;
  background-color: var(--color-2);

  &:hover {
    background-color: var(--color-3);
  }

  &.saved {
    background-color: var(--color-2);
    color: var(--text-color);
    font-style: italic;
  }

  &.unsave {
    background-color: var(--warning-color-2);
    color: var(--warning-color-1);
    font-weight: bold;
  }
}

.topAbility_block {
  display: flex;
  align-items: center;
  padding: 0 5px;
  height: 100%;
  cursor: pointer;
  position: relative;
  user-select: none;
  background-color: var(--color-2);

  &:hover {
    background-color: var(--color-3);
  }
}

#top_ability_right {
  display: flex;
  margin-left: auto;
  margin-top: 10px;
  height: 28px;
  box-sizing: border-box;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  overflow: hidden;
}

#top_ability_right > div {
  height: 30px;
  width: 30px;
  background-position: center;
  background-repeat: no-repeat;
}

.icon_block {
  padding: 0;
  justify-content: center;
  background-repeat: no-repeat;
  background-position: center;
}

#top_ability_search {
  background-size: 50%;
  background-image: url('../../assets/img/search.png');
}

#topAbility_toggleTextblockShow {
  background-size: 80%;
}

.show-textblock {
  background-image: url('../../assets/img/textblock.png');
}

.hide-textblock {
  background-image: url('../../assets/img/hide_textblock.png');
}

.theme-light {
  background-size: 60%;
  background-image: url('../../assets/img/dark_theme.png');
}

.theme-dark {
  background-size: 60%;
  background-image: url('../../assets/img/light_theme.png');
}

.fullscreen-enter {
  background-size: 50%;
  background-image: url('../../assets/img/full_screen.png');
}

.fullscreen-exit {
  background-size: 50%;
  background-image: url('../../assets/img/unfull_screen.png');
}
</style>
