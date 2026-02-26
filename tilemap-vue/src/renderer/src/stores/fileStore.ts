import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useHuabuStore } from './huabuStore';
import { useTileStore } from './tileStore';
import { useLineStore } from './lineStore';
import { serializeToJson, deserializeFromJson } from '../utils/fileSerializer';

export const useFileStore = defineStore('file', () => {
  const filePath = ref<string | null>(null);
  const fileName = ref<string>('未命名');
  const saved = ref(true);
  const autoSave = ref(false);
  const information = ref<string>('');
  const recentFiles = ref<{ name: string; path: string }[]>([]);

  const modified = computed(() => !saved.value);

  function setFile(path: string): void {
    filePath.value = path;
    fileName.value = path.split(/[\\/]/).pop() ?? path;
    saved.value = true;
    addToRecentFiles(path);
  }

  function addToRecentFiles(path: string): void {
    const name = path.split(/[\\/]/).pop() ?? path;
    recentFiles.value = recentFiles.value.filter((f) => f.path !== path);
    recentFiles.value.unshift({ name, path });
    if (recentFiles.value.length > 10) recentFiles.value = recentFiles.value.slice(0, 10);
    saveRecentFiles();
  }

  function saveRecentFiles(): void {
    try {
      localStorage.setItem('tilemap_recent_files', JSON.stringify(recentFiles.value));
    } catch (e) {
      console.error('保存最近文件失败', e);
    }
  }

  function loadRecentFiles(): void {
    try {
      const data = localStorage.getItem('tilemap_recent_files');
      if (data) recentFiles.value = JSON.parse(data);
    } catch (e) {
      console.error('加载最近文件失败', e);
    }
  }

  function toggleAutoSave(): void {
    autoSave.value = !autoSave.value;
  }

  function markUnsaved(): void {
    saved.value = false;
  }

  function markSaved(): void {
    saved.value = true;
  }

  function clearFile(): void {
    filePath.value = null;
    fileName.value = '未命名';
    saved.value = true;
    information.value = '';
  }

  async function openFile(): Promise<boolean> {
    const api = (window as any).fileAPI;
    if (!api) return false;

    const path = await api.openFileDialog('TileMap File', ['tilemap', 'json']);
    if (!path) return false;

    const content = await api.readFile(path);
    if (!content) return false;

    try {
      const json = JSON.parse(content);
      const data = deserializeFromJson(json);

      const huabuStore = useHuabuStore();
      const tileStore = useTileStore();
      const lineStore = useLineStore();

      huabuStore.huabus = data.huabus;
      huabuStore.huabuOrder = data.huabuOrder;
      tileStore.tiles = data.tiles;
      lineStore.lines = data.lines;

      if (data.huabuOrder.length > 0) {
        huabuStore.switchHuabu(data.huabuOrder[0]);
      }

      information.value = json.tilemap.information || '';
      setFile(path);
      return true;
    } catch (e) {
      console.error('文件解析失败', e);
      return false;
    }
  }

  async function saveFile(): Promise<boolean> {
    const api = (window as any).fileAPI;
    if (!api) return false;
    if (!filePath.value) return saveFileAs();

    const huabuStore = useHuabuStore();
    const tileStore = useTileStore();
    const lineStore = useLineStore();

    const json = serializeToJson(
      huabuStore.huabus,
      huabuStore.huabuOrder,
      tileStore.tiles,
      lineStore.lines,
      information.value
    );

    const success = await api.writeFile(filePath.value, JSON.stringify(json, null, 2));
    if (success) {
      markSaved();
      return true;
    }
    return false;
  }

  async function saveFileAs(): Promise<boolean> {
    const api = (window as any).fileAPI;
    if (!api) return false;

    const path = await api.saveFileDialog('未命名.tilemap', ['tilemap', 'json']);
    if (!path) return false;

    const huabuStore = useHuabuStore();
    const tileStore = useTileStore();
    const lineStore = useLineStore();

    const json = serializeToJson(
      huabuStore.huabus,
      huabuStore.huabuOrder,
      tileStore.tiles,
      lineStore.lines,
      information.value
    );

    const success = await api.writeFile(path, JSON.stringify(json, null, 2));
    if (success) {
      setFile(path);
      return true;
    }
    return false;
  }

  async function openFileByPath(path: string): Promise<boolean> {
    const api = (window as any).fileAPI;
    if (!api) return false;

    const content = await api.readFile(path);
    if (!content) return false;

    try {
      const json = JSON.parse(content);
      const data = deserializeFromJson(json);

      const huabuStore = useHuabuStore();
      const tileStore = useTileStore();
      const lineStore = useLineStore();

      huabuStore.huabus = data.huabus;
      huabuStore.huabuOrder = data.huabuOrder;
      tileStore.tiles = data.tiles;
      lineStore.lines = data.lines;

      if (data.huabuOrder.length > 0) {
        huabuStore.switchHuabu(data.huabuOrder[0]);
      }

      information.value = json.tilemap.information || '';
      setFile(path);
      return true;
    } catch (e) {
      console.error('文件解析失败', e);
      return false;
    }
  }

  return {
    filePath,
    fileName,
    saved,
    autoSave,
    modified,
    information,
    recentFiles,
    setFile,
    markUnsaved,
    markSaved,
    clearFile,
    openFile,
    saveFile,
    saveFileAs,
    openFileByPath,
    toggleAutoSave,
    loadRecentFiles
  };
});
