import { Easing, Platform } from 'react-native';

/** Pull-down distance (px) — sheet moves down to reveal header gradient. */
export const SHEET_PULL_RANGE = 80;

/** Finger travel before pull fully engages (mobile — kept low for one-finger ease). */
export const PULL_ACTIVATION_DY = 5;

export const PULL_ACTIVATION_DY_WEB = 32;

export const WEB_PULL_RELEASE_MS = 100;

/** Pull distance before hold-to-sync (mobile) or release (web). */
export const PULL_SYNC_THRESHOLD = 38;

/** Hold at threshold to open sync confirm (mobile). */
export const SYNC_HOLD_MS = 1300;

export const PULL_FOLLOW_RATIO = 0.94;

/** Near 1:1 finger follow on native (less rubber-band resistance). */
export const PULL_FOLLOW_RATIO_MOBILE = 1;

/** Preview travel before activation (fraction of max pull). */
export const PULL_PREVIEW_MAX_RATIO = 0.28;

export const PULL_RELEASE_MS = 420;

export const PULL_RELEASE_EASING = Easing.bezier(0.22, 1, 0.36, 1);

export const PULL_RELEASE_SPRING = {
  damping: 22,
  stiffness: 260,
  mass: 0.82,
};

/** Snappy but smooth return on native. */
export const MOBILE_PULL_RELEASE_MS = 280;

/** Minimal rest gap — indicator overflows visibly when pulling (icon + label ~34px). */
export const PULL_HEADER_SLOT_HEIGHT = 8;

/** Consider "at top" while rubber-banding (px). */
export const SCROLL_TOP_TOLERANCE = 12;

export const PULL_ACTIVATION_DY_EFFECTIVE =
  Platform.OS === 'web' ? PULL_ACTIVATION_DY_WEB : PULL_ACTIVATION_DY;

/** ScrollView touch — start tracking after tiny downward move (px). */
export const PULL_TOUCH_START_DY = 2;
