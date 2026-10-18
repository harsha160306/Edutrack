import {
  AUTO_SYNC_INTERVAL_OPTIONS,
  DEFAULT_AUTO_SYNC_INTERVAL_MINUTES,
} from './autoSyncPreferences';

export const MS_PER_MINUTE = 60 * 1000;

/** @param {unknown} minutes */
export const normalizeAutoSyncIntervalMinutes = (minutes) => {
  const n = Number(minutes);
  if (AUTO_SYNC_INTERVAL_OPTIONS.includes(n)) {
    return n;
  }
  return DEFAULT_AUTO_SYNC_INTERVAL_MINUTES;
};

/** @param {unknown} minutes — always converts to ms (never treats value as seconds). */
export const autoSyncIntervalToMs = (minutes) => {
  const ms = normalizeAutoSyncIntervalMinutes(minutes) * MS_PER_MINUTE;
  return Number.isFinite(ms) && ms >= MS_PER_MINUTE ? ms : 5 * MS_PER_MINUTE;
};
