<script setup lang="ts">
import { ref } from 'vue';
import { useUiStore } from '../../stores/uiStore';
import { useTileStore } from '../../stores/tileStore';
import { useHuabuStore } from '../../stores/huabuStore';

const uiStore = useUiStore();
const tileStore = useTileStore();
const huabuStore = useHuabuStore();

const searchText = ref('');

interface SearchResult {
  huabuId: string;
  huabuName: string;
  tileId: string;
  tileTitle: string;
  matchType: 'title' | 'content';
}

const results = ref<SearchResult[]>([]);

function search() {
  results.value = [];
  const q = searchText.value.trim();
  if (!q) return;

  for (const [huabuId, huabu] of huabuStore.huabus) {
    for (const tileId of huabu.tileIds) {
      const tile = tileStore.tiles.get(tileId);
      if (!tile) continue;
      const titleMatch = tile.title?.toLowerCase().includes(q.toLowerCase());
      const contentStr = JSON.stringify(tile.content ?? '').toLowerCase();
      const contentMatch = contentStr.includes(q.toLowerCase());
      if (titleMatch || contentMatch) {
        results.value.push({
          huabuId,
          huabuName: huabu.name,
          tileId,
          tileTitle: tile.title || '(无标题)',
          matchType: titleMatch ? 'title' : 'content'
        });
      }
    }
  }
}

function goToTile(r: SearchResult) {
  huabuStore.switchHuabu(r.huabuId);
  tileStore.focusTile(r.tileId);
  const tile = tileStore.tiles.get(r.tileId);
  const huabu = huabuStore.huabus.get(r.huabuId);
  if (tile && huabu) {
    const scale = huabu.scale;
    const cx = (huabu.style.width / 2) * scale;
    const cy = (huabu.style.height / 2) * scale;
    huabuStore.setPan(
      r.huabuId,
      cx - tile.style.left * scale - (tile.style.width * scale) / 2,
      cy - tile.style.top * scale - (tile.style.height * scale) / 2
    );
  }
}
</script>

<template>
  <div v-if="uiStore.searchMenuVisible" id="search_menu">
    <div id="search_menu_top">
      <span>搜索</span>
      <div id="search_menu_close" @click="uiStore.toggleSearchMenu"></div>
    </div>
    <div id="search_menu_input" class="flex">
      <input
        v-model="searchText"
        type="text"
        placeholder="搜索磁贴标题或内容"
        @keydown.enter="search"
      />
      <div id="search_menu_search" @click="search"></div>
    </div>
    <div id="search_menu_down">
      <div v-if="results.length === 0 && searchText" class="search_empty">无结果</div>
      <div v-for="r in results" :key="r.tileId" class="search_row" @click="goToTile(r)">
        <div class="search_row_huabu">{{ r.huabuName }}</div>
        <div class="search_row_tile">
          <span class="search_tile_title">{{ r.tileTitle }}</span>
          <span class="search_match_type">{{ r.matchType === 'title' ? '标题' : '内容' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
#search_menu {
  width: 240px;
  height: 320px;
  position: fixed;
  top: 130px;
  right: 20px;
  background-color: var(--color-1);
  border: 2px solid var(--color-5);
  border-radius: 5px;
  font-size: 14px;
  z-index: 200;
  padding: 5px;
  display: flex;
  flex-direction: column;
}

#search_menu_top {
  position: relative;
  height: 25px;
  font-size: 18px;
  text-align: left;
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

#search_menu_close {
  position: absolute;
  right: 0;
  top: 0;
  width: 25px;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-image: url('../../assets/img/delete.png');
  background-repeat: no-repeat;
  background-size: 14px 14px;
  background-position: center;

  &:hover {
    opacity: 0.7;
  }
}

#search_menu_input {
  height: 30px;
  margin: 4px 0;
  display: flex;
  gap: 4px;

  input {
    flex: 1;
    padding: 0 6px;
  }
}

#search_menu_search {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;
  background-image: url('../../assets/img/search.png');
  background-repeat: no-repeat;
  background-size: 16px 16px;
  background-position: center;

  &:hover {
    background-color: var(--color-3);
  }
}

#search_menu_down {
  flex: 1;
  background-color: var(--color-0);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 4px;
  overflow-y: auto;
}

.search_empty {
  color: var(--color-4);
  text-align: center;
  padding: 10px;
}

.search_row {
  padding: 5px 6px;
  cursor: pointer;
  border-bottom: 1px solid var(--border-color);

  &:hover {
    background: var(--color-2);
  }
}

.search_row_huabu {
  font-size: 11px;
  color: var(--color-4);
}

.search_row_tile {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search_tile_title {
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.search_match_type {
  font-size: 11px;
  color: var(--focusing-color);
  flex-shrink: 0;
  margin-left: 4px;
}
</style>
