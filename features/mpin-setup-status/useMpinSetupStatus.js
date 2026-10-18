import { useCallback, useEffect, useState } from 'react';
import { checkMpinSetupStatus } from './checkMpinSetupStatus';
import { buildAppNotifications, getUnreadNotificationCount } from './buildMpinNotifications';

/**
 * @param {string | null} accountId
 * @param {number} [refreshKey] — bump from App when skip/complete MPIN
 */
export const useMpinSetupStatus = (accountId, refreshKey = 0) => {
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
      const next = await checkMpinSetupStatus(accountId);
      setStatus(next);
    } catch {
      setStatus({
        isConfigured: false,
        wasSkipped: false,
        shouldRemind: false,
        showTopBanner: false,
        hasUnreadNotification: false,
      });
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    refresh();
  }, [refresh, refreshKey]);

  const notifications = buildAppNotifications(status);
  const unreadCount = getUnreadNotificationCount(notifications);

  return {
    status,
    loading,
    notifications,
    unreadCount,
    refresh,
  };
};
