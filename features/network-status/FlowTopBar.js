import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { NetworkStatusBadge } from './NetworkStatusBadge';
import {
  FLOW_TOP_BAR_ROW_MIN_HEIGHT,
  useFlowTopBarPaddingTop,
} from './flowTopBarInsets';

/**
 * Shared top row: optional back chevron + network status pill on one baseline.
 */
export function FlowTopBar({
  colors,
  onBack,
  backAccessibilityLabel = 'Go back',
  reserveLeadingSpace = false,
  paddingHorizontal = 0,
  style,
}) {
  const paddingTop = useFlowTopBarPaddingTop();
  const showLeading = Boolean(onBack) || reserveLeadingSpace;

  return (
    <View
      style={[
        styles.bar,
        { paddingTop, paddingHorizontal },
        style,
      ]}
    >
      <View style={styles.row}>
        {showLeading ? (
          onBack ? (
            <TouchableOpacity
              style={styles.leadingSlot}
              onPress={onBack}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={backAccessibilityLabel}
            >
              <ChevronLeft color={colors.text} size={28} strokeWidth={2.5} />
            </TouchableOpacity>
          ) : (
            <View style={styles.leadingSlot} />
          )
        ) : null}
        <View style={styles.fill} />
        <View style={styles.trailingSlot}>
          <NetworkStatusBadge colors={colors} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    alignSelf: 'stretch',
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: FLOW_TOP_BAR_ROW_MIN_HEIGHT,
  },
  leadingSlot: {
    minWidth: FLOW_TOP_BAR_ROW_MIN_HEIGHT,
    minHeight: FLOW_TOP_BAR_ROW_MIN_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fill: {
    flex: 1,
    minWidth: 8,
  },
  trailingSlot: {
    minHeight: FLOW_TOP_BAR_ROW_MIN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
});
