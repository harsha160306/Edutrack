import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Dimensions } from 'react-native';

export const SHEET_SLIDE_DISTANCE = Math.min(420, Dimensions.get('window').height * 0.45);

const OPEN_BACKDROP_MS = 280;
const CLOSE_BACKDROP_MS = 240;
const CLOSE_SHEET_MS = 300;

export const openBackdrop = (value) =>
  Animated.timing(value, {
    toValue: 1,
    duration: OPEN_BACKDROP_MS,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  });

export const closeBackdrop = (value) =>
  Animated.timing(value, {
    toValue: 0,
    duration: CLOSE_BACKDROP_MS,
    easing: Easing.in(Easing.cubic),
    useNativeDriver: true,
  });

export const openSheet = (value) =>
  Animated.spring(value, {
    toValue: 0,
    damping: 28,
    stiffness: 320,
    mass: 0.82,
    overshootClamping: false,
    useNativeDriver: true,
  });

export const closeSheet = (value) =>
  Animated.timing(value, {
    toValue: SHEET_SLIDE_DISTANCE,
    duration: CLOSE_SHEET_MS,
    easing: Easing.bezier(0.4, 0, 1, 1),
    useNativeDriver: true,
  });

/**
 * iOS-style bottom sheet mount + open/close motion tied to `visible`.
 */
export const useBottomSheetMotion = (visible, onDismiss) => {
  const [modalMounted, setModalMounted] = useState(false);
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(SHEET_SLIDE_DISTANCE)).current;
  const closeAnimRef = useRef(null);
  const isClosingRef = useRef(false);

  const runCloseAnimation = useCallback(
    (onDone) => {
      closeAnimRef.current?.stop();
      closeAnimRef.current = Animated.parallel([
        closeBackdrop(backdropOpacity),
        closeSheet(sheetTranslateY),
      ]);
      closeAnimRef.current.start(({ finished }) => {
        if (finished) {
          setModalMounted(false);
          onDone?.();
        }
      });
    },
    [backdropOpacity, sheetTranslateY],
  );

  const runOpenAnimation = useCallback(() => {
    closeAnimRef.current?.stop();
    backdropOpacity.setValue(0);
    sheetTranslateY.setValue(SHEET_SLIDE_DISTANCE);
    Animated.parallel([openBackdrop(backdropOpacity), openSheet(sheetTranslateY)]).start();
  }, [backdropOpacity, sheetTranslateY]);

  useEffect(() => {
    if (visible) {
      isClosingRef.current = false;
      setModalMounted(true);
      return;
    }
    if (modalMounted && !isClosingRef.current) {
      isClosingRef.current = true;
      runCloseAnimation(() => {
        isClosingRef.current = false;
      });
    }
  }, [visible, modalMounted, runCloseAnimation]);

  useEffect(() => {
    if (visible && modalMounted) {
      const frame = requestAnimationFrame(() => runOpenAnimation());
      return () => cancelAnimationFrame(frame);
    }
    return undefined;
  }, [visible, modalMounted, runOpenAnimation]);

  const requestDismiss = useCallback(() => {
    if (!visible || isClosingRef.current) return;
    isClosingRef.current = true;
    runCloseAnimation(() => {
      isClosingRef.current = false;
      onDismiss();
    });
  }, [visible, runCloseAnimation, onDismiss]);

  return {
    modalMounted,
    backdropOpacity,
    sheetTranslateY,
    requestDismiss,
  };
};
