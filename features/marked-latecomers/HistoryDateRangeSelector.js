import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react-native';
import { DATE_RANGE_PRESET, formatDateRangeLabel } from './historyDateRange';
import { HISTORY_COPY } from './constants';

const PRESET_OPTIONS = [
  { id: DATE_RANGE_PRESET.ALL, label: HISTORY_COPY.rangeAll },
  { id: DATE_RANGE_PRESET.TODAY, label: HISTORY_COPY.rangeToday },
  { id: DATE_RANGE_PRESET.YESTERDAY, label: HISTORY_COPY.rangeYesterday },
  { id: DATE_RANGE_PRESET.LAST_7, label: HISTORY_COPY.rangeLast7 },
  { id: DATE_RANGE_PRESET.LAST_30, label: HISTORY_COPY.rangeLast30 },
  { id: DATE_RANGE_PRESET.THIS_MONTH, label: HISTORY_COPY.rangeThisMonth },
];

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const toDateKey = (year, month, day) => new Date(year, month, day).toISOString();

const parseDateKey = (iso) => {
  const d = new Date(iso);
  return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() };
};

const buildMonthGrid = (year, month) => {
  const first = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0).getDate();
  const sundayBasedOffset = first.getDay();
  const cells = [];
  for (let i = 0; i < sundayBasedOffset; i += 1) cells.push(null);
  for (let day = 1; day <= lastDay; day += 1) cells.push(day);
  return cells;
};

const startOfDayMs = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
};

const endOfDayMs = (d) => {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x.getTime();
};

const isSameDayKey = (iso, year, month, day) => {
  const { year: y, month: m, day: d } = parseDateKey(iso);
  return y === year && m === month && d === day;
};

const formatChipDate = (iso) =>
  new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

const YEAR_PAGE_SIZE = 16;

const layoutForWidth = (width) => {
  const compact = width < 380;
  const medium = width < 430;
  return {
    compact,
    medium,
    modalPadH: compact ? 14 : medium ? 16 : 20,
    sectionGap: compact ? 10 : 12,
    chipMargin: compact ? 6 : 8,
    metaGap: compact ? 8 : 10,
    navBtnSize: compact ? 34 : 36,
    monthYearPadH: compact ? 8 : 10,
    footerPadV: compact ? 12 : 14,
    footerPadH: compact ? 12 : 16,
    dayFont: compact ? 12 : 13,
  };
};

const IOS_PICKER = {
  surface: '#FFFFFF',
  panel: '#E9EEF8',
  panelSoft: '#F1F5F9',
  border: '#CBD5E1',
  text: '#0F172A',
  muted: '#64748B',
  primary: '#3B82F6',
  doneBg: '#3B82F6',
  doneText: '#FFFFFF',
};

const MiniMonthPicker = ({
  colors,
  isDark,
  draftStart,
  draftEnd,
  activeEdge,
  onSelectDay,
  layout = layoutForWidth(390),
}) => {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [monthYearOpen, setMonthYearOpen] = useState(false);
  const [pickerMode, setPickerMode] = useState('month'); // 'month' | 'year'
  const [yearPageStart, setYearPageStart] = useState(0);

  const cells = useMemo(() => buildMonthGrid(viewYear, viewMonth), [viewYear, viewMonth]);
  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString('en-GB', {
    month: 'long',
  });
  const yearLabel = String(viewYear);

  const isFutureMonth = (y, m) => {
    const firstOfMonth = new Date(y, m, 1);
    // 仅禁用“当前月之后”的月份；当前月本身应可选
    return startOfDayMs(firstOfMonth) > endOfDayMs(now);
  };

  const yearOptions = useMemo(() => {
    const current = now.getFullYear();
    const years = [current];
    for (let y = current - 1; y >= current - 20; y -= 1) years.push(y);
    for (let y = current + 1; y <= current + 5; y += 1) years.push(y);
    return years;
  }, [now]);

  const pagedYearOptions = yearOptions.slice(yearPageStart, yearPageStart + YEAR_PAGE_SIZE);
  const canYearPageBack = yearPageStart > 0;
  const canYearPageNext = yearPageStart + YEAR_PAGE_SIZE < yearOptions.length;

  const startMs = draftStart ? startOfDayMs(new Date(draftStart)) : null;
  const endMs = draftEnd ? endOfDayMs(new Date(draftEnd)) : null;
  const rangeStart = startMs != null && endMs != null ? Math.min(startMs, endMs) : null;
  const rangeEnd = startMs != null && endMs != null ? Math.max(startMs, endMs) : null;

  const shiftMonth = (delta) => {
    const d = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  return (
    <View style={[styles.calendarBlock, { marginBottom: layout.sectionGap }]}>
      <View style={styles.calendarNav}>
        <TouchableOpacity
          onPress={() => shiftMonth(-1)}
          hitSlop={10}
          style={[
            styles.calendarNavBtn,
            { width: layout.navBtnSize, height: layout.navBtnSize },
          ]}
        >
          <ChevronLeft color={IOS_PICKER.text} size={layout.compact ? 18 : 20} />
        </TouchableOpacity>
        <View style={styles.monthYearTopPills}>
          <TouchableOpacity
            onPress={() => {
              setPickerMode('month');
              setMonthYearOpen(true);
            }}
            activeOpacity={0.85}
            style={[
              styles.monthYearTopBtn,
              styles.monthYearTopBtnIOS,
              { paddingHorizontal: layout.monthYearPadH, marginHorizontal: layout.compact ? 2 : 4 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Choose month"
          >
            <Text
              style={[
                styles.calendarMonth,
                { color: IOS_PICKER.text, fontSize: layout.compact ? 13 : 14 },
              ]}
              numberOfLines={1}
            >
              {monthLabel}
            </Text>
            <ChevronDown color={IOS_PICKER.muted} size={layout.compact ? 12 : 14} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setPickerMode('year');
              setMonthYearOpen(true);
            }}
            activeOpacity={0.85}
            style={[
              styles.monthYearTopBtn,
              styles.monthYearTopBtnIOS,
              { paddingHorizontal: layout.monthYearPadH, marginHorizontal: layout.compact ? 2 : 4 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Choose year"
          >
            <Text
              style={[
                styles.calendarMonth,
                { color: IOS_PICKER.text, fontSize: layout.compact ? 13 : 14 },
              ]}
              numberOfLines={1}
            >
              {yearLabel}
            </Text>
            <ChevronDown color={IOS_PICKER.muted} size={layout.compact ? 12 : 14} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={() => shiftMonth(1)}
          hitSlop={10}
          style={[
            styles.calendarNavBtn,
            { width: layout.navBtnSize, height: layout.navBtnSize },
          ]}
        >
          <ChevronRight color={IOS_PICKER.text} size={layout.compact ? 18 : 20} />
        </TouchableOpacity>
      </View>
      <View style={styles.weekdayRow}>
        {WEEKDAY_LABELS.map((label) => (
          <Text key={label} style={[styles.weekdayLabel, { color: IOS_PICKER.muted }]}>
            {label}
          </Text>
        ))}
      </View>
      <View style={styles.dayGrid}>
        {cells.map((day, index) => {
          if (day == null) {
            return <View key={`empty-${index}`} style={styles.dayCell} />;
          }
          const cellStart = startOfDayMs(new Date(viewYear, viewMonth, day));
          const isStart = draftStart && isSameDayKey(draftStart, viewYear, viewMonth, day);
          const isEnd = draftEnd && isSameDayKey(draftEnd, viewYear, viewMonth, day);
          const isToday = isSameDayKey(now.toISOString(), viewYear, viewMonth, day);
          const isFuture = cellStart > endOfDayMs(now);
          const isSingleDay = isStart && isEnd;
          const inRange =
            rangeStart != null &&
            rangeEnd != null &&
            cellStart >= rangeStart &&
            cellStart <= rangeEnd &&
            !isStart &&
            !isEnd;

          return (
            <TouchableOpacity
              key={`${viewYear}-${viewMonth}-${day}`}
              style={[
                styles.dayCell,
                isFuture && styles.dayCellDisabled,
              ]}
              onPress={() => onSelectDay(toDateKey(viewYear, viewMonth, day))}
              disabled={isFuture}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel={`Select ${day}`}
            >
              <View
                style={[
                  styles.dayDot,
                  inRange && (isDark ? styles.dayInRangeDark : styles.dayInRangeLight),
                  (isStart || isEnd) && { backgroundColor: IOS_PICKER.primary },
                  (isStart || isEnd) && !isSingleDay && styles.dayEdge,
                  isStart && activeEdge === 'start' && styles.dayEdgeActive,
                  isEnd && activeEdge === 'end' && styles.dayEdgeActive,
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    { fontSize: layout.dayFont, color: isStart || isEnd ? '#FFFFFF' : IOS_PICKER.text },
                    isFuture && { color: IOS_PICKER.muted, opacity: 0.45 },
                    isToday && !(isStart || isEnd) && { color: IOS_PICKER.primary, fontWeight: '800' },
                  ]}
                >
                  {day}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <Modal
        visible={monthYearOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMonthYearOpen(false)}
      >
        <Pressable style={styles.monthYearBackdrop}>
          <Pressable
            style={[
              styles.monthYearSheet,
              { backgroundColor: IOS_PICKER.surface },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.monthYearHeader}>
              <Text style={[styles.monthYearTitle, { color: IOS_PICKER.text }]}>
                Select month & year
              </Text>
              <TouchableOpacity onPress={() => setMonthYearOpen(false)} hitSlop={10}>
                <X color={IOS_PICKER.muted} size={20} />
              </TouchableOpacity>
            </View>

            <View style={styles.modeSwitchRow}>
              <TouchableOpacity
                onPress={() => setPickerMode('month')}
                style={[
                  styles.modeSwitchBtn,
                  {
                    backgroundColor:
                      pickerMode === 'month'
                        ? 'rgba(74, 132, 255, 0.22)'
                        : 'transparent',
                    borderColor: pickerMode === 'month' ? IOS_PICKER.primary : 'transparent',
                  },
                ]}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.modeSwitchText,
                    { color: pickerMode === 'month' ? IOS_PICKER.primary : IOS_PICKER.muted },
                  ]}
                >
                  Select month
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setPickerMode('year')}
                style={[
                  styles.modeSwitchBtn,
                  {
                    backgroundColor:
                      pickerMode === 'year'
                        ? 'rgba(74, 132, 255, 0.22)'
                        : 'transparent',
                    borderColor: pickerMode === 'year' ? IOS_PICKER.primary : 'transparent',
                  },
                ]}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.modeSwitchText,
                    { color: pickerMode === 'year' ? IOS_PICKER.primary : IOS_PICKER.muted },
                  ]}
                >
                  Select year
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.monthYearActions}>
              {pickerMode === 'year' ? (
                <View style={styles.yearPagerRow}>
                  <TouchableOpacity
                    onPress={() =>
                      setYearPageStart((prev) => Math.max(0, prev - YEAR_PAGE_SIZE))
                    }
                    disabled={!canYearPageBack}
                    style={[
                      styles.yearPagerBtn,
                      !canYearPageBack && styles.yearPagerBtnDisabled,
                      { borderColor: IOS_PICKER.border },
                    ]}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel="Previous years"
                  >
                    <ChevronLeft
                      size={16}
                      color={canYearPageBack ? IOS_PICKER.muted : '#64748B'}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      setYearPageStart((prev) =>
                        Math.min(yearOptions.length - YEAR_PAGE_SIZE, prev + YEAR_PAGE_SIZE),
                      )
                    }
                    disabled={!canYearPageNext}
                    style={[
                      styles.yearPagerBtn,
                      !canYearPageNext && styles.yearPagerBtnDisabled,
                      { borderColor: IOS_PICKER.border },
                    ]}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel="Next years"
                  >
                    <ChevronRight
                      size={16}
                      color={canYearPageNext ? IOS_PICKER.muted : '#64748B'}
                    />
                  </TouchableOpacity>
                </View>
              ) : (
                <View />
              )}
              <TouchableOpacity
                onPress={() => {
                  if (pickerMode === 'year') {
                    setViewYear(now.getFullYear());
                    if (isFutureMonth(now.getFullYear(), viewMonth)) {
                      setViewMonth(now.getMonth());
                    }
                    setYearPageStart(0);
                    return;
                  }
                  setViewYear(now.getFullYear());
                  setViewMonth(now.getMonth());
                }}
                style={[
                  styles.jumpTodayBtn,
                  { borderColor: IOS_PICKER.border, backgroundColor: 'transparent' },
                ]}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel={
                  pickerMode === 'year' ? 'Jump to current year' : 'Jump to current month'
                }
              >
                <Text style={[styles.jumpTodayText, { color: IOS_PICKER.text }]}>
                  {pickerMode === 'year' ? 'This year' : 'This month'}
                </Text>
              </TouchableOpacity>
            </View>

            {pickerMode === 'year' ? (
              <View>
                <View style={styles.yearGrid}>
                  {pagedYearOptions.map((y) => {
                  const active = y === viewYear;
                  return (
                    <TouchableOpacity
                      key={String(y)}
                      onPress={() => {
                        setViewYear(y);
                        if (isFutureMonth(y, viewMonth)) {
                          const maxMonth = y === now.getFullYear() ? now.getMonth() : 11;
                          setViewMonth(maxMonth);
                        }
                      }}
                      style={[
                        styles.yearChip,
                        {
                          backgroundColor: active
                            ? IOS_PICKER.primary
                            : IOS_PICKER.panelSoft,
                          borderColor: active ? IOS_PICKER.primary : 'transparent',
                        },
                      ]}
                      activeOpacity={0.85}
                    >
                      <Text style={[styles.yearChipText, { color: active ? '#FFFFFF' : IOS_PICKER.muted }]}>
                        {y}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
                </View>
              </View>
            ) : (
              <View style={styles.monthGrid}>
                {Array.from({ length: 12 }).map((_, m) => {
                  const label = new Date(viewYear, m, 1).toLocaleDateString('en-GB', { month: 'short' });
                  const active = m === viewMonth;
                  const disabled = isFutureMonth(viewYear, m);
                  return (
                    <TouchableOpacity
                      key={`${viewYear}-${m}`}
                      onPress={() => {
                        if (disabled) return;
                        setViewMonth(m);
                        setMonthYearOpen(false);
                      }}
                      disabled={disabled}
                      style={[
                        styles.monthChip,
                        active && styles.monthCellActive,
                        active && { backgroundColor: colors.secondary },
                        !active &&
                          !disabled && {
                            backgroundColor: IOS_PICKER.panelSoft,
                          },
                        disabled && styles.monthCellDisabled,
                      ]}
                      activeOpacity={0.85}
                    >
                      <Text
                        style={[
                          styles.monthCellText,
                          { color: active ? '#FFFFFF' : IOS_PICKER.muted },
                          disabled && styles.monthCellTextDisabled,
                        ]}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export const HistoryDateRangeSelector = ({ value, onChange, colors, isDark }) => {
  const { width: screenW } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const layout = useMemo(() => layoutForWidth(screenW), [screenW]);
  const [modalOpen, setModalOpen] = useState(false);
  const [draftPreset, setDraftPreset] = useState(value.preset);
  const [draftStart, setDraftStart] = useState(value.customStart);
  const [draftEnd, setDraftEnd] = useState(value.customEnd);
  const [activeEdge, setActiveEdge] = useState('end'); // 'start' | 'end'

  const label = formatDateRangeLabel(value, HISTORY_COPY.rangeLabels);

  const openModal = () => {
    setDraftPreset(value.preset);
    setDraftStart(value.customStart);
    setDraftEnd(value.customEnd);
    setActiveEdge(value.customStart ? 'end' : 'start');
    setModalOpen(true);
  };

  const resetDraftFromValue = () => {
    setDraftPreset(value.preset);
    setDraftStart(value.customStart);
    setDraftEnd(value.customEnd);
    setActiveEdge(value.customStart ? 'end' : 'start');
  };

  const applyPreset = (presetId) => {
    setDraftPreset(presetId);
    if (presetId !== DATE_RANGE_PRESET.CUSTOM) {
      onChange({ preset: presetId, customStart: null, customEnd: null });
      setModalOpen(false);
    }
  };

  const normalizeRangeIfReady = (startIso, endIso) => {
    if (!startIso || !endIso) return { startIso, endIso };
    const s = new Date(startIso).getTime();
    const e = new Date(endIso).getTime();
    if (Number.isNaN(s) || Number.isNaN(e)) return { startIso, endIso };
    if (s <= e) return { startIso, endIso };
    return { startIso: endIso, endIso: startIso };
  };

  const handleDaySelect = (iso) => {
    setDraftPreset(DATE_RANGE_PRESET.CUSTOM);
    if (!draftStart && !draftEnd) {
      // 初次选择：永远当作 start
      setDraftStart(iso);
      setDraftEnd(null);
      setActiveEdge('end');
      return;
    }

    if (activeEdge === 'start') {
      const next = normalizeRangeIfReady(iso, draftEnd);
      setDraftStart(next.startIso);
      setDraftEnd(next.endIso);
      setActiveEdge('end');
      return;
    }

    // activeEdge === 'end'
    const next = normalizeRangeIfReady(draftStart, iso);
    setDraftStart(next.startIso);
    setDraftEnd(next.endIso);
    setActiveEdge('start');
  };

  const applyCustom = () => {
    if (!draftStart) return;
    const effectiveEnd = draftEnd ?? draftStart;
    onChange({
      preset: DATE_RANGE_PRESET.CUSTOM,
      customStart: draftStart,
      customEnd: effectiveEnd,
    });
    setModalOpen(false);
  };

  const customReady = Boolean(draftStart);

  const pickToday = () => {
    const todayIso = new Date().toISOString();
    setDraftPreset(DATE_RANGE_PRESET.CUSTOM);
    setDraftStart(todayIso);
    setDraftEnd(todayIso);
    setActiveEdge('start');
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.rangeBar,
          {
            backgroundColor: isDark ? 'rgba(148, 163, 184, 0.1)' : '#FFFFFF',
            borderColor: isDark ? 'rgba(148, 163, 184, 0.22)' : '#E2E8F0',
          },
        ]}
        onPress={openModal}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={`Date range: ${label}`}
      >
        <Calendar color={colors.secondary} size={16} strokeWidth={2.4} />
        <Text style={[styles.rangeBarText, { color: colors.text }]} numberOfLines={1}>
          {label}
        </Text>
        <ChevronDown color={colors.textMuted} size={16} strokeWidth={2.5} />
      </TouchableOpacity>

      <Modal visible={modalOpen} transparent animationType="fade" onRequestClose={() => setModalOpen(false)}>
        <Pressable style={styles.modalBackdrop}>
          <Pressable
            style={[
              styles.modalSheet,
              {
                backgroundColor: IOS_PICKER.surface,
                paddingHorizontal: layout.modalPadH,
                paddingBottom: Math.max(insets.bottom, layout.footerPadV),
              },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={[styles.modalHeader, { marginBottom: layout.sectionGap }]}>
              <Text style={[styles.modalTitle, { color: IOS_PICKER.text }]}>
                {HISTORY_COPY.rangeModalTitle}
              </Text>
              <TouchableOpacity onPress={() => setModalOpen(false)} hitSlop={10}>
                <X color={IOS_PICKER.muted} size={22} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              bounces={false}
              style={styles.modalScroll}
              contentContainerStyle={styles.modalScrollContent}
            >
              <Text
                style={[
                  styles.modalSectionLabel,
                  { color: IOS_PICKER.muted, marginBottom: layout.chipMargin },
                ]}
              >
                {HISTORY_COPY.rangeQuick}
              </Text>
              <View style={[styles.presetGrid, { marginBottom: layout.sectionGap }]}>
                {PRESET_OPTIONS.map((option) => {
                  const active = draftPreset === option.id;
                  return (
                    <TouchableOpacity
                      key={option.id}
                      onPress={() => applyPreset(option.id)}
                      style={[
                        styles.presetChip,
                        {
                          marginRight: layout.chipMargin,
                          marginBottom: layout.chipMargin,
                          backgroundColor: active
                            ? 'rgba(74, 132, 255, 0.22)'
                            : IOS_PICKER.panelSoft,
                          borderColor: active ? IOS_PICKER.primary : 'transparent',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.presetChipText,
                          { color: active ? IOS_PICKER.primary : IOS_PICKER.muted },
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text
                style={[
                  styles.modalSectionLabel,
                  {
                    color: IOS_PICKER.muted,
                    marginTop: layout.sectionGap,
                    marginBottom: layout.metaGap,
                  },
                ]}
              >
                {HISTORY_COPY.rangeCustom}
              </Text>
              <View style={[styles.rangeMetaRow, { marginBottom: layout.metaGap, gap: layout.metaGap }]}>
                <TouchableOpacity
                  onPress={() => setActiveEdge('start')}
                  activeOpacity={0.85}
                  style={[
                    styles.rangeMetaChip,
                    {
                      backgroundColor:
                        activeEdge === 'start'
                          ? IOS_PICKER.primary
                          : IOS_PICKER.panel,
                      borderColor:
                        activeEdge === 'start' ? IOS_PICKER.primary : 'transparent',
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Edit start date"
                >
                  <Text
                    style={[
                      styles.rangeMetaKey,
                      { color: activeEdge === 'start' ? '#FFFFFF' : IOS_PICKER.muted },
                    ]}
                  >
                    {HISTORY_COPY.rangeFrom}
                  </Text>
                  <Text
                    style={[
                      styles.rangeMetaValue,
                      { color: activeEdge === 'start' ? '#FFFFFF' : IOS_PICKER.text },
                    ]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.85}
                  >
                    {draftStart ? formatChipDate(draftStart) : '—'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setActiveEdge('end')}
                  activeOpacity={0.85}
                  style={[
                    styles.rangeMetaChip,
                    {
                      backgroundColor:
                        activeEdge === 'end'
                          ? IOS_PICKER.primary
                          : IOS_PICKER.panel,
                      borderColor:
                        activeEdge === 'end' ? IOS_PICKER.primary : 'transparent',
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Edit end date"
                >
                  <Text
                    style={[
                      styles.rangeMetaKey,
                      { color: activeEdge === 'end' ? '#FFFFFF' : IOS_PICKER.muted },
                    ]}
                  >
                    {HISTORY_COPY.rangeTo}
                  </Text>
                  <Text
                    style={[
                      styles.rangeMetaValue,
                      { color: activeEdge === 'end' ? '#FFFFFF' : IOS_PICKER.text },
                    ]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.85}
                  >
                    {draftEnd ? formatChipDate(draftEnd) : draftStart ? formatChipDate(draftStart) : '—'}
                  </Text>
                </TouchableOpacity>
              </View>
              <MiniMonthPicker
                colors={colors}
                isDark={isDark}
                draftStart={draftStart}
                draftEnd={draftEnd}
                activeEdge={activeEdge}
                onSelectDay={handleDaySelect}
                layout={layout}
              />
            </ScrollView>

            <View
              style={[
                styles.footerActions,
                {
                  marginHorizontal: -layout.modalPadH,
                  paddingHorizontal: layout.modalPadH,
                  paddingTop: layout.footerPadV,
                  borderTopColor: IOS_PICKER.border,
                },
              ]}
            >
              <View style={[styles.actionRow, { gap: layout.metaGap }]}>
                <TouchableOpacity
                  style={[
                    styles.footerBtn,
                    {
                      borderColor: IOS_PICKER.border,
                      backgroundColor: 'transparent',
                    },
                  ]}
                  onPress={pickToday}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel="Set to today"
                >
                  <Text style={[styles.footerBtnText, { color: IOS_PICKER.text }]}>Today</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.footerBtn,
                    {
                      borderColor: IOS_PICKER.border,
                      backgroundColor: 'transparent',
                    },
                  ]}
                  onPress={() => {
                    resetDraftFromValue();
                    setModalOpen(false);
                  }}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel="Cancel date changes"
                >
                  <Text style={[styles.footerBtnText, { color: IOS_PICKER.text }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.footerBtn,
                    styles.footerBtnPrimary,
                    {
                      backgroundColor: customReady ? IOS_PICKER.doneBg : '#E2E8F0',
                      borderColor: customReady ? IOS_PICKER.doneBg : IOS_PICKER.border,
                    },
                  ]}
                  onPress={applyCustom}
                  disabled={!customReady}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel="Apply custom date range"
                >
                  <Text
                    style={[
                      styles.footerBtnText,
                      styles.footerBtnTextPrimary,
                      { color: customReady ? IOS_PICKER.doneText : IOS_PICKER.muted },
                    ]}
                  >
                    Done
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  rangeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
  },
  rangeBarText: { flex: 1, fontSize: 13, fontWeight: '700' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingTop: 18,
    maxHeight: '88%',
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    flexDirection: 'column',
  },
  modalScroll: {
    flexGrow: 0,
    flexShrink: 1,
  },
  modalScrollContent: {
    paddingBottom: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: { fontSize: 17, fontWeight: '800' },
  modalSectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 4,
  },
  presetGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  presetChipText: { fontSize: 12, fontWeight: '700' },
  rangeMetaRow: { flexDirection: 'row' },
  rangeMetaChip: {
    flex: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    minWidth: 0,
  },
  rangeMetaKey: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  rangeMetaValue: { marginTop: 3, fontSize: 12, fontWeight: '700' },
  calendarBlock: { marginBottom: 12 },
  calendarNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    columnGap: 6,
  },
  calendarNavBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: IOS_PICKER.panelSoft,
    flexShrink: 0,
  },
  calendarMonth: { fontSize: 14, fontWeight: '700', flexShrink: 1 },
  monthYearTopPills: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
    minWidth: 0,
  },
  monthYearTopBtn: {
    borderRadius: 999,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: IOS_PICKER.border,
    gap: 3,
    flexShrink: 1,
    maxWidth: '48%',
  },
  monthYearTopBtnIOS: { backgroundColor: IOS_PICKER.panelSoft },
  weekdayRow: { flexDirection: 'row', marginBottom: 6, paddingHorizontal: 2 },
  weekdayLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
  },
  dayGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 2 },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  dayDot: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellDisabled: { opacity: 0.35 },
  dayInRangeLight: { backgroundColor: '#EEF2FF' },
  dayInRangeDark: { backgroundColor: 'rgba(99, 102, 241, 0.16)' },
  dayEdge: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.75)',
  },
  dayEdgeActive: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOpacity: 0.22,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  dayText: { fontSize: 13, fontWeight: '600' },
  monthYearBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  monthYearSheet: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
    minHeight: 340,
    shadowColor: '#000000',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  monthYearHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  monthYearTitle: { fontSize: 16, fontWeight: '800' },
  monthYearLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  modeSwitchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  modeSwitchBtn: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderColor: 'transparent',
  },
  modeSwitchText: { fontSize: 12, fontWeight: '800' },
  monthYearActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  yearGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  yearPagerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  yearPagerBtn: {
    width: 32,
    height: 32,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  yearPagerBtnDisabled: { opacity: 0.45 },
  yearChip: {
    width: '23.5%',
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  yearChipText: { fontSize: 12, fontWeight: '800' },
  jumpTodayBtn: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginLeft: 8,
  },
  jumpTodayText: { fontSize: 12, fontWeight: '800' },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  monthChip: {
    width: '23.5%',
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  monthCellActive: {
    shadowColor: '#000000',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  monthCellDisabled: { opacity: 0.22 },
  monthCellDark: { borderWidth: 1, borderColor: 'rgba(148, 163, 184, 0.12)' },
  monthCellTextDisabled: { opacity: 0.65 },
  monthCellText: { fontSize: 13, fontWeight: '800' },
  footerActions: {
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  footerBtn: {
    flex: 1,
    minWidth: 0,
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  footerBtnPrimary: {
    borderWidth: 0,
  },
  footerBtnText: { fontSize: 13, fontWeight: '700', textAlign: 'center' },
  footerBtnTextPrimary: { fontWeight: '800' },
});
