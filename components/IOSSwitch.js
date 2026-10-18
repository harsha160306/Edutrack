import React, { useEffect, useRef } from 'react';
import { Pressable, Animated, StyleSheet, Platform } from 'react-native';

const TRACK_WIDTH = 51;
const TRACK_HEIGHT = 31;
const THUMB_SIZE = 27;
const INSET = 2;

const TRACK_OFF = '#787880';
const TRACK_ON = '#34C759';
const TRACK_OFF_DARK = '#39393D';
const TRACK_ON_DARK = '#30D158';

/**
 * iOS-style pill switch (consistent on web + native).
 */
export const IOSSwitch = ({
  value = false,
  onValueChange,
  disabled = false,
  isDark = false,
  accessibilityLabel,
}) => {
  const progress = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(progress, {
      toValue: value ? 1 : 0,
      friction: 7,
      tension: 140,
      useNativeDriver: false,
    }).start();
  }, [value, progress]);

  const thumbLeft = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [INSET, TRACK_WIDTH - THUMB_SIZE - INSET],
  });

  const trackColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: isDark ? [TRACK_OFF_DARK, TRACK_ON_DARK] : [TRACK_OFF, TRACK_ON],
  });

  const handlePress = () => {
    if (!disabled) onValueChange?.(!value);
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
    >
      <Animated.View
        style={[
          styles.track,
          { backgroundColor: trackColor, opacity: disabled ? 0.45 : 1 },
        ]}
      >
        <Animated.View style={[styles.thumb, { left: thumbLeft }]} />
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    justifyContent: 'center',
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: '#ffffff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.22,
        shadowRadius: 2.5,
      },
      android: {
        elevation: 3,
      },
      default: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.28)',
      },
    }),
  },
});
