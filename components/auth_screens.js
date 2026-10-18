import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Platform, 
  KeyboardAvoidingView, 
  ScrollView,
  useWindowDimensions,
  Animated,
  Easing,
  Pressable, 
  Keyboard,
  TouchableWithoutFeedback,
  Image,
} from 'react-native';
import { 
  Eye, 
  EyeOff, 
  Pencil, 
  RefreshCcw, 
  UserRound, 
  Shield,
  ChevronRight,
} from 'lucide-react-native';
import { AnimatedColorLogoRing } from './logo_color_ring';
import {
  BRAND_SERIF_FONT,
  getBrandCollegeNameDisplayText,
  getBrandCollegeNameFontSize,
} from './brand_header';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlowTopBar, useNetworkStatus } from '../features/network-status';
import { NETWORK_STATUS } from '../features/network-status/constants';
import { useEdgeSwipeBack } from '../hooks/useEdgeSwipeBack';
import { isValidEmail, requireValidEmail } from '../security/emailValidation';
import {
  isOfflineStatus,
  isNetworkAvailable,
  reloadNetworkCheck,
  OFFLINE_ALERT_TITLE,
  OFFLINE_ALERT_MESSAGE,
} from '../security/networkGate';
import { AppleAlertModal } from './AppleAlertModal';
import Svg, { Path } from 'react-native-svg';

const micCollegeLogoSquare = require('../assets/mic-college-logo-square.png');
const { formatVersionCompact, getLoginCopyrightLine } = require('../constants/appInfo');
const LOGO_SQUARE_BG = '#ffffff';
const LOGIN_LOGO_SIZE = 72;

const GoogleIcon = () => (
  <Svg width="18" height="18" viewBox="0 0 24 24">
    <Path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <Path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <Path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.16H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.84l3.66-2.75z"
      fill="#FBBC05"
    />
    <Path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.16l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </Svg>
);

// Create an animated version of TextInput
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const getLoginUi = (colors, isDark) => ({
  inputGroupBg: isDark ? '#1e293b' : colors.card,
  labelColor: isDark ? '#94a3b8' : '#64748b',
  btnDisabledBg: isDark ? '#334155' : '#e2e8f0',
  btnDisabledText: isDark ? '#94a3b8' : '#475569',
  footerText: isDark ? colors.textMuted : '#64748b',
  privacyText: isDark ? colors.textMuted : '#64748b',
  shieldBg: isDark ? '#334155' : '#f1f5f9',
  shieldColor: isDark ? '#e2e8f0' : '#334155',
  resendMuted: isDark ? '#94a3b8' : '#64748b',
});

export const LoginScreen = ({ colors, role = 'faculty', onLogin, onBack, isDark: isDarkProp }) => {
  const { width: windowWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { status: networkStatus } = useNetworkStatus();
  const isOffline = isOfflineStatus(networkStatus);
  const prevNetworkStatusRef = useRef(networkStatus);
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [showPassword, setShowPassword] = useState(false);
  const [countdown, setCountdown] = useState(60);
  
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [offlineAlertVisible, setOfflineAlertVisible] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [signInError, setSignInError] = useState('');
  
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const otpRefs = useRef([]);

  // Animation values for smooth floating transitions
  const emailLabelAnim = useRef(new Animated.Value(0)).current;
  const passLabelAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // Animate email label position
  useEffect(() => {
    Animated.timing(emailLabelAnim, {
      toValue: (isEmailFocused || email.length > 0) ? 1 : 0,
      duration: 180,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [isEmailFocused, email]);

  // Animate password label position
  useEffect(() => {
    Animated.timing(passLabelAnim, {
      toValue: (isPasswordFocused || password.length > 0) ? 1 : 0,
      duration: 180,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [isPasswordFocused, password]);

  useEffect(() => {
    let timer;
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  useEffect(() => {
    const becameOffline =
      networkStatus === NETWORK_STATUS.OFFLINE &&
      prevNetworkStatusRef.current !== NETWORK_STATUS.OFFLINE;

    if (becameOffline && (step === 'email' || step === 'password')) {
      Keyboard.dismiss();
      emailInputRef.current?.blur();
      passwordInputRef.current?.blur();
      setIsEmailFocused(false);
      setIsPasswordFocused(false);
      openOfflineAlert();
    }

    prevNetworkStatusRef.current = networkStatus;
  }, [networkStatus, step]);

  const handleContinue = async () => {
    Keyboard.dismiss();
    if (step === 'email') {
      if (!isNetworkAvailable(networkStatus)) {
        openOfflineAlert();
        return;
      }
      if (!requireValidEmail(email)) return;
      setSignInError('');
      setStep('password');
    } else if (step === 'password') {
      if (password.length <= 3) return;
      if (!isNetworkAvailable(networkStatus)) {
        openOfflineAlert();
        return;
      }
      setSigningIn(true);
      setSignInError('');
      try {
        await onLogin?.({ email: email.trim(), password });
      } catch (err) {
        setSignInError(err?.message ?? 'Sign in failed. Try again.');
      } finally {
        setSigningIn(false);
      }
    }
    else if (step === 'otp' && otp.every(d => d !== '')) onLogin();
  };

  const handleOtpChange = (val, index) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[index] = val.slice(-1);
    setOtp(newOtp);
    if (val && index < 5) otpRefs.current[index + 1].focus();
  };

  const isDark = isDarkProp ?? colors.text === '#f1f5f9';
  const ui = useMemo(() => getLoginUi(colors, isDark), [colors, isDark]);

  const openOfflineAlert = () => setOfflineAlertVisible(true);
  const closeOfflineAlert = () => setOfflineAlertVisible(false);

  const handleOfflineReload = () => {
    reloadNetworkCheck();
  };

  useEffect(() => {
    if (offlineAlertVisible && isNetworkAvailable(networkStatus)) {
      setOfflineAlertVisible(false);
    }
  }, [networkStatus, offlineAlertVisible]);

  const canContinue =
    step === 'email'
      ? isValidEmail(email) && !isOffline
      : step === 'password'
        ? password.length > 3 && !isOffline && !signingIn
        : otp.every((d) => d !== '');

  const handleEmailPress = () => {
    if (step !== 'email') return;
    if (!isNetworkAvailable(networkStatus)) {
      openOfflineAlert();
      return;
    }
    emailInputRef.current?.focus();
  };

  const handlePasswordPress = () => {
    if (step !== 'password') return;
    if (!isNetworkAvailable(networkStatus)) {
      openOfflineAlert();
      return;
    }
    passwordInputRef.current?.focus();
  };

  const getBorderColor = () => {
    if (isEmailFocused || isPasswordFocused) return colors.secondary;
    return colors.border;
  };

  const handleBackPress = () => {
    Keyboard.dismiss();
    onBack?.();
  };

  const edgeSwipeBack = useEdgeSwipeBack(onBack ? handleBackPress : null, Boolean(onBack));
  const collegeNameFontSize = getBrandCollegeNameFontSize(windowWidth - 64);
  const showGoogleButton =
    step === 'email' && email.length === 0 && !isEmailFocused && !isKeyboardVisible;

  const handleGooglePress = () => {
    Keyboard.dismiss();
    if (!isNetworkAvailable(networkStatus)) {
      openOfflineAlert();
      return;
    }
    onLogin?.();
  };

  const primaryButton = (
    <View style={[styles.buttonGroup, !showGoogleButton && styles.buttonGroupSingle]}>
      <View style={showGoogleButton ? styles.actionBtnSplit : styles.actionBtnFull}>
        <TouchableOpacity
          style={[
            styles.mainBtn,
            styles.mainBtnFill,
            {
              backgroundColor: canContinue ? colors.secondary : ui.btnDisabledBg,
            },
          ]}
          onPress={handleContinue}
          activeOpacity={0.8}
          disabled={!canContinue}
        >
          <Text style={[styles.mainBtnText, { color: canContinue ? '#fff' : ui.btnDisabledText }]}>
            {step === 'email' ? 'Continue' : step === 'password' ? 'Sign In' : 'Verify'}
          </Text>
        </TouchableOpacity>
      </View>

      {showGoogleButton ? (
        <View style={styles.actionBtnSplit}>
          <TouchableOpacity
            style={[
              styles.socialBtn,
              styles.mainBtnFill,
              {
                backgroundColor: isDark ? '#1e293b' : '#1e293b',
                borderColor: isDark ? colors.border : '#334155',
              },
            ]}
            onPress={handleGooglePress}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Sign in with Google"
          >
            <GoogleIcon />
            <Text style={styles.socialText}>Google</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );

  return (
    <>
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={[styles.container, { backgroundColor: colors.background }]}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        {...(onBack ? edgeSwipeBack.panHandlers : {})}
      >
        <FlowTopBar
          colors={colors}
          onBack={onBack ? handleBackPress : undefined}
          reserveLeadingSpace={!onBack}
          paddingHorizontal={24}
        />

        <ScrollView 
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: 20,
              paddingBottom: isKeyboardVisible ? 24 : 8,
            },
          ]}
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false} 
          keyboardShouldPersistTaps="handled"
        >
          
          <View style={styles.brandBlock}>
            <View style={styles.logoHeader}>
              <AnimatedColorLogoRing
                size={LOGIN_LOGO_SIZE}
                borderWidth={3}
                innerBackground={LOGO_SQUARE_BG}
                gradientId="loginBrandRing"
              >
                <Image
                  source={micCollegeLogoSquare}
                  style={styles.loginLogoImage}
                  resizeMode="cover"
                  accessibilityLabel="MIC College logo"
                />
              </AnimatedColorLogoRing>
            </View>
            <Text
              style={[styles.collegeLine, { color: colors.primary }]}
              allowFontScaling={false}
            >
              DVR & DR. HS
            </Text>
            <View style={styles.collegeNameWrap}>
              <Text
                style={[
                  styles.collegeName,
                  {
                    color: colors.text,
                    fontSize: collegeNameFontSize,
                    lineHeight: collegeNameFontSize + 4,
                  },
                ]}
                allowFontScaling={false}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.5}
              >
                {getBrandCollegeNameDisplayText()}
              </Text>
            </View>
          </View>

          <View style={styles.headerArea}>
            <Text style={[styles.title, { color: colors.text }]}>
              {step === 'email' ? 'Sign In' : step === 'password' ? 'Enter Password' : 'Verify Identity'}
            </Text>

            {step === 'otp' && (
              <View style={styles.otpSub}>
                <Text style={[styles.otpSubText, { color: colors.textMuted }]}>Enter the 6-digit code sent to:</Text>
                <View style={styles.emailEdit}>
                  <Text style={styles.emailTarget}>{email || 'faculty@mic.edu'}</Text>
                  <TouchableOpacity onPress={() => setStep('email')} style={styles.editBtn}>
                    <Pencil size={12} color={colors.secondary} strokeWidth={3} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          <View style={styles.formArea}>
            {step !== 'otp' ? (
              <View style={[styles.inputGroup, { backgroundColor: ui.inputGroupBg, borderColor: getBorderColor() }]}>
                {/* Email Input */}
                <Pressable 
                  style={[
                    styles.inputItem,
                    step === 'password' && styles.disabledInput,
                    step === 'email' && isOffline && styles.disabledInput,
                  ]}
                  onPress={handleEmailPress}
                >
                  <Animated.Text 
                    pointerEvents="none"
                    style={[
                      styles.label, 
                      { 
                        color: ui.labelColor,
                        top: emailLabelAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 8] }),
                        fontSize: emailLabelAnim.interpolate({ inputRange: [0, 1], outputRange: [15, 10] }),
                        opacity: emailLabelAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: isDark ? [0.6, 1] : [0.75, 1],
                        }),
                        textTransform: (isEmailFocused || email.length > 0) ? 'uppercase' : 'none'
                      }
                    ]}
                  >
                    Email Address
                  </Animated.Text>
                  <View style={styles.inputRow}>
                     <TextInput 
                       ref={emailInputRef}
                       style={[styles.input, { color: colors.text }]}
                       value={email}
                       onChangeText={setEmail}
                       onFocus={() => setIsEmailFocused(true)}
                       onBlur={() => setIsEmailFocused(false)}
                       editable={step === 'email' && !isOffline}
                       autoCapitalize="none"
                       keyboardType="email-address"
                       selectionColor={colors.secondary}
                       spellCheck={false}
                       autoCorrect={false}
                       underlineColorAndroid="transparent"
                     />
                     {step === 'password' && (
                       <TouchableOpacity onPress={() => setStep('email')}>
                         <ChevronRight size={18} color={colors.secondary} style={{ transform: [{rotate: '180deg'}] }} strokeWidth={3} />
                       </TouchableOpacity>
                     )}
                  </View>
                </Pressable>
                
                {/* Password Input */}
                {step === 'password' && (
                  <Pressable 
                    style={[
                      styles.inputItem,
                      styles.borderTop,
                      { borderTopColor: colors.border },
                      isOffline && styles.disabledInput,
                    ]}
                    onPress={handlePasswordPress}
                  >
                    <Animated.Text 
                      pointerEvents="none"
                      style={[
                        styles.label, 
                        { 
                          color: ui.labelColor,
                          top: passLabelAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 8] }),
                          fontSize: passLabelAnim.interpolate({ inputRange: [0, 1], outputRange: [15, 10] }),
                          opacity: passLabelAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: isDark ? [0.6, 1] : [0.75, 1],
                          }),
                          textTransform: (isPasswordFocused || password.length > 0) ? 'uppercase' : 'none'
                        }
                      ]}
                    >
                      Password
                    </Animated.Text>
                    <View style={styles.inputRow}>
                      <TextInput 
                        ref={passwordInputRef}
                        style={[styles.input, { color: colors.text }]}
                        value={password}
                        onChangeText={setPassword}
                        onFocus={() => setIsPasswordFocused(true)}
                        onBlur={() => setIsPasswordFocused(false)}
                        editable={!isOffline}
                        secureTextEntry={!showPassword}
                        selectionColor={colors.secondary}
                        underlineColorAndroid="transparent"
                        autoFocus
                        spellCheck={false}
                        autoCorrect={false}
                      />
                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff size={18} color={colors.secondary} strokeWidth={2.5} /> : <Eye size={18} color={colors.secondary} strokeWidth={2.5} />}
                      </TouchableOpacity>
                    </View>
                  </Pressable>
                )}
              </View>
            ) : (
              <View style={styles.otpGrid}>
                {otp.map((d, i) => (
                  <TextInput 
                    key={i}
                    ref={el => otpRefs.current[i] = el}
                    style={[styles.otpInput, { backgroundColor: colors.cardAlt, borderColor: colors.border, color: colors.text }]}
                    keyboardType="numeric"
                    maxLength={1}
                    value={d}
                    onChangeText={v => handleOtpChange(v, i)}
                    onKeyPress={({ nativeEvent }) => {
                      if (nativeEvent.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i-1].focus();
                    }}
                  />
                ))}
              </View>
            )}

            {step !== 'otp' && (
              <>
                {signInError ? (
                  <Text style={[styles.signInErrorText, { color: '#ef4444' }]}>{signInError}</Text>
                ) : null}
                <TouchableOpacity style={styles.forgotBtn}>
                  <Text style={styles.forgotText}>Forgot password?</Text>
                </TouchableOpacity>
              </>
            )}

            {step === 'otp' && (
              <View style={styles.resendArea}>
                {countdown > 0 ? (
                  <Text style={[styles.resendText, { color: ui.resendMuted }]}>
                    Resend code in{' '}
                    <Text style={{ color: colors.secondary, fontWeight: '900' }}>
                      0:{countdown.toString().padStart(2, '0')}
                    </Text>
                  </Text>
                ) : (
                  <TouchableOpacity style={styles.resendBtn} onPress={() => setCountdown(60)}>
                     <RefreshCcw size={14} color={colors.secondary} strokeWidth={3} />
                     <Text style={styles.resendBtnText}>Resend Verification Code</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>

          {isKeyboardVisible ? primaryButton : null}
        </ScrollView>

        {!isKeyboardVisible ? (
          <View
            style={[
              styles.bottomDock,
              {
                backgroundColor: colors.background,
                paddingBottom: Math.max(insets.bottom, 8),
              },
            ]}
          >
            {primaryButton}
            <View style={styles.privacyContainer}>
              <View style={styles.privacyIcons}>
                <View style={[styles.iconCircle, { backgroundColor: '#3b82f6', zIndex: 2, borderColor: '#ffffff' }]}>
                  <UserRound size={16} color="#ffffff" fill="#ffffff" />
                </View>
                <View
                  style={[
                    styles.iconCircle,
                    {
                      backgroundColor: ui.shieldBg,
                      marginLeft: -10,
                      zIndex: 1,
                      borderColor: isDark ? '#ffffff' : colors.card,
                    },
                  ]}
                >
                  <Shield size={16} color={ui.shieldColor} fill={ui.shieldColor} />
                </View>
              </View>
              <Text style={[styles.privacyText, { color: ui.privacyText }]}>
                {role === 'student'
                  ? 'Your Student Account information is used to sign in securely and view your discipline records.'
                  : 'Your Faculty Account information is used to allow you to sign in securely and access student records.'}{' '}
                <Text style={{ color: colors.secondary, fontWeight: '700' }}>
                  See how your data is managed...
                </Text>
              </Text>
            </View>

            <View style={styles.versionFooter}>
              <Text style={[styles.versionText, { color: ui.footerText }]}>
                {formatVersionCompact()}
              </Text>
              <Text style={[styles.copyrightText, { color: ui.footerText, opacity: isDark ? 0.8 : 1 }]}>
                {getLoginCopyrightLine()}
              </Text>
            </View>
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>

    <AppleAlertModal
      visible={offlineAlertVisible}
      title={OFFLINE_ALERT_TITLE}
      message={OFFLINE_ALERT_MESSAGE}
      colors={colors}
      isDark={isDark}
      dismissOnBackdrop={false}
      buttons={[{ label: 'Reload', style: 'default', onPress: handleOfflineReload }]}
    />
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 32,
    alignItems: 'stretch',
  },
  bottomDock: {
    paddingHorizontal: 32,
    paddingTop: 4,
  },
  brandBlock: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  collegeLine: {
    marginTop: 14,
    fontFamily: BRAND_SERIF_FONT,
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    textAlign: 'center',
    ...Platform.select({
      android: { includeFontPadding: false },
      default: {},
    }),
  },
  collegeNameWrap: {
    width: '100%',
    marginTop: 4,
    paddingHorizontal: 2,
    alignSelf: 'stretch',
  },
  collegeName: {
    width: '100%',
    fontFamily: BRAND_SERIF_FONT,
    fontWeight: '800',
    letterSpacing: Platform.select({ web: 0.5, ios: 0.35, android: 0.25, default: 0.4 }),
    textTransform: 'uppercase',
    textAlign: 'center',
    ...Platform.select({
      web: {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      },
      android: { includeFontPadding: false },
      default: {},
    }),
  },
  logoHeader: {
    alignItems: 'center',
  },
  loginLogoImage: {
    backgroundColor: LOGO_SQUARE_BG,
  },
  headerArea: { alignItems: 'flex-start', marginBottom: 20, width: '100%' },
  title: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1,
    textAlign: 'left',
    alignSelf: 'flex-start',
    width: '100%',
  },
  otpSub: { alignItems: 'flex-start', marginTop: 8, width: '100%' },
  otpSubText: { fontSize: 11, fontWeight: '600' },
  emailEdit: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  emailTarget: { fontSize: 11, fontWeight: 'bold', color: '#3b82f6', marginRight: 6 },
  formArea: { width: '100%', maxWidth: 400, marginBottom: 16, alignSelf: 'stretch' },
  inputGroup: { 
    width: '100%', 
    borderRadius: 14, 
    borderWidth: 1.5, 
    overflow: 'hidden' 
  },
  inputItem: { paddingHorizontal: 18, height: 62, justifyContent: 'center' },
  disabledInput: { opacity: 0.6 },
  label: { 
    fontWeight: '700', 
    letterSpacing: 0.6,
    position: 'absolute', 
    left: 18,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    alignSelf: 'stretch',
  },
  input: {
    flex: 1,
    width: '100%',
    alignSelf: 'stretch',
    fontSize: 16,
    fontWeight: '700',
    paddingVertical: 4,
    paddingHorizontal: 0,
    marginTop: 18,
    backgroundColor: 'transparent',
    borderWidth: 0,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
        outlineWidth: 0,
        boxShadow: 'none',
      },
      default: {},
    }),
  },
  backBtn: { padding: 4 },
  borderTop: { borderTopWidth: 1.5 },
  forgotBtn: { alignSelf: 'flex-end', marginTop: 12, marginRight: 2 },
  forgotText: { fontSize: 13, fontWeight: '700', color: '#3b82f6' },
  signInErrorText: { fontSize: 13, fontWeight: '600', marginBottom: 8, textAlign: 'center' },
  otpGrid: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  otpInput: { width: 48, height: 58, borderRadius: 14, borderWidth: 1.5, textAlign: 'center', fontSize: 22, fontWeight: 'bold' },
  resendArea: { marginTop: 25, alignItems: 'center' },
  resendText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 },
  resendBtn: { flexDirection: 'row', alignItems: 'center' },
  resendBtnText: { fontSize: 11, fontWeight: 'bold', color: '#3b82f6', marginLeft: 8 },
  privacyContainer: { marginTop: 12, marginBottom: 8 },
  privacyIcons: { flexDirection: 'row', marginBottom: 8 },
  iconCircle: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', borderWidth: 2.5 },
  privacyText: { fontSize: 12.5, lineHeight: 18, fontWeight: '600', paddingRight: 20 },
  buttonGroup: { flexDirection: 'row', width: '100%', marginBottom: 0, gap: 10, alignItems: 'stretch' },
  buttonGroupSingle: { flexDirection: 'column', gap: 0 },
  actionBtnSplit: {
    flex: 1,
    flexBasis: 0,
    minWidth: 0,
  },
  actionBtnFull: {
    width: '100%',
  },
  mainBtn: { height: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  mainBtnFill: { width: '100%' },
  mainBtnText: { fontSize: 16, fontWeight: 'bold' },
  socialBtn: {
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 1.5,
    width: '100%',
  },
  socialText: { fontSize: 16, fontWeight: 'bold', marginLeft: 10, color: '#ffffff' },
  versionFooter: {
    alignItems: 'center',
    paddingTop: 4,
    paddingBottom: 4,
  },
  versionText: { fontSize: 13, fontWeight: '600', letterSpacing: 1, marginBottom: 4 }, 
  copyrightText: { fontSize: 11, fontWeight: '500', textAlign: 'center', opacity: 0.8 }
});