import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Search, ScanLine, X } from 'lucide-react-native';
import { SEARCH_COPY } from './constants';
import { filterSearchCatalog } from './filterSearchCatalog';
import { SearchBarcodeScannerModal } from './SearchBarcodeScannerModal';
import { SearchStudentSheet } from './SearchStudentSheet';
import { StudentInfoCard } from './StudentInfoCard';
import { useFacultyOfflineSync } from '../faculty-offline-sync';
import { OFFLINE_COPY } from '../faculty-offline-sync/constants';
const StudentRow = ({ item, colors, isDark, onPress }) => (
  <TouchableOpacity
    style={[
      styles.resultRow,
      { backgroundColor: isDark ? '#1e293b' : colors.card, borderColor: colors.border },
    ]}
    onPress={() => onPress?.(item)}
    activeOpacity={0.82}
    accessibilityRole="button"
    accessibilityLabel={`${item.name}, ${item.rollNo}`}
  >
    <StudentInfoCard student={item} colors={colors} isDark={isDark} embedded />
  </TouchableOpacity>
);

const QuickActionRow = ({ item, colors, isDark, onPress }) => (
  <TouchableOpacity
    style={[
      styles.quickRow,
      { backgroundColor: isDark ? '#0f172a' : colors.cardAlt, borderColor: colors.border },
    ]}
    onPress={() => onPress?.(item)}
    activeOpacity={0.82}
    accessibilityRole="button"
    accessibilityLabel={item.label}
  >
    <Search size={16} color={colors.primary} strokeWidth={2.4} />
    <Text style={[styles.quickLabel, { color: colors.text }]} numberOfLines={1}>
      {item.label}
    </Text>
  </TouchableOpacity>
);

export const AppSearchScreen = ({
  colors,
  isDark,
  isFaculty = true,
  accountId,
  onBack,
  onQuickActionPress,
}) => {
  const [query, setQuery] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const { markLatecomer, isOffline, canSync } = useFacultyOfflineSync(accountId, Boolean(accountId));

  const handleMarkLate = useCallback(
    async (student) => {
      try {
        await markLatecomer({
          studentId: student.rollNo,
          studentName: student.name,
          dept: student.dept,
        });
        Alert.alert(
          'Recorded',
          isOffline || !canSync ? OFFLINE_COPY.savedOffline : OFFLINE_COPY.savedAndSynced,
        );
        setSelectedStudent(null);
      } catch (err) {
        Alert.alert('Could not save', err?.message ?? 'Try again.');
        throw err;
      }
    },
    [markLatecomer, isOffline, canSync],
  );

  const { students, quickActions } = useMemo(
    () =>
      filterSearchCatalog(query, {
        includeQuickActions: isFaculty,
      }),
    [query, isFaculty],
  );

  const hasQuery = query.trim().length > 0;
  const hasResults = students.length > 0 || quickActions.length > 0;

  const listSections = useMemo(() => {
    const sections = [];
    if (students.length > 0) {
      sections.push({ key: 'students-header', type: 'header', title: SEARCH_COPY.sectionStudents });
      students.forEach((item) => {
        sections.push({ key: `student-${item.id}`, type: 'student', item });
      });
    }
    if (quickActions.length > 0) {
      sections.push({ key: 'actions-header', type: 'header', title: SEARCH_COPY.sectionQuickActions });
      quickActions.forEach((item) => {
        sections.push({ key: `action-${item.id}`, type: 'action', item });
      });
    }
    return sections;
  }, [students, quickActions]);

  const renderItem = ({ item: row }) => {
    if (row.type === 'header') {
      return (
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{row.title}</Text>
      );
    }
    if (row.type === 'student') {
      return (
        <StudentRow
          item={row.item}
          colors={colors}
          isDark={isDark}
          onPress={setSelectedStudent}
        />
      );
    }
    return (
      <QuickActionRow
        item={row.item}
        colors={colors}
        isDark={isDark}
        onPress={onQuickActionPress}
      />
    );
  };

  const showNoMatches = hasQuery && !hasResults;

  const emptyComponent = showNoMatches ? (
    <View style={styles.emptyBox}>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>{SEARCH_COPY.noResults}</Text>
      <Text style={[styles.emptyHint, { color: colors.textMuted }]}>
        {SEARCH_COPY.noResultsHint}
      </Text>
    </View>
  ) : null;

  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.root, { backgroundColor: colors.background, paddingTop: Math.max(insets?.top || 0, 16), paddingBottom: Math.max(insets?.bottom || 0, 16) }]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.backBtn}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <ChevronLeft color={colors.text} size={26} strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Search color={colors.secondary} size={22} strokeWidth={2.5} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>{SEARCH_COPY.title}</Text>
        </View>
        <View style={styles.backBtn} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.searchBarWrap}>
          <View
            style={[
              styles.searchBar,
              {
                backgroundColor: isDark ? '#1e293b' : colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <Search size={18} color={colors.textMuted} strokeWidth={2.2} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={SEARCH_COPY.placeholder}
              placeholderTextColor={colors.textMuted}
              style={[styles.searchInput, { color: colors.text }]}
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
              clearButtonMode="never"
              returnKeyType="search"
              accessibilityLabel={SEARCH_COPY.placeholder}
            />
            {hasQuery ? (
              <TouchableOpacity
                onPress={() => setQuery('')}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={SEARCH_COPY.clear}
              >
                <X size={18} color={colors.textMuted} strokeWidth={2.4} />
              </TouchableOpacity>
            ) : null}
            {isFaculty ? (
              <TouchableOpacity
                onPress={() => setScannerOpen(true)}
                hitSlop={8}
                style={[
                  styles.scanBtn,
                  {
                    backgroundColor: isDark ? '#0f172a' : colors.cardAlt,
                    borderColor: colors.border,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel={SEARCH_COPY.scanBarcode}
              >
                <ScanLine size={20} color={colors.primary} strokeWidth={2.4} />
              </TouchableOpacity>
            ) : null}
          </View>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>{SEARCH_COPY.subtitle}</Text>
        </View>

        <FlatList
          data={listSections}
          keyExtractor={(row) => row.key}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.listContent,
            !hasResults && styles.listContentEmpty,
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={emptyComponent}
        />
      </KeyboardAvoidingView>

      <SearchBarcodeScannerModal
        visible={scannerOpen}
        colors={colors}
        isDark={isDark}
        onClose={() => setScannerOpen(false)}
        onScanned={(parsed) => {
          const roll = parsed.studentId?.trim();
          if (roll) setQuery(roll);
        }}
      />

      <SearchStudentSheet
        visible={Boolean(selectedStudent)}
        student={selectedStudent}
        colors={colors}
        isDark={isDark}
        onClose={() => setSelectedStudent(null)}
        onMarkLate={handleMarkLate}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', letterSpacing: -0.3 },
  searchBarWrap: { paddingHorizontal: 20, paddingBottom: 12 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'web' ? 12 : 10,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    padding: 0,
    minWidth: 0,
    ...Platform.select({
      web: { outlineStyle: 'none' },
      default: {},
    }),
  },
  scanBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: { fontSize: 13, fontWeight: '500', lineHeight: 18 },
  listContent: { paddingHorizontal: 20, paddingBottom: 24 },
  listContentEmpty: { flexGrow: 1 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginTop: 8,
    marginBottom: 8,
  },
  resultRow: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 0,
    marginBottom: 8,
    overflow: 'hidden',
  },
  quickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  quickLabel: { flex: 1, fontSize: 14, fontWeight: '600' },
  emptyBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 48,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  emptyHint: { fontSize: 14, fontWeight: '500', textAlign: 'center', lineHeight: 20 },
});
