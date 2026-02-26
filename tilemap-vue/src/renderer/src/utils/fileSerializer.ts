import type { Huabu, Tile, Line } from '../types';

export interface TilemapFileJson {
  tilemap: {
    information: string;
    huabuOrder: string[];
    huabus: Record<string, Huabu>;
    tiles: Record<string, Tile>;
    lines: Record<string, Line>;
  };
}

/**
 * 将 store 状态序列化为文件 JSON
 */
export function serializeToJson(
  huabus: Map<string, Huabu>,
  huabuOrder: string[],
  tiles: Map<string, Tile>,
  lines: Map<string, Line>,
  information = ''
): TilemapFileJson {
  const huabusObj: Record<string, Huabu> = {};
  huabus.forEach((v, k) => {
    huabusObj[k] = v;
  });

  const tilesObj: Record<string, Tile> = {};
  tiles.forEach((v, k) => {
    tilesObj[k] = v;
  });

  const linesObj: Record<string, Line> = {};
  lines.forEach((v, k) => {
    linesObj[k] = v;
  });

  return {
    tilemap: {
      information,
      huabuOrder,
      huabus: huabusObj,
      tiles: tilesObj,
      lines: linesObj
    }
  };
}

/**
 * 从文件 JSON 反序列化，恢复 store 状态
 */
export function deserializeFromJson(json: TilemapFileJson): {
  huabus: Map<string, Huabu>;
  huabuOrder: string[];
  tiles: Map<string, Tile>;
  lines: Map<string, Line>;
} {
  const { huabus, huabuOrder, tiles, lines } = json.tilemap;

  const huabusMap = new Map<string, Huabu>();
  Object.entries(huabus ?? {}).forEach(([k, v]) => huabusMap.set(k, v));

  const tilesMap = new Map<string, Tile>();
  Object.entries(tiles ?? {}).forEach(([k, v]) => tilesMap.set(k, v));

  const linesMap = new Map<string, Line>();
  Object.entries(lines ?? {}).forEach(([k, v]) => linesMap.set(k, v));

  return {
    huabus: huabusMap,
    huabuOrder: huabuOrder ?? [],
    tiles: tilesMap,
    lines: linesMap
  };
}
