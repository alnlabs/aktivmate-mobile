import { useEffect } from 'react';
import { Redirect, Stack } from 'expo-router';

import { useApp } from '@/context/AppContext';
import { colors } from '@/constants/theme';
import { signedInHref } from '@/lib/sessionUser';

export default function OnboardingLayout() {
  const { authReady, session, loadMockCatalog } = useApp();
  useEffect(() => {
    if (!session) loadMockCatalog();
  }, [loadMockCatalog, session]);
  if (!authReady) return null;
  if (session) return <Redirect href={signedInHref(session)} />;
  if (!__DEV__) return <Redirect href="/welcome" />;
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.surface }, animation: 'slide_from_right' }} />
  );
}
