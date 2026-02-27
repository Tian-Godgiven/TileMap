import { ref, onUnmounted } from 'vue';
import { useTileStore } from '../stores/tileStore';
import { useCompositeStore } from '../stores/compositeStore';
import { useHuabuStore } from '../stores/huabuStore';

interface LassoSelectOptions {
  huabuScale: () => number;
}

export function useLassoSelect(options: LassoSelectOptions) {
  const tileStore = useTileStore();
  const compositeStore = useCompositeStore();
  const huabuStore = useHuabuStore();

  const isSelecting = ref(false);
  const lassoStart = ref({ x: 0, y: 0 });
  const lassoEnd = ref({ x: 0, y: 0 });
  const selectingTileIds = ref<Set<string>>(new Set());
  const justFinishedLasso = ref(false);

  function onPointerDown(e: PointerEvent) {
    // 只在空白画布区域左键点击时启动套索（不能是中键或 Shift+左键）
    if (e.button !== 0 || e.shiftKey) return;
    const target = e.target as HTMLElement;
    if (!target.classList.contains('huabu-board')) return;

    e.preventDefault();
    e.stopPropagation();

    isSelecting.value = true;
    selectingTileIds.value.clear();

    const boardEl = target as HTMLElement;
    const rect = boardEl.getBoundingClientRect();
    const scale = options.huabuScale();

    lassoStart.value = {
      x: (e.clientX - rect.left) / scale,
      y: (e.clientY - rect.top) / scale
    };
    lassoEnd.value = { ...lassoStart.value };

    // 清除之前的选择和聚焦
    tileStore.clearSelection();
    tileStore.focusTile(null);

    // 销毁之前聚焦的临时组合体
    if (compositeStore.focusedCompositeId) {
      const composite = compositeStore.composites.get(compositeStore.focusedCompositeId);
      if (composite?.isTemp) {
        compositeStore.destroyComposite(compositeStore.focusedCompositeId);
      }
    }
    compositeStore.focusComposite(null);

    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: PointerEvent) {
    if (!isSelecting.value) return;

    const boardEl = document.querySelector('.huabu-board') as HTMLElement;
    if (!boardEl) return;

    const rect = boardEl.getBoundingClientRect();
    const scale = options.huabuScale();

    lassoEnd.value = {
      x: (e.clientX - rect.left) / scale,
      y: (e.clientY - rect.top) / scale
    };

    // 计算套索矩形
    const minX = Math.min(lassoStart.value.x, lassoEnd.value.x);
    const maxX = Math.max(lassoStart.value.x, lassoEnd.value.x);
    const minY = Math.min(lassoStart.value.y, lassoEnd.value.y);
    const maxY = Math.max(lassoStart.value.y, lassoEnd.value.y);

    // 检测哪些磁贴在套索范围内（只检测独立磁贴，不包括组合体中的磁贴）
    const newSelectingIds = new Set<string>();
    const huabuId = huabuStore.activeHuabuId;
    if (!huabuId) return;

    const huabu = huabuStore.huabus.get(huabuId);
    if (!huabu) return;

    // 只检测画布上的独立磁贴
    for (const tileId of huabu.tileIds) {
      const tile = tileStore.tiles.get(tileId);
      if (!tile || tile.props.lock) continue;

      // 排除 textblock 和 component 类型
      if (tile.props.type === 'textblock' || tile.props.type === 'component') continue;

      const tileLeft = tile.style.left;
      const tileRight = tile.style.left + tile.style.width;
      const tileTop = tile.style.top;
      const tileBottom = tile.style.top + tile.style.height;

      // 检测是否有交集（tolerance: "touch"）
      if (tileRight > minX && tileLeft < maxX && tileBottom > minY && tileTop < maxY) {
        newSelectingIds.add(tile.id);
        // 如果这个磁贴是新进入套索的，调用 selecting 逻辑
        if (!selectingTileIds.value.has(tile.id)) {
          tileStore.selectTile(tile.id);
        }
      } else {
        // 如果这个磁贴离开了套索范围，调用 unselecting 逻辑
        if (selectingTileIds.value.has(tile.id)) {
          tileStore.deselectTile(tile.id);
        }
      }
    }

    selectingTileIds.value = newSelectingIds;
  }

  function onPointerUp() {
    if (!isSelecting.value) return;

    isSelecting.value = false;
    justFinishedLasso.value = true;

    // 在下一个事件循环中重置标志，这样 click 事件可以检测到
    setTimeout(() => {
      justFinishedLasso.value = false;
    }, 0);

    const selectedTileIds = Array.from(tileStore.selectedTileIds);
    const huabuId = huabuStore.activeHuabuId;

    selectingTileIds.value.clear();

    if (!huabuId) {
      tileStore.clearSelection();
      return;
    }

    // 如果只选中一个磁贴，直接聚焦它
    if (selectedTileIds.length === 1) {
      tileStore.focusTile(selectedTileIds[0]);
      tileStore.clearSelection();
    }
    // 如果选中多个磁贴，创建临时组合体
    else if (selectedTileIds.length > 1) {
      // 找出这些磁贴相关的连线
      const lineIds: string[] = [];
      for (const tileId of selectedTileIds) {
        const tile = tileStore.tiles.get(tileId);
        if (tile) {
          lineIds.push(...tile.lineIds);
        }
      }

      const composite = compositeStore.createTempComposite(huabuId, selectedTileIds, lineIds);
      if (composite) {
        compositeStore.focusComposite(composite.id);
        tileStore.clearSelection();
      }
    } else {
      // 没有选中任何磁贴，清除选择
      tileStore.clearSelection();
    }
  }

  function getLassoStyle() {
    if (!isSelecting.value) return { display: 'none' };

    const left = Math.min(lassoStart.value.x, lassoEnd.value.x);
    const top = Math.min(lassoStart.value.y, lassoEnd.value.y);
    const width = Math.abs(lassoEnd.value.x - lassoStart.value.x);
    const height = Math.abs(lassoEnd.value.y - lassoStart.value.y);

    return {
      display: 'block',
      position: 'absolute',
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      height: `${height}px`,
      border: '1px dashed var(--focusing-color)',
      backgroundColor: 'rgba(52, 152, 219, 0.1)',
      pointerEvents: 'none',
      zIndex: 9999
    };
  }

  onUnmounted(() => {
    isSelecting.value = false;
  });

  return {
    isSelecting,
    justFinishedLasso,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    getLassoStyle
  };
}
