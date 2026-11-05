import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Redirect, Tabs } from 'expo-router';
import { ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconName } from '@/components/icons';
import { useApp } from '@/context/AppContext';
import { colors, fonts } from '@/constants/theme';
import { signedInHref } from '@/lib/sessionUser';

function tabIcon(name: IconName) {
  return ({ color }: { focused: boolean; color: ColorValue; size: number }) => (
    <MaterialIcons name={name} size={23} color={typeof color === 'string' ? color : colors.primary} />
  );
}

export default function TabLayout() {
  const { authReady, session } = useApp();
  const insets = useSafeAreaInsets();

  if (!authReady) return null;
  if (!session) return <Redirect href="/welcome" />;
  if (!session.preview && !session.onboarded) return <Redirect href={signedInHref(session)} />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.outline,
        tabBarLabelStyle: {
          fontFamily: fonts.medium,
          fontSize: 9,
          lineHeight: 11,
        },
        tabBarStyle: {
          backgroundColor: '#f7fdf9',
          borderTopColor: colors.stroke,
          borderTopWidth: 1,
          height: 64 + insets.bottom,
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 8),
        },
      }}>
      <Tabs.Screen name="home" options={{ title: 'Home', tabBarIcon: tabIcon('home') }} />
      <Tabs.Screen name="groups" options={{ title: 'Groups', tabBarIcon: tabIcon('groups') }} />
      <Tabs.Screen name="challenges" options={{ title: 'Challenges', tabBarIcon: tabIcon('emoji-events') }} />
      <Tabs.Screen name="achievements" options={{ title: 'Achievements', tabBarIcon: tabIcon('military-tech') }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: tabIcon('account-circle') }} />
    </Tabs>
  );
}
