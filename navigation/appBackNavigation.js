/** Screens that show exit confirmation instead of navigating back. */
export const EXIT_ROOT_SCREENS = new Set(['role-select', 'dashboard']);

/**
 * Previous screen for in-app back (button, gesture, hardware back).
 * @param {string} appState
 * @param {{ scanReturnTo?: string }} [context]
 * @returns {string|null}
 */
export const getAppBackTarget = (appState, context = {}) => {
  const { scanReturnTo = 'dashboard' } = context;
  switch (appState) {
    case 'onboarding':
      return 'role-select';
    case 'login':
      return 'onboarding';
    case 'scanning':
      return scanReturnTo;
    case 'searching':
    case 'members':
    case 'marked':
    case 'latecomer-history':
    case 'student-attendance':
    case 'student-marks':
    case 'student-record':
    case 'student-notices':
    case 'student-profile':
    case 'faculty-notices':
    case 'faculty-profile':
    case 'settings':
      return 'dashboard';
    case 'mpin-change-verify':
    case 'change-password':
      return 'settings';
    case 'mpin-setup':
      return 'dashboard';
    default:
      return null;
  }
};

export const shouldPromptExitOnBack = (appState) => EXIT_ROOT_SCREENS.has(appState);
