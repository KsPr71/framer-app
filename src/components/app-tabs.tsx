import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  return (
    <NativeTabs
      backgroundColor={colors.background}
      iconColor={{ default: '#102CCC', selected: '#FFFFFF' }}
      indicatorColor="#EC0AAF"
      rippleColor="rgba(236, 10, 175, 0.14)"
      titlePositionAdjustment={{ vertical: 2 }}
      labelStyle={{
        default: { color: colors.textSecondary },
        selected: { color: '#171719', fontWeight: '800' },
      }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Diseñar</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/vector.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="about">
        <NativeTabs.Trigger.Label>Acerca de</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/computadora.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
