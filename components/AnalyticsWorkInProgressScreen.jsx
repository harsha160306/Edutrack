import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BarChart3 } from 'lucide-react-native';

export const AnalyticsWorkInProgressScreen = ({ isDark = false, bottomOffset = 0 }) => {
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#0B1220' : '#F8FAFC',
          paddingBottom: bottomOffset,
        },
      ]}
    >
      <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
        <View style={[styles.iconWrap, isDark ? styles.iconWrapDark : styles.iconWrapLight]}>
          <BarChart3 size={22} color={isDark ? '#FBBF24' : '#B45309'} strokeWidth={2.4} />
        </View>
        <Text style={[styles.title, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>Analytics</Text>
        <Text style={[styles.subtitle, { color: isDark ? '#94A3B8' : '#64748B' }]}>
          Work in progress
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  cardLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  cardDark: {
    backgroundColor: '#111827',
    borderColor: '#334155',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  iconWrapLight: {
    backgroundColor: 'rgba(245, 158, 11, 0.18)',
  },
  iconWrapDark: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
});
