import { onUnmounted } from 'vue';
import { useHuabuStore } from '../stores/huabuStore';

interface CanvasPanOptions {
  huabuId: () => string | null;
}

export function useCanvasPan(options: CanvasPanOptions) {
  const huabuStore = useHuabuStore();

  let isPanning = false;
  let startPointerX = 0;
  let startPointerY = 0;
  let startPanX = 0;
  let startPanY = 0;

  function onPointerDown(e: PointerEvent) {
    // 中键或空格+左键拖拽画布
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      e.preventDefault();
      const huabuId = options.huabuId();
      if (!huabuId) return;

      const huabu = huabuStore.huabus.get(huabuId);
      if (!huabu) return;

      isPanning = true;
      startPointerX = e.clientX;
      startPointerY = e.clientY;
      startPanX = huabu.panX;
      startPanY = huabu.panY;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }
  }

  function onPointerMove(e: PointerEvent) {
    if (!isPanning) return;
    const huabuId = options.huabuId();
    if (!huabuId) return;

    const dx = e.clientX - startPointerX;
    const dy = e.clientY - startPointerY;
    huabuStore.setPan(huabuId, startPanX + dx, startPanY + dy);
  }

  function onPointerUp() {
    isPanning = false;
  }

  function onWheel(e: WheelEvent) {
    const huabuId = options.huabuId();
    if (!huabuId) return;

    const huabu = huabuStore.huabus.get(huabuId);
    if (!huabu) return;

    e.preventDefault();

    // 计算缩放增量
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    const oldScale = huabu.scale;
    const newScale = Math.max(0.1, Math.min(3, oldScale + delta));

    // 以鼠标位置为中心缩放
    const boardEl = (e.currentTarget as HTMLElement).querySelector('.huabu-board') as HTMLElement;
    if (boardEl) {
      const rect = boardEl.getBoundingClientRect();
      // 鼠标在画布容器中的位置
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // 鼠标在画布坐标系中的位置（缩放前）
      const canvasX = (mouseX - huabu.panX) / oldScale;
      const canvasY = (mouseY - huabu.panY) / oldScale;

      // 计算新的 pan 值，使鼠标位置保持不变
      const newPanX = mouseX - canvasX * newScale;
      const newPanY = mouseY - canvasY * newScale;

      huabuStore.setScale(huabuId, newScale);
      huabuStore.setPan(huabuId, newPanX, newPanY);
    } else {
      huabuStore.setScale(huabuId, newScale);
    }
  }

  onUnmounted(() => {
    isPanning = false;
  });

  return { onPointerDown, onPointerMove, onPointerUp, onWheel };
}
