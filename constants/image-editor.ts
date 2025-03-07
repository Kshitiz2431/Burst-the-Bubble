// constants/image-editor.ts
import { AspectRatioOption } from '@/types/image-editor';

export const ASPECT_RATIO_OPTIONS: AspectRatioOption[] = [
  { value: undefined, label: 'Free Form' },
  { value: 1, label: 'Square (1:1)' },
  { value: 16/9, label: 'Landscape (16:9)' },
  { value: 4/3, label: 'Standard (4:3)' },
  { value: 3/2, label: 'Classic (3:2)' },
  { value: 2/3, label: 'Portrait (2:3)' },
  { value: 9/16, label: 'Story (9:16)' }
];

export const DEFAULT_ADJUSTMENTS = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  rotation: 0,
  compression: 90,
  flipHorizontal: false,
  flipVertical: false,
};