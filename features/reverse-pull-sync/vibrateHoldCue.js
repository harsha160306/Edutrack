import { Platform, Vibration } from 'react-native';

/** Short double-pulse when "Hold to sync" appears (mobile only). */
export function vibrateHoldToSync() {
  if (Platform.OS === 'web') return;

  if (Platform.OS === 'android') {
    // pause, pulse, pause, pulse
    Vibration.vibrate([0, 42, 72, 42]);
    return;
  }

  Vibration.vibrate(50);
}
