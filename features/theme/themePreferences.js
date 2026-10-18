import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { THEME_PREFERENCES, THEME_STORAGE_KEY } from './constants';

const memoryVault = new Map();

const canUseSecureStore = () => Platform.OS === 'ios' || Platform.OS === 'android';

const readRaw = async () => {
  if (Platform.OS === 'web') {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(THEME_STORAGE_KEY);
  }
  if (canUseSecureStore()) {
    return SecureStore.getItemAsync(THEME_STORAGE_KEY);
  }
  return memoryVault.get(THEME_STORAGE_KEY) ?? null;
};

const writeRaw = async (value) => {
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, value);
    }
    return;
  }
  if (canUseSecureStore()) {
    await SecureStore.setItemAsync(THEME_STORAGE_KEY, value);
    return;
  }
  memoryVault.set(THEME_STORAGE_KEY, value);
};

/** @type {'system' | 'light' | 'dark' | null} */
let cachedThemePreference = null;

/** @param {string | null | undefined} raw */
const parsePreference = (raw) =>
  THEME_PREFERENCES.includes(raw) ? raw : 'system';

/** @returns {Promise<'system' | 'light' | 'dark'>} */
export const loadThemePreference = async () => {
  if (cachedThemePreference) return cachedThemePreference;
  cachedThemePreference = parsePreference(await readRaw());
  return cachedThemePreference;
};

/** @param {'system' | 'light' | 'dark'} preference */
export const saveThemePreference = async (preference) => {
  if (!THEME_PREFERENCES.includes(preference)) return;
  cachedThemePreference = preference;
  await writeRaw(preference);
};
