import { onUnmounted } from 'vue';
import { useTileStore } from '../stores/tileStore';

interface DragOptions {
  huabuScale: () => number;
  onStart?: () => void;
  onEnd?: () => void;
}

export function useDrag(options: DragOptions) {
  const tileStore = useTileStore();

  let draggingId: string | null = null;
  let startPointerX = 0;
  let startPointerY = 0;
  let startLeft = 0;
  let startTop = 0;

  function onPointerDown(e: PointerEvent, tileId: string) {
    if (e.button !== 0) return;
    const tile = tileStore.tiles.get(tileId);
    if (!tile || tile.props.lock) return;

    draggingId = tileId;
    startPointerX = e.clientX;
    startPointerY = e.clientY;
    startLeft = tile.style.left;
    startTop = tile.style.top;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    options.onStart?.();
  }

  function onPointerMove(e: PointerEvent) {
    if (!draggingId) return;
    const scale = options.huabuScale();
    const dx = (e.clientX - startPointerX) / scale;
    const dy = (e.clientY - startPointerY) / scale;
    tileStore.moveTile(draggingId, startLeft + dx, startTop + dy);
  }

  function onPointerUp(_e: PointerEvent) {
    if (!draggingId) return;
    draggingId = null;
    options.onEnd?.();
  }

  onUnmounted(() => {
    draggingId = null;
  });

  return { onPointerDown, onPointerMove, onPointerUp };
}
