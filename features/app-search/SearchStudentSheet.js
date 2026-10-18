import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Platform,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Phone, Mail, Users } from 'lucide-react-native';
import { useBottomSheetMotion } from '../../components/bottomSheetMotion';
import {
  BottomSheetHeader,
  bottomSheetOverlayStyles,
  bottomSheetSurfaceStyles,
  getBottomSheetColors,
  getBottomSheetSafePadding,
} from '../../components/bottomSheetLayout';
import { getAppleSystemBlue } from '../../components/apple_material';
import { formatSyncedDateTime } from '../network-status/formatSyncedDateTime';
import { StudentInfoCard } from './StudentInfoCard';
import { SEARCH_COPY } from './constants';
import { dialPhone, sendEmail } from './openStudentContact';

const studentSheetTitle = (student) => {
  const name = student?.name?.trim() || student?.fullName?.trim();
  if (name) return name;
  const roll = student?.rollNo?.trim() || student?.id?.trim();
  return roll ? `Roll ${roll}` : 'Student';
};

const ContactAction = ({ icon: Icon, label, onPress, colors, isDark }) => {
  const iconColor = isDark ? colors.secondary : colors.primary;
  const wrapBg = isDark ? 'rgba(10, 132, 255, 0.18)' : 'rgba(0, 122, 255, 0.12)';

  return (
    <TouchableOpacity
      style={styles.contactAction}
      onPress={onPress}
      activeOpacity={0.82}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={[styles.contactIconWrap, { backgroundColor: wrapBg }]}>
        <Icon color={iconColor} size={22} strokeWidth={2.3} />
      </View>
      <Text style={[styles.contactLabel, { color: colors.textMuted }]} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export const SearchStudentSheet = ({
  visible,
  student,
  colors,
  isDark,
  onClose,
  onMarkLate,
}) => {
  const insets = useSafeAreaInsets();
  const { modalMounted, backdropOpacity, sheetTranslateY, requestDismiss } =
    useBottomSheetMotion(visible, onClose);

  const { sheetBg, groupBg, titleColor, subtitleColor, divider, handleColor } =
    getBottomSheetColors(isDark);
  const actionBlue = getAppleSystemBlue(isDark);
  const backdropTint = isDark ? 'rgba(0, 0, 0, 0.55)' : 'rgba(0, 0, 0, 0.4)';
  const bottomPad = getBottomSheetSafePadding(insets.bottom);

  const [saving, setSaving] = useState(false);
  const [currentStamp, setCurrentStamp] = useState(() => new Date());

  useEffect(() => {
    if (visible) {
      setSaving(false);
      setCurrentStamp(new Date());
    }
  }, [visible, student?.id]);

  const handleMarkLate = async () => {
    if (!student || saving) return;
    setSaving(true);
    try {
      await onMarkLate?.(student);
      onClose?.();
    } finally {
      setSaving(false);
    }
  };

  if (!student && !modalMounted) return null;

  return (
    <Modal
      visible={modalMounted}
      transparent
      animationType="none"
      onRequestClose={requestDismiss}
      statusBarTranslucent
    >
      <View style={bottomSheetOverlayStyles.modalRoot}>
        <View
          style={[
            bottomSheetOverlayStyles.host,
            Platform.OS === 'web' && bottomSheetOverlayStyles.web,
          ]}
        >
          <Animated.View
            pointerEvents="none"
            style={[
              bottomSheetOverlayStyles.backdrop,
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
              bottomSheetSurfaceStyles.sheet,
              {
                backgroundColor: sheetBg,
                paddingBottom: bottomPad,
                transform: [{ translateY: sheetTranslateY }],
              },
            ]}
          >
            <View style={[bottomSheetSurfaceStyles.grabHandle, { backgroundColor: handleColor }]} />

            <BottomSheetHeader
              title={studentSheetTitle(student)}
              titleColor={titleColor}
              onDone={requestDismiss}
            />

            <View style={bottomSheetSurfaceStyles.body}>
              <View style={[bottomSheetSurfaceStyles.contentGroup, { backgroundColor: groupBg }]}>
                <View style={styles.studentSection}>
                  <StudentInfoCard
                    student={student}
                    colors={colors}
                    isDark={isDark}
                    showProfileIcon={false}
                    embedded
                  />
                </View>

                <View style={[styles.rule, { backgroundColor: divider }]} />

                <View style={styles.contactRow}>
                  <ContactAction
                    icon={Phone}
                    label={SEARCH_COPY.sheetDial}
                    onPress={() => dialPhone(student?.phone)}
                    colors={colors}
                    isDark={isDark}
                  />
                  <ContactAction
                    icon={Mail}
                    label={SEARCH_COPY.sheetEmail}
                    onPress={() => sendEmail(student?.email)}
                    colors={colors}
                    isDark={isDark}
                  />
                  <ContactAction
                    icon={Users}
                    label={SEARCH_COPY.sheetParent}
                    onPress={() => dialPhone(student?.parentPhone)}
                    colors={colors}
                    isDark={isDark}
                  />
                </View>

                <Text style={[styles.markedOn, { color: subtitleColor }]}>
                  {SEARCH_COPY.sheetMarkedOn} {formatSyncedDateTime(currentStamp)}
                </Text>
              </View>

              <View style={bottomSheetSurfaceStyles.sheetFooter}>
                <TouchableOpacity
                  style={[styles.markLateBtn, { backgroundColor: actionBlue }, saving && styles.btnDisabled]}
                  onPress={handleMarkLate}
                  activeOpacity={0.88}
                  disabled={saving}
                  accessibilityRole="button"
                  accessibilityLabel={SEARCH_COPY.sheetMarkLate}
                >
                  {saving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.markLateText}>{SEARCH_COPY.sheetMarkLate}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  studentSection: {
    paddingHorizontal: 4,
    paddingTop: 4,
    paddingBottom: 8,
  },
  rule: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  contactAction: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  },
  contactIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  markedOn: {
    fontSize: 13,
    fontWeight: '400',
    textAlign: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    letterSpacing: -0.08,
  },
  markLateBtn: {
    minHeight: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: { opacity: 0.65 },
  markLateText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
});
