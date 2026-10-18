export const NETWORK_STATUS = {
  ONLINE: 'online',
  NETWORK: 'network',
  OFFLINE: 'offline',
};

/** Visual config per status (icon color + label). */
export const NETWORK_STATUS_THEME = {
  [NETWORK_STATUS.ONLINE]: {
    label: 'online',
    color: '#16a34a',
  },
  [NETWORK_STATUS.NETWORK]: {
    label: 'network unstable',
    color: '#d97706',
  },
  [NETWORK_STATUS.OFFLINE]: {
    label: 'offline',
    color: '#dc2626',
  },
};

/** Header pill surface per status (light + dark). */
export const NETWORK_STATUS_PILL = {
  [NETWORK_STATUS.ONLINE]: {
    light: { backgroundColor: '#ECFDF5', borderColor: '#BBF7D0' },
    dark: { backgroundColor: '#1A3D32', borderColor: '#2D6B55' },
  },
  [NETWORK_STATUS.NETWORK]: {
    light: { backgroundColor: '#FFF7ED', borderColor: '#FED7AA' },
    dark: { backgroundColor: '#3D2E18', borderColor: '#8B6914' },
  },
  [NETWORK_STATUS.OFFLINE]: {
    light: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
    dark: { backgroundColor: '#3D1A1A', borderColor: '#8B3030' },
  },
};

/** Rapid flips within this window → unstable / "network". */
export const NETWORK_FLAP_WINDOW_MS = 8000;
export const NETWORK_FLAP_THRESHOLD = 2;
