import { useCallback, useEffect, useState } from 'react';
import { BIOMETRIC_KIND } from '../../security/mpin/biometricAuth';
import { checkBiometricEnableStatus } from './checkBiometricEnableStatus';
import { buildBiometricEnableNotifications } from './buildBiometricEnableNotifications';

/**
 * @param {string | null} accountId
 * @param {number} [refreshKey]
 */
export const useBiometricEnableReminder = (accountId, refreshKey = 0) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!accountId) {
      setStatus(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const next = await checkBiometricEnableStatus(accountId);
      setStatus(next);
    } catch {
      setStatus({
        mpinConfigured: false,
        biometricAvailable: false,
        biometricEnabled: false,
        shouldRemind: false,
        showTopBanner: false,
        hasUnreadNotification: false,
        biometricLabel: 'Biometrics',
        biometricKind: BIOMETRIC_KIND.UNKNOWN,
        biometricEnrolled: false,
        biometricHasHardware: false,
      });
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    refresh();
  }, [refresh, refreshKey]);

  const notifications = buildBiometricEnableNotifications(status);

  return {
    status,
    loading,
    notifications,
    refresh,
  };
};
