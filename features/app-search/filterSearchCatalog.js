import { SEARCH_QUICK_ACTIONS, SEARCH_STUDENTS } from './constants';

const normalize = (value) =>
  String(value ?? '')
    .trim()
    .toLowerCase();

/**
 * @param {string} query
 * @param {{ includeQuickActions?: boolean }} [options]
 */
export const filterSearchCatalog = (query, options = {}) => {
  const { includeQuickActions = true } = options;
  const q = normalize(query);

  const students = !q
    ? SEARCH_STUDENTS
    : SEARCH_STUDENTS.filter((item) => {
        const haystack = [item.name, item.rollNo, item.dept, item.initials]
          .map(normalize)
          .join(' ');
        return haystack.includes(q);
      });

  const quickActions = !includeQuickActions
    ? []
    : !q
      ? SEARCH_QUICK_ACTIONS
      : SEARCH_QUICK_ACTIONS.filter((item) => {
          const haystack = [item.label, item.keywords].map(normalize).join(' ');
          return haystack.includes(q);
        });

  return { students, quickActions };
};
