<script setup lang="ts">
import { computed, watch } from 'vue';
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import type { Tile } from '../../types';
import { useTileStore } from '../../stores/tileStore';
import { useUiStore } from '../../stores/uiStore';

const props = defineProps<{
  tile: Tile;
  scale: number;
}>();

const tileStore = useTileStore();
const uiStore = useUiStore();

// 只读编辑器，用于展示内容
const editor = useEditor({
  content: props.tile.content ?? undefined,
  editable: false,
  extensions: [StarterKit]
});

// 监听内容变化
watch(
  () => props.tile.content,
  (val) => {
    if (editor.value && val) editor.value.commands.setContent(val);
  }
);

// 计算 textblock 相对于画布的位置
const blockStyle = computed(() => {
  const t = props.tile;
  const tw = t.style.width;
  const th = t.style.height;
  const tx = t.style.left;
  const ty = t.style.top;
  const bw = t.props.textblockWidth;
  const bh = t.props.textblockHeight;

  let left = tx;
  let top = ty;

  // 水平
  switch (t.props.textblockHorizontal) {
    case 'left':
      left = tx - bw;
      break;
    case 'left_edge':
      left = tx;
      break;
    case 'center':
      left = tx + (tw - bw) / 2;
      break;
    case 'right_edge':
      left = tx + tw - bw;
      break;
    case 'right':
      left = tx + tw;
      break;
  }
  // 垂直
  switch (t.props.textblockVertical) {
    case 'top':
      top = ty - bh;
      break;
    case 'center':
      top = ty;
      break;
    case 'bottom':
      top = ty + th;
      break;
  }

  return {
    left: `${left}px`,
    top: `${top}px`,
    width: `${bw}px`,
    height: `${bh}px`,
    zIndex: t.style.zIndex + 1
  };
});

function toggleBind() {
  tileStore.updateProps(props.tile.id, { textblockBind: !props.tile.props.textblockBind });
}
function setEnternalShow() {
  tileStore.updateProps(props.tile.id, { textblockShowState: 'enternalShow' });
}
function setEnternalHide() {
  tileStore.updateProps(props.tile.id, { textblockShowState: 'enternalHide' });
}

// 判断是否应该显示 textblock
const shouldShow = computed(() => {
  // 如果全局隐藏了 textblock，则不显示
  if (!uiStore.showTextblock) return false;
  // 如果设置了永久隐藏，则不显示
  if (props.tile.props.textblockShowState === 'enternalHide') return false;
  // 其他情况显示
  return true;
});
</script>

<template>
  <div v-show="shouldShow" class="textblock" :style="blockStyle">
    <div class="textblock_bar">
      <div class="textblock_title">{{ tile.title }}</div>
      <div class="textblock_button">
        <div
          class="tb-btn"
          :class="tile.props.textblockBind ? 'tb-bind' : 'tb-unbind'"
          title="绑定切换"
          @click.stop="toggleBind"
        ></div>
        <div class="tb-btn tb-eye-show" title="永久显示" @click.stop="setEnternalShow"></div>
        <div class="tb-btn tb-eye-hide" title="永久隐藏" @click.stop="setEnternalHide"></div>
      </div>
    </div>
    <div class="textblock_content">
      <EditorContent :editor="editor" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.textblock {
  position: absolute;
  background: var(--bg-color, #fff);
  border: 1px solid var(--border-color, #ccc);
  border-radius: 4px;
  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  pointer-events: all;
}

.textblock_bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2px 6px;
  background: var(--color-2, #f0f0f0);
  border-bottom: 1px solid var(--border-color, #ccc);
  font-size: 12px;
  font-weight: bold;
  flex-shrink: 0;
}

.textblock_button {
  display: flex;
  gap: 4px;
}

.tb-btn {
  cursor: pointer;
  width: 16px;
  height: 16px;
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center;
  &:hover {
    opacity: 0.7;
  }
}

.tb-bind {
  background-image: url('../../assets/img/link.png');
}
.tb-unbind {
  background-image: url('../../assets/img/link_break.png');
}
.tb-eye-show {
  background-image: url('../../assets/img/eye_show.png');
}
.tb-eye-hide {
  background-image: url('../../assets/img/eye_hide.png');
}

.textblock_content {
  flex: 1;
  overflow: auto;
  padding: 4px 8px;
  font-size: 13px;
}
</style>
