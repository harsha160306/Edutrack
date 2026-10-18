export const BIOMETRIC_ENABLE_NOTIFICATION_ID = 'biometric-enable-reminder';

export const BIOMETRIC_ENABLE_COPY = {
  bannerTitle: 'Enable biometrics',
  bannerMessage: (label) => `Use ${label} for faster unlock instead of entering your MPIN every time.`,
  bannerAction: 'Enable',
  notificationTitle: 'Enable biometric unlock',
  notificationMessage: (label) =>
    `Your MPIN is set. Turn on ${label} to unlock the app quickly and securely.`,
  notificationAction: 'Enable now',
  postMpinTitle: 'Enable biometric unlock?',
  postMpinMessage: (label) =>
    `Your MPIN is set. Use ${label} to unlock the app quickly instead of typing your PIN each time.`,
  postMpinEnable: 'Enable',
  postMpinNotNow: 'Not now',
};
