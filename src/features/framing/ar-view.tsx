import {
  isARSupportedOnDevice,
  requestRequiredPermissions,
  ViroARScene,
  ViroARSceneNavigator,
  ViroBox,
  ViroImage,
  ViroMaterials,
  ViroNode,
  ViroTrackingStateConstants,
  type ViroCameraARHitTest,
  type ViroTrackingReason,
  type ViroTrackingState,
} from '@reactvision/react-viro';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import type { FrameDesign } from './catalog';
import { orientedDimensions } from './catalog';

type ARStatus = 'checking' | 'scanning' | 'ready' | 'placed' | 'limited' | 'unsupported' | 'denied' | 'error';

type SceneAppProps = {
  calibrationFactor: number;
  designs: FrameDesign[];
  editingEnabled: boolean;
  placementRequest: number;
  selectedFrameId?: string;
  updateCurrentIndex: (index: number) => void;
  updateSelectedFrameId: (id?: string) => void;
  updateStatus: (status: ARStatus) => void;
};

type SceneProps = { sceneNavigator?: { viroAppProps: SceneAppProps } };
type Placement = { position: [number, number, number]; rotation: [number, number, number] };
type PlacedFrame = { design: FrameDesign; placement: Placement };

ViroMaterials.createMaterials({
  'frame-natural-oak': { diffuseColor: '#B98651', roughness: 0.72, metalness: 0 },
  'frame-gallery-black': { diffuseColor: '#1D1D1B', roughness: 0.52, metalness: 0.05 },
  'frame-classic-white': { diffuseColor: '#F0EEE7', roughness: 0.68, metalness: 0 },
  'inner-bevel-shadow': { lightingModel: 'Constant', diffuseColor: 'rgba(0,0,0,0.22)', blendMode: 'Alpha' },
  'inner-bevel-highlight': { lightingModel: 'Constant', diffuseColor: 'rgba(255,255,255,0.16)', blendMode: 'Alpha' },
  'placement-guide': { lightingModel: 'Constant', diffuseColor: 'rgba(34, 133, 255, 0.28)', blendMode: 'Alpha', cullMode: 'None' },
  'selection-outline': { lightingModel: 'Constant', diffuseColor: '#EC0AAF' },
});

export function ARView({ calibrationFactor, designs, onClose }: { calibrationFactor: number; designs: FrameDesign[]; onClose: () => void }) {
  const [status, setStatus] = useState<ARStatus>('checking');
  const [placementRequest, setPlacementRequest] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionKey, setSessionKey] = useState(0);
  const [navigatorMounted, setNavigatorMounted] = useState(true);
  const [closing, setClosing] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [editingEnabled, setEditingEnabled] = useState(false);
  const [selectedFrameId, setSelectedFrameId] = useState<string>();
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const navigatorRef = useRef<ViroARSceneNavigator | null>(null);
  const currentDesign = designs[currentIndex] ?? designs[0];

  useEffect(() => {
    let active = true;
    const prepare = async () => {
      try {
        const support = await isARSupportedOnDevice();
        if (!active) return;
        if (!support.isARSupported) return setStatus('unsupported');
        const permissions = await requestRequiredPermissions(['camera']);
        if (active) setStatus(permissions.camera ? 'scanning' : 'denied');
      } catch {
        if (active) setStatus('error');
      }
    };
    prepare();
    return () => {
      active = false;
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, [sessionKey]);

  const closeSafely = () => {
    if (closing) return;
    setClosing(true);
    setNavigatorMounted(false);
    closeTimer.current = setTimeout(onClose, 250);
  };

  const restart = () => {
    setNavigatorMounted(false);
    setStatus('checking');
    setCurrentIndex(0);
    setPlacementRequest(0);
    setEditingEnabled(false);
    setSelectedFrameId(undefined);
    setSessionKey((current) => current + 1);
    setTimeout(() => setNavigatorMounted(true), 0);
  };

  const canRenderAR = status === 'scanning' || status === 'ready' || status === 'placed' || status === 'limited';
  const hasPlacedFrame = currentIndex > 0 || status === 'placed';

  const captureComposition = async () => {
    if (capturing || !navigatorRef.current) return;
    setCapturing(true);
    try {
      const result = await navigatorRef.current.arSceneNavigator.takeScreenshot(`frameart-${Date.now()}`, true);
      if (result?.success === false) throw new Error(`Viro screenshot error: ${result.errorCode ?? 'unknown'}`);
      Alert.alert('Captura guardada', 'La composición se guardó en la galería del dispositivo.');
    } catch {
      Alert.alert('No se pudo guardar', 'Comprueba el acceso a fotos y vuelve a intentarlo.');
    } finally {
      setCapturing(false);
    }
  };

  return (
    <View style={styles.container}>
      {canRenderAR && navigatorMounted ? (
        <ViroARSceneNavigator
          ref={navigatorRef}
          key={sessionKey}
          style={StyleSheet.absoluteFill}
          initialScene={{ scene: FrameARScene }}
          provider="none"
          viroAppProps={{ calibrationFactor, designs, editingEnabled, placementRequest, selectedFrameId, updateCurrentIndex: setCurrentIndex, updateSelectedFrameId: setSelectedFrameId, updateStatus: setStatus }}
        />
      ) : (
        <View style={styles.fallback}>
          {(status === 'checking' || closing) && <ActivityIndicator size="large" color="#EC0AAF" />}
          <Text style={styles.fallbackTitle}>{closing ? 'Cerrando cámara' : statusTitle(status)}</Text>
          {!closing && <Text style={styles.fallbackBody}>{statusMessage(status)}</Text>}
          {(status === 'denied' || status === 'error') && <Pressable onPress={restart} style={styles.retryButton}><Text style={styles.retryText}>Intentar de nuevo</Text></Pressable>}
        </View>
      )}

      {!closing && (
        <View pointerEvents="box-none" style={styles.overlay}>
          <View style={styles.topBar}>
            <Pressable accessibilityRole="button" onPress={closeSafely} style={styles.overlayButton}><Text style={styles.overlayButtonText}>‹ Volver</Text></Pressable>
            <View style={styles.topActions}>
              {hasPlacedFrame && <Pressable accessibilityLabel="Guardar captura en la galería" accessibilityRole="button" disabled={capturing} onPress={captureComposition} style={[styles.captureButton, capturing && styles.captureButtonDisabled]}><View style={styles.cameraIcon}><View style={styles.cameraLens} /></View></Pressable>}
              <View style={styles.statusPill}><View style={[styles.statusDot, status === 'placed' && styles.statusDotPlaced]} /><Text style={styles.statusText}>{statusTitle(status)}</Text></View>
            </View>
          </View>

          {canRenderAR && currentDesign && (
            <>
              {status !== 'placed' && <View pointerEvents="none" style={styles.reticle}><View style={styles.reticleHorizontal} /><View style={styles.reticleVertical} /><View style={styles.reticleDot} /></View>}
              <View style={styles.bottomPanel}>
                <Text style={styles.instruction}>{status === 'placed' && editingEnabled ? selectedFrameId ? 'Arrastra el cuadro seleccionado por la pared. Toca otro cuadro para editarlo.' : 'Toca un cuadro para seleccionarlo y luego arrástralo por la pared.' : statusMessage(status)}</Text>
                <Text style={styles.measure}>Cuadro {Math.min(currentIndex + 1, designs.length)} de {designs.length} · {currentDesign.size.label} · {currentDesign.thickness.label}</Text>
                {status === 'ready' && <Pressable accessibilityRole="button" onPress={() => setPlacementRequest((current) => current + 1)} style={styles.placeButton}><Text style={styles.placeText}>Colocar aquí</Text></Pressable>}
                {status === 'placed' && <Pressable accessibilityRole="button" onPress={() => { setEditingEnabled((current) => !current); setSelectedFrameId(undefined); }} style={[styles.placeButton, editingEnabled && styles.lockButton]}><Text style={[styles.placeText, editingEnabled && styles.lockText]}>{editingEnabled ? 'Bloquear posiciones' : 'Ajustar cuadros'}</Text></Pressable>}
                <Pressable accessibilityRole="button" onPress={restart} style={styles.repositionButton}><Text style={styles.repositionText}>Reiniciar composición</Text></Pressable>
              </View>
            </>
          )}
        </View>
      )}
    </View>
  );
}

function FrameARScene(props?: SceneProps) {
  const app = props?.sceneNavigator?.viroAppProps;
  const candidateRef = useRef<Placement | undefined>(undefined);
  const lastHandledRequest = useRef(0);
  const lastGuideUpdate = useRef(0);
  const [guide, setGuide] = useState<Placement>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [placedFrames, setPlacedFrames] = useState<PlacedFrame[]>([]);
  const currentDesign = app?.designs[currentIndex];
  const complete = Boolean(app && currentIndex >= app.designs.length);

  useEffect(() => {
    if (!app || app.placementRequest === lastHandledRequest.current) return;
    lastHandledRequest.current = app.placementRequest;
    const candidate = candidateRef.current;
    const design = app.designs[currentIndex];
    if (!candidate || !design) return;

    setPlacedFrames((current) => [...current, { design, placement: candidate }]);
    candidateRef.current = undefined;
    setGuide(undefined);
    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    app.updateCurrentIndex(Math.min(nextIndex, app.designs.length - 1));
    app.updateStatus(nextIndex >= app.designs.length ? 'placed' : 'scanning');
  }, [app, currentIndex]);

  if (!app || !currentDesign && !complete) return <ViroARScene />;

  const rawDimensions = currentDesign ? orientedDimensions(currentDesign.size, currentDesign.orientation) : undefined;
  const dimensions = rawDimensions ? {
    widthM: rawDimensions.widthM * app.calibrationFactor,
    heightM: rawDimensions.heightM * app.calibrationFactor,
  } : undefined;
  const onTrackingUpdated = (trackingState: ViroTrackingState, _reason: ViroTrackingReason) => {
    if (complete) return;
    if (trackingState === ViroTrackingStateConstants.TRACKING_LIMITED) app.updateStatus('limited');
    else if (trackingState !== ViroTrackingStateConstants.TRACKING_NORMAL) app.updateStatus('scanning');
  };

  const onCameraARHitTest = (event: ViroCameraARHitTest) => {
    if (complete) return;
    const hit = event.hitTestResults.find((result) => result.type === 'ExistingPlaneUsingExtent' || result.type === 'ExistingPlane');
    if (!hit) return;
    const position = hit.transform.position;
    const camera = event.cameraOrientation.position;
    const next: Placement = {
      position: [position[0], position[1], position[2]],
      rotation: [0, (Math.atan2(camera[0] - position[0], camera[2] - position[2]) * 180) / Math.PI, 0],
    };
    candidateRef.current = next;
    app.updateStatus('ready');
    const now = Date.now();
    if (now - lastGuideUpdate.current > 100) {
      lastGuideUpdate.current = now;
      setGuide(next);
    }
  };

  const selectFrame = (id: string) => {
    if (app.editingEnabled) app.updateSelectedFrameId(id);
  };

  const moveFrame = (id: string, position: [number, number, number]) => {
    if (!app.editingEnabled || app.selectedFrameId !== id) return;
    setPlacedFrames((current) => current.map((item) => item.design.id === id ? { ...item, placement: { ...item.placement, position } } : item));
  };

  return (
    <ViroARScene anchorDetectionTypes="PlanesVertical" onTrackingUpdated={onTrackingUpdated} onCameraARHitTest={onCameraARHitTest}>
      {!complete && guide && dimensions && <ViroNode position={guide.position} rotation={guide.rotation}><ViroBox width={dimensions.widthM} height={dimensions.heightM} length={0.006} materials={['placement-guide']} /></ViroNode>}
      {placedFrames.map((item) => {
        const selected = app.editingEnabled && app.selectedFrameId === item.design.id;
        const yaw = (item.placement.rotation[1] * Math.PI) / 180;
        return (
          <ViroNode
            key={item.design.id}
            position={item.placement.position}
            rotation={item.placement.rotation}
            onClick={() => selectFrame(item.design.id)}
            {...(selected ? {
              dragType: 'FixedToPlane' as const,
              dragPlane: { planePoint: item.placement.position, planeNormal: [Math.sin(yaw), 0, Math.cos(yaw)] as [number, number, number], maxDistance: 10 },
              onDrag: (position: [number, number, number]) => moveFrame(item.design.id, position),
            } : {})}>
            <FrameGeometry calibrationFactor={app.calibrationFactor} design={item.design} selected={selected} />
          </ViroNode>
        );
      })}
    </ViroARScene>
  );
}

function FrameGeometry({ calibrationFactor, design, selected = false }: { calibrationFactor: number; design: FrameDesign; selected?: boolean }) {
  const rawDimensions = orientedDimensions(design.size, design.orientation);
  const dimensions = { widthM: rawDimensions.widthM * calibrationFactor, heightM: rawDimensions.heightM * calibrationFactor };
  const border = design.thickness.widthM * calibrationFactor;
  const material = `frame-${design.frame.id}`;
  const depth = 0.018;
  const bevel = Math.min(border * 0.18, 0.006 * calibrationFactor);
  const outerWidth = dimensions.widthM + border * 2;
  const outerHeight = dimensions.heightM + border * 2;
  const outline = 0.004;
  return (
    <ViroNode position={[0, 0, 0.012]}>
      <ViroImage source={{ uri: design.photoUri }} width={dimensions.widthM} height={dimensions.heightM} resizeMode={design.fit === 'cover' ? 'ScaleToFill' : 'ScaleToFit'} imageClipMode="ClipToBounds" />
      <ViroBox width={dimensions.widthM + border * 2} height={border} length={depth} position={[0, dimensions.heightM / 2 + border / 2, 0.009]} materials={[material]} />
      <ViroBox width={dimensions.widthM + border * 2} height={border} length={depth} position={[0, -dimensions.heightM / 2 - border / 2, 0.009]} materials={[material]} />
      <ViroBox width={border} height={dimensions.heightM} length={depth} position={[-dimensions.widthM / 2 - border / 2, 0, 0.009]} materials={[material]} />
      <ViroBox width={border} height={dimensions.heightM} length={depth} position={[dimensions.widthM / 2 + border / 2, 0, 0.009]} materials={[material]} />
      <ViroBox width={dimensions.widthM} height={bevel} length={0.004} position={[0, dimensions.heightM / 2 + bevel / 2, 0.019]} materials={['inner-bevel-shadow']} />
      <ViroBox width={bevel} height={dimensions.heightM} length={0.004} position={[-dimensions.widthM / 2 - bevel / 2, 0, 0.019]} materials={['inner-bevel-shadow']} />
      <ViroBox width={dimensions.widthM} height={bevel} length={0.004} position={[0, -dimensions.heightM / 2 - bevel / 2, 0.019]} materials={['inner-bevel-highlight']} />
      <ViroBox width={bevel} height={dimensions.heightM} length={0.004} position={[dimensions.widthM / 2 + bevel / 2, 0, 0.019]} materials={['inner-bevel-highlight']} />
      {selected && <>
        <ViroBox width={outerWidth + outline * 2} height={outline} length={0.004} position={[0, outerHeight / 2 + outline / 2, 0.022]} materials={['selection-outline']} />
        <ViroBox width={outerWidth + outline * 2} height={outline} length={0.004} position={[0, -outerHeight / 2 - outline / 2, 0.022]} materials={['selection-outline']} />
        <ViroBox width={outline} height={outerHeight} length={0.004} position={[-outerWidth / 2 - outline / 2, 0, 0.022]} materials={['selection-outline']} />
        <ViroBox width={outline} height={outerHeight} length={0.004} position={[outerWidth / 2 + outline / 2, 0, 0.022]} materials={['selection-outline']} />
      </>}
    </ViroNode>
  );
}

function statusTitle(status: ARStatus) {
  return ({ checking: 'Comprobando AR', scanning: 'Apunta a la pared', ready: 'Posición lista', placed: 'Composición colocada', limited: 'Seguimiento limitado', unsupported: 'AR no disponible', denied: 'Cámara bloqueada', error: 'No se pudo iniciar AR' } satisfies Record<ARStatus, string>)[status];
}

function statusMessage(status: ARStatus) {
  return ({ checking: 'Estamos comprobando el dispositivo y el permiso de cámara.', scanning: 'Mueve el teléfono lentamente y alinea la cruz con la pared.', ready: 'Alinea la cruz con el rectángulo azul y pulsa Colocar aquí.', placed: 'Todos los cuadros quedaron colocados. Muévete alrededor para revisar la composición.', limited: 'Muévete más despacio y busca una pared con textura o mejor iluminación.', unsupported: 'Este dispositivo no informa compatibilidad con ARCore.', denied: 'Activa el permiso de cámara desde los ajustes del dispositivo.', error: 'Cierra esta vista e inténtalo otra vez.' } satisfies Record<ARStatus, string>)[status];
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111113' }, fallback: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 34, gap: 13 }, fallbackTitle: { color: '#FFF', fontSize: 24, fontWeight: '800', textAlign: 'center' }, fallbackBody: { color: '#CFCAD0', fontSize: 15, lineHeight: 22, textAlign: 'center' }, retryButton: { marginTop: 10, backgroundColor: '#EC0AAF', paddingHorizontal: 20, paddingVertical: 13, borderRadius: 14 }, retryText: { color: '#FFF', fontWeight: '800' },
  overlay: { position: 'absolute', inset: 0, justifyContent: 'space-between', padding: 18, paddingTop: 54, paddingBottom: 34 }, topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, topActions: { flexDirection: 'row', alignItems: 'center', gap: 8 }, overlayButton: { backgroundColor: 'rgba(22, 18, 14, 0.78)', paddingHorizontal: 15, paddingVertical: 11, borderRadius: 999 }, overlayButtonText: { color: '#FFF', fontSize: 14, fontWeight: '800' }, captureButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EC0AAF', borderWidth: 2, borderColor: '#FFF' }, captureButtonDisabled: { opacity: 0.55 }, cameraIcon: { width: 22, height: 16, alignItems: 'center', justifyContent: 'center', borderRadius: 4, backgroundColor: '#FFF' }, cameraLens: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#EC0AAF', borderWidth: 1, borderColor: '#B50787' }, statusPill: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: 'rgba(22, 18, 14,0.78)', paddingHorizontal: 13, paddingVertical: 10, borderRadius: 999 }, statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E5AD63' }, statusDotPlaced: { backgroundColor: '#78C57C' }, statusText: { color: '#FFF', fontSize: 12, fontWeight: '800' },
  reticle: { position: 'absolute', left: '50%', top: '50%', width: 54, height: 54, marginLeft: -27, marginTop: -27, alignItems: 'center', justifyContent: 'center' }, reticleHorizontal: { position: 'absolute', width: 54, height: 2, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.9)' }, reticleVertical: { position: 'absolute', width: 2, height: 54, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.9)' }, reticleDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#237DE8', borderWidth: 2, borderColor: '#FFF' },
  bottomPanel: { backgroundColor: 'rgba(17,17,19,0.9)', borderRadius: 20, padding: 17, gap: 8, borderWidth: 1, borderColor: 'rgba(236,10,175,0.5)' }, instruction: { color: '#FFF', fontSize: 14, lineHeight: 20, fontWeight: '600' }, measure: { color: '#CFCAD0', fontSize: 12, fontWeight: '700' }, placeButton: { marginTop: 4, minHeight: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EC0AAF', borderRadius: 13 }, placeText: { color: '#FFF', fontWeight: '900' }, lockButton: { backgroundColor: '#FFF' }, lockText: { color: '#171719' }, repositionButton: { marginTop: 4, minHeight: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF', borderRadius: 13 }, repositionText: { color: '#171719', fontWeight: '800' },
});
