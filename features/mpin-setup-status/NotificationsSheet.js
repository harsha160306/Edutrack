import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Pressable,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Bell, Shield, Fingerprint, ChevronRight } from 'lucide-react-native';
import { useBottomSheetMotion } from '../../components/bottomSheetMotion';
import { MPIN_SETUP_NOTIFICATION_ID, MPIN_SETUP_REMINDER_COPY } from './constants';

const IOS_BLUE = '#007AFF';
const IOS_LABEL = Platform.select({
  ios: 'Done',
  default: 'Done',
});

/** Modal cannot blur the screen beneath on native; overlay is rendered in-tree on iOS/Android. */
const USE_IN_TREE_OVERLAY = Platform.OS === 'ios' || Platform.OS === 'android';
const OVERLAY_BLUR = Platform.select({ ios: 32, android: 48, default: 24 });

const NotificationIcon = ({ type, colors, isDark }) => {
  const iconColor =
    type === 'biometric_enable' ? '#34C759' : isDark ? '#0A84FF' : colors.secondary;
  const wrapBg = isDark ? 'rgba(10, 132, 255, 0.18)' : 'rgba(0, 122, 255, 0.12)';

  let icon = <Bell color={iconColor} size={22} strokeWidth={2.25} />;
  if (type === 'mpin_setup') {
    icon = <Shield color={iconColor} size={22} strokeWidth={2.25} />;
  } else if (type === 'biometric_enable') {
    icon = <Fingerprint color={iconColor} size={22} strokeWidth={2.25} />;
  }

  return <View style={[styles.itemIcon, { backgroundColor: wrapBg }]}>{icon}</View>;
};

const NotificationRow = ({ item, colors, isDark, groupBg, onPress }) => (
  <TouchableOpacity
    style={styles.row}
    onPress={onPress}
    activeOpacity={0.55}
    accessibilityRole="button"
    accessibilityLabel={item.title}
  >
    <View style={styles.lead}>
      <View style={styles.iconSlot}>
        <NotificationIcon type={item.type} colors={colors} isDark={isDark} />
        {item.isUnread ? (
          <View style={[styles.unreadBadge, { borderColor: groupBg }]} />
        ) : null}
      </View>
    </View>

    <View style={styles.itemBody}>
      <Text
        style={[styles.itemTitle, { color: isDark ? '#ffffff' : '#000000' }]}
        numberOfLines={2}
        allowFontScaling={false}
      >
        {item.title}
      </Text>
      <Text
        style={[styles.itemMessage, { color: isDark ? 'rgba(235, 235, 245, 0.65)' : 'rgba(60, 60, 67, 0.65)' }]}
        allowFontScaling={false}
      >
        {item.message}
      </Text>
    </View>

    <View style={styles.chevronWrap}>
      <ChevronRight
        color={isDark ? 'rgba(235, 235, 245, 0.35)' : 'rgba(60, 60, 67, 0.35)'}
        size={16}
        strokeWidth={2.75}
      />
    </View>
  </TouchableOpacity>
);

export const NotificationsSheet = ({
  visible,
  colors,
  isDark,
  notifications,
  onClose,
  onNotificationPress,
}) => {
  const insets = useSafeAreaInsets();
  const { modalMounted, backdropOpacity, sheetTranslateY, requestDismiss } =
    useBottomSheetMotion(visible, onClose);

  const sheetBg = isDark ? '#1c1c1e' : '#f2f2f7';
  const groupBg = isDark ? '#2c2c2e' : '#ffffff';
  const titleColor = isDark ? '#ffffff' : '#000000';
  const subtitleColor = isDark ? 'rgba(235, 235, 245, 0.6)' : 'rgba(60, 60, 67, 0.6)';
  const divider = isDark ? 'rgba(84, 84, 88, 0.65)' : 'rgba(60, 60, 67, 0.18)';
  const handleColor = isDark ? 'rgba(255, 255, 255, 0.28)' : 'rgba(0, 0, 0, 0.18)';

  const backdropTint =
    Platform.OS === 'web'
      ? isDark
        ? 'rgba(0, 0, 0, 0.55)'
        : 'rgba(0, 0, 0, 0.4)'
      : isDark
        ? 'rgba(0, 0, 0, 0.28)'
        : 'rgba(15, 23, 42, 0.18)';
  const blurTint = isDark ? 'dark' : 'light';

  if (!modalMounted) {
    return null;
  }

  const sheetContent = (
    <View style={[styles.overlayHost, Platform.OS === 'web' && styles.overlayWeb]}>
      {Platform.OS === 'ios' ? (
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { opacity: backdropOpacity }]}
        >
          <BlurView
            intensity={OVERLAY_BLUR}
            tint={blurTint}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      ) : null}
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          Platform.OS === 'web'
            ? styles.scrimWeb
            : isDark
              ? styles.scrimBlurDark
              : styles.scrimBlurLight,
          { opacity: backdropOpacity },
        ]}
      />
      {Platform.OS === 'web' ? null : (
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: backdropTint, opacity: backdropOpacity },
          ]}
        />
      )}
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={requestDismiss}
        accessibilityLabel="Close notifications"
      />

      <Animated.View
        style={[
          styles.sheet,
          {
            backgroundColor: sheetBg,
            paddingBottom: Math.max(insets.bottom, 16),
            transform: [{ translateY: sheetTranslateY }],
          },
        ]}
      >
          <View style={[styles.grabHandle, { backgroundColor: handleColor }]} />

          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: titleColor }]}>
              {MPIN_SETUP_REMINDER_COPY.sheetTitle}
            </Text>
            <TouchableOpacity
              onPress={requestDismiss}
              style={styles.doneBtn}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Done"
            >
              <Text style={styles.doneText}>{IOS_LABEL}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.list}
            contentContainerStyle={[
              notifications.length === 0 ? styles.listEmpty : styles.listContent,
            ]}
            showsVerticalScrollIndicator={false}
          >
            {notifications.length === 0 ? (
              <Text style={[styles.emptyText, { color: subtitleColor }]}>
                {MPIN_SETUP_REMINDER_COPY.sheetEmpty}
              </Text>
            ) : (
              <View style={[styles.group, { backgroundColor: groupBg }]}>
                {notifications.map((item, index) => (
                  <React.Fragment key={item.id}>
                    {index > 0 ? <View style={[styles.rule, { backgroundColor: divider }]} /> : null}
                    <NotificationRow
                      item={item}
                      colors={colors}
                      isDark={isDark}
                      groupBg={groupBg}
                      onPress={() => onNotificationPress(item)}
                    />
                  </React.Fragment>
                ))}
              </View>
            )}
          </ScrollView>
        </Animated.View>
    </View>
  );

  if (USE_IN_TREE_OVERLAY) {
    return (
      <View style={styles.inTreeRoot} pointerEvents="box-none">
        {sheetContent}
      </View>
    );
  }

  return (
    <Modal
      visible={modalMounted}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={requestDismiss}
    >
      {sheetContent}
    </Modal>
  );
};

export const isMpinSetupNotification = (item) =>
  item?.id === MPIN_SETUP_NOTIFICATION_ID || item?.type === 'mpin_setup';

const styles = StyleSheet.create({
  inTreeRoot: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2000,
    elevation: 2000,
  },
  overlayHost: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlayWeb: {
    zIndex: 10000,
  },
  scrimWeb: {
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      },
      default: {},
    }),
  },
  scrimBlurDark: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  scrimBlurLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  sheet: {
    maxHeight: '78%',
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
    color: IOS_BLUE,
    letterSpacing: -0.41,
  },
  list: {
    flexGrow: 0,
  },
  listContent: {
    paddingBottom: 8,
  },
  listEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 56,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '400',
    textAlign: 'center',
    letterSpacing: -0.24,
  },
  group: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingLeft: 16,
    paddingRight: 12,
    minHeight: 72,
  },
  lead: {
    flexShrink: 0,
  },
  iconSlot: {
    position: 'relative',
    marginRight: 12,
  },
  rule: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 68,
  },
  unreadBadge: {
    position: 'absolute',
    top: -2,
    left: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: IOS_BLUE,
    borderWidth: 2,
  },
  itemIcon: {
    width: 44,
    height: 44,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemBody: {
    flex: 1,
    minWidth: 0,
    paddingRight: 8,
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 21,
    marginBottom: 3,
    ...Platform.select({
      android: { includeFontPadding: false },
      default: {},
    }),
  },
  itemMessage: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '400',
    ...Platform.select({
      android: { includeFontPadding: false },
      default: {},
    }),
  },
  chevronWrap: {
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    width: 20,
    height: 44,
  },
});
