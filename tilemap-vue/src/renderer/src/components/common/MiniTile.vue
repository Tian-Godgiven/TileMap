<script setup lang="ts">
import { computed } from 'vue';
import type { Tile } from '../../types';

const props = defineProps<{
  tileData: Partial<Tile>;
  size?: number;
}>();

const size = computed(() => props.size ?? 50);

const scale = computed(() => {
  const style = props.tileData.style;
  if (!style) return 1;
  const width = style.width ?? 100;
  const height = style.height ?? 100;
  const maxDim = Math.max(width, height);
  return size.value / maxDim;
});

const tileStyle = computed(() => {
  const style = props.tileData.style;
  if (!style) return {};
  return {
    width: `${style.width ?? 100}px`,
    height: `${style.height ?? 100}px`,
    backgroundColor: style.backgroundColor,
    borderStyle: style.borderStyle ?? 'solid',
    borderWidth: `${style.borderWidth ?? 2}px`,
    borderColor: style.borderColor ?? 'black',
    borderRadius: `${style.borderRadius ?? 0}px`,
    fontSize: `${style.fontSize ?? 30}px`,
    transform: `scale(${scale.value})`,
    transformOrigin: 'center center',
    backgroundImage:
      style.backgroundGradient && style.gradientColor
        ? `${style.gradientDirection === 'radial' ? 'radial-gradient' : `linear-gradient(to ${style.gradientDirection})`}(${style.backgroundColor}, ${style.gradientColor})`
        : style.backgroundImage
          ? `url(${style.backgroundImage})`
          : undefined,
    backgroundSize:
      style.backgroundImageSet === 'stretch'
        ? '100% 100%'
        : style.backgroundImageSet === 'repeat'
          ? 'auto'
          : 'contain',
    backgroundRepeat: style.backgroundImageSet === 'repeat' ? 'repeat' : 'no-repeat',
    backgroundPosition: 'center'
  };
});

const titleStyle = computed(() => {
  const style = props.tileData.style;
  if (!style) return {};
  return {
    color: style.titleColor,
    textAlign: style.titleAlign as any,
    fontFamily: style.fontFamily,
    fontWeight: style.fontBold ? 'bold' : 'normal',
    fontStyle: style.fontItalic ? 'italic' : 'normal'
  };
});
</script>

<template>
  <div class="objectBlock_mini" :style="{ height: size + 'px' }">
    <div class="mini-tile" :style="tileStyle">
      <div v-if="tileData.props?.showTitle" class="tile_title" :style="titleStyle">
        {{ tileData.title }}
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.objectBlock_mini {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

.mini-tile {
  position: relative;
  flex-shrink: 0;
  box-sizing: border-box;
  pointer-events: none;
}

.tile_title {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background-color: transparent;
  pointer-events: none;
  font-size: inherit;
}
</style>
