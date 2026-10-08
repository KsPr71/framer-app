import { Image } from 'expo-image';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const FEATURES = [
  ['01', 'Diseña', 'Selecciona varias fotografías y configura medida, orientación, acabado y grosor de cada marco.'],
  ['02', 'Calibra', 'Opcionalmente ajusta la escala AR con una hoja Carta para adaptarla a tu dispositivo.'],
  ['03', 'Visualiza', 'Coloca los cuadros uno a uno y revisa la composición completa sobre la misma pared.'],
] as const;

const TECHNOLOGIES = [
  'Expo SDK 57',
  'React Native 0.86',
  'React 19',
  'Expo Router',
  'ViroReact',
  'Google ARCore',
  'TypeScript',
] as const;

export default function AboutScreen() {
  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <Image source={require('@/assets/images/logo.png')} style={styles.logo} contentFit="contain" />
            <Text style={styles.kicker}>FRAMEART</Text>
            <Text style={styles.title}>Imagina tu pared antes de colgar el primer cuadro.</Text>
            <Text style={styles.intro}>Una herramienta privada y visual para probar fotografías, medidas y composiciones a escala mediante realidad aumentada.</Text>
          </View>

          <View style={styles.featureList}>
            {FEATURES.map(([number, title, body]) => (
              <View key={number} style={styles.featureCard}>
                <Text style={styles.featureNumber}>{number}</Text>
                <View style={styles.featureCopy}>
                  <Text style={styles.featureTitle}>{title}</Text>
                  <Text style={styles.featureBody}>{body}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.privacyCard}>
            <View style={styles.privacyHeader}>
              <View style={styles.privacyDot} />
              <Text style={styles.privacyTitle}>Tus fotos permanecen en tu dispositivo</Text>
            </View>
            <Text style={styles.privacyBody}>FrameARt utiliza las imágenes seleccionadas localmente para crear la previsualización. No necesita enviarlas a un servidor.</Text>
          </View>

          <View style={styles.technologySection}>
            <Text style={styles.sectionKicker}>TECNOLOGÍAS</Text>
            <Text style={styles.sectionTitle}>Construida para experiencias móviles en realidad aumentada</Text>
            <View style={styles.technologyGrid}>
              {TECHNOLOGIES.map((technology) => (
                <View key={technology} style={styles.technologyChip}>
                  <View style={styles.technologyDot} />
                  <Text style={styles.technologyText}>{technology}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.creatorCard}>
            <Text style={styles.creatorKicker}>CREADO POR</Text>
            <Text style={styles.creatorName}>Jorge A. Casares Delgado</Text>
            <Text style={styles.companyName}>NOVADEV</Text>
            <Text style={styles.creatorBody}>Diseño, desarrollo e integración de la experiencia FrameARt.</Text>
          </View>

          <View style={styles.infoRow}>
            <View><Text style={styles.infoLabel}>VERSIÓN</Text><Text style={styles.infoValue}>1.0.0</Text></View>
            <View style={styles.infoRight}><Text style={styles.infoLabel}>PLATAFORMA</Text><Text style={styles.infoValue}>Android · ARCore</Text></View>
          </View>

          <Text style={styles.footer}>Hecho para probar, comparar y componer con confianza.</Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F7F5F8' },
  safeArea: { flex: 1 },
  content: { padding: 20, paddingBottom: 130, width: '100%', maxWidth: 720, alignSelf: 'center' },
  hero: { padding: 24, paddingTop: 18, borderRadius: 28, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E9E4EA', overflow: 'hidden' },
  logo: { width: 132, height: 90, marginLeft: -25, marginBottom: 4 },
  kicker: { color: '#EC0AAF', fontSize: 11, fontWeight: '900', letterSpacing: 2.4 },
  title: { color: '#171719', fontSize: 34, lineHeight: 39, fontWeight: '900', letterSpacing: -1, marginTop: 10 },
  intro: { color: '#625D64', fontSize: 15, lineHeight: 23, marginTop: 14, maxWidth: 580 },
  featureList: { gap: 12, marginTop: 18 },
  featureCard: { flexDirection: 'row', gap: 15, padding: 18, borderRadius: 20, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E9E4EA' },
  featureNumber: { color: '#EC0AAF', fontSize: 13, fontWeight: '900', letterSpacing: 1 },
  featureCopy: { flex: 1, gap: 5 },
  featureTitle: { color: '#171719', fontSize: 17, fontWeight: '900' },
  featureBody: { color: '#686269', fontSize: 14, lineHeight: 21 },
  privacyCard: { marginTop: 18, padding: 20, gap: 10, borderRadius: 22, backgroundColor: '#1D1D20', borderWidth: 2, borderColor: '#EC0AAF' },
  privacyHeader: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  privacyDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#EC0AAF' },
  privacyTitle: { flex: 1, color: '#FFF', fontSize: 16, fontWeight: '900' },
  privacyBody: { color: '#CFCAD0', fontSize: 14, lineHeight: 21 },
  technologySection: { marginTop: 26 },
  sectionKicker: { color: '#EC0AAF', fontSize: 10, fontWeight: '900', letterSpacing: 1.8 },
  sectionTitle: { color: '#171719', fontSize: 21, lineHeight: 27, fontWeight: '900', marginTop: 7 },
  technologyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginTop: 15 },
  technologyChip: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 999, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E5DFE6' },
  technologyDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#EC0AAF' },
  technologyText: { color: '#3A363B', fontSize: 12, fontWeight: '800' },
  creatorCard: { marginTop: 22, padding: 22, borderRadius: 24, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E5DFE6' },
  creatorKicker: { color: '#99939B', fontSize: 10, fontWeight: '900', letterSpacing: 1.8 },
  creatorName: { color: '#171719', fontSize: 21, lineHeight: 27, fontWeight: '900', marginTop: 8 },
  companyName: { color: '#EC0AAF', fontSize: 15, fontWeight: '900', letterSpacing: 1.6, marginTop: 3 },
  creatorBody: { color: '#686269', fontSize: 13, lineHeight: 20, marginTop: 10 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24, paddingHorizontal: 4 },
  infoRight: { alignItems: 'flex-end' },
  infoLabel: { color: '#99939B', fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  infoValue: { color: '#29262A', fontSize: 13, fontWeight: '800', marginTop: 4 },
  footer: { color: '#8A848C', fontSize: 12, textAlign: 'center', marginTop: 32 },
});
