import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

import type { User } from '../types/account';

// The login token is a secret: it lives in the phone's encrypted store (Keychain / Keystore).
// The user profile is not secret: it's cached so the app can open without internet.
const TOKEN_KEY = 'auth-token';
const USER_KEY = 'auth-user';

export type StoredSession = { token: string; user: User | null };

export async function loadSession(): Promise<StoredSession | null> {
  try {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    if (!token) return null;
    const rawUser = await AsyncStorage.getItem(USER_KEY);
    return { token, user: rawUser ? (JSON.parse(rawUser) as User) : null };
  } catch {
    return null;
  }
}

export async function saveSession(token: string, user: User): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  await saveUser(user);
}

export async function saveUser(user: User): Promise<void> {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user)).catch(() => undefined);
}

export async function clearSession(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => undefined);
  await AsyncStorage.removeItem(USER_KEY).catch(() => undefined);
}
