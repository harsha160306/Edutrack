import { Platform } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';

export const BIOMETRIC_KIND = {
  FINGERPRINT: 'fingerprint',
  FACIAL: 'facial',
  IRIS: 'iris',
  UNKNOWN: 'unknown',
};

const hasType = (types, type) => types?.includes(type);

/** Pick the biometric type the device is most likely using (not every supported sensor). */
const pickPrimaryKind = (types) => {
  const { FINGERPRINT, FACIAL_RECOGNITION, IRIS } = LocalAuthentication.AuthenticationType;

  if (Platform.OS === 'ios') {
    if (hasType(types, FACIAL_RECOGNITION)) return BIOMETRIC_KIND.FACIAL;
    if (hasType(types, FINGERPRINT)) return BIOMETRIC_KIND.FINGERPRINT;
    return BIOMETRIC_KIND.UNKNOWN;
  }

  // Android often lists face + fingerprint even when only fingerprint is enrolled.
  if (hasType(types, FINGERPRINT)) return BIOMETRIC_KIND.FINGERPRINT;
  if (hasType(types, FACIAL_RECOGNITION)) return BIOMETRIC_KIND.FACIAL;
  if (hasType(types, IRIS)) return BIOMETRIC_KIND.IRIS;
  return BIOMETRIC_KIND.UNKNOWN;
};

const labelForKind = (kind) => {
  if (kind === BIOMETRIC_KIND.FACIAL) {
    return Platform.OS === 'ios' ? 'Face ID' : 'Face unlock';
  }
  if (kind === BIOMETRIC_KIND.FINGERPRINT) {
    return Platform.OS === 'ios' ? 'Touch ID' : 'Fingerprint';
  }
  if (kind === BIOMETRIC_KIND.IRIS) {
    return 'Iris unlock';
  }
  return 'Biometrics';
};

/**
 * @returns {Promise<{
 *   available: boolean,
 *   hasHardware: boolean,
 *   enrolled: boolean,
 *   kind: string,
 *   label: string,
 * }>}
 */
export const getBiometricCapability = async () => {
  if (Platform.OS === 'web') {
    return {
      available: false,
      hasHardware: false,
      enrolled: false,
      kind: BIOMETRIC_KIND.UNKNOWN,
      label: 'Biometrics',
    };
  }

  try {
    const [hasHardware, isEnrolled, supportedTypes] = await Promise.all([
      LocalAuthentication.hasHardwareAsync(),
      LocalAuthentication.isEnrolledAsync(),
      LocalAuthentication.supportedAuthenticationTypesAsync(),
    ]);

    const kind = hasHardware ? pickPrimaryKind(supportedTypes) : BIOMETRIC_KIND.UNKNOWN;
    const label = labelForKind(kind);

    return {
      available: Boolean(hasHardware && isEnrolled),
      hasHardware: Boolean(hasHardware),
      enrolled: Boolean(isEnrolled),
      kind,
      label,
    };
  } catch {
    return {
      available: false,
      hasHardware: false,
      enrolled: false,
      kind: BIOMETRIC_KIND.UNKNOWN,
      label: 'Biometrics',
    };
  }
};

/**
 * @param {string} promptMessage
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export const authenticateWithBiometric = async (promptMessage) => {
  if (Platform.OS === 'web') {
    return { success: false, error: 'unavailable' };
  }

  const capability = await getBiometricCapability();
  if (!capability.available) {
    return { success: false, error: 'unavailable' };
  }

  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      cancelLabel: 'Use MPIN',
      disableDeviceFallback: true,
      fallbackLabel: 'Use MPIN',
    });

    if (result.success) {
      return { success: true };
    }

    if (result.error === 'user_cancel') {
      return { success: false, error: 'cancelled' };
    }

    return { success: false, error: result.error ?? 'failed' };
  } catch {
    return { success: false, error: 'failed' };
  }
};
