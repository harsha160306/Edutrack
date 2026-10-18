import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import { getAppleSystemBlue } from './apple_material';

/**
 * Cycles through fixed minute options (e.g. 1, 5, 15).
 */
export const MinuteStepper = ({
  label = 'Sync every',
  value,
  options,
  onChange,
  isDark = false,
  unitLabel = 'min',
}) => {
  const list = options?.length ? options : [1, 5, 15];
  const index = Math.max(0, list.indexOf(value));
  const current = list[index] ?? list[0];

  const step = (delta) => {
    const next = list[(index + delta + list.length) % list.length];
    onChange?.(next);
  };

  const labelColor = isDark ? '#F1F5F9' : '#3c3c43';
  const valueColor = isDark ? '#F8FAFC' : '#000000';
  const trackBorder = isDark ? 'rgba(84, 84, 88, 0.65)' : 'rgba(60, 60, 67, 0.18)';
  const trackBg = isDark ? 'rgba(44, 44, 46, 0.6)' : '#F2F2F7';
  const iconColor = isDark ? '#0A84FF' : getAppleSystemBlue(false);

  const renderStepButton = (delta, accessibilityLabel, IconComponent, edge) => (
    <TouchableOpacity
      style={[
        styles.stepBtn,
        edge === 'left' ? styles.stepBtnLeft : styles.stepBtnRight,
        { borderColor: trackBorder },
      ]}
      onPress={() => step(delta)}
      activeOpacity={0.55}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <IconComponent size={20} color={iconColor} strokeWidth={2.75} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.row}>
      <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
      <View
        style={[
          styles.stepperTrack,
          {
            backgroundColor: trackBg,
            borderColor: trackBorder,
          },
        ]}
      >
        {renderStepButton(-1, 'Decrease interval', Minus, 'left')}
        <View style={[styles.valueCell, { borderColor: trackBorder }]}>
          <Text style={[styles.value, { color: valueColor }]}>
            {current} {unitLabel}
          </Text>
        </View>
        {renderStepButton(1, 'Increase interval', Plus, 'right')}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  label: {
    fontSize: 17,
    fontWeight: '400',
    flex: 1,
    paddingRight: 8,
  },
  stepperTrack: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    minHeight: 36,
  },
  stepBtn: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  stepBtnLeft: {
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  stepBtnRight: {
    borderLeftWidth: StyleSheet.hairlineWidth,
  },
  valueCell: {
    minWidth: 96,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  value: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
});
