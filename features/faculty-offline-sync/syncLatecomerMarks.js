import { createLatecomerMark } from '../../services/api/latecomers';
import { getAccessToken } from '../../security/session';
import { SYNC_ITEM_DELAY_MS, SYNC_STATUS } from './constants';
import {
  getPendingLatecomerMarks,
  updateLatecomerMark,
  recordFacultyLastSync,
} from './latecomerQueueStorage';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * @param {object} record
 * @param {string | null} token
 */
const uploadLatecomerMark = async (record, token) => {
  if (!token) {
    await delay(SYNC_ITEM_DELAY_MS);
    if (!record?.studentId) throw new Error('Invalid record');
    return { serverId: `local_${record.id}`, syncedAt: new Date().toISOString() };
  }

  const markedAt = record.markedAt ?? record.createdAt ?? new Date().toISOString();
  const result = await createLatecomerMark(token, {
    student_emp_id: record.studentId,
    student_name: record.studentName,
    marked_at: markedAt,
    notes: record.notes ?? '',
    idempotency_key: record.id,
  });

  return { serverId: result.id, syncedAt: new Date().toISOString() };
};

/**
 * @param {string} facultyAccountId
 * @param {string} networkStatus — from useNetworkStatus
 */
export const syncPendingLatecomerMarks = async (facultyAccountId, networkStatus) => {
  if (networkStatus === 'offline') {
    return { ok: false, reason: 'offline', synced: 0, failed: 0, total: 0 };
  }

  const pending = await getPendingLatecomerMarks(facultyAccountId);
  if (pending.length === 0) {
    return { ok: true, reason: 'empty', synced: 0, failed: 0, total: 0 };
  }

  const token = await getAccessToken();
  let synced = 0;
  let failed = 0;

  for (const record of pending) {
    try {
      const result = await uploadLatecomerMark(record, token);
      await updateLatecomerMark(facultyAccountId, record.id, {
        syncStatus: SYNC_STATUS.SYNCED,
        syncError: null,
        syncedAt: result.syncedAt,
        serverId: result.serverId,
      });
      synced += 1;
    } catch (err) {
      failed += 1;
      await updateLatecomerMark(facultyAccountId, record.id, {
        syncStatus: SYNC_STATUS.FAILED,
        syncError: err?.message ?? 'Sync failed',
      });
    }
  }

  if (synced > 0) {
    await recordFacultyLastSync(facultyAccountId);
  }

  return {
    ok: failed === 0,
    reason: failed ? 'partial' : 'done',
    synced,
    failed,
    total: pending.length,
  };
};
