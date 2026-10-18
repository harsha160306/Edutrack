import NetInfo from '@react-native-community/netinfo';
import { NETWORK_STATUS } from '../features/network-status/constants';

export const OFFLINE_ALERT_TITLE = 'No network';

export const OFFLINE_ALERT_MESSAGE =
  'Status: offline. Connect to the internet, then tap Reload to check again.';

/** True when there is no usable internet (fully offline). */
export const isOfflineStatus = (status) => status === NETWORK_STATUS.OFFLINE;

/** @deprecated use isOfflineStatus */
export const isEmailEntryBlocked = isOfflineStatus;

/** True when sign-in / OTP request can proceed. */
export const isNetworkAvailable = (status) => !isOfflineStatus(status);

/** @deprecated use isNetworkAvailable */
export const isEmailEntryAllowed = isNetworkAvailable;

export const reloadNetworkCheck = () => NetInfo.refresh();
