import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { hexToRgba } from './apple_material';

const tilePalette = (tone, bg, isDark) => {
  if (isDark) {
    return {
      ring: bg,
      ringBorder: hexToRgba(tone, 0.38),
      disc: hexToRgba(tone, 0.22),
      discBorder: hexToRgba(tone, 0.45),
      icon: '#FFFFFF',
    };
  }
  return {
    ring: bg,
    ringBorder: hexToRgba(tone, 0.14),
    disc: '#FFFFFF',
    discBorder: hexToRgba(tone, 0.1),
    icon: tone,
  };
};

/**
 * Quick-action tile — tinted ring + elevated inner disc (readable, not glossy 3D).
 */
export const QuickAction3DIcon = ({ Icon, tone, bg, isDark = false, size = 60, marginBottom = 10 }) => {
  const palette = tilePalette(tone, bg, isDark);
  const discSize = Math.round(size * 0.76);
  const iconSize = Math.round(discSize * 0.46);

  return (
    <View
      style={[
        styles.ring,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          marginBottom,
          backgroundColor: palette.ring,
          borderColor: palette.ringBorder,
        },
        isDark ? styles.shadowDark : styles.shadowLight,
      ]}
    >
      <View
        style={[
          styles.disc,
          {
            width: discSize,
            height: discSize,
            borderRadius: discSize / 2,
            backgroundColor: palette.disc,
            borderColor: palette.discBorder,
          },
        ]}
      >
        <Icon color={palette.icon} size={iconSize} strokeWidth={2.35} fill={hexToRgba(tone, isDark ? 0.15 : 0.08)} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  ring: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  disc: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
      default: {},
    }),
  },
  shadowLight: Platform.select({
    ios: {
      shadowColor: '#64748b',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
    },
    android: { elevation: 4 },
    web: {
      boxShadow: '0 6px 16px rgba(15, 23, 42, 0.08)',
    },
    default: {},
  }),
  shadowDark: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 8,
    },
    android: { elevation: 5 },
    web: {
      boxShadow: '0 6px 16px rgba(0, 0, 0, 0.32)',
    },
    default: {},
  }),
});
