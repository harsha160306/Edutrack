import { Dimensions, Platform, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Minimum row height for back control + network badge (touch target). */
export const FLOW_TOP_BAR_ROW_MIN_HEIGHT = 44;

/**
 * Top padding for back button + network badge rows (auth, onboarding).
 * Safe-area inset plus a small gap that scales with screen height.
 */
export function getFlowTopBarPaddingTop(insetsTop, screenHeight = Dimensions.get('window').height) {
  let extra = 2;

  if (screenHeight >= 880) {
    extra = 0;
  } else if (screenHeight >= 812) {
    extra = 1;
  } else if (screenHeight >= 736) {
    extra = 2;
  } else {
    extra = Platform.OS === 'ios' ? 1 : 3;
  }

  return insetsTop + extra;
}

export function useFlowTopBarPaddingTop() {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  return getFlowTopBarPaddingTop(insets.top, height);
}
