import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Platform, Vibration } from 'react-native';

import { vibrateHoldToSync } from './vibrateHoldCue';
import { Gesture } from 'react-native-gesture-handler';

import { computePullFromFinger } from './computePullFromFinger';
import {
  MOBILE_PULL_RELEASE_MS,
  PULL_ACTIVATION_DY_EFFECTIVE,
  PULL_RELEASE_EASING,
  PULL_RELEASE_MS,
  PULL_SYNC_THRESHOLD,
  PULL_TOUCH_START_DY,
  SCROLL_TOP_TOLERANCE,
  PULL_HEADER_SLOT_HEIGHT,
  SHEET_PULL_RANGE,
  SYNC_HOLD_MS,
  WEB_PULL_RELEASE_MS,
} from './constants';
import { createMobilePullVisualDriver } from './mobilePullVisual';

const CONTENT_SHEET_TOP_RADIUS = 24;
const SHEET_RADIUS_SCROLL_RANGE = 56;
const RADIUS_SCROLL_STEP = 12;

const easeOutQuad = (t) => 1 - (1 - t) * (1 - t);

const isMobile = Platform.OS !== 'web';

/**
 * Reverse Pull Sync — scroll stays native-smooth; pull uses top gesture zone + scroll overscroll.
 */
export function useReversePullSync({
  contentSheetTopRadius = CONTENT_SHEET_TOP_RADIUS,
  onHoldComplete,
  onWebReleaseConfirm,
  sheetRadiusScrollRange = SHEET_RADIUS_SCROLL_RANGE,
}) {
  const scrollViewRef = useRef(null);
  const pullTranslateY = useRef(new Animated.Value(0)).current;
  const pullChrome = useRef(new Animated.Value(0)).current;
  const sheetRadiusAnim = useRef(new Animated.Value(contentSheetTopRadius)).current;

  const pullAmountRef = useRef(0);
  const pullVisualDriver = useMemo(
    () => createMobilePullVisualDriver(pullTranslateY, pullChrome, pullAmountRef),
    [pullChrome, pullTranslateY],
  );

  const pullSyncLockRef = useRef(false);
  const pullReleasingRef = useRef(false);
  const pullPhaseRef = useRef('idle');
  const scrollOffsetRef = useRef(0);
  const lastRadiusScrollRef = useRef(0);
  const pullGesturePromptedRef = useRef(false);
  const intentionalPullRef = useRef(false);
  const touchStartYRef = useRef(0);
  const fingerDownRef = useRef(false);
  const pullCaptureActiveRef = useRef(false);
  const scrollDraggingRef = useRef(false);
  const holdTimerRef = useRef(null);
  const holdCompletedRef = useRef(false);
  const pullThresholdReachedRef = useRef(false);
  const pullHoldCueVibratedRef = useRef(false);
  const scrollPinnedRef = useRef(false);
  const pullFromPanRef = useRef(false);
  const pullFinishOnceRef = useRef(false);
  const pullPhaseRafRef = useRef(null);
  const webPullReleaseTimerRef = useRef(null);

  const [pullPhase, setPullPhase] = useState('idle');
  const [pullGestureEnabled, setPullGestureEnabled] = useState(true);

  const updateSheetBorderRadius = useCallback(
    (scrollOffset, pull) => {
      let radius = contentSheetTopRadius;
      if (pull > 0) {
        radius = contentSheetTopRadius + (pull / SHEET_PULL_RANGE) * 4;
      } else if (scrollOffset > 0) {
        const t = Math.min(scrollOffset / sheetRadiusScrollRange, 1);
        radius = contentSheetTopRadius * (1 - easeOutQuad(t));
      }
      sheetRadiusAnim.setValue(Math.max(0, radius));
    },
    [contentSheetTopRadius, sheetRadiusAnim, sheetRadiusScrollRange],
  );

  const setPullPhaseSafe = useCallback((next) => {
    if (pullPhaseRef.current === next) return;
    pullPhaseRef.current = next;
    if (Platform.OS === 'web') {
      setPullPhase(next);
      return;
    }
    const flushNow = next === 'hold' || next === 'syncing' || next === 'ready';
    if (flushNow) {
      if (pullPhaseRafRef.current != null) {
        cancelAnimationFrame(pullPhaseRafRef.current);
        pullPhaseRafRef.current = null;
      }
      setPullPhase(next);
      return;
    }
    if (pullPhaseRafRef.current != null) return;
    pullPhaseRafRef.current = requestAnimationFrame(() => {
      pullPhaseRafRef.current = null;
      setPullPhase(pullPhaseRef.current);
    });
  }, []);

  useEffect(() => {
    const id = pullChrome.addListener(({ value }) => {
      if (!isMobile) {
        pullAmountRef.current = value;
        updateSheetBorderRadius(scrollOffsetRef.current, value);
      }
    });
    return () => pullChrome.removeListener(id);
  }, [pullAmountRef, pullChrome, updateSheetBorderRadius]);

  const pinScrollToTopOnce = useCallback(() => {
    if (scrollPinnedRef.current) return;
    scrollPinnedRef.current = true;
    scrollViewRef.current?.scrollTo?.({ y: 0, animated: false });
  }, []);

  const unpinScroll = useCallback(() => {
    scrollPinnedRef.current = false;
  }, []);

  const cancelSyncHold = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }, []);

  const resetPullVisualState = useCallback(() => {
    cancelSyncHold();
    holdCompletedRef.current = false;
    pullThresholdReachedRef.current = false;
    pullHoldCueVibratedRef.current = false;
    fingerDownRef.current = false;
    intentionalPullRef.current = false;
    pullCaptureActiveRef.current = false;
    pullFromPanRef.current = false;
    pullFinishOnceRef.current = false;
    unpinScroll();
    pullTranslateY.stopAnimation();
    pullChrome.stopAnimation();
    setPullPhaseSafe('idle');
    pullAmountRef.current = 0;
  }, [cancelSyncHold, pullAmountRef, pullChrome, pullTranslateY, setPullPhaseSafe, unpinScroll]);

  const animatePullRelease = useCallback(
    (onDone) => {
      pullReleasingRef.current = true;
      const finishRelease = ({ finished }) => {
        pullReleasingRef.current = false;
        if (finished) {
          pullAmountRef.current = 0;
          setPullPhaseSafe('idle');
          updateSheetBorderRadius(scrollOffsetRef.current, 0);
        }
        onDone?.(finished);
      };

      const duration = Platform.OS === 'web' ? PULL_RELEASE_MS : MOBILE_PULL_RELEASE_MS;

      Animated.parallel([
        Animated.timing(pullTranslateY, {
          toValue: 0,
          duration,
          easing: PULL_RELEASE_EASING,
          useNativeDriver: true,
        }),
        Animated.timing(pullChrome, {
          toValue: 0,
          duration,
          easing: PULL_RELEASE_EASING,
          useNativeDriver: false,
        }),
      ]).start(finishRelease);
    },
    [pullAmountRef, pullChrome, pullTranslateY, setPullPhaseSafe, updateSheetBorderRadius],
  );

  const resetPullState = useCallback(
    (animated = true) => {
      resetPullVisualState();

      if (!animated) {
        pullVisualDriver.flushNow(0);
        pullReleasingRef.current = false;
        updateSheetBorderRadius(scrollOffsetRef.current, 0);
        return;
      }

      animatePullRelease();
    },
    [animatePullRelease, pullVisualDriver, resetPullVisualState, updateSheetBorderRadius],
  );

  const scheduleWebPullRelease = useCallback(() => {
    if (Platform.OS !== 'web') return;
    clearTimeout(webPullReleaseTimerRef.current);
    webPullReleaseTimerRef.current = setTimeout(() => {
      if (
        fingerDownRef.current
        || pullSyncLockRef.current
        || pullGesturePromptedRef.current
        || pullReleasingRef.current
      ) {
        return;
      }
      if (pullAmountRef.current > 0) {
        resetPullState(true);
      }
    }, WEB_PULL_RELEASE_MS);
  }, [pullAmountRef, resetPullState]);

  useEffect(
    () => () => {
      clearTimeout(webPullReleaseTimerRef.current);
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
      }
      if (pullPhaseRafRef.current != null) {
        cancelAnimationFrame(pullPhaseRafRef.current);
      }
    },
    [],
  );

  const scheduleSyncHold = useCallback(() => {
    if (
      Platform.OS === 'web'
      || holdTimerRef.current
      || holdCompletedRef.current
      || pullSyncLockRef.current
      || !fingerDownRef.current
      || !pullThresholdReachedRef.current
    ) {
      return;
    }

    holdTimerRef.current = setTimeout(() => {
      holdTimerRef.current = null;
      if (
        !fingerDownRef.current
        || !pullThresholdReachedRef.current
        || !intentionalPullRef.current
        || pullSyncLockRef.current
        || holdCompletedRef.current
        || pullGesturePromptedRef.current
      ) {
        return;
      }
      holdCompletedRef.current = true;
      onHoldComplete?.();
    }, SYNC_HOLD_MS);
  }, [onHoldComplete]);

  const setPullVisual = pullVisualDriver.setPullVisual;

  const applyPull = useCallback(
    (rawPull) => {
      const { visual, engaged } = computePullFromFinger(
        rawPull,
        PULL_ACTIVATION_DY_EFFECTIVE,
        SHEET_PULL_RANGE,
      );

      if (!engaged) {
        if (!pullThresholdReachedRef.current) {
          cancelSyncHold();
        }
        intentionalPullRef.current = false;

        if (isMobile && rawPull > 0 && !pullSyncLockRef.current) {
          setPullVisual(visual);
          if (visual > 2 && pullPhaseRef.current === 'idle') {
            setPullPhaseSafe('pulling');
          }
          return;
        }

        if (pullAmountRef.current > 0.25) {
          setPullVisual(0);
        }
        if (!pullThresholdReachedRef.current && pullPhaseRef.current !== 'idle' && !pullSyncLockRef.current) {
          setPullPhaseSafe('idle');
        }
        return;
      }

      intentionalPullRef.current = true;
      pullCaptureActiveRef.current = true;

      if (isMobile) {
        pinScrollToTopOnce();
      }

      setPullVisual(visual);
      const clamped = visual;

      if (pullSyncLockRef.current) return;

      if (clamped >= PULL_SYNC_THRESHOLD) {
        if (Platform.OS === 'web') {
          cancelSyncHold();
          setPullPhaseSafe('ready');
        } else {
          pullThresholdReachedRef.current = true;
          if (pullPhaseRef.current !== 'hold') {
            setPullPhaseSafe('hold');
            if (!pullHoldCueVibratedRef.current) {
              pullHoldCueVibratedRef.current = true;
              vibrateHoldToSync();
            }
          }
          scheduleSyncHold();
        }
      } else if (!pullThresholdReachedRef.current) {
        cancelSyncHold();
        if (clamped > 8 && pullPhaseRef.current !== 'pulling') {
          setPullPhaseSafe('pulling');
        } else if (clamped <= 2 && pullPhaseRef.current === 'pulling') {
          setPullPhaseSafe('idle');
        }
      }
    },
    [cancelSyncHold, pinScrollToTopOnce, scheduleSyncHold, setPullPhaseSafe, setPullVisual],
  );

  const finishPullGesture = useCallback(() => {
    clearTimeout(webPullReleaseTimerRef.current);
    cancelSyncHold();
    fingerDownRef.current = false;
    pullCaptureActiveRef.current = false;
    pullFromPanRef.current = false;
    scrollDraggingRef.current = false;

    if (scrollOffsetRef.current < 0) {
      scrollViewRef.current?.scrollTo?.({ y: 0, animated: true });
    }

    if (pullGesturePromptedRef.current) {
      resetPullState(true);
      return;
    }

    if (holdCompletedRef.current || pullSyncLockRef.current) {
      if (!pullSyncLockRef.current) {
        resetPullState(true);
      }
      return;
    }

    if (
      Platform.OS === 'web'
      && intentionalPullRef.current
      && pullAmountRef.current >= PULL_SYNC_THRESHOLD
    ) {
      onWebReleaseConfirm?.();
      return;
    }

    resetPullState(true);
  }, [cancelSyncHold, onWebReleaseConfirm, pullAmountRef, resetPullState]);

  const finishPullGestureOnce = useCallback(() => {
    if (pullFinishOnceRef.current) return;
    pullFinishOnceRef.current = true;
    finishPullGesture();
  }, [finishPullGesture]);

  const beginPullSession = useCallback(() => {
    fingerDownRef.current = true;
    holdCompletedRef.current = false;
    pullGesturePromptedRef.current = false;
    pullThresholdReachedRef.current = false;
    pullHoldCueVibratedRef.current = false;
    cancelSyncHold();
  }, [cancelSyncHold]);

  const syncPullGestureEnabled = useCallback((y) => {
    const atTop = y <= SCROLL_TOP_TOLERANCE;
    setPullGestureEnabled((prev) => (prev === atTop ? prev : atTop));
  }, []);

  const onDashboardScroll = useCallback(
    (event) => {
      const y = event.nativeEvent.contentOffset.y;
      scrollOffsetRef.current = y;
      syncPullGestureEnabled(y);

      if (
        isMobile
        && y < -1
        && !pullFromPanRef.current
        && (scrollDraggingRef.current || pullCaptureActiveRef.current)
        && !pullSyncLockRef.current
      ) {
        fingerDownRef.current = true;
        applyPull(Math.min(-y + 2, SHEET_PULL_RANGE));
        return;
      }

      if (Platform.OS === 'web' && pullAmountRef.current > 0) {
        scheduleWebPullRelease();
      }

      if (y > SCROLL_TOP_TOLERANCE && pullAmountRef.current > 0 && !pullReleasingRef.current) {
        resetPullState(false);
        updateSheetBorderRadius(y, 0);
        return;
      }

      if (!pullReleasingRef.current && !pullCaptureActiveRef.current) {
        const scrollForRadius = Math.max(y, 0);
        if (Math.abs(scrollForRadius - lastRadiusScrollRef.current) >= RADIUS_SCROLL_STEP || scrollForRadius === 0) {
          lastRadiusScrollRef.current = scrollForRadius;
          updateSheetBorderRadius(scrollForRadius, pullAmountRef.current);
        }
      }
    },
    [
      applyPull,
      pullAmountRef,
      resetPullState,
      scheduleWebPullRelease,
      syncPullGestureEnabled,
      updateSheetBorderRadius,
    ],
  );

  const onDashboardScrollBeginDrag = useCallback(() => {
    scrollDraggingRef.current = true;
  }, []);

  const onDashboardScrollEndDrag = useCallback(() => {
    scrollDraggingRef.current = false;

    if (Platform.OS === 'web') {
      finishPullGesture();
      return;
    }

    // Pan gesture handles its own cleanup via onEnd/onFinalize.
    // Only snap back here if overscroll left a pull visible with no Pan active.
    if (!pullFromPanRef.current && pullAmountRef.current > 0) {
      finishPullGestureOnce();
    }
  }, [finishPullGestureOnce, pullAmountRef]);

  const onDashboardMomentumScrollEnd = useCallback(() => {
    scrollDraggingRef.current = false;
    if (pullSyncLockRef.current || pullReleasingRef.current) return;
    // Snap back only if overscroll stranded the view below y=0
    if (scrollOffsetRef.current < 0) {
      scrollViewRef.current?.scrollTo?.({ y: 0, animated: true });
    }
    if (
      pullAmountRef.current > 0
      && !pullGesturePromptedRef.current
      && !fingerDownRef.current
      && !pullCaptureActiveRef.current
    ) {
      resetPullState(true);
    }
  }, [pullAmountRef, resetPullState]);

  const pullZoneHandlers = useMemo(() => {
    if (Platform.OS !== 'web') return {};

    const onPullStart = (pageY) => {
      if (scrollOffsetRef.current > SCROLL_TOP_TOLERANCE || pullSyncLockRef.current) return;
      touchStartYRef.current = pageY;
      beginPullSession();
    };

    const onPullMove = (pageY) => {
      if (scrollOffsetRef.current > SCROLL_TOP_TOLERANCE || pullSyncLockRef.current) return;
      fingerDownRef.current = true;
      const dy = pageY - touchStartYRef.current;
      if (dy > PULL_ACTIVATION_DY_EFFECTIVE) {
        applyPull(dy);
        scrollViewRef.current?.scrollTo?.({ y: 0, animated: false });
      } else if (dy <= 0 && pullAmountRef.current > 0) {
        applyPull(0);
      } else if (dy > 0) {
        applyPull(0);
      }
    };

    return {
      onMouseDown: (e) => onPullStart(e.nativeEvent.pageY),
      onMouseMove: (e) => {
        if (e.buttons !== 1) return;
        onPullMove(e.nativeEvent.pageY);
      },
      onMouseUp: finishPullGesture,
      onMouseLeave: finishPullGesture,
    };
  }, [applyPull, beginPullSession, finishPullGesture, pullAmountRef]);

  // scrollPullTouchHandlers removed — was interfering with normal scroll

  const pullPanGesture = useMemo(() => {
    if (!isMobile) return null;

    return Gesture.Pan()
      .enabled(pullGestureEnabled)
      .activeOffsetY(10)
      .failOffsetY(-6)
      .failOffsetX([-36, 36])
      .cancelsTouchesInView(false)
      .onBegin(() => {
        pullFromPanRef.current = true;
        pullFinishOnceRef.current = false;
        beginPullSession();
      })
      .onUpdate((e) => {
        if (scrollOffsetRef.current > SCROLL_TOP_TOLERANCE || pullSyncLockRef.current) return;
        const dy = e.translationY;
        if (dy <= 0) {
          if (pullAmountRef.current > 0) applyPull(0);
          return;
        }
        pullCaptureActiveRef.current = true;
        fingerDownRef.current = true;
        applyPull(dy);
      })
      .onEnd(() => {
        finishPullGestureOnce();
      })
      .onFinalize(() => {
        pullFromPanRef.current = false;
        pullFinishOnceRef.current = false;
      });
  }, [applyPull, beginPullSession, finishPullGestureOnce, pullAmountRef, pullGestureEnabled]);

  const sheetTranslateY = isMobile
    ? pullTranslateY.interpolate({
        inputRange: [0, SHEET_PULL_RANGE],
        outputRange: [0, SHEET_PULL_RANGE],
        extrapolate: 'clamp',
      })
    : pullTranslateY.interpolate({ inputRange: [0, 1], outputRange: [0, 0] });

  const contentSheetRadiusStyle = {
    borderTopLeftRadius: sheetRadiusAnim,
    borderTopRightRadius: sheetRadiusAnim,
  };

  /** Driven by native translateY — no per-frame layout height changes. */
  const pullIndicatorOpacity = pullTranslateY.interpolate({
    inputRange: [0, 6, 18, PULL_SYNC_THRESHOLD],
    outputRange: [0, 0.45, 0.85, 1],
    extrapolate: 'clamp',
  });

  const pullIndicatorTranslateY = pullTranslateY.interpolate({
    inputRange: [0, 10, 24, SHEET_PULL_RANGE],
    outputRange: [-32, -18, -4, 0],
    extrapolate: 'clamp',
  });

  const runSyncAnimation = useCallback(() => {
    pullSyncLockRef.current = true;
    setPullPhaseSafe('syncing');
    if (isMobile) Vibration.vibrate(20);
    pullTranslateY.stopAnimation();
    pullChrome.stopAnimation();
    Animated.parallel([
      Animated.timing(pullTranslateY, {
        toValue: 38,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(pullChrome, {
        toValue: 38,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();
  }, [pullChrome, pullTranslateY, setPullPhaseSafe]);

  const endSyncAnimation = useCallback(() => {
    pullSyncLockRef.current = false;
    resetPullState(false);
  }, [resetPullState]);

  const markPullPrompted = useCallback(() => {
    pullGesturePromptedRef.current = true;
  }, []);

  const clearPullPrompted = useCallback(() => {
    pullGesturePromptedRef.current = false;
  }, []);

  return {
    scrollViewRef,
    pullPhase,
    pullGestureEnabled,
    pullPanGesture,
    sheetTranslateY,
    contentSheetRadiusStyle,
    pullHeaderSlotHeight: PULL_HEADER_SLOT_HEIGHT,
    pullIndicatorOpacity,
    pullIndicatorTranslateY,
    onDashboardScroll,
    onDashboardScrollBeginDrag,
    onDashboardScrollEndDrag,
    onDashboardMomentumScrollEnd,
    pullZoneHandlers,
    finishPullGesture,
    resetPullState,
    runSyncAnimation,
    endSyncAnimation,
    markPullPrompted,
    clearPullPrompted,
  };
}
