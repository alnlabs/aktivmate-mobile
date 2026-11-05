import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Button, LogoLockup, Sheet } from '@/components/ui';
import { colors } from '@/constants/theme';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const [legal, setLegal] = useState<'terms' | 'privacy' | null>(null);

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 16 }]}>
      <View style={styles.hero}>
        <LogoLockup width={280} />
      </View>
      <View style={styles.actions}>
        {__DEV__ ? <Button label="Mock account" onPress={() => router.push('/setup-profile')} /> : null}
        <Button
          label="Continue with Google"
          variant={__DEV__ ? 'soft' : 'primary'}
          onPress={() => router.push('/sign-in')}
        />
        <AppText variant="bodySm" center>
          <AppText variant="label" color={colors.primary} onPress={() => setLegal('terms')}>
            Terms
          </AppText>
          {'  ·  '}
          <AppText variant="label" color={colors.primary} onPress={() => setLegal('privacy')}>
            Privacy
          </AppText>
        </AppText>
      </View>
      <Sheet visible={legal !== null} title={legal === 'privacy' ? 'Privacy' : 'Terms'} onClose={() => setLegal(null)}>
        <AppText variant="body" color={colors.secondary}>
          {legal === 'privacy'
            ? 'AktivMate reads step counts to power club totals. Readings stay on your device.'
            : 'Be kind in cheers, count your own steps, and leave a challenge whenever you want.'}
        </AppText>
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface, paddingHorizontal: 20, justifyContent: 'space-between' },
  hero: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  actions: { gap: 10 },
});
