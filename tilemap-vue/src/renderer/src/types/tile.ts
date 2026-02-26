import type { JSONContent } from '@tiptap/vue-3';

export interface TileStyle {
  left: number;
  top: number;
  width: number;
  height: number;
  zIndex: number;
  angle: number;
  // 背景
  backgroundColor: string;
  backgroundImage: string | null;
  backgroundImageSet: 'place' | 'stretch' | 'repeat';
  backgroundGradient: boolean;
  gradientDirection: string | null;
  gradientColor: string | null;
  // 边框
  borderStyle: string;
  borderWidth: number;
  borderColor: string;
  borderRadius: number;
  // 字体
  fontSize: number;
  titleColor: string;
  titleAlign: 'left' | 'center' | 'right';
  titleHorizontal: string;
  titleVertical: string;
  fontFamily: string;
  fontBold: boolean;
  fontItalic: boolean;
  fontVertical: boolean;
  fontOverline: boolean;
  fontStrikeline: boolean;
  fontUnderline: boolean;
  // 阴影
  shadowEnabled: boolean;
  shadowColor: string;
  shadowX: number;
  shadowY: number;
  shadowBlur: number;
}

export interface TileProps {
  lock: boolean;
  showTitle: boolean;
  wrapTitle: boolean;
  contentPanelPinned: boolean;
  nestOpenMode: 'dbclick' | 'button' | 'none';
  sizeLimit: false | number;
  // 注释
  annotationEnabled: boolean;
  annotation: string;
  // textblock
  textblockShowState: 'normal' | 'enternalShow' | 'enternalHide';
  textblockBind: boolean;
  textblockWidth: number;
  textblockHeight: number;
  textblockVertical: 'top' | 'center' | 'bottom';
  textblockHorizontal: 'left' | 'left_edge' | 'center' | 'right_edge' | 'right';
  disableLinkPopup: boolean;
}

export interface Tile {
  id: string;
  title: string;
  content: JSONContent | null; // Tiptap JSON
  style: TileStyle;
  props: TileProps;
  lineIds: string[]; // 连接到此磁贴的连线 ID
  nestHuabuId: string | null; // 嵌套画布的 ID
  link: string | null; // 超链接
}
