export type Orientation = 'portrait' | 'landscape';
export type ImageFit = 'cover' | 'contain';

export type SizePreset = {
  id: string;
  label: string;
  photoWidthM: number;
  photoHeightM: number;
};

export type FramePreset = {
  id: string;
  name: string;
  color: string;
  edgeColor: string;
  matColor?: string;
  borderRatio: number;
};

export type FrameThicknessPreset = {
  id: string;
  label: string;
  widthM: number;
};

export type FrameDesign = {
  id: string;
  fit: ImageFit;
  frame: FramePreset;
  orientation: Orientation;
  photoUri: string;
  size: SizePreset;
  thickness: FrameThicknessPreset;
};

export const SIZE_PRESETS: SizePreset[] = [
  { id: '5x7', label: '5 × 7 in', photoWidthM: 0.127, photoHeightM: 0.1778 },
  { id: '6x8', label: '6 × 8 in', photoWidthM: 0.1524, photoHeightM: 0.2032 },
  { id: '8x10', label: '8 × 10 in', photoWidthM: 0.2032, photoHeightM: 0.254 },
  { id: '8x12', label: '8 × 12 in', photoWidthM: 0.2032, photoHeightM: 0.3048 },
  { id: '8x15', label: '8 × 15 in', photoWidthM: 0.2032, photoHeightM: 0.381 },
  { id: '10x15', label: '10 × 15 in', photoWidthM: 0.254, photoHeightM: 0.381 },
  { id: '12x16', label: '12 × 16 in', photoWidthM: 0.3048, photoHeightM: 0.4064 },
  { id: '12x18', label: '12 × 18 in', photoWidthM: 0.3048, photoHeightM: 0.4572 },
  { id: '20x24', label: '20 × 24 in', photoWidthM: 0.508, photoHeightM: 0.6096 },
  { id: '16x24', label: '16 × 24 in', photoWidthM: 0.4064, photoHeightM: 0.6096 },
  { id: '24x32', label: '24 × 32 in', photoWidthM: 0.6096, photoHeightM: 0.8128 },
  { id: '24x39', label: '24 × 39 in', photoWidthM: 0.6096, photoHeightM: 0.9906 },
];

export const FRAME_PRESETS: FramePreset[] = [
  {
    id: 'natural-oak',
    name: 'Roble natural',
    color: '#B98651',
    edgeColor: '#7B4E2B',
    borderRatio: 0.075,
  },
  {
    id: 'gallery-black',
    name: 'Galería negro',
    color: '#222321',
    edgeColor: '#050505',
    matColor: '#F4F0E7',
    borderRatio: 0.055,
  },
  {
    id: 'classic-white',
    name: 'Clásico blanco',
    color: '#EEECE5',
    edgeColor: '#B8B5AE',
    borderRatio: 0.07,
  },
];

export const FRAME_THICKNESS_PRESETS: FrameThicknessPreset[] = [
  { id: 'slim', label: 'Delgado · 0.5 in', widthM: 0.0127 },
  { id: 'standard', label: 'Estándar · 1 in', widthM: 0.0254 },
  { id: 'wide', label: 'Ancho · 1.5 in', widthM: 0.0381 },
  { id: 'extra-wide', label: 'Extra ancho · 2 in', widthM: 0.0508 },
];

export function orientedDimensions(size: SizePreset, orientation: Orientation) {
  return orientation === 'portrait'
    ? { widthM: size.photoWidthM, heightM: size.photoHeightM }
    : { widthM: size.photoHeightM, heightM: size.photoWidthM };
}

export function outerDimensions(size: SizePreset, thickness: FrameThicknessPreset, orientation: Orientation) {
  const photo = orientedDimensions(size, orientation);

  return {
    widthM: photo.widthM + 2 * thickness.widthM,
    heightM: photo.heightM + 2 * thickness.widthM,
  };
}

export function formatInches(meters: number) {
  return Number((meters / 0.0254).toFixed(1));
}
