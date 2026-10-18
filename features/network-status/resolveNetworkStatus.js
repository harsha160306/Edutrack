import {
  NETWORK_STATUS,
  NETWORK_FLAP_THRESHOLD,
  NETWORK_FLAP_WINDOW_MS,
} from './constants';

/**
 * Maps NetInfo state + recent connection flaps to online | network | offline.
 */
export const resolveNetworkStatus = (netState, flapTimestamps = []) => {
  const connected = netState?.isConnected === true;
  const reachable = netState?.isInternetReachable;
  const type = netState?.type;

  if (!connected || type === 'none') {
    return NETWORK_STATUS.OFFLINE;
  }

  const recentFlaps = flapTimestamps.filter(
    (t) => Date.now() - t < NETWORK_FLAP_WINDOW_MS,
  ).length;

  if (recentFlaps >= NETWORK_FLAP_THRESHOLD) {
    return NETWORK_STATUS.NETWORK;
  }

  if (reachable === false) {
    return NETWORK_STATUS.NETWORK;
  }

  if (reachable === null || reachable === undefined) {
    return NETWORK_STATUS.NETWORK;
  }

  return NETWORK_STATUS.ONLINE;
};
