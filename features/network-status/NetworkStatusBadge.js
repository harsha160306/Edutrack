import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useNetworkStatus } from './useNetworkStatus';
import { NETWORK_STATUS, NETWORK_STATUS_THEME, NETWORK_STATUS_PILL } from './constants';
import { getNetworkStatusIcon } from './statusIcon';

const DARK_ACCENT = {
  [NETWORK_STATUS.ONLINE]: '#4ADE80',
  [NETWORK_STATUS.NETWORK]: '#FBBF24',
  [NETWORK_STATUS.OFFLINE]: '#F87171',
};

/**
 * Rounded pill: connection-type icon + online | network unstable | offline.
 */
export const NetworkStatusBadge = ({ colors, style, isDark = false }) => {
  const { status, connectionKind } = useNetworkStatus();
  const theme = NETWORK_STATUS_THEME[status] ?? NETWORK_STATUS_THEME[NETWORK_STATUS.NETWORK];
  const pillSurface =
    NETWORK_STATUS_PILL[status] ?? NETWORK_STATUS_PILL[NETWORK_STATUS.ONLINE];
  const Icon = getNetworkStatusIcon(status, connectionKind);
  const holderBg = colors?.cardAlt ?? 'rgba(255, 255, 255, 0.06)';
  const holderBorder = colors?.border ?? 'rgba(148, 163, 184, 0.25)';
  const accentColor = isDark ? (DARK_ACCENT[status] ?? theme.color) : theme.color;
  const surfaceStyle = isDark
    ? { backgroundColor: pillSurface.dark.backgroundColor, borderColor: pillSurface.dark.borderColor }
    : { backgroundColor: holderBg, borderColor: holderBorder };

  return (
    <View
      style={[styles.holder, surfaceStyle, style]}
      accessibilityRole="text"
      accessibilityLabel={`Network ${theme.label}, ${connectionKind}`}
    >
      <Icon size={15} color={accentColor} strokeWidth={2.4} />
      <Text
        style={[styles.label, { color: accentColor }]}
        numberOfLines={1}
        {...(Platform.OS === 'android' ? { includeFontPadding: false } : {})}
      >
        {theme.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  holder: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    gap: 6,
    maxWidth: '100%',
  },
  label: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    textTransform: 'lowercase',
    letterSpacing: 0.2,
    flexShrink: 1,
  },
});
