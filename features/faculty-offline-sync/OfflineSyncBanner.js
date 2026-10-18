import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CloudOff, CloudUpload } from 'lucide-react-native';
import { OFFLINE_COPY } from './constants';

export const OfflineSyncBanner = ({
  colors,
  isDark,
  isOffline,
  pendingCount,
  isSyncing,
  canSync,
  onSyncPress,
}) => {
  if (!isOffline && pendingCount === 0) {
    return null;
  }

  const showSyncButton = canSync && pendingCount > 0;

  return (
    <View
      style={[
        styles.banner,
        {
          backgroundColor: isOffline
            ? isDark
              ? '#422006'
              : '#fffbeb'
            : isDark
              ? '#0c4a6e'
              : '#ecfeff',
          borderColor: isOffline
            ? isDark
              ? '#b45309'
              : '#fcd34d'
            : isDark
              ? '#0369a1'
              : '#67e8f9',
        },
      ]}
    >
      {isOffline ? (
        <CloudOff size={18} color={isOffline ? '#f59e0b' : colors.secondary} strokeWidth={2.2} />
      ) : (
        <CloudUpload size={18} color={colors.secondary} strokeWidth={2.2} />
      )}
      <Text style={[styles.message, { color: colors.text, flex: 1 }]}>
        {isOffline
          ? OFFLINE_COPY.bannerOffline
          : OFFLINE_COPY.bannerPending(pendingCount)}
      </Text>
      {showSyncButton ? (
        <TouchableOpacity
          style={[styles.syncBtn, { backgroundColor: colors.secondary }]}
          onPress={onSyncPress}
          disabled={isSyncing}
          activeOpacity={0.85}
        >
          {isSyncing ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.syncBtnText}>Sync</Text>
          )}
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  message: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
  syncBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 56,
    alignItems: 'center',
  },
  syncBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
});
