import { Alert } from 'react-native';

/** Practical RFC-style check: local@domain.tld */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const INVALID_EMAIL_MESSAGE = 'Not a valid email';

/**
 * @param {string} email
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  const normalized = String(email ?? '').trim().toLowerCase();
  if (!normalized || normalized.length > 254) {
    return false;
  }
  return EMAIL_PATTERN.test(normalized);
};

export const showInvalidEmailAlert = () => {
  Alert.alert('Invalid email', INVALID_EMAIL_MESSAGE);
};

/**
 * @param {string} email
 * @returns {boolean} true when valid
 */
export const requireValidEmail = (email) => {
  if (isValidEmail(email)) {
    return true;
  }
  showInvalidEmailAlert();
  return false;
};
