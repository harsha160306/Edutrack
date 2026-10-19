import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
  Easing,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Home, BarChart3, Search, ScanLine, CalendarCheck, Award } from 'lucide-react-native';
import {
  getNavChromeTokens,
  navActionPrimaryStyle,
  navActionSecondaryStyle,
  navChipElevation,
} from './apple_material';
import {
  NavGlassContainer,
  NavGlassView,
  isLiquidGlassSupported,
} from './liquidGlassNav';
import { NavTabAnimatedIcon, NavActionAnimatedIcon } from './NavBottomAnimatedIcon';

export const TAB_BAR_CORE_HEIGHT = 64;
export const TAB_BAR_SIDE_MARGIN = 16;
export const TAB_BAR_BOTTOM_GAP = 8;
export const ACTION_GAP = 12;

const TAB_INSET = 5;
const TAB_SLOT_HEIGHT = TAB_BAR_CORE_HEIGHT - TAB_INSET * 2;
const PILL_GAP = 4;

const CLUSTER_TRAY_PADDING = 0;

export const getBottomSafeInset = (bottomInset = 0) =>
  Math.max(
    bottomInset,
    Platform.OS === 'ios' ? 6 : 8,
    Platform.OS === 'web' && bottomInset < 1 ? 12 : 0,
  );

export const getDashboardBottomNavBarHeight = (bottomInset = 0) => {
  const safeBottom = getBottomSafeInset(bottomInset);
  return TAB_BAR_CORE_HEIGHT + CLUSTER_TRAY_PADDING + TAB_BAR_BOTTOM_GAP + safeBottom;
};

export const getDashboardBottomNavOffset = (bottomInset = 0) =>
  getDashboardBottomNavBarHeight(bottomInset) + 28;

export const ACTION_SHEET_NAV_GAP = 12;
export const getActionSheetBottomOffset = (bottomInset = 0) =>
  getDashboardBottomNavBarHeight(bottomInset) + ACTION_SHEET_NAV_GAP;

const FACULTY_TABS = [
  { id: 'home', label: 'Home', Icon: Home },
  { id: 'notices', label: 'Analytics', Icon: BarChart3 },
];

const STUDENT_TABS = [
  { id: 'home', label: 'Home', Icon: Home },
  { id: 'attendance', label: 'Attendance', Icon: CalendarCheck },
  { id: 'marks', label: 'Academic Marks', Icon: Award },
];

const ALL_TAB_IDS = ['home', 'notices', 'attendance', 'marks'];

const SPRING = {
  tension: 112,
  friction: 22,
  useNativeDriver: false,
};

const FADE_MS = 280;

const CircleAction = ({
  onPress,
  accessibilityLabel,
  isDark,
  variant = 'secondary',
  actionKind = 'search',
  children,
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const [iconPressed, setIconPressed] = useState(false);
  const isPrimary = variant === 'primary';

  const circleStyle = [
    styles.actionCircle,
    isPrimary ? navActionPrimaryStyle(isDark) : navActionSecondaryStyle(isDark),
    navChipElevation(isDark),
    Platform.OS === 'web' && isPrimary && styles.actionPrimaryWeb,
  ];

  const content = isPrimary ? (
    <View style={circleStyle}>{children}</View>
  ) : (
    <NavGlassView isDark={isDark} variant="chip" style={styles.actionCircle} interactive>
      {children}
    </NavGlassView>
  );

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={() => {
        setIconPressed(true);
        Animated.spring(scale, {
          toValue: 0.92,
          tension: 300,
          friction: 12,
          useNativeDriver: true,
        }).start();
      }}
      onPressOut={() => {
        setIconPressed(false);
        Animated.spring(scale, {
          toValue: 1,
          tension: 200,
          friction: 10,
          useNativeDriver: true,
        }).start();
      }}
      activeOpacity={1}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <NavActionAnimatedIcon kind={actionKind} pressed={iconPressed}>
          {content}
        </NavActionAnimatedIcon>
      </Animated.View>
    </TouchableOpacity>
  );
};

export const DashboardBottomNav = ({
  isDark,
  activeTab = 'home',
  onTabChange,
  onSearchPress,
  onScanPress,
  showScan = false,
  noticesBadge = false,
  isFaculty = true,
}) => {
  if (Platform.OS === 'web') return null;

  const tabs = isFaculty ? FACULTY_TABS : STUDENT_TABS;

  const { width: viewportWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const bottomPad = getBottomSafeInset(insets.bottom);
  const isSmallMobile = viewportWidth <= 380;
  const {
    selectedIcon,
    labelActive,
    inactive,
    activePillBg,
    activePillBorder,
    trackWellBg,
    scanIcon,
    searchIcon,
  } = getNavChromeTokens(isDark);

  const [trackWidth, setTrackWidth] = useState(0);
  const pillLeft = useRef(new Animated.Value(PILL_GAP)).current;
  const pillWidth = useRef(new Animated.Value(0)).current;
  const pillReady = useRef(false);

  const labelOpacity = useRef(
    ALL_TAB_IDS.reduce((acc, id) => {
      acc[id] = new Animated.Value(activeTab === id ? 1 : 0);
      return acc;
    }, {}),
  ).current;

  const labelWidth = useRef(
    ALL_TAB_IDS.reduce((acc, id) => {
      acc[id] = new Animated.Value(activeTab === id ? 1 : 0);
      return acc;
    }, {}),
  ).current;

  const segmentWidth = trackWidth > 0 ? trackWidth / tabs.length : 0;

  const movePillToIndex = (index, animated) => {
    if (segmentWidth <= 0) return;
    const activeInset = isSmallMobile ? 2 : PILL_GAP;
    const minPillWidth = !isFaculty ? 60 : (isSmallMobile ? 80 : 76);
    const left = index * segmentWidth + activeInset;
    const width = Math.max(segmentWidth - activeInset * 2, minPillWidth);

    if (!animated || !pillReady.current) {
      pillLeft.setValue(left);
      pillWidth.setValue(width);
      pillReady.current = true;
      return;
    }

    Animated.parallel([
      Animated.spring(pillLeft, { toValue: left, ...SPRING }),
      Animated.spring(pillWidth, { toValue: width, ...SPRING }),
    ]).start();
  };

  const animateTabChange = (tabId) => {
    const index = tabs.findIndex((t) => t.id === tabId);
    if (index < 0) return;

    movePillToIndex(index, true);

    tabs.forEach((tab) => {
      const selected = tab.id === tabId;
      if (labelOpacity[tab.id] && labelWidth[tab.id]) {
        Animated.parallel([
          Animated.timing(labelOpacity[tab.id], {
            toValue: selected ? 1 : 0,
            duration: FADE_MS,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
          }),
          Animated.timing(labelWidth[tab.id], {
            toValue: selected ? 1 : 0,
            duration: FADE_MS,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
          }),
        ]).start();
      }
    });
  };

  useEffect(() => {
    const index = tabs.findIndex((t) => t.id === activeTab);
    if (index >= 0 && segmentWidth > 0) {
      if (pillReady.current) {
        animateTabChange(activeTab);
      } else {
        movePillToIndex(index, false);
        tabs.forEach((tab) => {
          const selected = tab.id === activeTab;
          labelOpacity[tab.id]?.setValue(selected ? 1 : 0);
          labelWidth[tab.id]?.setValue(selected ? 1 : 0);
        });
        pillReady.current = true;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, segmentWidth, isSmallMobile, tabs]);

  const handleTabPress = (tabId) => {
    if (tabId === activeTab) return;
    onTabChange?.(tabId);
  };

  const scrimColors = isDark
    ? ['rgba(11, 18, 32, 0)', 'rgba(11, 18, 32, 0.3)', 'rgba(11, 18, 32, 0.5)']
    : ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.65)', 'rgba(255, 255, 255, 0.9)'];

  const safeZoneHeight = bottomPad + TAB_BAR_BOTTOM_GAP;
  const safeZoneFillColors = isDark
    ? ['rgba(11, 18, 32, 0.72)', 'rgba(11, 18, 32, 0.96)', 'rgba(11, 18, 32, 1)']
    : ['rgba(255, 255, 255, 0.72)', 'rgba(255, 255, 255, 0.96)', 'rgba(255, 255, 255, 1)'];

  return (
    <View
      style={[styles.shell, { paddingBottom: safeZoneHeight }]}
      pointerEvents="box-none"
    >
      {!isLiquidGlassSupported ? (
        <LinearGradient
          pointerEvents="none"
          colors={scrimColors}
          locations={[0, 0.5, 1]}
          style={styles.bottomScrim}
        />
      ) : isDark && safeZoneHeight > 0 ? (
        <View
          pointerEvents="none"
          style={[
            styles.bottomSafeZoneFill,
            { height: safeZoneHeight, backgroundColor: '#0B1220' },
          ]}
        />
      ) : safeZoneHeight > 0 ? (
        <LinearGradient
          pointerEvents="none"
          colors={safeZoneFillColors}
          locations={[0, 0.42, 1]}
          style={[styles.bottomSafeZoneFill, { height: safeZoneHeight + 10 }]}
        />
      ) : null}

      <NavGlassContainer spacing={ACTION_GAP} style={styles.glassCluster}>
        <View style={[styles.mainFlex, styles.mainOuter]}>
          <NavGlassView isDark={isDark} variant="pill" style={styles.mainPill}>
            <View style={styles.tabsRow}>
              <View
                style={[styles.tabsTrack, trackWellBg !== 'transparent' && { backgroundColor: trackWellBg }]}
                onLayout={(e) => {
                  const w = e.nativeEvent.layout.width;
                  if (w > 0 && Math.abs(w - trackWidth) > 1) {
                    setTrackWidth(w);
                  }
                }}
              >
                {segmentWidth > 0 ? (
                  <Animated.View
                    pointerEvents="none"
                    style={[
                      styles.slidingPill,
                      {
                        backgroundColor: activePillBg,
                        borderColor: activePillBorder,
                        borderWidth:
                          !isDark && activePillBorder !== 'transparent' ? 1 : 0,
                        left: pillLeft,
                        width: pillWidth,
                      },
                    ]}
                  />
                ) : null}

                {tabs.map((tab) => {
                  const selected = activeTab === tab.id;
                  const Icon = tab.Icon;
                  const showBadge = tab.id === 'notices' && noticesBadge;
                  const iconColor = selected ? selectedIcon : inactive;
                  const labelColor = selected ? labelActive : inactive;

                  if (!isFaculty) {
                    return (
                      <TouchableOpacity
                        key={tab.id}
                        style={styles.tabCell}
                        onPress={() => handleTabPress(tab.id)}
                        activeOpacity={0.85}
                        accessibilityRole="tab"
                        accessibilityState={{ selected }}
                        accessibilityLabel={tab.label}
                      >
                        <View style={styles.verticalTabInner}>
                          <View style={styles.verticalIconSlot}>
                            <NavTabAnimatedIcon
                              active={selected}
                              variant={tab.id === 'attendance' ? 'notices' : 'home'}
                            >
                              <Icon
                                size={19}
                                color={iconColor}
                                strokeWidth={selected ? 2.4 : isDark ? 1.85 : 2.1}
                              />
                            </NavTabAnimatedIcon>
                          </View>
                          <Text
                            style={[
                              styles.verticalTabLabel,
                              {
                                color: labelColor,
                                fontWeight: selected ? '700' : '500',
                              },
                            ]}
                            numberOfLines={1}
                          >
                            {tab.label}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  }

                  const labelMaxWidth = labelWidth[tab.id].interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 76],
                  });

                  return (
                    <TouchableOpacity
                      key={tab.id}
                      style={styles.tabCell}
                      onPress={() => handleTabPress(tab.id)}
                      activeOpacity={0.85}
                      accessibilityRole="tab"
                      accessibilityState={{ selected }}
                      accessibilityLabel={tab.label}
                    >
                      <View style={styles.tabInner}>
                        <View style={styles.iconSlot}>
                          <NavTabAnimatedIcon
                            active={selected}
                            variant={tab.id === 'notices' ? 'notices' : 'home'}
                          >
                            <Icon
                              size={22}
                              color={iconColor}
                              strokeWidth={selected ? 2.4 : isDark ? 1.85 : 2.15}
                            />
                          </NavTabAnimatedIcon>
                          {showBadge ? <View style={styles.badge} /> : null}
                        </View>
                        <Animated.View
                          style={[
                            styles.labelWrap,
                            {
                              opacity: labelOpacity[tab.id],
                              maxWidth: labelMaxWidth,
                            },
                          ]}
                        >
                          <Text
                            style={[styles.tabLabel, { color: labelColor }]}
                            numberOfLines={1}
                          >
                            {tab.label}
                          </Text>
                        </Animated.View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </NavGlassView>
        </View>

        {isFaculty ? (
          <CircleAction
            onPress={onSearchPress}
            accessibilityLabel="Search"
            isDark={isDark}
            actionKind="search"
          >
            <Search size={22} color={searchIcon} strokeWidth={2.1} />
          </CircleAction>
        ) : null}

        {showScan ? (
          <CircleAction
            onPress={onScanPress}
            accessibilityLabel="Scan barcode"
            isDark={isDark}
            actionKind="barcode"
          >
            <ScanLine size={22} color={scanIcon} strokeWidth={2.2} />
          </CircleAction>
        ) : null}
      </NavGlassContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  shell: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: TAB_BAR_SIDE_MARGIN,
    zIndex: 200,
    alignItems: 'center',
  },
  bottomScrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 96,
    zIndex: 0,
  },
  /** Fills home-indicator inset when native liquid glass skips the full bottom scrim. */
  bottomSafeZoneFill: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  glassCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 480,
    zIndex: 1,
  },
  mainFlex: {
    flex: 1,
    minWidth: 0,
  },
  mainOuter: {
    borderRadius: TAB_BAR_CORE_HEIGHT / 2,
  },
  mainPill: {
    height: TAB_BAR_CORE_HEIGHT,
    borderRadius: TAB_BAR_CORE_HEIGHT / 2,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  tabsRow: {
    flex: 1,
    width: '100%',
    padding: TAB_INSET,
  },
  tabsTrack: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    minHeight: TAB_SLOT_HEIGHT,
    borderRadius: TAB_SLOT_HEIGHT / 2,
  },
  slidingPill: {
    position: 'absolute',
    top: 0,
    height: TAB_SLOT_HEIGHT,
    borderRadius: TAB_SLOT_HEIGHT / 2,
    zIndex: 0,
  },
  tabCell: {
    flex: 1,
    height: TAB_SLOT_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  tabInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 8,
  },
  iconSlot: {
    position: 'relative',
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  labelWrap: {
    overflow: 'hidden',
  },
  actionCircle: {
    width: TAB_BAR_CORE_HEIGHT,
    height: TAB_BAR_CORE_HEIGHT,
    borderRadius: TAB_BAR_CORE_HEIGHT / 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionPrimaryWeb: {
    boxShadow: '0 10px 28px rgba(15, 23, 42, 0.18)',
  },
  badge: {
    position: 'absolute',
    top: -1,
    right: -4,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#ffffff',
    zIndex: 2,
  },
  verticalTabInner: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  verticalIconSlot: {
    width: 24,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  verticalTabLabel: {
    fontSize: 10.5,
    letterSpacing: -0.2,
    textAlign: 'center',
  },
});
