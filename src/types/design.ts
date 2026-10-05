export type PresetId =
  | 'custom'
  | 'instagram-square'
  | 'instagram-story'
  | 'youtube-thumbnail'
  | 'twitter-post'
  | 'twitter-header'
  | 'linkedin-post'
  | 'facebook-post'
  | 'pinterest-pin';

export interface CanvasPreset {
  id: PresetId;
  name: string;
  width: number;
  height: number;
  aspectRatio: string;
  category: 'Social' | 'Video' | 'Cover' | 'Pinterest' | 'Custom';
  icon: string;
  description: string;
}

export type ElementType = 'text' | 'shape' | 'image' | 'sticker' | 'badge' | 'drawing';

export type AnimationType = 'none' | 'fade' | 'pop' | 'slide' | 'pulse' | 'glow';

export interface BaseElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number; // degrees
  opacity?: number; // 0 to 1
  locked?: boolean;
  zIndex: number;
  animation?: AnimationType;
}

export type TextEffect = 'none' | 'shadow' | 'lift' | 'hollow' | 'splice' | 'echo' | 'glitch' | 'neon';

export interface TextElement extends BaseElement {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: number | string;
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline' | 'line-through';
  color: string;
  textAlign: 'left' | 'center' | 'right';
  letterSpacing?: number;
  lineHeight?: number;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  effect?: TextEffect;
  effectIntensity?: number;
  shadow?: {
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
  };
  stroke?: string;
  strokeWidth?: number;
  backgroundColor?: string;
  padding?: number;
  borderRadius?: number;
  curveAngle?: number; // degrees, e.g. -180 to 180
}

export type ShapeType =
  | 'rect'
  | 'circle'
  | 'triangle'
  | 'star'
  | 'heart'
  | 'badge'
  | 'pill'
  | 'hexagon'
  | 'diamond'
  | 'speech_bubble'
  | 'arrow_right';

export interface ShapeElement extends BaseElement {
  type: 'shape';
  shapeType: ShapeType;
  fill: string;
  gradient?: {
    from: string;
    to: string;
    angle?: number;
  };
  stroke?: string;
  strokeWidth?: number;
  strokeDash?: 'solid' | 'dashed' | 'dotted';
  borderRadius?: number;
  shadow?: {
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
  };
}

export interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
  alt?: string;
  borderRadius?: number;
  objectFit?: 'cover' | 'contain';
  isCutout?: boolean; // Background removed
  filters?: {
    brightness?: number; // 100 default
    contrast?: number; // 100 default
    saturate?: number; // 100 default
    blur?: number; // 0 default
    grayscale?: number; // 0 default
    sepia?: number; // 0 default
    hueRotate?: number; // 0 default (degrees)
    invert?: number; // 0 default (%)
  };
  flipX?: boolean;
  flipY?: boolean;
  shadow?: {
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
  };
}

export interface StickerElement extends BaseElement {
  type: 'sticker' | 'badge';
  svgType: string;
  fill: string;
  secondaryFill?: string;
  label?: string;
}

export interface DrawingElement extends BaseElement {
  type: 'drawing';
  pathData: string;
  stroke: string;
  strokeWidth: number;
}

export type CanvasElement = TextElement | ShapeElement | ImageElement | StickerElement | DrawingElement;

export interface CanvasBackground {
  type: 'solid' | 'gradient' | 'image';
  color: string;
  gradient?: {
    from: string;
    to: string;
    angle: number;
  };
  imageSrc?: string;
}

export interface CanvasDesignPage {
  id: string;
  name: string;
  background: CanvasBackground;
  elements: CanvasElement[];
}

export interface CanvasDesign {
  id: string;
  title: string;
  presetId: PresetId;
  width: number;
  height: number;
  background: CanvasBackground;
  elements: CanvasElement[];
  pages?: CanvasDesignPage[];
  currentPageIndex?: number;
  updatedAt: number;
}

export interface Template {
  id: string;
  name: string;
  category: 'Promotion' | 'Quote' | 'Business' | 'Fitness' | 'Food' | 'Podcast' | 'Event' | 'Fashion';
  presetId: PresetId;
  thumbnail: string;
  background: CanvasBackground;
  elements: CanvasElement[];
  tags: string[];
}

export interface CollabUser {
  id: string;
  name: string;
  color: string;
  avatar: string;
  cursor?: { x: number; y: number };
  activeElementId?: string | null;
}

export interface CanvasComment {
  id: string;
  x: number;
  y: number;
  author: {
    id: string;
    name: string;
    avatar: string;
    color: string;
  };
  text: string;
  createdAt: number;
  resolved?: boolean;
  replies?: {
    id: string;
    author: {
      id: string;
      name: string;
      avatar: string;
    };
    text: string;
    createdAt: number;
  }[];
}

export interface FontPairing {
  id: string;
  name: string;
  heading: {
    fontFamily: string;
    fontWeight: number | string;
    style?: string;
  };
  subheading: {
    fontFamily: string;
    fontWeight: number | string;
  };
  tag: string;
}
