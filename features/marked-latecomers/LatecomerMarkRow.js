import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SYNC_STATUS } from '../faculty-offline-sync/constants';
import { MARKED_COPY } from './constants';

export const formatMarkWhen = (iso) => {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '—';
  }
};

export const initialsFromMark = (mark) => {
  const name = mark.studentName || mark.studentId;
  const parts = String(name).split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return String(name).slice(0, 2).toUpperCase();
};

const statusMeta = (syncStatus, isDark) => {
  if (syncStatus === SYNC_STATUS.PENDING) {
    return {
      label: MARKED_COPY.pendingBadge,
      bg: isDark ? '#422006' : '#FEF3C7',
      color: isDark ? '#FCD34D' : '#B45309',
    };
  }
  if (syncStatus === SYNC_STATUS.FAILED) {
    return {
      label: MARKED_COPY.failedBadge,
      bg: isDark ? '#450a0a' : '#FEE2E2',
      color: isDark ? '#FCA5A5' : '#B91C1C',
    };
  }
  return {
    label: MARKED_COPY.syncedBadge,
    bg: isDark ? '#14532d' : '#DCFCE7',
    color: isDark ? '#86EFAC' : '#166534',
  };
};

export const LatecomerMarkRow = ({ mark, colors, isDark, onPress }) => {
  const status = statusMeta(mark.syncStatus, isDark);
  return (
    <TouchableOpacity
      disabled={!onPress}
      onPress={() => onPress?.(mark)}
      activeOpacity={0.82}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={onPress ? `Open latecomer record ${mark.studentId}` : undefined}
      style={[
        styles.row,
        { backgroundColor: isDark ? '#1e293b' : colors.card, borderColor: colors.border },
        onPress && styles.rowPressable,
      ]}
    >
      <View style={[styles.avatar, { backgroundColor: isDark ? '#334155' : '#EFF6FF' }]}>
        <Text style={[styles.avatarText, { color: isDark ? '#93C5FD' : '#2563EB' }]}>
          {initialsFromMark(mark)}
        </Text>
      </View>
      <View style={styles.rowBody}>
        <Text style={[styles.rowName, { color: colors.text }]} numberOfLines={1}>
          {mark.studentName || mark.studentId}
          {mark.type === 'indiscipline' && (
            <Text style={{ color: '#EF4444', fontSize: 11, fontWeight: '700' }}>
              {' '}
              + IN-DISCIPLINE
            </Text>
          )}
        </Text>
        <Text style={[styles.rowMeta, { color: colors.textMuted }]} numberOfLines={1}>
          {mark.studentId}
          {mark.dept ? ` • ${mark.dept}` : ''}
        </Text>
        <Text style={[styles.rowWhen, { color: colors.textMuted }]}>
          {formatMarkWhen(mark.markedAt)}
        </Text>
        {mark.description ? (
          <Text style={[styles.rowMeta, { color: isDark ? '#94A3B8' : '#64748B', marginTop: 4 }]} numberOfLines={2}>
            {mark.description}
          </Text>
        ) : null}
      </View>
      <View style={[styles.badge, { backgroundColor: status.bg }]}>
        <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    gap: 10,
  },
  rowPressable: {
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 14, fontWeight: '800' },
  rowBody: { flex: 1, minWidth: 0 },
  rowName: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  rowMeta: { fontSize: 12, fontWeight: '600' },
  rowWhen: { fontSize: 11, fontWeight: '500', marginTop: 4 },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.3 },
});
