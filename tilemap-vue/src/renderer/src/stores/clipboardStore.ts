import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Tile } from '../types';

export const useClipboardStore = defineStore('clipboard', () => {
  const clipboard = ref<Tile | null>(null);
  const tileStyle = ref<Partial<Tile['style']> | null>(null);
  const pasteOffset = ref({ left: 20, top: 20 });
  const lastPasted = ref<Tile | null>(null);

  function copyTile(tile: Tile): void {
    clipboard.value = JSON.parse(JSON.stringify(tile));
    lastPasted.value = null;
    pasteOffset.value = { left: 20, top: 20 };
  }

  function copyTileStyle(style: Partial<Tile['style']>): void {
    tileStyle.value = JSON.parse(JSON.stringify(style));
  }

  function pasteTile(): Tile | null {
    if (!clipboard.value) return null;

    // 如果连续粘贴同一个对象，增加偏移
    if (lastPasted.value === clipboard.value) {
      pasteOffset.value.left += 20;
      pasteOffset.value.top += 20;
    } else {
      lastPasted.value = clipboard.value;
      pasteOffset.value = { left: 20, top: 20 };
    }

    const newTile = JSON.parse(JSON.stringify(clipboard.value));
    newTile.style.left += pasteOffset.value.left;
    newTile.style.top += pasteOffset.value.top;
    return newTile;
  }

  function pasteTileStyle(): Partial<Tile['style']> | null {
    return tileStyle.value ? JSON.parse(JSON.stringify(tileStyle.value)) : null;
  }

  function hasClipboard(): boolean {
    return clipboard.value !== null;
  }

  function hasTileStyle(): boolean {
    return tileStyle.value !== null;
  }

  function clear(): void {
    clipboard.value = null;
    tileStyle.value = null;
    lastPasted.value = null;
    pasteOffset.value = { left: 20, top: 20 };
  }

  return {
    clipboard,
    tileStyle,
    copyTile,
    copyTileStyle,
    pasteTile,
    pasteTileStyle,
    hasClipboard,
    hasTileStyle,
    clear
  };
});
