import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Shield } from 'lucide-react-native';
import { MPIN_SETUP_REMINDER_COPY } from './constants';

export const MpinSetupTopBanner = ({ colors, isDark, onPress }) => (
  <TouchableOpacity
    style={[
      styles.banner,
      {
        backgroundColor: isDark ? '#1e3a5f' : '#eff6ff',
        borderColor: isDark ? '#2563eb' : '#bfdbfe',
      },
    ]}
    onPress={onPress}
    activeOpacity={0.85}
    accessibilityRole="button"
    accessibilityLabel={MPIN_SETUP_REMINDER_COPY.bannerTitle}
  >
    <View style={[styles.iconWrap, { backgroundColor: `${colors.secondary}22` }]}>
      <Shield color={colors.secondary} size={20} strokeWidth={2.2} />
    </View>
    <View style={styles.textWrap}>
      <Text style={[styles.title, { color: colors.text }]}>
        {MPIN_SETUP_REMINDER_COPY.bannerTitle}
      </Text>
      <Text style={[styles.message, { color: isDark ? '#94a3b8' : '#64748b' }]}>
        {MPIN_SETUP_REMINDER_COPY.bannerMessage}
      </Text>
    </View>
    <View style={[styles.actionPill, { backgroundColor: colors.secondary }]}>
      <Text style={styles.actionText}>{MPIN_SETUP_REMINDER_COPY.bannerAction}</Text>
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
        shadowColor: '#2563eb',
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
  },
  actionText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
});
