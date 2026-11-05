import { Redirect, Stack } from 'expo-router';

import { useApp } from '@/context/AppContext';
import { colors } from '@/constants/theme';
import { signedInHref } from '@/lib/sessionUser';

export default function AuthLayout() {
  const { authReady, session } = useApp();
  if (!authReady) return null;
  if (session) return <Redirect href={signedInHref(session)} />;
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.surface }, animation: 'slide_from_right' }} />
  );
}
