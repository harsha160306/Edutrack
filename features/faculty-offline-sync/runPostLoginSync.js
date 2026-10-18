import NetInfo from '@react-native-community/netinfo';
import { resolveNetworkStatus } from '../network-status/resolveNetworkStatus';
import { NETWORK_STATUS } from '../network-status/constants';
import { isOfflineStatus } from '../../security/networkGate';
import { syncPendingLatecomerMarks } from './syncLatecomerMarks';
import { recordFacultyLastSync } from './latecomerQueueStorage';

export const fetchCurrentNetworkStatus = async () => {
  try {
    const state = await NetInfo.fetch();
    return resolveNetworkStatus(state, []);
  } catch {
    return NETWORK_STATUS.OFFLINE;
  }
};

/**
 * After credential or MPIN sign-in: sync faculty queue when online, or flag offline alert.
 * @param {{ accountId: string, role: string }} params
 */
export const runPostLoginSync = async ({ accountId, role }) => {
  const networkStatus = await fetchCurrentNetworkStatus();

  if (isOfflineStatus(networkStatus)) {
    return { showOfflineAlert: true, networkStatus };
  }

  if (role === 'student') {
    return { showOfflineAlert: false, networkStatus, syncResult: null };
  }

  const syncResult = await syncPendingLatecomerMarks(accountId, networkStatus);
  await recordFacultyLastSync(accountId);
  return { showOfflineAlert: false, networkStatus, syncResult };
};
