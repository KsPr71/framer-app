import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ARGate } from '@/features/framing/ar-gate';
import {
  FRAME_PRESETS,
  FRAME_THICKNESS_PRESETS,
  type FrameDesign,
  formatInches,
  type ImageFit,
  type Orientation,
  outerDimensions,
  SIZE_PRESETS,
} from '@/features/framing/catalog';
import { FramePreview } from '@/features/framing/frame-preview';

export default function HomeScreen() {
  const [designs, setDesigns] = useState<FrameDesign[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [frameId, setFrameIdState] = useState(FRAME_PRESETS[0].id);
  const [sizeId, setSizeIdState] = useState(SIZE_PRESETS[3].id);
  const [thicknessId, setThicknessIdState] = useState(FRAME_THICKNESS_PRESETS[1].id);
  const [fit, setFitState] = useState<ImageFit>('cover');
  const [orientation, setOrientationState] = useState<Orientation>('portrait');
  const [showAR, setShowAR] = useState(false);
  const [showCalibration, setShowCalibration] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [calibrationFactor, setCalibrationFactor] = useState(1);

  const activeDesign = designs[activeIndex];
  const photoUri = activeDesign?.photoUri;
  const frame = FRAME_PRESETS.find((item) => item.id === frameId) ?? FRAME_PRESETS[0];
  const size = SIZE_PRESETS.find((item) => item.id === sizeId) ?? SIZE_PRESETS[0];
  const thickness = FRAME_THICKNESS_PRESETS.find((item) => item.id === thicknessId) ?? FRAME_THICKNESS_PRESETS[0];
  const outer = useMemo(() => outerDimensions(size, thickness, orientation), [orientation, size, thickness]);

  const saveCalibration = (factor: number) => {
    setCalibrationFactor(factor);
  };

  const patchActive = (patch: Partial<FrameDesign>) => {
    if (!activeDesign) return;
    setDesigns((current) => current.map((item, index) => index === activeIndex ? { ...item, ...patch } : item));
  };

  const choosePhotos = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        allowsMultipleSelection: true,
        quality: 0.9,
      });

      if (result.canceled) return;
      const startIndex = designs.length;
      const added = result.assets.map((asset, index): FrameDesign => ({
        id: `${Date.now()}-${index}`,
        fit,
        frame,
        orientation,
        photoUri: asset.uri,
        size,
        thickness,
      }));
      setDesigns((current) => [...current, ...added]);
      selectDesign(startIndex, added[0]);
    } catch {
      Alert.alert('No pudimos abrir tus fotos', 'Inténtalo nuevamente desde este botón.');
    }
  };

  const selectDesign = (index: number, design = designs[index]) => {
    if (!design) return;
    setActiveIndex(index);
    setFrameIdState(design.frame.id);
    setSizeIdState(design.size.id);
    setThicknessIdState(design.thickness.id);
    setFitState(design.fit);
    setOrientationState(design.orientation);
  };

  const removeDesign = (index: number) => {
    const remaining = designs.filter((_, itemIndex) => itemIndex !== index);
    setDesigns(remaining);
    const nextIndex = Math.min(activeIndex, Math.max(0, remaining.length - 1));
    if (remaining[nextIndex]) selectDesign(nextIndex, remaining[nextIndex]);
    else setActiveIndex(0);
  };

  if (showCalibration) {
    return <ARGate mode="calibration" initialFactor={calibrationFactor} onClose={() => setShowCalibration(false)} onConfirm={(factor) => { saveCalibration(factor); setShowCalibration(false); }} />;
  }

  if (showAR && designs.length) {
    return <ARGate mode="frames" calibrationFactor={calibrationFactor} designs={designs} onClose={() => setShowAR(false)} />;
  }

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.brandRow}>
              <Image source={require('@/assets/images/logo-simple.png')} style={styles.logo} contentFit="contain" />
              <View>
                <Text style={styles.eyebrow}>FRAMEART</Text>
                <Text style={styles.title}>Diseña tu pared</Text>
              </View>
            </View>
            <Pressable accessibilityLabel="Abrir ajustes" onPress={() => setShowSettings(true)} style={styles.settingsButton}><Image source={require('@/assets/images/tabIcons/configuraciones.png')} style={styles.settingsIcon} contentFit="contain" /></Pressable>
          </View>

          <FramePreview frame={frame} fit={fit} orientation={orientation} photoUri={photoUri} size={size} thickness={thickness} />

          <Pressable accessibilityRole="button" onPress={choosePhotos} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
            <Text style={styles.primaryButtonText}>{designs.length ? 'Añadir fotografías' : 'Elegir fotografías'}</Text>
          </Pressable>

          {!!designs.length && (
            <Section title={`Composición · ${designs.length} ${designs.length === 1 ? 'cuadro' : 'cuadros'}`}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoRow}>
                {designs.map((design, index) => (
                  <View key={design.id} style={[styles.photoCard, index === activeIndex && styles.photoCardSelected]}>
                    <Pressable onPress={() => selectDesign(index)}>
                      <Image source={{ uri: design.photoUri }} style={styles.thumbnail} contentFit="cover" />
                      <Text style={styles.photoNumber}>{index + 1}</Text>
                    </Pressable>
                    <Pressable accessibilityLabel={`Eliminar cuadro ${index + 1}`} onPress={() => removeDesign(index)} style={styles.removeButton}>
                      <Text style={styles.removeText}>×</Text>
                    </Pressable>
                  </View>
                ))}
              </ScrollView>
              <Text style={styles.queueHint}>Selecciona una miniatura para configurar ese cuadro.</Text>
            </Section>
          )}

          <Section title="Marco">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
              {FRAME_PRESETS.map((item) => <Option key={item.id} selected={item.id === frameId} label={item.name} onPress={() => { setFrameIdState(item.id); patchActive({ frame: item }); }} swatch={{ backgroundColor: item.color, borderColor: item.edgeColor }} />)}
            </ScrollView>
          </Section>

          <Section title="Grosor del marco">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
              {FRAME_THICKNESS_PRESETS.map((item) => <Option key={item.id} selected={item.id === thicknessId} label={item.label} onPress={() => { setThicknessIdState(item.id); patchActive({ thickness: item }); }} />)}
            </ScrollView>
          </Section>

          <Section title="Tamaño de la foto">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
              {SIZE_PRESETS.map((item) => <Option key={item.id} selected={item.id === sizeId} label={item.label} onPress={() => { setSizeIdState(item.id); patchActive({ size: item }); }} />)}
            </ScrollView>
          </Section>

          <View style={styles.twoColumns}>
            <Section title="Orientación" compact><Segmented value={orientation} options={[{ value: 'portrait', label: 'Vertical' }, { value: 'landscape', label: 'Horizontal' }]} onChange={(value) => { const next = value as Orientation; setOrientationState(next); patchActive({ orientation: next }); }} /></Section>
            <Section title="Ajuste" compact><Segmented value={fit} options={[{ value: 'cover', label: 'Rellenar' }, { value: 'contain', label: 'Encajar' }]} onChange={(value) => { const next = value as ImageFit; setFitState(next); patchActive({ fit: next }); }} /></Section>
          </View>

          <View style={styles.measureCard}>
            <View><Text style={styles.measureLabel}>Medida exterior aproximada</Text><Text style={styles.measureValue}>{formatInches(outer.widthM)} × {formatInches(outer.heightM)} in</Text></View>
            <Text style={styles.measureNote}>La foto conserva la medida elegida; el grosor se suma alrededor.</Text>
          </View>

          <Pressable accessibilityRole="button" disabled={!designs.length} onPress={() => setShowAR(true)} style={({ pressed }) => [styles.arButton, !designs.length && styles.arButtonDisabled, pressed && styles.pressed]}>
            <Text style={styles.arButtonText}>{designs.length > 1 ? `Colocar ${designs.length} cuadros` : 'Ver en mi pared'}</Text>
            <Text style={styles.arButtonHint}>{designs.length ? 'Abrir cámara AR' : 'Elige primero una fotografía'}</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>

      <Modal animationType="slide" transparent visible={showSettings} onRequestClose={() => setShowSettings(false)}>
        <View style={styles.modalBackdrop}>
          <SafeAreaView style={styles.settingsSheet}>
            <View style={styles.settingsHeader}><View><Text style={styles.settingsEyebrow}>FRAMEART</Text><Text style={styles.settingsTitle}>Ajustes</Text></View><Pressable onPress={() => setShowSettings(false)} style={styles.closeButton}><Text style={styles.closeText}>×</Text></Pressable></View>
            <View style={styles.calibrationCard}>
              <View style={styles.calibrationTop}><View style={styles.calibrationIcon}><Text style={styles.calibrationIconText}>▦</Text></View><View style={styles.calibrationCopy}><Text style={styles.calibrationTitle}>Calibración de escala</Text><Text style={styles.calibrationStatus}>{calibrationFactor === 1 ? 'Sin ajuste' : `Factor aplicado: ${Math.round(calibrationFactor * 100)}%`}</Text></View></View>
              <Text style={styles.calibrationBody}>Usa una hoja Carta de 8.5 × 11 pulgadas para ajustar la escala AR de este dispositivo. Es completamente opcional.</Text>
              <Pressable onPress={() => { setShowSettings(false); setShowCalibration(true); }} style={styles.calibrateButton}><Text style={styles.calibrateText}>{calibrationFactor === 1 ? 'Iniciar calibración' : 'Calibrar nuevamente'}</Text></Pressable>
              {calibrationFactor !== 1 && <Pressable onPress={() => saveCalibration(1)} style={styles.resetCalibration}><Text style={styles.resetCalibrationText}>Restablecer a 100%</Text></Pressable>}
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
}

function Section({ children, compact, title }: { children: React.ReactNode; compact?: boolean; title: string }) {
  return <View style={[styles.section, compact && styles.compactSection]}><Text style={styles.sectionTitle}>{title}</Text>{children}</View>;
}

function Option({ label, onPress, selected, swatch }: { label: string; onPress: () => void; selected: boolean; swatch?: { backgroundColor: string; borderColor: string } }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress} style={[styles.option, selected && styles.optionSelected]}>{swatch && <View style={[styles.swatch, swatch]} />}<Text style={[styles.optionText, selected && styles.optionTextSelected]}>{label}</Text></Pressable>;
}

function Segmented({ onChange, options, value }: { onChange: (value: string) => void; options: { value: string; label: string }[]; value: string }) {
  return <View style={styles.segmented}>{options.map((option) => <Pressable key={option.value} onPress={() => onChange(option.value)} style={[styles.segment, option.value === value && styles.segmentSelected]}><Text style={[styles.segmentText, option.value === value && styles.segmentTextSelected]}>{option.label}</Text></Pressable>)}</View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F7F5F8' }, safeArea: { flex: 1 }, content: { padding: 20, paddingBottom: 120, gap: 18, width: '100%', maxWidth: 720, alignSelf: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }, brandRow: { flexDirection: 'row', alignItems: 'center', gap: 2 }, logo: { width: 72, height: 72, marginLeft: -13 }, eyebrow: { color: '#EC0AAF', fontSize: 11, fontWeight: '900', letterSpacing: 2 }, title: { color: '#171719', fontSize: 28, lineHeight: 34, fontWeight: '900', letterSpacing: -0.8 }, settingsButton: { width: 50, height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E5DCE5' }, settingsIcon: { width: 36, height: 36 },
  localBadge: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 999, backgroundColor: '#E8F1E8' }, localDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#4A854D' }, localText: { color: '#356437', fontSize: 12, fontWeight: '700' },
  primaryButton: { minHeight: 54, borderRadius: 16, backgroundColor: '#EC0AAF', alignItems: 'center', justifyContent: 'center' }, primaryButtonText: { color: '#FFF', fontSize: 16, fontWeight: '900' }, pressed: { opacity: 0.8 },
  section: { gap: 10 }, compactSection: { flex: 1 }, sectionTitle: { color: '#29231E', fontSize: 15, fontWeight: '800' }, row: { gap: 9 },
  photoRow: { gap: 10, paddingVertical: 3 }, photoCard: { padding: 3, borderWidth: 2, borderColor: 'transparent', borderRadius: 13 }, photoCardSelected: { borderColor: '#EC0AAF', backgroundColor: '#FCE4F6' }, thumbnail: { width: 64, height: 76, borderRadius: 9 }, photoNumber: { position: 'absolute', left: 5, bottom: 5, minWidth: 21, height: 21, borderRadius: 11, textAlign: 'center', lineHeight: 21, color: '#FFF', backgroundColor: 'rgba(0,0,0,0.72)', fontWeight: '800', fontSize: 11 }, removeButton: { position: 'absolute', right: -6, top: -7, width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#171719' }, removeText: { color: '#FFF', fontSize: 18, lineHeight: 20 }, queueHint: { color: '#756E66', fontSize: 12 },
  option: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 14, paddingHorizontal: 14, borderWidth: 1, borderColor: '#DED9DF', backgroundColor: '#FFF' }, optionSelected: { borderColor: '#EC0AAF', backgroundColor: '#FCE4F6' }, optionText: { color: '#625D64', fontSize: 13, fontWeight: '700' }, optionTextSelected: { color: '#A00778' }, swatch: { width: 18, height: 18, borderRadius: 5, borderWidth: 2 },
  twoColumns: { flexDirection: 'row', gap: 12 }, segmented: { flexDirection: 'row', padding: 3, borderRadius: 13, backgroundColor: '#E9E5DE' }, segment: { flex: 1, paddingVertical: 9, paddingHorizontal: 8, alignItems: 'center', borderRadius: 10 }, segmentSelected: { backgroundColor: '#FFF' }, segmentText: { color: '#756E66', fontSize: 12, fontWeight: '700' }, segmentTextSelected: { color: '#332B25' },
  measureCard: { padding: 17, gap: 12, borderRadius: 18, backgroundColor: '#1D1D20' }, measureLabel: { color: '#CFCAD0', fontSize: 12, fontWeight: '600' }, measureValue: { color: '#FFF', fontSize: 23, fontWeight: '900', marginTop: 2 }, measureNote: { color: '#BDB7BF', fontSize: 12, lineHeight: 17 },
  arButton: { minHeight: 62, borderRadius: 18, backgroundColor: '#171719', alignItems: 'center', justifyContent: 'center', gap: 2, borderWidth: 2, borderColor: '#EC0AAF' }, arButtonDisabled: { backgroundColor: '#AAA5AB', borderColor: '#AAA5AB' }, arButtonText: { color: '#FFF', fontSize: 16, fontWeight: '900' }, arButtonHint: { color: 'rgba(255,255,255,0.76)', fontSize: 11, fontWeight: '600' },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(10,10,12,0.45)' }, settingsSheet: { padding: 22, paddingBottom: 38, gap: 22, borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: '#FFF' }, settingsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, settingsEyebrow: { color: '#EC0AAF', fontSize: 11, fontWeight: '900', letterSpacing: 2 }, settingsTitle: { color: '#171719', fontSize: 30, fontWeight: '900' }, closeButton: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F1EEF2' }, closeText: { color: '#171719', fontSize: 26 }, calibrationCard: { padding: 18, gap: 14, borderRadius: 22, backgroundColor: '#F7F4F7', borderWidth: 1, borderColor: '#E8E2E9' }, calibrationTop: { flexDirection: 'row', gap: 12, alignItems: 'center' }, calibrationIcon: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EC0AAF' }, calibrationIconText: { color: '#FFF', fontSize: 25, fontWeight: '900' }, calibrationCopy: { flex: 1 }, calibrationTitle: { color: '#171719', fontSize: 17, fontWeight: '900' }, calibrationStatus: { color: '#8B858D', fontSize: 12, marginTop: 2 }, calibrationBody: { color: '#625D64', fontSize: 14, lineHeight: 21 }, calibrateButton: { minHeight: 50, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EC0AAF' }, calibrateText: { color: '#FFF', fontWeight: '900' }, resetCalibration: { minHeight: 42, alignItems: 'center', justifyContent: 'center' }, resetCalibrationText: { color: '#8B1470', fontWeight: '800' },
});
