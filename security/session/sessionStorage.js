import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { SESSION_STORAGE_VERSION, VALID_SESSION_ROLES } from './constants';

const STORAGE_KEY = `mic_auth_session_${SESSION_STORAGE_VERSION}`;
const memoryVault = new Map();

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

const deleteRaw = async () => {
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    return;
  }
  if (canUseSecureStore()) {
    await SecureStore.deleteItemAsync(STORAGE_KEY);
    return;
  }
  memoryVault.delete(STORAGE_KEY);
};

const parseSession = (raw) => {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw);
    if (!VALID_SESSION_ROLES.has(data?.role)) return null;
    return {
      role: data.role,
      loggedInAt: data.loggedInAt ?? null,
      accessToken: data.accessToken ?? null,
      refreshToken: data.refreshToken ?? null,
      profile: data.profile ?? null,
    };
  } catch {
    return null;
  }
};

/**
 * @param {{
 *   role: 'faculty' | 'student',
 *   accessToken?: string | null,
 *   refreshToken?: string | null,
 *   profile?: object | null,
 * }} session
 */
export const saveSession = async ({ role, accessToken = null, refreshToken = null, profile = null }) => {
  if (!VALID_SESSION_ROLES.has(role)) return;
  const payload = JSON.stringify({
    role,
    loggedInAt: Date.now(),
    accessToken,
    refreshToken,
    profile,
  });
  await writeRaw(payload);
};

/** @returns {Promise<{ role: string, loggedInAt: number | null, accessToken?: string | null, refreshToken?: string | null, profile?: object | null } | null>} */
export const loadSession = async () => parseSession(await readRaw());

export const clearSession = async () => {
  await deleteRaw();
};

export const hasStoredSession = async () => Boolean(await loadSession());

/** @returns {Promise<string | null>} */
export const getAccessToken = async () => {
  const session = await loadSession();
  return session?.accessToken ?? null;
};

/** @returns {Promise<object | null>} */
export const getStoredProfile = async () => {
  const session = await loadSession();
  return session?.profile ?? null;
};

/**
 * @param {object} profile
 */
export const updateStoredProfile = async (profile) => {
  const session = await loadSession();
  if (!session) return;
  await saveSession({
    role: session.role,
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    profile,
  });
};
