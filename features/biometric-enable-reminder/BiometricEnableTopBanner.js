import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Fingerprint } from 'lucide-react-native';
import { BIOMETRIC_ENABLE_COPY } from './constants';

export const BiometricEnableTopBanner = ({ colors, isDark, biometricLabel, onPress, enabling }) => (
  <TouchableOpacity
    style={[
      styles.banner,
      {
        backgroundColor: isDark ? '#134e4a' : '#ecfdf5',
        borderColor: isDark ? '#0d9488' : '#6ee7b7',
      },
    ]}
    onPress={onPress}
    disabled={enabling}
    activeOpacity={0.85}
    accessibilityRole="button"
    accessibilityLabel={BIOMETRIC_ENABLE_COPY.bannerTitle}
  >
    <View style={[styles.iconWrap, { backgroundColor: `${colors.success}22` }]}>
      <Fingerprint color={colors.success} size={22} strokeWidth={2.2} />
    </View>
    <View style={styles.textWrap}>
      <Text style={[styles.title, { color: colors.text }]}>
        {BIOMETRIC_ENABLE_COPY.bannerTitle}
      </Text>
      <Text style={[styles.message, { color: isDark ? '#94a3b8' : '#64748b' }]}>
        {BIOMETRIC_ENABLE_COPY.bannerMessage(biometricLabel ?? 'biometrics')}
      </Text>
    </View>
    <View style={[styles.actionPill, { backgroundColor: colors.success }]}>
      <Text style={styles.actionText}>
        {enabling ? '…' : BIOMETRIC_ENABLE_COPY.bannerAction}
      </Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  banner: {
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#0d9488',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
      default: {},
    }),
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textWrap: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  message: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
  },
  actionPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    minWidth: 64,
    alignItems: 'center',
  },
  actionText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
});
