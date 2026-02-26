import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Line, LineStyleConfig } from '../types';
import { useTileStore } from './tileStore';
import { useHuabuStore } from './huabuStore';

function createId(): string {
  return `line_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function defaultStyle(): LineStyleConfig {
  return {
    type: 'bezier',
    style: 'solid',
    color: '#555555',
    width: 2,
    startArrow: 'none',
    endArrow: 'arrow'
  };
}

export const useLineStore = defineStore('line', () => {
  const lines = ref<Map<string, Line>>(new Map());

  // 连线模式状态
  const connectMode = ref(false);
  const connectStartTileId = ref<string | null>(null);

  // 当前默认连线样式（用于新建连线）
  const defaultLineStyle = ref<LineStyleConfig>(defaultStyle());

  // --- Getters ---

  const focusedLineId = ref<string | null>(null);

  const focusedLine = computed(() =>
    focusedLineId.value ? (lines.value.get(focusedLineId.value) ?? null) : null
  );

  // --- Actions ---

  function createLine(huabuId: string, startTileId: string, endTileId: string): Line {
    const id = createId();
    const line: Line = {
      id,
      startTileId,
      endTileId,
      style: { ...defaultLineStyle.value },
      text: ''
    };
    lines.value.set(id, line);

    // 双向绑定到磁贴
    const tileStore = useTileStore();
    tileStore.addLineId(startTileId, id);
    tileStore.addLineId(endTileId, id);

    // 注册到画布
    const huabuStore = useHuabuStore();
    huabuStore.addLineId(huabuId, id);

    return line;
  }

  function deleteLine(id: string): void {
    const line = lines.value.get(id);
    if (!line) return;

    // 从磁贴中移除引用
    const tileStore = useTileStore();
    tileStore.removeLineId(line.startTileId, id);
    tileStore.removeLineId(line.endTileId, id);

    lines.value.delete(id);
    if (focusedLineId.value === id) focusedLineId.value = null;
  }

  function updateStyle(id: string, style: Partial<LineStyleConfig>): void {
    const line = lines.value.get(id);
    if (line) Object.assign(line.style, style);
  }

  function updateText(id: string, text: string): void {
    const line = lines.value.get(id);
    if (line) line.text = text;
  }

  function focusLine(id: string | null): void {
    focusedLineId.value = id;
  }

  // 连线模式：开始
  function startConnectMode(): void {
    connectMode.value = true;
    connectStartTileId.value = null;
  }

  // 连线模式：结束
  function endConnectMode(): void {
    connectMode.value = false;
    connectStartTileId.value = null;
  }

  // 连线模式：点击磁贴
  // 返回新建的 Line，或 null（第一次点击只记录起点）
  function handleTileClick(huabuId: string, tileId: string): Line | null {
    if (!connectMode.value) return null;

    if (connectStartTileId.value === null) {
      // 第一次点击：记录起点
      connectStartTileId.value = tileId;
      return null;
    }

    if (connectStartTileId.value === tileId) {
      // 点了同一个磁贴，取消
      connectStartTileId.value = null;
      return null;
    }

    // 第二次点击：创建连线
    const line = createLine(huabuId, connectStartTileId.value, tileId);
    connectStartTileId.value = null;
    return line;
  }

  function setDefaultStyle(style: Partial<LineStyleConfig>): void {
    Object.assign(defaultLineStyle.value, style);
  }

  return {
    lines,
    connectMode,
    connectStartTileId,
    defaultLineStyle,
    focusedLineId,
    focusedLine,
    createLine,
    deleteLine,
    updateStyle,
    updateText,
    focusLine,
    startConnectMode,
    endConnectMode,
    handleTileClick,
    setDefaultStyle
  };
});
