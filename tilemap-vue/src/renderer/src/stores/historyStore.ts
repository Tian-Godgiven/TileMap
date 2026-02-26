import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Tile, Line } from '../types';

export type HistoryEntry =
  | {
      type: 'tile-move';
      tileId: string;
      before: { left: number; top: number };
      after: { left: number; top: number };
    }
  | {
      type: 'tile-resize';
      tileId: string;
      before: { width: number; height: number; left: number; top: number };
      after: { width: number; height: number; left: number; top: number };
    }
  | {
      type: 'tile-style';
      tileId: string;
      before: Partial<Tile['style']>;
      after: Partial<Tile['style']>;
    }
  | { type: 'tile-create'; tileId: string; huabuId: string; snapshot: Tile }
  | { type: 'tile-delete'; tileId: string; huabuId: string; snapshot: Tile }
  | { type: 'line-create'; lineId: string; huabuId: string; snapshot: Line }
  | { type: 'line-delete'; lineId: string; huabuId: string; snapshot: Line };

const MAX_HISTORY = 50;

export const useHistoryStore = defineStore('history', () => {
  const undoStack = ref<HistoryEntry[]>([]);
  const redoStack = ref<HistoryEntry[]>([]);

  const canUndo = computed(() => undoStack.value.length > 0);
  const canRedo = computed(() => redoStack.value.length > 0);

  function push(entry: HistoryEntry): void {
    undoStack.value.push(entry);
    if (undoStack.value.length > MAX_HISTORY) undoStack.value.shift();
    redoStack.value = [];
  }

  function applyEntry(entry: HistoryEntry, direction: 'undo' | 'redo'): void {
    // lazy import to avoid circular deps
    const { useTileStore } = require('./tileStore');
    const { useHuabuStore } = require('./huabuStore');
    const { useLineStore } = require('./lineStore');
    const tileStore = useTileStore();
    const huabuStore = useHuabuStore();
    const lineStore = useLineStore();

    if (entry.type === 'tile-move') {
      const pos = direction === 'undo' ? entry.before : entry.after;
      tileStore.moveTile(entry.tileId, pos.left, pos.top);
    } else if (entry.type === 'tile-resize') {
      const s = direction === 'undo' ? entry.before : entry.after;
      tileStore.updateStyle(entry.tileId, {
        left: s.left,
        top: s.top,
        width: s.width,
        height: s.height
      });
    } else if (entry.type === 'tile-style') {
      const style = direction === 'undo' ? entry.before : entry.after;
      tileStore.updateStyle(entry.tileId, style);
    } else if (entry.type === 'tile-create') {
      if (direction === 'undo') {
        huabuStore.removeTileId(entry.huabuId, entry.tileId);
        tileStore.deleteTile(entry.tileId);
      } else {
        tileStore.tiles.set(entry.tileId, { ...entry.snapshot });
        huabuStore.addTileId(entry.huabuId, entry.tileId);
      }
    } else if (entry.type === 'tile-delete') {
      if (direction === 'undo') {
        tileStore.tiles.set(entry.tileId, { ...entry.snapshot });
        huabuStore.addTileId(entry.huabuId, entry.tileId);
      } else {
        huabuStore.removeTileId(entry.huabuId, entry.tileId);
        tileStore.deleteTile(entry.tileId);
      }
    } else if (entry.type === 'line-create') {
      if (direction === 'undo') {
        huabuStore.removeLineId(entry.huabuId, entry.lineId);
        lineStore.deleteLine(entry.lineId);
      } else {
        lineStore.lines.set(entry.lineId, { ...entry.snapshot });
        huabuStore.addLineId(entry.huabuId, entry.lineId);
      }
    } else if (entry.type === 'line-delete') {
      if (direction === 'undo') {
        lineStore.lines.set(entry.lineId, { ...entry.snapshot });
        huabuStore.addLineId(entry.huabuId, entry.lineId);
      } else {
        huabuStore.removeLineId(entry.huabuId, entry.lineId);
        lineStore.deleteLine(entry.lineId);
      }
    }
  }

  function undo(): void {
    const entry = undoStack.value.pop();
    if (!entry) return;
    applyEntry(entry, 'undo');
    redoStack.value.push(entry);
  }

  function redo(): void {
    const entry = redoStack.value.pop();
    if (!entry) return;
    applyEntry(entry, 'redo');
    undoStack.value.push(entry);
  }

  function clear(): void {
    undoStack.value = [];
    redoStack.value = [];
  }

  return { undoStack, redoStack, canUndo, canRedo, push, undo, redo, clear };
});
