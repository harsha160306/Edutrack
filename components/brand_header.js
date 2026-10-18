import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Platform, Image, Animated, Easing } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { AnimatedColorLogoRing, GOOGLE_RING_COLORS } from './logo_color_ring';
import { APP_FONTS } from '../features/typography';

const micCollegeLogoSquare = require('../assets/mic-college-logo-square.png');
const LOGO_SQUARE_BG = '#ffffff';

/** College title — Satoshi Bold. */
export const BRAND_SERIF_FONT = APP_FONTS.bold;

/** Taglines and UI chrome — Satoshi Regular / Medium via fontWeight in styles. */
export const BRAND_SANS_FONT = APP_FONTS.regular;

const BRAND_DIVIDER_WIDTH = 4;
const DIVIDER_FLOW_GRADIENT_ID = 'micDividerFlowGrad';
const DIVIDER_FLOW_MS = 5200;
const IS_NATIVE_MOBILE = Platform.OS === 'ios' || Platform.OS === 'android';

export const BRAND_COLLEGE_FULL_NAME = 'MIC COLLEGE OF TECHNOLOGY';

const NBSP = '\u00A0';

/** Prevents word-wrap breaks between tokens on iOS/Android. */
export const getBrandCollegeNameDisplayText = () =>
  Platform.OS === 'web' ? BRAND_COLLEGE_FULL_NAME : BRAND_COLLEGE_FULL_NAME.replace(/ /g, NBSP);

/**
 * Fit full college name on one line for narrow screens.
 * @param {number} availableWidth
 */
export const getBrandCollegeNameFontSize = (availableWidth) => {
  const base = Platform.select({ ios: 12, android: 11, web: 11.5, default: 12 });
  const min = Platform.select({ ios: 8, android: 7.5, default: 8 });
  const perChar = Platform.select({ ios: 6.2, android: 6.6, web: 6.4, default: 6.4 });
  const estimated = BRAND_COLLEGE_FULL_NAME.length * perChar;
  const inner = Math.max(180, availableWidth || 300);
  if (estimated <= inner) return base;
  return Math.max(min, (inner / estimated) * base);
};

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
    <View style={[styles.brandDividerClip, { height: clipHeight }]}>
      <Animated.View
        style={[
          styles.brandDividerStrip,
          { height: stripHeight, transform: [{ translateY }] },
        ]}
      >
        <Svg width={BRAND_DIVIDER_WIDTH} height={stripHeight}>
          <Defs>
            <LinearGradient
              id={DIVIDER_FLOW_GRADIENT_ID}
              x1="0"
              y1="0"
              x2="0"
              y2={stripHeight}
              gradientUnits="userSpaceOnUse"
            >
              <Stop offset="0%" stopColor={GOOGLE_RING_COLORS[0]} />
              <Stop offset="12.5%" stopColor={GOOGLE_RING_COLORS[1]} />
              <Stop offset="25%" stopColor={GOOGLE_RING_COLORS[2]} />
              <Stop offset="37.5%" stopColor={GOOGLE_RING_COLORS[3]} />
              <Stop offset="50%" stopColor={GOOGLE_RING_COLORS[0]} />
              <Stop offset="62.5%" stopColor={GOOGLE_RING_COLORS[1]} />
              <Stop offset="75%" stopColor={GOOGLE_RING_COLORS[2]} />
              <Stop offset="87.5%" stopColor={GOOGLE_RING_COLORS[3]} />
              <Stop offset="100%" stopColor={GOOGLE_RING_COLORS[0]} />
            </LinearGradient>
          </Defs>
          <Rect
            x={0}
            y={0}
            width={BRAND_DIVIDER_WIDTH}
            height={stripHeight}
            rx={2}
            fill={`url(#${DIVIDER_FLOW_GRADIENT_ID})`}
          />
        </Svg>
      </Animated.View>
    </View>
  );
};

export const BrandHeader = ({
  colors,
  isDark = false,
  logoSize = 72,
  logoBorderWidth = 3,
  squircleRx,
  gradientId = 'brandLogoRing',
  style,
}) => {
  const innerSize = logoSize - logoBorderWidth * 2;
  const eyebrowColor = isDark ? 'rgba(248, 250, 252, 0.92)' : colors.textMuted;

  return (
    <View style={[styles.brandRow, style]}>
      <View style={styles.brandLogoWrap}>
        <AnimatedColorLogoRing
          size={logoSize}
          borderWidth={logoBorderWidth}
          squircleRx={squircleRx}
          innerBackground={LOGO_SQUARE_BG}
          gradientId={gradientId}
        >
          <Image
            source={micCollegeLogoSquare}
            style={{ width: innerSize, height: innerSize }}
            resizeMode="cover"
            accessibilityLabel="MIC College logo"
          />
        </AnimatedColorLogoRing>
      </View>
      <BrandColorDivider height={logoSize} />
      <View style={styles.brandText}>
        <View style={styles.brandTextStack}>
          <View style={styles.brandLineWrap}>
            <Text
              style={[styles.brandTextCenter, styles.collegeLine, { color: colors.primary }]}
              allowFontScaling={false}
            >
              DVR & DR. HS
            </Text>
          </View>
          <View style={styles.brandLineWrap}>
            <Text
              style={[styles.brandTextCenter, styles.collegeName, { color: colors.text }]}
              allowFontScaling={false}
              {...(IS_NATIVE_MOBILE
                ? {
                    adjustsFontSizeToFit: true,
                    numberOfLines: 1,
                    minimumFontScale: 0.7,
                  }
                : {})}
            >
              {getBrandCollegeNameDisplayText()}
            </Text>
          </View>
          <View style={styles.brandLineWrap}>
            <Text
              style={[styles.brandTextCenter, styles.eyebrow, { color: eyebrowColor }]}
              allowFontScaling={false}
              {...(IS_NATIVE_MOBILE
                ? {
                    adjustsFontSizeToFit: true,
                    numberOfLines: 1,
                    minimumFontScale: 0.82,
                  }
                : {})}
            >
              MIC DISCIPLINE COMMITTEE
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    alignSelf: 'stretch',
    width: '100%',
  },
  brandLogoWrap: {
    flexShrink: 0,
  },
  brandDividerClip: {
    width: BRAND_DIVIDER_WIDTH,
    marginHorizontal: 10,
    alignSelf: 'center',
    flexShrink: 0,
    borderRadius: 3,
    overflow: 'hidden',
  },
  brandDividerStrip: {
    width: BRAND_DIVIDER_WIDTH,
  },
  brandText: {
    flex: 1,
    flexShrink: 1,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
    minWidth: 0,
    paddingRight: 4,
  },
  brandTextStack: {
    width: '100%',
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  brandLineWrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  brandTextCenter: {
    width: '100%',
    textAlign: 'center',
    alignSelf: 'center',
    ...Platform.select({
      web: {
        display: 'block',
        textAlign: 'center',
      },
      default: {},
    }),
  },
  collegeLine: {
    fontFamily: BRAND_SERIF_FONT,
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 0.75,
    lineHeight: 15,
    textTransform: 'uppercase',
    ...Platform.select({
      android: { includeFontPadding: false },
      default: {},
    }),
  },
  collegeName: {
    fontFamily: BRAND_SERIF_FONT,
    fontSize: Platform.select({ web: 12.5, default: 13.5 }),
    fontWeight: '800',
    letterSpacing: 0.25,
    lineHeight: Platform.select({ web: 16, default: 17 }),
    textTransform: 'uppercase',
    marginTop: 1,
    ...Platform.select({
      android: { includeFontPadding: false },
      default: {},
    }),
  },
  eyebrow: {
    fontFamily: BRAND_SANS_FONT,
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.65,
    lineHeight: 13,
    textTransform: 'uppercase',
    marginTop: 1,
    ...Platform.select({
      android: { includeFontPadding: false },
      default: {},
    }),
  },
});
