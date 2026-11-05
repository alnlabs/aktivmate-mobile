import { router, Stack } from 'expo-router';
import { View } from 'react-native';

import { AppText, Button } from '@/components/ui';
import { colors } from '@/constants/theme';

export default function NotFound() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 }}>
      <Stack.Screen options={{ headerShown: false }} />
      <AppText variant="h2" center>
        This page wandered off the path.
      </AppText>
      <Button label="Back to AktivMate" onPress={() => router.replace('/')} />
    </View>
  );
}
