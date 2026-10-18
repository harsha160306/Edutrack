/** Default length when not specified (legacy). */
export const MPIN_LENGTH = 4;

export const MPIN_LENGTH_OPTIONS = [4, 6];

export const MPIN_STORAGE_VERSION = 'v1';

/** Common weak PINs blocked during setup (banking-style). */
export const WEAK_MPINS = new Set([
  '0000',
  '1111',
  '2222',
  '3333',
  '4444',
  '5555',
  '6666',
  '7777',
  '8888',
  '9999',
  '1234',
  '4321',
  '0123',
  '1212',
  '2580',
  '000000',
  '111111',
  '222222',
  '333333',
  '444444',
  '555555',
  '666666',
  '777777',
  '888888',
  '999999',
  '123456',
  '654321',
  '012345',
  '121212',
  '112233',
]);

export const MPIN_PROMPT = {
  title: 'Set up MPIN',
  message:
    'Create a 4- or 6-digit MPIN to secure quick sign-in on this device.',
  setupLabel: 'Create MPIN',
  laterLabel: 'Not now',
};

export const MPIN_SETUP_COPY = {
  chooseLengthTitle: 'Choose MPIN length',
  chooseLengthSubtitle: 'Pick how many digits you want for your MPIN',
  fourDigitLabel: '4-digit MPIN',
  fourDigitHint: 'Faster to enter · common on banking apps',
  sixDigitLabel: '6-digit MPIN',
  sixDigitHint: 'More combinations · stronger protection',
  createTitle: 'Create MPIN',
  confirmTitle: 'Confirm MPIN',
  confirmSubtitle: 'Re-enter your MPIN to confirm',
  successTitle: 'MPIN created',
  successSubtitle: 'Your account is secured on this device',
  mismatch: 'PINs do not match. Try again.',
  continueLabel: 'Continue to app',
  changeLengthLabel: 'Change length',
};

export const getMpinCreateSubtitle = (pinLength) =>
  `Choose a ${pinLength}-digit PIN only you know`;

export const getMpinWeakPinMessage = (pinLength) =>
  `This PIN is too easy. Choose a stronger ${pinLength}-digit MPIN.`;

export const MPIN_UNLOCK_COPY = {
  title: 'Unlock to Continue',
  subtitle: (pinLength) => `Enter your ${pinLength}-digit MPIN to continue`,
  biometricPrompt: 'Unlock to Continue',
  subtitleBiometric: (label) => `Or use ${label} on the keypad below`,
  wrongPin: 'Incorrect MPIN. Try again.',
  signOut: 'Sign out',
  loading: 'Loading…',
  biometricEnabledHint: 'Biometric unlock on',
  biometricDisabledHint: 'Biometric unlock off — tap to enable',
  biometricUnavailable: 'Biometrics not available on this device',
  enableBiometricTitle: 'Enable biometric unlock?',
  enableBiometricMessage: (label) =>
    `Use ${label} to unlock the app instead of entering your MPIN each time?`,
  enable: 'Enable',
  cancel: 'Not now',
};
