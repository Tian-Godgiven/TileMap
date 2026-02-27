<script setup lang="ts">
export interface MenuItem {
  label?: string;
  hint?: string;
  action?: () => void;
  disabled?: boolean;
  submenu?: MenuItem[];
}

defineProps<{
  label: string;
  name: string;
  openMenu: string | null;
  items: MenuItem[];
}>();

const emit = defineEmits<{
  toggle: [name: string];
}>();
</script>

<template>
  <div class="topAbility_block" @click.stop="emit('toggle', name)">
    {{ label }}
    <div v-show="openMenu === name" class="dropdown-panel">
      <div
        v-for="(item, i) in items"
        :key="i"
        class="menu-item"
        :class="{ disabled: item.disabled, 'has-submenu': item.submenu?.length }"
        @click.stop="item.action?.()"
      >
        {{ item.label }}
        <span v-if="item.hint" class="hint">{{ item.hint }}</span>
        <div v-if="item.submenu" class="submenu">
          <div
            v-for="(sub, j) in item.submenu"
            :key="j"
            class="menu-item"
            :class="{ disabled: sub.disabled }"
            @click.stop="sub.action?.()"
          >
            {{ sub.label }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.topAbility_block {
  display: flex;
  align-items: center;
  padding: 0 5px;
  height: 100%;
  font-size: 20px;
  cursor: pointer;
  position: relative;
  user-select: none;
  background-color: var(--color-2);

  &:hover {
    background-color: var(--color-3);
  }
}

.dropdown-panel {
  position: absolute;
  top: 100%;
  left: 0;
  background-color: var(--color-1);
  border-bottom: 2px solid var(--border-color);
  border-right: 2px solid var(--border-color);
  border-left: 2px solid var(--border-color);
  border-top: 2px solid var(--color-3);
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
  z-index: 100;
  min-width: 200px;
  font-size: 18px;
  text-align: left;

  &:has(.menu-item.has-submenu:hover) {
    border-bottom-right-radius: 0;
  }
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2px 10px;
  white-space: nowrap;
  cursor: pointer;
  position: relative;

  &:hover {
    background-color: var(--color-3);

    > .submenu {
      display: block;
    }
  }

  &.disabled {
    color: var(--color-4);
    cursor: default;
    pointer-events: none;
  }

  &.has-submenu::after {
    content: '▸';
    margin-left: 10px;
    color: var(--color-4);
  }
}

.hint {
  font-size: 16px;
  color: var(--color-4);
  margin-left: 20px;
}

.submenu {
  display: none;
  position: absolute;
  top: -2px;
  left: 100%;
  background-color: var(--color-1);
  border-bottom: 2px solid var(--border-color);
  border-right: 2px solid var(--border-color);
  border-left: 2px solid var(--color-3);
  border-top: 2px solid var(--border-color);
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
  z-index: 101;
  min-width: 200px;
}
</style>
