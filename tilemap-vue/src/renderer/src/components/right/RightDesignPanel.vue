<script setup lang="ts">
import { computed } from 'vue';
import { useTileStore } from '../../stores/tileStore';
import { useHuabuStore } from '../../stores/huabuStore';
import RightDesignTile from './RightDesignTile.vue';
import RightDesignHuabu from './RightDesignHuabu.vue';

const tileStore = useTileStore();
const huabuStore = useHuabuStore();

const hasFocusedTile = computed(() => !!tileStore.focusedTile);
const hasActiveHuabu = computed(() => !!huabuStore.activeHuabu);
</script>

<template>
  <div class="right-design-panel">
    <RightDesignTile v-if="hasFocusedTile" />
    <RightDesignHuabu v-else-if="hasActiveHuabu" />
  </div>
</template>

<style lang="scss" scoped>
.right-design-panel {
  width: 100%;
}
</style>
