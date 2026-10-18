import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const memoryVault = new Map();
const STORAGE_VERSION = 'v1';

const storageKey = (accountId) => `mic_mpin_skipped_${STORAGE_VERSION}_${accountId}`;

const canUseSecureStore = () => Platform.OS === 'ios' || Platform.OS === 'android';

const readItem = async (key) => {
  if (canUseSecureStore()) {
    return SecureStore.getItemAsync(key);
  }
  return memoryVault.get(key) ?? null;
};

const writeItem = async (key, value) => {
  if (canUseSecureStore()) {
    await SecureStore.setItemAsync(key, value);
    return;
  }
  memoryVault.set(key, value);
};

const deleteItem = async (key) => {
  if (canUseSecureStore()) {
    await SecureStore.deleteItemAsync(key);
    return;
  }
  memoryVault.delete(key);
};

/** User chose "Not now" or Skip on MPIN setup. */
export const markMpinSetupSkipped = async (accountId) => {
  await writeItem(storageKey(accountId), '1');
};

/** MPIN configured — remove skip flag. */
export const clearMpinSetupSkipped = async (accountId) => {
  await deleteItem(storageKey(accountId));
};

export const wasMpinSetupSkipped = async (accountId) => {
  const raw = await readItem(storageKey(accountId));
  return raw === '1';
};
