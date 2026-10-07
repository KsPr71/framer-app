import { Image } from 'expo-image';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const STEPS = [
  ['1', 'Elige una foto', 'Se procesa en tu dispositivo y no se envía a ningún servidor.'],
  ['2', 'Configura el marco', 'Compara estilos, tamaños, orientación y encuadre en la vista previa.'],
  ['3', 'Visualiza en tu pared', 'La integración AR se habilitará en una development build para Android con ARCore.'],
] as const;

export default function AboutScreen() {
  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <Image source={require('@/assets/images/logo.png')} style={styles.logo} contentFit="contain" />
          <Text style={styles.eyebrow}>CÓMO FUNCIONA</Text>
          <Text style={styles.title}>Tu foto, a escala y antes de colgarla.</Text>
          <Text style={styles.intro}>
            FrameARt te ayuda a preparar una composición con medidas reales y permite calibrar opcionalmente la escala para tu dispositivo.
          </Text>

          <View style={styles.steps}>
            {STEPS.map(([number, title, body]) => (
              <View key={number} style={styles.step}>
                <View style={styles.number}><Text style={styles.numberText}>{number}</Text></View>
                <View style={styles.stepCopy}>
                  <Text style={styles.stepTitle}>{title}</Text>
                  <Text style={styles.stepBody}>{body}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.notice}>
            <Text style={styles.noticeTitle}>Estado de esta versión</Text>
            <Text style={styles.noticeBody}>
              Incluye selección local de foto, tres acabados, doce medidas en pulgadas, orientación, modos rellenar/encajar y colocación sobre paredes detectadas. La vista AR requiere una development build y un Android compatible con ARCore.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F7F5F8' },
  safeArea: { flex: 1 },
  content: { padding: 24, paddingBottom: 120, width: '100%', maxWidth: 720, alignSelf: 'center' },
  logo: { width: 108, height: 76, marginLeft: -18 },
  eyebrow: { color: '#EC0AAF', fontSize: 11, fontWeight: '900', letterSpacing: 2, marginTop: 8 },
  title: { color: '#171719', fontSize: 38, lineHeight: 43, fontWeight: '900', letterSpacing: -1.1, marginTop: 10 },
  intro: { color: '#625B53', fontSize: 16, lineHeight: 25, marginTop: 16 },
  steps: { marginTop: 36, gap: 14 },
  step: { flexDirection: 'row', gap: 15, padding: 17, backgroundColor: '#FFF', borderRadius: 18, borderWidth: 1, borderColor: '#E7E1D8' },
  number: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#FCE4F6', alignItems: 'center', justifyContent: 'center' },
  numberText: { color: '#B40786', fontSize: 14, fontWeight: '900' },
  stepCopy: { flex: 1, gap: 4 },
  stepTitle: { color: '#2A241F', fontSize: 16, fontWeight: '800' },
  stepBody: { color: '#6D665E', fontSize: 14, lineHeight: 21 },
  notice: { marginTop: 24, padding: 20, backgroundColor: '#1D1D20', borderRadius: 20, gap: 7, borderWidth: 2, borderColor: '#EC0AAF' },
  noticeTitle: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  noticeBody: { color: '#CFC6BA', fontSize: 14, lineHeight: 21 },
});
