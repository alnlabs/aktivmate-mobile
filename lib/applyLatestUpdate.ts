import * as Updates from 'expo-updates';
import { Platform } from 'react-native';

const CHECK_TIMEOUT_MS = 12000;

export async function applyLatestUpdate() {
  if (__DEV__ || Platform.OS === 'web' || !Updates.isEnabled) return;
  const result = await Promise.race([
    Updates.checkForUpdateAsync(),
    new Promise<null>((resolve) => setTimeout(() => resolve(null), CHECK_TIMEOUT_MS)),
  ]);
  if (!result?.isAvailable) return;
  await Updates.fetchUpdateAsync();
  await Updates.reloadAsync();
}
