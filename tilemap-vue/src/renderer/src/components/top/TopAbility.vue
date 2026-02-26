<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useFileStore } from '../../stores/fileStore';
import { useHistoryStore } from '../../stores/historyStore';
import { useUiStore } from '../../stores/uiStore';
import { useHuabuStore } from '../../stores/huabuStore';
import { useTileStore } from '../../stores/tileStore';
import { useLineStore } from '../../stores/lineStore';
import { useClipboardStore } from '../../stores/clipboardStore';

const fileStore = useFileStore();
const historyStore = useHistoryStore();
const uiStore = useUiStore();
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

function newFile() {
  if (fileStore.modified) {
    if (!confirm('当前文件未保存，是否继续？')) return;
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
    huabuStore.removeTileId(huabuStore.activeHuabuId, tile.id);
    tileStore.deleteTile(tile.id);
  }
  closeMenu();
}

function deleteTile() {
  const tile = tileStore.focusedTile;
  if (tile && huabuStore.activeHuabuId) {
    huabuStore.removeTileId(huabuStore.activeHuabuId, tile.id);
    tileStore.deleteTile(tile.id);
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
    }
  }
  closeMenu();
}

function openRecentFile(path: string) {
  if (fileStore.modified) {
    if (!confirm('当前文件未保存，是否继续？')) return;
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
</script>

<template>
  <div class="container">
    <div id="top_ability_left" @mouseleave="closeMenu">
      <!-- 文件 -->
      <div class="topAbility_block down_menu" @click="toggleMenu('file')">
        文件
        <div v-show="openMenu === 'file'" class="menu">
          <div class="hover" @click="newFile">
            新建
            <div class="keyboard_hint">Ctrl+N</div>
          </div>
          <div
            class="hover"
            @click="
              fileStore.openFile();
              closeMenu();
            "
          >
            打开
            <div class="keyboard_hint">Ctrl+O</div>
          </div>
          <div
            class="hover"
            @click="
              fileStore.saveFile();
              closeMenu();
            "
          >
            保存
            <div class="keyboard_hint">Ctrl+S</div>
          </div>
          <div
            class="hover"
            @click="
              fileStore.saveFileAs();
              closeMenu();
            "
          >
            另存为
          </div>
          <div
            class="hover"
            @click="
              uiStore.openFileSaveAsMenu();
              closeMenu();
            "
          >
            导出为图片/HTML
          </div>
          <div
            class="hover"
            @click="
              uiStore.openFileInsertMenu();
              closeMenu();
            "
          >
            导入
          </div>
          <div
            class="hover"
            @click="
              uiStore.openFileExportMenu();
              closeMenu();
            "
          >
            导出
          </div>
          <div class="hover side_menu" @click.stop="toggleMenu('recent')">
            最近打开
            <div v-show="openMenu === 'recent'" class="menu menu-right">
              <div v-if="fileStore.recentFiles.length === 0" class="hover disabled">无最近文件</div>
              <div
                v-for="f in fileStore.recentFiles"
                :key="f.path"
                class="hover"
                :title="f.path"
                @click="openRecentFile(f.path)"
              >
                {{ f.name }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 编辑 -->
      <div class="topAbility_block down_menu" @click="toggleMenu('edit')">
        编辑
        <div v-show="openMenu === 'edit'" class="menu">
          <div
            class="hover"
            @click="
              historyStore.undo();
              closeMenu();
            "
          >
            撤销
            <div class="keyboard_hint">Ctrl+Z</div>
          </div>
          <div
            class="hover"
            @click="
              historyStore.redo();
              closeMenu();
            "
          >
            重做
            <div class="keyboard_hint">Ctrl+Y</div>
          </div>
          <div class="hover" @click="cutTile">
            剪切
            <div class="keyboard_hint">Ctrl+X</div>
          </div>
          <div class="hover" @click="copyTile">
            复制
            <div class="keyboard_hint">Ctrl+C</div>
          </div>
          <div class="hover" @click="pasteTile">
            粘贴
            <div class="keyboard_hint">Ctrl+V</div>
          </div>
          <div class="hover" @click="deleteTile">
            删除
            <div class="keyboard_hint">Delete</div>
          </div>
        </div>
      </div>

      <!-- 界面 -->
      <div class="topAbility_block down_menu" @click="toggleMenu('display')">
        界面
        <div v-show="openMenu === 'display'" class="menu">
          <div
            class="hover"
            @click="
              uiStore.toggleTopAbility();
              closeMenu();
            "
          >
            {{ uiStore.showTopAbility ? '隐藏' : '显示' }}顶部工具栏
          </div>
          <div
            class="hover"
            @click="
              uiStore.toggleLeftPanel();
              closeMenu();
            "
          >
            {{ uiStore.showLeftPanel ? '隐藏' : '显示' }}左侧功能栏
          </div>
          <div
            class="hover"
            @click="
              uiStore.toggleRightPanel();
              closeMenu();
            "
          >
            {{ uiStore.showRightPanel ? '隐藏' : '显示' }}右侧编辑栏
          </div>
          <div class="hover" @click="toggleFullScreen">
            {{ isFullScreen ? '退出全屏' : '全屏' }}
          </div>
        </div>
      </div>

      <!-- 其他 -->
      <div class="topAbility_block down_menu" @click="toggleMenu('other')">
        其他
        <div v-show="openMenu === 'other'" class="menu">
          <div
            class="hover"
            @click="
              uiStore.setTheme('light');
              closeMenu();
            "
          >
            浅色主题
          </div>
          <div
            class="hover"
            @click="
              uiStore.setTheme('dark');
              closeMenu();
            "
          >
            深色主题
          </div>
          <div
            class="hover"
            @click="
              fileStore.toggleAutoSave();
              closeMenu();
            "
          >
            自动保存：{{ fileStore.autoSave ? '开' : '关' }}
          </div>
        </div>
      </div>

      <!-- 关于 -->
      <div class="topAbility_block down_menu" @click="toggleMenu('about')">
        关于
        <div v-show="openMenu === 'about'" class="menu">
          <div
            class="hover"
            @click="
              openDevTools();
              closeMenu();
            "
          >
            打开开发者工具
          </div>
        </div>
      </div>

      <div
        id="topAbility_saveReminder"
        class="topAbility_block"
        :class="{ unsave: fileStore.modified, saved: !fileStore.modified }"
        @click="fileStore.saveFile()"
      >
        {{ fileStore.modified ? '未保存 · 点击保存' : '已保存' }}
      </div>
    </div>

    <div id="top_ability_right">
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
.container{
  display: flex;
  justify-content: space-between;
  flex-grow: 1;
}

#top_ability_left {
  display: flex;
  position: relative;
}

.topAbility_block {
  display: flex;
  align-items: center;
  padding: 0 10px;
  height: 38px;
  font-size: 20px;
  cursor: pointer;
  position: relative;
  user-select: none;

  &:hover {
    background-color: var(--color-3);
  }

  &.unsave {
    color: var(--warning-color-1);
    font-size: 14px;
  }

  &.saved {
    color: var(--color-4);
    font-size: 14px;
  }
}

.menu {
  position: absolute;
  top: 100%;
  left: 0;
  background-color: var(--color-2);
  border: 1px solid var(--border-color);
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
  z-index: 100;
  min-width: 160px;
  font-size: 18px;
}

.menu-right {
  left: 100%;
  top: 0;
}

.hover {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px 10px;
  white-space: nowrap;
  cursor: pointer;
  position: relative;

  &:hover {
    background-color: var(--color-3);
  }

  &.disabled {
    color: var(--color-4);
    cursor: default;
    pointer-events: none;
  }
}

.keyboard_hint {
  font-size: 14px;
  color: var(--color-4);
  margin-left: 20px;
}

#top_ability_right {
  display: flex;
  margin-left: auto;
}

.icon_block {
  width: 38px;
  padding: 0;
  justify-content: center;
  background-repeat: no-repeat;
  background-size: 24px 24px;
  background-position: center;
}

#top_ability_search {
  background-image: url('../../assets/img/search.png');
}
.theme-light {
  background-image: url('../../assets/img/dark_theme.png');
}
.theme-dark {
  background-image: url('../../assets/img/light_theme.png');
}
.fullscreen-enter {
  background-image: url('../../assets/img/full_screen.png');
}
.fullscreen-exit {
  background-image: url('../../assets/img/unfull_screen.png');
}
</style>
