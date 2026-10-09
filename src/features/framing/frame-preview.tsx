import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import type { FramePreset, FrameThicknessPreset, ImageFit, Orientation, SizePreset } from './catalog';
import { orientedDimensions, outerDimensions } from './catalog';

const MODEL_PREVIEWS = {
  fancy: {
    source: require('@/assets/images/frames/fancy-preview-overlay.png'),
    insets: { left: '6.6%', right: '6.6%', top: '8.3%', bottom: '8.6%' },
  },
  'standing-01': {
    source: require('@/assets/images/frames/standing-frame-01-overlay.png'),
    insets: { left: '17.8%', right: '17.8%', top: '13.1%', bottom: '13.5%' },
  },
  'standing-02': {
    source: require('@/assets/images/frames/standing-frame-02-overlay.png'),
    insets: { left: '19.9%', right: '20%', top: '16.7%', bottom: '16.2%' },
  },
} as const;

type Props = {
  frame: FramePreset;
  fit: ImageFit;
  orientation: Orientation;
  photoUri?: string;
  size: SizePreset;
  thickness: FrameThicknessPreset;
};

export function FramePreview({ frame, fit, orientation, photoUri, size, thickness }: Props) {
  const dimensions = orientedDimensions(size, orientation);
  const outer = outerDimensions(size, thickness, orientation, frame);
  const aspectRatio = outer.widthM / outer.heightM;
  const framePadding = frame.model ? 18 : Math.max(8, Math.round((thickness.widthM / dimensions.widthM) * 260));
  const matPadding = frame.matColor ? 18 : 0;

  if (frame.model) {
    const preview = MODEL_PREVIEWS[frame.model];
    return (
      <View style={styles.stage} accessibilityLabel={`Vista previa de ${frame.name}`}>
        <View style={[styles.modelFrame, { aspectRatio }]}>
          <View style={[styles.modelOpening, preview.insets]}>
            {photoUri ? (
              <Image
                source={{ uri: photoUri }}
                style={StyleSheet.absoluteFill}
                contentFit={fit}
                transition={180}
                accessibilityLabel="Fotografía seleccionada"
              />
            ) : (
              <View style={styles.placeholder}>
                <Text style={styles.placeholderIcon}>+</Text>
                <Text style={styles.placeholderText}>Tu foto aparecerá aquí</Text>
              </View>
            )}
          </View>
          <Image
            source={preview.source}
            style={StyleSheet.absoluteFill}
            contentFit="fill"
            accessibilityIgnoresInvertColors
          />
        </View>
        <View style={styles.shadow} />
      </View>
    );
  }

  return (
    <View style={styles.stage} accessibilityLabel="Vista previa del marco seleccionado">
      <View
        style={[
          styles.frame,
          {
            aspectRatio,
            backgroundColor: frame.color,
            borderColor: frame.edgeColor,
            padding: framePadding,
          },
        ]}>
        <View style={[styles.mat, { backgroundColor: frame.matColor ?? frame.color, padding: matPadding }]}> 
          <View style={styles.opening}>
            {photoUri ? (
              <Image
                source={{ uri: photoUri }}
                style={StyleSheet.absoluteFill}
                contentFit={fit}
                transition={180}
                accessibilityLabel="Fotografía seleccionada"
              />
            ) : (
              <View style={styles.placeholder}>
                <Text style={styles.placeholderIcon}>+</Text>
                <Text style={styles.placeholderText}>Tu foto aparecerá aquí</Text>
              </View>
            )}
            <View pointerEvents="none" style={styles.innerShadowTop} />
            <View pointerEvents="none" style={styles.innerShadowLeft} />
            <View pointerEvents="none" style={styles.innerHighlightBottom} />
            <View pointerEvents="none" style={styles.innerHighlightRight} />
          </View>
        </View>
      </View>
      <View style={styles.shadow} />
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    minHeight: 355,
    paddingHorizontal: 28,
    paddingVertical: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEEAF0',
    borderRadius: 28,
    overflow: 'hidden',
  },
  frame: {
    width: '76%',
    maxHeight: 300,
    borderWidth: 2,
    zIndex: 2,
  },
  modelFrame: {
    width: '76%',
    maxHeight: 300,
    zIndex: 2,
    shadowColor: '#35230E',
    shadowOpacity: 0.32,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  modelOpening: {
    position: 'absolute',
    left: '6.5%',
    right: '6.5%',
    top: '8%',
    bottom: '8.8%',
    overflow: 'hidden',
    backgroundColor: '#D7D3D9',
  },
  mat: { flex: 1 },
  opening: { flex: 1, overflow: 'hidden', backgroundColor: '#D7D3D9', borderWidth: 1, borderColor: 'rgba(0,0,0,0.22)' },
  innerShadowTop: { position: 'absolute', zIndex: 5, left: 0, right: 0, top: 0, height: 5, backgroundColor: 'rgba(0,0,0,0.16)' },
  innerShadowLeft: { position: 'absolute', zIndex: 5, left: 0, top: 0, bottom: 0, width: 5, backgroundColor: 'rgba(0,0,0,0.12)' },
  innerHighlightBottom: { position: 'absolute', zIndex: 5, left: 0, right: 0, bottom: 0, height: 2, backgroundColor: 'rgba(255,255,255,0.24)' },
  innerHighlightRight: { position: 'absolute', zIndex: 5, right: 0, top: 0, bottom: 0, width: 2, backgroundColor: 'rgba(255,255,255,0.18)' },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  placeholderIcon: { fontSize: 34, fontWeight: '300', color: '#EC0AAF' },
  placeholderText: { color: '#625D64', fontSize: 13, fontWeight: '600', textAlign: 'center' },
  shadow: {
    position: 'absolute',
    width: '60%',
    height: 18,
    bottom: 19,
    backgroundColor: 'rgba(20, 18, 21, 0.16)',
    borderRadius: 999,
    transform: [{ scaleX: 1.1 }],
  },
});
