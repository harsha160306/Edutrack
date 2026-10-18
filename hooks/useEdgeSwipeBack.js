import { useMemo } from 'react';
import { PanResponder } from 'react-native';

/** Edge swipe from the left to trigger back navigation. */
export const useEdgeSwipeBack = (onBack, enabled = true) => {
  return useMemo(() => {
    if (!enabled || !onBack) {
      return {};
    }

    return PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        gesture.moveX < 40 &&
        gesture.dx > 10 &&
        Math.abs(gesture.dy) < Math.abs(gesture.dx),
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > 72) {
          onBack();
        }
      },
    }).panHandlers;
  }, [onBack, enabled]);
};
