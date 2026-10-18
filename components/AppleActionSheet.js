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
import { useBottomSheetMotion } from './bottomSheetMotion';
import { DASHBOARD_DARK_SURFACES, getAppleSystemBlue } from './apple_material';

const IOS_RED = '#FF3B30';

/**
 * iOS-style bottom action sheet: grouped actions + separate Cancel.
 */
export const AppleActionSheet = ({
  visible,
  title,
  message,
  headerContent,
  middleContent,
  actions,
  cancelLabel = 'Cancel',
  onCancel,
  isDark = false,
  bottomOffset = 0,
}) => {
  const insets = useSafeAreaInsets();
  const { modalMounted, backdropOpacity, sheetTranslateY, requestDismiss } =
    useBottomSheetMotion(visible, onCancel);

  const sheetBg = isDark ? DASHBOARD_DARK_SURFACES.sheet : '#ffffff';
  const headerText = isDark ? '#F1F5F9' : '#3c3c43';
  const messageText = isDark ? '#CBD5E1' : '#8e8e93';
  const divider = isDark ? 'rgba(148, 163, 184, 0.32)' : 'rgba(60, 60, 67, 0.18)';
  const actionBlue = getAppleSystemBlue(isDark);
  const bottomPad =
    bottomOffset > 0
      ? bottomOffset
      : Math.max(insets.bottom, Platform.OS === 'ios' ? 8 : 12);

  const labelColor = (style) => {
    if (style === 'destructive') return IOS_RED;
    return actionBlue;
  };

  const backdropTint = isDark ? 'rgba(0, 0, 0, 0.55)' : 'rgba(0, 0, 0, 0.4)';

  return (
    <Modal
      visible={modalMounted}
      transparent
      animationType="none"
      onRequestClose={requestDismiss}
      statusBarTranslucent
    >
      <View style={[styles.overlayHost, Platform.OS === 'web' && styles.overlayWeb]}>
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            styles.backdrop,
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
            styles.footer,
            { paddingBottom: bottomPad, transform: [{ translateY: sheetTranslateY }] },
          ]}
        >
          <View style={[styles.group, { backgroundColor: sheetBg }]}>
            <View style={styles.header}>
              {headerContent ?? (
                <>
                  {title ? (
                    <Text style={[styles.title, { color: headerText }]}>{title}</Text>
                  ) : null}
                  {message ? (
                    <Text style={[styles.message, { color: messageText }]}>{message}</Text>
                  ) : null}
                </>
              )}
            </View>
            {middleContent ? (
              <>
                <View style={[styles.rule, { backgroundColor: divider }]} />
                <View style={styles.middle}>{middleContent}</View>
              </>
            ) : null}
            {actions.map((action) => (
              <React.Fragment key={action.label}>
                <View style={[styles.rule, { backgroundColor: divider }]} />
                <TouchableOpacity
                  style={styles.actionRow}
                  onPress={() => {
                    action.onPress();
                  }}
                  activeOpacity={0.55}
                  accessibilityRole="button"
                >
                  <Text style={[styles.actionLabel, { color: labelColor(action.style) }]}>
                    {action.label}
                  </Text>
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.cancelCard, { backgroundColor: sheetBg }]}
            onPress={requestDismiss}
            activeOpacity={0.55}
            accessibilityRole="button"
            accessibilityLabel={cancelLabel}
          >
            <Text style={[styles.actionLabel, { color: actionBlue }]}>{cancelLabel}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlayHost: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlayWeb: {
    zIndex: 10000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  footer: {
    paddingHorizontal: 10,
    gap: 8,
  },
  group: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  header: {
    paddingTop: 14,
    paddingBottom: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    alignSelf: 'stretch',
    width: '100%',
  },
  middle: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: -0.1,
  },
  message: {
    fontSize: 13,
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  rule: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
  },
  actionRow: {
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  actionLabel: {
    fontSize: 20,
    fontWeight: '400',
    letterSpacing: 0.2,
    ...Platform.select({
      web: { textShadow: 'none' },
      default: {},
    }),
  },
  cancelCard: {
    borderRadius: 14,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
