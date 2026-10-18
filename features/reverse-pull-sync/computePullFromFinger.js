import { Platform } from 'react-native';

import { PULL_PREVIEW_MAX_RATIO } from './constants';
import { getMobileFollowRatio } from './mobilePullVisual';

const easeOutQuad = (t) => 1 - (1 - t) * (1 - t);

/**
 * Maps finger travel → on-screen pull distance.
 * Mobile: soft start then ~1:1 follow for easy one-finger pull.
 */
export function computePullFromFinger(rawPull, activationDy, maxPull, followRatio = getMobileFollowRatio()) {
  if (rawPull <= 0) {
    return { visual: 0, engaged: false };
  }

  if (Platform.OS !== 'web') {
    const softStart = activationDy * 0.4;
    if (rawPull < softStart) {
      const t = rawPull / softStart;
      return {
        visual: easeOutQuad(t) * maxPull * PULL_PREVIEW_MAX_RATIO,
        engaged: false,
      };
    }
    const beyond = rawPull - softStart * 0.5;
    const visual = Math.min(beyond * followRatio, maxPull);
    const engaged = rawPull >= activationDy;
    return { visual, engaged };
  }

  if (rawPull < activationDy) {
    const t = rawPull / activationDy;
    return {
      visual: easeOutQuad(t) * maxPull * PULL_PREVIEW_MAX_RATIO,
      engaged: false,
    };
  }
  const beyond = (rawPull - activationDy) * followRatio;
  const visual = maxPull * (1 - Math.exp(-beyond / maxPull));
  return { visual: Math.min(visual, maxPull), engaged: true };
}
