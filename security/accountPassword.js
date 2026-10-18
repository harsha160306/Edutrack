import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const memoryVault = new Map();

const PASSWORD_KEY_PREFIX = 'mic_account_password_v1';

const canUseSecureStore = () => Platform.OS === 'ios' || Platform.OS === 'android';

const keyFor = (accountId) => `${PASSWORD_KEY_PREFIX}_${accountId || 'faculty'}`;

const getDefaultPassword = (accountId) =>
  accountId === 'student' ? 'student@123' : 'faculty@123';

const readRaw = async (key) => {
  if (Platform.OS === 'web') {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(key);
  }
  if (canUseSecureStore()) {
    return SecureStore.getItemAsync(key);
  }
  return memoryVault.get(key) ?? null;
};

const writeRaw = async (key, value) => {
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    }
    return;
  }
  if (canUseSecureStore()) {
    await SecureStore.setItemAsync(key, value);
    return;
  }
  memoryVault.set(key, value);
};

export const loadAccountPassword = async (accountId) => {
  const key = keyFor(accountId);
  const stored = await readRaw(key);
  if (stored && stored.length > 0) return stored;
  const fallback = getDefaultPassword(accountId);
  await writeRaw(key, fallback);
  return fallback;
};

export const verifyAccountPassword = async (accountId, password) => {
  const current = await loadAccountPassword(accountId);
  return password === current;
};

export const changeAccountPassword = async (accountId, oldPassword, nextPassword) => {
  const ok = await verifyAccountPassword(accountId, oldPassword);
  if (!ok) return { ok: false, reason: 'old_password_mismatch' };
  await writeRaw(keyFor(accountId), nextPassword);
  return { ok: true };
};
