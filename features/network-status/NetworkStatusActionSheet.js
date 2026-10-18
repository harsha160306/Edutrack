import React, { useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Platform,
  Animated,
  ActivityIndicator,
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
import { IOSSwitch } from '../../components/IOSSwitch';
import { MinuteStepper } from '../../components/MinuteStepper';
import { getAppleSystemBlue } from '../../components/apple_material';
import { AUTO_SYNC_INTERVAL_OPTIONS } from './autoSyncPreferences';
import { NETWORK_STATUS, NETWORK_STATUS_THEME, NETWORK_STATUS_PILL } from './constants';
import { getNetworkStatusIcon } from './statusIcon';
import { formatSyncedDateTime } from './formatSyncedDateTime';

const connectionLabel = (kind) => {
  if (kind === 'wifi') return 'Wi‑Fi';
  if (kind === 'cellular') return 'Mobile data';
  if (kind === 'other') return 'Other connection';
  return 'No connection';
};

export const NetworkStatusActionSheet = ({
  visible,
  isDark,
  networkStatus,
  connectionKind,
  lastSyncedAtIso,
  isFaculty,
  pendingCount = 0,
  isOffline,
  onSyncNow,
  onScanOffline,
  onClose,
  autoSyncEnabled = true,
  onAutoSyncChange,
  autoSyncIntervalMinutes = 5,
  onAutoSyncIntervalChange,
}) => {
  const insets = useSafeAreaInsets();
  const { modalMounted, backdropOpacity, sheetTranslateY, requestDismiss } =
    useBottomSheetMotion(visible, onClose);

  const [syncing, setSyncing] = useState(false);

  const { sheetBg, groupBg, titleColor, subtitleColor, divider, handleColor } =
    getBottomSheetColors(isDark);
  const actionBlue = getAppleSystemBlue(isDark);
  const backdropTint = isDark ? 'rgba(0, 0, 0, 0.55)' : 'rgba(0, 0, 0, 0.4)';
  const bottomPad = getBottomSheetSafePadding(insets.bottom);

  const networkTheme =
    NETWORK_STATUS_THEME[networkStatus] ?? NETWORK_STATUS_THEME.network;
  const NetworkIcon = getNetworkStatusIcon(networkStatus, connectionKind);
  const pillSurface =
    NETWORK_STATUS_PILL[networkStatus] ?? NETWORK_STATUS_PILL[NETWORK_STATUS.ONLINE];
  const statusAccent = isDark
    ? ({
        [NETWORK_STATUS.ONLINE]: '#6EE7B7',
        [NETWORK_STATUS.NETWORK]: '#FCD34D',
        [NETWORK_STATUS.OFFLINE]: '#FCA5A5',
      }[networkStatus] ?? networkTheme.color)
    : networkTheme.color;
  const statusPillStyle = isDark ? pillSurface.dark : pillSurface.light;

  const primaryLabel = isOffline ? 'Retry when online' : 'Sync now';

  const secondaryActions = useMemo(() => {
    const items = [];
    if (isFaculty && pendingCount > 0 && !isOffline) {
      items.push({
        key: 'pending',
        label: 'Sync pending marks',
        onPress: async () => {
          setSyncing(true);
          try {
            await onSyncNow?.();
            onClose?.();
          } finally {
            setSyncing(false);
          }
        },
      });
    }
    if (isFaculty && isOffline) {
      items.push({
        key: 'offline',
        label: 'Mark latecomer offline',
        onPress: () => {
          onScanOffline?.();
          onClose?.();
        },
      });
    }
    return items;
  }, [isFaculty, pendingCount, isOffline, onSyncNow, onScanOffline, onClose]);

  const handlePrimarySync = async () => {
    if (syncing) return;
    setSyncing(true);
    try {
      await onSyncNow?.();
      onClose?.();
    } finally {
      setSyncing(false);
    }
  };

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
            title="Sync"
            titleColor={titleColor}
            onDone={requestDismiss}
          />

          <View style={bottomSheetSurfaceStyles.body}>
            <View style={[bottomSheetSurfaceStyles.contentGroup, { backgroundColor: groupBg }]}>
              <View style={styles.statusSection}>
                <View
                  style={[
                    styles.statusPill,
                    {
                      backgroundColor: statusPillStyle.backgroundColor,
                      borderColor: statusPillStyle.borderColor,
                    },
                  ]}
                >
                  <NetworkIcon size={20} color={statusAccent} strokeWidth={2.4} />
                  <Text style={[styles.statusLabel, { color: statusAccent }]}>
                    {networkTheme.label}
                  </Text>
                </View>
                <Text style={[styles.metaText, { color: subtitleColor }]}>
                  Source: {connectionLabel(connectionKind)}
                </Text>
                <Text style={[styles.metaText, { color: subtitleColor }]}>
                  {lastSyncedAtIso
                    ? `Last synced on ${formatSyncedDateTime(lastSyncedAtIso)}`
                    : 'Not synced yet'}
                </Text>
              </View>

              <View style={[styles.rule, { backgroundColor: divider }]} />

              <View style={styles.settingsBlock}>
                <View style={styles.autoSyncRow}>
                  <Text style={[styles.autoSyncLabel, { color: titleColor }]}>Enable auto sync</Text>
                  <View style={styles.autoSyncRight}>
                    <Text style={[styles.autoSyncState, { color: subtitleColor }]}>
                      {autoSyncEnabled ? 'On' : 'Off'}
                    </Text>
                    <IOSSwitch
                      value={autoSyncEnabled}
                      onValueChange={onAutoSyncChange}
                      isDark={isDark}
                      accessibilityLabel="Enable auto sync"
                    />
                  </View>
                </View>
                {autoSyncEnabled ? (
                  <>
                    <View style={[styles.rule, { backgroundColor: divider }]} />
                    <MinuteStepper
                      label="Sync every"
                      value={autoSyncIntervalMinutes}
                      options={AUTO_SYNC_INTERVAL_OPTIONS}
                      onChange={onAutoSyncIntervalChange}
                      isDark={isDark}
                      unitLabel="min"
                    />
                  </>
                ) : null}
              </View>
            </View>

            <View style={bottomSheetSurfaceStyles.sheetFooter}>
              {secondaryActions.map((action) => (
                <TouchableOpacity
                  key={action.key}
                  style={[styles.secondaryBtn, { borderColor: divider }]}
                  onPress={action.onPress}
                  activeOpacity={0.85}
                  disabled={syncing}
                  accessibilityRole="button"
                >
                  <Text style={[styles.secondaryBtnText, { color: actionBlue }]}>{action.label}</Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: actionBlue }, syncing && styles.btnDisabled]}
                onPress={handlePrimarySync}
                activeOpacity={0.88}
                disabled={syncing}
                accessibilityRole="button"
                accessibilityLabel={primaryLabel}
              >
                {syncing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryBtnText}>{primaryLabel}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  statusSection: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusLabel: {
    fontSize: 17,
    fontWeight: '700',
    textTransform: 'lowercase',
    letterSpacing: -0.2,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '400',
    textAlign: 'center',
    letterSpacing: -0.08,
  },
  rule: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
  },
  settingsBlock: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  autoSyncRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
    paddingTop: 4,
  },
  autoSyncLabel: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  autoSyncRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  autoSyncState: {
    fontSize: 15,
    fontWeight: '600',
    minWidth: 28,
    textAlign: 'right',
  },
  secondaryBtn: {
    minHeight: 50,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  secondaryBtnText: {
    fontSize: 17,
    fontWeight: '600',
  },
  primaryBtn: {
    minHeight: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: { opacity: 0.65 },
  primaryBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
});
