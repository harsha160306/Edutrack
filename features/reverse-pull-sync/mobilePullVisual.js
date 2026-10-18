import { Platform } from 'react-native';

import { PULL_FOLLOW_RATIO, PULL_FOLLOW_RATIO_MOBILE } from './constants';

export function getMobileFollowRatio() {
  return Platform.OS === 'web' ? PULL_FOLLOW_RATIO : PULL_FOLLOW_RATIO_MOBILE;
}

const CHROME_SYNC_STEP = 4;

/**
 * Finger tracking updates translateY every frame (native driver).
 * Chrome (layout-linked) is stepped to reduce JS thread jank on mobile.
 */
export function createMobilePullVisualDriver(pullTranslateY, pullChrome, pullAmountRef) {
  let lastChromeStep = -1;

  const flushNow = (amount) => {
    lastChromeStep = amount;
    pullTranslateY.setValue(amount);
    pullChrome.setValue(amount);
    pullAmountRef.current = amount;
  };

  const setPullVisual = (amount) => {
    pullTranslateY.setValue(amount);
    pullAmountRef.current = amount;

    if (Platform.OS === 'web') {
      pullChrome.setValue(amount);
      return;
    }

    const stepped = Math.round(amount / CHROME_SYNC_STEP) * CHROME_SYNC_STEP;
    if (stepped !== lastChromeStep) {
      lastChromeStep = stepped;
      pullChrome.setValue(amount);
    }
  };

  return { setPullVisual, cancel: () => {}, flushNow };
}
