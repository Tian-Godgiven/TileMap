<script setup lang="ts">
import { computed, ref } from 'vue';
import { useHuabuStore } from '../../stores/huabuStore';
import ColorPicker from '../common/ColorPicker.vue';

const huabuStore = useHuabuStore();
const activeHuabu = computed(() => huabuStore.activeHuabu);
const fileAPI = (window as any).fileAPI;

async function selectHuabuBackground() {
  if (!activeHuabu.value) return;
  const path = await fileAPI.openFileDialog('Image', ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp']);
  if (!path) return;
  const base64 = await fileAPI.getImgBase64(path);
  if (base64) huabuStore.updateStyle(activeHuabu.value.id, { backgroundImage: base64 } as any);
}

const colorPicker = ref<{ visible: boolean; key: string; value: string; x: number; y: number }>({
  visible: false,
  key: '',
  value: '#ffffff',
  x: 0,
  y: 0
});

function openColorPicker(e: MouseEvent, key: string, value: string) {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  const pw = 290;
  const x = rect.right + 4 + pw > window.innerWidth ? rect.left - pw - 4 : rect.right + 4;
  const y = Math.min(rect.top, window.innerHeight - 420);
  colorPicker.value = { visible: true, key, value, x, y };
}

function onColorConfirm(color: string) {
  if (!activeHuabu.value) return;
  if (colorPicker.value.key === 'backgroundColor') {
    huabuStore.updateStyle(activeHuabu.value.id, { backgroundColor: color });
  } else if (colorPicker.value.key === 'gridColor') {
    huabuStore.updateGrid(activeHuabu.value.id, { color });
  }
  colorPicker.value.visible = false;
}

function applyPreset(preset: string) {
  if (!activeHuabu.value || !preset) return;
  const presets: Record<string, { width: number; height: number }> = {
    A0: { width: 3179, height: 4494 },
    A1: { width: 2245, height: 3179 },
    A2: { width: 1587, height: 2245 },
    A3: { width: 1123, height: 1587 },
    A4: { width: 794, height: 1123 },
    A5: { width: 559, height: 794 },
    '16:9': { width: 1600, height: 900 },
    '4:3': { width: 1600, height: 1200 }
  };
  const size = presets[preset];
  if (size) huabuStore.updateStyle(activeHuabu.value.id, size);
}
</script>

<template>
  <div v-if="activeHuabu" id="rightArea_design_huabu" class="rightArea_design_inner_block">
    <div class="rightArea_inner_ability">
      <div class="rightArea_inner_ability_title">-属性-</div>
      <div class="flex">
        名称：
        <input
          type="text"
          :value="activeHuabu.name"
          @input="huabuStore.renameHuabu(activeHuabu.id, ($event.target as HTMLInputElement).value)"
        />
      </div>
      <div class="flex" style="margin-top: 4px">
        尺寸预设：
        <select @change="applyPreset(($event.target as HTMLSelectElement).value)">
          <option value="">自定义</option>
          <option value="A0">A0 (841×1189mm)</option>
          <option value="A1">A1 (594×841mm)</option>
          <option value="A2">A2 (420×594mm)</option>
          <option value="A3">A3 (297×420mm)</option>
          <option value="A4">A4 (210×297mm)</option>
          <option value="A5">A5 (148×210mm)</option>
          <option value="16:9">16:9 (1600×900px)</option>
          <option value="4:3">4:3 (1600×1200px)</option>
        </select>
      </div>
      <div class="flex" style="margin-top: 4px">
        尺寸：
        <div>
          <div class="flex">
            <input
              class="number_input"
              type="number"
              :value="activeHuabu.style.width"
              @change="
                huabuStore.updateStyle(activeHuabu.id, {
                  width: Number(($event.target as HTMLInputElement).value)
                })
              "
            />
            <div>宽</div>
          </div>
          <div class="flex">
            <input
              class="number_input"
              type="number"
              :value="activeHuabu.style.height"
              @change="
                huabuStore.updateStyle(activeHuabu.id, {
                  height: Number(($event.target as HTMLInputElement).value)
                })
              "
            />
            <div>高</div>
          </div>
        </div>
      </div>
    </div>

    <div class="rightArea_inner_ability">
      <div class="rightArea_inner_ability_title">-显示-</div>
      <div class="flex">
        画布颜色：
        <div
          class="color-swatch"
          :style="{ backgroundColor: activeHuabu.style.backgroundColor }"
          @click="openColorPicker($event, 'backgroundColor', activeHuabu.style.backgroundColor)"
        />
      </div>
      <div class="flex" style="margin-top: 4px">
        画布网格：
        <input
          type="checkbox"
          :checked="activeHuabu.grid.show"
          @change="
            huabuStore.updateGrid(activeHuabu.id, {
              show: ($event.target as HTMLInputElement).checked
            })
          "
        />
      </div>
      <div v-if="activeHuabu.grid.show" class="flex" style="margin-top: 4px">
        网格密度：
        <input
          class="number_input"
          type="number"
          min="10"
          :value="activeHuabu.grid.size ?? 50"
          @change="
            huabuStore.updateGrid(activeHuabu.id, {
              size: Number(($event.target as HTMLInputElement).value)
            })
          "
        />
      </div>
      <div v-if="activeHuabu.grid.show" class="flex" style="margin-top: 4px">
        网格颜色：
        <div
          class="color-swatch"
          :style="{ backgroundColor: activeHuabu.grid.color }"
          @click="openColorPicker($event, 'gridColor', activeHuabu.grid.color)"
        />
      </div>
      <div style="margin-top: 4px">
        背景图片：
        <div class="flex" style="margin-top: 4px">
          <div class="rightArea_button" @click="selectHuabuBackground">选择图片</div>
          <div
            v-if="(activeHuabu.style as any).backgroundImage"
            class="rightArea_button"
            style="margin-left: 4px"
            @click="huabuStore.updateStyle(activeHuabu.id, { backgroundImage: null } as any)"
          >
            删除
          </div>
        </div>
      </div>
    </div>

    <div class="rightArea_inner_ability">
      <div class="rightArea_inner_ability_title">-操作-</div>
      <div
        class="rightArea_button"
        @click="
          huabuStore.setPan(activeHuabu.id, 0, 0);
          huabuStore.setScale(activeHuabu.id, 1);
        "
      >
        回到画布中心
      </div>
      <div
        class="rightArea_button"
        style="margin-top: 4px"
        @click="huabuStore.copyHuabu(activeHuabu.id, true)"
      >
        拷贝画布
      </div>
      <div
        class="rightArea_button"
        style="margin-top: 4px"
        @click="huabuStore.deleteHuabu(activeHuabu.id)"
      >
        删除当前画布
      </div>
    </div>

    <!-- 颜色选择器 -->
    <ColorPicker
      v-model="colorPicker.value"
      :visible="colorPicker.visible"
      :x="colorPicker.x"
      :y="colorPicker.y"
      @confirm="onColorConfirm"
      @close="colorPicker.visible = false"
    />
  </div>
</template>

<style lang="scss" scoped>
.color-swatch {
  width: 24px;
  height: 24px;
  border: 1px solid var(--border-color);
  border-radius: 3px;
  cursor: pointer;
  flex-shrink: 0;

  &:hover {
    outline: 2px solid var(--focusing-color);
  }
}
</style>
