import React from 'react';
import { View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';

/**
 * Wraps the dashboard hero/header block — Pan fails on upward/horizontal moves so scroll & carousel stay smooth.
 */
export function PullSyncGestureLayer({ gesture, enabled, children }) {
  if (!enabled || !gesture) {
    return children;
  }

  return (
    <GestureDetector gesture={gesture}>
      <View collapsable={false}>{children}</View>
    </GestureDetector>
  );
}
