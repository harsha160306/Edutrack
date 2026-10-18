import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SectionList,
  ActivityIndicator,
  TextInput,
  Modal,
  Pressable,
  Animated,
  useWindowDimensions,
  Platform,
} from 'react-native';

import { ChevronLeft, History, Search, ScanLine, ArrowUpDown, ListFilter, User, Users, Check } from 'lucide-react-native';
import {
  getAllLatecomerMarks,
  MARK_SOURCE,
  seedCommitteeDemoMarksIfNeeded,
} from '../faculty-offline-sync';
import { HISTORY_COPY, HISTORY_FILTER } from './constants';
import { LatecomerMarkRow } from './LatecomerMarkRow';
import { LatecomerRecordSheet } from './LatecomerRecordSheet';
import { groupMarksByDay } from './groupMarksByDay';
import { HistoryDateRangeSelector } from './HistoryDateRangeSelector';
import {
  DATE_RANGE_PRESET,
  filterMarksByDateRange,
  resolveDateRange,
} from './historyDateRange';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SearchBarcodeScannerModal } from '../app-search/SearchBarcodeScannerModal';
import { SEARCH_COPY } from '../app-search/constants';

const FILTER_OPTIONS = [
  { id: HISTORY_FILTER.ALL, label: HISTORY_COPY.filterAll, Icon: ListFilter },
  { id: HISTORY_FILTER.BY_YOU, label: HISTORY_COPY.filterByYou, Icon: User },
  { id: HISTORY_FILTER.BY_COMMITTEE, label: HISTORY_COPY.filterByCommittee, Icon: Users },
];
const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest' },
  { id: 'oldest', label: 'Oldest' },
];

const filterSource = (filterId) => {
  if (filterId === HISTORY_FILTER.BY_YOU) return MARK_SOURCE.SELF;
  if (filterId === HISTORY_FILTER.BY_COMMITTEE) return MARK_SOURCE.COMMITTEE;
  return undefined;
};

const filterSubtitleLabel = (filterId) => {
  if (filterId === HISTORY_FILTER.BY_YOU) return 'By You';
  if (filterId === HISTORY_FILTER.BY_COMMITTEE) return 'By Committee';
  return null;
};

const includesQuery = (value, query) => String(value || '').toLowerCase().includes(query);
const selectedChipFlex = (label) => Math.max(1.2, Math.min(2.3, 1 + label.length * 0.09));

const FrostedPill = ({ isDark, style, children }) => {
  return (
    <View
      style={[
        style,
        styles.frostShell,
        { backgroundColor: isDark ? 'rgba(30, 41, 59, 0.96)' : '#EEF4FB' },
      ]}
      pointerEvents="box-none"
    >
      {children}
    </View>
  );
};

const AnimatedFilterChip = ({ option, active, isDark, onPress, activeFlex }) => {
  const Icon = option.Icon;
  const progress = useRef(new Animated.Value(active ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(progress, {
      toValue: active ? 1 : 0,
      tension: 220,
      friction: 18,
      useNativeDriver: true,
    }).start();
  }, [active, progress]);

  const scale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });

  const iconColor = active ? '#007AFF' : isDark ? '#94A3B8' : '#64748B';

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.filterChip,
        active ? styles.filterChipActive : styles.filterChipInactive,
        { flex: active ? activeFlex : 0.85 },
        {
          backgroundColor: active
            ? isDark
              ? 'rgba(255, 255, 255, 0.12)'
              : '#FFFFFF'
            : 'transparent',
          borderColor: active ? (isDark ? 'rgba(255, 255, 255, 0.22)' : 'rgba(15, 23, 42, 0.08)') : 'transparent',
        },
      ]}
      activeOpacity={0.85}
    >
      <Animated.View style={[styles.filterChipContent, { transform: [{ scale }] }]}>
        <Icon
          size={13}
          strokeWidth={2.3}
          color={iconColor}
        />
        {active ? (
          <Animated.Text
            style={[
              styles.filterChipText,
              { color: iconColor, opacity: progress },
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {option.label}
          </Animated.Text>
        ) : null}
      </Animated.View>
    </TouchableOpacity>
  );
};

const AnimatedIconBubble = ({ children, style, onPress }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.9,
      tension: 260,
      friction: 18,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      tension: 220,
      friction: 16,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

export const LatecomerHistoryScreen = ({
  colors,
  isDark,
  accountId,
  onBack,
  title,
  initialDatePreset = DATE_RANGE_PRESET.ALL,
  initialFilter = HISTORY_FILTER.ALL,
  hideFilters = false,
  showDateRangeSelector = true,
  HeaderIcon = History,
}) => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const compact = width < 390;
  const bubbleSize = compact ? 44 : 46;
  const sideInset = compact ? 12 : 16;
  const bottomDock = Math.max(insets.bottom + 12, 20);
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(initialFilter);
  const [dateRange, setDateRange] = useState({
    preset: initialDatePreset,
    customStart: null,
    customEnd: null,
  });
  const [searchText, setSearchText] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [sortOpen, setSortOpen] = useState(false);

  const loadMarks = useCallback(async () => {
    setLoading(true);
    try {
      await seedCommitteeDemoMarksIfNeeded(accountId);
      const source = filterSource(filter);
      const all = await getAllLatecomerMarks(accountId, source ? { source } : {});
      setMarks(all);
    } finally {
      setLoading(false);
    }
  }, [accountId, filter]);

  useEffect(() => {
    loadMarks();
  }, [loadMarks]);

  const resolvedRange = useMemo(() => resolveDateRange(dateRange), [dateRange]);
  const dateFilteredMarks = useMemo(
    () => filterMarksByDateRange(marks, resolvedRange),
    [marks, resolvedRange],
  );
  const query = searchText.trim().toLowerCase();
  const filteredMarks = useMemo(() => {
    if (!query) return dateFilteredMarks;
    return dateFilteredMarks.filter((mark) => (
      includesQuery(mark.studentName, query) ||
      includesQuery(mark.studentId, query) ||
      includesQuery(mark.dept, query)
    ));
  }, [dateFilteredMarks, query]);
  const sortedMarks = useMemo(() => {
    const items = [...filteredMarks];
    items.sort((a, b) => {
      const aTime = new Date(a.markedAt).getTime();
      const bTime = new Date(b.markedAt).getTime();
      return sortBy === 'oldest' ? aTime - bTime : bTime - aTime;
    });
    return items;
  }, [filteredMarks, sortBy]);
  const sections = useMemo(() => groupMarksByDay(sortedMarks), [sortedMarks]);
  const filterLabel = filterSubtitleLabel(filter);
  const rangeActive = dateRange.preset !== DATE_RANGE_PRESET.ALL;
  const searchActive = query.length > 0;
  const [selectedMark, setSelectedMark] = useState(null);

  const handleRowPress = useCallback((mark) => {
    setSelectedMark(mark);
  }, []);


  return (
    <View
      style={[styles.root, { backgroundColor: colors.background, paddingTop: Math.max(insets?.top || 0, 16), paddingBottom: Math.max(insets?.bottom || 0, 16) }]}
    >
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={12}>
          <ChevronLeft color={colors.text} size={26} strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={styles.topCenter}>
          <HeaderIcon color={colors.secondary} size={22} strokeWidth={2.5} />
          <Text style={[styles.topTitle, { color: colors.text }]}>
            {title ?? HISTORY_COPY.title}
          </Text>
        </View>
        <View style={styles.backBtn} />
      </View>

      {showDateRangeSelector ? (
        <HistoryDateRangeSelector
          value={dateRange}
          onChange={setDateRange}
          colors={colors}
          isDark={isDark}
        />
      ) : null}

      <View
        style={[
          styles.searchBox,
          {
            backgroundColor: isDark ? '#1e293b' : '#FFFFFF',
            borderColor: isDark ? 'rgba(148, 163, 184, 0.22)' : '#E2E8F0',
          },
        ]}
      >
        <Search color={colors.textMuted} size={16} strokeWidth={2.3} />
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder={HISTORY_COPY.searchPlaceholder}
          placeholderTextColor={colors.textMuted}
          style={[styles.searchInput, { color: colors.text }]}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />

        <TouchableOpacity
          onPress={() => setScannerOpen(true)}
          style={styles.scanInSearchBtn}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={SEARCH_COPY.scanBarcode}
        >
          <ScanLine color={colors.secondary} size={16} strokeWidth={2.1} />
        </TouchableOpacity>
      </View>

      <Text style={[styles.subtitle, { color: colors.textMuted }]}>
        {loading
          ? HISTORY_COPY.loading
          : sortedMarks.length === 0
            ? searchActive
              ? HISTORY_COPY.emptySearchSubtitle
              : rangeActive || marks.length > 0
              ? HISTORY_COPY.emptyRangeSubtitle
              : HISTORY_COPY.emptySubtitle
            : HISTORY_COPY.subtitle(sortedMarks.length, filterLabel, rangeActive)}
      </Text>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={colors.secondary} />
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <LatecomerMarkRow
              mark={item}
              colors={colors}
              isDark={isDark}
              onPress={handleRowPress}
            />
          )}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>{title}</Text>
          )}
          contentContainerStyle={[
            styles.listContent,
            sections.length === 0 && styles.listContentEmpty,
          ]}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                {HISTORY_COPY.emptyTitle}
              </Text>
              <Text style={[styles.emptyHint, { color: colors.textMuted }]}>
                {searchActive
                  ? HISTORY_COPY.emptySearchHint
                  : rangeActive
                  ? HISTORY_COPY.emptyRangeHint
                  : filter === HISTORY_FILTER.ALL
                    ? HISTORY_COPY.emptyHint
                    : HISTORY_COPY.emptyFilterHint}
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
        />
      )}

      {!hideFilters && (
        <View
          style={[
            styles.bottomDockRow,
            {
              left: sideInset,
              right: sideInset,
              bottom: bottomDock,
            },
          ]}
        >
          <FrostedPill
          isDark={isDark}
          style={[
            styles.filterBottomBar,
            {
              borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.06)',
            },
          ]}
        >
          <View style={styles.filterRow}>
            {FILTER_OPTIONS.map((option) => {
              const active = filter === option.id;
              return (
                <AnimatedFilterChip
                  key={option.id}
                  option={option}
                  active={active}
                  isDark={isDark}
                  onPress={() => setFilter(option.id)}
                  activeFlex={selectedChipFlex(option.label)}
                />
              );
            })}
          </View>
        </FrostedPill>

        <AnimatedIconBubble
          onPress={() => setSortOpen(true)}
          style={[styles.sortBubbleWrap, { width: bubbleSize, height: bubbleSize }]}
        >
          <FrostedPill
            isDark={isDark}
            style={[
              styles.sortBubble,
              {
                width: bubbleSize,
                height: bubbleSize,
                borderRadius: bubbleSize / 2,
                backgroundColor: isDark ? 'rgba(30, 41, 59, 0.96)' : '#EEF4FB',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.06)',
              },
            ]}
          >
            <View style={styles.sortIconWrap}>
              <ArrowUpDown color="#007AFF" size={17} strokeWidth={2.1} />
            </View>
          </FrostedPill>
        </AnimatedIconBubble>
        </View>
      )}

      <Modal
        visible={sortOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setSortOpen(false)}
      >
        <Pressable style={styles.sortBackdrop} onPress={() => setSortOpen(false)}>
          <Pressable
            style={[
              styles.sortSheet,
              {
                backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                borderColor: isDark ? 'rgba(148, 163, 184, 0.3)' : '#E2E8F0',
              },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={[styles.sortSheetTitle, { color: colors.text }]}>Sort records</Text>
            {SORT_OPTIONS.map((option) => {
              const active = sortBy === option.id;
              return (
                <View key={option.id}>
                  <TouchableOpacity
                    onPress={() => {
                      setSortBy(option.id);
                      setSortOpen(false);
                    }}
                    style={styles.sortOptionRow}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.sortOptionText, { color: active ? '#007AFF' : colors.textMuted }]}>
                      {option.label}
                    </Text>
                    {active ? <Check color="#007AFF" size={18} strokeWidth={2.5} /> : <View style={styles.sortTickSpacer} />}
                  </TouchableOpacity>
                  {option.id !== SORT_OPTIONS[SORT_OPTIONS.length - 1].id ? (
                    <View style={[styles.sortSeparator, { backgroundColor: isDark ? 'rgba(148, 163, 184, 0.22)' : '#E5E7EB' }]} />
                  ) : null}
                </View>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>

      <LatecomerRecordSheet
        visible={Boolean(selectedMark)}
        mark={selectedMark}
        colors={colors}
        isDark={isDark}
        onClose={() => setSelectedMark(null)}
      />

      <SearchBarcodeScannerModal
        visible={scannerOpen}
        colors={colors}
        isDark={isDark}
        onClose={() => setScannerOpen(false)}
        onScanned={(parsed) => {
          const roll = parsed.studentId?.trim();
          if (roll) setSearchText(roll);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 4,
  },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  scanInSearchBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  topCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  topTitle: { fontSize: 17, fontWeight: '700' },
  bottomDockRow: {
    position: 'absolute',
    zIndex: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  frostShell: {
    overflow: 'hidden',
  },
  filterBottomBar: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 999,
    padding: 5,
    shadowColor: '#000',
    shadowOpacity: Platform.OS === 'ios' ? 0.05 : 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
    marginBottom: 0,
  },
  filterChip: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  filterChipActive: {
    shadowColor: '#000',
    shadowOpacity: Platform.OS === 'ios' ? 0.06 : 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 0.5,
  },
  filterChipInactive: { opacity: 1 },
  filterChipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    minWidth: 0,
    width: '100%',
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    flexShrink: 1,
    lineHeight: 14,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  sortBubbleWrap: {
    zIndex: 31,
  },
  sortBubble: {
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: Platform.OS === 'ios' ? 0.05 : 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  sortIconWrap: { marginTop: 0 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginHorizontal: 20,
    marginBottom: 10,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    fontWeight: '500',
    outlineStyle: 'none',
    outlineWidth: 0,
  },
  sortBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  sortSheet: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 80,
    width: '76%',
    alignSelf: 'center',
    maxWidth: 300,
  },
  sortSheetTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  sortOptionRow: {
    borderWidth: 0,
    borderRadius: 0,
    paddingVertical: 12,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sortOptionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  sortTickSpacer: { width: 18, height: 18 },
  sortSeparator: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 6,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { paddingHorizontal: 20, paddingBottom: 110 },
  listContentEmpty: { flexGrow: 1 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 4,
  },
  sectionTitleDark: { color: '#94A3B8' },
  emptyBox: { paddingTop: 48, paddingHorizontal: 12, alignItems: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  emptyHint: { fontSize: 13, fontWeight: '500', textAlign: 'center', lineHeight: 20 },
});
