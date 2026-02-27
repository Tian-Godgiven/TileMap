# 开发进度记录 2026-02-26

## 本次完成的工作

### 1. 对象库加载修复
- `fileHandlers.ts` 中 `getLibDir` 改为开发用 `app.getAppPath()/resources`，生产用 `process.resourcesPath`
- 兼容旧格式文件（`file_head/file_data` 包装）
- 在 `resources/object_lib/` 下创建了初始集合文件：
  - `default_lib/1_通用_lib.tilemap` — 6个基础磁贴模板
  - `default_lib/模板_lib.tilemap` — 空集合
  - `quickUse_lib/quickUse.tilemap` — 快速使用空集合

### 2. 拖拽到画布修复
- `ObjectCollection.vue` 中 `dropObjectOnCanvas` 修复了 `huabu.pan.x/y` → `huabu.panX/panY`

### 3. 左侧面板样式修复
- 连线模式按钮：左侧主按钮 + 右侧35px箭头按钮，Ctrl+L 提示
- 搜索栏：搜索/清除图标按钮，折叠全部按钮
- 连线样式面板：绝对定位飞出菜单，从左侧面板右边展开

### 4. ColorPicker 修复与美化
- 修复初始化时机：从 `onMounted` 移到 `watch(visible)`，因为 `v-if` 关闭时 DOM 不存在
- 修复第二次打开色轮消失：关闭时将 `colorPicker = null`，每次打开重新创建实例
- 修复颜色块显示透明：非 `transparent` 颜色设置 `backgroundImage: 'none'` 覆盖棋盘格背景
- 样式美化：宽度 290px，圆角8px，阴影，颜色预览 swatch，按钮圆角，应用按钮高亮色
- iro 实例参数：`width: 160, margin: 6, layoutDirection: 'horizontal'`

### 5. ColorPicker 边界检测
- 4个文件统一修复：`RightDesignTile.vue`, `RightDesignHuabu.vue`, `TileContextMenu.vue`, `LineContextMenu.vue`
- 逻辑：右侧空间不足时改为在元素左侧弹出，y 坐标限制防止超出底部

---

## 待续工作

- [ ] 右侧面板整体样式对比原版，继续修复差异
- [ ] 对象集合预览图（目前只显示 backgroundColor，原版可能有更多样式）
- [ ] 其他菜单组件样式检查（TopBar、HuabuArea 等）
- [ ] 整体视觉对比截图，逐一排查剩余差异

---

## 关键文件路径

| 文件 | 说明 |
|------|------|
| `src/main/ipc/fileHandlers.ts` | 文件读写 IPC，对象库路径逻辑 |
| `src/renderer/src/components/common/ColorPicker.vue` | 颜色选择器 |
| `src/renderer/src/components/layout/LeftPanel.vue` | 左侧面板 |
| `src/renderer/src/components/left/ObjectCollection.vue` | 对象集合组件 |
| `src/renderer/src/components/right/RightDesignTile.vue` | 磁贴样式面板 |
| `src/renderer/src/components/right/RightDesignHuabu.vue` | 画布样式面板 |
| `src/renderer/src/assets/base.scss` | CSS 变量（主题色） |
| `src/renderer/src/assets/main.scss` | 全局样式 |
| `resources/object_lib/` | 对象库文件目录 |
