import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

const USE_NATIVE_DRIVER = true;

/** Tab icons — pop + lift when selected, settle when inactive. */
export const NavTabAnimatedIcon = ({ active, variant, children }) => {
  const scale = useRef(new Animated.Value(active ? 1 : 0.9)).current;
  const translateY = useRef(new Animated.Value(active ? 0 : 2)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (active) {
      const wiggle =
        variant === 'notices'
          ? Animated.sequence([
              Animated.timing(rotate, {
                toValue: 1,
                duration: 90,
                easing: Easing.out(Easing.quad),
                useNativeDriver: USE_NATIVE_DRIVER,
              }),
              Animated.timing(rotate, {
                toValue: -0.6,
                duration: 100,
                useNativeDriver: USE_NATIVE_DRIVER,
              }),
              Animated.spring(rotate, {
                toValue: 0,
                friction: 6,
                tension: 120,
                useNativeDriver: USE_NATIVE_DRIVER,
              }),
            ])
          : Animated.timing(rotate, { toValue: 0, duration: 0, useNativeDriver: USE_NATIVE_DRIVER });

      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.2,
            duration: 110,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
          Animated.spring(scale, {
            toValue: 1,
            friction: 5,
            tension: 220,
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
        ]),
        Animated.spring(translateY, {
          toValue: 0,
          friction: 7,
          tension: 180,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        wiggle,
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 0.9,
          duration: 180,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(translateY, {
          toValue: 2,
          duration: 180,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(rotate, {
          toValue: 0,
          duration: 120,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]).start();
    }
  }, [active, variant, rotate, scale, translateY]);

  const spin = rotate.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-10deg', '0deg', '10deg'],
  });

  return (
    <Animated.View
      style={{
        transform: [{ translateY }, { scale }, { rotate: spin }],
      }}
    >
      {children}
    </Animated.View>
  );
};

/** Round action icons — press squash + optional idle pulse (barcode scan). */
export const NavActionAnimatedIcon = ({ kind, pressed, children }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const pulseRef = useRef(null);

  useEffect(() => {
    if (pressed) {
      pulseRef.current?.stop();
      scale.setValue(1);
      Animated.timing(rotate, {
        toValue: kind === 'search' ? 1 : 0.5,
        duration: 100,
        useNativeDriver: USE_NATIVE_DRIVER,
      }).start();
      return undefined;
    }

    Animated.spring(rotate, {
      toValue: 0,
      friction: 6,
      tension: 160,
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start();

    if (kind !== 'barcode') {
      scale.setValue(1);
      return undefined;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.07,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]),
    );
    pulseRef.current = loop;
    loop.start();

    return () => loop.stop();
  }, [pressed, kind, rotate, scale]);

  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', kind === 'search' ? '-14deg' : '6deg'],
  });

  return (
    <Animated.View style={{ transform: [{ scale }, { rotate: spin }] }}>{children}</Animated.View>
  );
};
