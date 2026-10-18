import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Easing,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Rect, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { Lock } from 'lucide-react-native';
import { AnimatedColorLogoRing, GOOGLE_RING_COLORS, squircleRadiusForLogo } from '../../../components/logo_color_ring';
import { MPIN_LENGTH, MPIN_UNLOCK_COPY } from '../constants';
import { isMpinComplete } from '../mpinValidation';
import { getMpinLengthForAccount, verifyMpinForAccount } from '../mpinStorage';
import { getBiometricCapability, authenticateWithBiometric } from '../biometricAuth';
import {
  isBiometricUnlockEnabled,
  setBiometricUnlockEnabled,
} from '../biometricPreferences';
import { getMpinUi } from '../mpinTheme';
import { NetworkStatusBadge } from '../../../features/network-status';
import { MpinDots } from './MpinDots';
import { MpinKeypad } from './MpinKeypad';

export const MpinUnlockScreen = ({
  colors,
  accountId,
  onUnlocked,
  onSignOut,
  isDark: isDarkProp,
}) => {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isDark = isDarkProp ?? colors.text === '#f1f5f9';
  const ui = useMemo(() => getMpinUi(colors, isDark), [colors, isDark]);
  const isCompactAndroid = windowHeight <= 900 || windowWidth <= 400;
  const isUltraCompactAndroid = windowHeight <= 760 || windowWidth <= 360;
  const logoSize = isCompactAndroid ? 44 : BRAND_LOGO_SIZE;

  const [pinLength, setPinLength] = useState(null);
  const [digits, setDigits] = useState('');
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricKind, setBiometricKind] = useState('fingerprint');
  const [biometricLabel, setBiometricLabel] = useState('Biometrics');
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const lockPulse = useRef(new Animated.Value(0)).current;
  const autoBiometricTriedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const [length, capability, enabled] = await Promise.all([
        getMpinLengthForAccount(accountId),
        getBiometricCapability(),
        isBiometricUnlockEnabled(accountId),
      ]);

      if (cancelled) return;

      setPinLength(length ?? MPIN_LENGTH);
      setBiometricAvailable(capability.available);
      setBiometricEnabled(enabled && capability.available);
      setBiometricKind(capability.kind);
      setBiometricLabel(capability.label);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [accountId]);

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

  const handleBackspace = () => {
    setError('');
    setDigits((prev) => prev.slice(0, -1));
  };

  const runBiometricUnlock = useCallback(
    async (promptMessage) => {
      const result = await authenticateWithBiometric(promptMessage);
      if (result.success) {
        setError('');
        onUnlocked();
        return true;
      }
      if (result.error !== 'cancelled' && result.error !== 'unavailable') {
        setError('Biometric verification failed. Use your MPIN.');
      }
      return false;
    },
    [onUnlocked],
  );

  const verifyPin = useCallback(
    async (pin) => {
      setVerifying(true);
      try {
        const ok = await verifyMpinForAccount(accountId, pin);
        if (ok) {
          onUnlocked();
          return;
        }
        setError(MPIN_UNLOCK_COPY.wrongPin);
        triggerShake();
        resetEntry();
      } catch {
        setError('Could not verify MPIN. Try again.');
        resetEntry();
      } finally {
        setVerifying(false);
      }
    },
    [accountId, onUnlocked, resetEntry, triggerShake],
  );

  const handleDigit = (digit) => {
    if (!pinLength || verifying || digits.length >= pinLength) return;
    setError('');
    const next = `${digits}${digit}`;
    setDigits(next);
    if (!isMpinComplete(next, pinLength)) return;
    verifyPin(next);
  };

  const enableBiometricUnlock = useCallback(async () => {
    const ok = await runBiometricUnlock(`Confirm ${biometricLabel} to enable`);
    if (ok) {
      await setBiometricUnlockEnabled(accountId, true);
      setBiometricEnabled(true);
    }
  }, [accountId, biometricLabel, runBiometricUnlock]);

  const handleBiometricPress = useCallback(() => {
    if (!biometricAvailable) {
      Alert.alert('Unavailable', MPIN_UNLOCK_COPY.biometricUnavailable);
      return;
    }

    if (!biometricEnabled) {
      Alert.alert(
        MPIN_UNLOCK_COPY.enableBiometricTitle,
        MPIN_UNLOCK_COPY.enableBiometricMessage(biometricLabel),
        [
          { text: MPIN_UNLOCK_COPY.cancel, style: 'cancel' },
          { text: MPIN_UNLOCK_COPY.enable, onPress: enableBiometricUnlock },
        ],
      );
      return;
    }

    runBiometricUnlock(MPIN_UNLOCK_COPY.biometricPrompt);
  }, [
    biometricAvailable,
    biometricEnabled,
    biometricLabel,
    enableBiometricUnlock,
    runBiometricUnlock,
  ]);

  useEffect(() => {
    if (
      !pinLength ||
      !biometricAvailable ||
      !biometricEnabled ||
      autoBiometricTriedRef.current
    ) {
      return;
    }
    autoBiometricTriedRef.current = true;
    runBiometricUnlock(MPIN_UNLOCK_COPY.biometricPrompt);
  }, [pinLength, biometricAvailable, biometricEnabled, biometricLabel, runBiometricUnlock]);

  useEffect(() => {
    lockPulse.setValue(0);
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(lockPulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(lockPulse, {
          toValue: 0,
          duration: 900,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    pulseLoop.start();
    return () => pulseLoop.stop();
  }, [lockPulse]);

  const ready = pinLength !== null;

  const biometricHint = !biometricAvailable
    ? MPIN_UNLOCK_COPY.biometricUnavailable
    : biometricEnabled
      ? MPIN_UNLOCK_COPY.biometricEnabledHint
      : MPIN_UNLOCK_COPY.biometricDisabledHint;
  const lockPulseStyle = {
    transform: [
      {
        scale: lockPulse.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.11],
        }),
      },
    ],
    opacity: lockPulse.interpolate({
      inputRange: [0, 1],
      outputRange: [0.85, 1],
    }),
  };

  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: colors.background }]}
      edges={['top', 'bottom']}
    >
      <View style={styles.topBar}>
        <NetworkStatusBadge colors={colors} />
        <View style={styles.topBarFill} />
        <View style={styles.accountMenuWrap}>
          <TouchableOpacity
            onPress={() => setAccountMenuOpen((prev) => !prev)}
            style={styles.forgotBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.forgotText}>Forgot MPIN?</Text>
          </TouchableOpacity>
          {accountMenuOpen ? (
            <View
              style={[
                styles.accountMenu,
                {
                  backgroundColor: isDark ? '#0f172a' : '#ffffff',
                  borderColor: isDark ? '#334155' : '#cbd5e1',
                },
              ]}
            >
              <TouchableOpacity
                onPress={() => {
                  setAccountMenuOpen(false);
                  onSignOut?.();
                }}
                style={styles.accountMenuItem}
                activeOpacity={0.75}
              >
                <Text style={[styles.accountMenuText, { color: isDark ? '#e2e8f0' : '#0f172a' }]}>
                  {MPIN_UNLOCK_COPY.signOut}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </View>

      <View style={[styles.content, isCompactAndroid && styles.contentCompact]}>
        <View
          style={[
            styles.hero,
            isCompactAndroid && styles.heroCompact,
            isUltraCompactAndroid && styles.heroUltraCompact,
          ]}
          pointerEvents="box-none"
        >
          <View style={[styles.brandRow, isCompactAndroid && styles.brandRowCompact, { height: logoSize }]}>
            <View style={styles.brandLogoGlow}>
              <AnimatedColorLogoRing
                size={logoSize}
                borderWidth={2.2}
                squircleRx={squircleRadiusForLogo(logoSize, 2.2)}
                innerBackground="#ffffff"
                gradientId="mpinBrandRing"
              >
                <Image
                  source={require('../../../assets/mic-college-logo-square.png')}
                  style={styles.brandLogo}
                  resizeMode="cover"
                />
              </AnimatedColorLogoRing>
            </View>
            <BrandColorDivider height={logoSize} />
            <View style={styles.brandWordmarkWrap}>
              <Animated.View style={lockPulseStyle}>
                <Lock
                  size={isCompactAndroid ? 24 : 28}
                  color={isDark ? '#f8fafc' : '#0f172a'}
                  strokeWidth={2.25}
                />
              </Animated.View>
            </View>
          </View>

          <Text
            style={[
              styles.title,
              isCompactAndroid && styles.titleCompact,
              isUltraCompactAndroid && styles.titleUltraCompact,
              { color: colors.text },
            ]}
          >
            {MPIN_UNLOCK_COPY.title}
          </Text>
          <Text
            style={[
              styles.subtitle,
              isCompactAndroid && styles.subtitleCompact,
              isUltraCompactAndroid && styles.subtitleUltraCompact,
              { color: ui.mutedText },
            ]}
          >
            {ready ? MPIN_UNLOCK_COPY.subtitle(pinLength) : MPIN_UNLOCK_COPY.loading}
          </Text>
          {ready && biometricAvailable ? (
            <Text style={[styles.biometricHint, { color: ui.mutedText }]}>{biometricHint}</Text>
          ) : null}

          {ready ? (
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
          ) : (
            <ActivityIndicator color={colors.secondary} style={styles.loader} />
          )}
        </View>

        {ready ? (
          <View
            style={[
              styles.keypadSection,
              isCompactAndroid && styles.keypadSectionCompact,
              isUltraCompactAndroid && styles.keypadSectionUltraCompact,
            ]}
            pointerEvents="box-none"
          >
            <View style={styles.keypadWrap}>
              <MpinKeypad
                colors={colors}
                isDark={isDark}
                onDigit={handleDigit}
                onBackspace={handleBackspace}
                onBiometricPress={handleBiometricPress}
                disabled={verifying}
                showBiometric
                biometricEnabled={biometricEnabled}
                biometricAvailable={biometricAvailable}
                biometricKind={biometricKind}
              />
            </View>
          </View>
        ) : null}
      </View>
      {accountMenuOpen ? (
        <TouchableOpacity
          style={styles.menuBackdrop}
          onPress={() => setAccountMenuOpen(false)}
          activeOpacity={1}
        />
      ) : null}
    </SafeAreaView>
  );
};

const BRAND_DIVIDER_WIDTH = 3;
const DIVIDER_FLOW_MS = 5200;
const DIVIDER_FLOW_GRADIENT_ID = 'mpinDividerFlowGrad';
const BRAND_LOGO_SIZE = 50;
const BrandColorDivider = ({ height }) => {
  const flowProgress = useRef(new Animated.Value(0)).current;
  const clipHeight = height;
  const stripHeight = clipHeight * 2;

  useEffect(() => {
    flowProgress.setValue(0);
    const animation = Animated.loop(
      Animated.timing(flowProgress, {
        toValue: 1,
        duration: DIVIDER_FLOW_MS,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [flowProgress]);

  const translateY = flowProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [-clipHeight, 0],
  });

  return (
    <View style={[styles.brandDividerClip, { height: clipHeight }]} pointerEvents="none">
      <Animated.View
        style={[
          styles.brandDividerStrip,
          { height: stripHeight, transform: [{ translateY }], opacity: 0.85 },
        ]}
      >
        <Svg width={BRAND_DIVIDER_WIDTH} height={stripHeight}>
          <Defs>
            <SvgLinearGradient
              id={DIVIDER_FLOW_GRADIENT_ID}
              x1="0"
              y1="0"
              x2="0"
              y2={stripHeight}
              gradientUnits="userSpaceOnUse"
            >
              <Stop offset="0%" stopColor={GOOGLE_RING_COLORS[0]} />
              <Stop offset="12.5%" stopColor={GOOGLE_RING_COLORS[3]} />
              <Stop offset="25%" stopColor={GOOGLE_RING_COLORS[2]} />
              <Stop offset="37.5%" stopColor={GOOGLE_RING_COLORS[1]} />
              <Stop offset="50%" stopColor={GOOGLE_RING_COLORS[0]} />
              <Stop offset="62.5%" stopColor={GOOGLE_RING_COLORS[3]} />
              <Stop offset="75%" stopColor={GOOGLE_RING_COLORS[2]} />
              <Stop offset="87.5%" stopColor={GOOGLE_RING_COLORS[1]} />
              <Stop offset="100%" stopColor={GOOGLE_RING_COLORS[0]} />
            </SvgLinearGradient>
          </Defs>
          <Rect x={0} y={0} width={BRAND_DIVIDER_WIDTH} height={stripHeight} rx={2} fill={`url(#${DIVIDER_FLOW_GRADIENT_ID})`} />
        </Svg>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 4,
    paddingBottom: 4,
    width: '100%',
  },
  topBarFill: {
    flex: 1,
    minWidth: 8,
  },
  signOutBtn: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginLeft: 8,
  },
  forgotBtn: {
    marginLeft: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: 'transparent',
  },
  forgotText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ef4444',
    letterSpacing: 0.1,
  },
  signOutText: {
    fontSize: 15,
    fontWeight: '600',
  },
  accountMenuWrap: {
    position: 'relative',
    zIndex: 12,
  },
  accountMenu: {
    position: 'absolute',
    top: 46,
    right: 0,
    minWidth: 150,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  accountMenuItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  accountMenuText: {
    fontSize: 14,
    fontWeight: '700',
  },
  menuBackdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  contentCompact: {
    paddingHorizontal: 16,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 28,
  },
  heroCompact: {
    justifyContent: 'center',
    paddingBottom: 12,
  },
  heroUltraCompact: {
    paddingBottom: 6,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    height: BRAND_LOGO_SIZE,
    alignSelf: 'center',
  },
  brandRowCompact: {
    marginBottom: 10,
  },
  brandDividerClip: {
    width: BRAND_DIVIDER_WIDTH,
    marginHorizontal: 8,
    alignSelf: 'center',
    flexShrink: 0,
    borderRadius: 2,
    overflow: 'hidden',
  },
  brandDividerStrip: {
    width: BRAND_DIVIDER_WIDTH,
  },
  brandLogoGlow: {
    flexShrink: 0,
    shadowColor: '#4285F4',
    shadowOpacity: 0.28,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  brandLogo: {
    width: 36,
    height: 36,
    borderRadius: 11,
  },
  brandName: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.1,
    lineHeight: 22,
  },
  brandWordmarkWrap: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 2,
  },
  brandWordmarkImage: {
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  titleCompact: {
    fontSize: 22,
    letterSpacing: -0.2,
  },
  titleUltraCompact: {
    fontSize: 20,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 16,
    maxWidth: 320,
  },
  subtitleCompact: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
    paddingHorizontal: 10,
  },
  subtitleUltraCompact: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  biometricHint: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  error: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
    minHeight: 18,
    paddingHorizontal: 12,
  },
  errorPlaceholder: {
    minHeight: 22,
  },
  loader: {
    marginTop: 24,
  },
  keypadSection: {
    flexShrink: 0,
    paddingTop: 12,
    paddingBottom: 8,
    zIndex: 2,
  },
  keypadSectionCompact: {
    paddingTop: 8,
    paddingBottom: 4,
  },
  keypadSectionUltraCompact: {
    paddingTop: 4,
    paddingBottom: 2,
  },
  keypadWrap: {
    width: '100%',
    alignItems: 'center',
  },
});
