import { onUnmounted } from 'vue';
import { useTileStore } from '../stores/tileStore';

interface ResizeOptions {
  huabuScale: () => number;
  onStart?: () => void;
  onEnd?: () => void;
}

type ResizeHandle = 'se' | 'sw' | 'ne' | 'nw' | 'n' | 's' | 'e' | 'w';

export function useResize(options: ResizeOptions) {
  const tileStore = useTileStore();

  let resizingId: string | null = null;
  let handle: ResizeHandle = 'se';
  let startPointerX = 0;
  let startPointerY = 0;
  let startLeft = 0;
  let startTop = 0;
  let startWidth = 0;
  let startHeight = 0;

  function onPointerDown(e: PointerEvent, tileId: string, h: ResizeHandle) {
    if (e.button !== 0) return;
    const tile = tileStore.tiles.get(tileId);
    if (!tile || tile.props.lock) return;

    e.stopPropagation();
    resizingId = tileId;
    handle = h;
    startPointerX = e.clientX;
    startPointerY = e.clientY;
    startLeft = tile.style.left;
    startTop = tile.style.top;
    startWidth = tile.style.width;
    startHeight = tile.style.height;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    options.onStart?.();
  }

  function onPointerMove(e: PointerEvent) {
    if (!resizingId) return;
    const scale = options.huabuScale();
    const dx = (e.clientX - startPointerX) / scale;
    const dy = (e.clientY - startPointerY) / scale;

    let newLeft = startLeft;
    let newTop = startTop;
    let newWidth = startWidth;
    let newHeight = startHeight;

    if (handle.includes('e')) newWidth = startWidth + dx;
    if (handle.includes('s')) newHeight = startHeight + dy;
    if (handle.includes('w')) {
      newWidth = startWidth - dx;
      newLeft = startLeft + dx;
    }
    if (handle.includes('n')) {
      newHeight = startHeight - dy;
      newTop = startTop + dy;
    }

    const minSize = 50;
    if (newWidth < minSize) {
      if (handle.includes('w')) newLeft = startLeft + startWidth - minSize;
      newWidth = minSize;
    }
    if (newHeight < minSize) {
      if (handle.includes('n')) newTop = startTop + startHeight - minSize;
      newHeight = minSize;
    }

    tileStore.moveTile(resizingId, newLeft, newTop);
    tileStore.resizeTile(resizingId, newWidth, newHeight);
  }

  function onPointerUp() {
    if (!resizingId) return;
    resizingId = null;
    options.onEnd?.();
  }

  onUnmounted(() => {
    resizingId = null;
  });

  return { onPointerDown, onPointerMove, onPointerUp };
}
