import { clearSession } from '../session/sessionStorage';
import { clearMpinForAccount } from '../mpin/mpinStorage';
import { setBiometricUnlockEnabled } from '../mpin/biometricPreferences';
import { clearMpinSetupSkipped } from '../../features/mpin-setup-status/mpinSetupPreferences';
import { clearLatecomerQueue } from '../../features/faculty-offline-sync/latecomerQueueStorage';

/**
 * Removes all persisted auth & security data for this device on sign out.
 * @param {string} accountId — `faculty` | `student`
 */
export const clearAllStoredCredentials = async (accountId) => {
  const tasks = [
    clearSession(),
    clearMpinForAccount(accountId),
    clearMpinSetupSkipped(accountId),
    setBiometricUnlockEnabled(accountId, false),
  ];

  if (accountId === 'faculty') {
    tasks.push(clearLatecomerQueue('faculty'));
  }

  await Promise.all(tasks);
};
