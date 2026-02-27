<script setup lang="ts">
import { computed, ref } from 'vue';
import { useTileStore } from '../../stores/tileStore';
import { useHuabuStore } from '../../stores/huabuStore';
import ColorPicker from '../common/ColorPicker.vue';

const tileStore = useTileStore();
const huabuStore = useHuabuStore();
const fileAPI = (window as any).fileAPI;

const tile = computed(() => tileStore.focusedTile);

function us(style: object) {
  if (!tile.value) return;
  tileStore.updateStyle(tile.value.id, style as any);
}

function up(props: object) {
  if (!tile.value) return;
  tileStore.updateProps(tile.value.id, props as any);
}

async function selectBgImage() {
  if (!tile.value) return;
  const path = await fileAPI.openFileDialog('Image', ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp']);
  if (!path) return;
  const base64 = await fileAPI.getImgBase64(path);
  if (base64) us({ backgroundImage: base64 });
}

function createNestHuabu() {
  if (!tile.value) return;
  const huabu = huabuStore.createHuabu(tile.value.title || '嵌套画布', { isNested: true });
  tileStore.setNestHuabu(tile.value.id, huabu.id);
  huabuStore.openNestedHuabu(huabu.id);
}

// 嵌套画布选项：创建新 or 选择已有
const nestMode = ref<'createNew' | 'selectExisting'>('createNew');
const nestSelectHuabuId = ref<string>('');

const availableHuabus = computed(() =>
  huabuStore.huabuOrder
    .filter((id) => id !== huabuStore.activeHuabuId)
    .map((id) => ({ id, name: huabuStore.huabus.get(id)?.name ?? '未命名' }))
);

function applyNestHuabu() {
  if (!tile.value) return;
  if (nestMode.value === 'createNew') {
    createNestHuabu();
  } else {
    if (!nestSelectHuabuId.value) return;
    tileStore.setNestHuabu(tile.value.id, nestSelectHuabuId.value);
    huabuStore.openNestedHuabu(nestSelectHuabuId.value);
  }
}

// 颜色选择器
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
  if (!colorPicker.value.key) return;
  us({ [colorPicker.value.key]: color });
  colorPicker.value.visible = false;
}
</script>

<template>
  <div v-if="tile" id="rightArea_design_tile" class="rightArea_design_inner_block">
    <!-- 图形 -->
    <div class="slide_menu">
      <div class="slide_title">-图形-</div>
      <div class="slide_inner">
        <!-- 背景颜色 -->
        <div class="rightArea_inner_ability">
          <div class="flex">
            背景颜色：
            <div
              class="color-swatch"
              :style="{ backgroundColor: tile.style.backgroundColor }"
              @click="openColorPicker($event, 'backgroundColor', tile.style.backgroundColor)"
            />
          </div>
        </div>

        <!-- 背景图片 -->
        <div class="rightArea_inner_ability">
          <div>背景图片：</div>
          <div class="flex" style="margin-top: 4px">
            <div class="rightArea_button" @click="selectBgImage">选择图片</div>
            <div
              v-if="tile.style.backgroundImage"
              class="rightArea_button"
              style="margin-left: 4px"
              @click="us({ backgroundImage: null })"
            >
              删除
            </div>
          </div>
          <div v-if="tile.style.backgroundImage" class="flex" style="margin-top: 4px">
            显示模式：
            <select
              :value="tile.style.backgroundImageSet"
              @change="us({ backgroundImageSet: ($event.target as HTMLSelectElement).value })"
            >
              <option value="place">适应</option>
              <option value="stretch">拉伸</option>
              <option value="repeat">重复</option>
            </select>
          </div>
        </div>

        <!-- 背景渐变 -->
        <div class="rightArea_inner_ability">
          <div class="flex">
            背景渐变：
            <input
              type="checkbox"
              :checked="tile.style.backgroundGradient"
              @change="us({ backgroundGradient: ($event.target as HTMLInputElement).checked })"
            />
          </div>
          <template v-if="tile.style.backgroundGradient">
            <div class="flex" style="margin-top: 4px">
              方向：
              <select
                :value="tile.style.gradientDirection ?? 'top'"
                @change="us({ gradientDirection: ($event.target as HTMLSelectElement).value })"
              >
                <option value="top">向上</option>
                <option value="bottom">向下</option>
                <option value="left">向左</option>
                <option value="right">向右</option>
              </select>
            </div>
            <div class="flex" style="margin-top: 4px">
              渐变色：
              <div
                class="color-swatch"
                :style="{ backgroundColor: tile.style.gradientColor ?? '#000000' }"
                @click="
                  openColorPicker($event, 'gradientColor', tile.style.gradientColor ?? '#000000')
                "
              />
            </div>
          </template>
        </div>

        <!-- 边框 -->
        <div class="rightArea_inner_ability">
          <div>边框：</div>
          <div class="flex" style="margin-top: 4px">
            类型：
            <select
              :value="tile.style.borderStyle"
              @change="us({ borderStyle: ($event.target as HTMLSelectElement).value })"
            >
              <option value="solid">实线</option>
              <option value="dashed">虚线</option>
              <option value="dotted">点线</option>
              <option value="none">无</option>
            </select>
          </div>
          <div class="flex" style="margin-top: 4px">
            粗细：
            <input
              class="number_input"
              type="number"
              min="0"
              :value="tile.style.borderWidth"
              @change="us({ borderWidth: Number(($event.target as HTMLInputElement).value) })"
            />
          </div>
          <div class="flex" style="margin-top: 4px">
            颜色：
            <div
              class="color-swatch"
              :style="{ backgroundColor: tile.style.borderColor }"
              @click="openColorPicker($event, 'borderColor', tile.style.borderColor)"
            />
          </div>
          <div class="flex" style="margin-top: 4px">
            弧度：
            <input
              class="number_input"
              type="number"
              min="0"
              :value="tile.style.borderRadius"
              @change="us({ borderRadius: Number(($event.target as HTMLInputElement).value) })"
            />
          </div>
        </div>

        <!-- 位置 -->
        <div class="rightArea_inner_ability">
          <div class="flex">
            磁贴位置：
            <div>
              <div class="flex">
                <input
                  class="number_input"
                  type="number"
                  :value="Math.round(tile.style.left)"
                  @change="us({ left: Number(($event.target as HTMLInputElement).value) })"
                />
                <div>　左</div>
              </div>
              <div class="flex">
                <input
                  class="number_input"
                  type="number"
                  :value="Math.round(tile.style.top)"
                  @change="us({ top: Number(($event.target as HTMLInputElement).value) })"
                />
                <div>　上</div>
              </div>
            </div>
          </div>
          <div class="flex" style="margin-top: 4px">
            旋转角度：
            <input
              class="number_input"
              type="number"
              :value="tile.style.angle"
              @change="us({ angle: Number(($event.target as HTMLInputElement).value) })"
            />
          </div>
        </div>

        <!-- 大小 -->
        <div class="rightArea_inner_ability">
          <div class="flex">
            磁贴大小：
            <div>
              <div class="flex">
                <input
                  class="number_input"
                  type="number"
                  :value="Math.round(tile.style.width)"
                  @change="
                    tileStore.resizeTile(
                      tile.id,
                      Number(($event.target as HTMLInputElement).value),
                      tile.style.height
                    )
                  "
                />
                <div>　宽</div>
              </div>
              <div class="flex">
                <input
                  class="number_input"
                  type="number"
                  :value="Math.round(tile.style.height)"
                  @change="
                    tileStore.resizeTile(
                      tile.id,
                      tile.style.width,
                      Number(($event.target as HTMLInputElement).value)
                    )
                  "
                />
                <div>　高</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 层叠 -->
        <div class="rightArea_inner_ability">
          <div class="flex">
            当前层叠：{{ tile.style.zIndex }}
            <div class="rightArea_button" @click="us({ zIndex: tile.style.zIndex + 1 })">↑</div>
            <div
              class="rightArea_button"
              @click="us({ zIndex: Math.max(1, tile.style.zIndex - 1) })"
            >
              ↓
            </div>
          </div>
        </div>

        <!-- 锁定 -->
        <div class="rightArea_inner_ability">
          <div>
            锁定磁贴
            <input
              type="checkbox"
              :checked="tile.props.lock"
              @change="tileStore.toggleLock(tile.id)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 文本 -->
    <div class="slide_menu">
      <div class="slide_title">-文本-</div>
      <div class="slide_inner">
        <!-- 标题 -->
        <div class="rightArea_inner_ability">
          <div>
            磁贴标题：
            <input
              type="text"
              :value="tile.title"
              @input="tileStore.updateTitle(tile.id, ($event.target as HTMLInputElement).value)"
            />
          </div>
          <div class="flex" style="margin-top: 4px">
            显示标题
            <input
              type="checkbox"
              :checked="tile.props.showTitle"
              @change="up({ showTitle: ($event.target as HTMLInputElement).checked })"
            />
          </div>
          <div class="flex">
            自动换行
            <input
              type="checkbox"
              :checked="tile.props.wrapTitle"
              @change="up({ wrapTitle: ($event.target as HTMLInputElement).checked })"
            />
          </div>
        </div>

        <!-- 字体 -->
        <div class="rightArea_inner_ability">
          <div class="flex">
            字体大小：
            <input
              class="number_input"
              type="number"
              :value="tile.style.fontSize"
              @change="us({ fontSize: Number(($event.target as HTMLInputElement).value) })"
            />
          </div>
          <div class="flex" style="margin-top: 4px">
            字体颜色：
            <div
              class="color-swatch"
              :style="{ backgroundColor: tile.style.titleColor }"
              @click="openColorPicker($event, 'titleColor', tile.style.titleColor)"
            />
          </div>
          <div class="flex" style="margin-top: 4px">
            对齐：
            <div
              class="rightArea_squre_button font-btn align-left"
              :class="{ active: tile.style.titleAlign === 'left' }"
              @click="us({ titleAlign: 'left' })"
            ></div>
            <div
              class="rightArea_squre_button font-btn align-center"
              :class="{ active: tile.style.titleAlign === 'center' }"
              @click="us({ titleAlign: 'center' })"
            ></div>
            <div
              class="rightArea_squre_button font-btn align-right"
              :class="{ active: tile.style.titleAlign === 'right' }"
              @click="us({ titleAlign: 'right' })"
            ></div>
          </div>
          <div class="flex" style="margin-top: 4px">
            样式：
            <div
              class="rightArea_squre_button font-btn font-bold"
              :class="{ active: tile.style.fontBold }"
              @click="us({ fontBold: !tile.style.fontBold })"
            ></div>
            <div
              class="rightArea_squre_button font-btn font-italic"
              :class="{ active: tile.style.fontItalic }"
              @click="us({ fontItalic: !tile.style.fontItalic })"
            ></div>
            <div
              class="rightArea_squre_button font-btn font-underline"
              :class="{ active: tile.style.fontUnderline }"
              @click="us({ fontUnderline: !tile.style.fontUnderline })"
            ></div>
            <div
              class="rightArea_squre_button font-btn font-strikeline"
              :class="{ active: tile.style.fontStrikeline }"
              @click="us({ fontStrikeline: !tile.style.fontStrikeline })"
            ></div>
            <div
              class="rightArea_squre_button font-btn font-overline"
              :class="{ active: tile.style.fontOverline }"
              @click="us({ fontOverline: !tile.style.fontOverline })"
            ></div>
          </div>
        </div>

        <!-- 阴影 -->
        <div class="rightArea_inner_ability">
          <div class="flex">
            文字阴影：
            <input
              type="checkbox"
              :checked="tile.style.shadowEnabled"
              @change="us({ shadowEnabled: ($event.target as HTMLInputElement).checked })"
            />
          </div>
          <template v-if="tile.style.shadowEnabled">
            <div class="flex" style="margin-top: 4px">
              颜色：
              <div
                class="color-swatch"
                :style="{ backgroundColor: tile.style.shadowColor }"
                @click="openColorPicker($event, 'shadowColor', tile.style.shadowColor)"
              />
            </div>
            <div class="flex" style="margin-top: 4px">
              X偏移：
              <input
                class="number_input"
                type="number"
                :value="tile.style.shadowX"
                @change="us({ shadowX: Number(($event.target as HTMLInputElement).value) })"
              />
            </div>
            <div class="flex" style="margin-top: 4px">
              Y偏移：
              <input
                class="number_input"
                type="number"
                :value="tile.style.shadowY"
                @change="us({ shadowY: Number(($event.target as HTMLInputElement).value) })"
              />
            </div>
            <div class="flex" style="margin-top: 4px">
              模糊：
              <input
                class="number_input"
                type="number"
                min="0"
                :value="tile.style.shadowBlur"
                @change="us({ shadowBlur: Number(($event.target as HTMLInputElement).value) })"
              />
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- 内容 -->
    <div class="slide_menu">
      <div class="slide_title">-内容-</div>
      <div class="slide_inner">
        <!-- 嵌套画布 -->
        <div class="rightArea_inner_ability">
          <div>嵌套画布</div>
          <div v-if="!tile.nestHuabuId" style="margin-top: 4px">
            <div class="flex" style="gap: 6px; margin-bottom: 4px">
              <label class="flex" style="gap: 3px">
                <input v-model="nestMode" type="radio" value="createNew" />创建新画布
              </label>
              <label class="flex" style="gap: 3px">
                <input v-model="nestMode" type="radio" value="selectExisting" />选择已有
              </label>
            </div>
            <div v-if="nestMode === 'selectExisting'" style="margin-bottom: 4px">
              <select v-model="nestSelectHuabuId" style="width: 100%">
                <option value="">请选择画布</option>
                <option v-for="h in availableHuabus" :key="h.id" :value="h.id">{{ h.name }}</option>
              </select>
            </div>
            <div class="rightArea_button" @click="applyNestHuabu">嵌套画布</div>
          </div>
          <div v-else style="margin-top: 4px">
            <div class="flex" style="gap: 4px">
              <div class="rightArea_button" @click="huabuStore.openNestedHuabu(tile.nestHuabuId!)">
                进入画布
              </div>
              <div class="rightArea_button" @click="tileStore.setNestHuabu(tile.id, null)">
                删除嵌套
              </div>
            </div>
          </div>
          <div v-if="tile.nestHuabuId" class="flex" style="margin-top: 4px">
            打开方式：
            <select
              :value="tile.props.nestOpenMode"
              @change="up({ nestOpenMode: ($event.target as HTMLSelectElement).value })"
            >
              <option value="dbclick">双击</option>
              <option value="button">按钮</option>
              <option value="none">不打开</option>
            </select>
          </div>
        </div>

        <!-- 超链接 -->
        <div class="rightArea_inner_ability">
          <div class="flex">
            超链接：
            <input
              type="checkbox"
              :checked="!!tile.link"
              @change="
                tileStore.setLink(tile.id, ($event.target as HTMLInputElement).checked ? '' : null)
              "
            />
          </div>
          <div v-if="tile.link !== null" style="margin-top: 4px">
            <input
              type="text"
              :value="tile.link ?? ''"
              placeholder="输入链接..."
              @change="tileStore.setLink(tile.id, ($event.target as HTMLInputElement).value)"
            />
          </div>
        </div>

        <!-- 注释 -->
        <div class="rightArea_inner_ability">
          <div class="flex">
            注释（tooltip）：
            <input
              type="checkbox"
              :checked="tile.props.annotationEnabled"
              @change="up({ annotationEnabled: ($event.target as HTMLInputElement).checked })"
            />
          </div>
          <div v-if="tile.props.annotationEnabled" style="margin-top: 4px">
            <input
              type="text"
              :value="tile.props.annotation"
              placeholder="注释内容..."
              @input="up({ annotation: ($event.target as HTMLInputElement).value })"
            />
          </div>
        </div>

        <!-- 内容块设置 -->
        <div class="rightArea_inner_ability">
          <div>内容块设置：</div>
          <div class="flex" style="margin-top: 4px">
            显示方式：
            <select
              :value="tile.props.textblockShowState"
              @change="up({ textblockShowState: ($event.target as HTMLSelectElement).value })"
            >
              <option value="normal">悬停显示</option>
              <option value="enternalShow">永久显示</option>
              <option value="enternalHide">永久隐藏</option>
            </select>
          </div>
          <div class="flex" style="margin-top: 4px">
            绑定磁贴：
            <input
              type="checkbox"
              :checked="tile.props.textblockBind"
              @change="up({ textblockBind: ($event.target as HTMLInputElement).checked })"
            />
          </div>
          <div class="flex" style="margin-top: 4px">
            垂直位置：
            <select
              :value="tile.props.textblockVertical"
              @change="up({ textblockVertical: ($event.target as HTMLSelectElement).value })"
            >
              <option value="top">上方</option>
              <option value="center">中间</option>
              <option value="bottom">下方</option>
            </select>
          </div>
          <div class="flex" style="margin-top: 4px">
            水平位置：
            <select
              :value="tile.props.textblockHorizontal"
              @change="up({ textblockHorizontal: ($event.target as HTMLSelectElement).value })"
            >
              <option value="left">左侧</option>
              <option value="left_edge">左边缘</option>
              <option value="center">居中</option>
              <option value="right_edge">右边缘</option>
              <option value="right">右侧</option>
            </select>
          </div>
        </div>
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

.rightArea_squre_button {
  width: 35px;
  height: 35px;
  border: 1px solid var(--border-color);
  border-radius: 3px;
  margin-right: 4px;
  box-sizing: border-box;
  background-color: var(--color-2);
  background-size: 80%;
  background-repeat: no-repeat;
  background-position: center center;
  cursor: pointer;

  &:hover {
    background-color: var(--color-3);
  }
  &.active {
    background-color: var(--color-4);
  }
}

.font-btn {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
}

.font-bold {
  background-image: url('../../assets/img/font_bold.png');
}
.font-italic {
  background-image: url('../../assets/img/font_italic.png');
}
.font-underline {
  background-image: url('../../assets/img/underline.png');
}
.font-strikeline {
  background-image: url('../../assets/img/strikeline.png');
}
.font-overline {
  background-image: url('../../assets/img/overline.png');
}
.align-left {
  background-image: url('../../assets/img/align_left.png');
}
.align-center {
  background-image: url('../../assets/img/align_center.png');
}
.align-right {
  background-image: url('../../assets/img/align_right.png');
}
</style>
