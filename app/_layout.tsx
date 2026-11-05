import { Fraunces_600SemiBold, Fraunces_700Bold } from '@expo-google-fonts/fraunces';
import { Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold } from '@expo-google-fonts/outfit';
import { useFonts } from 'expo-font';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState, type ReactNode } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { AppText, Icon, LogoLockup } from '@/components/ui';
import { AppProvider, useApp } from '@/context/AppContext';
import { colors, radius } from '@/constants/theme';
import { applyLatestUpdate } from '@/lib/applyLatestUpdate';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

let webSplashShown = false;

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.surface,
    card: colors.card,
    text: colors.ink,
    border: colors.stroke,
    primary: colors.primary,
    notification: colors.primary,
  },
};

export default function RootLayout() {
  const [splash, setSplash] = useState(Platform.OS === 'web' && !webSplashShown);
  const [updateReady, setUpdateReady] = useState(__DEV__ || Platform.OS === 'web');
  const [fontsLoaded, fontError] = useFonts({
    Fraunces_600SemiBold,
    Fraunces_700Bold,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });
  const fontsReady = fontsLoaded || !!fontError;

  useEffect(() => {
    if (updateReady) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      if (!cancelled) setUpdateReady(true);
    }, 12000);
    void applyLatestUpdate()
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setUpdateReady(true);
      });
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [updateReady]);

  useEffect(() => {
    if (!fontsReady || !updateReady) return;
    if (!splash) {
      SplashScreen.hideAsync();
      return;
    }
    const timer = setTimeout(() => {
      webSplashShown = true;
      setSplash(false);
    }, 1100);
    return () => clearTimeout(timer);
  }, [splash, fontsReady, updateReady]);

  if (!fontsReady || !updateReady) return null;

  if (splash) {
    return (
      <View style={styles.splash}>
        <LogoLockup width={260} />
      </View>
    );
  }

  return (
    <AppProvider>
      <ThemeProvider value={navTheme}>
        <AppShell>
          <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.surface } }}>
              <Stack.Screen name="index" options={{ animation: 'none' }} />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(onboarding)" />
              <Stack.Screen name="(tabs)" />
            </Stack>
            <ToastBanner />
        </AppShell>
      </ThemeProvider>
    </AppProvider>
  );
}

function AppShell({ children }: { children: ReactNode }) {
  const { width } = useWindowDimensions();
  const framed = Platform.OS === 'web' && width > 640;
  if (!framed) return <View style={styles.shell}>{children}</View>;
  return (
    <View style={styles.canvas}>
      <View style={styles.phone}>{children}</View>
    </View>
  );
}

function ToastBanner() {
  const { toast } = useApp();
  const insets = useSafeAreaInsets();
  if (!toast) return null;
  return (
    <View pointerEvents="none" style={[styles.toastWrap, { bottom: insets.bottom + 78 }]}>
      <View style={styles.toast}>
        <Icon name="check-circle" size={18} color={colors.highlight} />
        <AppText variant="label" color={colors.onPrimary} style={styles.toastText}>
          {toast}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  shell: { flex: 1, backgroundColor: colors.surface },
  canvas: { flex: 1, backgroundColor: '#d5ddd8', alignItems: 'center' },
  phone: { flex: 1, width: '100%', maxWidth: 390, backgroundColor: colors.surface },
  toastWrap: { position: 'absolute', left: 16, right: 16, alignItems: 'center', zIndex: 40 },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.ink,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: 420,
  },
  toastText: { flexShrink: 1 },
});
