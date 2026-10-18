import React, { useEffect, useRef, useState, Children, isValidElement, cloneElement } from 'react';
import { View, StyleSheet, Platform, Animated, Easing } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

export const GOOGLE_RING_COLORS = ['#4285F4', '#EA4335', '#FBBC05', '#34A853'];
const BORDER_SPIN_MS = 4200;

/** Smooth squircle-like corner radius for logo ring (stroke box). */
export const squircleRadiusForLogo = (outerSize, borderWidth = 3) => {
  const strokeBox = Math.max(1, outerSize - borderWidth);
  return Math.round(strokeBox * 0.28);
};

const innerRadiusForLogo = (innerSize, borderWidth, outerRx) =>
  Math.max(6, Math.min(Math.round(innerSize * 0.26), outerRx - borderWidth + 1));

/**
 * Google 4-color ring: only the gradient spins on the stroke — the squircle never rotates
 * (avoids the visible "diamond" behind the logo on web).
 */
const SquircleGradientBorder = ({ ringSize, borderWidth, squircleRx, gradientId }) => {
  const spin = useRef(new Animated.Value(0)).current;
  const [angle, setAngle] = useState(0);

  useEffect(() => {
    const listener = spin.addListener(({ value }) => {
      setAngle(value * 360);
    });
    const animation = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: BORDER_SPIN_MS,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
    );
    animation.start();
    return () => {
      spin.removeListener(listener);
      animation.stop();
    };
  }, [spin]);

  const inset = borderWidth / 2;
  const dim = ringSize - borderWidth;
  const center = ringSize / 2;
  const rx = squircleRx;

  return (
    <Svg width={ringSize} height={ringSize} style={styles.borderSvg}>
      <Defs>
        <LinearGradient
          id={gradientId}
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
          gradientUnits="userSpaceOnUse"
          gradientTransform={`rotate(${angle} ${center} ${center})`}
        >
          <Stop offset="0%" stopColor={GOOGLE_RING_COLORS[0]} />
          <Stop offset="25%" stopColor={GOOGLE_RING_COLORS[1]} />
          <Stop offset="50%" stopColor={GOOGLE_RING_COLORS[2]} />
          <Stop offset="75%" stopColor={GOOGLE_RING_COLORS[3]} />
          <Stop offset="100%" stopColor={GOOGLE_RING_COLORS[0]} />
        </LinearGradient>
      </Defs>
      <Rect
        x={inset}
        y={inset}
        width={dim}
        height={dim}
        rx={rx}
        ry={rx}
        stroke={`url(#${gradientId})`}
        strokeWidth={borderWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
};

export const AnimatedColorLogoRing = ({
  size,
  borderWidth = 3,
  squircleRx,
  innerBackground = '#ffffff',
  gradientId = 'micColorRing',
  children,
}) => {
  const innerSize = size - borderWidth * 2;
  const outerRx = squircleRx ?? squircleRadiusForLogo(size, borderWidth);
  const innerRx = innerRadiusForLogo(innerSize, borderWidth, outerRx);

  const sizedChildren = Children.map(children, (child) => {
    if (!isValidElement(child)) return child;

    return cloneElement(child, {
      style: [
        { width: innerSize, height: innerSize },
        child.props.style,
        Platform.OS === 'web' && { objectFit: 'cover' },
      ],
    });
  });

  return (
    <View
      style={[
        styles.shell,
        { width: size, height: size, borderRadius: outerRx },
        Platform.OS === 'ios' && styles.shellContinuous,
      ]}
    >
      <View style={styles.borderLayer} pointerEvents="none">
        <SquircleGradientBorder
          ringSize={size}
          borderWidth={borderWidth}
          squircleRx={outerRx}
          gradientId={`${gradientId}Ring`}
        />
      </View>
      <View
        style={[
          styles.innerCover,
          {
            top: borderWidth,
            left: borderWidth,
            width: innerSize,
            height: innerSize,
            borderRadius: innerRx,
            backgroundColor: innerBackground,
          },
          Platform.OS === 'ios' && styles.shellContinuous,
        ]}
      >
        <View
          style={[
            styles.innerContent,
            { borderRadius: innerRx },
            Platform.OS === 'ios' && styles.shellContinuous,
          ]}
        >
          {sizedChildren}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  shell: {
    position: 'relative',
    alignSelf: 'center',
    overflow: 'hidden',
  },
  shellContinuous: {
    borderCurve: 'continuous',
  },
  borderLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  borderSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  innerCover: {
    position: 'absolute',
    zIndex: 2,
    overflow: 'hidden',
    ...Platform.select({
      ios: { borderCurve: 'continuous' },
      android: { elevation: 4 },
      web: {
        boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
        // Closer match to SVG squircle on web
        borderRadius: '22%',
      },
      default: {},
    }),
  },
  innerContent: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
