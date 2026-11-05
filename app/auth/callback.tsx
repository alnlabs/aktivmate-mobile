import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { router, useGlobalSearchParams } from 'expo-router';

import { AppText, Button } from '@/components/ui';
import { colors } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { createSessionFromUrl, expoGoHandoffUrl, hasAuthPayload } from '@/lib/googleAuth';
import { signedInHref } from '@/lib/sessionUser';

WebBrowser.maybeCompleteAuthSession();

export default function AuthCallback() {
  const params = useGlobalSearchParams();
  const linkedUrl = Linking.useLinkingURL();
  const { session } = useApp();
  const [error, setError] = useState<string | null>(null);
  const incoming = incomingAuthUrl(params, linkedUrl);
  const handoff = shouldHandOffToApp(incoming);

  useEffect(() => {
    if (session) router.replace(signedInHref(session));
  }, [session]);

  useEffect(() => {
    if (session || handoff || !incoming || !hasAuthPayload(incoming)) return;
    let cancelled = false;
    createSessionFromUrl(incoming).catch((err: unknown) => {
      if (!cancelled) setError(err instanceof Error ? err.message : 'Could not finish Google sign-in.');
    });
    return () => {
      cancelled = true;
    };
  }, [handoff, incoming, session]);

  useEffect(() => {
    if (session || error || (incoming && hasAuthPayload(incoming))) return;
    if (Platform.OS !== 'web' && !linkedUrl) return;
    setError('Google did not return to AktivMate.');
  }, [error, incoming, linkedUrl, session]);

  if (handoff && incoming) {
    const target = expoGoHandoffUrl(incoming);
    return (
      <View style={styles.screen}>
        <AppText variant="h2" center>
          Google is finished
        </AppText>
        <AppText variant="body" center>
          Open AktivMate to complete sign-in.
        </AppText>
        <Button label="Open AktivMate" onPress={() => openApp(target)} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {error ? (
        <>
          <AppText variant="body" center>
            {error}
          </AppText>
          <Button label="Back to sign in" onPress={() => router.replace('/sign-in')} />
        </>
      ) : (
        <>
          <ActivityIndicator color={colors.primary} />
          <AppText variant="bodySm" color={colors.secondary}>
            Signing you in…
          </AppText>
        </>
      )}
    </View>
  );
}

function shouldHandOffToApp(incoming: string | null) {
  if (Platform.OS !== 'web' || typeof navigator === 'undefined') return false;
  if (!incoming || !hasAuthPayload(incoming)) return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function openApp(target: string) {
  if (typeof window !== 'undefined') window.location.href = target;
}

function incomingAuthUrl(params: Record<string, string | string[] | undefined>, linkedUrl: string | null) {
  const fromParams = authUrlFromParams(params);
  if (fromParams) return fromParams;
  if (Platform.OS === 'web' && typeof window !== 'undefined') return window.location.href;
  return linkedUrl && hasAuthPayload(linkedUrl) ? linkedUrl : null;
}

function authUrlFromParams(params: Record<string, string | string[] | undefined>) {
  const code = firstParam(params.code);
  const accessToken = firstParam(params.access_token);
  const refreshToken = firstParam(params.refresh_token);
  const description = firstParam(params.error_description) || firstParam(params.error);
  if (!code && !accessToken && !description) return null;
  const query = new URLSearchParams();
  if (code) query.set('code', code);
  if (accessToken) query.set('access_token', accessToken);
  if (refreshToken) query.set('refresh_token', refreshToken);
  if (description) query.set('error_description', description);
  return `aktivmate://auth/callback?${query.toString()}`;
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
    backgroundColor: colors.surface,
  },
});
