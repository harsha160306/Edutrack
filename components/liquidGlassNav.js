import React from 'react';
import { View, Platform } from 'react-native';
import { LiquidGlassPanel } from './apple_material';

/**
 * Lazy-load @callstack/liquid-glass — importing it directly crashes in Expo Go /
 * builds without the native module (NativeLiquidGlassModule not registered).
 */
const loadLiquidGlassNative = () => {
  try {
    // eslint-disable-next-line global-require
    const mod = require('@callstack/liquid-glass');
    if (!mod?.isLiquidGlassSupported) {
      return null;
    }
    return {
      LiquidGlassView: mod.LiquidGlassView,
      LiquidGlassContainerView: mod.LiquidGlassContainerView,
    };
  } catch {
    return null;
  }
};

const liquidGlassNative = loadLiquidGlassNative();

export const isLiquidGlassSupported = Boolean(liquidGlassNative);

const FACULTY_TINT = {
  dark: 'rgba(217, 153, 72, 0.14)',
  light: 'rgba(217, 153, 72, 0.08)',
};

/**
 * Groups tab pill + round actions — on iOS 26+ glass merges when elements are close.
 * @see https://www.callstack.com/blog/how-to-use-liquid-glass-in-react-native
 */
export const NavGlassContainer = ({ spacing = 0, style, children }) => {
  const NativeContainer = liquidGlassNative?.LiquidGlassContainerView;

  if (Platform.OS === 'android' || !NativeContainer) {
    return (
      <View style={[style, spacing > 0 && { gap: spacing }]}>
        {children}
      </View>
    );
  }

  return (
    <NativeContainer spacing={spacing} style={style}>
      {children}
    </NativeContainer>
  );
};

/**
 * iOS 26+ native liquid glass, or frosted-glass fallback (BlurView / backdrop-filter).
 */
export const NavGlassView = ({
  isDark,
  variant = 'pill',
  style,
  children,
  interactive = false,
  effect,
}) => {
  const NativeView = liquidGlassNative?.LiquidGlassView;
  const colorScheme = isDark ? 'dark' : 'light';
  const glassEffect = effect ?? (variant === 'pill' ? 'clear' : 'regular');

  if (!NativeView || variant === 'chip') {
    return (
      <LiquidGlassPanel
        isDark={isDark}
        surface={variant === 'chip' ? 'nav-chip' : 'nav'}
        style={style}
      >
        {children}
      </LiquidGlassPanel>
    );
  }

  return (
    <NativeView
      style={style}
      effect={glassEffect}
      colorScheme={colorScheme}
      tintColor={FACULTY_TINT[isDark ? 'dark' : 'light']}
      interactive={interactive}
    >
      {children}
    </NativeView>
  );
};
