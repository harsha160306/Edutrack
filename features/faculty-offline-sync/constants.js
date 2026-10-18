export const QUEUE_STORAGE_VERSION = 'v1';

export const SYNC_STATUS = {
  PENDING: 'pending',
  SYNCED: 'synced',
  FAILED: 'failed',
};

export const OFFLINE_COPY = {
  savedOffline: 'Late mark saved on this device. It will sync when you are back online.',
  savedAndSynced: 'Late mark recorded and synced.',
  syncSuccess: 'All pending marks synced.',
  syncPartial: (ok, total) => `${ok} of ${total} marks synced. Tap Sync to retry failures.`,
  syncFailed: 'Could not sync right now. Try again when the connection is stable.',
  bannerOffline: 'Offline mode — you can still mark latecomers. They will sync later.',
  bannerPending: (n) =>
    n === 1 ? '1 late mark waiting to sync' : `${n} late marks waiting to sync`,
  scanTitle: 'Mark latecomer',
  scanSubtitle: 'Enter student roll number. Works offline for faculty.',
  postLoginOfflineTitle: 'You are offline',
  postLoginOfflineMessage:
    'Sync will run automatically when you are back online. Connect to the internet to sync now.',
  rollLabel: 'Roll number',
  nameLabel: 'Name (optional)',
  deptLabel: 'Class / dept (optional)',
  markButton: 'Mark as late',
  pendingSection: 'Pending sync',
  syncedSection: 'Synced today',
};

/** Simulated API delay per record (ms). */
export const SYNC_ITEM_DELAY_MS = 280;
