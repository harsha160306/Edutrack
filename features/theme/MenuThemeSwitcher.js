import React from 'react';
import { View, Pressable, StyleSheet, Platform, Vibration } from 'react-native';
import { Monitor, Sun, Moon } from 'lucide-react-native';

const OPTIONS = [
  { id: 'system', Icon: Monitor, label: 'System theme' },
  { id: 'light', Icon: Sun, label: 'Light theme' },
  { id: 'dark', Icon: Moon, label: 'Dark theme' },
];

export const MenuThemeSwitcher = ({ value = 'system', onChange, isDark }) => {
  const handleSelect = (id) => {
    if (id === value) return;
    if (Platform.OS !== 'web') Vibration.vibrate(30);
    onChange?.(id);
  };

  const trackBg = isDark ? 'rgba(15, 23, 42, 0.65)' : 'rgba(241, 245, 249, 0.95)';
  const activeBg = isDark ? '#334155' : '#ffffff';
  const iconActive = isDark ? '#f1f5f9' : '#0f172a';
  const iconMuted = isDark ? '#64748b' : '#94a3b8';

  return (
    <View style={[styles.row, { backgroundColor: trackBg }]}>
      {OPTIONS.map(({ id, Icon, label }) => {
        const selected = value === id;
        return (
          <Pressable
            key={id}
            style={({ pressed }) => [
              styles.btn,
              selected && { backgroundColor: activeBg },
              pressed && styles.btnPressed,
            ]}
            onPress={() => handleSelect(id)}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{ selected }}
            android_ripple={
              Platform.OS === 'android'
                ? { color: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.08)' }
                : undefined
            }
          >
            <Icon
              size={18}
              color={selected ? iconActive : iconMuted}
              strokeWidth={selected ? 2.4 : 2}
            />
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginHorizontal: 8,
    marginTop: 6,
    marginBottom: 4,
    padding: 3,
    borderRadius: 10,
    gap: 2,
  },
  btn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 8,
  },
  btnPressed: {
    opacity: 0.82,
  },
});
