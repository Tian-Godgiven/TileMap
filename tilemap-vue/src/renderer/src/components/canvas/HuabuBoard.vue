<script setup lang="ts">
import { computed, ref } from 'vue';
import { useHuabuStore } from '../../stores/huabuStore';
import { useTileStore } from '../../stores/tileStore';
import { useLineStore } from '../../stores/lineStore';
import { useCompositeStore } from '../../stores/compositeStore';
import { useDrag } from '../../composables/useDrag';
import { useResize } from '../../composables/useResize';
import { useCanvasPan } from '../../composables/useCanvasPan';
import { useCompositeDrag } from '../../composables/useCompositeDrag';
import { generateLinePath } from '../../utils/geometry';
import TileTextBlock from './TileTextBlock.vue';
import TileContextMenu from '../menu/TileContextMenu.vue';
import HuabuContextMenu from '../menu/HuabuContextMenu.vue';
import LineContextMenu from '../menu/LineContextMenu.vue';

const huabuStore = useHuabuStore();
const tileStore = useTileStore();
const lineStore = useLineStore();
const compositeStore = useCompositeStore();

const currentHuabu = computed(() => huabuStore.activeHuabu);
const currentScale = computed(() => currentHuabu.value?.scale ?? 1);

const currentComposites = computed(() => {
  if (!currentHuabu.value) return [];
  return currentHuabu.value.compositeIds
    .map((id) => compositeStore.composites.get(id))
    .filter(Boolean);
});

const tilesInComposites = computed(() => {
  const set = new Set<string>();
  for (const composite of currentComposites.value) {
    for (const tileId of composite.tileIds) {
      set.add(tileId);
    }
  }
  return set;
});

const standaloneTiles = computed(() => {
  if (!currentHuabu.value) return [];
  return currentHuabu.value.tileIds
    .filter((id) => !tilesInComposites.value.has(id))
    .map((id) => tileStore.tiles.get(id))
    .filter(Boolean);
});

const currentLines = computed(() => {
  if (!currentHuabu.value) return [];
  return currentHuabu.value.lineIds.map((id) => lineStore.lines.get(id)).filter(Boolean);
});

function getLinePath(lineId: string): string {
  const line = lineStore.lines.get(lineId);
  if (!line) return '';
  const tileA = tileStore.tiles.get(line.startTileId);
  const tileB = tileStore.tiles.get(line.endTileId);
  if (!tileA || !tileB) return '';
  return generateLinePath(tileA, tileB, line.style.type);
}

function getLineMidPoint(lineId: string): { x: number; y: number } {
  const line = lineStore.lines.get(lineId);
  if (!line) return { x: 0, y: 0 };
  const tileA = tileStore.tiles.get(line.startTileId);
  const tileB = tileStore.tiles.get(line.endTileId);
  if (!tileA || !tileB) return { x: 0, y: 0 };
  return {
    x: (tileA.style.left + tileA.style.width / 2 + tileB.style.left + tileB.style.width / 2) / 2,
    y: (tileA.style.top + tileA.style.height / 2 + tileB.style.top + tileB.style.height / 2) / 2
  };
}

const editingLineTextId = ref<string | null>(null);
const editingLineTextValue = ref('');

function onLineDblClick(e: MouseEvent, lineId: string) {
  e.stopPropagation();
  const line = lineStore.lines.get(lineId);
  if (!line) return;
  editingLineTextId.value = lineId;
  editingLineTextValue.value = line.text ?? '';
}

function commitLineTextEdit(lineId: string): void {
  lineStore.updateText(lineId, editingLineTextValue.value);
  editingLineTextId.value = null;
}

function getStrokeDasharray(style: string): string {
  if (style === 'dashed') return '10,10';
  if (style === 'dotted') return '2,5';
  if (style === 'dotdash') return '2,10,10,10';
  return '';
}

const boardStyle = computed(() => {
  if (!currentHuabu.value) return {};
  const { style, scale, panX, panY, grid } = currentHuabu.value;
  const baseStyle: any = {
    width: `${style.width}px`,
    height: `${style.height}px`,
    backgroundColor: style.backgroundColor,
    transform: `translate(${panX}px, ${panY}px) scale(${scale})`,
    transformOrigin: '0 0'
  };

  // 如果显示网格，添加网格背景
  if (grid.show) {
    const gridSize = grid.size;
    const gridColor = grid.color;
    const svg = `<svg width="${gridSize}" height="${gridSize}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid" width="${gridSize}" height="${gridSize}" patternUnits="userSpaceOnUse">
          <path d="M 0 ${gridSize / 4} L ${gridSize} ${gridSize / 4} M ${gridSize / 4} 0 L ${gridSize / 4} ${gridSize} M 0 ${gridSize / 2} L ${gridSize} ${gridSize / 2} M ${gridSize / 2} 0 L ${gridSize / 2} ${gridSize} M 0 ${(gridSize * 3) / 4} L ${gridSize} ${(gridSize * 3) / 4} M ${(gridSize * 3) / 4} 0 L ${(gridSize * 3) / 4} ${gridSize}" fill="none" stroke="${gridColor}" opacity="0.2" stroke-width="1"/>
          <path d="M ${gridSize} 0 L 0 0 0 ${gridSize}" fill="none" stroke="${gridColor}" stroke-width="1"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>`;
    const base64 = btoa(unescape(encodeURIComponent(svg)));
    baseStyle.backgroundImage = `url('data:image/svg+xml;base64,${base64}')`;
  }

  return baseStyle;
});

const drag = useDrag({ huabuScale: () => currentScale.value });
const resize = useResize({ huabuScale: () => currentScale.value });
const pan = useCanvasPan({ huabuId: () => huabuStore.activeHuabuId });
const compositeDrag = useCompositeDrag({ huabuScale: () => currentScale.value });

const hoveredTileId = ref<string | null>(null);

// 判断某个磁贴的 textblock 是否应该显示
function shouldShowTextblock(tileId: string): boolean {
  const tile = tileStore.tiles.get(tileId);
  if (!tile || !tile.content) return false;
  const state = tile.props.textblockShowState;
  if (state === 'enternalHide') return false;
  if (state === 'enternalShow') return true;
  return hoveredTileId.value === tileId;
}

function onWrapperPointerMove(e: PointerEvent) {
  drag.onPointerMove(e);
  resize.onPointerMove(e);
  pan.onPointerMove(e);
  compositeDrag.onPointerMove(e);
}
function onWrapperPointerUp(e: PointerEvent) {
  drag.onPointerUp(e);
  resize.onPointerUp();
  pan.onPointerUp();
  compositeDrag.onPointerUp();
}

function onTilePointerDown(e: PointerEvent, tileId: string) {
  if (lineStore.connectMode) {
    e.stopPropagation();
    if (huabuStore.activeHuabuId) {
      lineStore.handleTileClick(huabuStore.activeHuabuId, tileId);
    }
    return;
  }
  tileStore.focusTile(tileId);
  drag.onPointerDown(e, tileId);
  // 显示超链接弹窗
  const tile = tileStore.tiles.get(tileId);
  if (
    tile?.link !== null &&
    tile?.link !== undefined &&
    tile.link !== '' &&
    !tile.props.disableLinkPopup
  ) {
    linkMenu.value = { visible: true, tileId, link: tile.link };
  }
  // 显示"进入画布"按钮
  if (tile?.nestHuabuId && tile.props.nestOpenMode === 'button') {
    nestButton.value = { visible: true, tileId };
  } else {
    nestButton.value = { visible: false, tileId: null };
  }
}

// 超链接弹窗
const linkMenu = ref<{ visible: boolean; tileId: string | null; link: string }>({
  visible: false,
  tileId: null,
  link: ''
});
function closeLinkMenu() {
  linkMenu.value.visible = false;
}
function openLink() {
  if (linkMenu.value.link) window.open(linkMenu.value.link, '_blank');
  closeLinkMenu();
}
function toggleDisableLinkPopup(e: Event) {
  const tileId = linkMenu.value.tileId;
  if (!tileId) return;
  const checked = (e.target as HTMLInputElement).checked;
  tileStore.updateProps(tileId, { disableLinkPopup: checked });
}

// 嵌套画布按钮
const nestButton = ref<{ visible: boolean; tileId: string | null }>({
  visible: false,
  tileId: null
});
function enterNestFromButton() {
  const tile = nestButton.value.tileId ? tileStore.tiles.get(nestButton.value.tileId) : null;
  if (tile?.nestHuabuId) huabuStore.openNestedHuabu(tile.nestHuabuId);
  nestButton.value.visible = false;
}

function onTileDblClick(tileId: string) {
  const tile = tileStore.tiles.get(tileId);
  if (!tile) return;
  // 如果有嵌套画布且设置为双击打开，则打开嵌套画布
  if (tile.nestHuabuId && tile.props.nestOpenMode === 'dbclick') {
    huabuStore.openNestedHuabu(tile.nestHuabuId);
  } else {
    // 否则进入标题编辑模式
    startEditingTitle(tileId);
  }
}

const editingTitleId = ref<string | null>(null);
const editingTitleValue = ref('');

function startEditingTitle(tileId: string) {
  const tile = tileStore.tiles.get(tileId);
  if (!tile || tile.props.lock || !tile.props.showTitle) return;
  editingTitleId.value = tileId;
  editingTitleValue.value = tile.title;
}

function commitTitleEdit(tileId: string) {
  if (editingTitleValue.value !== undefined) {
    tileStore.updateTitle(tileId, editingTitleValue.value);
  }
  editingTitleId.value = null;
}

function onBoardClick(e: MouseEvent) {
  if ((e.target as HTMLElement).classList.contains('huabu-board')) {
    tileStore.focusTile(null);
    tileStore.clearSelection();
    lineStore.focusLine(null);
  }
  closeLineMenu();
  closeTileMenu();
  closeBoardMenu();
}

// 连线右键菜单
const lineMenu = ref<{ visible: boolean; x: number; y: number; lineId: string | null }>({
  visible: false,
  x: 0,
  y: 0,
  lineId: null
});

function onLineContextMenu(e: MouseEvent, lineId: string) {
  e.preventDefault();
  e.stopPropagation();
  lineStore.focusLine(lineId);
  lineMenu.value = { visible: true, x: e.clientX, y: e.clientY, lineId };
}

function closeLineMenu() {
  lineMenu.value.visible = false;
}

// 磁贴右键菜单
const tileMenu = ref<{ visible: boolean; x: number; y: number; tileId: string | null }>({
  visible: false,
  x: 0,
  y: 0,
  tileId: null
});

function onTileContextMenu(e: MouseEvent, tileId: string) {
  e.preventDefault();
  e.stopPropagation();
  tileStore.focusTile(tileId);
  tileMenu.value = { visible: true, x: e.clientX, y: e.clientY, tileId };
}

function closeTileMenu() {
  tileMenu.value.visible = false;
}

// 画布右键菜单
const boardMenu = ref<{ visible: boolean; x: number; y: number }>({
  visible: false,
  x: 0,
  y: 0
});

function onBoardContextMenu(e: MouseEvent) {
  if ((e.target as HTMLElement).classList.contains('huabu-board')) {
    e.preventDefault();
    boardMenu.value = { visible: true, x: e.clientX, y: e.clientY };
  }
}

function closeBoardMenu() {
  boardMenu.value.visible = false;
}
</script>

<template>
  <div
    class="huabu-board-wrapper"
    @pointermove="onWrapperPointerMove"
    @pointerup="onWrapperPointerUp"
    @pointerdown="pan.onPointerDown"
    @wheel.prevent="pan.onWheel"
    @click="onBoardClick"
    @contextmenu="onBoardContextMenu"
  >
    <div v-if="currentHuabu" class="huabu-board" :style="boardStyle">
      <!-- 连线层（在磁贴下方） -->
      <svg class="line-layer" :width="currentHuabu.style.width" :height="currentHuabu.style.height">
        <defs>
          <marker
            v-for="line in currentLines"
            :id="`arrow-end-${line.id}`"
            :key="`arrow-end-${line.id}`"
            markerWidth="10"
            markerHeight="10"
            refX="8"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L9,3 z" :fill="line.style.color" />
          </marker>
          <marker
            v-for="line in currentLines"
            :id="`arrow-start-${line.id}`"
            :key="`arrow-start-${line.id}`"
            markerWidth="10"
            markerHeight="10"
            refX="0"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M9,0 L9,6 L0,3 z" :fill="line.style.color" />
          </marker>
        </defs>
        <g
          v-for="line in currentLines"
          :key="line.id"
          class="line-group"
          :class="{ focusing: line.id === lineStore.focusedLineId }"
          @click="lineStore.focusLine(line.id)"
          @dblclick="onLineDblClick($event, line.id)"
          @contextmenu="onLineContextMenu($event, line.id)"
        >
          <path
            :d="getLinePath(line.id)"
            :stroke="line.style.color"
            :stroke-width="line.style.width"
            :stroke-dasharray="getStrokeDasharray(line.style.style)"
            :marker-end="line.style.endArrow !== 'none' ? `url(#arrow-end-${line.id})` : undefined"
            :marker-start="
              line.style.startArrow !== 'none' ? `url(#arrow-start-${line.id})` : undefined
            "
            fill="none"
            class="line-path"
          />
          <!-- 连线文本 -->
          <foreignObject
            v-if="line.text || editingLineTextId === line.id"
            :x="getLineMidPoint(line.id).x - 40"
            :y="getLineMidPoint(line.id).y - 12"
            width="80"
            height="24"
          >
            <input
              v-if="editingLineTextId === line.id"
              v-model="editingLineTextValue"
              xmlns="http://www.w3.org/1999/xhtml"
              class="line-text-input"
              @blur="commitLineTextEdit(line.id)"
              @keydown.enter="commitLineTextEdit(line.id)"
              @keydown.esc="editingLineTextId = null"
            />
            <span v-else xmlns="http://www.w3.org/1999/xhtml" class="line-text-label">{{
              line.text
            }}</span>
          </foreignObject>
        </g>
      </svg>

      <!-- 磁贴层 -->
      <!-- 组合体 -->
      <div
        v-for="composite in currentComposites"
        :key="composite.id"
        class="composite"
        :class="{ focusing: composite.id === compositeStore.focusedCompositeId }"
        :style="{
          left: `${composite.style.left}px`,
          top: `${composite.style.top}px`,
          width: `${composite.style.width}px`,
          height: `${composite.style.height}px`,
          zIndex: composite.style.zIndex
        }"
        @pointerdown="compositeDrag.onPointerDown($event, composite.id)"
      >
        <!-- 组合体内的磁贴 -->
        <div
          v-for="tileId in composite.tileIds"
          :key="tileId"
          class="tile component"
          :style="{
            left: composite.tileRelPositions[tileId]?.left || '0%',
            top: composite.tileRelPositions[tileId]?.top || '0%',
            width: composite.tileRelPositions[tileId]?.width || '100%',
            height: composite.tileRelPositions[tileId]?.height || '100%',
            zIndex: tileStore.tiles.get(tileId)?.style.zIndex || 1,
            backgroundColor: tileStore.tiles.get(tileId)?.style.backgroundColor,
            transform: `rotate(${tileStore.tiles.get(tileId)?.style.angle || 0}deg)`,
            fontSize: `${tileStore.tiles.get(tileId)?.style.fontSize || 14}px`
          }"
        >
          <div v-if="tileStore.tiles.get(tileId)?.props.showTitle" class="tile_title">
            {{ tileStore.tiles.get(tileId)?.title }}
          </div>
        </div>
      </div>

      <!-- 独立磁贴（不在组合体中） -->
      <div
        v-for="tile in standaloneTiles"
        :key="tile.id"
        class="tile"
        :class="{
          focusing: tile.id === tileStore.focusedTileId,
          selected: tileStore.selectedTileIds.has(tile.id),
          line_connect_start: lineStore.connectMode && lineStore.connectStartTileId === tile.id,
          line_connect_end:
            lineStore.connectMode &&
            lineStore.connectStartTileId !== null &&
            lineStore.connectStartTileId !== tile.id
        }"
        :style="{
          left: `${tile.style.left}px`,
          top: `${tile.style.top}px`,
          width: `${tile.style.width}px`,
          height: `${tile.style.height}px`,
          zIndex: tile.style.zIndex,
          backgroundColor: tile.style.backgroundColor,
          transform: `rotate(${tile.style.angle}deg)`,
          fontSize: `${tile.style.fontSize}px`,
          borderStyle: tile.style.borderStyle,
          borderWidth: `${tile.style.borderWidth}px`,
          borderColor: tile.style.borderColor,
          borderRadius: `${tile.style.borderRadius}px`,
          backgroundImage:
            tile.style.backgroundGradient && tile.style.gradientColor
              ? `${tile.style.gradientDirection === 'radial' ? 'radial-gradient' : `linear-gradient(to ${tile.style.gradientDirection})`}(${tile.style.backgroundColor}, ${tile.style.gradientColor})`
              : tile.style.backgroundImage
                ? `url(${tile.style.backgroundImage})`
                : undefined,
          backgroundSize:
            tile.style.backgroundImageSet === 'stretch'
              ? '100% 100%'
              : tile.style.backgroundImageSet === 'repeat'
                ? 'auto'
                : 'contain',
          backgroundRepeat: tile.style.backgroundImageSet === 'repeat' ? 'repeat' : 'no-repeat',
          backgroundPosition: 'center'
        }"
        @pointerdown="onTilePointerDown($event, tile.id)"
        @dblclick="onTileDblClick(tile.id)"
        @contextmenu="onTileContextMenu($event, tile.id)"
        @mouseenter="hoveredTileId = tile.id"
        @mouseleave="hoveredTileId = null"
      >
        <!-- 标题 -->
        <div
          v-if="tile.props.showTitle"
          class="tile_title"
          :style="{
            color: tile.style.titleColor,
            textAlign: tile.style.titleAlign,
            fontFamily: tile.style.fontFamily,
            fontWeight: tile.style.fontBold ? 'bold' : 'normal',
            fontStyle: tile.style.fontItalic ? 'italic' : 'normal',
            writingMode: tile.style.fontVertical ? 'vertical-rl' : undefined,
            textDecoration:
              [
                tile.style.fontOverline ? 'overline' : '',
                tile.style.fontStrikeline ? 'line-through' : '',
                tile.style.fontUnderline ? 'underline' : ''
              ]
                .filter(Boolean)
                .join(' ') || undefined,
            textShadow: tile.style.shadowEnabled
              ? `${tile.style.shadowX}px ${tile.style.shadowY}px ${tile.style.shadowBlur}px ${tile.style.shadowColor}`
              : undefined,
            whiteSpace: tile.props.wrapTitle ? 'normal' : 'nowrap',
            transform: `translate(${tile.style.titleHorizontal}, ${tile.style.titleVertical})`
          }"
        >
          <template v-if="editingTitleId === tile.id">
            <input
              v-model="editingTitleValue"
              class="title_edit_input"
              autofocus
              @blur="commitTitleEdit(tile.id)"
              @keydown.enter="commitTitleEdit(tile.id)"
              @keydown.esc="editingTitleId = null"
              @pointerdown.stop
            />
          </template>
          <template v-else>{{ tile.title }}</template>
        </div>

        <!-- 缩放手柄（聚焦时显示） -->
        <template v-if="tile.id === tileStore.focusedTileId && !tile.props.lock">
          <div class="resize-handle n" @pointerdown="resize.onPointerDown($event, tile.id, 'n')" />
          <div class="resize-handle s" @pointerdown="resize.onPointerDown($event, tile.id, 's')" />
          <div class="resize-handle e" @pointerdown="resize.onPointerDown($event, tile.id, 'e')" />
          <div class="resize-handle w" @pointerdown="resize.onPointerDown($event, tile.id, 'w')" />
          <div
            class="resize-handle ne"
            @pointerdown="resize.onPointerDown($event, tile.id, 'ne')"
          />
          <div
            class="resize-handle nw"
            @pointerdown="resize.onPointerDown($event, tile.id, 'nw')"
          />
          <div
            class="resize-handle se"
            @pointerdown="resize.onPointerDown($event, tile.id, 'se')"
          />
          <div
            class="resize-handle sw"
            @pointerdown="resize.onPointerDown($event, tile.id, 'sw')"
          />
        </template>
      </div>

      <!-- textblock 层 -->
      <template v-for="tile in standaloneTiles" :key="`tb-${tile.id}`">
        <TileTextBlock v-if="shouldShowTextblock(tile.id)" :tile="tile" :scale="currentScale" />
      </template>
    </div>

    <!-- 磁贴右键菜单 -->
    <TileContextMenu
      v-if="tileMenu.visible && tileMenu.tileId"
      :tile-id="tileMenu.tileId"
      :x="tileMenu.x"
      :y="tileMenu.y"
      @close="closeTileMenu"
    />

    <!-- 连线右键菜单 -->
    <LineContextMenu
      v-if="lineMenu.visible && lineMenu.lineId"
      :line-id="lineMenu.lineId"
      :x="lineMenu.x"
      :y="lineMenu.y"
      @close="closeLineMenu"
    />

    <!-- 画布右键菜单 -->
    <HuabuContextMenu
      v-if="boardMenu.visible && currentHuabu"
      :huabu-id="currentHuabu.id"
      :x="boardMenu.x"
      :y="boardMenu.y"
      :paste-x="boardMenu.x"
      :paste-y="boardMenu.y"
      @close="closeBoardMenu"
    />

    <!-- 超链接弹窗 -->
    <div v-if="linkMenu.visible" class="link-menu" @click.stop>
      <div class="link-menu-title">打开链接：</div>
      <div class="link-menu-url">{{ linkMenu.link }}</div>
      <div class="link-menu-actions">
        <button @click="openLink">打开链接</button>
        <button @click="closeLinkMenu">关闭</button>
      </div>
      <div class="link-menu-set">
        <input
          type="checkbox"
          :checked="
            linkMenu.tileId ? tileStore.tiles.get(linkMenu.tileId)?.props.disableLinkPopup : false
          "
          title="仅能从右键菜单打开磁贴链接"
          @change="toggleDisableLinkPopup"
        />
        禁用弹出提示
      </div>
    </div>

    <!-- 嵌套画布进入按钮 -->
    <div v-if="nestButton.visible" class="nest-button" @click.stop="enterNestFromButton">
      进入画布
    </div>
  </div>
</template>

<style lang="scss" scoped>
.huabu-board-wrapper {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  background-color: var(--color-0);
  cursor: default;
}

.huabu-board {
  position: absolute;
  left: 0;
  top: 0;
  transform-origin: 0 0;
}

.line-layer {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: visible;
}

.composite {
  position: absolute;
  cursor: default;
  z-index: 1;
  box-sizing: border-box;

  &.focusing {
    outline: 2px dashed var(--focusing-color);
    outline-offset: 2px;
  }
}

.component {
  position: absolute;
  box-sizing: border-box;
}

.tile {
  position: absolute;
  cursor: default;
  color: black;
  z-index: 1;
  box-sizing: border-box;

  &.focusing {
    outline: 2px dashed var(--focusing-color);
    outline-offset: 2px;
  }

  &.line_connect_start {
    box-shadow: 0px 0px 10px 3px red;
  }

  &.line_connect_end {
    box-shadow: 0px 0px 10px 3px green;
  }
}

.tile_title {
  font-family:
    Microsoft YaHei,
    Arial,
    sans-serif;
  position: absolute;
  left: 0;
  top: 0;
  background-color: transparent;
  height: 100%;
  width: 100%;
  display: flex;
  text-align: center;
  justify-content: center;
  align-items: center;
  pointer-events: none;
}

.title_edit_input {
  width: 90%;
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--focusing-color);
  text-align: center;
  font-size: inherit;
  color: inherit;
  outline: none;
  pointer-events: all;
}

// 缩放手柄
.resize-handle {
  position: absolute;
  width: 8px;
  height: 8px;
  background: var(--focusing-color);
  border: 1px solid white;
  box-sizing: border-box;
  z-index: 10;

  &.n {
    top: -4px;
    left: calc(50% - 4px);
    cursor: n-resize;
  }
  &.s {
    bottom: -4px;
    left: calc(50% - 4px);
    cursor: s-resize;
  }
  &.e {
    right: -4px;
    top: calc(50% - 4px);
    cursor: e-resize;
  }
  &.w {
    left: -4px;
    top: calc(50% - 4px);
    cursor: w-resize;
  }
  &.ne {
    top: -4px;
    right: -4px;
    cursor: ne-resize;
  }
  &.nw {
    top: -4px;
    left: -4px;
    cursor: nw-resize;
  }
  &.se {
    bottom: -4px;
    right: -4px;
    cursor: se-resize;
  }
  &.sw {
    bottom: -4px;
    left: -4px;
    cursor: sw-resize;
  }
}

.line-group {
  pointer-events: stroke;
  cursor: pointer;
}

.line-path {
  pointer-events: stroke;
}

.line-text-label {
  display: block;
  text-align: center;
  font-size: 12px;
  background: var(--color-0);
  padding: 2px 4px;
  border-radius: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.line-text-input {
  width: 100%;
  text-align: center;
  font-size: 12px;
  background: var(--color-2);
  border: 1px solid var(--focusing-color);
  padding: 2px 4px;
  border-radius: 3px;
  outline: none;
}

.link-menu {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  background: var(--color-2);
  border: 1px solid var(--border-color);
  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.2);
  padding: 12px;
  border-radius: 4px;
  min-width: 300px;
  max-width: 500px;
}

.link-menu-title {
  font-size: 13px;
  font-weight: bold;
  margin-bottom: 4px;
}

.link-menu-url {
  font-size: 13px;
  color: var(--color-6);
  margin-bottom: 8px;
  word-break: break-all;
}

.link-menu-actions {
  display: flex;
  gap: 8px;

  button {
    flex: 1;
    padding: 6px 12px;
    background: var(--color-1);
    border: 1px solid var(--border-color);
    cursor: pointer;
    font-size: 13px;
    border-radius: 3px;

    &:hover {
      background: var(--color-3);
    }
  }
}

.link-menu-set {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  font-size: 12px;
  color: var(--color-4);
}

.nest-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  background: var(--focusing-color);
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3);

  &:hover {
    opacity: 0.9;
  }
}
</style>
