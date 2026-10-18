import { Wifi, WifiOff, Signal, Globe } from 'lucide-react-native';
import { NETWORK_STATUS } from './constants';
import { CONNECTION_KIND } from './connectionKind';

/** Icon for badge from status + connection kind (wifi vs mobile data). */
export const getNetworkStatusIcon = (status, connectionKind) => {
  if (status === NETWORK_STATUS.OFFLINE) {
    return WifiOff;
  }

  switch (connectionKind) {
    case CONNECTION_KIND.CELLULAR:
      return Signal;
    case CONNECTION_KIND.WIFI:
      return Wifi;
    case CONNECTION_KIND.OTHER:
      return Globe;
    default:
      return Wifi;
  }
};
