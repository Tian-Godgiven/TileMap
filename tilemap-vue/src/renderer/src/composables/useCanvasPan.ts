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
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newScale = Math.max(0.1, Math.min(5, huabu.scale + delta));
    huabuStore.setScale(huabuId, newScale);
  }

  onUnmounted(() => {
    isPanning = false;
  });

  return { onPointerDown, onPointerMove, onPointerUp, onWheel };
}
