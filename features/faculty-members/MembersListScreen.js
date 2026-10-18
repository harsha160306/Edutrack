import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Users, X } from 'lucide-react-native';
import { MEMBERS_COPY } from './constants';
import { filterMembers } from './filterMembers';

const MemberRow = ({ item, colors, isDark }) => (
  <View
    style={[
      styles.row,
      { backgroundColor: isDark ? '#1e293b' : colors.card, borderColor: colors.border },
    ]}
  >
    <LinearGradient
      colors={['#DBEAFE', '#3B82F6', '#1D4ED8']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.avatar}
    >
      <Text style={styles.avatarText}>{item.initials}</Text>
    </LinearGradient>
    <View style={styles.body}>
      <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={[styles.meta, { color: colors.textMuted }]} numberOfLines={1}>
        {item.dept}
        <Text style={styles.metaDot}> · </Text>
        {item.role}
      </Text>
      <Text style={[styles.email, { color: colors.textMuted }]} numberOfLines={1}>
        {item.email}
      </Text>
    </View>
    <View
      style={[
        styles.dutyPill,
        item.onDuty
          ? { backgroundColor: isDark ? '#14532d' : '#DCFCE7' }
          : { backgroundColor: isDark ? '#334155' : '#F1F5F9' },
      ]}
    >
      <Text
        style={[
          styles.dutyText,
          item.onDuty
            ? { color: isDark ? '#86EFAC' : '#166534' }
            : { color: isDark ? '#94A3B8' : '#64748B' },
        ]}
      >
        {item.onDuty ? 'On duty' : 'No duty'}
      </Text>
    </View>
  </View>
);

export const MembersListScreen = ({ colors, isDark, onBack }) => {
  const [query, setQuery] = useState('');
  const members = useMemo(() => filterMembers(query), [query]);
  const hasQuery = query.trim().length > 0;

  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.root, { backgroundColor: colors.background, paddingTop: Math.max(insets?.top || 0, 16), paddingBottom: Math.max(insets?.bottom || 0, 16) }]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={12}>
          <ChevronLeft color={colors.text} size={26} strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Users color={colors.secondary} size={22} strokeWidth={2.5} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>{MEMBERS_COPY.title}</Text>
        </View>
        <View style={styles.backBtn} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.searchWrap}>
          <View
            style={[
              styles.searchBar,
              {
                backgroundColor: isDark ? '#1e293b' : colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <Users size={18} color={colors.textMuted} strokeWidth={2.2} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={MEMBERS_COPY.placeholder}
              placeholderTextColor={colors.textMuted}
              style={[styles.searchInput, { color: colors.text }]}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />
            {hasQuery ? (
              <TouchableOpacity onPress={() => setQuery('')} hitSlop={8}>
                <X size={18} color={colors.textMuted} strokeWidth={2.4} />
              </TouchableOpacity>
            ) : null}
          </View>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>{MEMBERS_COPY.subtitle}</Text>
        </View>

        <FlatList
          data={members}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MemberRow item={item} colors={colors} isDark={isDark} />}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            !hasQuery ? (
              <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
                {MEMBERS_COPY.sectionActive} ({members.length})
              </Text>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>{MEMBERS_COPY.noResults}</Text>
              <Text style={[styles.emptyHint, { color: colors.textMuted }]}>
                {MEMBERS_COPY.noResultsHint}
              </Text>
            </View>
          }
        />
      </KeyboardAvoidingView>
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
  headerTitle: { fontSize: 17, fontWeight: '700' },
  searchWrap: { paddingHorizontal: 20, paddingBottom: 12 },
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
    ...Platform.select({ web: { outlineStyle: 'none' }, default: {} }),
  },
  subtitle: { fontSize: 13, fontWeight: '500', lineHeight: 18 },
  listContent: { paddingHorizontal: 20, paddingBottom: 24 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  body: { flex: 1, minWidth: 0 },
  name: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  meta: { fontSize: 12, fontWeight: '600' },
  metaDot: { fontWeight: '700' },
  email: { fontSize: 11, fontWeight: '500', marginTop: 2 },
  dutyPill: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  dutyText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  emptyBox: { paddingTop: 48, alignItems: 'center', paddingHorizontal: 24 },
  emptyTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  emptyHint: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
