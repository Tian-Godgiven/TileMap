export interface CompositeStyle {
  left: number;
  top: number;
  width: number;
  height: number;
  zIndex: number;
}

export interface TileRelativePosition {
  left: string; // percentage, e.g., "25%"
  top: string;
  width: string;
  height: string;
}

export interface Composite {
  id: string;
  style: CompositeStyle;
  tileIds: string[];
  lineIds: string[];
  tileRelPositions: Record<string, TileRelativePosition>;
  isTemp: boolean;
}
