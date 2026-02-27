import { onMounted, onUnmounted } from 'vue';
import { useHistoryStore } from '../stores/historyStore';
import { useTileStore } from '../stores/tileStore';
import { useHuabuStore } from '../stores/huabuStore';
import { useLineStore } from '../stores/lineStore';
import { useFileStore } from '../stores/fileStore';
import { useClipboardStore } from '../stores/clipboardStore';
import { useUiStore } from '../stores/uiStore';
import { useConfirm } from './useConfirm';

export function useKeyboard() {
  const historyStore = useHistoryStore();
  const tileStore = useTileStore();
  const huabuStore = useHuabuStore();
  const lineStore = useLineStore();
  const fileStore = useFileStore();
  const clipboardStore = useClipboardStore();
  const uiStore = useUiStore();
  const { confirm } = useConfirm();

  async function onKeyDown(e: KeyboardEvent) {
    const ctrl = e.ctrlKey || e.metaKey;
    const target = e.target as HTMLElement;
    // 如果焦点在输入框内，不拦截
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      return;

    // Ctrl+Z 撤销
    if (ctrl && e.key === 'z') {
      e.preventDefault();
      historyStore.undo();
      return;
    }

    // Ctrl+Y 重做
    if (ctrl && e.key === 'y') {
      e.preventDefault();
      historyStore.redo();
      return;
    }

    // Ctrl+N 新建
    if (ctrl && e.key === 'n') {
      e.preventDefault();
      if (fileStore.modified) {
        if (!(await confirm('当前文件未保存，是否继续？'))) return;
      }
      huabuStore.huabus.clear();
      huabuStore.huabuOrder = [];
      tileStore.tiles.clear();
      lineStore.lines.clear();
      historyStore.clear();
      fileStore.clearFile();
      huabuStore.init();
      return;
    }

    // Ctrl+O 打开
    if (ctrl && e.key === 'o') {
      e.preventDefault();
      fileStore.openFile();
      return;
    }

    // Ctrl+S 保存
    if (ctrl && e.key === 's') {
      e.preventDefault();
      fileStore.saveFile();
      return;
    }

    // Ctrl+C 复制
    if (ctrl && e.key === 'c') {
      const tile = tileStore.focusedTile;
      if (tile) {
        e.preventDefault();
        clipboardStore.copyTile(tile);
      }
      return;
    }

    // Ctrl+X 剪切
    if (ctrl && e.key === 'x') {
      const tile = tileStore.focusedTile;
      if (tile && huabuStore.activeHuabuId) {
        e.preventDefault();
        clipboardStore.copyTile(tile);
        const snapshot = { ...tile, style: { ...tile.style }, props: { ...tile.props } };
        huabuStore.removeTileId(huabuStore.activeHuabuId, tile.id);
        tileStore.deleteTile(tile.id);
        historyStore.push({ type: 'tile-delete', tileId: snapshot.id, huabuId: huabuStore.activeHuabuId, snapshot });
      }
      return;
    }

    // Ctrl+V 粘贴
    if (ctrl && e.key === 'v') {
      if (clipboardStore.hasClipboard() && huabuStore.activeHuabuId) {
        e.preventDefault();
        const newTile = clipboardStore.pasteTile();
        if (newTile) {
          const id = `tile_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
          newTile.id = id;
          newTile.lineIds = [];
          newTile.nestHuabuId = null;
          tileStore.tiles.set(id, newTile);
          huabuStore.addTileId(huabuStore.activeHuabuId, id);
          tileStore.focusTile(id);
          historyStore.push({ type: 'tile-create', tileId: id, huabuId: huabuStore.activeHuabuId, snapshot: { ...newTile } });
        }
      }
      return;
    }

    // Ctrl+D 复制并粘贴（快速复制）
    if (ctrl && e.key === 'd') {
      const tile = tileStore.focusedTile;
      if (tile && huabuStore.activeHuabuId) {
        e.preventDefault();
        clipboardStore.copyTile(tile);
        const newTile = clipboardStore.pasteTile();
        if (newTile) {
          const id = `tile_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
          newTile.id = id;
          newTile.lineIds = [];
          newTile.nestHuabuId = null;
          tileStore.tiles.set(id, newTile);
          huabuStore.addTileId(huabuStore.activeHuabuId, id);
          tileStore.focusTile(id);
          historyStore.push({ type: 'tile-create', tileId: id, huabuId: huabuStore.activeHuabuId, snapshot: { ...newTile } });
        }
      }
      return;
    }

    // Ctrl+L 连线模式
    if (ctrl && e.key === 'l') {
      e.preventDefault();
      if (lineStore.connectMode) {
        lineStore.endConnectMode();
      } else {
        lineStore.startConnectMode();
      }
      return;
    }

    // Ctrl+F 搜索
    if (ctrl && e.key === 'f') {
      e.preventDefault();
      uiStore.toggleSearchMenu();
      return;
    }

    // Ctrl+A 全选
    if (ctrl && e.key === 'a') {
      e.preventDefault();
      if (huabuStore.activeHuabu) {
        huabuStore.activeHuabu.tileIds.forEach((id) => tileStore.selectTile(id));
      }
      return;
    }

    // Delete / Backspace 删除聚焦磁贴
    if (e.key === 'Delete' || e.key === 'Backspace') {
      const tile = tileStore.focusedTile;
      if (tile && huabuStore.activeHuabuId) {
        const snapshot = { ...tile, style: { ...tile.style }, props: { ...tile.props } };
        huabuStore.removeTileId(huabuStore.activeHuabuId, tile.id);
        tileStore.deleteTile(tile.id);
        historyStore.push({ type: 'tile-delete', tileId: snapshot.id, huabuId: huabuStore.activeHuabuId, snapshot });
      }
      return;
    }

    // Escape 取消聚焦 / 退出连线模式
    if (e.key === 'Escape') {
      if (lineStore.connectMode) {
        lineStore.endConnectMode();
      } else {
        tileStore.focusTile(null);
        tileStore.clearSelection();
      }
      return;
    }

    // 方向键移动磁贴
    const step = e.shiftKey ? 10 : 1;
    const tile = tileStore.focusedTile;
    if (tile && !tile.props.lock) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        tileStore.moveTile(tile.id, tile.style.left - step, tile.style.top);
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        tileStore.moveTile(tile.id, tile.style.left + step, tile.style.top);
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        tileStore.moveTile(tile.id, tile.style.left, tile.style.top - step);
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        tileStore.moveTile(tile.id, tile.style.left, tile.style.top + step);
      }
    }
  }

  onMounted(() => window.addEventListener('keydown', onKeyDown));
  onUnmounted(() => window.removeEventListener('keydown', onKeyDown));
}
