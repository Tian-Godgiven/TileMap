<script setup lang="ts">
import { ref, computed } from 'vue';
import { useUiStore } from '../../stores/uiStore';
import { useHuabuStore } from '../../stores/huabuStore';

const uiStore = useUiStore();
const huabuStore = useHuabuStore();

type ExportType = 'png' | 'html';

const selectingType = ref<ExportType>('png');
const selectedHuabuIds = ref<Set<string>>(new Set());
const selectingHuabuId = ref<string | null>(null);
const previewImage = ref<string | null>(null);

// HTML 导出选项
const htmlOptions = ref({
  allowDrag: false,
  allowMoveComposite: false,
  showContent: false,
  addContentControl: false
});

const huabuList = computed(() => {
  return huabuStore.huabuOrder.map((id) => ({
    id,
    name: huabuStore.huabus.get(id)?.name ?? '未命名'
  }));
});

const pngInfoList = computed(() => {
  const list: { id: string; name: string; size: string }[] = [];
  for (const id of selectedHuabuIds.value) {
    const huabu = huabuStore.huabus.get(id);
    if (huabu) {
      list.push({
        id,
        name: huabu.name,
        size: `${huabu.style.width} x ${huabu.style.height}`
      });
    }
  }
  return list;
});

function selectHuabu(id: string) {
  if (selectingHuabuId.value === id) return;
  selectingHuabuId.value = id;
  previewImage.value = null;
  // 尝试截图：通过 ipcRenderer 请求主进程截图
  const ipc = (window as any).ipcRenderer;
  if (ipc) {
    ipc
      .invoke('capture-huabu', id)
      .then((dataUrl: string) => {
        if (dataUrl) previewImage.value = dataUrl;
      })
      .catch(() => {});
  }
}

function toggleHuabuSelection(id: string, checked: boolean) {
  if (checked) {
    selectedHuabuIds.value.add(id);
  } else {
    selectedHuabuIds.value.delete(id);
  }
}

async function confirm() {
  const api = (window as any).fileAPI;
  if (!api) return;

  if (selectedHuabuIds.value.size === 0) {
    alert('请至少选择一个画布');
    return;
  }

  if (selectingType.value === 'png') {
    const ids = Array.from(selectedHuabuIds.value);

    if (ids.length === 1) {
      const huabu = huabuStore.huabus.get(ids[0]);
      if (!huabu) return;
      const path = await api.saveFileDialog(`${huabu.name}.png`, ['png']);
      if (!path) return;
      // 通知主进程截图并保存
      const ipc = (window as any).ipcRenderer;
      if (ipc) {
        await ipc.invoke('save-huabu-png', { huabuId: ids[0], path });
      }
    } else {
      // 多个画布，选择文件夹
      const dirPath = await api.selectDirectory?.();
      if (!dirPath) return;
      const ipc = (window as any).ipcRenderer;
      if (ipc) {
        for (const id of ids) {
          const huabu = huabuStore.huabus.get(id);
          if (!huabu) continue;
          const filePath = `${dirPath}/${huabu.name}.png`;
          await ipc.invoke('save-huabu-png', { huabuId: id, path: filePath });
        }
      }
    }
  } else if (selectingType.value === 'html') {
    const ids = Array.from(selectedHuabuIds.value);
    for (const id of ids) {
      const huabu = huabuStore.huabus.get(id);
      if (!huabu) continue;
      const path = await api.saveFileDialog(`${huabu.name}.html`, ['html']);
      if (!path) continue;
      // 生成 HTML 内容
      const html = generateHuabuHtml(id);
      await api.writeFile(path, html);
    }
  }

  uiStore.closeFileSaveAsMenu();
}

function generateHuabuHtml(huabuId: string): string {
  const huabu = huabuStore.huabus.get(huabuId);
  if (!huabu) return '';

  const allowDrag = htmlOptions.value.allowDrag;

  // 生成基础 HTML 结构
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${huabu.name}</title>
  <style>
    body { margin: 0; background: #f0f0f0; }
    .huabu { position: relative; width: ${huabu.style.width}px; height: ${huabu.style.height}px; background: white; }
    .tile { position: absolute; border: 1px solid #000; box-sizing: border-box; overflow: hidden; }
    .tile-title { text-align: center; padding: 4px; font-size: 14px; }
  </style>
</head>
<body>
  <div class="huabu" id="huabu_${huabuId}">
    <!-- 磁贴内容由 TileMap 生成 -->
  </div>
  ${allowDrag ? '<script>/* 拖拽功能 */</' + 'script>' : ''}
</body>
</html>`;
}

function cancel() {
  uiStore.closeFileSaveAsMenu();
}
</script>

<template>
  <div v-if="uiStore.fileSaveAsMenuVisible" class="modal-mask">
    <div id="file_saveAs_menu">
      <div class="flex" style="width: 100%; height: 100%">
        <!-- 左侧栏 -->
        <div id="file_saveAs_menu_left">
          <div id="file_saveAs_menu_title">另存为</div>
          <div id="file_saveAs_menu_selectType">
            <div :class="{ selecting: selectingType === 'png' }" @click="selectingType = 'png'">
              png图片
            </div>
            <div :class="{ selecting: selectingType === 'html' }" @click="selectingType = 'html'">
              html文件
            </div>
          </div>
          <div id="file_saveAs_menu_selectHuabu">
            <div
              v-for="h in huabuList"
              :key="h.id"
              class="huabu_block"
              :class="{ selecting: selectingHuabuId === h.id }"
              @click="selectHuabu(h.id)"
            >
              <input
                type="checkbox"
                :checked="selectedHuabuIds.has(h.id)"
                @click.stop
                @change="toggleHuabuSelection(h.id, ($event.target as HTMLInputElement).checked)"
              />
              <span>{{ h.name }}</span>
            </div>
          </div>
        </div>
        <!-- 右侧 -->
        <div id="file_saveAs_menu_right">
          <!-- 预览图 -->
          <div id="file_saveAs_menu_huabuImg">
            <img v-if="previewImage" :src="previewImage" />
            <span v-else class="preview_hint">左侧选择画布，查看其预览图</span>
          </div>
          <!-- 底部 -->
          <div id="file_saveAs_menu_bottom">
            <div id="file_saveAs_menu_information">
              <!-- PNG 信息 -->
              <div v-if="selectingType === 'png'" id="file_saveAs_menu_pngInformation">
                <div v-for="info in pngInfoList" :key="info.id" class="png_info_block">
                  <span class="info_name">{{ info.name }}.png</span>
                  <span class="info_size">{{ info.size }}</span>
                </div>
                <div v-if="pngInfoList.length === 0" class="hint">勾选左侧画布以查看信息</div>
              </div>
              <!-- HTML 选项 -->
              <div v-else id="file_saveAs_menu_htmlInformation">
                <div class="flex" style="gap: 16px">
                  <div>
                    <div class="html_option">
                      <input v-model="htmlOptions.allowDrag" type="checkbox" />允许拖拽移动
                    </div>
                    <div class="html_option">
                      <input
                        v-model="htmlOptions.allowMoveComposite"
                        type="checkbox"
                      />允许移动组合体内的组件
                    </div>
                  </div>
                  <div>
                    <div class="html_option">
                      <input v-model="htmlOptions.showContent" type="checkbox" />允许显示内容块
                    </div>
                    <div class="html_option">
                      <input
                        v-model="htmlOptions.addContentControl"
                        type="checkbox"
                      />添加内容块显示控制组件
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div id="file_saveAs_menu_buttons">
              <div class="menu_button" @click="confirm">确认</div>
              <div class="menu_button" style="margin-top: 4px" @click="cancel">取消</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 500;
  display: flex;
  align-items: center;
  justify-content: center;
}

#file_saveAs_menu {
  width: 600px;
  height: 500px;
  background-color: var(--color-2);
  padding: 15px;
  box-sizing: content-box;
  border-radius: 4px;
}

#file_saveAs_menu_left {
  width: 155px;
  margin-right: 5px;
  height: 100%;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}

#file_saveAs_menu_title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 8px;
}

#file_saveAs_menu_selectType {
  background-color: var(--color-1);
  border: 1px solid var(--border-color);
  border-radius: 3px;
  padding: 5px;
  margin-bottom: 6px;

  > div {
    font-size: 16px;
    padding: 3px 6px;
    cursor: pointer;
    border-radius: 4px;

    &:hover {
      background-color: var(--color-3);
    }
    &.selecting {
      background-color: var(--color-3);
      border: 1px solid var(--border-color);
    }
  }
}

#file_saveAs_menu_selectHuabu {
  flex: 1;
  background-color: var(--color-1);
  border: 1px solid var(--border-color);
  border-radius: 3px;
  padding: 5px;
  overflow-y: auto;
}

.huabu_block {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 4px;
  cursor: pointer;
  border-radius: 3px;
  font-size: 13px;

  &:hover {
    background-color: var(--color-2);
  }
  &.selecting {
    background-color: var(--color-3);
  }

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

#file_saveAs_menu_right {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

#file_saveAs_menu_huabuImg {
  flex: 1;
  background-color: var(--color-1);
  border: 1px solid var(--border-color);
  border-radius: 3px;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
}

.preview_hint {
  color: var(--color-4);
  font-size: 13px;
}

#file_saveAs_menu_bottom {
  height: 90px;
  display: flex;
  gap: 5px;
}

#file_saveAs_menu_information {
  flex: 1;
  background-color: var(--color-1);
  border: 1px solid var(--border-color);
  border-radius: 3px;
  padding: 6px 10px;
  overflow-y: auto;
}

.png_info_block {
  display: flex;
  gap: 10px;
  font-size: 12px;
  padding: 2px 0;
}

.info_name {
  width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.info_size {
  color: var(--color-4);
}
.hint {
  color: var(--color-4);
  font-size: 12px;
}

.html_option {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  padding: 2px 0;
}

#file_saveAs_menu_buttons {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.menu_button {
  font-size: 16px;
  height: 38px;
  width: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-1);
  border: 1px solid var(--border-color);
  border-radius: 3px;
  cursor: pointer;

  &:hover {
    background-color: var(--color-3);
  }
}
</style>
