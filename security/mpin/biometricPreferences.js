import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const STORAGE_VERSION = 'v1';
const memoryVault = new Map();

const storageKey = (accountId) => `mic_biometric_unlock_${STORAGE_VERSION}_${accountId}`;

const canUseSecureStore = () => Platform.OS === 'ios' || Platform.OS === 'android';

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

const deleteRaw = async (key) => {
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
    return;
  }
  if (canUseSecureStore()) {
    await SecureStore.deleteItemAsync(key);
    return;
  }
  memoryVault.delete(key);
};

export const isBiometricUnlockEnabled = async (accountId) => {
  const raw = await readRaw(storageKey(accountId));
  return raw === '1';
};

export const setBiometricUnlockEnabled = async (accountId, enabled) => {
  if (enabled) {
    await writeRaw(storageKey(accountId), '1');
  } else {
    await deleteRaw(storageKey(accountId));
  }
};
