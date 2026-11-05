import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Button, Card, Field, Icon, IconButton, Screen } from '@/components/ui';
import { useApp } from '@/context/AppContext';
import { requestStartupPermissions, type PermissionResult } from '@/lib/permissions';
import { colors } from '@/constants/theme';

export default function SetupReadyScreen() {
  const insets = useSafeAreaInsets();
  const { accountDraft, finishSetup } = useApp();
  const [circle, setCircle] = useState('');
  const [motion, setMotion] = useState<PermissionResult | null>(null);
  const [location, setLocation] = useState<PermissionResult | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void requestStartupPermissions().then((access) => {
      setMotion(access.steps);
      setLocation(access.location);
    });
  }, []);

  async function start() {
    if (!accountDraft) {
      router.replace('/setup');
      return;
    }
    setBusy(true);
    try {
      const ok = await finishSetup(circle);
      if (ok) router.replace('/home');
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <IconButton icon="arrow-back" label="Back" onPress={() => router.back()} />
        <AppText variant="bodySm">Step 2 of 2</AppText>
        <View style={styles.progress}>
          <View style={[styles.progressFill, { width: '100%' }]} />
        </View>
      </View>
      <Screen footer={<Button label={busy ? 'Saving…' : 'Start walking'} disabled={busy} onPress={() => void start()} />}>
        <View>
          <AppText variant="h1">You are set</AppText>
          <AppText variant="body" color={colors.secondary}>
            Location, motion, alerts, and photos are requested once, when AktivMate opens. Your city comes from where you are.
          </AppText>
        </View>
        <Card style={styles.row}>
          <Icon name="location-on" size={22} color={colors.primary} />
          <View style={styles.copy}>
            <AppText variant="label">Location</AppText>
            <AppText variant="bodySm">{location ? accessLabel(location) : 'Checking…'}</AppText>
          </View>
        </Card>
        <Card style={styles.row}>
          <Icon name="directions-walk" size={22} color={colors.primary} />
          <View style={styles.copy}>
            <AppText variant="label">Motion</AppText>
            <AppText variant="bodySm">{motion ? accessLabel(motion) : 'Checking…'}</AppText>
          </View>
        </Card>
        <Field
          label="First circle, optional"
          value={circle}
          onChangeText={setCircle}
          icon="groups"
          placeholder="Leave blank to start solo"
        />
        <AppText variant="bodySm">A circle you name here starts at zero. You can invite people later.</AppText>
      </Screen>
    </View>
  );
}

function accessLabel(result: PermissionResult) {
  if (result === 'granted') return 'Allowed when the app opened';
  if (result === 'denied') return 'Not allowed when the app opened';
  return 'Not available on this device';
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: { paddingHorizontal: 16, gap: 8, paddingBottom: 8 },
  progress: { height: 6, borderRadius: 99, backgroundColor: colors.track, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.primary },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  copy: { flex: 1, gap: 2 },
});
