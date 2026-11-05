import { useEffect } from 'react';
import { Redirect, Stack } from 'expo-router';

import { useApp } from '@/context/AppContext';
import { colors } from '@/constants/theme';
import { signedInHref } from '@/lib/sessionUser';

export default function SetupLayout() {
  const { authReady, session, accountDraft, setAccountDraft } = useApp();

  useEffect(() => {
    if (session && !session.preview && !session.onboarded && !accountDraft) setAccountDraft({});
  }, [accountDraft, session, setAccountDraft]);

  if (!authReady) return null;
  if (!session) return <Redirect href="/welcome" />;
  if (session.preview || session.onboarded) return <Redirect href={signedInHref(session)} />;

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.surface }, animation: 'slide_from_right' }} />
  );
}
