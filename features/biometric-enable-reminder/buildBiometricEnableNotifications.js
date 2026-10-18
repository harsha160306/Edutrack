import { BIOMETRIC_ENABLE_NOTIFICATION_ID, BIOMETRIC_ENABLE_COPY } from './constants';

/**
 * @param {{ shouldRemind?: boolean, biometricLabel?: string } | null} status
 */
export const buildBiometricEnableNotifications = (status) => {
  if (!status?.shouldRemind) {
    return [];
  }

  const label = status.biometricLabel ?? 'Biometrics';

  return [
    {
      id: BIOMETRIC_ENABLE_NOTIFICATION_ID,
      type: 'biometric_enable',
      title: BIOMETRIC_ENABLE_COPY.notificationTitle,
      message: BIOMETRIC_ENABLE_COPY.notificationMessage(label),
      actionLabel: BIOMETRIC_ENABLE_COPY.notificationAction,
      isUnread: true,
      pinned: true,
    },
  ];
};

export const isBiometricEnableNotification = (item) =>
  item?.id === BIOMETRIC_ENABLE_NOTIFICATION_ID || item?.type === 'biometric_enable';
