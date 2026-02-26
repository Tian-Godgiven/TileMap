import type { Tile } from './tile';
import type { Huabu } from './huabu';
import type { Line } from './line';

export interface FileHead {
  app: 'tilemap';
  appVersion: string;
  createTime: string;
}

// 序列化后存入文件的格式（与运行时类型相同，方便直接 JSON.stringify）
export interface TilemapFileData {
  huabus: Huabu[];
  tiles: Tile[];
  lines: Line[];
  // 当前激活的画布 ID
  activeHuabuId: string | null;
  // 画布 tab 顺序
  huabuOrder: string[];
}

export interface TilemapFile {
  fileHead: FileHead;
  fileType: 'tilemap';
  fileData: TilemapFileData;
}
