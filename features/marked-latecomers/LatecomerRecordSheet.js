import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Platform,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomSheetMotion } from '../../components/bottomSheetMotion';
import {
  BottomSheetHeader,
  bottomSheetOverlayStyles,
  bottomSheetSurfaceStyles,
  getBottomSheetColors,
  getBottomSheetSafePadding,
} from '../../components/bottomSheetLayout';
import { SYNC_STATUS } from '../faculty-offline-sync/constants';
import { MARK_SOURCE } from '../faculty-offline-sync/markSource';
import { MARKED_COPY, RECORD_COPY } from './constants';
import { formatMarkWhen, initialsFromMark } from './LatecomerMarkRow';

const syncStatusLabel = (syncStatus) => {
  if (syncStatus === SYNC_STATUS.PENDING) return MARKED_COPY.pendingBadge;
  if (syncStatus === SYNC_STATUS.FAILED) return MARKED_COPY.failedBadge;
  return MARKED_COPY.syncedBadge;
};

const markSourceLabel = (markSource) => {
  if (markSource === MARK_SOURCE.COMMITTEE) return RECORD_COPY.byCommittee;
  return RECORD_COPY.byYou;
};

const DetailRow = ({ label, value, titleColor, subtitleColor, divider, isLast }) => (
  <>
    <View style={styles.detailRow}>
      <Text style={[styles.detailLabel, { color: subtitleColor }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: titleColor }]} selectable>
        {value}
      </Text>
    </View>
    {!isLast ? <View style={[styles.rule, { backgroundColor: divider }]} /> : null}
  </>
);

export const LatecomerRecordSheet = ({ visible, mark, colors, isDark, onClose }) => {
  const insets = useSafeAreaInsets();
  const { modalMounted, backdropOpacity, sheetTranslateY, requestDismiss } =
    useBottomSheetMotion(visible, onClose);

  const { sheetBg, groupBg, titleColor, subtitleColor, divider, handleColor } =
    getBottomSheetColors(isDark);
  const backdropTint = isDark ? 'rgba(0, 0, 0, 0.55)' : 'rgba(0, 0, 0, 0.4)';
  const bottomPad = getBottomSheetSafePadding(insets.bottom);

  if (!mark && !modalMounted) return null;

  const displayName = mark?.studentName || mark?.studentId || '—';
  const statusLabel = syncStatusLabel(mark?.syncStatus);
  const statusBg = isDark
    ? mark?.syncStatus === SYNC_STATUS.PENDING
      ? '#422006'
      : mark?.syncStatus === SYNC_STATUS.FAILED
        ? '#450a0a'
        : '#14532d'
    : mark?.syncStatus === SYNC_STATUS.PENDING
      ? '#FEF3C7'
      : mark?.syncStatus === SYNC_STATUS.FAILED
        ? '#FEE2E2'
        : '#DCFCE7';
  const statusColor = isDark
    ? mark?.syncStatus === SYNC_STATUS.PENDING
      ? '#FCD34D'
      : mark?.syncStatus === SYNC_STATUS.FAILED
        ? '#FCA5A5'
        : '#86EFAC'
    : mark?.syncStatus === SYNC_STATUS.PENDING
      ? '#B45309'
      : mark?.syncStatus === SYNC_STATUS.FAILED
        ? '#B91C1C'
        : '#166534';

  const syncedLine =
    mark?.syncedAt && mark.syncStatus === SYNC_STATUS.SYNCED
      ? formatMarkWhen(mark.syncedAt)
      : null;

  const rows = [
    ...(mark?.type === 'indiscipline' ? [{ label: 'Type', value: 'In-discipline' }] : []),
    { label: RECORD_COPY.studentId, value: mark?.studentId || '—' },
    { label: RECORD_COPY.department, value: mark?.dept || '—' },
    ...(mark?.description ? [{ label: 'Activity', value: mark.description }] : []),
    { label: RECORD_COPY.markedAt, value: mark?.markedAt ? formatMarkWhen(mark.markedAt) : '—' },
    ...(syncedLine ? [{ label: RECORD_COPY.syncedAt, value: syncedLine }] : []),
    { label: RECORD_COPY.syncStatus, value: statusLabel },
    {
      label: RECORD_COPY.markedBy,
      value: markSourceLabel(mark?.markSource),
    },
  ];

  return (
    <Modal
      visible={modalMounted}
      transparent
      animationType="none"
      onRequestClose={requestDismiss}
      statusBarTranslucent
    >
      <View style={bottomSheetOverlayStyles.modalRoot}>
        <View
          style={[
            bottomSheetOverlayStyles.host,
            Platform.OS === 'web' && bottomSheetOverlayStyles.web,
          ]}
        >
          <Animated.View
            pointerEvents="none"
            style={[
              bottomSheetOverlayStyles.backdrop,
              { backgroundColor: backdropTint, opacity: backdropOpacity },
            ]}
          />
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={requestDismiss}
            accessibilityLabel="Dismiss"
          />

          <Animated.View
            style={[
              bottomSheetSurfaceStyles.sheet,
              {
                backgroundColor: sheetBg,
                paddingBottom: bottomPad,
                transform: [{ translateY: sheetTranslateY }],
              },
            ]}
          >
            <View style={[bottomSheetSurfaceStyles.grabHandle, { backgroundColor: handleColor }]} />

            <BottomSheetHeader
              title={mark?.type === 'indiscipline' ? 'In-discipline record' : RECORD_COPY.sheetTitle}
              titleColor={titleColor}
              onDone={requestDismiss}
            />

            <View style={bottomSheetSurfaceStyles.body}>
              <View style={[bottomSheetSurfaceStyles.contentGroup, { backgroundColor: groupBg }]}>
                <View style={styles.heroRow}>
                  <View
                    style={[
                      styles.avatar,
                      { backgroundColor: isDark ? '#334155' : '#EFF6FF' },
                    ]}
                  >
                    <Text
                      style={[styles.avatarText, { color: isDark ? '#93C5FD' : '#2563EB' }]}
                    >
                      {mark ? initialsFromMark(mark) : '—'}
                    </Text>
                  </View>
                  <View style={styles.heroBody}>
                    <Text style={[styles.heroName, { color: titleColor }]} numberOfLines={2}>
                      {displayName}
                    </Text>
                    <Text style={[styles.heroMeta, { color: subtitleColor }]} numberOfLines={1}>
                      {mark?.studentId}
                      {mark?.dept ? ` · ${mark.dept}` : ''}
                    </Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: statusBg }]}>
                    <Text style={[styles.badgeText, { color: statusColor }]}>{statusLabel}</Text>
                  </View>
                </View>

                <View style={[styles.rule, { backgroundColor: divider }]} />

                {rows.map((row, index) => (
                  <DetailRow
                    key={row.label}
                    label={row.label}
                    value={row.value}
                    titleColor={titleColor}
                    subtitleColor={subtitleColor}
                    divider={divider}
                    isLast={index === rows.length - 1}
                  />
                ))}
              </View>
            </View>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 15, fontWeight: '800' },
  heroBody: { flex: 1, minWidth: 0 },
  heroName: { fontSize: 17, fontWeight: '700', marginBottom: 4 },
  heroMeta: { fontSize: 13, fontWeight: '600' },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },
  rule: { height: StyleSheet.hairlineWidth, marginLeft: 16 },
  detailRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
});
