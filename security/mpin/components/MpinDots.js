import React from 'react';
import { View, StyleSheet } from 'react-native';
import { getMpinUi } from '../mpinTheme';

export const MpinDots = ({ length, pinLength = 4, colors, isDark = true }) => {
  const ui = getMpinUi(colors, isDark);

  return (
    <View style={[styles.row, pinLength === 6 && styles.rowSix]}>
      {Array.from({ length: pinLength }).map((_, index) => {
        const isFilled = index < length;
        return (
          <View
            key={index}
            style={[
              styles.dot,
              pinLength === 6 && styles.dotSix,
              {
                borderColor: isFilled ? ui.dotFilled : ui.dotEmptyBorder,
                backgroundColor: isFilled ? ui.dotFilled : ui.dotEmptyBg,
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 28,
    marginBottom: 8,
  },
  rowSix: {
    gap: 14,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
  },
  dotSix: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
});
