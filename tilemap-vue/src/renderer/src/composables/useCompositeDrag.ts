import { useCompositeStore } from '../stores/compositeStore';

interface CompositeDragOptions {
  huabuScale: () => number;
}

export function useCompositeDrag(options: CompositeDragOptions) {
  const compositeStore = useCompositeStore();

  let draggingId: string | null = null;
  let startPointerX = 0;
  let startPointerY = 0;
  let startLeft = 0;
  let startTop = 0;

  function onPointerDown(e: PointerEvent, compositeId: string) {
    if (e.button !== 0) return;
    const composite = compositeStore.composites.get(compositeId);
    if (!composite) return;

    draggingId = compositeId;
    startPointerX = e.clientX;
    startPointerY = e.clientY;
    startLeft = composite.style.left;
    startTop = composite.style.top;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: PointerEvent) {
    if (!draggingId) return;
    const scale = options.huabuScale();
    const dx = (e.clientX - startPointerX) / scale;
    const dy = (e.clientY - startPointerY) / scale;
    compositeStore.moveComposite(draggingId, startLeft + dx, startTop + dy);
  }

  function onPointerUp() {
    draggingId = null;
  }

  return { onPointerDown, onPointerMove, onPointerUp };
}
