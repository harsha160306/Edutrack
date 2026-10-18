import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { buildCommitteeDemoMarks } from './committeeDemoSeed';
import { QUEUE_STORAGE_VERSION, SYNC_STATUS } from './constants';
import { MARK_SOURCE } from './markSource';

const memoryVault = new Map();

const storageKey = (facultyAccountId) =>
  `mic_latecomer_queue_${QUEUE_STORAGE_VERSION}_${facultyAccountId}`;

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

const emptyQueue = () => ({
  version: 1,
  items: [],
  lastSyncedAt: null,
  committeeDemoSeeded: false,
});

const markSourceOf = (item) => item?.markSource ?? MARK_SOURCE.SELF;

const matchesMarkSource = (item, source) => markSourceOf(item) === source;

const parseQueue = (raw) => {
  if (!raw) return emptyQueue();
  try {
    const data = JSON.parse(raw);
    if (!Array.isArray(data?.items)) return emptyQueue();
    return {
      version: data.version ?? 1,
      items: data.items,
      lastSyncedAt: data.lastSyncedAt ?? null,
      committeeDemoSeeded: Boolean(data.committeeDemoSeeded),
    };
  } catch {
    return emptyQueue();
  }
};

const saveQueue = async (facultyAccountId, queue) => {
  await writeRaw(storageKey(facultyAccountId), JSON.stringify(queue));
};

export const loadLatecomerQueue = async (facultyAccountId) => {
  const raw = await readRaw(storageKey(facultyAccountId));
  return parseQueue(raw);
};

export const clearLatecomerQueue = async (facultyAccountId) => {
  await deleteRaw(storageKey(facultyAccountId));
};

/** @param {string} facultyAccountId */
export const recordFacultyLastSync = async (facultyAccountId, syncedAt = new Date().toISOString()) => {
  const queue = await loadLatecomerQueue(facultyAccountId);
  queue.lastSyncedAt = syncedAt;
  await saveQueue(facultyAccountId, queue);
};

const isToday = (iso) => {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
};

/**
 * @param {string} facultyAccountId
 * @param {{ studentId: string, studentName?: string, dept?: string }} entry
 */
export const addLatecomerMark = async (facultyAccountId, entry) => {
  const queue = await loadLatecomerQueue(facultyAccountId);
  const studentId = String(entry.studentId ?? '').trim().toUpperCase();
  if (!studentId) {
    throw new Error('Roll number is required');
  }

  const record = {
    id: Crypto.randomUUID(),
    studentId,
    studentName: String(entry.studentName ?? '').trim() || null,
    dept: String(entry.dept ?? '').trim() || null,
    markedAt: entry.markedAt
      ? new Date(entry.markedAt).toISOString()
      : new Date().toISOString(),
    markedBy: facultyAccountId,
    markSource: entry.markSource ?? MARK_SOURCE.SELF,
    type: entry.type ?? 'latecomer',
    description: String(entry.description ?? '').trim() || null,
    syncStatus: SYNC_STATUS.PENDING,
    syncError: null,
    syncedAt: null,
  };

  queue.items.unshift(record);
  await saveQueue(facultyAccountId, queue);
  return record;
};

export const updateLatecomerMark = async (facultyAccountId, id, patch) => {
  const queue = await loadLatecomerQueue(facultyAccountId);
  const index = queue.items.findIndex((item) => item.id === id);
  if (index === -1) return null;
  queue.items[index] = { ...queue.items[index], ...patch };
  await saveQueue(facultyAccountId, queue);
  return queue.items[index];
};

export const getPendingLatecomerMarks = async (facultyAccountId) => {
  const queue = await loadLatecomerQueue(facultyAccountId);
  return queue.items.filter((item) => item.syncStatus === SYNC_STATUS.PENDING);
};

export const getTodayLatecomerMarks = async (facultyAccountId) => {
  const queue = await loadLatecomerQueue(facultyAccountId);
  return queue.items.filter((item) => isToday(item.markedAt));
};

export const getTodayLatecomerMarksBySource = async (facultyAccountId, source) => {
  const queue = await loadLatecomerQueue(facultyAccountId);
  return queue.items.filter(
    (item) => isToday(item.markedAt) && matchesMarkSource(item, source),
  );
};

/** All marks on this device, newest first (for history). */
export const getAllLatecomerMarks = async (facultyAccountId, { source } = {}) => {
  const queue = await loadLatecomerQueue(facultyAccountId);
  const filtered = source
    ? queue.items.filter((item) => matchesMarkSource(item, source))
    : queue.items;
  return [...filtered].sort(
    (a, b) => new Date(b.markedAt).getTime() - new Date(a.markedAt).getTime(),
  );
};

/** One-time demo committee marks for the "By Committee" tab (until server feed exists). */
export const seedCommitteeDemoMarksIfNeeded = async (facultyAccountId) => {
  const queue = await loadLatecomerQueue(facultyAccountId);
  if (queue.committeeDemoSeeded) return false;

  const demos = buildCommitteeDemoMarks();
  const existingIds = new Set(queue.items.map((item) => item.studentId));
  const toAdd = demos.filter((demo) => !existingIds.has(demo.studentId));
  queue.items = [...toAdd, ...queue.items];
  queue.committeeDemoSeeded = true;
  await saveQueue(facultyAccountId, queue);
  return toAdd.length > 0;
};

export const getPendingCount = async (facultyAccountId) => {
  const pending = await getPendingLatecomerMarks(facultyAccountId);
  return pending.length;
};
