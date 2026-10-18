import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Platform,
  Animated,
  Easing,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedColorLogoRing, squircleRadiusForLogo } from './logo_color_ring';
import { RoleSelectBackdrop } from './apple_material';

const micCollegeLogoSquare = require('../assets/mic-college-logo-square.png');
const { formatVersionCompact, getCopyrightLine } = require('../constants/appInfo');
const LOGO_SQUARE_BG = '#ffffff';

const BRAND_SERIF_FONT = Platform.select({
  ios: 'Times New Roman',
  android: 'serif',
  web: '"Times New Roman", Times, serif',
  default: 'serif',
});

const BRAND_SANS_FONT = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  web: 'system-ui, -apple-system, "Segoe UI", sans-serif',
  default: 'sans-serif',
});

const SPLASH_LOGO_SIZE = 128;
const LOADING_LOGO_SIZE = 104;
const SPLASH_COLLEGE_FULL_NAME = 'MIC COLLEGE OF TECHNOLOGY';
/** hero paddingHorizontal (28) + textGroup paddingHorizontal (8), both sides */
const SPLASH_HORIZONTAL_INSET = (28 + 8) * 2;

const getSplashCollegeNameDisplay = () =>
  Platform.OS === 'web'
    ? SPLASH_COLLEGE_FULL_NAME
    : SPLASH_COLLEGE_FULL_NAME.replace(/ /g, '\u00A0');

const getSplashCollegeNameFontSize = (windowWidth, compact = false) => {
  const base = compact
    ? Platform.select({ ios: 10.5, android: 10, default: 10.5 })
    : Platform.select({ ios: 11.5, android: 10.5, default: 11 });
  const min = Platform.select({ ios: 7.5, android: 7, default: 7.5 });
  const perChar = Platform.select({ ios: 5.9, android: 6.2, default: 6 });
  const available = Math.max(160, windowWidth - SPLASH_HORIZONTAL_INSET);
  const estimated = SPLASH_COLLEGE_FULL_NAME.length * perChar;
  if (estimated <= available) return base;
  return Math.max(min, (available / estimated) * base);
};

const useEntranceAnimation = () => {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.88)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslate = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 700,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 7,
          tension: 55,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(textTranslate, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [logoOpacity, logoScale, textOpacity, textTranslate]);

  return { logoOpacity, logoScale, textOpacity, textTranslate };
};

export const CollegeLogo = ({ size = SPLASH_LOGO_SIZE }) => {
  const borderWidth = Math.max(3, Math.round(size * 0.026));
  const radius = squircleRadiusForLogo(size, borderWidth);

  return (
    <AnimatedColorLogoRing
      size={size}
      borderWidth={borderWidth}
      squircleRx={radius}
      innerBackground={LOGO_SQUARE_BG}
      gradientId="splashLogoRing"
    >
      <Image
        source={micCollegeLogoSquare}
        style={styles.logoImageFill}
        resizeMode="cover"
        accessibilityLabel="MIC College logo"
      />
    </AnimatedColorLogoRing>
  );
};

const SplashFooter = ({ colors, bottomInset = 0 }) => (
  <View style={[styles.footerBlock, { paddingBottom: Math.max(bottomInset, 16) + 12 }]}>
    <Text style={[styles.footerTagline, { color: colors.textMuted }]} allowFontScaling={false}>
      Education · Symbiosis · Industry
    </Text>
    <Text style={[styles.footerVersion, { color: colors.textMuted }]} allowFontScaling={false}>
      {formatVersionCompact()}
    </Text>
    <Text style={[styles.footerCopyright, { color: colors.textMuted }]} allowFontScaling={false}>
      {getCopyrightLine()}
    </Text>
  </View>
);

export const BrandCopy = ({ colors, compact = false }) => {
  const { width: windowWidth } = useWindowDimensions();
  const collegeNameFontSize = getSplashCollegeNameFontSize(windowWidth, compact);

  return (
  <View style={styles.textGroup}>
    <Text
      style={[styles.collegeLine, { color: colors.primary }]}
      allowFontScaling={false}
    >
      DVR & DR. HS
    </Text>
    <View
      style={[
        styles.collegeNameWrap,
        { maxWidth: Math.min(360, windowWidth - SPLASH_HORIZONTAL_INSET) },
      ]}
    >
      <Text
        style={[
          styles.collegeName,
          {
            color: colors.text,
            fontSize: collegeNameFontSize,
            lineHeight: collegeNameFontSize + 4,
            width: windowWidth - SPLASH_HORIZONTAL_INSET,
            maxWidth: '100%',
          },
        ]}
        allowFontScaling={false}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.45}
      >
        {getSplashCollegeNameDisplay()}
      </Text>
    </View>
    <Text
      style={[
        styles.titleLine,
        compact && styles.titleLineCompact,
      ]}
      allowFontScaling={false}
    >
      <Text style={{ color: colors.text }}>DISCIPLINE </Text>
      <Text style={{ color: colors.primary }}>COMMITTEE</Text>
    </Text>
  </View>
  );
};

const SplashShell = ({ colors, theme, children }) => {
  const insets = useSafeAreaInsets();
  const isDark = theme === 'dark';

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <RoleSelectBackdrop
        isDark={isDark}
        primary={colors.primary}
        background={colors.background}
      />
      <View style={styles.hero}>{children}</View>
      <SplashFooter colors={colors} bottomInset={insets.bottom} />
    </View>
  );
};

export const SplashScreen = ({ colors, theme }) => {
  const { logoOpacity, logoScale, textOpacity, textTranslate } = useEntranceAnimation();

  return (
    <SplashShell colors={colors} theme={theme}>
      <Animated.View
        style={[
          styles.logoWrap,
          { opacity: logoOpacity, transform: [{ scale: logoScale }] },
        ]}
      >
        <CollegeLogo size={SPLASH_LOGO_SIZE} />
      </Animated.View>

      <Animated.View
        style={{
          opacity: textOpacity,
          transform: [{ translateY: textTranslate }],
        }}
      >
        <BrandCopy colors={colors} />
      </Animated.View>
    </SplashShell>
  );
};

export const LoadingScreen = ({ progress, loadingText, colors, theme }) => (
  <SplashShell colors={colors} theme={theme}>
    <View style={styles.loadingHero}>
      <View style={styles.logoWrap}>
        <CollegeLogo size={LOADING_LOGO_SIZE} />
      </View>
      <BrandCopy colors={colors} compact />
      <View style={styles.loadingWrapper}>
        <View style={styles.loadingHeader}>
          <Text style={[styles.loadingStatus, { color: colors.textMuted }]} allowFontScaling={false}>
            {loadingText}
          </Text>
          <Text style={[styles.percentage, { color: colors.primary }]} allowFontScaling={false}>
            {progress}%
          </Text>
        </View>
        <View
          style={[
            styles.progressBarBg,
            { backgroundColor: theme === 'dark' ? '#1e293b' : '#e2e8f0' },
          ]}
        >
          <View
            style={[
              styles.progressBarFill,
              { width: `${progress}%`, backgroundColor: colors.primary },
            ]}
          />
        </View>
      </View>
    </View>
  </SplashShell>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
    overflow: 'hidden',
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingTop: 12,
    paddingBottom: 8,
  },
  loadingHero: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: {
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImageFill: {
    backgroundColor: LOGO_SQUARE_BG,
  },
  textGroup: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
    paddingHorizontal: 8,
  },
  collegeLine: {
    fontFamily: BRAND_SERIF_FONT,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.35,
    lineHeight: 15,
    textTransform: 'uppercase',
    textAlign: 'center',
    ...Platform.select({
      android: { includeFontPadding: false },
      default: {},
    }),
  },
  collegeNameWrap: {
    width: '100%',
    marginTop: 5,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  collegeName: {
    fontFamily: BRAND_SERIF_FONT,
    fontWeight: '700',
    letterSpacing: Platform.select({ web: 0.8, ios: 0.4, android: 0.2, default: 0.35 }),
    textTransform: 'uppercase',
    textAlign: 'center',
    alignSelf: 'center',
    ...Platform.select({
      web: {
        whiteSpace: 'nowrap',
        textAlign: 'center',
        marginLeft: 'auto',
        marginRight: 'auto',
      },
      android: {
        includeFontPadding: false,
        textAlign: 'center',
        textBreakStrategy: 'simple',
      },
      ios: {
        textAlign: 'center',
      },
      default: {},
    }),
  },
  titleLine: {
    marginTop: 8,
    fontFamily: BRAND_SERIF_FONT,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.9,
    lineHeight: 28,
    textTransform: 'uppercase',
    textAlign: 'center',
    ...Platform.select({
      android: { includeFontPadding: false },
      default: {},
    }),
  },
  titleLineCompact: {
    marginTop: 6,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 0.75,
  },
  footerBlock: {
    paddingHorizontal: 28,
    paddingTop: 8,
    alignItems: 'center',
  },
  footerTagline: {
    fontFamily: BRAND_SANS_FONT,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.35,
    textAlign: 'center',
    opacity: 0.88,
  },
  footerVersion: {
    marginTop: 6,
    fontFamily: BRAND_SANS_FONT,
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.4,
    textAlign: 'center',
    opacity: 0.78,
  },
  footerCopyright: {
    marginTop: 4,
    fontFamily: BRAND_SANS_FONT,
    fontSize: 10.5,
    fontWeight: '400',
    letterSpacing: 0.1,
    textAlign: 'center',
    lineHeight: 15,
    opacity: 0.62,
    maxWidth: 320,
  },
  loadingWrapper: {
    width: '100%',
    maxWidth: 300,
    marginTop: 28,
  },
  loadingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  loadingStatus: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    flex: 1,
    paddingRight: 12,
  },
  percentage: {
    fontSize: 14,
    fontWeight: '900',
  },
  progressBarBg: {
    height: 6,
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 10,
  },
});
