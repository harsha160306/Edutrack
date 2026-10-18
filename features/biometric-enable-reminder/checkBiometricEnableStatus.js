import { hasMpinForAccount } from '../../security/mpin/mpinStorage';
import { getBiometricCapability } from '../../security/mpin/biometricAuth';
import { isBiometricUnlockEnabled } from '../../security/mpin/biometricPreferences';

/**
 * @param {string} accountId
 * @returns {Promise<{
 *   mpinConfigured: boolean,
 *   biometricAvailable: boolean,
 *   biometricEnabled: boolean,
 *   shouldRemind: boolean,
 *   showTopBanner: boolean,
 *   hasUnreadNotification: boolean,
 *   biometricLabel: string,
 *   biometricKind: string,
 *   biometricEnrolled: boolean,
 *   biometricHasHardware: boolean,
 * }>}
 */
export const checkBiometricEnableStatus = async (accountId) => {
  const [mpinConfigured, capability, biometricEnabled] = await Promise.all([
    hasMpinForAccount(accountId),
    getBiometricCapability(),
    isBiometricUnlockEnabled(accountId),
  ]);

  const biometricAvailable = capability.available;
  const shouldRemind = mpinConfigured && biometricAvailable && !biometricEnabled;

  return {
    mpinConfigured,
    biometricAvailable,
    biometricEnabled,
    shouldRemind,
    showTopBanner: shouldRemind,
    hasUnreadNotification: shouldRemind,
    biometricLabel: capability.label,
    biometricKind: capability.kind,
    biometricEnrolled: capability.enrolled,
    biometricHasHardware: capability.hasHardware,
  };
};
