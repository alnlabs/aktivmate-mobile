import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import * as Crypto from 'expo-crypto';
import { AppState, Platform } from 'react-native';

ensureWebCrypto();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_KEY in .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
  },
});

if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}

function ensureWebCrypto() {
  if (!globalThis.crypto) globalThis.crypto = {} as Crypto;
  const target = globalThis.crypto as Crypto & { subtle?: SubtleCrypto };
  if (typeof target.getRandomValues !== 'function') {
    target.getRandomValues = ((array: ArrayBufferView) => {
      const bytes = Crypto.getRandomBytes(array.byteLength);
      new Uint8Array(array.buffer, array.byteOffset, array.byteLength).set(bytes);
      return array;
    }) as Crypto['getRandomValues'];
  }
  if (typeof target.subtle?.digest !== 'function') {
    const digest = async (algorithm: AlgorithmIdentifier, data: BufferSource) => {
      const name = typeof algorithm === 'string' ? algorithm : algorithm.name;
      if (name.toUpperCase() !== 'SHA-256') throw new Error(`Unsupported digest ${name}`);
      const bytes = ArrayBuffer.isView(data) ? new Uint8Array(data.buffer, data.byteOffset, data.byteLength) : new Uint8Array(data);
      return Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256, bytes);
    };
    target.subtle = Object.assign(target.subtle ?? {}, { digest }) as SubtleCrypto;
  }
}
