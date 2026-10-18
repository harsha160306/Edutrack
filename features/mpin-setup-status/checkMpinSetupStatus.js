import { hasMpinForAccount } from '../../security/mpin';
import { wasMpinSetupSkipped } from './mpinSetupPreferences';

/**
 * @param {string} accountId
 * @returns {Promise<{
 *   isConfigured: boolean,
 *   wasSkipped: boolean,
 *   shouldRemind: boolean,
 *   showTopBanner: boolean,
 *   hasUnreadNotification: boolean,
 * }>}
 */
export const checkMpinSetupStatus = async (accountId) => {
  const [isConfigured, wasSkipped] = await Promise.all([
    hasMpinForAccount(accountId),
    wasMpinSetupSkipped(accountId),
  ]);

  const shouldRemind = !isConfigured;

  return {
    isConfigured,
    wasSkipped,
    shouldRemind,
    showTopBanner: shouldRemind,
    hasUnreadNotification: shouldRemind,
  };
};
