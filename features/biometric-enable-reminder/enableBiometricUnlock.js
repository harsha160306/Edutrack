import {
  authenticateWithBiometric,
  getBiometricCapability,
} from '../../security/mpin/biometricAuth';
import { setBiometricUnlockEnabled } from '../../security/mpin/biometricPreferences';

/**
 * @param {string} accountId
 * @returns {Promise<{ ok: boolean, reason?: string, label?: string }>}
 */
export const enableBiometricUnlockForAccount = async (accountId) => {
  const capability = await getBiometricCapability();
  if (!capability.available) {
    return { ok: false, reason: 'unavailable', label: capability.label };
  }

  const auth = await authenticateWithBiometric(
    `Confirm ${capability.label} to enable biometric unlock`,
  );

  if (!auth.success) {
    return { ok: false, reason: auth.error ?? 'failed', label: capability.label };
  }

  await setBiometricUnlockEnabled(accountId, true);
  return { ok: true, label: capability.label };
};
