<script setup lang="ts">
import { computed, watch } from 'vue';
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import { useTileStore } from '../../stores/tileStore';
import { useHuabuStore } from '../../stores/huabuStore';

const tileStore = useTileStore();
const huabuStore = useHuabuStore();
const focusedTile = computed(() => tileStore.focusedTile);
const activeHuabu = computed(() => huabuStore.activeHuabu);

const currentTiles = computed(() => {
  if (!activeHuabu.value) return [];
  return activeHuabu.value.tileIds.map((id) => tileStore.tiles.get(id)).filter(Boolean);
});

const editor = useEditor({
  extensions: [StarterKit],
  content: focusedTile.value?.content ?? '',
  onUpdate({ editor }) {
    if (focusedTile.value) {
      tileStore.updateContent(focusedTile.value.id, editor.getJSON());
    }
  }
});

watch(focusedTile, (tile) => {
  if (!editor.value) return;
  const newContent = tile?.content ?? '';
  const currentContent = editor.value.getJSON();
  if (JSON.stringify(newContent) !== JSON.stringify(currentContent)) {
    editor.value.commands.setContent(newContent || '');
  }
});

function goToTile(tileId: string) {
  tileStore.focusTile(tileId);
  const tile = tileStore.tiles.get(tileId);
  if (!tile || !activeHuabu.value) return;
  // 将画布平移到磁贴位置
  const scale = activeHuabu.value.scale;
  const cx = (activeHuabu.value.style.width / 2) * scale;
  const cy = (activeHuabu.value.style.height / 2) * scale;
  huabuStore.setPan(
    activeHuabu.value.id,
    cx - tile.style.left * scale - (tile.style.width * scale) / 2,
    cy - tile.style.top * scale - (tile.style.height * scale) / 2
  );
}
</script>

<template>
  <div class="right-edit-panel">
    <!-- 磁贴内容编辑 -->
    <div v-if="focusedTile" id="rightArea_edit_tile">
      <div class="slide_title">内容显示</div>
      <div class="editor-toolbar">
        <span class="toolbar-hint">支持 Markdown 快捷键</span>
      </div>
      <div class="editor-wrapper">
        <EditorContent :editor="editor" />
      </div>
    </div>

    <!-- 画布成员树 -->
    <div v-else id="rightArea_edit_huabu">
      <div class="slide_title">画布成员</div>
      <div id="huabu_member_tree">
        <div
          v-for="tile in currentTiles"
          :key="tile.id"
          class="tree_tile_row"
          :class="{ focusing: tile.id === tileStore.focusedTileId }"
          @click="goToTile(tile.id)"
        >
          <div
            class="tree_tile_color"
            :style="{ backgroundColor: tile.style.backgroundColor }"
          ></div>
          <div class="tree_tile_name">{{ tile.title || '(无标题)' }}</div>
          <div v-if="tile.nestHuabuId" class="tree_tile_nest" title="含嵌套画布">⊞</div>
        </div>
        <div v-if="currentTiles.length === 0" class="tree_empty">暂无磁贴</div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.right-edit-panel {
  width: 100%;
  height: 100%;
  overflow-y: auto;
}

.slide_title {
  font-size: 17px;
  font-weight: bold;
  padding: 6px 8px;
  background-color: var(--color-2);
  position: sticky;
  top: 0;
  z-index: 1;
}

.editor-toolbar {
  padding: 4px 8px;
  background-color: var(--color-1);
  border-bottom: 1px solid var(--border-color);
}

.toolbar-hint {
  font-size: 12px;
  color: var(--color-4);
}

.editor-wrapper {
  padding: 8px;
  min-height: 200px;

  :deep(.ProseMirror) {
    outline: none;
    min-height: 150px;
    font-size: 14px;
    line-height: 1.6;

    p {
      margin: 0 0 4px;
    }
    h1,
    h2,
    h3 {
      font-weight: bold;
      margin: 8px 0 4px;
    }
    ul,
    ol {
      padding-left: 20px;
    }
    code {
      background: var(--color-2);
      padding: 1px 4px;
      border-radius: 3px;
    }
  }
}

#huabu_member_tree {
  padding: 4px 0;
}

.tree_tile_row {
  display: flex;
  align-items: center;
  padding: 5px 8px;
  cursor: pointer;
  gap: 8px;
  border-bottom: 1px solid var(--border-color);

  &:hover {
    background-color: var(--color-2);
  }

  &.focusing {
    background-color: var(--color-3);
    font-weight: bold;
  }
}

.tree_tile_color {
  width: 14px;
  height: 14px;
  border: 1px solid var(--border-color);
  flex-shrink: 0;
  border-radius: 2px;
}

.tree_tile_name {
  flex: 1;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tree_tile_nest {
  font-size: 14px;
  color: var(--color-4);
  flex-shrink: 0;
}

.tree_empty {
  padding: 12px 8px;
  color: var(--color-4);
  font-size: 14px;
  text-align: center;
}
</style>
