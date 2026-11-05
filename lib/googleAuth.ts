import * as Application from 'expo-application';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { supabase } from '@/utils/supabase';

WebBrowser.maybeCompleteAuthSession();

const CALLBACK_PATH = 'auth/callback';

export function authRedirectUri() {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/${CALLBACK_PATH}`;
  }
  // Expo Go has no aktivmate:// handler. The installed app always returns there.
  if (runningInExpoGo()) {
    if (Platform.OS === 'android') return `http://localhost:${devServerPort()}/${CALLBACK_PATH}`;
    const scheme = (Constants.linkingUri ?? '').startsWith('exps://') ? 'exps' : 'exp';
    return `${scheme}://127.0.0.1:${devServerPort()}/--/${CALLBACK_PATH}`;
  }
  return 'aktivmate://auth/callback';
}

function runningInExpoGo() {
  const applicationId = Application.applicationId ?? '';
  if (applicationId === 'com.alnlabs.aktivmate') return false;
  if (applicationId === 'host.exp.exponent' || applicationId === 'host.exp.Exponent') return true;
  if (Constants.appOwnership === 'expo') return true;
  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) return true;
  const linking = Constants.linkingUri ?? '';
  return linking.startsWith('exp://') || linking.startsWith('exps://');
}

export function watchAuthReturn(onError: (message: string) => void) {
  const finish = (url: string | null) => {
    if (!url || !hasAuthPayload(url)) return;
    void createSessionFromUrl(url).catch((err: unknown) => {
      onError(err instanceof Error ? err.message : 'Google sign-in failed.');
    });
  };
  const subscription = Linking.addEventListener('url', ({ url }) => {
    closeAuthBrowser();
    finish(url);
  });
  void Linking.getInitialURL().then(finish);
  return () => subscription.remove();
}

export async function signInWithGoogle() {
  const redirectTo = authRedirectUri();
  const returnTo = runningInExpoGo() ? expoGoLoopback() : redirectTo;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
      queryParams: { prompt: 'select_account' },
    },
  });
  if (error) throw new Error(withRedirectHint(error.message, redirectTo));
  if (!data.url) {
    throw new Error('Google sign-in is unavailable. Enable the Google provider in the Supabase dashboard.');
  }

  if (Platform.OS === 'web') {
    window.location.assign(data.url);
    return;
  }

  const captured = captureAuthUrl();
  try {
    const result = await WebBrowser.openAuthSessionAsync(data.url, returnTo, { preferEphemeralSession: false });
    const url = result.type === 'success' && result.url ? result.url : await captured.wait(8000);
    if (!url) {
      if (result.type === 'cancel') return;
      if (runningInExpoGo() && Platform.OS === 'android') {
        throw new Error('In the browser, tap Open AktivMate to finish signing in.');
      }
      throw new Error('Google did not return to the app. Allow this redirect in Supabase: ' + redirectTo);
    }
    await createSessionFromUrl(url);
  } finally {
    captured.stop();
  }
}

let exchanging: Promise<void> | null = null;

export function createSessionFromUrl(url: string) {
  if (!hasAuthPayload(url)) return Promise.resolve();
  if (!exchanging) {
    exchanging = finishSession(url).finally(() => {
      exchanging = null;
    });
  }
  return exchanging;
}

export function hasAuthPayload(url: string) {
  return /[?&#](code|access_token|error|error_description)=/.test(url);
}

async function finishSession(url: string) {
  const params = readAuthParams(url);
  const description = params.error_description || params.error;
  if (description) throw new Error(decodeURIComponent(description.replace(/\+/g, ' ')));
  if (!params.code && !params.access_token) return;

  if (params.code) {
    const { error } = await supabase.auth.exchangeCodeForSession(params.code);
    if (!error) return;
    const { data } = await supabase.auth.getSession();
    if (data.session) return;
    throw error;
  }

  const { error } = await supabase.auth.setSession({
    access_token: params.access_token,
    refresh_token: params.refresh_token ?? '',
  });
  if (error) throw error;
}

function captureAuthUrl() {
  let found: string | null = null;
  let notify: ((url: string) => void) | null = null;
  const subscription = Linking.addEventListener('url', ({ url }) => {
    if (!hasAuthPayload(url)) return;
    found = url;
    closeAuthBrowser();
    notify?.(url);
  });
  return {
    stop() {
      subscription.remove();
    },
    wait(ms: number) {
      if (found) return Promise.resolve(found);
      return new Promise<string | null>((resolve) => {
        const timer = setTimeout(() => resolve(found), ms);
        notify = (url) => {
          clearTimeout(timer);
          resolve(url);
        };
      });
    },
  };
}

function closeAuthBrowser() {
  try {
    WebBrowser.dismissAuthSession();
  } catch {
    // The browser is already closed when the system hands the link back.
  }
}

function expoGoLoopback() {
  const scheme = (Constants.linkingUri ?? '').startsWith('exps://') ? 'exps' : 'exp';
  return `${scheme}://127.0.0.1:${devServerPort()}/--/${CALLBACK_PATH}`;
}

export function expoGoHandoffUrl(fromUrl: string) {
  const params = readAuthParams(fromUrl);
  const query = new URLSearchParams();
  if (params.code) query.set('code', params.code);
  if (params.access_token) query.set('access_token', params.access_token);
  if (params.refresh_token) query.set('refresh_token', params.refresh_token);
  if (params.error_description) query.set('error_description', params.error_description);
  const port = typeof window !== 'undefined' && window.location.port ? window.location.port : '8081';
  return `exp://127.0.0.1:${port}/--/${CALLBACK_PATH}?${query.toString()}`;
}

function devServerPort() {
  const raw = Constants.expoConfig?.hostUri || Constants.linkingUri || '';
  const match = raw.match(/:(\d+)(?:\/|$)/);
  return match?.[1] ?? '8081';
}

function readAuthParams(url: string) {
  const hashIndex = url.indexOf('#');
  const queryIndex = url.indexOf('?');
  const query = queryIndex >= 0 ? url.slice(queryIndex + 1, hashIndex >= 0 && hashIndex > queryIndex ? hashIndex : undefined) : '';
  const hash = hashIndex >= 0 ? url.slice(hashIndex + 1) : '';
  const params: Record<string, string> = {};
  for (const part of [query, hash]) {
    new URLSearchParams(part).forEach((value, key) => {
      params[key] = value;
    });
  }
  return params;
}

function withRedirectHint(message: string, redirectTo: string) {
  if (/redirect|url/i.test(message)) {
    return `${message} Add ${redirectTo} to the Supabase Auth redirect URLs.`;
  }
  return message;
}
