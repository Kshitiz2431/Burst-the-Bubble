// types/image-editor.ts
export type AspectRatioOption = {
  value: number | undefined;
  label: string;
};

export type ImageAdjustments = {
  brightness: number;
  contrast: number;
  saturation: number;
  rotation: number;
  compression: number;
  flipHorizontal: boolean;
  flipVertical: boolean;
};

export type Point = {
  x: number;
  y: number;
};

export type CropArea = {
  x: number;
  y: number;
  width: number;
  height: number;
  unit: 'px' | '%';
};