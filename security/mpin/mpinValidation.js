import { MPIN_LENGTH, MPIN_LENGTH_OPTIONS, WEAK_MPINS } from './constants';

export const isValidMpinLength = (pinLength) => MPIN_LENGTH_OPTIONS.includes(pinLength);

export const isMpinComplete = (digits, pinLength = MPIN_LENGTH) =>
  digits.length === pinLength;

const isAllSameDigit = (pin) => /^(\d)\1+$/.test(pin);

const isSequentialPin = (pin) => {
  const digits = pin.split('').map(Number);
  let ascending = true;
  let descending = true;
  for (let i = 1; i < digits.length; i += 1) {
    if (digits[i] !== digits[i - 1] + 1) ascending = false;
    if (digits[i] !== digits[i - 1] - 1) descending = false;
  }
  return ascending || descending;
};

export const isWeakMpin = (pin) =>
  WEAK_MPINS.has(pin) || isAllSameDigit(pin) || isSequentialPin(pin);

export const validateNewMpin = (pin, pinLength = MPIN_LENGTH) => {
  const pattern = pinLength === 6 ? /^\d{6}$/ : /^\d{4}$/;
  if (!pattern.test(pin)) {
    return { ok: false, reason: 'invalid' };
  }
  if (isWeakMpin(pin)) {
    return { ok: false, reason: 'weak' };
  }
  return { ok: true };
};

export const mpinsMatch = (a, b, pinLength = MPIN_LENGTH) =>
  a === b && isMpinComplete(a, pinLength);
