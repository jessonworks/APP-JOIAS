export enum AspectRatio {
  SQUARE = '1:1',
  PORTRAIT = '3:4',
  LANDSCAPE = '4:3',
  STORY = '9:16',
  WIDESCREEN = '16:9'
}

export interface GeneratedImage {
  url: string;
  timestamp: number;
  prompt: string;
}

export interface ImageFile {
  file: File;
  preview: string;
  base64: string;
  mimeType: string;
}

export enum GeneratorMode {
  CATALOG = 'CATALOG',
  CREATIVE = 'CREATIVE',
  EDIT = 'EDIT'
}
