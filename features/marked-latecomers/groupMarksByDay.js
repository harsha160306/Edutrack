const isSameCalendarDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const formatHistorySectionTitle = (iso) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Unknown date';
  const now = new Date();
  if (isSameCalendarDay(d, now)) return 'Today';
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameCalendarDay(d, yesterday)) return 'Yesterday';
  return d.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

/** @param {Array<{ markedAt: string }>} marks */
export const groupMarksByDay = (marks) => {
  const buckets = new Map();

  for (const mark of marks) {
    const d = new Date(mark.markedAt);
    const key = Number.isNaN(d.getTime()) ? 'unknown' : d.toDateString();
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(mark);
  }

  return [...buckets.entries()]
    .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
    .map(([, items]) => {
      const sorted = [...items].sort(
        (a, b) => new Date(b.markedAt).getTime() - new Date(a.markedAt).getTime(),
      );
      return {
        title: formatHistorySectionTitle(sorted[0].markedAt),
        data: sorted,
      };
    });
};
