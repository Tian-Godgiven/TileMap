export type LineType = 'straight' | 'bezier' | 'flowchart';
export type LineStyle = 'solid' | 'dashed' | 'dotted' | 'dotdash';
export type ArrowType = 'none' | 'arrow';

export interface LineStyleConfig {
  type: LineType;
  style: LineStyle;
  color: string;
  width: number;
  startArrow: ArrowType;
  endArrow: ArrowType;
}

export interface Line {
  id: string;
  startTileId: string;
  endTileId: string;
  style: LineStyleConfig;
  text: string;
}
