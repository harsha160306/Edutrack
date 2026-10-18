import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

const SIZES = {
  sm: { box: 40, radius: 12, font: 18, dot: 12, dotInset: 2 },
  md: { box: 44, radius: 13, font: 19, dot: 12, dotInset: 1 },
  lg: { box: 56, radius: 16, font: 24, dot: 14, dotInset: 1 },
};

/**
 * Letter-based profile avatar with optional online indicator.
 */
export const ProfileAvatar = ({
  initial = '?',
  size = 'sm',
  showOnlineDot = false,
  onlineDotBorderColor = '#ffffff',
  headerDarkBorder = false,
  style,
}) => {
  const dim = SIZES[size] ?? SIZES.sm;
  const letter = String(initial || '?').slice(0, 1).toUpperCase();

  return (
    <View
      style={[styles.wrap, { width: dim.box, height: dim.box }, style]}
      accessibilityLabel={`Profile ${letter}`}
    >
      <View
        style={[
          styles.box,
          {
            width: dim.box,
            height: dim.box,
            borderRadius: dim.radius,
          },
          headerDarkBorder && styles.boxHeaderDark,
        ]}
      >
        <Text
          style={[
            styles.initial,
            {
              fontSize: dim.font,
              lineHeight: Math.round(dim.font * 1.2),
            },
          ]}
        >
          {letter}
        </Text>
        {showOnlineDot ? (
          <View
            style={[
              styles.dot,
              {
                width: dim.dot,
                height: dim.dot,
                borderRadius: dim.dot / 2,
                bottom: -dim.dotInset,
                right: -dim.dotInset,
                borderColor: onlineDotBorderColor,
              },
            ]}
          />
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    overflow: 'visible',
    flexShrink: 0,
  },
  box: {
    backgroundColor: '#E5A653',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'visible',
  },
  boxHeaderDark: {
    borderWidth: 1.5,
    borderColor: 'rgba(15, 23, 42, 0.28)',
  },
  initial: {
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
    ...Platform.select({
      android: { includeFontPadding: false },
      web: { userSelect: 'none' },
      default: {},
    }),
  },
  dot: {
    position: 'absolute',
    backgroundColor: '#4ADE80',
    borderWidth: 2,
  },
});
