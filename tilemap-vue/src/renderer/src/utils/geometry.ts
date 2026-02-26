import type { Tile } from '../types';

export interface Point {
  x: number;
  y: number;
}

export interface AnchorPoint {
  left: number;
  top: number;
}

/**
 * 计算两个磁贴之间的锚点位置
 * 根据两个磁贴的相对位置，选择合适的锚点（上下左右）
 */
export function calculateAnchorPoints(
  tileA: Tile,
  tileB: Tile
): { anchorA: AnchorPoint; anchorB: AnchorPoint } {
  const aLeft = tileA.style.left;
  const aTop = tileA.style.top;
  const aWidth = tileA.style.width;
  const aHeight = tileA.style.height;

  const bLeft = tileB.style.left;
  const bTop = tileB.style.top;
  const bWidth = tileB.style.width;
  const bHeight = tileB.style.height;

  // 计算两点中心的差值
  const disX = aLeft + aWidth / 2 - (bLeft + bWidth / 2);
  const disY = aTop + aHeight / 2 - (bTop + bHeight / 2);

  let anchorA: AnchorPoint;
  let anchorB: AnchorPoint;

  // 如果 x 轴差大于 y 轴差，则在左右
  if (Math.abs(disX) >= Math.abs(disY)) {
    if (disX < 0) {
      // A 在 B 左边，A 用右锚点，B 用左锚点
      anchorA = { left: aLeft + aWidth, top: aTop + aHeight / 2 };
      anchorB = { left: bLeft, top: bTop + bHeight / 2 };
    } else {
      // A 在 B 右边，A 用左锚点，B 用右锚点
      anchorA = { left: aLeft, top: aTop + aHeight / 2 };
      anchorB = { left: bLeft + bWidth, top: bTop + bHeight / 2 };
    }
  } else {
    // y 轴差大于 x 轴差，则在上下
    if (disY < 0) {
      // A 在 B 上方，A 用下锚点，B 用上锚点
      anchorA = { left: aLeft + aWidth / 2, top: aTop + aHeight };
      anchorB = { left: bLeft + bWidth / 2, top: bTop };
    } else {
      // A 在 B 下方，A 用上锚点，B 用下锚点
      anchorA = { left: aLeft + aWidth / 2, top: aTop };
      anchorB = { left: bLeft + bWidth / 2, top: bTop + bHeight };
    }
  }

  return { anchorA, anchorB };
}

/**
 * 生成贝塞尔曲线的控制点
 */
function calculateBezierControlPoints(
  p0: Point,
  p3: Point,
  disX: number,
  disY: number
): [Point, Point] {
  const center = {
    x: (p0.x + p3.x) / 2,
    y: (p0.y + p3.y) / 2
  };

  const distanceX = (p0.x + p3.x) / 3;
  const distanceY = (p0.y + p3.y) / 3;

  let distanceXP1: number, distanceYP1: number;
  let distanceXP2: number, distanceYP2: number;

  if (Math.abs(disX) >= Math.abs(disY)) {
    if (disX < 0) {
      if (disY > 0) {
        distanceXP1 = distanceX;
        distanceYP1 = distanceY;
        distanceXP2 = -distanceX;
        distanceYP2 = -distanceY;
      } else {
        distanceXP1 = distanceX;
        distanceYP1 = -distanceY;
        distanceXP2 = -distanceX;
        distanceYP2 = distanceY;
      }
    } else {
      if (disY > 0) {
        distanceXP1 = -distanceX;
        distanceYP1 = distanceY;
        distanceXP2 = distanceX;
        distanceYP2 = -distanceY;
      } else {
        distanceXP1 = -distanceX;
        distanceYP1 = -distanceY;
        distanceXP2 = distanceX;
        distanceYP2 = distanceY;
      }
    }
  } else {
    if (disY < 0) {
      if (disX > 0) {
        distanceXP1 = distanceX;
        distanceYP1 = distanceY;
        distanceXP2 = -distanceX;
        distanceYP2 = -distanceY;
      } else {
        distanceXP1 = -distanceX;
        distanceYP1 = distanceY;
        distanceXP2 = distanceX;
        distanceYP2 = -distanceY;
      }
    } else {
      if (disX > 0) {
        distanceXP1 = distanceX;
        distanceYP1 = -distanceY;
        distanceXP2 = -distanceX;
        distanceYP2 = distanceY;
      } else {
        distanceXP1 = -distanceX;
        distanceYP1 = -distanceY;
        distanceXP2 = distanceX;
        distanceYP2 = distanceY;
      }
    }
  }

  const p1 = {
    x: center.x + distanceXP1,
    y: center.y + distanceYP1
  };
  const p2 = {
    x: center.x + distanceXP2,
    y: center.y + distanceYP2
  };

  return [p1, p2];
}

/**
 * 生成折线路径
 */
function calculateFlowchartPath(pointA: Point, pointB: Point, disX: number, disY: number): string {
  const x1 = pointA.x;
  const y1 = pointA.y;
  const x2 = pointB.x;
  const y2 = pointB.y;

  const deltaX = (x1 - x2) / 2;
  const deltaY = (y1 - y2) / 2;

  let p1X: number, p1Y: number, p2X: number, p2Y: number;

  if (Math.abs(disX) >= Math.abs(disY)) {
    p1X = x1 - deltaX;
    p1Y = y1;
    p2X = x1 - deltaX;
    p2Y = y2;
  } else {
    p1X = x1;
    p1Y = y1 - deltaY;
    p2X = x2;
    p2Y = y1 - deltaY;
  }

  return `M${x1},${y1} L${p1X},${p1Y} L${p2X},${p2Y} L${x2},${y2}`;
}

/**
 * 根据连线类型和锚点生成 SVG path 的 d 属性
 */
export function generateLinePath(
  tileA: Tile,
  tileB: Tile,
  lineType: 'straight' | 'bezier' | 'flowchart'
): string {
  const { anchorA, anchorB } = calculateAnchorPoints(tileA, tileB);

  const x1 = anchorA.left;
  const y1 = anchorA.top;
  const x2 = anchorB.left;
  const y2 = anchorB.top;

  const disX =
    tileA.style.left + tileA.style.width / 2 - (tileB.style.left + tileB.style.width / 2);
  const disY =
    tileA.style.top + tileA.style.height / 2 - (tileB.style.top + tileB.style.height / 2);

  if (lineType === 'straight') {
    return `M${x1},${y1} L${x2},${y2}`;
  }

  if (lineType === 'flowchart') {
    return calculateFlowchartPath({ x: x1, y: y1 }, { x: x2, y: y2 }, disX, disY);
  }

  // bezier (default)
  const p0 = { x: x1, y: y1 };
  const p3 = { x: x2, y: y2 };
  const [p1, p2] = calculateBezierControlPoints(p0, p3, disX, disY);
  return `M${x1},${y1} C${p1.x},${p1.y} ${p2.x},${p2.y} ${x2},${y2}`;
}
