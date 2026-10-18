import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check } from 'lucide-react-native';
import {
  MPIN_SETUP_COPY,
  getMpinCreateSubtitle,
  getMpinWeakPinMessage,
} from '../constants';
import { isMpinComplete, mpinsMatch, validateNewMpin } from '../mpinValidation';
import { saveMpinForAccount } from '../mpinStorage';
import { getBiometricCapability } from '../biometricAuth';
import { getMpinUi } from '../mpinTheme';
import { BiometricEnablePromptModal } from '../../../features/biometric-enable-reminder';
import { enableBiometricUnlockForAccount } from '../../../features/biometric-enable-reminder/enableBiometricUnlock';
import { MpinDots } from './MpinDots';
import { MpinKeypad } from './MpinKeypad';

const STEPS = {
  CHOOSE_LENGTH: 'choose_length',
  CREATE: 'create',
  CONFIRM: 'confirm',
  SUCCESS: 'success',
};

const LENGTH_OPTIONS = [
  {
    value: 4,
    label: MPIN_SETUP_COPY.fourDigitLabel,
    hint: MPIN_SETUP_COPY.fourDigitHint,
  },
  {
    value: 6,
    label: MPIN_SETUP_COPY.sixDigitLabel,
    hint: MPIN_SETUP_COPY.sixDigitHint,
  },
];

export const MpinSetupScreen = ({
  colors,
  accountId,
  onComplete,
  onSkip,
  isDark: isDarkProp,
}) => {
  const isDark = isDarkProp ?? colors.text === '#f1f5f9';
  const ui = useMemo(() => getMpinUi(colors, isDark), [colors, isDark]);

  const [step, setStep] = useState(STEPS.CHOOSE_LENGTH);
  const [pinLength, setPinLength] = useState(null);
  const [digits, setDigits] = useState('');
  const [draftPin, setDraftPin] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricKind, setBiometricKind] = useState('fingerprint');
  const [biometricLabel, setBiometricLabel] = useState('Biometrics');
  const [biometricPromptVisible, setBiometricPromptVisible] = useState(false);
  const [biometricPromptDismissed, setBiometricPromptDismissed] = useState(false);
  const [enablingBiometric, setEnablingBiometric] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const finishingRef = useRef(false);

  useEffect(() => {
    getBiometricCapability().then((cap) => {
      setBiometricAvailable(cap.available);
      setBiometricKind(cap.kind);
      setBiometricLabel(cap.label);
    });
  }, []);

  useEffect(() => {
    if (step === STEPS.SUCCESS && biometricAvailable && !biometricPromptDismissed) {
      setBiometricPromptVisible(true);
    }
  }, [step, biometricAvailable, biometricPromptDismissed]);

  const triggerShake = useCallback(() => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  const resetEntry = useCallback(() => {
    setDigits('');
  }, []);

  const goToChooseLength = useCallback(() => {
    setStep(STEPS.CHOOSE_LENGTH);
    setPinLength(null);
    setDraftPin('');
    resetEntry();
    setError('');
  }, [resetEntry]);

  const selectPinLength = (length) => {
    setPinLength(length);
    setDraftPin('');
    resetEntry();
    setError('');
    setStep(STEPS.CREATE);
  };

  const handleBackspace = () => {
    setError('');
    setDigits((prev) => prev.slice(0, -1));
  };

  const handleDigit = (digit) => {
    if (!pinLength || digits.length >= pinLength) return;
    setError('');
    const next = `${digits}${digit}`;
    setDigits(next);
    if (!isMpinComplete(next, pinLength)) return;

    if (step === STEPS.CREATE) {
      const validation = validateNewMpin(next, pinLength);
      if (!validation.ok) {
        setError(getMpinWeakPinMessage(pinLength));
        triggerShake();
        resetEntry();
        return;
      }
      setDraftPin(next);
      resetEntry();
      setStep(STEPS.CONFIRM);
      return;
    }

    if (step === STEPS.CONFIRM) {
      if (!mpinsMatch(draftPin, next, pinLength)) {
        setError(MPIN_SETUP_COPY.mismatch);
        triggerShake();
        resetEntry();
        return;
      }
      setSaving(true);
      saveMpinForAccount(accountId, next, pinLength)
        .then(() => {
          setSaving(false);
          setStep(STEPS.SUCCESS);
        })
        .catch(() => {
          setSaving(false);
          setError('Could not save MPIN. Try again.');
          resetEntry();
        });
    }
  };

  const finishSetup = useCallback(async () => {
    if (finishingRef.current) return;
    finishingRef.current = true;
    setBiometricPromptVisible(false);
    setBiometricPromptDismissed(true);
    try {
      await onComplete?.();
    } catch {
      finishingRef.current = false;
    }
  }, [onComplete]);

  const dismissBiometricPrompt = useCallback(() => {
    setBiometricPromptDismissed(true);
    setBiometricPromptVisible(false);
  }, []);

  const handleEnableBiometric = async () => {
    setEnablingBiometric(true);
    try {
      const result = await enableBiometricUnlockForAccount(accountId);
      if (result.ok) {
        dismissBiometricPrompt();
        await finishSetup();
        return;
      }
      setBiometricPromptVisible(true);
    } finally {
      setEnablingBiometric(false);
    }
  };

  const handleSkipBiometric = () => {
    dismissBiometricPrompt();
    void finishSetup();
  };

  const handleContinuePress = () => {
    dismissBiometricPrompt();
    void finishSetup();
  };

  const isChoosingLength = step === STEPS.CHOOSE_LENGTH;
  const isSuccess = step === STEPS.SUCCESS;
  const showKeypad = !isChoosingLength && !isSuccess;

  const showContinueButton =
    isSuccess && !biometricPromptVisible && (!biometricAvailable || biometricPromptDismissed);

  const title = isChoosingLength
    ? MPIN_SETUP_COPY.chooseLengthTitle
    : step === STEPS.CREATE
      ? MPIN_SETUP_COPY.createTitle
      : step === STEPS.CONFIRM
        ? MPIN_SETUP_COPY.confirmTitle
        : MPIN_SETUP_COPY.successTitle;

  const subtitle = isChoosingLength
    ? MPIN_SETUP_COPY.chooseLengthSubtitle
    : step === STEPS.CREATE
      ? getMpinCreateSubtitle(pinLength)
      : step === STEPS.CONFIRM
        ? MPIN_SETUP_COPY.confirmSubtitle
        : MPIN_SETUP_COPY.successSubtitle;

  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: colors.background }]}
      edges={['top', 'bottom']}
    >
      <View style={styles.header}>
        {!isSuccess && onSkip ? (
          <TouchableOpacity onPress={onSkip} style={styles.skipBtn} activeOpacity={0.7}>
            <Text style={[styles.skipText, { color: ui.mutedText }]}>Skip</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.skipBtn} />
        )}
      </View>

      <View style={styles.content}>
        <View
          style={[styles.hero, (isSuccess || isChoosingLength) && styles.heroCentered]}
          pointerEvents={showKeypad ? 'box-none' : 'auto'}
        >
          {isSuccess ? (
            <View style={[styles.successIcon, { backgroundColor: `${colors.success}22` }]}>
              <Check color={colors.success} size={40} strokeWidth={3} />
            </View>
          ) : null}

          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.subtitle, { color: ui.mutedText }]}>{subtitle}</Text>

          {isChoosingLength ? (
            <View style={styles.lengthOptions}>
              {LENGTH_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.lengthCard,
                      {
                        backgroundColor: isDark ? '#1e293b' : colors.card,
                        borderColor: ui.keyBorder,
                      },
                    ]}
                    onPress={() => selectPinLength(option.value)}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel={option.label}
                  >
                    <View style={styles.lengthCardTop}>
                      <Text style={[styles.lengthValue, { color: colors.text }]}>
                        {option.value}
                      </Text>
                      <Text style={[styles.lengthDigitsWord, { color: ui.mutedText }]}>
                        digits
                      </Text>
                    </View>
                    <Text style={[styles.lengthLabel, { color: colors.text }]}>
                      {option.label}
                    </Text>
                    <Text style={[styles.lengthHint, { color: ui.mutedText }]}>
                      {option.hint}
                    </Text>
                  </TouchableOpacity>
              ))}
            </View>
          ) : null}

          {showKeypad ? (
            <>
              <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
                <MpinDots
                  length={digits.length}
                  pinLength={pinLength}
                  colors={colors}
                  isDark={isDark}
                />
              </Animated.View>
              {error ? (
                <Text style={[styles.error, { color: '#ef4444' }]}>{error}</Text>
              ) : (
                <View style={styles.errorPlaceholder} />
              )}
            </>
          ) : null}

          {showContinueButton ? (
            <Pressable
              style={({ pressed }) => [
                styles.doneBtn,
                styles.doneBtnInteractive,
                {
                  backgroundColor: colors.secondary,
                  opacity: pressed ? 0.88 : 1,
                },
              ]}
              onPress={handleContinuePress}
              accessibilityRole="button"
              accessibilityLabel={MPIN_SETUP_COPY.continueLabel}
            >
              <Text style={styles.doneBtnText}>{MPIN_SETUP_COPY.continueLabel}</Text>
            </Pressable>
          ) : null}
        </View>

        {showKeypad ? (
          <View style={styles.keypadSection} pointerEvents="box-none">
            {saving ? (
              <ActivityIndicator color={colors.secondary} style={styles.loader} />
            ) : (
              <View style={styles.keypadWrap}>
                <MpinKeypad
                  colors={colors}
                  isDark={isDark}
                  onDigit={handleDigit}
                  onBackspace={handleBackspace}
                  disabled={saving}
                  showBiometric
                  biometricEnabled={false}
                  biometricAvailable={biometricAvailable}
                  biometricKind={biometricKind}
                />
              </View>
            )}
          </View>
        ) : null}
      </View>

      {!isSuccess && !isChoosingLength && step === STEPS.CONFIRM ? (
        <TouchableOpacity
          style={styles.backStep}
          onPress={() => {
            setStep(STEPS.CREATE);
            resetEntry();
            setError('');
          }}
        >
          <Text style={[styles.backStepText, { color: colors.secondary }]}>Change PIN</Text>
        </TouchableOpacity>
      ) : null}

      {!isSuccess && !isChoosingLength && step === STEPS.CREATE ? (
        <TouchableOpacity style={styles.backStep} onPress={goToChooseLength}>
          <Text style={[styles.backStepText, { color: colors.secondary }]}>
            {MPIN_SETUP_COPY.changeLengthLabel}
          </Text>
        </TouchableOpacity>
      ) : null}

      {biometricPromptVisible && isSuccess ? (
        <BiometricEnablePromptModal
          visible
          colors={colors}
          isDark={isDark}
          biometricLabel={biometricLabel}
          enabling={enablingBiometric}
          onEnable={handleEnableBiometric}
          onNotNow={handleSkipBiometric}
        />
      ) : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingTop: 4,
    paddingBottom: 4,
    alignItems: 'flex-end',
  },
  skipBtn: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    minWidth: 48,
  },
  skipText: {
    fontSize: 15,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 8,
    paddingBottom: 28,
  },
  heroCentered: {
    justifyContent: 'center',
    paddingBottom: 0,
  },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 16,
    maxWidth: 320,
  },
  lengthOptions: {
    width: '100%',
    maxWidth: 340,
    marginTop: 28,
    gap: 14,
  },
  lengthCard: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1.5,
    paddingVertical: 18,
    paddingHorizontal: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
      default: {},
    }),
  },
  lengthCardTop: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  lengthValue: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
    marginRight: 6,
  },
  lengthDigitsWord: {
    fontSize: 15,
    fontWeight: '600',
  },
  lengthLabel: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  lengthHint: {
    fontSize: 13,
    lineHeight: 18,
  },
  error: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 4,
    minHeight: 18,
    paddingHorizontal: 12,
  },
  errorPlaceholder: {
    minHeight: 22,
  },
  keypadSection: {
    width: '100%',
    flexShrink: 0,
    paddingTop: 12,
    paddingBottom: 8,
    zIndex: 2,
  },
  keypadWrap: {
    width: '100%',
    alignItems: 'center',
  },
  loader: {
    marginVertical: 40,
  },
  doneBtn: {
    marginTop: 28,
    width: '100%',
    maxWidth: 320,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnInteractive: {
    zIndex: 10,
    ...Platform.select({
      web: { cursor: 'pointer' },
      default: {},
    }),
  },
  doneBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  backStep: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  backStepText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
