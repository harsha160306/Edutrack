export const RECORD_COPY = {
  sheetTitle: 'Latecomer record',
  studentId: 'Student ID',
  department: 'Class / dept',
  markedAt: 'Marked at',
  syncedAt: 'Synced at',
  syncStatus: 'Sync status',
  markedBy: 'Marked by',
  byYou: 'By you',
  byCommittee: 'By committee',
};

export const MARKED_COPY = {
  title: 'Marked today',
  subtitle: 'Latecomers you recorded today.',
  summaryMarked: 'Marked',
  summaryPending: 'Pending sync',
  summarySynced: 'Synced',
  emptyTitle: 'No marks yet today',
  emptyHint: 'Scan an ID card or search a roll number to mark a latecomer.',
  markAnother: 'Mark latecomer',
  syncNow: 'Sync pending',
  pendingBadge: 'Pending sync',
  syncedBadge: 'Synced',
  failedBadge: 'Sync failed',
};

export const HISTORY_FILTER = {
  ALL: 'all',
  BY_YOU: 'self',
  BY_COMMITTEE: 'committee',
};

export const HISTORY_COPY = {
  title: 'History',
  loading: 'Loading your saved marks…',
  searchPlaceholder: 'Search name, roll no, class…',
  filterAll: 'All',
  filterByYou: 'By You',
  filterByCommittee: 'By Committee',
  subtitle: (count, filterLabel, rangeActive) => {
    const base =
      filterLabel
        ? `${count} ${filterLabel} record${count === 1 ? '' : 's'}`
        : `${count} record${count === 1 ? '' : 's'}`;
    if (rangeActive) return `${base} in selected range.`;
    return `${base} saved on this device (all dates).`;
  },
  emptySubtitle: 'No saved marks on this device yet.',
  emptyRangeSubtitle: 'No marks in this date range.',
  emptySearchSubtitle: 'No marks match your search.',
  emptyTitle: 'No history yet',
  emptyHint: 'Marks you record stay here until cleared or synced from another device.',
  emptyFilterHint: 'Try another filter or mark a latecomer from the dashboard.',
  emptyRangeHint: 'Try a wider date range or clear the date filter.',
  emptySearchHint: 'No records match this search. Try another name, roll no, or class.',
  rangeModalTitle: 'Date range',
  rangeQuick: 'Quick ranges',
  rangeCustom: 'Custom range',
  rangeSelectEnd: 'Select end date',
  rangeSingleDayReady: 'Tap Apply to use this single day',
  rangeApply: 'Apply custom range',
  rangeClear: 'Clear custom',
  rangeFrom: 'From',
  rangeTo: 'To',
  rangeAll: 'All dates',
  rangeToday: 'Today',
  rangeYesterday: 'Yesterday',
  rangeLast7: 'Last 7 days',
  rangeLast30: 'Last 30 days',
  rangeThisMonth: 'This month',
  rangeLabels: {
    allDates: 'All dates',
    today: 'Today',
    yesterday: 'Yesterday',
    last7: 'Last 7 days',
    last30: 'Last 30 days',
    thisMonth: 'This month',
    pickRange: 'Pick a date range',
  },
};
