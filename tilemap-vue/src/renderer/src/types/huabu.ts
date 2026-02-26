export interface HuabuStyle {
  width: number;
  height: number;
  backgroundColor: string;
  backgroundImage: string | null;
  backgroundImageSet: 'place' | 'stretch' | 'repeat' | null;
}

export interface HuabuGrid {
  show: boolean;
  size: number;
  color: string;
}

export interface Huabu {
  id: string;
  name: string;
  // 视口变换
  scale: number;
  panX: number;
  panY: number;
  style: HuabuStyle;
  grid: HuabuGrid;
  // 内容
  tileIds: string[];
  lineIds: string[];
  compositeIds: string[];
  // 嵌套关系
  isNested: boolean;
  nestFromTileId: string | null; // 哪个磁贴嵌套了此画布
  parentHuabuId: string | null; // 父画布 ID，用于面包屑导航
}
