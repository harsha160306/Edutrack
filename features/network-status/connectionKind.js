export const CONNECTION_KIND = {
  WIFI: 'wifi',
  CELLULAR: 'cellular',
  OTHER: 'other',
  NONE: 'none',
};

/** NetInfo `type` → wifi | cellular | other | none. */
export const getConnectionKind = (netState) => {
  const type = netState?.type;
  const connected = netState?.isConnected === true;

  if (!connected || type === 'none' || type === 'unknown') {
    return CONNECTION_KIND.NONE;
  }

  if (type === 'wifi') {
    return CONNECTION_KIND.WIFI;
  }

  if (type === 'cellular') {
    return CONNECTION_KIND.CELLULAR;
  }

  return CONNECTION_KIND.OTHER;
};
