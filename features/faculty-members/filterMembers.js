import { FACULTY_MEMBERS } from './constants';

const normalize = (value) =>
  String(value ?? '')
    .trim()
    .toLowerCase();

export const filterMembers = (query) => {
  const q = normalize(query);
  if (!q) return FACULTY_MEMBERS;
  return FACULTY_MEMBERS.filter((item) => {
    const haystack = [item.name, item.email, item.dept, item.role, item.initials]
      .map(normalize)
      .join(' ');
    return haystack.includes(q);
  });
};
