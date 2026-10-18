import { useEffect, useRef, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { NETWORK_STATUS } from './constants';
import { getConnectionKind, CONNECTION_KIND } from './connectionKind';
import { resolveNetworkStatus } from './resolveNetworkStatus';

const INITIAL = {
  status: NETWORK_STATUS.NETWORK,
  connectionKind: CONNECTION_KIND.NONE,
};

/**
 * Subscribes to device connectivity.
 * @returns {{ status: string, connectionKind: string }}
 */
export const useNetworkStatus = () => {
  const [network, setNetwork] = useState(INITIAL);
  const flapTimestamps = useRef([]);
  const lastSnapshot = useRef(null);

  useEffect(() => {
    const applyState = (state) => {
      const prev = lastSnapshot.current;
      if (
        prev &&
        (prev.isConnected !== state.isConnected ||
          prev.isInternetReachable !== state.isInternetReachable ||
          prev.type !== state.type)
      ) {
        flapTimestamps.current.push(Date.now());
        flapTimestamps.current = flapTimestamps.current.filter(
          (t) => Date.now() - t < 10000,
        );
      }
      lastSnapshot.current = state;
      setNetwork({
        status: resolveNetworkStatus(state, flapTimestamps.current),
        connectionKind: getConnectionKind(state),
      });
    };

    const unsubscribe = NetInfo.addEventListener(applyState);

    NetInfo.fetch().then(applyState).catch(() => {
      setNetwork({
        status: NETWORK_STATUS.OFFLINE,
        connectionKind: CONNECTION_KIND.NONE,
      });
    });

    return () => unsubscribe();
  }, []);

  return network;
};
