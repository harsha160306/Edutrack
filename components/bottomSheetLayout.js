import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const BOTTOM_SHEET_BG = {
  light: '#f2f2f7',
  dark: '#1c1c1e',
};

export const BOTTOM_SHEET_GROUP_BG = {
  light: '#ffffff',
  dark: '#2c2c2e',
};

export const BOTTOM_SHEET_DONE_BLUE = '#007AFF';

/** Home-indicator / gesture bar inset only — not tab bar height. */
export const getBottomSheetSafePadding = (bottomInset = 0) =>
  Math.max(
    bottomInset,
    Platform.OS === 'ios' ? 8 : 12,
    Platform.OS === 'web' && bottomInset < 1 ? 12 : 0,
  );

export const getBottomSheetColors = (isDark) => ({
  sheetBg: isDark ? BOTTOM_SHEET_BG.dark : BOTTOM_SHEET_BG.light,
  groupBg: isDark ? BOTTOM_SHEET_GROUP_BG.dark : BOTTOM_SHEET_GROUP_BG.light,
  titleColor: isDark ? '#ffffff' : '#000000',
  subtitleColor: isDark ? 'rgba(235, 235, 245, 0.6)' : 'rgba(60, 60, 67, 0.6)',
  divider: isDark ? 'rgba(84, 84, 88, 0.65)' : 'rgba(60, 60, 67, 0.18)',
  handleColor: isDark ? 'rgba(255, 255, 255, 0.28)' : 'rgba(0, 0, 0, 0.18)',
});

export const bottomSheetOverlayStyles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    width: '100%',
    ...Platform.select({
      web: {
        height: '100vh',
        minHeight: '100vh',
      },
      default: {},
    }),
  },
  host: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    ...Platform.select({
      web: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        height: '100%',
        minHeight: '100vh',
      },
      default: {},
    }),
  },
  web: {
    zIndex: 10000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
});

/** Full-width bottom sheet surface (matches NotificationsSheet). */
export const bottomSheetSurfaceStyles = StyleSheet.create({
  sheet: {
    width: '100%',
    alignSelf: 'stretch',
    maxHeight: '85%',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.22,
        shadowRadius: 24,
      },
      android: { elevation: 16 },
      web: {
        boxShadow: '0 -12px 40px rgba(0, 0, 0, 0.22)',
      },
      default: {},
    }),
  },
  grabHandle: {
    width: 36,
    height: 5,
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 10,
  },
  sheetTitle: {
    flex: 1,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 0.36,
  },
  doneBtn: {
    paddingVertical: 6,
    paddingLeft: 12,
  },
  doneText: {
    fontSize: 17,
    fontWeight: '600',
    color: BOTTOM_SHEET_DONE_BLUE,
    letterSpacing: -0.41,
  },
  body: {
    paddingBottom: 8,
  },
  contentGroup: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sheetFooter: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 8,
  },
});

export const BottomSheetHeader = ({ title, titleColor, onDone, doneLabel = 'Done' }) => (
  <View style={bottomSheetSurfaceStyles.sheetHeader}>
    <Text style={[bottomSheetSurfaceStyles.sheetTitle, { color: titleColor }]} numberOfLines={1}>
      {title}
    </Text>
    <TouchableOpacity
      onPress={onDone}
      style={bottomSheetSurfaceStyles.doneBtn}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel={doneLabel}
    >
      <Text style={bottomSheetSurfaceStyles.doneText}>{doneLabel}</Text>
    </TouchableOpacity>
  </View>
);
