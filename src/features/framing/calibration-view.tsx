import {
  isARSupportedOnDevice,
  requestRequiredPermissions,
  ViroARScene,
  ViroARSceneNavigator,
  ViroBox,
  ViroMaterials,
  ViroNode,
  type ViroCameraARHitTest,
} from '@reactvision/react-viro';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

const LETTER_WIDTH_M = 0.2159;
const LETTER_HEIGHT_M = 0.2794;
const INCH_M = 0.0254;

type Placement = { position: [number, number, number]; rotation: [number, number, number] };
type SceneAppProps = { factor: number; fixRequest: number; updateFixed: (fixed: boolean) => void; updateReady: (ready: boolean) => void };
type SceneProps = { sceneNavigator?: { viroAppProps: SceneAppProps } };

ViroMaterials.createMaterials({
  'calibration-sheet': { lightingModel: 'Constant', diffuseColor: 'rgba(255,255,255,0.72)', blendMode: 'Alpha', cullMode: 'None' },
  'calibration-grid': { lightingModel: 'Constant', diffuseColor: '#EC0AAF' },
});

export function CalibrationView({ initialFactor, onClose, onConfirm }: { initialFactor: number; onClose: () => void; onConfirm: (factor: number) => void }) {
  const [factor, setFactor] = useState(initialFactor);
  const [ready, setReady] = useState(false);
  const [fixed, setFixed] = useState(false);
  const [supported, setSupported] = useState<boolean>();
  const [fixRequest, setFixRequest] = useState(0);
  const [closing, setClosing] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const support = await isARSupportedOnDevice();
        const permissions = support.isARSupported ? await requestRequiredPermissions(['camera']) : { camera: false };
        if (active) setSupported(support.isARSupported && permissions.camera);
      } catch {
        if (active) setSupported(false);
      }
    })();
    return () => {
      active = false;
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  const closeSafely = (save: boolean) => {
    if (closing) return;
    setClosing(true);
    closeTimer.current = setTimeout(() => save ? onConfirm(factor) : onClose(), 250);
  };
  const changeFactor = (delta: number) => setFactor((current) => Math.min(1.25, Math.max(0.75, Number((current + delta).toFixed(2)))));

  return (
    <View style={styles.container}>
      {supported && !closing ? (
        <ViroARSceneNavigator depthEnabled style={StyleSheet.absoluteFill} initialScene={{ scene: CalibrationScene }} provider="none" viroAppProps={{ factor, fixRequest, updateFixed: setFixed, updateReady: setReady }} />
      ) : (
        <View style={styles.loading}><ActivityIndicator color="#EC0AAF" size="large" /><Text style={styles.loadingText}>{closing ? 'Guardando calibración…' : supported === false ? 'No se pudo iniciar la calibración AR.' : 'Preparando calibración…'}</Text></View>
      )}

      {!closing && (
        <View pointerEvents="box-none" style={styles.overlay}>
          <View style={styles.topBar}><Pressable onPress={() => closeSafely(false)} style={styles.darkButton}><Text style={styles.darkButtonText}>‹ Cancelar</Text></Pressable><View style={styles.badge}><Text style={styles.badgeText}>HOJA CARTA</Text></View></View>
          {!fixed && <View pointerEvents="none" style={styles.reticle}><View style={styles.crossH} /><View style={styles.crossV} /><View style={styles.dot} /></View>}
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>{fixed ? 'Haz coincidir la cuadrícula' : 'Coloca una hoja Carta en la pared'}</Text>
            <Text style={styles.panelBody}>{fixed ? 'Ajusta hasta que el borde fucsia coincida con toda la hoja física.' : 'Alinea la cruz con el centro de la hoja y fija la referencia.'}</Text>
            {fixed ? (
              <>
                <View style={styles.adjustRow}><Pressable onPress={() => changeFactor(-0.01)} style={styles.adjustButton}><Text style={styles.adjustText}>−</Text></Pressable><Text style={styles.factor}>{Math.round(factor * 100)}%</Text><Pressable onPress={() => changeFactor(0.01)} style={styles.adjustButton}><Text style={styles.adjustText}>+</Text></Pressable></View>
                <Pressable onPress={() => closeSafely(true)} style={styles.primaryButton}><Text style={styles.primaryText}>Guardar calibración</Text></Pressable>
              </>
            ) : (
              <Pressable disabled={!ready} onPress={() => setFixRequest((current) => current + 1)} style={[styles.primaryButton, !ready && styles.disabled]}><Text style={styles.primaryText}>Fijar referencia</Text></Pressable>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

function CalibrationScene(props?: SceneProps) {
  const app = props?.sceneNavigator?.viroAppProps;
  const candidate = useRef<Placement | undefined>(undefined);
  const handledRequest = useRef(0);
  const lastUpdate = useRef(0);
  const [guide, setGuide] = useState<Placement>();
  const [fixedPlacement, setFixedPlacement] = useState<Placement>();

  useEffect(() => {
    if (!app || app.fixRequest === handledRequest.current) return;
    handledRequest.current = app.fixRequest;
    if (candidate.current) {
      setFixedPlacement(candidate.current);
      app.updateFixed(true);
    }
  }, [app]);
  if (!app) return <ViroARScene />;

  const hitTest = (event: ViroCameraARHitTest) => {
    if (fixedPlacement) return;
    const hit =
      event.hitTestResults.find((result) => result.type === 'ExistingPlaneUsingExtent') ??
      event.hitTestResults.find((result) => result.type === 'ExistingPlane') ??
      event.hitTestResults.find((result) => result.type === 'DepthPoint') ??
      event.hitTestResults.find((result) => result.type === 'FeaturePoint');
    if (!hit) return;
    const position = hit.transform.position;
    const camera = event.cameraOrientation.position;
    const placement: Placement = { position: [position[0], position[1], position[2]], rotation: [0, (Math.atan2(camera[0] - position[0], camera[2] - position[2]) * 180) / Math.PI, 0] };
    candidate.current = placement;
    app.updateReady(true);
    if (Date.now() - lastUpdate.current > 100) {
      lastUpdate.current = Date.now();
      setGuide(placement);
    }
  };
  const placement = fixedPlacement ?? guide;
  return <ViroARScene anchorDetectionTypes="PlanesVertical" onCameraARHitTest={hitTest}>{placement && <ViroNode position={placement.position} rotation={placement.rotation}><LetterGrid factor={app.factor} /></ViroNode>}</ViroARScene>;
}

function LetterGrid({ factor }: { factor: number }) {
  const width = LETTER_WIDTH_M * factor;
  const height = LETTER_HEIGHT_M * factor;
  const line = 0.0015;
  const vertical = Array.from({ length: 9 }, (_, index) => -width / 2 + index * INCH_M * factor);
  const horizontal = Array.from({ length: 12 }, (_, index) => -height / 2 + index * INCH_M * factor);
  return (
    <ViroNode position={[0, 0, 0.008]}>
      <ViroBox width={width} height={height} length={0.003} materials={['calibration-sheet']} />
      <ViroBox width={line} height={height} length={0.005} position={[width / 2, 0, 0.004]} materials={['calibration-grid']} />
      {vertical.map((x, index) => <ViroBox key={`v-${index}`} width={line} height={height} length={0.005} position={[x, 0, 0.004]} materials={['calibration-grid']} />)}
      {horizontal.map((y, index) => <ViroBox key={`h-${index}`} width={width} height={line} length={0.005} position={[0, y, 0.004]} materials={['calibration-grid']} />)}
    </ViroNode>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111113' }, loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 }, loadingText: { color: '#FFF', fontWeight: '700' }, overlay: { position: 'absolute', inset: 0, padding: 18, paddingTop: 54, paddingBottom: 34, justifyContent: 'space-between' }, topBar: { flexDirection: 'row', justifyContent: 'space-between' }, darkButton: { paddingHorizontal: 16, paddingVertical: 11, borderRadius: 999, backgroundColor: 'rgba(15,15,17,0.82)' }, darkButtonText: { color: '#FFF', fontWeight: '800' }, badge: { paddingHorizontal: 14, paddingVertical: 11, borderRadius: 999, backgroundColor: '#EC0AAF' }, badgeText: { color: '#FFF', fontSize: 11, fontWeight: '900', letterSpacing: 1 }, reticle: { position: 'absolute', left: '50%', top: '50%', width: 54, height: 54, marginLeft: -27, marginTop: -27, alignItems: 'center', justifyContent: 'center' }, crossH: { position: 'absolute', width: 54, height: 2, backgroundColor: '#FFF' }, crossV: { position: 'absolute', width: 2, height: 54, backgroundColor: '#FFF' }, dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#EC0AAF', borderWidth: 2, borderColor: '#FFF' }, panel: { padding: 18, gap: 12, borderRadius: 22, backgroundColor: 'rgba(15,15,17,0.9)' }, panelTitle: { color: '#FFF', fontSize: 18, fontWeight: '900' }, panelBody: { color: '#D4CFD5', fontSize: 14, lineHeight: 20 }, adjustRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 22 }, adjustButton: { width: 52, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF' }, adjustText: { color: '#171719', fontSize: 28, fontWeight: '700' }, factor: { minWidth: 70, color: '#FFF', textAlign: 'center', fontSize: 23, fontWeight: '900' }, primaryButton: { minHeight: 50, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EC0AAF' }, primaryText: { color: '#FFF', fontWeight: '900' }, disabled: { opacity: 0.4 },
});
