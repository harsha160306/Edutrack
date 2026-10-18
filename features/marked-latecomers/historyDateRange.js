export const DATE_RANGE_PRESET = {
  ALL: 'all',
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  LAST_7: 'last7',
  LAST_30: 'last30',
  THIS_MONTH: 'thisMonth',
  CUSTOM: 'custom',
};

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

/** @returns {{ start: Date, end: Date } | null} null = no date filter */
export const getPresetDateRange = (preset, now = new Date()) => {
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  switch (preset) {
    case DATE_RANGE_PRESET.ALL:
      return null;
    case DATE_RANGE_PRESET.TODAY:
      return { start: todayStart, end: todayEnd };
    case DATE_RANGE_PRESET.YESTERDAY: {
      const y = new Date(todayStart);
      y.setDate(y.getDate() - 1);
      return { start: startOfDay(y), end: endOfDay(y) };
    }
    case DATE_RANGE_PRESET.LAST_7: {
      const start = new Date(todayStart);
      start.setDate(start.getDate() - 6);
      return { start, end: todayEnd };
    }
    case DATE_RANGE_PRESET.LAST_30: {
      const start = new Date(todayStart);
      start.setDate(start.getDate() - 29);
      return { start, end: todayEnd };
    }
    case DATE_RANGE_PRESET.THIS_MONTH: {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: startOfDay(start), end: todayEnd };
    }
    default:
      return null;
  }
};

export const resolveDateRange = ({ preset, customStart, customEnd }) => {
  if (preset === DATE_RANGE_PRESET.CUSTOM && customStart && customEnd) {
    const start = startOfDay(new Date(customStart));
    const end = endOfDay(new Date(customEnd));
    if (start.getTime() <= end.getTime()) return { start, end };
    return {
      start: startOfDay(new Date(customEnd)),
      end: endOfDay(new Date(customStart)),
    };
  }
  return getPresetDateRange(preset);
};

export const filterMarksByDateRange = (marks, range) => {
  if (!range) return marks;
  const { start, end } = range;
  return marks.filter((mark) => {
    const t = new Date(mark.markedAt).getTime();
    return !Number.isNaN(t) && t >= start.getTime() && t <= end.getTime();
  });
};

const formatShortDate = (date) =>
  date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const formatDateRangeLabel = ({ preset, customStart, customEnd }, copy) => {
  if (preset === DATE_RANGE_PRESET.ALL) return copy.allDates;
  if (preset === DATE_RANGE_PRESET.TODAY) return copy.today;
  if (preset === DATE_RANGE_PRESET.YESTERDAY) return copy.yesterday;
  if (preset === DATE_RANGE_PRESET.LAST_7) return copy.last7;
  if (preset === DATE_RANGE_PRESET.LAST_30) return copy.last30;
  if (preset === DATE_RANGE_PRESET.THIS_MONTH) return copy.thisMonth;
  if (preset === DATE_RANGE_PRESET.CUSTOM && customStart && customEnd) {
    const start = new Date(customStart);
    const end = new Date(customEnd);
    if (isSameDay(start, end)) return formatShortDate(start);
    return `${formatShortDate(start)} – ${formatShortDate(end)}`;
  }
  return copy.pickRange;
};
