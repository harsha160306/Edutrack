import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, Pressable, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { Delete, Fingerprint, ScanFace } from 'lucide-react-native';
import { BIOMETRIC_KIND } from '../biometricAuth';
import { getMpinUi } from '../mpinTheme';

const COLS = 3;
const KEY_GAP = 14;
const MAX_GRID_WIDTH = 312;
const HORIZONTAL_INSET = 48;

function useKeypadLayout() {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  return useMemo(() => {
    const shortestSide = Math.min(windowWidth, windowHeight);
    const isUltraCompact = windowHeight <= 760 || shortestSide <= 350;
    const isTinyScreen = windowHeight <= 820 || windowWidth <= 380;
    const isCompactHeight = windowHeight <= 920 || windowWidth <= 410;
    const compactMaxWidth = isUltraCompact ? 236 : isTinyScreen ? 248 : 274;
    const gap = isUltraCompact ? 6 : isTinyScreen ? 7 : isCompactHeight ? 9 : KEY_GAP;
    const maxGridWidth = isCompactHeight ? compactMaxWidth : MAX_GRID_WIDTH;
    const available = Math.min(windowWidth - HORIZONTAL_INSET, maxGridWidth);
    const keySize = Math.floor((available - gap * (COLS - 1)) / COLS);
    const gridWidth = keySize * COLS + gap * (COLS - 1);
    const digitFontSize = Math.max(20, Math.min(27, Math.round(keySize * 0.3)));
    const iconSize = Math.max(17, Math.min(24, Math.round(keySize * 0.23)));
    const keyRadius = isUltraCompact ? 13 : isTinyScreen ? 14 : 16;
    return { keySize, gridWidth, gap, digitFontSize, iconSize, keyRadius };
  }, [windowWidth, windowHeight]);
}

function buildRows(showBiometric) {
  return [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    [showBiometric ? 'biometric' : null, '0', 'back'],
  ];
}

const BiometricKey = ({
  keySize,
  keyRadius,
  ui,
  colors,
  isDark,
  disabled,
  biometricEnabled,
  biometricAvailable,
  biometricKind,
  onPress,
}) => {
  const isActive = biometricAvailable && biometricEnabled && !disabled;
  const isVisibleDisabled = !isActive;
  const Icon = biometricKind === BIOMETRIC_KIND.FACIAL ? ScanFace : Fingerprint;
  const iconSize = Math.max(20, Math.min(26, Math.round(keySize * 0.26)));
  const iconColor = isActive ? colors.secondary : isDark ? '#64748b' : '#94a3b8';

  return (
    <TouchableOpacity
      style={[
        styles.key,
        styles.biometricKey,
        {
          width: keySize,
          height: keySize,
          borderRadius: keyRadius,
          backgroundColor: isActive ? `${colors.secondary}18` : ui.keyBg,
          borderColor: isActive ? colors.secondary : ui.keyBorder,
          borderWidth: isActive ? 2 : 1.5,
        },
        disabled && styles.keyDisabled,
        !biometricAvailable && styles.biometricUnavailable,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.55}
      accessibilityRole="button"
      accessibilityLabel={
        isActive
          ? 'Unlock with biometrics, enabled'
          : biometricAvailable
            ? 'Biometric unlock disabled'
            : 'Biometrics unavailable'
      }
      accessibilityState={{ disabled: !biometricAvailable || disabled }}
    >
      <Icon color={iconColor} size={iconSize} strokeWidth={2.2} style={isVisibleDisabled ? styles.iconMuted : undefined} />
      {isVisibleDisabled ? (
        <View
          style={[
            styles.disabledSlash,
            { backgroundColor: isDark ? '#94a3b8' : '#64748b' },
          ]}
          pointerEvents="none"
        />
      ) : null}
      {isActive ? (
        <View style={[styles.enabledDot, { backgroundColor: colors.success }]} pointerEvents="none" />
      ) : null}
    </TouchableOpacity>
  );
};

export const MpinKeypad = ({
  onDigit,
  onBackspace,
  onBiometricPress,
  colors,
  isDark = true,
  disabled = false,
  showBiometric = false,
  biometricEnabled = false,
  biometricAvailable = false,
  biometricKind = BIOMETRIC_KIND.FINGERPRINT,
}) => {
  const ui = getMpinUi(colors, isDark);
  const { keySize, gridWidth, gap, digitFontSize, iconSize, keyRadius } = useKeypadLayout();
  const rows = useMemo(() => buildRows(showBiometric), [showBiometric]);

  const renderKey = (key) => {
    if (key === null) {
      return <View key="spacer" style={{ width: keySize, height: keySize }} />;
    }

    if (key === 'biometric') {
      return (
        <BiometricKey
          key="biometric"
          keySize={keySize}
          keyRadius={keyRadius}
          ui={ui}
          colors={colors}
          isDark={isDark}
          disabled={disabled}
          biometricEnabled={biometricEnabled}
          biometricAvailable={biometricAvailable}
          biometricKind={biometricKind}
          onPress={() => {
            if (disabled) return;
            onBiometricPress?.();
          }}
        />
      );
    }

    const isBack = key === 'back';

    return (
      <Pressable
        key={key}
        style={({ pressed }) => [
          styles.key,
          {
            width: keySize,
            height: keySize,
            borderRadius: keyRadius,
            backgroundColor: ui.keyBg,
            borderColor: ui.keyBorder,
          },
          disabled && styles.keyDisabled,
          pressed && !disabled && styles.keyPressed,
          Platform.OS === 'web' && styles.keyWeb,
        ]}
        onPress={() => {
          if (disabled) return;
          if (isBack) onBackspace();
          else onDigit(key);
        }}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={isBack ? 'Delete' : `Digit ${key}`}
      >
        {isBack ? (
          <Delete color={colors.text} size={iconSize} strokeWidth={2.2} />
        ) : (
          <Text style={[styles.keyText, { color: colors.text, fontSize: digitFontSize }]}>{key}</Text>
        )}
      </Pressable>
    );
  };

  return (
    <View style={[styles.wrapper, { width: gridWidth }]}>
      {rows.map((row, rowIndex) => (
        <View
          key={`row-${rowIndex}`}
          style={[
            styles.row,
            { gap, marginBottom: rowIndex < rows.length - 1 ? gap : 0 },
          ]}
        >
          {row.map((cellKey, cellIndex) => (
            <React.Fragment key={`${rowIndex}-${cellIndex}`}>
              {renderKey(cellKey)}
            </React.Fragment>
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  key: {
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: { elevation: 1 },
      default: {},
    }),
  },
  biometricKey: {
    overflow: 'hidden',
  },
  biometricUnavailable: {
    opacity: 0.55,
  },
  keyDisabled: {
    opacity: 0.45,
  },
  keyPressed: {
    opacity: 0.55,
  },
  keyWeb: {
    cursor: 'pointer',
  },
  keyText: {
    fontSize: 28,
    fontWeight: '600',
  },
  iconMuted: {
    opacity: 0.45,
  },
  disabledSlash: {
    position: 'absolute',
    width: 34,
    height: 2,
    borderRadius: 1,
    transform: [{ rotate: '-42deg' }],
  },
  enabledDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
});
