export type Orientation = 'portrait' | 'landscape';
export type ImageFit = 'cover' | 'contain';
export type FrameModelId = 'fancy' | 'standing-01' | 'standing-02';

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
  model?: FrameModelId;
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
  {
    id: 'fancy-3d',
    name: 'Ornamental 3D',
    color: '#C3A15E',
    edgeColor: '#71501E',
    borderRatio: 0.075,
    model: 'fancy',
  },
  {
    id: 'standing-black-3d',
    name: 'Moderno negro 3D',
    color: '#242424',
    edgeColor: '#090909',
    matColor: '#F2F1EE',
    borderRatio: 0.12,
    model: 'standing-01',
  },
  {
    id: 'standing-white-3d',
    name: 'Madera blanca 3D',
    color: '#E8E3DA',
    edgeColor: '#A99D8E',
    borderRatio: 0.16,
    model: 'standing-02',
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

export const FRAME_MODEL_DIMENSIONS: Record<FrameModelId, { nativeOrientation: Orientation; openingWidth: number; openingHeight: number; outerWidth: number; outerHeight: number }> = {
  fancy: {
    nativeOrientation: 'landscape',
    openingWidth: 0.53937429189682,
    openingHeight: 0.40028803050518036,
    outerWidth: 0.603030264377594,
    outerHeight: 0.46412645280361175,
  },
  'standing-01': {
    nativeOrientation: 'portrait',
    openingWidth: 0.13174070417881012,
    openingHeight: 0.18531423062086105,
    outerWidth: 0.2007998526096344,
    outerHeight: 0.24965811520814896,
  },
  'standing-02': {
    nativeOrientation: 'portrait',
    openingWidth: 0.13522548973560333,
    openingHeight: 0.18454795330762863,
    outerWidth: 0.21689216047525406,
    outerHeight: 0.2663925290107727,
  },
};

export function outerDimensions(size: SizePreset, thickness: FrameThicknessPreset, orientation: Orientation, frame?: FramePreset) {
  const photo = orientedDimensions(size, orientation);

  if (frame?.model) {
    const model = FRAME_MODEL_DIMENSIONS[frame.model];
    const rotated = orientation !== model.nativeOrientation;
    return {
      widthM: photo.widthM * (rotated ? model.outerHeight / model.openingHeight : model.outerWidth / model.openingWidth),
      heightM: photo.heightM * (rotated ? model.outerWidth / model.openingWidth : model.outerHeight / model.openingHeight),
    };
  }

  return {
    widthM: photo.widthM + 2 * thickness.widthM,
    heightM: photo.heightM + 2 * thickness.widthM,
  };
}

export function formatInches(meters: number) {
  return Number((meters / 0.0254).toFixed(1));
}
