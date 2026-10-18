import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, UserCheck, History, Search, Settings } from 'lucide-react-native';

const TAB_HEIGHT = 58;

const tabs = [
  { id: 'dashboard', label: 'Home', Icon: Home },
  { id: 'marked', label: 'Marked', Icon: UserCheck },
  { id: 'latecomer-history', label: 'History', Icon: History },
  { id: 'searching', label: 'Search', Icon: Search },
  { id: 'settings', label: 'Settings', Icon: Settings },
];

export const getFacultyTabBarHeight = (bottomInset = 0) =>
  TAB_HEIGHT + Math.max(bottomInset, Platform.OS === 'ios' ? 6 : 10);

export const FacultyTabBar = ({ activeState, isDark, colors, onNavigate }) => {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, Platform.OS === 'ios' ? 6 : 10);

  const chrome = useMemo(() => {
    const bg = isDark ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.92)';
    const border = isDark ? 'rgba(148, 163, 184, 0.22)' : 'rgba(15, 23, 42, 0.08)';
    const inactive = isDark ? 'rgba(226, 232, 240, 0.72)' : 'rgba(71, 85, 105, 0.85)';
    const active = colors?.secondary ?? (isDark ? '#60A5FA' : '#2563EB');
    return { bg, border, inactive, active };
  }, [colors?.secondary, isDark]);

  const effectiveActive =
    activeState === 'scanning' ? 'dashboard' : activeState;

  return (
    <View pointerEvents="box-none" style={styles.shell}>
      <View
        style={[
          styles.bar,
          {
            backgroundColor: chrome.bg,
            borderTopColor: chrome.border,
            paddingBottom: bottomPad,
          },
        ]}
      >
        {tabs.map(({ id, label, Icon }) => {
          const active = effectiveActive === id;
          const tint = active ? chrome.active : chrome.inactive;
          return (
            <TouchableOpacity
              key={id}
              onPress={() => onNavigate?.(id)}
              style={styles.tab}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={label}
            >
              <Icon color={tint} size={20} strokeWidth={2.4} />
              <Text style={[styles.label, { color: tint }]} numberOfLines={1}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  shell: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    elevation: 9999,
  },
  bar: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 10,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    minHeight: TAB_HEIGHT,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
});

