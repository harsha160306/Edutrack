import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { MPIN_LENGTH, MPIN_STORAGE_VERSION } from './constants';
import { isValidMpinLength } from './mpinValidation';

const memoryVault = new Map();

const storageKey = (accountId) => `mic_mpin_${MPIN_STORAGE_VERSION}_${accountId}`;

const canUseSecureStore = () => Platform.OS === 'ios' || Platform.OS === 'android';

const readItem = async (key) => {
  if (Platform.OS === 'web') {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(key);
  }
  if (canUseSecureStore()) {
    return SecureStore.getItemAsync(key);
  }
  return memoryVault.get(key) ?? null;
};

const writeItem = async (key, value) => {
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

const deleteItem = async (key) => {
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

const hashMpin = async (pin, salt) =>
  Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${pin}`);

const parseStoredPayload = (raw) => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed?.hash && parsed?.salt) {
      const length = isValidMpinLength(parsed.length) ? parsed.length : MPIN_LENGTH;
      return { ...parsed, length };
    }
  } catch {
    return null;
  }
  return null;
};

/**
 * @param {string} accountId — e.g. faculty | student
 */
export const hasMpinForAccount = async (accountId) => {
  const raw = await readItem(storageKey(accountId));
  return Boolean(parseStoredPayload(raw));
};

/**
 * @param {string} accountId
 * @returns {Promise<4 | 6 | null>}
 */
export const getMpinLengthForAccount = async (accountId) => {
  const raw = await readItem(storageKey(accountId));
  const payload = parseStoredPayload(raw);
  return payload?.length ?? null;
};

/**
 * @param {string} accountId
 * @param {string} pin
 * @param {4 | 6} pinLength
 */
export const saveMpinForAccount = async (accountId, pin, pinLength = MPIN_LENGTH) => {
  const length = isValidMpinLength(pinLength) ? pinLength : MPIN_LENGTH;
  const salt = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${accountId}:${Date.now()}`,
  );
  const hash = await hashMpin(pin, salt);
  const payload = JSON.stringify({ salt, hash, length });
  await writeItem(storageKey(accountId), payload);
};

/**
 * @param {string} accountId
 * @param {string} pin
 */
export const verifyMpinForAccount = async (accountId, pin) => {
  const raw = await readItem(storageKey(accountId));
  const payload = parseStoredPayload(raw);
  if (!payload) return false;
  try {
    const candidate = await hashMpin(pin, payload.salt);
    return candidate === payload.hash;
  } catch {
    return false;
  }
};

/** Dev / logout helper */
export const clearMpinForAccount = async (accountId) => {
  await deleteItem(storageKey(accountId));
};
