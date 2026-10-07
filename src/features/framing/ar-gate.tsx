import { lazy, Suspense } from 'react';
import { ActivityIndicator, NativeModules, Pressable, StyleSheet, Text, View } from 'react-native';

import type { FrameDesign } from './catalog';

type FrameProps = {
  mode: 'frames';
  designs: FrameDesign[];
  calibrationFactor: number;
  onClose: () => void;
};

type CalibrationProps = {
  mode: 'calibration';
  initialFactor: number;
  onClose: () => void;
  onConfirm: (factor: number) => void;
};

type Props = FrameProps | CalibrationProps;

const LazyARView = lazy(() =>
  import('./ar-view').then((module) => ({ default: module.ARView })),
);
const LazyCalibrationView = lazy(() =>
  import('./calibration-view').then((module) => ({ default: module.CalibrationView })),
);

export function ARGate(props: Props) {
  const hasNativeViro = Boolean(
    NativeModules.VRTMaterialManager && NativeModules.VRTAnimationManager,
  );

  if (!hasNativeViro) {
    return (
      <View style={styles.container}>
        <Text style={styles.eyebrow}>MÓDULO NATIVO NO DISPONIBLE</Text>
        <Text style={styles.title}>Instala la nueva development build</Text>
        <Text style={styles.body}>
          Expo Go y las builds creadas antes de instalar ViroReact no contienen los módulos de realidad aumentada. Genera e instala nuevamente el APK de desarrollo y abre el proyecto con Expo Dev Client.
        </Text>
        <Pressable accessibilityRole="button" onPress={props.onClose} style={styles.button}>
          <Text style={styles.buttonText}>Volver al diseño</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <Suspense
      fallback={
        <View style={styles.container}>
          <ActivityIndicator color="#EC0AAF" size="large" />
          <Text style={styles.body}>Preparando la cámara AR…</Text>
        </View>
      }>
      {props.mode === 'frames' ? (
        <LazyARView calibrationFactor={props.calibrationFactor} designs={props.designs} onClose={props.onClose} />
      ) : (
        <LazyCalibrationView initialFactor={props.initialFactor} onClose={props.onClose} onConfirm={props.onConfirm} />
      )}
    </Suspense>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    padding: 32,
    backgroundColor: '#111113',
  },
  eyebrow: { color: '#EC0AAF', fontSize: 11, fontWeight: '900', letterSpacing: 1.6 },
  title: { color: '#FFF', fontSize: 28, lineHeight: 34, fontWeight: '800', textAlign: 'center' },
  body: { color: '#CFC6BA', fontSize: 15, lineHeight: 23, textAlign: 'center', maxWidth: 480 },
  button: { marginTop: 10, minHeight: 50, paddingHorizontal: 22, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EC0AAF' },
  buttonText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
});
