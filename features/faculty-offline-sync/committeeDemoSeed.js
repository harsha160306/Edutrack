import { SYNC_STATUS } from './constants';
import { MARK_SOURCE } from './markSource';

/** Committee latecomers shown under "By Committee" until a server feed exists. */
export const COMMITTEE_DEMO_ENTRIES = [
  {
    studentId: '22H71A05A1',
    studentName: 'SANDEEP K.',
    dept: 'CSE-3A',
    date: '03 May 2026',
    time: '09:42 AM',
  },
  {
    studentId: '22H71A0442',
    studentName: 'MOHIT A.',
    dept: 'ECE-2B',
    date: '03 May 2026',
    time: '10:15 AM',
  },
  {
    studentId: '22H71A03B5',
    studentName: 'RIYA P.',
    dept: 'MECH-1C',
    date: '03 May 2026',
    time: '11:03 AM',
  },
  {
    studentId: '22H71A06C2',
    studentName: 'ANIKET K.',
    dept: 'CSE-2B',
    date: '03 May 2026',
    time: '11:47 AM',
  },
];

const demoTimeTodayIso = (timeStr) => {
  const now = new Date();
  const parsed = new Date(`${now.toDateString()} ${timeStr}`);
  return Number.isNaN(parsed.getTime()) ? now.toISOString() : parsed.toISOString();
};

export const buildCommitteeDemoMarks = () =>
  COMMITTEE_DEMO_ENTRIES.map((entry) => {
    const markedAt = demoTimeTodayIso(entry.time);
    return {
      id: `committee-demo-${entry.studentId}`,
      studentId: entry.studentId,
      studentName: entry.studentName,
      dept: entry.dept,
      markedAt,
      markedBy: 'committee',
      markSource: MARK_SOURCE.COMMITTEE,
      syncStatus: SYNC_STATUS.SYNCED,
      syncError: null,
      syncedAt: markedAt,
      demo: true,
    };
  });
