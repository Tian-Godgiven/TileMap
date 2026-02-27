import { defineStore } from 'pinia';
import { ref } from 'vue';

export type ActiveTool = 'select' | 'connect' | 'pan';
export type RightPanelTab = 'design' | 'edit';
export type Theme = 'light' | 'dark';

export interface ContextMenuState {
  type: 'tile' | 'line' | 'huabu';
  targetId: string;
  x: number;
  y: number;
}

export const useUiStore = defineStore('ui', () => {
  const activeTool = ref<ActiveTool>('select');
  const rightPanelTab = ref<RightPanelTab>('design');
  const showRightPanel = ref(true);
  const showLeftPanel = ref(true);
  const showTopAbility = ref(true);
  const contentPanelTileId = ref<string | null>(null);
  const contextMenu = ref<ContextMenuState | null>(null);
  const linkPopupTileId = ref<string | null>(null);
  const searchMenuVisible = ref(false);
  const fileInsertMenuVisible = ref(false);
  const fileExportMenuVisible = ref(false);
  const fileSaveAsMenuVisible = ref(false);
  const collectionEditMenuKey = ref<string | null>(null);
  const theme = ref<Theme>('light');
  const showTextblock = ref(true);

  function setTool(tool: ActiveTool): void {
    activeTool.value = tool;
  }

  function openContentPanel(tileId: string): void {
    contentPanelTileId.value = tileId;
  }

  function closeContentPanel(): void {
    contentPanelTileId.value = null;
  }

  function showContextMenu(state: ContextMenuState): void {
    contextMenu.value = state;
  }

  function hideContextMenu(): void {
    contextMenu.value = null;
  }

  function openLinkPopup(tileId: string): void {
    linkPopupTileId.value = tileId;
  }

  function closeLinkPopup(): void {
    linkPopupTileId.value = null;
  }

  function toggleSearchMenu(): void {
    searchMenuVisible.value = !searchMenuVisible.value;
  }

  function openFileInsertMenu(): void {
    fileInsertMenuVisible.value = true;
  }

  function closeFileInsertMenu(): void {
    fileInsertMenuVisible.value = false;
  }

  function openFileExportMenu(): void {
    fileExportMenuVisible.value = true;
  }

  function closeFileExportMenu(): void {
    fileExportMenuVisible.value = false;
  }

  function openFileSaveAsMenu(): void {
    fileSaveAsMenuVisible.value = true;
  }

  function closeFileSaveAsMenu(): void {
    fileSaveAsMenuVisible.value = false;
  }

  function openCollectionEditMenu(key: string): void {
    collectionEditMenuKey.value = key;
  }

  function closeCollectionEditMenu(): void {
    collectionEditMenuKey.value = null;
  }

  function setTheme(t: Theme): void {
    theme.value = t;
    document.documentElement.setAttribute('data-theme', t);
  }

  function toggleLeftPanel(): void {
    showLeftPanel.value = !showLeftPanel.value;
  }

  function toggleRightPanel(): void {
    showRightPanel.value = !showRightPanel.value;
  }

  function toggleTopAbility(): void {
    showTopAbility.value = !showTopAbility.value;
  }

  function toggleTextblock(): void {
    showTextblock.value = !showTextblock.value;
  }

  return {
    activeTool,
    rightPanelTab,
    showRightPanel,
    showLeftPanel,
    showTopAbility,
    contentPanelTileId,
    contextMenu,
    linkPopupTileId,
    searchMenuVisible,
    fileInsertMenuVisible,
    fileExportMenuVisible,
    fileSaveAsMenuVisible,
    collectionEditMenuKey,
    theme,
    showTextblock,
    setTool,
    openContentPanel,
    closeContentPanel,
    showContextMenu,
    hideContextMenu,
    openLinkPopup,
    closeLinkPopup,
    setTheme,
    toggleLeftPanel,
    toggleRightPanel,
    toggleTopAbility,
    toggleSearchMenu,
    openFileInsertMenu,
    closeFileInsertMenu,
    openFileExportMenu,
    closeFileExportMenu,
    openFileSaveAsMenu,
    closeFileSaveAsMenu,
    openCollectionEditMenu,
    closeCollectionEditMenu,
    toggleTextblock
  };
});
