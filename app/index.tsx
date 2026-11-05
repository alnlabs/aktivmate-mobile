import { Redirect } from 'expo-router';

import { useApp } from '@/context/AppContext';
import { signedInHref } from '@/lib/sessionUser';

export default function Index() {
  const { authReady, session } = useApp();
  if (!authReady) return null;
  if (session) return <Redirect href={signedInHref(session)} />;
  return <Redirect href="/welcome" />;
}
