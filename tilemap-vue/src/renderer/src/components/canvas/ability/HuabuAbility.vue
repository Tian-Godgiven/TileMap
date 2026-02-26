<script setup lang="ts">
import { computed, ref } from 'vue';
import { useHuabuStore } from '../../../stores/huabuStore';
import { useTileStore } from '../../../stores/tileStore';
import { useHistoryStore } from '../../../stores/historyStore';
import { useLineStore } from '../../../stores/lineStore';

const huabuStore = useHuabuStore();
const tileStore = useTileStore();
const historyStore = useHistoryStore();
const lineStore = useLineStore();

const activeHuabu = computed(() => huabuStore.activeHuabu);
const scalePercent = computed(() => Math.round((activeHuabu.value?.scale ?? 1) * 100));
const focusedTile = computed(() => tileStore.focusedTile);
const focusedLine = computed(() => lineStore.focusedLine);

const lineStyleOpen = ref(false);
const lineTypeOpen = ref(false);

function scaleUp() {
  if (!huabuStore.activeHuabuId) return;
  const s = (activeHuabu.value?.scale ?? 1) + 0.1;
  huabuStore.setScale(huabuStore.activeHuabuId, s);
}

function scaleDown() {
  if (!huabuStore.activeHuabuId) return;
  const s = (activeHuabu.value?.scale ?? 1) - 0.1;
  huabuStore.setScale(huabuStore.activeHuabuId, s);
}

function deleteSelected() {
  if (!focusedTile.value || !huabuStore.activeHuabuId) return;
  huabuStore.removeTileId(huabuStore.activeHuabuId, focusedTile.value.id);
  tileStore.deleteTile(focusedTile.value.id);
}

function zIndexUp() {
  if (!focusedTile.value) return;
  tileStore.updateStyle(focusedTile.value.id, { zIndex: focusedTile.value.style.zIndex + 1 });
}

function zIndexDown() {
  if (!focusedTile.value) return;
  tileStore.updateStyle(focusedTile.value.id, {
    zIndex: Math.max(1, focusedTile.value.style.zIndex - 1)
  });
}

function setLineStyle(style: string) {
  if (focusedLine.value) lineStore.updateStyle(focusedLine.value.id, { style: style as any });
  lineStore.setDefaultStyle({ style: style as any });
  lineStyleOpen.value = false;
}

function setLineType(type: string) {
  if (focusedLine.value) lineStore.updateStyle(focusedLine.value.id, { type: type as any });
  lineStore.setDefaultStyle({ type: type as any });
  lineTypeOpen.value = false;
}

function toggleStartArrow() {
  const cur = lineStore.defaultLineStyle.startArrow;
  const next = cur === 'none' ? 'arrow' : 'none';
  if (focusedLine.value) lineStore.updateStyle(focusedLine.value.id, { startArrow: next });
  lineStore.setDefaultStyle({ startArrow: next });
}

function toggleEndArrow() {
  const cur = lineStore.defaultLineStyle.endArrow;
  const next = cur === 'none' ? 'arrow' : 'none';
  if (focusedLine.value) lineStore.updateStyle(focusedLine.value.id, { endArrow: next });
  lineStore.setDefaultStyle({ endArrow: next });
}

function closeNestHuabu() {
  if (huabuStore.breadcrumb.length > 1) {
    const rootId = huabuStore.breadcrumb[0];
    huabuStore.returnToBreadcrumb(rootId);
  }
}
</script>

<template>
  <div id="huabu_ability_inner">
    <!-- 缩放组 -->
    <div>
      <div id="huabu_ability_ScaleUp" class="draw_block" title="放大" @click="scaleUp"></div>
      <div id="huabu_ability_ScaleShow" class="draw_block">{{ scalePercent }}%</div>
      <div id="huabu_ability_ScaleDown" class="draw_block" title="缩小" @click="scaleDown"></div>
    </div>

    <!-- 撤销重做组 -->
    <div>
      <div
        id="huabu_ability_Undo"
        class="draw_block"
        title="撤销 Ctrl+Z"
        :class="{ disabled: !historyStore.canUndo }"
        @click="historyStore.undo()"
      ></div>
      <div
        id="huabu_ability_Redo"
        class="draw_block"
        title="重做 Ctrl+Y"
        :class="{ disabled: !historyStore.canRedo }"
        @click="historyStore.redo()"
      ></div>
    </div>

    <!-- 删除组 -->
    <div>
      <div
        id="huabu_ability_Delete"
        class="draw_block"
        title="删除"
        :class="{ disabled: !focusedTile }"
        @click="deleteSelected"
      ></div>
    </div>

    <!-- 层叠组 -->
    <div>
      <div id="huabu_ability_ZIndexDown" class="draw_block" title="下沉" @click="zIndexDown"></div>
      <div id="huabu_ability_ZIndexUp" class="draw_block" title="上浮" @click="zIndexUp"></div>
    </div>

    <!-- 连线样式组 -->
    <div style="position: relative">
      <div
        id="huabu_ability_lineStyle"
        class="draw_block down_menu"
        title="连线样式"
        @click.stop="
          lineStyleOpen = !lineStyleOpen;
          lineTypeOpen = false;
        "
      ></div>
      <div v-if="lineStyleOpen" class="ability_menu" @click.stop>
        <div class="ability_menu_section">
          <div
            v-for="s in ['solid', 'dashed', 'dotted', 'dotdash']"
            :key="s"
            class="huabu_ability_button line_style_btn"
            :class="{ checked: lineStore.defaultLineStyle.style === s, [`line-${s}`]: true }"
            @click="setLineStyle(s)"
          ></div>
        </div>
        <div class="ability_menu_section">
          <div
            class="huabu_ability_button"
            :class="{ checked: lineStore.defaultLineStyle.startArrow !== 'none' }"
            @click="toggleStartArrow"
          >
            源箭头
          </div>
          <div
            class="huabu_ability_button"
            :class="{ checked: lineStore.defaultLineStyle.endArrow !== 'none' }"
            @click="toggleEndArrow"
          >
            尾箭头
          </div>
        </div>
      </div>
    </div>

    <!-- 连线类型组 -->
    <div style="position: relative">
      <div
        id="huabu_ability_lineType"
        class="draw_block down_menu"
        title="连线类型"
        @click.stop="
          lineTypeOpen = !lineTypeOpen;
          lineStyleOpen = false;
        "
      ></div>
      <div v-if="lineTypeOpen" class="ability_menu" @click.stop>
        <div class="ability_menu_section">
          <div
            v-for="t in ['straight', 'bezier', 'flowchart']"
            :key="t"
            class="huabu_ability_button line_type_btn"
            :class="{ checked: lineStore.defaultLineStyle.type === t, [`line-${t}`]: true }"
            @click="setLineType(t)"
          ></div>
        </div>
      </div>
    </div>

    <!-- 连线模式组 -->
    <div>
      <div
        id="huabu_ability_connect"
        class="draw_block"
        title="连线模式 Ctrl+L"
        :class="{ active: lineStore.connectMode }"
        @click="lineStore.connectMode ? lineStore.endConnectMode() : lineStore.startConnectMode()"
      ></div>
    </div>

    <!-- 面包屑导航（嵌套画布时显示） -->
    <div v-if="huabuStore.breadcrumb.length > 1" class="breadcrumb-group">
      <template v-for="(huabu, idx) in huabuStore.breadcrumbHuabus" :key="huabu.id">
        <span
          class="breadcrumb-item"
          :class="{ current: idx === huabuStore.breadcrumb.length - 1 }"
          @click="huabuStore.returnToBreadcrumb(huabu.id)"
          >{{ huabu.name }}</span
        >
        <span v-if="idx < huabuStore.breadcrumb.length - 1" class="breadcrumb-sep">›</span>
      </template>
      <span class="breadcrumb-close" title="关闭嵌套画布" @click="closeNestHuabu">✕</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
#huabu_ability_inner {
  display: flex;
  height: 100%;
  align-items: center;

  > div {
    display: flex;

    &::after {
      content: '';
      height: 100%;
      width: 1px;
      display: block;
      background-color: var(--border-color);
    }

    > .draw_block:first-child {
      padding-left: 15px;
    }
    > .draw_block:last-child {
      padding-right: 15px;
    }
  }
}

.draw_block {
  text-align: center;
  padding: 0 5px;
  height: 49px;
  min-width: 25px;
  font-size: 20px;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  user-select: none;
  background-repeat: no-repeat;
  background-size: 30px 30px;
  background-position: center;

  &:hover {
    background-color: var(--color-3);
  }

  &.disabled {
    opacity: 0.4;
    pointer-events: none;
  }

  &.active {
    background-color: var(--color-3);
  }
}

#huabu_ability_ScaleUp {
  background-image: url('../../../assets/img/ScaleUp.png');
}
#huabu_ability_ScaleDown {
  background-image: url('../../../assets/img/ScaleDown.png');
}
#huabu_ability_Undo {
  background-image: url('../../../assets/img/undo.png');
}
#huabu_ability_Redo {
  background-image: url('../../../assets/img/redo.png');
}
#huabu_ability_Delete {
  background-image: url('../../../assets/img/delete_bin.png');
}
#huabu_ability_ZIndexDown {
  background-image: url('../../../assets/img/to_back.png');
}
#huabu_ability_ZIndexUp {
  background-image: url('../../../assets/img/to_front.png');
}
#huabu_ability_lineStyle {
  background-image: url('../../../assets/img/solid_line.png');
}
#huabu_ability_lineType {
  background-image: url('../../../assets/img/line_type.png');
}

#huabu_ability_ScaleShow {
  justify-content: flex-end;
  text-align: right;
  min-width: 70px;
  font-size: 16px;
}

.breadcrumb-group {
  display: flex;
  align-items: center;
  padding: 0 10px;
  font-size: 16px;
  gap: 4px;
}

.breadcrumb-item {
  cursor: pointer;
  color: var(--color-4);

  &:hover {
    color: var(--text-color);
    text-decoration: underline;
  }

  &.current {
    color: var(--text-color);
    font-weight: bold;
    cursor: default;
    text-decoration: none;
  }
}

.breadcrumb-close {
  cursor: pointer;
  padding: 0 6px;
  color: var(--color-4);
  font-size: 14px;

  &:hover {
    color: var(--warning-color-1);
  }
}

.ability_menu {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 100;
  background-color: var(--color-2);
  border: 1px solid var(--border-color);
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
  min-width: 100px;
  font-size: 14px;
}

.ability_menu_section {
  padding: 4px 0;

  &:not(:last-child) {
    border-bottom: 1px solid var(--border-color);
  }
}

.huabu_ability_button {
  padding: 5px 10px;
  cursor: pointer;
  white-space: nowrap;
  position: relative;

  &:hover {
    background-color: var(--color-3);
  }

  &.checked {
    background-color: var(--color-3);
    font-weight: bold;

    &::after {
      content: '';
      display: block;
      position: absolute;
      right: 6px;
      top: 50%;
      height: 14px;
      width: 14px;
      background-image: url('../../../assets/img/check.png');
      background-position: center;
      background-size: 100%;
      background-repeat: no-repeat;
      transform: translateY(-50%);
    }
  }
}

.line_style_btn,
.line_type_btn {
  width: 90px;
  height: 24px;
  padding-right: 30px;
  background-position: 10px center;
  background-size: 55px auto;
  background-repeat: no-repeat;
}

#huabu_ability_connect {
  background-image: url('../../../assets/img/insert.svg');
}

.line-solid {
  background-image: url('../../../assets/img/solid_line.png');
}
.line-dashed {
  background-image: url('../../../assets/img/dashed_line.png');
}
.line-dotted {
  background-image: url('../../../assets/img/dotted_line.png');
}
.line-dotdash {
  background-image: url('../../../assets/img/dotdash_line.png');
}
.line-straight {
  background-image: url('../../../assets/img/straight_line.png');
}
.line-bezier {
  background-image: url('../../../assets/img/besier_line.png');
}
.line-flowchart {
  background-image: url('../../../assets/img/flowchart_line.png');
}
</style>
