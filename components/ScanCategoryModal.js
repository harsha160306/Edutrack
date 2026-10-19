import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Animated,
  Platform,
  Vibration,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Clock, ShieldAlert, ChevronRight, ScanLine, X } from 'lucide-react-native';
import {
  bottomSheetOverlayStyles,
  getBottomSheetColors,
  getBottomSheetSafePadding,
} from './bottomSheetLayout';

export const ScanCategoryModal = ({
  visible,
  isDark = true,
  onClose,
  onSelectLatecomer,
  onSelectIndiscipline,
}) => {
  const insets = useSafeAreaInsets();
  const bottomPad = getBottomSheetSafePadding(insets.bottom);
  const colors = getBottomSheetColors(isDark);

  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(anim, {
        toValue: 1,
        tension: 80,
        friction: 12,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(anim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, anim]);

  if (!visible) return null;

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [320, 0],
  });

  const backdropOpacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const handleSelectOption = (callback) => {
    if (Platform.OS !== 'web') Vibration.vibrate(30);
    onClose?.();
    setTimeout(() => {
      callback?.();
    }, 120);
  };

  const sheetBg = isDark ? '#181E29' : '#FFFFFF';
  const cardBg = isDark ? 'rgba(255, 255, 255, 0.05)' : '#F8FAFC';
  const cardBorder = isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0';
  const textColor = isDark ? '#F8FAFC' : '#0F172A';
  const subtextColor = isDark ? '#94A3B8' : '#64748B';
  const handleColor = isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)';
  const cancelBg = isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9';
  const cancelText = isDark ? '#E2E8F0' : '#334155';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={bottomSheetOverlayStyles.modalRoot}>
        <View
          style={[
            bottomSheetOverlayStyles.host,
            Platform.OS === 'web' && bottomSheetOverlayStyles.web,
          ]}
        >
          {/* Backdrop */}
          <Animated.View
            pointerEvents="none"
            style={[
              bottomSheetOverlayStyles.backdrop,
              {
                backgroundColor: isDark ? 'rgba(2, 6, 23, 0.72)' : 'rgba(15, 23, 42, 0.55)',
                opacity: backdropOpacity,
              },
            ]}
          />
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close scan category selection"
          />

          {/* Bottom Sheet Surface */}
          <Animated.View
            style={[
              styles.sheet,
              {
                backgroundColor: sheetBg,
                paddingBottom: Math.max(bottomPad, 18),
                transform: [{ translateY }],
              },
            ]}
          >
            {/* Grab Handle */}
            <View style={[styles.grabHandle, { backgroundColor: handleColor }]} />

            {/* Header */}
            <View style={styles.headerRow}>
              <View style={styles.headerIconWrap}>
                <ScanLine size={20} color="#F59E0B" strokeWidth={2.4} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.headerTitle, { color: textColor }]}>
                  Select Scan Category
                </Text>
                <Text style={[styles.headerSubtitle, { color: subtextColor }]}>
                  Choose the record type before scanning the student barcode
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                style={[styles.closeBtn, { backgroundColor: cardBg }]}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <X size={16} color={subtextColor} strokeWidth={2.2} />
              </TouchableOpacity>
            </View>

            {/* Options List */}
            <View style={styles.optionsContainer}>
              {/* Option 1: Late-Comer */}
              <TouchableOpacity
                style={[
                  styles.optionCard,
                  { backgroundColor: cardBg, borderColor: cardBorder },
                ]}
                onPress={() => handleSelectOption(onSelectLatecomer)}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel="Late-Comer scan option"
              >
                <View
                  style={[
                    styles.iconBox,
                    {
                      backgroundColor: isDark ? 'rgba(249, 115, 22, 0.15)' : '#FFF7ED',
                      borderColor: isDark ? 'rgba(249, 115, 22, 0.3)' : '#FED7AA',
                    },
                  ]}
                >
                  <Clock size={22} color="#F97316" strokeWidth={2.2} />
                </View>

                <View style={styles.optionDetails}>
                  <View style={styles.optionTitleRow}>
                    <Text style={[styles.optionTitle, { color: textColor }]}>
                      Late-Comer
                    </Text>
                    <View
                      style={[
                        styles.badge,
                        {
                          backgroundColor: isDark ? 'rgba(249, 115, 22, 0.2)' : '#FFF7ED',
                          borderColor: '#F97316',
                        },
                      ]}
                    >
                      <Text style={[styles.badgeText, { color: '#F97316' }]}>
                        AUTO LOG
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.optionDesc, { color: subtextColor }]}>
                    Record student morning arrival after designated cutoff time
                  </Text>
                </View>

                <ChevronRight size={18} color={subtextColor} strokeWidth={2} />
              </TouchableOpacity>

              {/* Option 2: In-Discipline */}
              <TouchableOpacity
                style={[
                  styles.optionCard,
                  { backgroundColor: cardBg, borderColor: cardBorder },
                ]}
                onPress={() => handleSelectOption(onSelectIndiscipline)}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel="In-Discipline scan option"
              >
                <View
                  style={[
                    styles.iconBox,
                    {
                      backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEF2F2',
                      borderColor: isDark ? 'rgba(239, 68, 68, 0.3)' : '#FECACA',
                    },
                  ]}
                >
                  <ShieldAlert size={22} color="#EF4444" strokeWidth={2.2} />
                </View>

                <View style={styles.optionDetails}>
                  <View style={styles.optionTitleRow}>
                    <Text style={[styles.optionTitle, { color: textColor }]}>
                      In-Discipline
                    </Text>
                    <View
                      style={[
                        styles.badge,
                        {
                          backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEF2F2',
                          borderColor: '#EF4444',
                        },
                      ]}
                    >
                      <Text style={[styles.badgeText, { color: '#EF4444' }]}>
                        FACULTY REVIEW
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.optionDesc, { color: subtextColor }]}>
                    Record uniform, ID card missing, or conduct violation
                  </Text>
                </View>

                <ChevronRight size={18} color={subtextColor} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            {/* Cancel Button */}
            <TouchableOpacity
              style={[styles.cancelBtn, { backgroundColor: cancelBg }]}
              onPress={onClose}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
            >
              <Text style={[styles.cancelText, { color: cancelText }]}>Cancel</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  sheet: {
    width: '100%',
    maxWidth: 540,
    alignSelf: 'center',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.18,
        shadowRadius: 16,
      },
      android: {
        elevation: 20,
      },
      web: {
        boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.24)',
      },
    }),
  },
  grabHandle: {
    width: 38,
    height: 4.5,
    borderRadius: 2.5,
    alignSelf: 'center',
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 18,
  },
  headerIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionDetails: {
    flex: 1,
  },
  optionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 3,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
    borderWidth: 0.5,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  optionDesc: {
    fontSize: 11.5,
    lineHeight: 15,
  },
  cancelBtn: {
    width: '100%',
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
