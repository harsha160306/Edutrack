import {
  MPIN_SETUP_NOTIFICATION_ID,
  MPIN_SETUP_REMINDER_COPY,
} from './constants';

/**
 * Builds in-app notification list. MPIN setup reminder is pinned to the top when needed.
 * @param {{ shouldRemind?: boolean } | null} status
 */
export const buildAppNotifications = (status) => {
  if (!status?.shouldRemind) {
    return [];
  }

  const message = status.wasSkipped
    ? MPIN_SETUP_REMINDER_COPY.notificationMessage
    : 'Create a 4- or 6-digit PIN to protect quick sign-in on this device.';

  return [
    {
      id: MPIN_SETUP_NOTIFICATION_ID,
      type: 'mpin_setup',
      title: MPIN_SETUP_REMINDER_COPY.notificationTitle,
      message,
      actionLabel: MPIN_SETUP_REMINDER_COPY.notificationAction,
      isUnread: true,
      pinned: true,
    },
  ];
};

export const getUnreadNotificationCount = (notifications) =>
  notifications.filter((item) => item.isUnread).length;
