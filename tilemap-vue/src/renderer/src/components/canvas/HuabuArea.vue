<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue';
import { useHuabuStore } from '../../stores/huabuStore';
import HuabuBoard from './HuabuBoard.vue';
import HuabuAbility from './ability/HuabuAbility.vue';

const huabuStore = useHuabuStore();

onMounted(() => {
  huabuStore.init();
});

function addNewHuabu() {
  const count = huabuStore.huabuOrder.length + 1;
  const huabu = huabuStore.createHuabu(`画布 ${count}`);
  huabuStore.switchHuabu(huabu.id);
}

// tab 右键菜单
const tabMenu = ref<{ visible: boolean; x: number; y: number; huabuId: string | null }>({
  visible: false,
  x: 0,
  y: 0,
  huabuId: null
});
const renamingId = ref<string | null>(null);
const renameValue = ref('');

function onTabContextMenu(e: MouseEvent, huabuId: string) {
  e.preventDefault();
  tabMenu.value = { visible: true, x: e.clientX, y: e.clientY, huabuId };
}

function closeTabMenu() {
  tabMenu.value.visible = false;
}

function startRename() {
  const id = tabMenu.value.huabuId;
  if (!id) return;
  renamingId.value = id;
  renameValue.value = huabuStore.huabus.get(id)?.name ?? '';
  closeTabMenu();
}

function commitRename(id: string) {
  if (renameValue.value.trim()) {
    huabuStore.renameHuabu(id, renameValue.value.trim());
  }
  renamingId.value = null;
}

function deleteHuabu() {
  const id = tabMenu.value.huabuId;
  if (!id) return;
  if (huabuStore.huabuOrder.length <= 1) {
    closeTabMenu();
    return;
  }
  huabuStore.deleteHuabu(id);
  closeTabMenu();
}

function copyHuabu() {
  const id = tabMenu.value.huabuId;
  if (!id) return;
  const newHuabu = huabuStore.copyHuabu(id, true);
  if (newHuabu) huabuStore.switchHuabu(newHuabu.id);
  closeTabMenu();
}

// 翻页按钮
const buttonBarRef = ref<HTMLElement | null>(null);
const changeBarButtonRef = ref<HTMLElement | null>(null);
const pageVisible = ref(false);
const pageLeftDisabled = ref(true);
const pageRightDisabled = ref(false);
const buttonBarLeft = ref(0);

function updatePageState() {
  const bar = buttonBarRef.value;
  const container = changeBarButtonRef.value;
  if (!bar || !container) return;
  const barWidth = bar.scrollWidth;
  const containerWidth = container.clientWidth;
  pageVisible.value = barWidth > containerWidth;
  const distance = barWidth - containerWidth;
  pageLeftDisabled.value = buttonBarLeft.value >= 0;
  pageRightDisabled.value = buttonBarLeft.value <= -distance;
}

function scrollLeft() {
  const container = changeBarButtonRef.value;
  if (!container) return;
  const width = container.clientWidth;
  buttonBarLeft.value = Math.min(0, buttonBarLeft.value + Math.floor(width * 0.8));
  updatePageState();
}

function scrollRight() {
  const bar = buttonBarRef.value;
  const container = changeBarButtonRef.value;
  if (!bar || !container) return;
  const width = container.clientWidth;
  const distance = bar.scrollWidth - width;
  buttonBarLeft.value = Math.max(-distance, buttonBarLeft.value - Math.floor(width * 0.8));
  updatePageState();
}

watch(
  () => huabuStore.huabuOrder.length,
  async () => {
    await nextTick();
    updatePageState();
  }
);
</script>

<template>
  <div class="huabu-area" @click="closeTabMenu">
    <div id="huabu_ability">
      <HuabuAbility />
    </div>
    <div id="huabu_container">
      <HuabuBoard />
    </div>
    <div id="huabu_changeBar">
      <div
        id="huabu_changeBar_button"
        ref="changeBarButtonRef"
        :style="{ width: pageVisible ? 'calc(100% - 98px)' : 'calc(100% - 50px)' }"
      >
        <div id="huabu_buttonBar" ref="buttonBarRef" :style="{ left: buttonBarLeft + 'px' }">
          <div
            v-for="huabu in huabuStore.tabHuabus"
            :key="huabu.id"
            class="huabu_button"
            :class="{ focusing_button: huabu.id === huabuStore.activeHuabuId }"
            @click="huabuStore.switchHuabu(huabu.id)"
            @contextmenu="onTabContextMenu($event, huabu.id)"
          >
            <template v-if="renamingId === huabu.id">
              <input
                v-model="renameValue"
                class="rename_input"
                autofocus
                @blur="commitRename(huabu.id)"
                @keydown.enter="commitRename(huabu.id)"
                @keydown.esc="renamingId = null"
                @click.stop
              />
            </template>
            <template v-else>{{ huabu.name }}</template>
          </div>
        </div>
      </div>
      <div v-if="pageVisible" id="huabu_changeBar_page" class="flex">
        <div
          id="huabu_changeBar_page_left"
          :class="{ disabled: pageLeftDisabled }"
          @click="scrollLeft"
        ></div>
        <div
          id="huabu_changeBar_page_right"
          :class="{ disabled: pageRightDisabled }"
          @click="scrollRight"
        ></div>
      </div>
      <div id="huabu_changeBar_add" title="新建画布" @click.stop="addNewHuabu">+</div>
    </div>

    <!-- tab 右键菜单 -->
    <div
      v-if="tabMenu.visible"
      class="tab-context-menu"
      :style="{ left: `${tabMenu.x}px`, top: `${tabMenu.y}px` }"
      @click.stop
    >
      <div class="tab-menu-item" @click="copyHuabu">创建副本</div>
      <div class="tab-menu-item" @click="startRename">重命名</div>
      <div
        class="tab-menu-item danger"
        :class="{ disabled: huabuStore.huabuOrder.length <= 1 }"
        @click="deleteHuabu"
      >
        删除画布
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.huabu-area {
  width: 100%;
  height: 100%;
  position: relative;
}

#huabu_ability {
  background-color: var(--color-2);
  border-bottom: 1px solid var(--border-color);
  width: 100%;
  height: 50px;
  box-sizing: border-box;
  display: flex;
  flex-wrap: nowrap;
  position: relative;
  z-index: 3;
}

#huabu_container {
  width: 100%;
  background-color: var(--color-0);
  height: calc(100% - 80px);
  overflow: hidden;
  position: relative;
  z-index: 1;
  box-sizing: border-box;
}

#huabu_changeBar {
  width: 100%;
  height: 30px;
  background-color: var(--color-1);
  border-top: 1px solid var(--border-color);
  position: absolute;
  bottom: 0;
  z-index: 3;
}

#huabu_changeBar_button {
  width: calc(100% - 50px);
  height: 100%;
  overflow: hidden;
  position: relative;
}

#huabu_changeBar_add {
  position: absolute;
  right: 0;
  top: 0;
  width: 50px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  cursor: pointer;
  border-left: 1px solid var(--border-color);
  background-color: var(--color-1);

  &:hover {
    background-color: var(--color-2);
  }
}

#huabu_buttonBar {
  display: inline-flex;
  position: absolute;
  height: 100%;
  z-index: 1;
  transition: left 0.3s;
}

.huabu_button {
  white-space: nowrap;
  text-align: center;
  font-size: 20px;
  padding: 0 10px;
  height: 100%;
  box-sizing: border-box;
  position: relative;
  color: var(--color-5);
  background-color: var(--color-1);
  border-right: 1px solid var(--border-color);
  cursor: pointer;
  display: flex;
  align-items: center;

  &:hover {
    background-color: var(--color-2);
  }
}

.focusing_button {
  font-weight: 700;
  color: var(--text-color);
  background-color: var(--color-0);

  &::before {
    content: '';
    display: block;
    width: calc(100% + 20px);
    left: -10px;
    height: 1px;
    background-color: var(--color-0);
    position: absolute;
    top: -1px;
  }
}

.rename_input {
  width: 100%;
  background: var(--color-2);
  border: 1px solid var(--focusing-color);
  color: var(--text-color);
  padding: 2px 4px;
  font-size: 18px;
  outline: none;
}

#huabu_changeBar_page {
  position: absolute;
  right: 50px;
  top: 0;
  height: 100%;
  display: flex;
}

#huabu_changeBar_page_left,
#huabu_changeBar_page_right {
  width: 24px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-color: var(--color-1);
  border-left: 1px solid var(--border-color);
  font-size: 14px;

  &::after {
    content: '';
    display: block;
    width: 7px;
    height: 7px;
    border-top: 2px solid var(--text-color);
    border-right: 2px solid var(--text-color);
  }

  &:hover {
    background-color: var(--color-2);
  }

  &.disabled {
    opacity: 0.3;
    pointer-events: none;
  }
}

#huabu_changeBar_page_left::after {
  transform: rotate(-135deg);
  margin-left: 3px;
}

#huabu_changeBar_page_right::after {
  transform: rotate(45deg);
  margin-right: 3px;
}

.tab-context-menu {
  position: fixed;
  z-index: 1000;
  background: var(--color-2);
  border: 1px solid var(--border-color);
  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.2);
  min-width: 120px;
  font-size: 14px;
}

.tab-menu-item {
  padding: 6px 12px;
  cursor: pointer;

  &:hover {
    background: var(--color-3);
  }

  &.danger {
    color: var(--warning-color-1);
  }

  &.disabled {
    opacity: 0.4;
    pointer-events: none;
  }
}
</style>
