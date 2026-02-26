import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Tile, TileStyle, TileProps } from '../types';
import type { JSONContent } from '@tiptap/vue-3';

function createId(): string {
  return `tile_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function defaultStyle(): TileStyle {
  return {
    left: 100,
    top: 100,
    width: 200,
    height: 120,
    zIndex: 1,
    angle: 0,
    backgroundColor: '#ffffff',
    backgroundImage: null,
    backgroundImageSet: 'place',
    backgroundGradient: false,
    gradientDirection: null,
    gradientColor: null,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 0,
    fontSize: 14,
    titleColor: '#000000',
    titleAlign: 'center',
    titleHorizontal: '0%',
    titleVertical: '0%',
    fontFamily: 'Arial',
    fontBold: false,
    fontItalic: false,
    fontVertical: false,
    fontOverline: false,
    fontStrikeline: false,
    fontUnderline: false,
    shadowEnabled: false,
    shadowColor: '#A3A3A3',
    shadowX: 2,
    shadowY: 2,
    shadowBlur: 2
  };
}

function defaultProps(): TileProps {
  return {
    lock: false,
    showTitle: true,
    wrapTitle: false,
    contentPanelPinned: false,
    nestOpenMode: 'dbclick',
    sizeLimit: false,
    annotationEnabled: false,
    annotation: '',
    textblockShowState: 'normal',
    textblockBind: true,
    textblockWidth: 200,
    textblockHeight: 150,
    textblockVertical: 'center',
    textblockHorizontal: 'right',
    disableLinkPopup: false
  };
}

export const useTileStore = defineStore('tile', () => {
  const tiles = ref<Map<string, Tile>>(new Map());
  const focusedTileId = ref<string | null>(null);
  const selectedTileIds = ref<Set<string>>(new Set());

  // --- Getters ---

  const focusedTile = computed(() =>
    focusedTileId.value ? (tiles.value.get(focusedTileId.value) ?? null) : null
  );

  const selectedTiles = computed(() =>
    Array.from(selectedTileIds.value)
      .map((id) => tiles.value.get(id)!)
      .filter(Boolean)
  );

  // --- Actions ---

  function createTile(_huabuId: string, options?: Partial<Tile>): Tile {
    const id = createId();
    const tile: Tile = {
      id,
      title: '新磁贴',
      content: null,
      style: defaultStyle(),
      props: defaultProps(),
      lineIds: [],
      nestHuabuId: null,
      link: null,
      ...options
    };
    tiles.value.set(id, tile);
    return tile;
  }

  function deleteTile(id: string): void {
    tiles.value.delete(id);
    selectedTileIds.value.delete(id);
    if (focusedTileId.value === id) focusedTileId.value = null;
  }

  function updateTitle(id: string, title: string): void {
    const tile = tiles.value.get(id);
    if (tile) tile.title = title;
  }

  function updateContent(id: string, content: JSONContent | null): void {
    const tile = tiles.value.get(id);
    if (tile) tile.content = content;
  }

  function updateStyle(id: string, style: Partial<TileStyle>): void {
    const tile = tiles.value.get(id);
    if (tile) Object.assign(tile.style, style);
  }

  function updateProps(id: string, props: Partial<TileProps>): void {
    const tile = tiles.value.get(id);
    if (tile) Object.assign(tile.props, props);
  }

  function moveTile(id: string, left: number, top: number): void {
    const tile = tiles.value.get(id);
    if (tile && !tile.props.lock) {
      tile.style.left = left;
      tile.style.top = top;
    }
  }

  function resizeTile(id: string, width: number, height: number): void {
    const tile = tiles.value.get(id);
    if (tile && !tile.props.lock) {
      const minSize = typeof tile.props.sizeLimit === 'number' ? tile.props.sizeLimit : 50;
      tile.style.width = Math.max(minSize, width);
      tile.style.height = Math.max(minSize, height);
    }
  }

  function focusTile(id: string | null): void {
    focusedTileId.value = id;
  }

  function selectTile(id: string): void {
    selectedTileIds.value.add(id);
  }

  function deselectTile(id: string): void {
    selectedTileIds.value.delete(id);
  }

  function clearSelection(): void {
    selectedTileIds.value.clear();
  }

  function toggleLock(id: string): void {
    const tile = tiles.value.get(id);
    if (tile) tile.props.lock = !tile.props.lock;
  }

  function setNestHuabu(id: string, huabuId: string | null): void {
    const tile = tiles.value.get(id);
    if (tile) tile.nestHuabuId = huabuId;
  }

  function setLink(id: string, link: string | null): void {
    const tile = tiles.value.get(id);
    if (tile) tile.link = link;
  }

  function addLineId(tileId: string, lineId: string): void {
    tiles.value.get(tileId)?.lineIds.push(lineId);
  }

  function removeLineId(tileId: string, lineId: string): void {
    const tile = tiles.value.get(tileId);
    if (tile) tile.lineIds = tile.lineIds.filter((id) => id !== lineId);
  }

  return {
    tiles,
    focusedTileId,
    selectedTileIds,
    focusedTile,
    selectedTiles,
    createTile,
    deleteTile,
    updateTitle,
    updateContent,
    updateStyle,
    updateProps,
    moveTile,
    resizeTile,
    focusTile,
    selectTile,
    deselectTile,
    clearSelection,
    toggleLock,
    setNestHuabu,
    setLink,
    addLineId,
    removeLineId
  };
});
