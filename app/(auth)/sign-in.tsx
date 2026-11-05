import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Button, Icon, LogoMark } from '@/components/ui';
import { useApp } from '@/context/AppContext';
import { colors } from '@/constants/theme';

export default function SignInScreen() {
  const insets = useSafeAreaInsets();
  const { signInWithGoogle } = useApp();
  const [error, setError] = useState<string | null>(null);
  const [googleBusy, setGoogleBusy] = useState(false);

  async function continueWithGoogle() {
    setError(null);
    setGoogleBusy(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed.');
    } finally {
      setGoogleBusy(false);
    }
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 18, paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()} style={styles.back}>
          <Icon name="arrow-back" size={22} color={colors.ink} />
        </Pressable>
        <View style={styles.hero}>
          <LogoMark width={72} />
          <AppText variant="h1">Welcome back</AppText>
          <AppText variant="body" color={colors.secondary}>
            Sign in with Google to walk with your club.
          </AppText>
        </View>
        <Button
          label={googleBusy ? 'Opening Google…' : 'Continue with Google'}
          disabled={googleBusy}
          leading={<AppText variant="h3" color={colors.onPrimary}>G</AppText>}
          onPress={() => {
            void continueWithGoogle();
          }}
        />
        {error ? (
          <AppText variant="bodySm" color={colors.error}>
            {error}
          </AppText>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  content: { paddingHorizontal: 20, gap: 16 },
  back: { width: 44, height: 44, alignItems: 'center', justifyContent: 'flex-start' },
  hero: { gap: 6 },
});
