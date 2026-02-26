import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Huabu, HuabuStyle, HuabuGrid } from '../types';

function createId(): string {
  return `huabu_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function defaultStyle(): HuabuStyle {
  return {
    width: 2000,
    height: 1500,
    backgroundColor: '#ffffff',
    backgroundImage: null,
    backgroundImageSet: null
  };
}

function defaultGrid(): HuabuGrid {
  return {
    show: false,
    size: 20,
    color: '#e0e0e0'
  };
}

export const useHuabuStore = defineStore('huabu', () => {
  // 所有画布，扁平存储
  const huabus = ref<Map<string, Huabu>>(new Map());
  // 顶层画布的 tab 顺序（嵌套画布不在此列表中）
  const huabuOrder = ref<string[]>([]);
  // 当前激活的画布 ID
  const activeHuabuId = ref<string | null>(null);
  // 面包屑导航栈（进入嵌套画布时 push，返回时 pop）
  const breadcrumb = ref<string[]>([]);

  // --- Getters ---

  const activeHuabu = computed(() =>
    activeHuabuId.value ? (huabus.value.get(activeHuabuId.value) ?? null) : null
  );

  const tabHuabus = computed(() =>
    huabuOrder.value.map((id) => huabus.value.get(id)!).filter(Boolean)
  );

  // 面包屑路径：[根画布, ..., 当前画布]
  const breadcrumbHuabus = computed(() =>
    breadcrumb.value.map((id) => huabus.value.get(id)!).filter(Boolean)
  );

  // --- Actions ---

  function createHuabu(name: string, options?: Partial<Huabu>): Huabu {
    const id = createId();
    const huabu: Huabu = {
      id,
      name,
      scale: 1,
      panX: 0,
      panY: 0,
      style: defaultStyle(),
      grid: defaultGrid(),
      tileIds: [],
      lineIds: [],
      compositeIds: [],
      isNested: false,
      nestFromTileId: null,
      parentHuabuId: null,
      ...options
    };
    huabus.value.set(id, huabu);
    if (!huabu.isNested) {
      huabuOrder.value.push(id);
    }
    return huabu;
  }

  function deleteHuabu(id: string): void {
    huabus.value.delete(id);
    const idx = huabuOrder.value.indexOf(id);
    if (idx !== -1) huabuOrder.value.splice(idx, 1);
    // 如果删除的是当前激活画布，切换到第一个
    if (activeHuabuId.value === id) {
      activeHuabuId.value = huabuOrder.value[0] ?? null;
      breadcrumb.value = activeHuabuId.value ? [activeHuabuId.value] : [];
    }
  }

  function switchHuabu(id: string): void {
    if (!huabus.value.has(id)) return;
    activeHuabuId.value = id;
    breadcrumb.value = [id];
  }

  function renameHuabu(id: string, name: string): void {
    const huabu = huabus.value.get(id);
    if (huabu) huabu.name = name;
  }

  function setScale(id: string, scale: number): void {
    const huabu = huabus.value.get(id);
    if (huabu) huabu.scale = Math.max(0.1, Math.min(5, scale));
  }

  function setPan(id: string, panX: number, panY: number): void {
    const huabu = huabus.value.get(id);
    if (huabu) {
      huabu.panX = panX;
      huabu.panY = panY;
    }
  }

  function updateStyle(id: string, style: Partial<HuabuStyle>): void {
    const huabu = huabus.value.get(id);
    if (huabu) Object.assign(huabu.style, style);
  }

  function updateGrid(id: string, grid: Partial<HuabuGrid>): void {
    const huabu = huabus.value.get(id);
    if (huabu) Object.assign(huabu.grid, grid);
  }

  // 进入嵌套画布（面包屑 push）
  function openNestedHuabu(nestedId: string): void {
    if (!huabus.value.has(nestedId)) return;
    activeHuabuId.value = nestedId;
    breadcrumb.value.push(nestedId);
  }

  // 返回面包屑中的某一级
  function returnToBreadcrumb(id: string): void {
    const idx = breadcrumb.value.indexOf(id);
    if (idx === -1) return;
    breadcrumb.value = breadcrumb.value.slice(0, idx + 1);
    activeHuabuId.value = id;
  }

  function addTileId(huabuId: string, tileId: string): void {
    huabus.value.get(huabuId)?.tileIds.push(tileId);
  }

  function removeTileId(huabuId: string, tileId: string): void {
    const huabu = huabus.value.get(huabuId);
    if (huabu) huabu.tileIds = huabu.tileIds.filter((id) => id !== tileId);
  }

  function addLineId(huabuId: string, lineId: string): void {
    huabus.value.get(huabuId)?.lineIds.push(lineId);
  }

  function removeLineId(huabuId: string, lineId: string): void {
    const huabu = huabus.value.get(huabuId);
    if (huabu) huabu.lineIds = huabu.lineIds.filter((id) => id !== lineId);
  }

  function addCompositeId(huabuId: string, compositeId: string): void {
    huabus.value.get(huabuId)?.compositeIds.push(compositeId);
  }

  function removeCompositeId(huabuId: string, compositeId: string): void {
    const huabu = huabus.value.get(huabuId);
    if (huabu) huabu.compositeIds = huabu.compositeIds.filter((id) => id !== compositeId);
  }

  // 复制画布
  function copyHuabu(huabuId: string, copyTiles: boolean = true): Huabu | null {
    const source = huabus.value.get(huabuId);
    if (!source) return null;

    // 生成副本名称
    let cloneName = source.name + '的副本';
    let cloneNum = 1;
    while (Array.from(huabus.value.values()).some((h) => h.name === cloneName)) {
      cloneName = source.name + `的副本(${cloneNum})`;
      cloneNum++;
    }

    const newHuabu = createHuabu(cloneName);
    newHuabu.style = { ...source.style };
    newHuabu.grid = { ...source.grid };

    if (copyTiles) {
      const { useTileStore } = require('./tileStore');
      const { useLineStore } = require('./lineStore');
      const tileStore = useTileStore();
      const lineStore = useLineStore();

      const tileIdMap = new Map<string, string>();
      for (const oldTileId of source.tileIds) {
        const oldTile = tileStore.tiles.get(oldTileId);
        if (!oldTile) continue;
        const newTileId = `tile_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        tileStore.tiles.set(newTileId, {
          ...oldTile,
          id: newTileId,
          lineIds: [],
          nestHuabuId: null
        });
        newHuabu.tileIds.push(newTileId);
        tileIdMap.set(oldTileId, newTileId);
      }

      for (const oldLineId of source.lineIds) {
        const oldLine = lineStore.lines.get(oldLineId);
        if (!oldLine) continue;
        const newStartId = tileIdMap.get(oldLine.startTileId);
        const newEndId = tileIdMap.get(oldLine.endTileId);
        if (!newStartId || !newEndId) continue;
        const newLineId = `line_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        lineStore.lines.set(newLineId, {
          ...oldLine,
          id: newLineId,
          startTileId: newStartId,
          endTileId: newEndId
        });
        newHuabu.lineIds.push(newLineId);
        const st = tileStore.tiles.get(newStartId);
        const et = tileStore.tiles.get(newEndId);
        if (st) st.lineIds.push(newLineId);
        if (et) et.lineIds.push(newLineId);
      }
    }

    return newHuabu;
  }

  // 清空画布（删除所有磁贴和连线）
  function clearHuabu(huabuId: string): void {
    const huabu = huabus.value.get(huabuId);
    if (!huabu) return;
    const { useTileStore } = require('./tileStore');
    const { useLineStore } = require('./lineStore');
    const tileStore = useTileStore();
    const lineStore = useLineStore();
    for (const lineId of [...huabu.lineIds]) lineStore.deleteLine(lineId);
    huabu.lineIds = [];
    for (const tileId of [...huabu.tileIds]) tileStore.deleteTile(tileId);
    huabu.tileIds = [];
  }

  // 初始化：创建第一个默认画布
  function init(): void {
    if (huabuOrder.value.length === 0) {
      const first = createHuabu('画布 1');
      switchHuabu(first.id);
    }
  }

  return {
    huabus,
    huabuOrder,
    activeHuabuId,
    breadcrumb,
    activeHuabu,
    tabHuabus,
    breadcrumbHuabus,
    createHuabu,
    deleteHuabu,
    switchHuabu,
    renameHuabu,
    setScale,
    setPan,
    updateStyle,
    updateGrid,
    openNestedHuabu,
    returnToBreadcrumb,
    addTileId,
    removeTileId,
    addLineId,
    removeLineId,
    addCompositeId,
    removeCompositeId,
    copyHuabu,
    clearHuabu,
    init
  };
});
