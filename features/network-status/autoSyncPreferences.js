import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const STORAGE_KEY = 'mic_auto_sync_enabled_v1';
const INTERVAL_STORAGE_KEY = 'mic_auto_sync_interval_v1';
const memoryVault = new Map();

/** Auto-sync interval options in minutes. */
export const AUTO_SYNC_INTERVAL_OPTIONS = [5, 10, 15, 20, 25, 30];
export const DEFAULT_AUTO_SYNC_INTERVAL_MINUTES = 5;

const canUseSecureStore = () => Platform.OS === 'ios' || Platform.OS === 'android';

const readRaw = async () => {
  if (Platform.OS === 'web') {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEY);
  }
  if (canUseSecureStore()) {
    return SecureStore.getItemAsync(STORAGE_KEY);
  }
  return memoryVault.get(STORAGE_KEY) ?? null;
};

const writeRaw = async (value) => {
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, value);
    }
    return;
  }
  if (canUseSecureStore()) {
    await SecureStore.setItemAsync(STORAGE_KEY, value);
    return;
  }
  memoryVault.set(STORAGE_KEY, value);
};

/** @returns {Promise<boolean>} */
export const loadAutoSyncEnabled = async () => {
  const raw = await readRaw();
  if (raw === null) return true;
  return raw === '1';
};

/** @param {boolean} enabled */
export const saveAutoSyncEnabled = async (enabled) => {
  await writeRaw(enabled ? '1' : '0');
};

const readIntervalRaw = async () => {
  if (Platform.OS === 'web') {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(INTERVAL_STORAGE_KEY);
  }
  if (canUseSecureStore()) {
    return SecureStore.getItemAsync(INTERVAL_STORAGE_KEY);
  }
  return memoryVault.get(INTERVAL_STORAGE_KEY) ?? null;
};

const writeIntervalRaw = async (value) => {
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(INTERVAL_STORAGE_KEY, value);
    }
    return;
  }
  if (canUseSecureStore()) {
    await SecureStore.setItemAsync(INTERVAL_STORAGE_KEY, value);
    return;
  }
  memoryVault.set(INTERVAL_STORAGE_KEY, value);
};

/** @returns {Promise<5 | 10 | 15 | 20 | 25 | 30>} */
export const loadAutoSyncIntervalMinutes = async () => {
  const raw = await readIntervalRaw();
  const minutes = Number.parseInt(raw ?? '', 10);
  if (!AUTO_SYNC_INTERVAL_OPTIONS.includes(minutes)) {
    return DEFAULT_AUTO_SYNC_INTERVAL_MINUTES;
  }
  return minutes;
};

/** @param {5 | 10 | 15 | 20 | 25 | 30} minutes */
export const saveAutoSyncIntervalMinutes = async (minutes) => {
  if (!AUTO_SYNC_INTERVAL_OPTIONS.includes(minutes)) return;
  await writeIntervalRaw(String(minutes));
};
