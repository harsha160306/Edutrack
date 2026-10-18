import React, { useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';

const OVERLAY_BLUR = Platform.select({ ios: 28, android: 24, default: 26 });
const COMPACT_WIDTH = 380;

const DESTRUCTIVE = '#EF4444';

function getButtonChrome(btn, colors, isDark) {
  const style = btn.style ?? 'default';

  if (style === 'destructive') {
    return {
      container: { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.22)' : '#FEE2E2' },
      label: { color: isDark ? '#FCA5A5' : DESTRUCTIVE, fontWeight: '700' },
    };
  }

  if (style === 'cancel') {
    return {
      container: {
        backgroundColor: isDark ? 'rgba(148, 163, 184, 0.16)' : '#F1F5F9',
      },
      label: { color: isDark ? '#E2E8F0' : '#334155', fontWeight: '600' },
    };
  }

  return {
    container: { backgroundColor: colors.secondary },
    label: { color: '#FFFFFF', fontWeight: '700' },
  };
}

/**
 * Centered alert card with pill action buttons (replaces legacy iOS split-row alerts).
 */
export const AppleAlertModal = ({
  visible,
  title,
  message,
  colors,
  isDark = true,
  buttons,
  onRequestClose,
  dismissOnBackdrop = true,
  icon = null,
  blurBackground = true,
  maxWidth = 340,
  titleTrailing = null,
  messageColor,
}) => {
  const { width: windowWidth } = useWindowDimensions();
  const isCompact = windowWidth < COMPACT_WIDTH;

  const layout = useMemo(() => {
    const overlayPad = isCompact ? 16 : 28;
    const cardMaxWidth = Math.min(maxWidth, windowWidth - overlayPad * 2);
    const stackActions =
      buttons.length !== 2 || isCompact || buttons.some((b) => (b.label?.length ?? 0) > 14);

    return {
      overlayPad,
      cardMaxWidth,
      stackActions,
      bodyPadH: isCompact ? 18 : 24,
      bodyPadTop: isCompact ? 20 : 26,
      titleSize: isCompact ? 18 : 20,
      messageSize: isCompact ? 14 : 15,
      messageLine: isCompact ? 20 : 22,
      actionPadH: isCompact ? 16 : 20,
      actionPadBottom: isCompact ? 16 : 20,
      actionGap: isCompact ? 8 : 10,
      actionMinH: isCompact ? 44 : 48,
      labelSize: isCompact ? 15 : 16,
      borderRadius: isCompact ? 18 : 22,
    };
  }, [buttons, isCompact, maxWidth, windowWidth]);

  const cardBg = isDark ? '#1E293B' : '#FFFFFF';
  const cardBorder = isDark ? 'rgba(148, 163, 184, 0.2)' : 'rgba(226, 232, 240, 0.9)';
  const bodyMessageColor = messageColor ?? colors.textMuted;

  const overlay = (
    <View
      style={[
        styles.overlay,
        { paddingHorizontal: layout.overlayPad },
        blurBackground
          ? isDark
            ? styles.overlayDark
            : styles.overlayLight
          : styles.overlayClear,
      ]}
    >
      {blurBackground && Platform.OS === 'ios' ? (
        <BlurView
          intensity={OVERLAY_BLUR}
          tint={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      {blurBackground ? (
        <View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, isDark ? styles.scrimDark : styles.scrimLight]}
        />
      ) : null}
      <View
        style={[
          styles.card,
          {
            maxWidth: layout.cardMaxWidth,
            borderRadius: layout.borderRadius,
            backgroundColor: cardBg,
            borderColor: cardBorder,
          },
        ]}
        onStartShouldSetResponder={() => true}
      >
        <View
          style={[
            styles.body,
            {
              paddingTop: layout.bodyPadTop,
              paddingHorizontal: layout.bodyPadH,
            },
          ]}
        >
          {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
          {title ? (
            titleTrailing ? (
              <View style={styles.titleRow}>
                <Text
                  style={[
                    styles.title,
                    styles.titleInline,
                    { color: colors.text, fontSize: layout.titleSize },
                  ]}
                >
                  {title}
                </Text>
                {titleTrailing}
              </View>
            ) : (
              <Text
                style={[styles.title, { color: colors.text, fontSize: layout.titleSize }]}
              >
                {title}
              </Text>
            )
          ) : null}
          {message ? (
            <Text
              style={[
                styles.message,
                {
                  color: bodyMessageColor,
                  fontSize: layout.messageSize,
                  lineHeight: layout.messageLine,
                },
              ]}
            >
              {message}
            </Text>
          ) : null}
        </View>

        <View
          style={[
            styles.actions,
            layout.stackActions && styles.actionsStacked,
            {
              gap: layout.actionGap,
              paddingHorizontal: layout.actionPadH,
              paddingBottom: layout.actionPadBottom,
            },
          ]}
        >
          {buttons.map((btn) => {
            const chrome = getButtonChrome(btn, colors, isDark);
            return (
              <TouchableOpacity
                key={btn.label}
                style={[
                  styles.actionPill,
                  layout.stackActions && styles.actionPillStacked,
                  {
                    minHeight: layout.actionMinH,
                    paddingVertical: isCompact ? 11 : 13,
                  },
                  chrome.container,
                ]}
                onPress={btn.onPress}
                activeOpacity={0.82}
              >
                <Text
                  style={[
                    styles.actionLabel,
                    chrome.label,
                    { fontSize: layout.labelSize },
                  ]}
                  numberOfLines={2}
                  adjustsFontSizeToFit={!layout.stackActions}
                  minimumFontScale={0.88}
                >
                  {btn.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onRequestClose ?? buttons[0]?.onPress}
      statusBarTranslucent
    >
      {dismissOnBackdrop && onRequestClose ? (
        <TouchableWithoutFeedback onPress={onRequestClose}>{overlay}</TouchableWithoutFeedback>
      ) : (
        overlay
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayClear: {
    backgroundColor: 'transparent',
  },
  overlayDark: {
    ...Platform.select({
      web: {
        backgroundColor: 'rgba(0, 0, 0, 0.42)',
        backdropFilter: 'blur(14px) saturate(110%)',
        WebkitBackdropFilter: 'blur(14px) saturate(110%)',
      },
      default: {
        backgroundColor: 'rgba(0, 0, 0, 0.35)',
      },
    }),
  },
  overlayLight: {
    ...Platform.select({
      web: {
        backgroundColor: 'rgba(15, 23, 42, 0.28)',
        backdropFilter: 'blur(14px) saturate(110%)',
        WebkitBackdropFilter: 'blur(14px) saturate(110%)',
      },
      default: {
        backgroundColor: 'rgba(15, 23, 42, 0.22)',
      },
    }),
  },
  scrimDark: {
    backgroundColor: 'rgba(0, 0, 0, 0.48)',
  },
  scrimLight: {
    backgroundColor: 'rgba(15, 23, 42, 0.32)',
  },
  card: {
    width: '100%',
    borderWidth: 1,
    overflow: 'hidden',
    zIndex: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.22,
        shadowRadius: 32,
      },
      web: {
        boxShadow: '0 20px 56px rgba(0, 0, 0, 0.28)',
      },
      android: {
        elevation: 12,
      },
      default: {},
    }),
  },
  body: {
    paddingBottom: 8,
    alignItems: 'center',
  },
  iconWrap: {
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.35,
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  titleInline: {
    marginBottom: 0,
  },
  message: {
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: -0.1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingTop: 16,
  },
  actionsStacked: {
    flexDirection: 'column',
  },
  actionPill: {
    flex: 1,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  actionPillStacked: {
    flex: 0,
    width: '100%',
  },
  actionLabel: {
    letterSpacing: -0.2,
    textAlign: 'center',
  },
});
