import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, UserCheck, Plus } from 'lucide-react-native';
import { useFacultyOfflineSync } from '../faculty-offline-sync';
import { MARKED_COPY } from './constants';
import { LatecomerMarkRow } from './LatecomerMarkRow';
import { LatecomerRecordSheet } from './LatecomerRecordSheet';

export const MarkedLatecomersScreen = ({
  colors,
  isDark,
  accountId,
  onBack,
  onMarkAnother,
}) => {
  const {
    todayMarksByYou: todayMarks,
    todayMarkedCount,
    pendingCount,
    todaySyncedCount,
    isSyncing,
    canSync,
    syncNow,
    isOffline,
  } = useFacultyOfflineSync(accountId, true);

  const listData = useMemo(
    () =>
      [...todayMarks].sort(
        (a, b) => new Date(b.markedAt).getTime() - new Date(a.markedAt).getTime(),
      ),
    [todayMarks],
  );

  const [selectedMark, setSelectedMark] = useState(null);
  const handleRowPress = (mark) => setSelectedMark(mark);

  const header = (
    <View style={styles.headerBlock}>
      <View style={styles.summaryRow}>
        <SummaryChip
          label={MARKED_COPY.summaryMarked}
          value={String(todayMarkedCount)}
          tone="#3B82F6"
          isDark={isDark}
        />
        <SummaryChip
          label={MARKED_COPY.summaryPending}
          value={String(pendingCount)}
          tone="#F59E0B"
          isDark={isDark}
        />
        <SummaryChip
          label={MARKED_COPY.summarySynced}
          value={String(todaySyncedCount)}
          tone="#10B981"
          isDark={isDark}
        />
      </View>
      {isOffline ? (
        <Text style={[styles.offlineNote, { color: isDark ? '#FCD34D' : '#B45309' }]}>
          Offline — pending marks stay on this device.
        </Text>
      ) : null}
      {pendingCount > 0 && canSync ? (
        <TouchableOpacity
          style={[styles.syncBtn, { borderColor: colors.border }]}
          onPress={() => syncNow()}
          disabled={isSyncing}
          activeOpacity={0.85}
        >
          {isSyncing ? (
            <ActivityIndicator color={colors.secondary} />
          ) : (
            <Text style={[styles.syncBtnText, { color: colors.secondary }]}>
              {MARKED_COPY.syncNow}
            </Text>
          )}
        </TouchableOpacity>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: colors.background }]}
      edges={['top', 'bottom']}
    >
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={12}>
          <ChevronLeft color={colors.text} size={26} strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={styles.topCenter}>
          <UserCheck color={colors.secondary} size={22} strokeWidth={2.5} />
          <Text style={[styles.topTitle, { color: colors.text }]}>{MARKED_COPY.title}</Text>
        </View>
        <View style={styles.backBtn} />
      </View>

      <Text style={[styles.subtitle, { color: colors.textMuted }]}>{MARKED_COPY.subtitle}</Text>

      <FlatList
        data={listData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <LatecomerMarkRow
            mark={item}
            colors={colors}
            isDark={isDark}
            onPress={handleRowPress}
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          listData.length === 0 && styles.listContentEmpty,
        ]}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>{MARKED_COPY.emptyTitle}</Text>
            <Text style={[styles.emptyHint, { color: colors.textMuted }]}>
              {MARKED_COPY.emptyHint}
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.secondary }]}
        onPress={onMarkAnother}
        activeOpacity={0.88}
        accessibilityRole="button"
        accessibilityLabel={MARKED_COPY.markAnother}
      >
        <Plus color="#fff" size={20} strokeWidth={2.8} />
        <Text style={styles.fabText}>{MARKED_COPY.markAnother}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const SummaryChip = ({ label, value, tone, isDark }) => (
  <View
    style={[
      styles.chip,
      { backgroundColor: isDark ? 'rgba(148,163,184,0.12)' : '#F8FAFC', borderColor: `${tone}33` },
    ]}
  >
    <Text style={[styles.chipValue, { color: tone }]}>{value}</Text>
    <Text style={[styles.chipLabel, isDark && styles.chipLabelDark]}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 4,
  },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  topCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  topTitle: { fontSize: 17, fontWeight: '700' },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  headerBlock: { marginBottom: 12 },
  summaryRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  chipValue: { fontSize: 20, fontWeight: '800' },
  chipLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  chipLabelDark: { color: '#94A3B8' },
  offlineNote: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  syncBtn: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 4,
  },
  syncBtnText: { fontSize: 15, fontWeight: '700' },
  listContent: { paddingHorizontal: 20, paddingBottom: 88 },
  listContentEmpty: { flexGrow: 1 },
  emptyBox: { paddingTop: 32, paddingHorizontal: 16, alignItems: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  emptyHint: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  fab: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: Platform.OS === 'ios' ? 52 : 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
      },
      android: { elevation: 4 },
      default: {},
    }),
  },
  fabText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
