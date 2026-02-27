import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Composite, CompositeStyle, TileRelativePosition } from '../types';
import { useTileStore } from './tileStore';
import { useLineStore } from './lineStore';
import { useHuabuStore } from './huabuStore';

function createId(): string {
  return `composite_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export const useCompositeStore = defineStore('composite', () => {
  const composites = ref<Map<string, Composite>>(new Map());
  const focusedCompositeId = ref<string | null>(null);

  const focusedComposite = computed(() =>
    focusedCompositeId.value ? (composites.value.get(focusedCompositeId.value) ?? null) : null
  );

  // 创建临时组合体（从选中的磁贴和连线）
  function createTempComposite(
    huabuId: string,
    tileIds: string[],
    lineIds: string[]
  ): Composite | null {
    if (tileIds.length === 0) return null;
    if (tileIds.length === 1 && lineIds.length === 0) return null;

    const tileStore = useTileStore();
    const lineStore = useLineStore();
    const huabuStore = useHuabuStore();

    // 过滤出两端都在 tileIds 中的连线
    const validLineIds = lineIds.filter((lineId) => {
      const line = lineStore.lines.get(lineId);
      if (!line) return false;
      return tileIds.includes(line.startTileId) && tileIds.includes(line.endTileId);
    });

    // 计算组合体的边界框
    let minLeft = Number.MAX_SAFE_INTEGER;
    let minTop = Number.MAX_SAFE_INTEGER;
    let maxRight = Number.MIN_SAFE_INTEGER;
    let maxBottom = Number.MIN_SAFE_INTEGER;

    for (const tileId of tileIds) {
      const tile = tileStore.tiles.get(tileId);
      if (!tile) continue;
      const left = tile.style.left;
      const top = tile.style.top;
      const right = left + tile.style.width;
      const bottom = top + tile.style.height;
      minLeft = Math.min(minLeft, left);
      minTop = Math.min(minTop, top);
      maxRight = Math.max(maxRight, right);
      maxBottom = Math.max(maxBottom, bottom);
    }

    // 为连线预留空间（连线可能超出磁贴边界）
    for (const lineId of validLineIds) {
      const line = lineStore.lines.get(lineId);
      if (!line) continue;
      const startTile = tileStore.tiles.get(line.startTileId);
      const endTile = tileStore.tiles.get(line.endTileId);
      if (!startTile || !endTile) continue;
      // 简单处理：扩展边界框以包含连线端点
      const startX = startTile.style.left + startTile.style.width / 2;
      const startY = startTile.style.top + startTile.style.height / 2;
      const endX = endTile.style.left + endTile.style.width / 2;
      const endY = endTile.style.top + endTile.style.height / 2;
      minLeft = Math.min(minLeft, startX - 20, endX - 20);
      minTop = Math.min(minTop, startY - 20, endY - 20);
      maxRight = Math.max(maxRight, startX + 20, endX + 20);
      maxBottom = Math.max(maxBottom, startY + 20, endY + 20);
    }

    const width = maxRight - minLeft;
    const height = maxBottom - minTop;

    // 计算每个磁贴相对于组合体的位置（百分比）
    const tileRelPositions: Record<string, TileRelativePosition> = {};
    for (const tileId of tileIds) {
      const tile = tileStore.tiles.get(tileId);
      if (!tile) continue;
      const relLeft = (((tile.style.left - minLeft) / width) * 100).toFixed(2) + '%';
      const relTop = (((tile.style.top - minTop) / height) * 100).toFixed(2) + '%';
      const relWidth = ((tile.style.width / width) * 100).toFixed(2) + '%';
      const relHeight = ((tile.style.height / height) * 100).toFixed(2) + '%';
      tileRelPositions[tileId] = { left: relLeft, top: relTop, width: relWidth, height: relHeight };
    }

    const id = createId();
    const composite: Composite = {
      id,
      style: {
        left: minLeft,
        top: minTop,
        width,
        height,
        zIndex: 1
      },
      tileIds,
      lineIds: validLineIds,
      tileRelPositions,
      isTemp: true
    };

    composites.value.set(id, composite);

    // 将组合体添加到画布
    huabuStore.addCompositeId(huabuId, id);

    // 从画布中移除这些磁贴和连线（它们现在属于组合体）
    for (const tileId of tileIds) {
      huabuStore.removeTileId(huabuId, tileId);
    }
    for (const lineId of validLineIds) {
      huabuStore.removeLineId(huabuId, lineId);
    }

    return composite;
  }

  // 固定组合体（取消临时状态）
  function staticComposite(id: string): void {
    const composite = composites.value.get(id);
    if (composite) composite.isTemp = false;
  }

  // 取消固定（变为临时）
  function unstaticComposite(id: string): void {
    const composite = composites.value.get(id);
    if (composite) composite.isTemp = true;
  }

  // 摧毁组合体（将磁贴和连线返回画布）
  function destroyComposite(id: string, huabuId?: string): void {
    const composite = composites.value.get(id);
    if (!composite) return;

    const tileStore = useTileStore();
    const huabuStore = useHuabuStore();

    // 如果没有提供 huabuId，尝试从当前活动画布中找到
    if (!huabuId) {
      for (const [hId, huabu] of huabuStore.huabus.entries()) {
        if (huabu.compositeIds.includes(id)) {
          huabuId = hId;
          break;
        }
      }
    }

    if (!huabuId) {
      console.warn('Cannot destroy composite: huabuId not found');
      return;
    }

    // 将磁贴位置从相对位置转换回绝对位置
    for (const tileId of composite.tileIds) {
      const tile = tileStore.tiles.get(tileId);
      if (!tile) continue;
      const relPos = composite.tileRelPositions[tileId];
      if (!relPos) continue;

      // 从百分比转换回像素
      const left = composite.style.left + (parseFloat(relPos.left) / 100) * composite.style.width;
      const top = composite.style.top + (parseFloat(relPos.top) / 100) * composite.style.height;
      const width = (parseFloat(relPos.width) / 100) * composite.style.width;
      const height = (parseFloat(relPos.height) / 100) * composite.style.height;

      tileStore.updateStyle(tileId, { left, top, width, height }, false);
    }

    // 将磁贴和连线返回画布
    for (const tileId of composite.tileIds) {
      huabuStore.addTileId(huabuId, tileId);
    }
    for (const lineId of composite.lineIds) {
      huabuStore.addLineId(huabuId, lineId);
    }

    // 从画布中移除组合体
    huabuStore.removeCompositeId(huabuId, id);

    composites.value.delete(id);
    if (focusedCompositeId.value === id) focusedCompositeId.value = null;
  }

  // 删除组合体（包括其中的所有磁贴和连线）
  function deleteComposite(id: string, huabuId: string): void {
    const composite = composites.value.get(id);
    if (!composite) return;

    const tileStore = useTileStore();
    const lineStore = useLineStore();
    const huabuStore = useHuabuStore();

    // 删除所有磁贴
    for (const tileId of composite.tileIds) {
      huabuStore.removeTileId(huabuId, tileId);
      tileStore.deleteTile(tileId);
    }

    // 删除所有连线
    for (const lineId of composite.lineIds) {
      huabuStore.removeLineId(huabuId, lineId);
      lineStore.deleteLine(lineId);
    }

    composites.value.delete(id);
    if (focusedCompositeId.value === id) focusedCompositeId.value = null;
  }

  // 更新组合体样式
  function updateStyle(id: string, style: Partial<CompositeStyle>): void {
    const composite = composites.value.get(id);
    if (composite) Object.assign(composite.style, style);
  }

  // 移动组合体
  function moveComposite(id: string, left: number, top: number): void {
    const composite = composites.value.get(id);
    if (composite) {
      composite.style.left = left;
      composite.style.top = top;
    }
  }

  // 缩放组合体
  function resizeComposite(id: string, width: number, height: number): void {
    const composite = composites.value.get(id);
    if (composite) {
      composite.style.width = Math.max(50, width);
      composite.style.height = Math.max(50, height);
    }
  }

  // 聚焦组合体
  function focusComposite(id: string | null): void {
    // 如果之前聚焦的是临时组合体，销毁它
    if (focusedCompositeId.value) {
      const prevComposite = composites.value.get(focusedCompositeId.value);
      if (prevComposite?.isTemp) {
        destroyComposite(focusedCompositeId.value);
      }
    }
    focusedCompositeId.value = id;
  }

  // 改变组合体颜色（改变其中所有磁贴和连线的颜色）
  function colorComposite(id: string, color: string): void {
    const composite = composites.value.get(id);
    if (!composite) return;

    const tileStore = useTileStore();
    const lineStore = useLineStore();

    for (const tileId of composite.tileIds) {
      tileStore.updateStyle(tileId, { backgroundColor: color });
    }

    for (const lineId of composite.lineIds) {
      lineStore.updateStyle(lineId, { color });
    }
  }

  return {
    composites,
    focusedCompositeId,
    focusedComposite,
    createTempComposite,
    staticComposite,
    unstaticComposite,
    destroyComposite,
    deleteComposite,
    updateStyle,
    moveComposite,
    resizeComposite,
    focusComposite,
    colorComposite
  };
});
