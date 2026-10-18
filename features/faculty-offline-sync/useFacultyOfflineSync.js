import { useCallback, useEffect, useRef, useState } from 'react';
import { NETWORK_STATUS } from '../network-status/constants';
import { useNetworkStatus } from '../network-status';
import { autoSyncIntervalToMs, normalizeAutoSyncIntervalMinutes } from '../network-status/autoSyncInterval';
import {
  getPendingCount,
  getTodayLatecomerMarksBySource,
  addLatecomerMark,
  loadLatecomerQueue,
  recordFacultyLastSync,
  seedCommitteeDemoMarksIfNeeded,
} from './latecomerQueueStorage';
import { getStoredProfile } from '../../security/session';
import { MARK_SOURCE } from './markSource';
import { syncPendingLatecomerMarks } from './syncLatecomerMarks';
import { startAutoSyncScheduler, stopAutoSyncScheduler } from './autoSyncScheduler';

/**
 * Faculty offline queue. Auto-sync interval is **always minutes** (1 / 5 / 15).
 */
export const useFacultyOfflineSync = (
  facultyAccountId,
  enabled = true,
  autoSyncEnabled = true,
  autoSyncIntervalMinutes = 5,
) => {
  const { status: networkStatus } = useNetworkStatus();
  const [pendingCount, setPendingCount] = useState(0);
  const [todayMarksByYou, setTodayMarksByYou] = useState([]);
  const [todayMarksCommittee, setTodayMarksCommittee] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState(null);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const isSyncingRef = useRef(false);
  const lastAutoSyncAtRef = useRef(0);
  const autoSyncMinutesRef = useRef(normalizeAutoSyncIntervalMinutes(autoSyncIntervalMinutes));
  const canSyncRef = useRef(false);
  const networkStatusRef = useRef(networkStatus);
  const facultyAccountIdRef = useRef(facultyAccountId);
  const autoSyncEnabledRef = useRef(autoSyncEnabled);

  autoSyncMinutesRef.current = normalizeAutoSyncIntervalMinutes(autoSyncIntervalMinutes);
  networkStatusRef.current = networkStatus;
  facultyAccountIdRef.current = facultyAccountId;
  autoSyncEnabledRef.current = autoSyncEnabled;

  const isOffline = networkStatus === NETWORK_STATUS.OFFLINE;
  const canSync =
    enabled &&
    facultyAccountId &&
    !isOffline &&
    (networkStatus === NETWORK_STATUS.ONLINE ||
      networkStatus === NETWORK_STATUS.NETWORK);

  canSyncRef.current = canSync;

  const refresh = useCallback(async () => {
    const accountId = facultyAccountIdRef.current;
    if (!enabled || !accountId) {
      setPendingCount(0);
      setTodayMarksByYou([]);
      setTodayMarksCommittee([]);
      setLastSyncedAt(null);
      return;
    }
    await seedCommitteeDemoMarksIfNeeded(accountId);
    const [count, byYou, committee, queue] = await Promise.all([
      getPendingCount(accountId),
      getTodayLatecomerMarksBySource(accountId, MARK_SOURCE.SELF),
      getTodayLatecomerMarksBySource(accountId, MARK_SOURCE.COMMITTEE),
      loadLatecomerQueue(accountId),
    ]);
    setPendingCount(count);
    setTodayMarksByYou(byYou);
    setTodayMarksCommittee(committee);
    setLastSyncedAt(queue.lastSyncedAt ?? null);
  }, [enabled]);

  const syncNow = useCallback(async ({ force = true } = {}) => {
    const accountId = facultyAccountIdRef.current;
    if (!accountId || !canSyncRef.current || isSyncingRef.current) {
      return { ok: false, reason: 'unavailable' };
    }

    const minGapMs = autoSyncIntervalToMs(autoSyncMinutesRef.current);
    if (!force && Date.now() - lastAutoSyncAtRef.current < minGapMs) {
      return { ok: false, reason: 'throttled' };
    }

    isSyncingRef.current = true;
    setIsSyncing(true);
    try {
      const result = await syncPendingLatecomerMarks(
        accountId,
        networkStatusRef.current,
      );
      setLastSyncResult(result);
      if (result.reason !== 'offline') {
        const shouldRecord =
          force || result.synced > 0 || result.reason === 'empty';
        if (shouldRecord) {
          await recordFacultyLastSync(accountId);
          lastAutoSyncAtRef.current = Date.now();
        }
      }
      await refresh();
      return result;
    } finally {
      isSyncingRef.current = false;
      setIsSyncing(false);
    }
  }, [refresh]);

  const syncNowRef = useRef(syncNow);
  syncNowRef.current = syncNow;

  const markLatecomer = useCallback(
    async (entry) => {
      const accountId = facultyAccountIdRef.current;
      if (!accountId) {
        throw new Error('Faculty account required');
      }

      const profile = await getStoredProfile();
      const access = profile?.discipline_access;
      if (access) {
        if (!access.mobile_app_enabled) {
          throw new Error('Mobile app access is disabled for your discipline committee.');
        }
        if (!access.can_mark_latecomers_today) {
          throw new Error(
            'You are not assigned gate duty today. Only the duty assignee can mark latecomers.',
          );
        }
      }

      const record = await addLatecomerMark(accountId, entry);
      await refresh();
      if (canSyncRef.current && autoSyncEnabledRef.current) {
        await syncNow({ force: true });
      }
      return record;
    },
    [refresh, syncNow],
  );

  useEffect(() => {
    refresh();
  }, [refresh, facultyAccountId]);

  useEffect(() => {
    if (!enabled || !facultyAccountId || !autoSyncEnabled) {
      stopAutoSyncScheduler();
      return undefined;
    }

    const intervalMs = autoSyncIntervalToMs(autoSyncMinutesRef.current);

    startAutoSyncScheduler({
      intervalMs,
      tick: async () => {
        if (!autoSyncEnabledRef.current || !canSyncRef.current || isSyncingRef.current) {
          return;
        }
        const accountId = facultyAccountIdRef.current;
        if (!accountId) return;

        await syncNowRef.current({ force: false });
      },
    });

    return () => stopAutoSyncScheduler();
  }, [enabled, facultyAccountId, autoSyncEnabled, autoSyncIntervalMinutes]);

  const todayMarkedCount = todayMarksByYou.length;
  const committeeTodayCount = todayMarksCommittee.length;
  const todaySyncedCount = todayMarksByYou.filter((m) => m.syncStatus === 'synced').length;

  return {
    networkStatus,
    isOffline,
    canSync,
    pendingCount,
    todayMarksByYou,
    todayMarksCommittee,
    todayMarkedCount,
    committeeTodayCount,
    todaySyncedCount,
    isSyncing,
    lastSyncResult,
    lastSyncedAt,
    refresh,
    syncNow: () => syncNow({ force: true }),
    markLatecomer,
  };
};
