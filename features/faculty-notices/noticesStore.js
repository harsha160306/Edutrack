// Shared in-memory and persistent store for notices across Admin, Faculty, and Student portals
import { FACULTY_NOTICES_DATA } from './FacultyNoticesScreen';

let globalNotices = [
  ...FACULTY_NOTICES_DATA,
];

const listeners = new Set();

export const getGlobalNotices = () => [...globalNotices];

export const subscribeToNotices = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const addNoticeByAdmin = ({
  title,
  category = 'Discipline',
  priority = 'Important',
  audience = 'All', // 'All' | 'Faculty' | 'Students'
  content,
  attachmentName = null,
  attachmentSize = '1.2 MB',
  issuerName = 'Dr. K. S. Rao, Ph.D.',
  issuerRole = 'Professor & Head of Department (HOD)',
  department = 'Dept. of Computer Science & Engineering',
}) => {
  const newNotice = {
    id: `notice-${Date.now()}`,
    title,
    category,
    priority,
    audience,
    isPinned: priority === 'Urgent',
    isUnread: true,
    date: 'Just Now',
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    facultyName: issuerName,
    facultyRole: issuerRole,
    department,
    content,
    attachment: attachmentName ? { name: attachmentName, size: attachmentSize } : null,
  };

  globalNotices = [newNotice, ...globalNotices];
  listeners.forEach((l) => {
    try {
      l(globalNotices);
    } catch (e) {
      console.warn('Notice listener error:', e);
    }
  });

  return newNotice;
};
