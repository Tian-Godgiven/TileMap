<script setup lang="ts">
import { ref } from 'vue';
import RightDesignPanel from '../right/RightDesignPanel.vue';
import RightEditPanel from '../right/RightEditPanel.vue';

const activeTab = ref<'design' | 'edit'>('design');
</script>

<template>
  <div class="right-panel">
    <div id="rightArea_top">
      <div
        id="rightArea_design_model"
        class="rightArea_top_block"
        :class="{ rightArea_model_focusing: activeTab === 'design' }"
        @click="activeTab = 'design'"
      >
        样式
      </div>
      <div
        class="rightArea_top_block"
        :class="{ rightArea_model_focusing: activeTab === 'edit' }"
        @click="activeTab = 'edit'"
      >
        内容
      </div>
    </div>
    <div class="rightArea_inner">
      <RightDesignPanel v-show="activeTab === 'design'" />
      <RightEditPanel v-show="activeTab === 'edit'" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.right-panel {
  width: 100%;
  height: 100%;
}

#rightArea_top {
  display: flex;
  width: 100%;
}

.rightArea_top_block {
  display: flex;
  text-align: center;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  width: 50%;
  height: 50px;
  box-sizing: border-box;
  background-color: var(--color-2);
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
}

.rightArea_model_focusing {
  background-color: var(--color-1);
  border-bottom: none;
}

#rightArea_design_model {
  border-right: 1px solid var(--border-color);
}

.rightArea_inner {
  position: relative;
  width: 100%;
  height: calc(100% - 50px);
  overflow-y: overlay;
  overflow-x: hidden;
}
</style>
