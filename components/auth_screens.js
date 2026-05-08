import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Platform, 
  KeyboardAvoidingView, 
  ScrollView,
  Dimensions,
  Animated,
  Easing,
  Pressable, 
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import { 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Pencil, 
  RefreshCcw, 
  UserRound, 
  Shield,
  ChevronRight
} from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';

const { width } = Dimensions.get('window');

// Create an animated version of TextInput
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const GoogleIcon = () => (
  <Svg width="18" height="18" viewBox="0 0 24 24">
    <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.16H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.84l3.66-2.75z" fill="#FBBC05"/>
    <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.16l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </Svg>
);

export const LoginScreen = ({ colors, onLogin }) => {
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [showPassword, setShowPassword] = useState(false);
  const [countdown, setCountdown] = useState(60);
  
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const otpRefs = useRef([]);
  const spinValue = useRef(new Animated.Value(0)).current;

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
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 45000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [spinValue]);

  useEffect(() => {
    let timer;
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const handleContinue = () => {
    Keyboard.dismiss();
    if (step === 'email' && email.length > 5) setStep('password');
    else if (step === 'password' && password.length > 3) {
      setStep('otp');
      setCountdown(60); 
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

  const isDark = colors.text === '#f1f5f9';
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const dots = Array.from({ length: 42 });

  const getBorderColor = () => {
    if (isEmailFocused || isPasswordFocused) return colors.secondary;
    return colors.border;
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={[styles.container, { backgroundColor: colors.background }]}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={[
            styles.scrollContent, 
            { paddingBottom: isKeyboardVisible ? 20 : 120 }
          ]} 
          showsVerticalScrollIndicator={false} 
          keyboardShouldPersistTaps="handled"
        >
          
          <View style={styles.logoContainer}>
            <Animated.View style={[styles.ringContainer, { transform: [{ rotate: spin }] }]}>
              {dots.map((_, i) => (
                <View 
                  key={i} 
                  style={[
                    styles.dot, 
                    { 
                      transform: [
                        { rotate: `${i * (360 / dots.length)}deg` },
                        { translateY: 74 }
                      ],
                      backgroundColor: isDark ? `hsl(${i * 8.5}, 85%, 60%)` : `hsl(${i * 8.5}, 85%, 55%)`
                    }
                  ]} 
                />
              ))}
            </Animated.View>
            
            <View style={[styles.squircle, { backgroundColor: isDark ? '#1e293b' : '#000', borderColor: isDark ? '#334155' : '#1e293b' }]}>
              <ShieldCheck color="#ffffff" size={40} strokeWidth={2.2} />
            </View>
          </View>

          <View style={styles.headerArea}>
            <Text style={[styles.collegeName, { color: colors.textMuted }]}>DVR & DR. HS MIC COLLEGE</Text>
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
              <View style={[styles.inputGroup, { backgroundColor: isDark ? '#1e293b' : '#f0f2f877', borderColor: getBorderColor() }]}>
                {/* Email Input */}
                <Pressable 
                  style={[styles.inputItem, step === 'password' && styles.disabledInput]}
                  onPress={() => emailInputRef.current?.focus()}
                >
                  <Animated.Text 
                    pointerEvents="none"
                    style={[
                      styles.label, 
                      { 
                        top: emailLabelAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 8] }),
                        fontSize: emailLabelAnim.interpolate({ inputRange: [0, 1], outputRange: [15, 10] }),
                        opacity: emailLabelAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }),
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
                       editable={step === 'email'}
                       autoCapitalize="none"
                       keyboardType="email-address"
                       selectionColor={colors.secondary}
                       spellCheck={false}
                       autoCorrect={false}
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
                    style={[styles.inputItem, styles.borderTop, { borderTopColor: colors.border }]}
                    onPress={() => passwordInputRef.current?.focus()}
                  >
                    <Animated.Text 
                      pointerEvents="none"
                      style={[
                        styles.label, 
                        { 
                          top: passLabelAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 8] }),
                          fontSize: passLabelAnim.interpolate({ inputRange: [0, 1], outputRange: [15, 10] }),
                          opacity: passLabelAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }),
                          textTransform: (isPasswordFocused || password.length > 0) ? 'uppercase' : 'none'
                        }
                      ]}
                    >
                      Password
                    </Animated.Text>
                    <View style={styles.inputRow}>
                      <TextInput 
                        ref={passwordInputRef}
                        style={[styles.input, { color: colors.text, flex: 1 }]}
                        value={password}
                        onChangeText={setPassword}
                        onFocus={() => setIsPasswordFocused(true)}
                        onBlur={() => setIsPasswordFocused(false)}
                        secureTextEntry={!showPassword}
                        selectionColor={colors.secondary}
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

            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            {step === 'otp' && (
              <View style={styles.resendArea}>
                {countdown > 0 ? (
                  <Text style={styles.resendText}>Resend code in <Text style={{color: colors.secondary, fontWeight: '900'}}>0:{countdown.toString().padStart(2, '0')}</Text></Text>
                ) : (
                  <TouchableOpacity style={styles.resendBtn} onPress={() => setCountdown(60)}>
                     <RefreshCcw size={14} color={colors.secondary} strokeWidth={3} />
                     <Text style={styles.resendBtnText}>Resend Verification Code</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            <View style={styles.privacyContainer}>
              <View style={styles.privacyIcons}>
                 <View style={[styles.iconCircle, { backgroundColor: '#3b82f6', zIndex: 2, borderColor: '#ffffff' }]}>
                   <UserRound size={16} color="#ffffff" fill="#ffffff" />
                 </View>
                 <View style={[styles.iconCircle, { backgroundColor: '#e2e8f0', marginLeft: -10, zIndex: 1, borderColor: '#ffffff' }]}>
                   <Shield size={16} color="#1e293b" fill="#1e293b" />
                 </View>
              </View>
              <Text style={[styles.privacyText, { color: colors.textMuted }]}>
                Your Faculty Account information is used to allow you to sign in securely and access student records.{' '}
                <Text style={{ color: colors.secondary, fontWeight: '700' }}>See how your data is managed...</Text>
              </Text>
            </View>
          </View>

          <View style={styles.buttonGroup}>
            <TouchableOpacity 
              style={[
                styles.mainBtn, 
                { backgroundColor: email.length > 5 ? colors.secondary : (isDark ? '#1e293b' : '#f0f2f8') }
              ]} 
              onPress={handleContinue}
              activeOpacity={0.8}
            >
              <Text style={[styles.mainBtnText, { color: email.length > 5 ? '#fff' : colors.textMuted }]}>
                {step === 'email' ? 'Continue' : 'Sign In'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.socialBtn, { backgroundColor: isDark ? '#1e293b' : '#1e293b', borderColor: isDark ? colors.border : '#1e293b' }]}>
              <GoogleIcon />
              <Text style={[styles.socialText, { color: '#ffffff' }]}>Google</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {!isKeyboardVisible && (
          <View style={[styles.versionFooter, { backgroundColor: colors.background }]}>
            <Text style={[styles.versionText, { color: colors.textMuted }]}>V1.2.4 (BUILD 20260503.1)</Text>
            <Text style={[styles.copyrightText, { color: colors.textMuted }]}>© 2026 DVR & Dr. HS MIC College. All Rights Reserved.</Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 32, alignItems: 'center', flexGrow: 1, paddingTop: 30, paddingBottom: 110 },
  logoContainer: { height: 180, width: 180, alignItems: 'center', justifyContent: 'center', marginBottom: 5 },
  ringContainer: { position: 'absolute', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  dot: { position: 'absolute', width: 5, height: 5, borderRadius: 3 },
  squircle: { 
    width: 84, height: 84, borderRadius: 28, alignItems: 'center', justifyContent: 'center',
    shadowColor: "#000", shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2, shadowRadius: 20, elevation: 8, borderWidth: 2, zIndex: 10
  },
  headerArea: { alignItems: 'center', marginBottom: 20 },
  collegeName: { 
    fontSize: 13, 
    fontWeight: '600', 
    letterSpacing: 0.8, 
    marginBottom: 15,
    fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif', 
    textTransform: 'uppercase'
  },
  title: { fontSize: 28, fontWeight: '900', letterSpacing: -1 }, 
  otpSub: { alignItems: 'center', marginTop: 8 },
  otpSubText: { fontSize: 11, fontWeight: '600' },
  emailEdit: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  emailTarget: { fontSize: 11, fontWeight: 'bold', color: '#3b82f6', marginRight: 6 },
  formArea: { width: '100%', marginBottom: 30 },
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
    color: '#94a3b8', 
    letterSpacing: 0.6,
    position: 'absolute', 
    left: 18,
  },
  inputRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  input: { fontSize: 16, fontWeight: '700', paddingVertical: 4, marginTop: 18 },
  backBtn: { padding: 4 },
  borderTop: { borderTopWidth: 1.5 },
  forgotBtn: { alignSelf: 'flex-end', marginTop: 12, marginRight: 2 },
  forgotText: { fontSize: 13, fontWeight: '700', color: '#3b82f6' },
  otpGrid: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  otpInput: { width: 48, height: 58, borderRadius: 14, borderWidth: 1.5, textAlign: 'center', fontSize: 22, fontWeight: 'bold' },
  resendArea: { marginTop: 25, alignItems: 'center' },
  resendText: { fontSize: 10, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 },
  resendBtn: { flexDirection: 'row', alignItems: 'center' },
  resendBtnText: { fontSize: 11, fontWeight: 'bold', color: '#3b82f6', marginLeft: 8 },
  privacyContainer: { marginTop: 30 },
  privacyIcons: { flexDirection: 'row', marginBottom: 8 },
  iconCircle: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', borderWidth: 2.5 },
  privacyText: { fontSize: 12.5, lineHeight: 18, fontWeight: '600', paddingRight: 20 },
  buttonGroup: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginBottom: 40 },
  mainBtn: { flex: 1, height: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  mainBtnText: { fontSize: 16, fontWeight: 'bold' },
  socialBtn: { flex: 1, height: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', borderWidth: 1.5 },
  socialText: { fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  versionFooter: { 
    alignItems: 'center', paddingTop: 8, paddingBottom: 15, 
    position: 'absolute', bottom: 5, left: 0, right: 0 
  },
  versionText: { fontSize: 13, fontWeight: '600', letterSpacing: 1, marginBottom: 4 }, 
  copyrightText: { fontSize: 11, fontWeight: '500', textAlign: 'center', opacity: 0.8 }
});