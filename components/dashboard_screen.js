import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable,
  Dimensions,
  useWindowDimensions,
  Animated,
  FlatList,
  Platform,
  Vibration,
  Alert,
  Easing,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, {
  Circle,
  Defs,
  Line,
  Pattern,
  Rect,
  Stop,
  LinearGradient as SvgLinearGradient,
} from 'react-native-svg';

const DashboardScrollView = Animated.ScrollView;

import { 
  Clock, 
  Users, 
  UserCheck, 
  ChevronRight, 
  Bell, 
  Plus, 
  LayoutGrid, 
  List,
  ScanLine,
  Search, 
  ClipboardList, 
  FileText,
  Copy,
  AlertTriangle,
  User,
  Settings,
  HelpCircle,
  LogOut,
  LockOpen,
  KeyRound,
  RefreshCw,
  History,
  WifiOff,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react-native';
import {
  useMpinSetupStatus,
  MpinSetupTopBanner,
  NotificationsSheet,
  isMpinSetupNotification,
} from '../features/mpin-setup-status';
import {
  useFacultyOfflineSync,
  OfflineSyncBanner,
  runPostLoginSync,
} from '../features/faculty-offline-sync';
import {
  useNetworkStatus,
  getNetworkStatusIcon,
  NetworkStatusActionSheet,
  loadAutoSyncEnabled,
  saveAutoSyncEnabled,
  loadAutoSyncIntervalMinutes,
  saveAutoSyncIntervalMinutes,
} from '../features/network-status';
import {
  NETWORK_STATUS,
  NETWORK_STATUS_THEME,
  NETWORK_STATUS_PILL,
} from '../features/network-status/constants';
import {
  useBiometricEnableReminder,
  BiometricEnableTopBanner,
  enableBiometricUnlockForAccount,
  isBiometricEnableNotification,
} from '../features/biometric-enable-reminder';
import {
  StudentDisciplineFinesCard,
  useStudentDisciplineFines,
} from '../features/student-discipline';
import { getUnreadNotificationCount } from '../features/mpin-setup-status/buildMpinNotifications';
import { MenuThemeSwitcher } from '../features/theme';
import {
  DashboardBottomNav,
  getDashboardBottomNavOffset,
} from './DashboardBottomNav';
import { AnalyticsWorkInProgressScreen } from './AnalyticsWorkInProgressScreen';
import { AppleAlertModal } from './AppleAlertModal';
import { useBottomSheetMotion } from './bottomSheetMotion';
import {
  BottomSheetHeader,
  bottomSheetOverlayStyles,
  bottomSheetSurfaceStyles,
  getBottomSheetColors,
  getBottomSheetSafePadding,
} from './bottomSheetLayout';
import { QuickAction3DIcon } from './QuickAction3DIcon';
import { ProfileAvatar } from './ProfileAvatar';
import { getAccountDisplay } from '../features/account/getAccountDisplay';
import { generateBarcodeData } from '../features/account/barcodeGenerator.js';
import { PullSyncGestureLayer, useReversePullSync } from '../features/reverse-pull-sync';
import { MarkLatecomerPromptModal, ScanApprovalModeModal } from '../features/id-card-scan';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  DashboardBackdrop,
  DASHBOARD_LIGHT_GRADIENT,
  DASHBOARD_LIGHT_SURFACES,
  DASHBOARD_DARK_GRADIENT,
  DASHBOARD_DARK_SURFACES,
  DASHBOARD_DARK_ACCENT_BG,
  getDashboardHeaderChrome,
  getDashboardContentSheetStyle,
  getDashboardAccentBackground,
  getDashboardAccentBorderColor,
  hexToRgba,
} from './apple_material';

const { width } = Dimensions.get('window');
// Adjusted width for centered snapping cards
const HERO_SIDE_PAD = 20;
/** Full-width snap page — only one card visible at a time. */
const CARD_ITEM_WIDTH = width;
const CARD_WIDTH = width - HERO_SIDE_PAD * 2;
const HERO_CARD_RADIUS = 24;
const HERO_CARD_MIN_HEIGHT = 204;
const HERO_CARD_MIN_HEIGHT_COMPACT = 228;
const COMPACT_LAYOUT_WIDTH = 380;
const NARROW_LAYOUT_WIDTH = 340;
const CONTENT_SHEET_TOP_RADIUS = 24;
/** Vertical scroll (px) over which top corners ease from rounded → straight. */
const SHEET_RADIUS_SCROLL_RANGE = 56;
/** Packgeon-style filter chips — separate pills, indigo active, white inactive. */
const SEGMENT_SWITCHER = {
  radius: 999,
  gap: 8,
  light: {
    activeBg: '#5D3FD3',
    activeFg: '#FFFFFF',
    inactiveBg: '#FFFFFF',
    inactiveFg: '#0F172A',
    inactiveBorder: '#E8EDF3',
  },
  dark: {
    activeBg: '#6366F1',
    activeFg: '#FFFFFF',
    inactiveBg: DASHBOARD_DARK_SURFACES.track,
    inactiveFg: '#CBD5E1',
    inactiveBorder: DASHBOARD_DARK_SURFACES.border,
  },
};
const ACTIVITY_CARD_HEADER_GRADIENT = ['#38BDF8', '#BAE6FD'];
const ACTIVITY_CARD_DARK_SURFACE = DASHBOARD_DARK_SURFACES.sheet;
const ACTIVITY_CARD_DARK_ACCENT = DASHBOARD_DARK_SURFACES.border;

/** Carousel page slot (card only) — extra space so bottom corners are not clipped. */
const HERO_SLOT_HEIGHT = HERO_CARD_MIN_HEIGHT_COMPACT + 20;
const HERO_LIST_TOP_MARGIN = 0;
const HERO_INDICATOR_AREA_HEIGHT = 40;
/** Carousel strip only (card slot + top inset). */
const HERO_CAROUSEL_BLOCK_HEIGHT = HERO_SLOT_HEIGHT + HERO_LIST_TOP_MARGIN;
/** Carousel + indicator/mail row. */
const HERO_SECTION_HEIGHT = HERO_CAROUSEL_BLOCK_HEIGHT + HERO_INDICATOR_AREA_HEIGHT;

/** Matches reference: 20px repeat, 40px tile, rgba(0,0,0,0.1) cross-grid on #fafafa. */
const DIAGONAL_GRID_REPEAT = 20;
const DIAGONAL_GRID_SIZE = 40;
const PULL_SYNC_MAX_HEIGHT = 8;
const DASHBOARD_TOP_PATTERN_HEIGHT = PULL_SYNC_MAX_HEIGHT + HERO_SECTION_HEIGHT;

const getDiagonalGridLineRgba = (isDark) =>
  isDark ? DASHBOARD_DARK_SURFACES.patternGrid : 'rgba(245, 158, 11, 0.1)';

const getDiagonalGridWebCss = (isDark) => {
  const line = getDiagonalGridLineRgba(isDark);
  return {
    backgroundImage: `repeating-linear-gradient(45deg, ${line} 0, ${line} 1px, transparent 1px, transparent ${DIAGONAL_GRID_REPEAT}px), repeating-linear-gradient(-45deg, ${line} 0, ${line} 1px, transparent 1px, transparent ${DIAGONAL_GRID_REPEAT}px)`,
    backgroundSize: `${DIAGONAL_GRID_SIZE}px ${DIAGONAL_GRID_SIZE}px`,
    backgroundRepeat: 'repeat',
    backgroundPosition: '0 0',
  };
};

const DASHBOARD_PATTERN_BASE_LIGHT = DASHBOARD_LIGHT_SURFACES.track;
const DASHBOARD_PATTERN_BASE_DARK = DASHBOARD_DARK_SURFACES.canvas;

/** Native-only SVG tile — one 40×40 cell matches web backgroundSize. */
const DiagonalGridNativeLayer = ({ isDark, patternKey, style }) => {
  if (Platform.OS === 'android') {
    return <View style={[styles.dashboardTopPatternBg, style]} pointerEvents="none" />;
  }

  const lineColor = getDiagonalGridLineRgba(isDark);
  const gridId = `diagGrid-${patternKey}`;
  const half = DIAGONAL_GRID_SIZE / 2;

  return (
    <View style={[styles.dashboardTopPatternBg, style]} pointerEvents="none">
      <Svg style={StyleSheet.absoluteFill}>
        <Defs>
          <Pattern
            id={gridId}
            width={DIAGONAL_GRID_SIZE}
            height={DIAGONAL_GRID_SIZE}
            patternUnits="userSpaceOnUse"
          >
            <Line x1={0} y1={half} x2={half} y2={0} stroke={lineColor} strokeWidth={1} />
            <Line x1={half} y1={DIAGONAL_GRID_SIZE} x2={DIAGONAL_GRID_SIZE} y2={half} stroke={lineColor} strokeWidth={1} />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${gridId})`} />
      </Svg>
    </View>
  );
};

const MiniBarcode = ({ value = '000000000000', showDigits = false, showIdCode = false }) => {
  const barcode = useMemo(() => generateBarcodeData(value), [value]);

  const isUpc = barcode.kind === 'upc-a';
  const isShortNumeric = barcode.kind === 'numeric-4' || (barcode.kind === 'numeric' && String(value ?? '').length <= 6);
  const moduleW = isUpc ? 1.2 : 1.0;
  const quiet = isUpc ? 6 : 5;
  const barHeight = isUpc ? 24 : isShortNumeric ? 18 : 20;
  const intrinsicWidth = quiet * 2 + barcode.pattern.length * moduleW;
  const maxWidth = isUpc ? 176 : isShortNumeric ? 140 : 160;
  const desiredWidth = Math.min(maxWidth, intrinsicWidth);

  return (
    <View style={styles.userCardBarcodeWrap} pointerEvents="none">
      <Svg
        width={desiredWidth}
        height={barHeight}
        viewBox={`0 0 ${intrinsicWidth} ${barHeight}`}
        preserveAspectRatio="none"
      >
        <Rect x={0} y={0} width={intrinsicWidth} height={barHeight} fill="#FFFFFF" />
        {barcode.pattern.split('').map((bit, i) =>
          bit === '1' ? (
            <Rect
              key={`b-${i}`}
              x={quiet + i * moduleW}
              y={0}
              width={moduleW}
              height={barHeight}
              fill="#111827"
            />
          ) : null
        )}
      </Svg>
      {showDigits ? (
        <View style={styles.userCardBarcodeDigits}>
          {barcode.groups.map((g, idx) =>
            g ? (
              <Text key={`g-${idx}`} style={styles.userCardBarcodeDigit}>
                {g}
              </Text>
            ) : (
              <View key={`g-${idx}`} style={{ width: 12 }} />
            ),
          )}
        </View>
      ) : null}
      {showIdCode ? (
        <Text style={styles.userCardBarcodeIdCode} numberOfLines={1}>
          {String(value ?? '')}
        </Text>
      ) : null}
    </View>
  );
};

const DashboardTopPatternBlock = ({ isDark, children }) => {
  const patternBase = isDark ? DASHBOARD_PATTERN_BASE_DARK : DASHBOARD_PATTERN_BASE_LIGHT;

  return (
    <View
      style={[styles.dashboardTopBlock, { backgroundColor: patternBase }]}
    >
      {Platform.OS === 'web'
        ? React.createElement('div', {
            'aria-hidden': true,
            style: {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 0,
              pointerEvents: 'none',
              backgroundColor: patternBase,
              backgroundPosition: '0 0',
              ...getDiagonalGridWebCss(isDark),
            },
          })
        : (
          <DiagonalGridNativeLayer
            isDark={isDark}
            patternKey="dashboard-top"
          />
        )}
      <View style={styles.dashboardTopBlockContent}>{children}</View>
    </View>
  );
};

const DEMO_LATECOMERS = {
  submitted: [
    {
      id: 'sk',
      initials: 'SK',
      name: 'SANDEEP K.',
      idNo: '22H71A05A1',
      dept: 'CSE-3A',
      date: '03 May 2026',
      time: '09:42 AM',
    },
    {
      id: 'ma',
      initials: 'MA',
      name: 'MOHIT A.',
      idNo: '22H71A0442',
      dept: 'ECE-2B',
      date: '03 May 2026',
      time: '10:15 AM',
    },
  ],
  today: [
    {
      id: 'sk',
      initials: 'SK',
      name: 'SANDEEP K.',
      idNo: '22H71A05A1',
      dept: 'CSE-3A',
      date: '03 May 2026',
      time: '09:42 AM',
    },
    {
      id: 'ma',
      initials: 'MA',
      name: 'MOHIT A.',
      idNo: '22H71A0442',
      dept: 'ECE-2B',
      date: '03 May 2026',
      time: '10:15 AM',
    },
    {
      id: 'rp',
      initials: 'RP',
      name: 'RIYA P.',
      idNo: '22H71A03B5',
      dept: 'MECH-1C',
      date: '03 May 2026',
      time: '11:03 AM',
    },
    {
      id: 'ak',
      initials: 'AK',
      name: 'ANIKET K.',
      idNo: '22H71A06C2',
      dept: 'CSE-2B',
      date: '03 May 2026',
      time: '11:47 AM',
    },
  ],
};

const formatPullSyncTimestamp = () => {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, '0');
  const hours24 = now.getHours();
  const ampm = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 || 12;
  return `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()} ${pad(hours12)}:${pad(now.getMinutes())}:${pad(now.getSeconds())} ${ampm}`;
};

const formatActivitySectionDate = () => {
  const now = new Date();
  return now.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const PullSyncIndicator = React.memo(({ phase, isDark }) => {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (phase !== 'syncing') {
      spin.stopAnimation();
      spin.setValue(0);
      return undefined;
    }
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1100,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [phase, spin]);

  const spinRotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const label =
    phase === 'syncing'
      ? 'Syncing…'
      : phase === 'hold'
        ? 'Hold to sync'
      : phase === 'ready'
        ? 'Release to sync'
        : 'Pull to sync';

  const accent = isDark ? '#FBBF24' : '#B45309';
  const muted = isDark ? '#CBD5E1' : '#64748B';

  return (
    <View pointerEvents="none" style={styles.pullSyncOverlay}>
      {phase === 'syncing' ? (
        <Animated.View style={{ transform: [{ rotate: spinRotate }] }}>
          <RefreshCw size={15} color={accent} strokeWidth={2.5} />
        </Animated.View>
      ) : (
        <RefreshCw size={15} color={accent} strokeWidth={2.5} />
      )}
      <Text style={[styles.pullSyncText, { color: muted }]}>{label}</Text>
    </View>
  );
});

export const DashboardScreen = ({
  colors,
  isDark,
  role = 'faculty',
  accountId = role,
  mpinStatusRefreshKey = 0,
  postLoginSyncNonce = 0,
  onPostLoginOffline,
  onSetupMpin,
  onSignOut,
  onLockApp,
  onScan,
  onSearch,
  onMembers,
  onOpenMarked,
  onOpenHistory,
  onOpenSettings,
  onOpenAttendance,
  onOpenMarks,
  onOpenStudentRecord,
  onOpenStudentNotices,
  onOpenStudentProfile,
  themePreference = 'system',
  onThemePreferenceChange,
}) => {
  const [heroIndex, setHeroIndex] = useState(0);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [networkSheetOpen, setNetworkSheetOpen] = useState(false);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [autoSyncIntervalMinutes, setAutoSyncIntervalMinutes] = useState(5);
  const [activityTab, setActivityTab] = useState('submitted');
  const [activityViewMode, setActivityViewMode] = useState('grid');
  const [quickActionTab, setQuickActionTab] = useState('daily');
  const [enablingBiometric, setEnablingBiometric] = useState(false);
  const [activeNavTab, setActiveNavTab] = useState('home');
  const [markLatecomerModalVisible, setMarkLatecomerModalVisible] = useState(false);
  const [scanApprovalModalVisible, setScanApprovalModalVisible] = useState(false);
  const [shiftInfoVisible, setShiftInfoVisible] = useState(false);
  const { width: windowWidth } = useWindowDimensions();
  const isCompactLayout = windowWidth < COMPACT_LAYOUT_WIDTH;
  const isNarrowLayout = windowWidth < NARROW_LAYOUT_WIDTH;
  const safeInsets = useSafeAreaInsets();
  const bottomNavOffset = getDashboardBottomNavOffset(safeInsets.bottom);
  const accountSheetBottomPad = getBottomSheetSafePadding(safeInsets.bottom);
  const headerTopPad = safeInsets.top + 8;
  const isFaculty = role !== 'student';
  const {
    sheetBg: accountSheetBg,
    groupBg: accountSheetGroupBg,
    titleColor: accountSheetTitleColor,
    handleColor: accountSheetHandleColor,
  } = getBottomSheetColors(isDark);
  const {
    modalMounted: accountMenuSheetMounted,
    backdropOpacity: accountMenuBackdropOpacity,
    sheetTranslateY: accountMenuSheetTranslateY,
    requestDismiss: dismissAccountMenuSheet,
  } = useBottomSheetMotion(accountMenuOpen, () => setAccountMenuOpen(false));
  const { status: mpinStatus, notifications: mpinNotifications, refresh: refreshMpinStatus } =
    useMpinSetupStatus(accountId, mpinStatusRefreshKey);
  const {
    status: biometricReminderStatus,
    notifications: biometricNotifications,
    refresh: refreshBiometricReminder,
  } = useBiometricEnableReminder(accountId, mpinStatusRefreshKey);
  const notifications = [...mpinNotifications, ...biometricNotifications];
  const unreadCount = getUnreadNotificationCount(notifications);
  const facultySync = useFacultyOfflineSync(
    accountId,
    isFaculty,
    autoSyncEnabled,
    autoSyncIntervalMinutes,
  );
  const studentFines = useStudentDisciplineFines(!isFaculty);
  const textColor = isDark ? '#F8FAFC' : '#0F172A';
  const mutedColor = isDark ? '#94A3B8' : '#64748B';
  const cardBg = isDark ? '#1E293B' : '#FFFFFF';
  const borderCol = isDark ? '#334155' : '#E2E8F0';
  const { status: networkStatus, connectionKind } = useNetworkStatus();
  const postLoginSyncProcessedRef = useRef(0);
  const facultyRefreshRef = useRef(facultySync.refresh);
  const onPostLoginOfflineRef = useRef(onPostLoginOffline);
  facultyRefreshRef.current = facultySync.refresh;
  onPostLoginOfflineRef.current = onPostLoginOffline;

  const openMarkLatecomerPrompt = useCallback(() => {
    if (Platform.OS !== 'web') Vibration.vibrate(30);
    onScan?.({ approvalMode: 'auto', scanType: 'latecomer' });
  }, [onScan]);

  const confirmMarkLatecomerScan = useCallback(() => {
    setMarkLatecomerModalVisible(false);
    setScanApprovalModalVisible(true);
  }, []);

  const startScanWithApproval = useCallback(
    (approvalMode) => {
      setScanApprovalModalVisible(false);
      onScan?.({ approvalMode });
    },
    [onScan],
  );

  const openSearch = useCallback(() => {
    if (Platform.OS !== 'web') Vibration.vibrate(30);
    onSearch?.();
  }, [onSearch]);

  const openMembers = useCallback(() => {
    if (Platform.OS !== 'web') Vibration.vibrate(30);
    onMembers?.();
  }, [onMembers]);

  const openHistory = useCallback(() => {
    if (Platform.OS !== 'web') Vibration.vibrate(30);
    onOpenHistory?.();
  }, [onOpenHistory]);

  useEffect(() => {
    if (!postLoginSyncNonce || postLoginSyncNonce <= postLoginSyncProcessedRef.current) {
      return undefined;
    }
    postLoginSyncProcessedRef.current = postLoginSyncNonce;

    let cancelled = false;

    (async () => {
      await new Promise((resolve) => setTimeout(resolve, 350));
      if (cancelled) return;

      const result = await runPostLoginSync({
        accountId,
        role,
      });

      if (cancelled) return;

      if (result.showOfflineAlert) {
        onPostLoginOfflineRef.current?.();
      }

      await facultyRefreshRef.current();
    })();

    return () => {
      cancelled = true;
    };
  }, [postLoginSyncNonce, accountId, role]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([loadAutoSyncEnabled(), loadAutoSyncIntervalMinutes()]).then(
      ([enabled, intervalMinutes]) => {
        if (!cancelled) {
          setAutoSyncEnabled(enabled);
          setAutoSyncIntervalMinutes(intervalMinutes);
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAutoSyncChange = async (enabled) => {
    setAutoSyncEnabled(enabled);
    await saveAutoSyncEnabled(enabled);
  };

  const handleAutoSyncIntervalChange = async (minutes) => {
    setAutoSyncIntervalMinutes(minutes);
    await saveAutoSyncIntervalMinutes(minutes);
  };
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);
  const heroScrollRef = useRef(null);
  const [pullSyncModalVisible, setPullSyncModalVisible] = useState(false);
  const [pullSyncModalMode, setPullSyncModalMode] = useState(null);
  const [pullSyncModalMessage, setPullSyncModalMessage] = useState('');

  const onPullConfirmRef = useRef(() => {});

  const reversePull = useReversePullSync({
    contentSheetTopRadius: CONTENT_SHEET_TOP_RADIUS,
    sheetRadiusScrollRange: SHEET_RADIUS_SCROLL_RANGE,
    onHoldComplete: () => onPullConfirmRef.current(),
    onWebReleaseConfirm: () => onPullConfirmRef.current(),
  });

  const {
    scrollViewRef,
    pullPhase,
    pullGestureEnabled,
    pullPanGesture,
    sheetTranslateY,
    contentSheetRadiusStyle,
    pullHeaderSlotHeight,
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
  } = reversePull;

  const showPullSyncConfirm = useCallback(() => {
    markPullPrompted();
    resetPullState(false);
    setPullSyncModalMode('confirm');
    setPullSyncModalMessage('Do you want to sync now?');
    setPullSyncModalVisible(true);
  }, [markPullPrompted, resetPullState]);

  useEffect(() => {
    onPullConfirmRef.current = showPullSyncConfirm;
  }, [showPullSyncConfirm]);

  const handlePullSync = useCallback(async () => {
    if (networkStatus === NETWORK_STATUS.OFFLINE) {
      resetPullState(false);
      setPullSyncModalMode('offline');
      setPullSyncModalMessage('Please check your internet connection and try again.');
      setPullSyncModalVisible(true);
      return;
    }

    runSyncAnimation();

    try {
      await Promise.all([
        refreshMpinStatus(),
        refreshBiometricReminder(),
        isFaculty ? facultySync.syncNow() : Promise.resolve(),
      ]);
      if (!isFaculty) await facultyRefreshRef.current();
      endSyncAnimation();
      setPullSyncModalMode('success');
      setPullSyncModalMessage(`Synced on ${formatPullSyncTimestamp()}`);
      setPullSyncModalVisible(true);
    } catch {
      endSyncAnimation();
      setPullSyncModalMode('offline');
      setPullSyncModalMessage('Please check your internet connection and try again.');
      setPullSyncModalVisible(true);
    }
  }, [
    endSyncAnimation,
    facultySync,
    isFaculty,
    networkStatus,
    refreshBiometricReminder,
    refreshMpinStatus,
    resetPullState,
    runSyncAnimation,
  ]);

  const handlePullSyncCancel = useCallback(() => {
    clearPullPrompted();
    resetPullState(false);
    setPullSyncModalMode('cancelled');
    setPullSyncModalMessage('Sync cancelled.');
    setPullSyncModalVisible(true);
  }, [clearPullPrompted, resetPullState]);

  const handlePullSyncConfirm = useCallback(() => {
    setPullSyncModalVisible(false);
    setPullSyncModalMode(null);
    setPullSyncModalMessage('');
    handlePullSync();
  }, [handlePullSync]);

  const closePullSyncModal = useCallback(() => {
    setPullSyncModalVisible(false);
    setPullSyncModalMode(null);
    setPullSyncModalMessage('');
    clearPullPrompted();
    resetPullState(false);
  }, [clearPullPrompted, resetPullState]);

  const accountDisplay = useMemo(() => getAccountDisplay(isFaculty), [isFaculty]);

  const markedByYouCount = isFaculty
    ? String(facultySync.todayMarkedCount || 0)
    : '14';

  const heroCards = isFaculty ? [
    {
      id: 'u1',
      kind: 'user-card',
    },
    { 
      id: '1', 
      title: "Marked by you", 
      tag: "PERSONAL", 
      count: markedByYouCount, 
      ampm: "", 
      status: "Total recorded by you today", 
      color: "#395EE1",
      glowColor: "#EBF3FF",
      tagBg: "#EDF2FE",
      tagText: "#4271E8",
      icon: <User color="#A0BBF6" size={26} strokeWidth={2.5} />, 
      buttonText: "Mark Late",
      iconBtn: <Plus size={16} color="#fff" strokeWidth={4} style={{marginRight: 4}} />,
      onPress: openMarkLatecomerPrompt,
    },
    { 
      id: '2', 
      title: "Total latecomers", 
      tag: "COMMITTEE", 
      count: "112", 
      ampm: "", 
      status: "Recorded by all members", 
      color: "#10B981", 
      glowColor: "#ECFDF5",
      tagBg: "#ECFDF5",
      tagText: "#059669",
      icon: <Users color="#6EE7B7" size={30} strokeWidth={2.5} />, 
      buttonText: "Global Logs",
      iconBtn: <LayoutGrid size={16} color="#fff" strokeWidth={3} style={{marginRight: 4}} />,
      onPress: () => onOpenHistory?.('all'),
    },
    { 
      id: '3', 
      title: "Duty started on", 
      tag: "FACULTY", 
      count: "07:58", 
      ampm: "AM", 
      status: "Shift active since", 
      color: "#F59E0B", 
      glowColor: "#FFFBEB",
      tagBg: "#FEF3C7",
      tagText: "#D97706",
      icon: <Clock color="#FCD34D" size={30} strokeWidth={2.5} />, 
      buttonText: "Shift Info",
      iconBtn: <AlertTriangle size={16} color="#fff" strokeWidth={3} style={{marginRight: 4}} />,
      onPress: () => setShiftInfoVisible(true),
    }
  ] : [
    {
      id: 's1',
      title: 'Late entries',
      tag: 'STUDENT',
      count: '3',
      ampm: '',
      status: 'Recorded this semester',
      color: '#395EE1',
      glowColor: '#EBF3FF',
      tagBg: '#EDF2FE',
      tagText: '#4271E8',
      icon: <Clock color="#A0BBF6" size={26} strokeWidth={2.5} />,
      buttonText: 'View Log',
      iconBtn: <FileText size={16} color="#fff" strokeWidth={3} style={{ marginRight: 4 }} />,
      onPress: () => {
        if (typeof onOpenStudentRecord === 'function') onOpenStudentRecord();
      },
    },
    {
      id: 's2',
      title: 'Attendance rate',
      tag: 'CLASS',
      count: '96%',
      ampm: '',
      status: 'Your current standing',
      color: '#10B981',
      glowColor: '#ECFDF5',
      tagBg: '#ECFDF5',
      tagText: '#059669',
      icon: <UserCheck color="#6EE7B7" size={30} strokeWidth={2.5} />,
      buttonText: 'Details',
      iconBtn: <LayoutGrid size={16} color="#fff" strokeWidth={3} style={{ marginRight: 4 }} />,
      onPress: () => {
        if (typeof onOpenAttendance === 'function') onOpenAttendance();
      },
    },
    {
      id: 's3',
      title: 'New notices',
      tag: 'CAMPUS',
      count: '2',
      ampm: '',
      status: 'Unread committee updates',
      color: '#F59E0B',
      glowColor: '#FFFBEB',
      tagBg: '#FEF3C7',
      tagText: '#D97706',
      icon: <Bell color="#FCD34D" size={30} strokeWidth={2.5} />,
      buttonText: 'Read',
      iconBtn: <ChevronRight size={16} color="#fff" strokeWidth={3} style={{ marginRight: 4 }} />,
      onPress: () => {
        if (typeof onOpenStudentNotices === 'function') onOpenStudentNotices();
      },
    },
  ];

  const heroMetrics = useMemo(() => {
    const maxWidth = Platform.OS === 'web' ? Math.min(windowWidth, 900) : windowWidth;
    const itemWidth = Math.round(maxWidth);
    return {
      itemWidth,
      cardWidth: itemWidth - HERO_SIDE_PAD * 2,
    };
  }, [windowWidth]);

  const heroSnapOffsets = useMemo(
    () => heroCards.map((_, index) => index * heroMetrics.itemWidth),
    [heroCards, heroMetrics.itemWidth],
  );

  const onHeroCarouselScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false,
      listener: (event) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const nextIndex = Math.round(offsetX / heroMetrics.itemWidth);
        if (nextIndex !== heroIndex && nextIndex >= 0 && nextIndex < heroCards.length) {
          setHeroIndex(nextIndex);
        }
      },
    },
  );

  const renderHeroCarousel = () => {
    if (Platform.OS === 'web') {
      return (
        <Animated.ScrollView
          ref={heroScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToOffsets={heroSnapOffsets}
          snapToAlignment="start"
          disableIntervalMomentum
          onScroll={onHeroCarouselScroll}
          scrollEventThrottle={16}
          style={[styles.heroList, { width: heroMetrics.itemWidth }]}
          contentContainerStyle={styles.heroListContent}
        >
          {heroCards.map((item) => (
            <View key={item.id} style={[styles.heroCarouselPage, { width: heroMetrics.itemWidth }]}>
              {renderHeroItem({ item })}
            </View>
          ))}
        </Animated.ScrollView>
      );
    }

    return (
      <FlatList
        ref={flatListRef}
        data={heroCards}
        renderItem={renderHeroItem}
        horizontal
        directionalLockEnabled
        nestedScrollEnabled
        style={styles.heroList}
        contentContainerStyle={styles.heroListContent}
        snapToOffsets={heroSnapOffsets}
        snapToAlignment="start"
        disableIntervalMomentum
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        getItemLayout={(_, index) => ({
          length: heroMetrics.itemWidth,
          offset: heroMetrics.itemWidth * index,
          index,
        })}
        onScroll={onHeroCarouselScroll}
        onMomentumScrollEnd={(e) => {
          setHeroIndex(Math.round(e.nativeEvent.contentOffset.x / heroMetrics.itemWidth));
        }}
        onScrollToIndexFailed={({ index }) => {
          flatListRef.current?.scrollToOffset({
            offset: index * heroMetrics.itemWidth,
            animated: false,
          });
        }}
        keyExtractor={(item) => item.id}
        style={[styles.heroList, { width: heroMetrics.itemWidth }]}
        contentContainerStyle={styles.heroListContent}
      />
    );
  };

  // Auto-slide carousel effect
  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (heroIndex + 1) % heroCards.length;
      if (Platform.OS === 'web') {
        heroScrollRef.current?.scrollTo({
          x: nextIndex * heroMetrics.itemWidth,
        animated: true,
        });
      } else {
        flatListRef.current?.scrollToOffset({
          offset: nextIndex * heroMetrics.itemWidth,
          animated: true,
        });
      }
      setHeroIndex(nextIndex);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroIndex, heroCards.length, heroMetrics.itemWidth]);

  const handleCopyId = () => {
    if (Platform.OS !== 'web') Vibration.vibrate(50);
  };

  const renderHeroItem = ({ item }) => (
    <View style={[styles.heroCardPage, { width: heroMetrics.itemWidth }]}>
      <View
        style={[
          styles.heroCardOuter,
          { width: heroMetrics.cardWidth },
          isDark ? styles.heroCardOuterDark : styles.heroCardOuterLight,
          isCompactLayout && styles.heroCardOuterCompact,
        ]}
      >
        {item.kind === 'user-card' ? (
          <View
            style={[
              styles.heroCardInner,
              isCompactLayout && styles.heroCardInnerCompact,
              styles.userCardInner,
              isDark && styles.userCardInnerDark,
            ]}
          >
            <View style={styles.userCardBrandFloat} pointerEvents="none">
              <Text style={[styles.userCardBrandText, isDark && styles.textWhite]}>About</Text>
            </View>

            <View
              style={[
                styles.userCardAvatarFloat,
                isCompactLayout && styles.userCardAvatarFloatCompact,
              ]}
              pointerEvents="none"
            >
              <ProfileAvatar initial={accountDisplay.initial} size={isCompactLayout ? 'sm' : 'md'} />
            </View>

            <View style={styles.userCardMain}>
              {(() => {
                const displayName = accountDisplay.fullName || accountDisplay.title;
                const designation = accountDisplay.designation || accountDisplay.subtitle;
                const displayId = String(accountDisplay.empId || '').replace(/\D/g, '') || '000000';
                return (
                  <>
              <Text style={[styles.userCardName, isDark && styles.textWhite]} numberOfLines={1}>
                {displayName}
              </Text>
              {designation ? (
                <Text style={[styles.userCardRole, isDark && styles.textDarkMuted]} numberOfLines={1}>
                  {designation}
                </Text>
              ) : null}
              <Text style={[styles.userCardEmail, isDark && styles.textDarkMuted]} numberOfLines={1}>
                {accountDisplay.email}
              </Text>
                    <View style={styles.userCardBottomRow}>
                      <View>
                        <Text style={[styles.userCardMetaLabel, isDark && styles.textDarkMuted]}>ID</Text>
                        <MiniBarcode value={displayId} isDark={isDark} showDigits={false} showIdCode />
                      </View>
                      <View style={[styles.userCardMetaRight, isCompactLayout && styles.userCardMetaRightCompact]}>
                        <View style={[styles.userCardMetaInlineRow, isCompactLayout && styles.userCardMetaInlineRowCompact]}>
                          <View style={styles.userCardMetaInlineItem}>
                            <Text style={[styles.userCardMetaLabel, isDark && styles.textDarkMuted]}>
                              Academic year
                            </Text>
                            <Text
                              style={[
                                styles.userCardMetaValue,
                                isDark && styles.textWhite,
                                isCompactLayout && styles.userCardMetaValueCompact,
                              ]}
                              numberOfLines={1}
                            >
                              {accountDisplay.academicYear ?? '—'}
                            </Text>
                          </View>
                          <View style={styles.userCardMetaInlineItem}>
                            <Text style={[styles.userCardMetaLabel, isDark && styles.textDarkMuted]}>
                              Joined year
                            </Text>
                            <Text
                              style={[
                                styles.userCardMetaValue,
                                isDark && styles.textWhite,
                                isCompactLayout && styles.userCardMetaValueCompact,
                              ]}
                              numberOfLines={1}
                            >
                              {accountDisplay.joinedYear ?? '—'}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </>
                );
              })()}
            </View>
          </View>
        ) : (
        <View style={[styles.heroCardInner, isCompactLayout && styles.heroCardInnerCompact]}>
          <View style={styles.heroCardMain}>
      <View style={styles.heroHeader}>
                <Text
                  style={[styles.heroSub, isDark && styles.textDarkTitle, isNarrowLayout && styles.heroSubNarrow]}
                  numberOfLines={2}
                >
                  {item.title}
                </Text>
                <View
                  style={[
                    styles.heroTag,
                    {
                      backgroundColor: isDark
                        ? DASHBOARD_DARK_SURFACES.heroChip
                        : item.tagBg,
                    },
                  ]}
                >
                  <Text style={[styles.heroTagText, { color: isDark ? '#CBD5E1' : item.tagText }]}>
                    {item.tag}
                  </Text>
        </View>
      </View>
      
              <View style={[styles.heroBody, isCompactLayout && styles.heroBodyCompact]}>
        <View style={styles.heroCountArea}>
          <View style={styles.countRow}>
                    <Text
                      style={[
                        styles.heroCount,
                        isCompactLayout && styles.heroCountCompact,
                        isNarrowLayout && styles.heroCountNarrow,
                        isDark ? styles.textWhite : { color: item.color },
                      ]}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.72}
                    >
                      {item.count}
                    </Text>
                    {item.ampm !== '' ? (
                      <Text
                        style={[
                          styles.heroAmpm,
                          isCompactLayout && styles.heroAmpmCompact,
                          isDark && styles.textDarkMuted,
                        ]}
                      >
                        {item.ampm}
                      </Text>
                    ) : null}
          </View>
        </View>
        
                <TouchableOpacity
                  style={[
                    styles.heroBtn,
                    isCompactLayout && styles.heroBtnCompact,
                    isNarrowLayout && styles.heroBtnNarrow,
                    { backgroundColor: item.color },
                  ]}
                  activeOpacity={0.82}
                  onPress={item.onPress}
                >
          {item.iconBtn}
                  <Text style={[styles.heroBtnText, isNarrowLayout && styles.heroBtnTextNarrow]} numberOfLines={1}>
                    {item.buttonText}
                  </Text>
        </TouchableOpacity>
              </View>
      </View>

          <View style={styles.heroCardFoot}>
      <View style={[styles.heroDivider, isDark && styles.dividerDark]} />
            <TouchableOpacity
              style={[styles.heroFooter, isDark && styles.heroFooterDark]}
              activeOpacity={0.75}
              accessibilityRole="button"
              onPress={item.onPress}
            >
              <View style={styles.heroFooterIconWrap}>
                <AlertTriangle
                  size={14}
                  color={isDark ? '#FBBF24' : item.tagText || '#D97706'}
                  strokeWidth={2.4}
                />
              </View>
              <Text
                style={[styles.heroFooterText, isDark ? styles.footerTextDark : styles.footerTextLight]}
                numberOfLines={1}
              >
                {item.status}
              </Text>
              <ChevronRight size={16} color={isDark ? '#94A3B8' : '#94A3B8'} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        </View>
        )}
      </View>
    </View>
  );

  const accountMenuItems = useMemo(() => {
    const items = [];
    if (!mpinStatus?.isConfigured && onSetupMpin) {
      items.push({ id: 'mpin', label: 'Set up MPIN', Icon: KeyRound });
    }
    items.push(
      { id: 'settings', label: 'Settings', Icon: Settings },
      { id: 'help', label: 'Help & documentation', Icon: HelpCircle },
      { id: 'signout', label: 'Sign out', Icon: LogOut, destructive: true },
    );
    return items;
  }, [mpinStatus?.isConfigured, onSetupMpin]);

  const handleAccountMenuSelect = async (itemId) => {
    setAccountMenuOpen(false);
    if (Platform.OS !== 'web') Vibration.vibrate(40);
    if (itemId === 'mpin') {
      onSetupMpin?.();
      return;
    }
    if (itemId === 'settings') {
      onOpenSettings?.();
      return;
    }
    if (itemId === 'help') {
      Alert.alert('Help & documentation', 'Help and documentation will open here.');
      return;
    }
    if (itemId === 'signout') {
      await onSignOut?.();
    }
  };

  const toggleAccountMenu = useCallback(() => {
    if (Platform.OS !== 'web') Vibration.vibrate(30);
    setNotificationsOpen(false);
    setAccountMenuOpen((open) => !open);
  }, []);

  const handleLockAppPress = useCallback(() => {
    if (Platform.OS !== 'web') Vibration.vibrate(30);
    setAccountMenuOpen(false);
    setNotificationsOpen(false);
    onLockApp?.();
  }, [onLockApp]);

  const handleThemeSelect = useCallback(
    (preference) => {
      onThemePreferenceChange?.(preference);
    },
    [onThemePreferenceChange],
  );

  const renderAccountMenuPanel = () => (
    <>
      <TouchableOpacity
        style={[styles.accountMenuHeader, isDark && styles.accountMenuHeaderDark]}
        onPress={() => {
          if (!isFaculty) {
            dismissAccountMenuSheet();
            if (typeof onOpenStudentProfile === 'function') {
              onOpenStudentProfile();
            }
          }
        }}
        activeOpacity={!isFaculty ? 0.7 : 1}
      >
        <ProfileAvatar
          initial={accountDisplay.initial}
          size="md"
          showOnlineDot
          onlineDotBorderColor={
            isDark ? DASHBOARD_DARK_SURFACES.sheet : '#ffffff'
          }
        />
        <View style={styles.accountMenuMeta}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text
              style={[styles.accountMenuTitle, isDark && styles.textWhite]}
              numberOfLines={1}
            >
              {accountDisplay.title}
            </Text>
            {!isFaculty && (
              <ChevronRight size={16} color={isDark ? '#94A3B8' : '#64748B'} />
            )}
          </View>
          <Text
            style={[styles.accountMenuSubtitle, isDark && styles.textDarkMuted]}
            numberOfLines={1}
          >
            {accountDisplay.subtitle}
          </Text>
          <Text
            style={[styles.accountMenuEmail, isDark && styles.textDarkMuted]}
            numberOfLines={1}
          >
            {accountDisplay.email}
          </Text>
        </View>
      </TouchableOpacity>
      <View style={[styles.menuDivider, isDark && styles.menuDividerDark]} />
      <MenuThemeSwitcher
        value={themePreference}
        onChange={handleThemeSelect}
        isDark={isDark}
      />
      <View style={[styles.menuDivider, isDark && styles.menuDividerDark]} />
      {accountMenuItems.map((item) => {
        const Icon = item.Icon;
        return (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => handleAccountMenuSelect(item.id)}
            activeOpacity={0.65}
          >
            <Icon
              size={18}
              color={item.destructive ? '#ef4444' : isDark ? '#CBD5E1' : '#64748B'}
              strokeWidth={2.2}
            />
            <Text
              style={[
                styles.menuItemText,
                isDark && styles.textWhite,
                item.destructive && styles.menuItemDestructive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </>
  );

  const openMpinSetup = () => {
    setNotificationsOpen(false);
    setAccountMenuOpen(false);
    onSetupMpin?.();
  };

  const handleEnableBiometric = async () => {
    setAccountMenuOpen(false);
    setNotificationsOpen(false);
    setEnablingBiometric(true);
    try {
      const result = await enableBiometricUnlockForAccount(accountId);
      if (result.ok) {
        await refreshBiometricReminder();
        await refreshMpinStatus();
        Alert.alert(
          'Biometrics enabled',
          `${result.label ?? 'Biometric'} unlock is now on for this device.`,
        );
        return;
      }
      if (result.reason === 'unavailable') {
        Alert.alert('Unavailable', 'Biometrics are not available on this device.');
        return;
      }
      if (result.reason !== 'cancelled') {
        Alert.alert('Could not enable', 'Try again from the banner or notifications.');
      }
    } finally {
      setEnablingBiometric(false);
    }
  };

  const handleNotificationPress = (item) => {
    if (isMpinSetupNotification(item)) {
      openMpinSetup();
      return;
    }
    if (isBiometricEnableNotification(item)) {
      handleEnableBiometric();
      return;
    }
    setNotificationsOpen(false);
  };

  const showMpinBanner = Boolean(mpinStatus?.showTopBanner && onSetupMpin);
  const showBiometricBanner = Boolean(
    biometricReminderStatus?.showTopBanner && !showMpinBanner,
  );
  const showBellBadge = unreadCount > 0;

  const networkTheme =
    NETWORK_STATUS_THEME[networkStatus] ?? NETWORK_STATUS_THEME[NETWORK_STATUS.NETWORK];
  const networkPillSurface =
    NETWORK_STATUS_PILL[networkStatus] ?? NETWORK_STATUS_PILL[NETWORK_STATUS.ONLINE];
  const headerChrome = getDashboardHeaderChrome(
    isDark,
    networkStatus,
    networkPillSurface.light,
  );
  const statusPillSurface = headerChrome.statusPill;
  const networkAccentColor = headerChrome.statusIcon;
  const isNetworkOffline = networkStatus === NETWORK_STATUS.OFFLINE;
  const statusPillTitle = networkTheme.label;
  const NetworkStatusIcon = getNetworkStatusIcon(networkStatus, connectionKind);
  const formatSyncedOnLabel = (iso) => {
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yy = String(d.getFullYear()).slice(-2);
    return `SYNCED ON ${dd}/${mm}/${yy}`;
  };

  const latestMarkSyncedAtMs = isFaculty
    ? facultySync.todayMarksByYou.reduce((latest, mark) => {
        if (mark.syncStatus !== 'synced' || !mark.syncedAt) return latest;
        const t = new Date(mark.syncedAt).getTime();
        return !latest || t > latest ? t : latest;
      }, null)
    : null;

  const storedLastSyncedAtMs =
    isFaculty && facultySync.lastSyncedAt
      ? new Date(facultySync.lastSyncedAt).getTime()
      : null;

  const lastSyncedAtIso = useMemo(() => {
    const ms = Math.max(latestMarkSyncedAtMs ?? 0, storedLastSyncedAtMs ?? 0);
    return ms > 0 ? new Date(ms).toISOString() : null;
  }, [latestMarkSyncedAtMs, storedLastSyncedAtMs, facultySync.lastSyncedAt]);

  const syncedOnSubtitle = lastSyncedAtIso
    ? formatSyncedOnLabel(lastSyncedAtIso)
    : 'NOT SYNCED YET';

  const statusPillSubtitle = isFaculty
    ? isNetworkOffline
      ? 'MARK LATE — SYNC LATER'
      : facultySync.pendingCount > 0
        ? 'TAP SYNC ON BANNER BELOW'
        : syncedOnSubtitle
    : syncedOnSubtitle;

  const formatMarkActivityWhen = (iso) => {
    try {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return { date: '—', time: '—' };
      return {
        date: d.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        time: d.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }),
      };
    } catch {
      return { date: '—', time: '—' };
    }
  };

  const initialsFromMark = (mark) => {
    const name = mark.studentName || mark.studentId;
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getPendingSummaryColors = useCallback(
    (pendingCount, canSync) => {
      const pendingCanSync = pendingCount > 0 && canSync;
      const pendingWaiting = pendingCount > 0 && !canSync;

      if (pendingCanSync) {
        return isDark
          ? { tone: '#FBBF24', bg: 'rgba(251, 191, 36, 0.22)', syncAvailable: true }
          : { tone: '#C2410C', bg: '#FDE68A', syncAvailable: true };
      }
      if (pendingWaiting) {
        return isDark
          ? { tone: '#FCD34D', bg: 'rgba(251, 191, 36, 0.12)', syncAvailable: false }
          : { tone: '#B45309', bg: '#FEF3C7', syncAvailable: false };
      }
      return isDark
        ? { tone: '#64748B', bg: 'rgba(148, 163, 184, 0.14)', syncAvailable: false }
        : { tone: '#94A3B8', bg: '#F1F5F9', syncAvailable: false };
    },
    [isDark],
  );

  const activitySummaryItems = useMemo(() => {
    if (isFaculty) {
      const markedValue =
        facultySync.todayMarkedCount > 0
          ? String(facultySync.todayMarkedCount)
          : String(DEMO_LATECOMERS.submitted.length);
      const pendingCanSync = facultySync.pendingCount > 0 && facultySync.canSync;
      const pendingColors = getPendingSummaryColors(
        facultySync.pendingCount,
        facultySync.canSync,
      );
      if (Platform.OS === 'web') {
        const latecomersCount = facultySync.todayMarksCommittee.filter(m => m.type !== 'indiscipline').length;
        const indisciplineCount = facultySync.todayMarksCommittee.filter(m => m.type === 'indiscipline').length;

        return [
          {
            key: 'latecomers',
            Icon: UserCheck,
            tone: '#3B82F6',
            bg: getDashboardAccentBackground(isDark, '#3B82F6', '#EFF6FF'),
            value: String(latecomersCount),
            label: 'LATECOMERS',
            onPress: () => onOpenHistory?.('all'),
          },
          {
            key: 'indiscipline',
            Icon: AlertTriangle,
            tone: '#F59E0B',
            bg: getDashboardAccentBackground(isDark, '#F59E0B', '#FFFBEB'),
            value: String(indisciplineCount),
            label: 'IN-DISCIPLINE',
            onPress: () => onOpenHistory?.('all'),
          },
          {
            key: 'pending',
            Icon: RefreshCw,
            tone: pendingColors.tone,
            bg: pendingColors.bg,
            syncAvailable: pendingColors.syncAvailable,
            value: String(facultySync.pendingCount),
            label: 'PENDING',
            onPress: pendingCanSync ? () => facultySync.syncNow() : undefined,
            disabled: facultySync.isSyncing,
            accessibilityHint: pendingCanSync
              ? 'Sync pending marks'
              : facultySync.pendingCount > 0
                ? 'Sync unavailable while offline'
                : 'No pending marks to sync',
          },
        ];
      }

      return [
        {
          key: 'marked',
          Icon: UserCheck,
          tone: '#3B82F6',
          bg: getDashboardAccentBackground(isDark, '#3B82F6', '#EFF6FF'),
          value: markedValue,
          label: 'MARKED',
          onPress: () => {
            if (Platform.OS !== 'web') Vibration.vibrate(30);
            onOpenMarked?.();
          },
        },
        {
          key: 'today',
          Icon: Users,
          tone: '#10B981',
          bg: getDashboardAccentBackground(isDark, '#10B981', '#ECFDF5'),
          value:
            facultySync.committeeTodayCount > 0
              ? String(facultySync.committeeTodayCount)
              : String(DEMO_LATECOMERS.today.length),
          label: 'TODAY',
        },
        {
          key: 'pending',
          Icon: RefreshCw,
          tone: pendingColors.tone,
          bg: pendingColors.bg,
          syncAvailable: pendingColors.syncAvailable,
          value: String(facultySync.pendingCount),
          label: 'PENDING',
          onPress: pendingCanSync
            ? () => {
                if (Platform.OS !== 'web') Vibration.vibrate(30);
                facultySync.syncNow();
              }
            : undefined,
          disabled: facultySync.isSyncing,
          accessibilityHint: pendingCanSync
            ? 'Sync pending marks'
            : facultySync.pendingCount > 0
              ? 'Sync unavailable while offline'
              : 'No pending marks to sync',
        },
      ];
    }
    return [
      {
        key: 'mine',
        Icon: ClipboardList,
        tone: '#F97316',
        bg: getDashboardAccentBackground(isDark, '#F97316', '#FFF7ED'),
        value: String(DEMO_LATECOMERS.submitted.length),
        label: 'MINE',
      },
      {
        key: 'today',
        Icon: Clock,
        tone: '#3B82F6',
        bg: getDashboardAccentBackground(isDark, '#3B82F6', '#EFF6FF'),
        value: String(DEMO_LATECOMERS.today.length),
        label: 'TODAY',
      },
      {
        key: 'semester',
        Icon: FileText,
        tone: '#10B981',
        bg: getDashboardAccentBackground(isDark, '#10B981', '#ECFDF5'),
        value: '14',
        label: 'SEMESTER',
      },
    ];
  }, [
    isFaculty,
    isDark,
    facultySync.todayMarkedCount,
    facultySync.committeeTodayCount,
    facultySync.pendingCount,
    facultySync.canSync,
    facultySync.isSyncing,
    facultySync.syncNow,
    getPendingSummaryColors,
    onOpenMarked,
  ]);

  const visibleActivityEntries = useMemo(() => {
    if (isFaculty) {
      const pool =
        activityTab === 'submitted'
          ? facultySync.todayMarksByYou
          : facultySync.todayMarksCommittee;
      if (pool.length > 0) {
        return pool.map((mark) => ({ kind: 'mark', mark }));
      }
      const demoPool =
        activityTab === 'submitted' ? DEMO_LATECOMERS.submitted : DEMO_LATECOMERS.today;
      return demoPool.map((item) => ({ kind: 'demo', item }));
    }
    const pool =
      activityTab === 'submitted' ? DEMO_LATECOMERS.submitted : DEMO_LATECOMERS.today;
    return pool.map((item) => ({ kind: 'demo', item }));
  }, [
    activityTab,
    isFaculty,
    facultySync.todayMarksByYou,
    facultySync.todayMarksCommittee,
  ]);

  const normalizedActivityItems = useMemo(
    () =>
      visibleActivityEntries.map((entry) => {
        if (entry.kind === 'mark') {
          const when = formatMarkActivityWhen(entry.mark.markedAt);
          return {
            key: entry.mark.id,
            initials: initialsFromMark(entry.mark),
            name: entry.mark.studentName || entry.mark.studentId,
            id: entry.mark.studentId,
            dept: entry.mark.dept || '—',
            date: when.date,
            time: when.time,
            pendingSync: entry.mark.syncStatus === 'pending',
          };
        }
        return {
          key: entry.item.id,
          initials: entry.item.initials,
          name: entry.item.name,
          id: entry.item.idNo,
          dept: entry.item.dept,
          date: entry.item.date,
          time: entry.item.time,
          pendingSync: false,
        };
      }),
    [visibleActivityEntries],
  );

  const quickActionSwitcherOptions = useMemo(
    () => [
      // Keep DAILY tab (Scan/Search/History). Only "Daily Records" was removed.
      { id: 'daily', label: 'DAILY', Icon: ClipboardList },
      { id: 'tools', label: isFaculty ? 'COMMITTEE' : 'MORE', Icon: LayoutGrid },
    ],
    [isFaculty],
  );

  const activitySwitcherOptions = useMemo(
    () => [
      {
        id: 'submitted',
        label: 'By You',
        Icon: ClipboardList,
      },
      {
        id: 'today',
        label: 'By Committee',
        Icon: Clock,
      },
    ],
    [isFaculty],
  );

  const quickActionButtons = (() => {
    const iconBg = (light, tone) => getDashboardAccentBackground(isDark, tone, light);
    if (isFaculty) {
      if (quickActionTab === 'daily') {
        return [
          {
            key: 'late',
            label: 'LATE-',
            sublabel: 'COMER',
            Icon: ScanLine,
            tone: '#F97316',
            bg: iconBg('#FFF7ED', '#F97316'),
            onPress: () => onScan?.({ approvalMode: 'auto', scanType: 'latecomer' }),
          },
          {
            key: 'indiscipline',
            label: 'IN-',
            sublabel: 'DISCIPLINE',
            Icon: ShieldAlert,
            tone: '#EF4444',
            bg: iconBg('#FEF2F2', '#EF4444'),
            onPress: () => onScan?.({ approvalMode: 'manual', scanType: 'indiscipline' }),
          },
          {
            key: 'search',
            label: 'SEARCH',
            sublabel: 'ROLL NO',
            Icon: Search,
            tone: '#3B82F6',
            bg: iconBg('#EFF6FF', '#3B82F6'),
            onPress: openSearch,
          },
          {
            key: 'history',
            label: 'HISTORY',
            sublabel: 'LOGS',
            Icon: History,
            tone: '#10B981',
            bg: iconBg('#ECFDF5', '#10B981'),
            onPress: () => {
              if (Platform.OS !== 'web') Vibration.vibrate(30);
              onOpenHistory?.('self');
            },
          },
        ];
      }

      return [
        {
          key: 'global',
          label: 'GLOBAL',
          sublabel: 'LOGS',
          Icon: LayoutGrid,
          tone: '#10B981',
          bg: iconBg('#ECFDF5', '#10B981'),
          onPress: () => {
            if (Platform.OS !== 'web') Vibration.vibrate(30);
            onOpenHistory?.('all');
          },
        },
        {
          key: 'members',
          label: 'ALL',
          sublabel: 'MEMBERS',
          Icon: Users,
          tone: '#3B82F6',
          bg: iconBg('#EFF6FF', '#3B82F6'),
          onPress: openMembers,
        },
        {
          key: 'shift',
          label: 'SHIFT',
          sublabel: 'INFO',
          Icon: Clock,
          tone: '#F59E0B',
          bg: iconBg('#FFFBEB', '#F59E0B'),
          onPress: () => {
            if (Platform.OS !== 'web') Vibration.vibrate(30);
            setShiftInfoVisible(true);
          },
        },
      ];
    }
    if (!isFaculty) {
      if (quickActionTab === 'daily') {
        return [
          {
            key: 'record',
            label: 'MY',
            sublabel: 'RECORD',
            Icon: ClipboardList,
            tone: '#F97316',
            bg: iconBg('#FFF7ED', '#F97316'),
            onPress: () => {
              if (Platform.OS !== 'web') Vibration.vibrate(30);
              if (typeof onOpenStudentRecord === 'function') {
                onOpenStudentRecord();
              } else {
                Alert.alert('My Record', 'Your late record will open here.');
              }
            },
          },
          {
            key: 'account',
            label: 'STUDENT',
            sublabel: 'ACCOUNT',
            Icon: UserCheck,
            tone: '#10B981',
            bg: iconBg('#ECFDF5', '#10B981'),
            onPress: () => {
              if (Platform.OS !== 'web') Vibration.vibrate(30);
              setAccountMenuOpen(true);
            },
          },
        ];
      } else {
        return [
          {
            key: 'help',
            label: 'HELP',
            sublabel: 'CENTER',
            Icon: HelpCircle,
            tone: '#8B5CF6',
            bg: iconBg('#F5F3FF', '#8B5CF6'),
            onPress: () => Alert.alert('Help', 'Help center will open here.'),
          },
          {
            key: 'settings',
            label: 'APP',
            sublabel: 'SETTINGS',
            Icon: Settings,
            tone: '#64748B',
            bg: iconBg('#F1F5F9', '#64748B'),
            onPress: () => {
              if (typeof onOpenSettings === 'function') {
                onOpenSettings();
              } else {
                Alert.alert('Settings', 'Settings will open here.');
              }
            },
          },
          {
            key: 'lock',
            label: 'LOCK',
            sublabel: 'APP',
            Icon: LockOpen,
            tone: '#F59E0B',
            bg: iconBg('#FFFBEB', '#F59E0B'),
            onPress: onLockApp,
          },
        ];
      }
    }
    return [
      {
        key: 'help',
        label: 'HELP',
        sublabel: 'CENTER',
        Icon: HelpCircle,
        tone: '#3B82F6',
        bg: iconBg('#EFF6FF', '#3B82F6'),
        onPress: () => Alert.alert('Help', 'Help center will open here.'),
      },
      {
        key: 'settings',
        label: 'APP',
        sublabel: 'SETTINGS',
        Icon: Settings,
        tone: '#64748B',
        bg: iconBg('#F1F5F9', '#64748B'),
        onPress: () => Alert.alert('Settings', 'Settings will open here.'),
      },
      {
        key: 'lock',
        label: 'LOCK',
        sublabel: 'APP',
        Icon: LockOpen,
        tone: '#F59E0B',
        bg: iconBg('#FFFBEB', '#F59E0B'),
        onPress: onLockApp,
      },
    ];
  })();

  return (
    <View style={styles.container} collapsable={false}>
      <DashboardBackdrop isDark={isDark} primary={colors.primary} />

      <View style={styles.contentLayer} collapsable={false}>
      <View style={styles.headerShell}>
      <View
        style={[
          styles.header,
          { paddingTop: headerTopPad },
          isCompactLayout && styles.headerCompact,
        ]}
      >
        <View style={styles.headerLeft}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={toggleAccountMenu}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Open account menu"
            accessibilityState={{ expanded: accountMenuOpen }}
            style={styles.headerProfileTap}
          >
            <ProfileAvatar
              initial={accountDisplay.initial}
              showOnlineDot
              onlineDotBorderColor={headerChrome.profileDotBorder}
              headerDarkBorder={isDark}
            />
          </TouchableOpacity>
          
          <View
            style={[
              styles.statusPill,
              statusPillSurface,
              isDark && styles.statusPillDark,
            ]}
            accessibilityRole="text"
            accessibilityLabel={`Network ${statusPillTitle}, ${statusPillSubtitle}, ${connectionKind}`}
          >
            <View style={styles.statusInfoRow}>
              <NetworkStatusIcon
                size={14}
                color={networkAccentColor}
                strokeWidth={2.4}
              />
              <Text
                style={[
                  styles.statusDate,
                  isDark && styles.statusDateDark,
                  { color: headerChrome.statusText },
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {statusPillSubtitle}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.statusArrowBox,
                { backgroundColor: headerChrome.statusArrow ?? networkAccentColor },
              ]}
              onPress={() => setNetworkSheetOpen(true)}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel="Open network options"
            >
              <ChevronRight size={10} color="#fff" strokeWidth={5} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[
              styles.iconBtn,
              {
                backgroundColor: headerChrome.iconBtn.backgroundColor,
                borderColor: headerChrome.iconBtn.borderColor,
              },
            ]}
            onPress={() => {
              setAccountMenuOpen(false);
              if (!isFaculty && typeof onOpenStudentNotices === 'function') {
                onOpenStudentNotices();
              } else {
                setNotificationsOpen(true);
              }
            }}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
          >
            <Bell size={18} color={headerChrome.iconColor} strokeWidth={2.5} />
            {showBellBadge ? (
              <View style={[styles.notificationDot, isDark && styles.notificationDotDark]} />
            ) : null}
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.iconBtn,
              {
                backgroundColor: headerChrome.iconBtn.backgroundColor,
                borderColor: headerChrome.iconBtn.borderColor,
              },
            ]}
            onPress={handleLockAppPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Lock app"
          >
            <LockOpen size={18} color={headerChrome.iconColor} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
        </View>
      </View>

      {showMpinBanner ? (
        <MpinSetupTopBanner colors={colors} isDark={isDark} onPress={openMpinSetup} />
      ) : null}

      {showBiometricBanner ? (
        <BiometricEnableTopBanner
          colors={colors}
          isDark={isDark}
          biometricLabel={biometricReminderStatus?.biometricLabel}
          onPress={handleEnableBiometric}
          enabling={enablingBiometric}
        />
      ) : null}

      {isFaculty ? (
        <OfflineSyncBanner
          colors={colors}
          isDark={isDark}
          isOffline={facultySync.isOffline}
          pendingCount={facultySync.pendingCount}
          isSyncing={facultySync.isSyncing}
          canSync={facultySync.canSync}
          onSyncPress={facultySync.syncNow}
        />
      ) : null}

      <Animated.View
        style={[
          styles.contentSheetOuter,
          { transform: [{ translateY: sheetTranslateY }] },
        ]}
      >
      <Animated.View
        style={[
          styles.contentSheet,
          Platform.OS === 'web' && styles.contentSheetWeb,
          getDashboardContentSheetStyle(isDark),
          contentSheetRadiusStyle,
        ]}
      >
      {activeNavTab === 'notices' ? (
        <AnalyticsWorkInProgressScreen
          isDark={isDark}
          bottomOffset={bottomNavOffset}
        />
      ) : (
      <DashboardScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomNavOffset }]}
        scrollEventThrottle={16}
        decelerationRate="normal"
        nestedScrollEnabled
        bounces={Platform.OS !== 'web'}
        alwaysBounceVertical={Platform.OS !== 'web'}
        overScrollMode={Platform.OS === 'android' ? 'always' : 'auto'}
        onScroll={onDashboardScroll}
        onScrollBeginDrag={onDashboardScrollBeginDrag}
        onScrollEndDrag={onDashboardScrollEndDrag}
        onMomentumScrollEnd={onDashboardMomentumScrollEnd}
        onTouchEnd={Platform.OS === 'web' ? finishPullGesture : undefined}
        onTouchCancel={Platform.OS === 'web' ? finishPullGesture : undefined}
        {...(Platform.OS === 'web' ? pullZoneHandlers : {})}
        {...(Platform.OS === 'android' ? { endFillColor: 'transparent' } : {})}
      >
        <PullSyncGestureLayer gesture={pullPanGesture} enabled={pullGestureEnabled}>
        <View
          style={styles.scrollPullContent}
          collapsable={false}
        >
        <DashboardTopPatternBlock isDark={isDark}>
          <View
            style={[styles.pullSyncHeader, { minHeight: pullHeaderSlotHeight }]}
            pointerEvents="none"
          >
            <Animated.View
              style={[
                styles.pullSyncHeaderContent,
                {
                  opacity:
                    pullPhase === 'syncing' || pullPhase === 'ready' || pullPhase === 'hold'
                      ? 1
                      : pullIndicatorOpacity,
                  transform: [{ translateY: pullIndicatorTranslateY }],
                },
              ]}
            >
              <PullSyncIndicator phase={pullPhase} isDark={isDark} />
            </Animated.View>
          </View>

          <View style={styles.heroCarouselBlock}>{renderHeroCarousel()}</View>

        <View style={styles.indicatorRow}>
          <View style={styles.dotsGroup}>
            <View style={[styles.fractionPill, isDark && styles.fractionPillDark]}>
              <Text style={[styles.fractionText, isDark && styles.textWhite]}>{heroIndex + 1}/{heroCards.length}</Text>
            </View>
            <View style={styles.dotsRow}>
              {heroCards.map((_, i) => (
                <View 
                  key={i} 
                  style={[
                    styles.indicatorDot, 
                    i === heroIndex ? (isDark ? styles.activeDotDark : styles.activeDotLight) : (isDark ? styles.inactiveDotDark : styles.inactiveDotLight),
                    { width: i === heroIndex ? 10 : 4.5 },
                  ]} 
                />
              ))}
            </View>
          </View>
          
          <TouchableOpacity style={styles.facultyIdBox} onPress={handleCopyId} activeOpacity={0.7}>
            <Text style={[styles.idLabel, isDark && styles.textDarkMuted]}>
              {isFaculty ? 'MAIL' : 'STUDENT ID'}:{' '}
              <Text style={[styles.idValue, isDark && styles.textWhite]}>
                {isFaculty ? 'member@mic.edu' : 'student@mic.edu'}
              </Text>
            </Text>
            <View style={[styles.copyBtn, isDark && styles.copyBtnDark]}>
              <Copy size={11} color={isDark ? '#CBD5E1' : '#D89B48'} strokeWidth={3} />
            </View>
          </TouchableOpacity>
        </View>
        </DashboardTopPatternBlock>

        <View style={[styles.sectionDivider, isDark && styles.dividerDark]} />

        {/* Main Dashboard Grid for Web */}
        <View style={Platform.OS === 'web' ? styles.webDashboardGrid : null}>
          
          {/* Left Column */}
          <View style={Platform.OS === 'web' ? styles.webGridColLeft : null}>
            {isFaculty ? (
              /* Faculty Quick Actions Grid */
              <View style={[styles.section, isCompactLayout && styles.sectionCompact]}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, isDark && styles.textWhite]}>QUICK ACTIONS</Text>
                </View>
                
                <View
                  style={[
                    styles.quickActionsSwitcherRowCompact,
                    { gap: SEGMENT_SWITCHER.gap },
                  ]}
                >
                  {[
                    { id: 'daily', label: 'DAILY' },
                    { id: 'tools', label: 'COMMITTEE' },
                  ].map((option, index) => {
                    const seg = isDark ? SEGMENT_SWITCHER.dark : SEGMENT_SWITCHER.light;
                    const selected = quickActionTab === option.id;
                    return (
                      <TouchableOpacity
                        key={option.id}
                        style={[
                          styles.segmentPillPress,
                          styles.quickActionTabPressCompact,
                          index > 0 && styles.quickActionTabGap,
                        ]}
                        onPress={() => setQuickActionTab(option.id)}
                        activeOpacity={0.85}
                        accessibilityRole="tab"
                        accessibilityState={{ selected }}
                      >
                        <View
                          style={[
                            styles.segmentPill,
                            styles.quickActionPillCompact,
                            selected ? styles.segmentPillSelected : styles.segmentPillIdle,
                            selected
                              ? { backgroundColor: seg.activeBg }
                              : {
                                  backgroundColor: isDark ? 'rgba(30, 41, 59, 0.7)' : seg.inactiveBg,
                                  borderColor: isDark ? 'rgba(148, 163, 184, 0.45)' : seg.inactiveBorder,
                                },
                          ]}
                        >
                          <Text
                            style={[
                              styles.activitySwitcherLabel,
                              { color: selected ? seg.activeFg : seg.inactiveFg },
                            ]}
                            numberOfLines={1}
                          >
                            {option.label}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <GroupedButtonCard
                  items={quickActionButtons}
                  isDark={isDark}
                  isCompact={isCompactLayout}
                />
              </View>
            ) : (
              /* Student: My Record & Discipline Standing Card */
              <View style={[styles.section, isCompactLayout && styles.sectionCompact]}>
                <View style={[styles.studentDashboardCard, { backgroundColor: cardBg, borderColor: borderCol }]}>
                  <View style={styles.studentCardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.studentCardTitle, { color: textColor }]}>
                        MY RECORD & DISCIPLINE STANDING
                      </Text>
                      <Text style={[styles.studentCardSubtitle, { color: mutedColor }]}>
                        Institutional 3-chance warning quota & fines status
                      </Text>
                    </View>
                    <View style={styles.studentGraceBadge}>
                      <ShieldCheck size={13} color="#059669" style={{ marginRight: 4 }} />
                      <Text style={styles.studentGraceBadgeText}>3-Chance Policy</Text>
                    </View>
                  </View>

                  {/* Grace Chances Progress Bar / Indicators */}
                  <View style={[styles.graceStatusBox, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderColor: borderCol }]}>
                    <View style={styles.graceHeaderRow}>
                      <Text style={[styles.graceLabel, { color: textColor }]}>Grace Chances Standing</Text>
                      <Text style={[styles.graceValue, { color: '#D97706' }]}>2 of 3 Used • 1 Available</Text>
                    </View>
                    <View style={styles.chancePillsRow}>
                      <View style={[styles.chancePill, styles.chancePillUsed]}>
                        <Text style={styles.chancePillTextUsed}>Chance 1: Used (Oct 14)</Text>
                      </View>
                      <View style={[styles.chancePill, styles.chancePillUsed]}>
                        <Text style={styles.chancePillTextUsed}>Chance 2: Used (Sep 28)</Text>
                      </View>
                      <View style={[styles.chancePill, styles.chancePillAvailable]}>
                        <Text style={styles.chancePillTextAvailable}>Chance 3: Safe / Free</Text>
                      </View>
                    </View>
                    <View style={styles.standingSummaryRow}>
                      <CheckCircle2 size={13} color="#059669" style={{ marginRight: 5 }} />
                      <Text style={styles.standingSummaryText}>
                        Current Standing: Safe (Zero Monetary Fines)
                      </Text>
                    </View>
                  </View>

                  {/* Fines summary counter */}
                  <View style={[styles.finesMetricsRow, { borderTopColor: borderCol, borderBottomColor: borderCol }]}>
                    <View style={styles.fineMetricCell}>
                      <Text style={[styles.fineMetricVal, { color: '#059669' }]}>₹0.00</Text>
                      <Text style={[styles.fineMetricLabel, { color: mutedColor }]}>Discipline Fines Due</Text>
                    </View>
                    <View style={[styles.fineDivider, { backgroundColor: borderCol }]} />
                    <View style={styles.fineMetricCell}>
                      <Text style={[styles.fineMetricVal, { color: textColor }]}>2</Text>
                      <Text style={[styles.fineMetricLabel, { color: mutedColor }]}>Late/Dress Warnings</Text>
                    </View>
                    <View style={[styles.fineDivider, { backgroundColor: borderCol }]} />
                    <View style={styles.fineMetricCell}>
                      <Text style={[styles.fineMetricVal, { color: '#2563EB' }]}>Eligible</Text>
                      <Text style={[styles.fineMetricLabel, { color: mutedColor }]}>Exam Clearance</Text>
                    </View>
                  </View>

                  {/* Button to View Full Disciplinary Record */}
                  <TouchableOpacity
                    style={styles.openRecordBtn}
                    onPress={onOpenStudentRecord}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.openRecordBtnText}>View Full Disciplinary Record</Text>
                    <ChevronRight size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Right Column: Recent Activity & Student Notices */}
          <View style={Platform.OS === 'web' ? styles.webGridColRight : null}>
            {/* Recent Activity Section (Faculty Only - In-discipline & Latecomers feed) */}
            {isFaculty ? (
              <View style={[styles.section, isCompactLayout && styles.sectionCompact, Platform.OS !== 'web' && { marginTop: 24 }]}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionHeaderText}>
                    <Text style={[styles.sectionTitle, isDark && styles.textWhite]}>
                      {Platform.OS === 'web' ? 'RECENT IN-DISCIPLINE & LATECOMERS' : 'RECENT LATECOMERS'}
                    </Text>
                    <Text style={[styles.sectionSubtitle, isDark && styles.sectionSubtitleDark]}>
                      {formatActivitySectionDate()}
                    </Text>
                  </View>
                  {onOpenHistory ? (
                    <TouchableOpacity
                      style={[styles.sectionHistoryBtn, isDark && styles.sectionHistoryBtnDark]}
                      onPress={() => onOpenHistory?.('self')}
                      activeOpacity={0.82}
                      accessibilityRole="button"
                      accessibilityLabel="View latecomer history"
                    >
                      <History size={14} color={isDark ? '#CBD5E1' : '#64748B'} strokeWidth={2.4} />
                      <Text style={[styles.sectionHistoryText, isDark && styles.sectionHistoryTextDark]}>
                        History
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
                
                <ActivityGroupedIconCard
                  items={activitySummaryItems}
                  isDark={isDark}
                  isCompact={isCompactLayout}
                />

                <View style={styles.activitySwitcherRow}>
                  <View style={styles.activitySwitcherRowMain}>
                    <SegmentListSwitcher
                      options={activitySwitcherOptions}
                      activeTab={activityTab}
                      onChange={setActivityTab}
                      isDark={isDark}
                      style={styles.activitySegmentSwitcherFill}
                    />
                  </View>
                  <ActivityViewModeSwitcher
                    value={activityViewMode}
                    onChange={setActivityViewMode}
                    isDark={isDark}
                  />
                </View>

                {activityViewMode === 'grid' ? (
                  <ScrollView
                    horizontal
                    nestedScrollEnabled
                    directionalLockEnabled
                    showsHorizontalScrollIndicator={false}
                    removeClippedSubviews={false}
                    style={styles.activityListScroll}
                    contentContainerStyle={styles.activityScroll}
                  >
                    {normalizedActivityItems.map((item) => (
                      <ActivityCard
                        key={item.key}
                        initials={item.initials}
                        name={item.name}
                        id={item.id}
                        dept={item.dept}
                        date={item.date}
                        time={item.time}
                        isDark={isDark}
                        pendingSync={item.pendingSync}
                      />
                    ))}
                  </ScrollView>
                ) : (
                  <View style={styles.activityListVertical}>
                    {normalizedActivityItems.map((item) => (
                      <ActivityListRow
                        key={item.key}
                        initials={item.initials}
                        name={item.name}
                        id={item.id}
                        dept={item.dept}
                        date={item.date}
                        time={item.time}
                        isDark={isDark}
                        pendingSync={item.pendingSync}
                      />
                    ))}
                  </View>
                )}
              </View>
            ) : (
              /* Student: Campus & Academic Notifications Card */
              <View style={[styles.section, isCompactLayout && styles.sectionCompact, Platform.OS !== 'web' && { marginTop: 16 }]}>
                <View style={[styles.studentDashboardCard, { backgroundColor: cardBg, borderColor: borderCol }]}>
                  <View style={styles.studentCardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.studentCardTitle, { color: textColor }]}>
                        CAMPUS & ACADEMIC NOTICES
                      </Text>
                      <Text style={[styles.studentCardSubtitle, { color: mutedColor }]}>
                        Official institutional updates & timetable circulars
                      </Text>
                    </View>
                    <View style={[styles.studentGraceBadge, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#EFF6FF', borderColor: '#BFDBFE' }]}>
                      <Bell size={12} color="#2563EB" style={{ marginRight: 4 }} />
                      <Text style={[styles.studentGraceBadgeText, { color: '#2563EB' }]}>4 New</Text>
                    </View>
                  </View>

                  {/* Notices list */}
                  <View style={styles.noticesList}>
                    {[
                      {
                        id: 'n1',
                        tag: 'EXAMS',
                        tagColor: '#2563EB',
                        tagBg: isDark ? 'rgba(37, 99, 235, 0.2)' : '#EFF6FF',
                        title: 'B.Tech III-I CSE Mid-1 Examination Timetable',
                        desc: 'Examinations commence from Oct 27, 2026. Hall tickets available in Academic Cell.',
                        date: 'Today, 10:30 AM',
                      },
                      {
                        id: 'n2',
                        tag: 'CAMPUS',
                        tagColor: '#059669',
                        tagBg: isDark ? 'rgba(5, 150, 105, 0.2)' : '#ECFDF5',
                        title: 'MIC InnoVision 2026 Registrations Open',
                        desc: 'Inter-college hackathon with cash pool ₹1,00,000. Project submissions open.',
                        date: 'Yesterday, 04:15 PM',
                      },
                      {
                        id: 'n3',
                        tag: 'TRANSIT',
                        tagColor: '#D97706',
                        tagBg: isDark ? 'rgba(217, 119, 6, 0.2)' : '#FFFBEB',
                        title: 'Route #12 Benz Circle Schedule Adjustment',
                        desc: 'Morning bus pickup advanced by 10 mins due to highway maintenance.',
                        date: '17 Oct 2026',
                      },
                      {
                        id: 'n4',
                        tag: 'ACADEMIC',
                        tagColor: '#7C3AED',
                        tagBg: isDark ? 'rgba(124, 58, 237, 0.2)' : '#F5F3FF',
                        title: 'Mandatory 75% Attendance Compliance',
                        desc: 'Students with attendance below 75% aggregate must consult department counselor.',
                        date: '15 Oct 2026',
                      },
                    ].map((notice, idx) => (
                      <TouchableOpacity
                        key={notice.id}
                        style={[
                          styles.noticeRow,
                          idx > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: borderCol },
                        ]}
                        activeOpacity={0.7}
                        onPress={onOpenStudentNotices}
                      >
                        <View style={styles.noticeRowTop}>
                          <View style={[styles.noticeTag, { backgroundColor: notice.tagBg }]}>
                            <Text style={[styles.noticeTagText, { color: notice.tagColor }]}>{notice.tag}</Text>
                          </View>
                          <Text style={[styles.noticeDate, { color: mutedColor }]}>{notice.date}</Text>
                        </View>
                        <Text style={[styles.noticeTitle, { color: textColor }]} numberOfLines={1}>
                          {notice.title}
                        </Text>
                        <Text style={[styles.noticeDesc, { color: mutedColor }]} numberOfLines={2}>
                          {notice.desc}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Button to View All Notices */}
                  <TouchableOpacity
                    style={[styles.viewAllNoticesBtn, { borderColor: borderCol }]}
                    onPress={onOpenStudentNotices}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.viewAllNoticesBtnText, { color: '#2563EB' }]}>
                      View All Institutional Notices (4)
                    </Text>
                    <ChevronRight size={16} color="#2563EB" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
        </View>
        </PullSyncGestureLayer>
      </DashboardScrollView>
      )}
      </Animated.View>
      </Animated.View>

      <DashboardBottomNav
        isDark={isDark}
        activeTab={activeNavTab}
        onTabChange={(tabId) => {
          if (tabId === 'attendance') {
            if (typeof onOpenAttendance === 'function') onOpenAttendance();
            return;
          }
          if (tabId === 'marks') {
            if (typeof onOpenMarks === 'function') onOpenMarks();
            return;
          }
          setActiveNavTab(tabId);
        }}
        onSearchPress={openSearch}
        onScanPress={openMarkLatecomerPrompt}
        showScan={isFaculty}
        noticesBadge={unreadCount > 0}
        isFaculty={isFaculty}
      />

      <NetworkStatusActionSheet
        visible={networkSheetOpen}
        isDark={isDark}
        networkStatus={networkStatus}
        connectionKind={connectionKind}
        lastSyncedAtIso={lastSyncedAtIso}
        isFaculty={isFaculty}
        pendingCount={facultySync.pendingCount}
        isOffline={isNetworkOffline}
        onSyncNow={async () => {
          if (isFaculty) {
            await facultySync.syncNow();
          }
        }}
        onScanOffline={() => {
          setNetworkSheetOpen(false);
          openMarkLatecomerPrompt();
        }}
        onClose={() => setNetworkSheetOpen(false)}
        autoSyncEnabled={autoSyncEnabled}
        onAutoSyncChange={handleAutoSyncChange}
        autoSyncIntervalMinutes={autoSyncIntervalMinutes}
        onAutoSyncIntervalChange={handleAutoSyncIntervalChange}
      />

      <MarkLatecomerPromptModal
        visible={markLatecomerModalVisible}
        colors={colors}
        isDark={isDark}
        onCancel={() => setMarkLatecomerModalVisible(false)}
        onConfirmScan={confirmMarkLatecomerScan}
      />

      <ScanApprovalModeModal
        visible={scanApprovalModalVisible}
        colors={colors}
        isDark={isDark}
        onCancel={() => setScanApprovalModalVisible(false)}
        onSelectAuto={() => startScanWithApproval('auto')}
        onSelectManual={() => startScanWithApproval('manual')}
      />

      <AppleAlertModal
        visible={shiftInfoVisible}
        title="Shift Information"
        message={'Duty started on: 07:50 AM\nShift active since: 07:58 AM\n\nOverall Faculty and Committee members are actively recording.'}
        colors={colors}
        isDark={isDark}
        blurBackground
        dismissOnBackdrop
        onRequestClose={() => setShiftInfoVisible(false)}
        buttons={[{ label: 'OK', style: 'default', onPress: () => setShiftInfoVisible(false) }]}
      />

      <AppleAlertModal
        visible={pullSyncModalVisible}
        title={
          pullSyncModalMode === 'confirm'
            ? 'Sync now?'
            : pullSyncModalMode === 'cancelled'
              ? 'Sync cancelled'
              : pullSyncModalMode === 'offline'
                ? 'No Internet Connection'
                : 'Synced'
        }
        message={pullSyncModalMessage}
        colors={colors}
        isDark={isDark}
        blurBackground
        dismissOnBackdrop={pullSyncModalMode !== 'confirm'}
        onRequestClose={
          pullSyncModalMode === 'confirm' ? handlePullSyncCancel : closePullSyncModal
        }
        messageColor={isDark ? '#E2E8F0' : colors.textMuted}
        icon={
          pullSyncModalMode === 'offline' ? (
            <WifiOff size={38} color="#F87171" strokeWidth={2.2} />
          ) : null
        }
        buttons={
          pullSyncModalMode === 'confirm'
            ? [
                { label: 'Cancel', style: 'cancel', onPress: handlePullSyncCancel },
                { label: 'Sync now', style: 'default', onPress: handlePullSyncConfirm },
              ]
            : [{ label: 'OK', style: 'default', onPress: closePullSyncModal }]
        }
      />

      <Modal
        visible={accountMenuSheetMounted}
        transparent
        animationType="none"
        onRequestClose={dismissAccountMenuSheet}
        statusBarTranslucent
      >
        <View style={bottomSheetOverlayStyles.modalRoot}>
          <View
            style={[
              bottomSheetOverlayStyles.host,
              Platform.OS === 'web' && bottomSheetOverlayStyles.web,
            ]}
          >
            <Animated.View
              pointerEvents="none"
              style={[
                bottomSheetOverlayStyles.backdrop,
                {
                  backgroundColor: isDark ? 'rgba(2, 6, 23, 0.72)' : 'rgba(15, 23, 42, 0.55)',
                  opacity: accountMenuBackdropOpacity,
                },
              ]}
            />
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={dismissAccountMenuSheet}
              accessibilityRole="button"
              accessibilityLabel="Close account menu"
            />
            <Animated.View
              style={[
                bottomSheetSurfaceStyles.sheet,
                {
                  backgroundColor: accountSheetBg,
                  paddingBottom: accountSheetBottomPad,
                  transform: [{ translateY: accountMenuSheetTranslateY }],
                },
              ]}
            >
              <View
                style={[
                  bottomSheetSurfaceStyles.grabHandle,
                  { backgroundColor: accountSheetHandleColor },
                ]}
              />
              <BottomSheetHeader
                title="Account"
                titleColor={accountSheetTitleColor}
                onDone={dismissAccountMenuSheet}
              />
              <View style={bottomSheetSurfaceStyles.body}>
                <View
                  style={[
                    bottomSheetSurfaceStyles.contentGroup,
                    { backgroundColor: accountSheetGroupBg },
                  ]}
                >
                  {renderAccountMenuPanel()}
                </View>
              </View>
            </Animated.View>
          </View>
        </View>
      </Modal>

      <NotificationsSheet
        visible={notificationsOpen}
        colors={colors}
        isDark={isDark}
        notifications={notifications}
        onClose={() => setNotificationsOpen(false)}
        onNotificationPress={handleNotificationPress}
      />
      </View>
    </View>
  );
};

const ACTIVITY_CARD_PATTERN_SIZE = 20;

/** Unified card texture — fine grid + soft top light. */
const ActivityCardPatternBackground = ({ isDark }) => {
  if (Platform.OS === 'android') {
    return <View style={styles.activityGroupPatternLayer} pointerEvents="none" />;
  }

  const gridId = isDark ? 'activityCardGridDark' : 'activityCardGridLight';
  const sheenId = isDark ? 'activityCardSheenDark' : 'activityCardSheenLight';
  const line = isDark ? 'rgba(148, 163, 184, 0.09)' : 'rgba(148, 163, 184, 0.14)';
  const sz = ACTIVITY_CARD_PATTERN_SIZE;
  const half = sz / 2;

  return (
    <View style={styles.activityGroupPatternLayer} pointerEvents="none">
      <Svg style={StyleSheet.absoluteFill} preserveAspectRatio="none">
        <Defs>
          <Pattern id={gridId} width={sz} height={sz} patternUnits="userSpaceOnUse">
            <Line x1={0} y1={half} x2={half} y2={0} stroke={line} strokeWidth={0.65} />
            <Line x1={half} y1={sz} x2={sz} y2={half} stroke={line} strokeWidth={0.65} />
            <Circle cx={half} cy={half} r={0.55} fill={line} />
          </Pattern>
          <SvgLinearGradient id={sheenId} x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={isDark ? 0.08 : 0.55} />
            <Stop offset="55%" stopColor="#FFFFFF" stopOpacity={0} />
          </SvgLinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${gridId})`} />
        <Rect width="100%" height="100%" fill={`url(#${sheenId})`} />
      </Svg>
    </View>
  );
};

/** Mobile-safe sizes for the classic white square icon tile. */
const getActivityIconBoxMetrics = (windowWidth, isCompact) => {
  const isNativeMobile = Platform.OS !== 'web';
  const compact = isCompact || windowWidth < 380 || isNativeMobile;
  const tight = windowWidth < 340;

  return {
    boxSize: tight ? 40 : compact ? 44 : 48,
    boxRadius: tight ? 13 : compact ? 14 : 16,
    iconSize: tight ? 18 : compact ? 19 : 20,
  };
};

const ActivityStatIconSquare = ({
  Icon,
  tone,
  size,
  isDark,
  itemBg,
  boxSize,
  boxRadius,
}) => (
  <View
    style={[
      styles.activityGroupIconOuter,
      { borderRadius: boxRadius + 2 },
      Platform.OS === 'web'
        ? { boxShadow: `0 4px 12px ${hexToRgba(tone, 0.18)}` }
        : { shadowColor: tone },
    ]}
    collapsable={false}
  >
    <View
      style={[
        styles.activityGroupIconWrap,
        {
          width: boxSize,
          height: boxSize,
          borderRadius: boxRadius,
          backgroundColor: isDark ? itemBg : '#FFFFFF',
          borderColor: getDashboardAccentBorderColor(tone, isDark),
        },
      ]}
    >
      <Icon size={size} color={tone} strokeWidth={2.3} />
    </View>
  </View>
);

const ActivityPremiumDivider = ({ isDark }) => (
  <LinearGradient
    colors={
      isDark
        ? ['rgba(51, 65, 85, 0)', 'rgba(100, 116, 139, 0.45)', 'rgba(51, 65, 85, 0)']
        : ['rgba(241, 245, 249, 0)', 'rgba(203, 213, 225, 0.85)', 'rgba(241, 245, 249, 0)']
    }
    start={{ x: 0, y: 0 }}
    end={{ x: 0, y: 1 }}
    style={styles.activityGroupDividerPremium}
  />
);

const ActivityGroupedIconCard = ({ items, isDark, isCompact = false }) => {
  const { width: windowWidth } = useWindowDimensions();
  const iconBox = useMemo(
    () => getActivityIconBoxMetrics(windowWidth, isCompact),
    [windowWidth, isCompact],
  );

  return (
  <View style={[styles.activityGroupCard, isDark && styles.activityGroupCardDark]}>
    <ActivityCardPatternBackground isDark={isDark} />
    <View style={[styles.activityGroupCardRim, isDark && styles.activityGroupCardRimDark]} pointerEvents="none" />
    {items.map((item, index) => {
      const Icon = item.Icon;

      const cellBody = (
        <>
          <ActivityStatIconSquare
            Icon={Icon}
            tone={item.tone}
            size={iconBox.iconSize}
            isDark={isDark}
            itemBg={item.bg}
            boxSize={iconBox.boxSize}
            boxRadius={iconBox.boxRadius}
          />
          <Text
            style={[
              styles.activityGroupValue,
              isCompact && styles.activityGroupValueCompact,
              isDark ? styles.activityGroupValueDark : { color: item.tone },
            ]}
          >
            {item.value}
          </Text>
          <Text
            style={[
              styles.activityGroupLabel,
              isCompact && styles.activityGroupLabelCompact,
              isDark && styles.activityGroupLabelDark,
            ]}
          >
            {item.label}
          </Text>
        </>
      );

      const cellStyle = [
        styles.activityGroupCell,
        isCompact && styles.activityGroupCellCompact,
        item.syncAvailable && styles.activityGroupCellSyncReady,
        item.syncAvailable && isDark && styles.activityGroupCellSyncReadyDark,
      ];

      return (
        <React.Fragment key={item.key}>
          {index > 0 ? <ActivityPremiumDivider isDark={isDark} /> : null}
          {item.onPress ? (
            <TouchableOpacity
              style={[
                ...cellStyle,
                item.disabled && styles.activityGroupCellDisabled,
              ]}
              onPress={item.onPress}
              disabled={item.disabled}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`${item.label}, ${item.value}`}
              accessibilityHint={item.accessibilityHint}
              accessibilityState={{ disabled: Boolean(item.disabled) }}
            >
              {cellBody}
            </TouchableOpacity>
          ) : (
            <View
              style={cellStyle}
              accessibilityRole="text"
              accessibilityLabel={`${item.label}, ${item.value}`}
              accessibilityHint={item.accessibilityHint}
            >
              {cellBody}
            </View>
          )}
        </React.Fragment>
      );
    })}
  </View>
  );
};

const SegmentListSwitcher = ({ options, activeTab, onChange, isDark, style }) => {
  const seg = isDark ? SEGMENT_SWITCHER.dark : SEGMENT_SWITCHER.light;
  const normalizedOptions = useMemo(() => {
    // Defensive: if the quick-actions switcher somehow receives only COMMITTEE/tools,
    // force DAILY to be present so both tabs are always visible.
    const hasTools = options.some((opt) => opt.id === 'tools');
    const hasDaily = options.some((opt) => opt.id === 'daily');
    if (hasTools && !hasDaily) {
      return [{ id: 'daily', label: 'DAILY', Icon: ClipboardList }, ...options];
    }
    return options;
  }, [options]);

  return (
    <View style={[styles.segmentSwitcherRow, { gap: SEGMENT_SWITCHER.gap }, style]}>
      {normalizedOptions.map((option) => {
        const selected = activeTab === option.id;
        const fg = selected ? seg.activeFg : seg.inactiveFg;
        return (
          <TouchableOpacity
            key={option.id}
            style={styles.segmentPillPress}
            onPress={() => onChange(option.id)}
            activeOpacity={0.85}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
          >
            <View
              style={[
                styles.segmentPill,
                selected ? styles.segmentPillSelected : styles.segmentPillIdle,
                selected
                  ? { backgroundColor: seg.activeBg }
                  : {
                      backgroundColor: isDark ? 'rgba(30, 41, 59, 0.7)' : seg.inactiveBg,
                      borderColor: isDark ? 'rgba(148, 163, 184, 0.45)' : seg.inactiveBorder,
                    },
              ]}
            >
              <Text
                style={[styles.activitySwitcherLabel, { color: fg }]}
                numberOfLines={1}
              >
                {option.label}
              </Text>
            </View>
        </TouchableOpacity>
        );
      })}
      </View>
  );
};

const formatQuickActionLine = (word) =>
  word.charAt(0) + word.slice(1).toLowerCase();

/** Quick Actions — elevated icon tile + two-line caption. */
const GroupedButtonCard = ({ items, isDark, isCompact = false }) => {
  const iconSize = isCompact ? 54 : 60;

  return (
  <View style={styles.quickActionsRow}>
    {items.map((item) => {
      const Icon = item.Icon;
      const title = formatQuickActionLine(item.label);
      const subtitle = formatQuickActionLine(item.sublabel);
      const a11y = `${title} ${subtitle}`;
      const tileBody = (pressed) => (
        <View
          style={[
            styles.quickActionPressableInner,
            pressed && styles.quickActionPressableInnerPressed,
          ]}
          pointerEvents="none"
        >
          <QuickAction3DIcon
            Icon={Icon}
            tone={item.tone}
            bg={item.bg}
            isDark={isDark}
            size={iconSize}
            marginBottom={isCompact ? 8 : 10}
          />
          <Text
            style={[
              styles.quickActionTitle,
              isCompact && styles.quickActionTitleCompact,
              isDark && styles.quickActionTitleDark,
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>
          <Text
            style={[
              styles.quickActionSubtitle,
              isCompact && styles.quickActionSubtitleCompact,
              isDark && styles.quickActionSubtitleDark,
            ]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        </View>
      );

      if (Platform.OS === 'web') {
        return (
          <TouchableOpacity
            key={item.key}
            style={styles.quickActionItem}
            onPress={() => item.onPress?.()}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel={a11y}
          >
            {tileBody(false)}
          </TouchableOpacity>
        );
      }

      return (
        <Pressable
          key={item.key}
          style={({ pressed }) => [
            styles.quickActionItem,
            pressed && styles.quickActionItemPressed,
          ]}
          onPress={() => item.onPress?.()}
          accessibilityRole="button"
          accessibilityLabel={a11y}
        >
          {({ pressed }) => tileBody(pressed)}
        </Pressable>
      );
    })}
    </View>
  );
};

const getActivityStatusTone = (pendingSync, isDark) => {
  if (pendingSync) {
    return {
      label: 'PENDING SYNC',
      bg: isDark ? '#F59E0B' : '#FBBF24',
      text: isDark ? '#FFFFFF' : '#78350F',
    };
  }
  return {
    label: 'LATE',
    bg: isDark ? '#EF4444' : '#F87171',
    text: '#FFFFFF',
  };
};

const ACTIVITY_VIEW_MODE_OPTIONS = [
  { id: 'grid', label: 'GRID', Icon: LayoutGrid },
  { id: 'list', label: 'LIST', Icon: List },
];

const ActivityViewModeSwitcher = ({ value, onChange, isDark }) => (
  <View style={styles.activityViewModeRow}>
    <View style={[styles.activityViewModeGroup, isDark && styles.activityViewModeGroupDark]}>
      {ACTIVITY_VIEW_MODE_OPTIONS.map((option) => {
        const selected = value === option.id;
        const Icon = option.Icon;
        const iconColor = selected
          ? isDark
            ? '#FBBF24'
            : DASHBOARD_LIGHT_SURFACES.primary
          : isDark
            ? '#94A3B8'
            : '#64748B';
        return (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.activityViewModeBtn,
                selected && styles.activityViewModeBtnActive,
                isDark && selected && styles.activityViewModeBtnActiveDark,
              ]}
              onPress={() => onChange(option.id)}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={option.id === 'grid' ? 'Grid view' : 'List view'}
            >
              <Icon size={17} color={iconColor} strokeWidth={selected ? 2.5 : 2} />
            </TouchableOpacity>
        );
      })}
    </View>
  </View>
);

const ActivityListRow = ({ initials, name, id, dept, date, time, isDark, pendingSync }) => {
  const statusTone = getActivityStatusTone(pendingSync, isDark);
  const whenText = time ? `${date} · ${time}` : date;
  const whenIconColor = isDark ? '#94A3B8' : '#64748B';
  const listRowBgColors = isDark
    ? ['rgba(59, 130, 246, 0.18)', DASHBOARD_DARK_SURFACES.sheet]
    : ['#DBEAFE', '#FFFFFF'];
  const avatarGradientColors = ['#FDE68A', '#F59E0B', '#EA580C'];

  return (
    <TouchableOpacity
      style={[
        styles.activityListRow,
        !isDark && styles.activityListRowLight,
        isDark && styles.activityListRowDark,
      ]}
      activeOpacity={0.88}
    >
      <LinearGradient
        colors={listRowBgColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.activityListRowBg}
      />
      <View style={styles.activityListRowInner}>
      <View style={[styles.activityListRowAvatarRing, isDark && styles.activityListRowAvatarRingDark]}>
        <LinearGradient
          colors={avatarGradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.activityListRowAvatar}
        >
          <Text style={styles.activityListRowAvatarText}>{initials}</Text>
        </LinearGradient>
      </View>
      <View style={styles.activityListRowBody}>
        <Text style={[styles.activityListRowName, isDark && styles.textWhite]} numberOfLines={1}>
          {name}
        </Text>
        <Text style={[styles.activityListRowMeta, isDark && styles.textDarkMuted]} numberOfLines={1}>
          {id}
          <Text style={styles.activityListRowMetaDot}> · </Text>
          {dept}
        </Text>
        <View style={styles.activityListRowWhenRow}>
          <Clock size={11} color={whenIconColor} strokeWidth={2.2} />
          <Text
            style={[styles.activityListRowWhen, isDark && styles.activityListRowWhenDark]}
            numberOfLines={1}
          >
            {whenText}
          </Text>
        </View>
      </View>
      <View style={[styles.activityListRowBadge, { backgroundColor: statusTone.bg }]}>
        <Clock size={11} color={statusTone.text} strokeWidth={2.4} />
        <Text style={[styles.activityListRowBadgeText, { color: statusTone.text }]}>
          {statusTone.label}
        </Text>
      </View>
      </View>
  </TouchableOpacity>
);
};

const ActivityCard = ({ initials, name, id, dept, date, time, isDark, pendingSync }) => {
  const avatarColors = ['#FDE68A', '#F59E0B', '#EA580C'];
  const statusTone = getActivityStatusTone(pendingSync, isDark);

  return (
    <TouchableOpacity style={styles.activityCardHit} activeOpacity={0.88}>
      <View
        style={[
          styles.activityCardSurface,
          !isDark && styles.activityCardLight,
          isDark && styles.activityCardDark,
        ]}
      >
        <View style={styles.activityCardClip}>
          <LinearGradient
            colors={ACTIVITY_CARD_HEADER_GRADIENT}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.activityHeaderBand}
          />
          <View style={styles.activityAvatarWrap}>
            <LinearGradient
              colors={avatarColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.activityAvatar, isDark && styles.activityAvatarDark]}
            >
      <Text style={styles.activityAvatarText}>{initials}</Text>
            </LinearGradient>
    </View>
          <View style={styles.activityBody}>
            <Text style={[styles.activityName, isDark && styles.textWhite]} numberOfLines={1}>
              {name}
            </Text>
            <Text
              style={[styles.activityId, isDark && styles.activityIdDark]}
              numberOfLines={1}
            >
              {id}
            </Text>
            <View style={[styles.activityDeptPill, isDark && styles.activityDeptPillDark]}>
              <Text style={[styles.activityDeptPillText, isDark && styles.activityDeptPillTextDark]}>
                {dept}
              </Text>
            </View>
          </View>
          <View style={[styles.activityFooter, isDark && styles.activityFooterDark]}>
            <View style={styles.activityWhenCol}>
              <Text style={[styles.activityDate, isDark && styles.activityDateDark]} numberOfLines={1}>
                {date}
              </Text>
              {time ? (
                <Text style={[styles.activityTime, isDark && styles.activityTimeDark]} numberOfLines={1}>
                  {time}
                </Text>
              ) : null}
            </View>
            <View style={[styles.activityStatusBadge, { backgroundColor: statusTone.bg }]}>
              <Clock size={10} color={statusTone.text} strokeWidth={2.5} />
              <Text style={[styles.activityStatusText, { color: statusTone.text }]}>
                {statusTone.label}
              </Text>
            </View>
          </View>
      </View>
    </View>
  </TouchableOpacity>
);
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent', position: 'relative' },
  contentLayer: {
    flex: 1,
    zIndex: 1,
    position: 'relative',
    backgroundColor: 'transparent',
  },
  scrollView: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: { paddingTop: 0, backgroundColor: 'transparent' },
  scrollPullContent: {
    paddingBottom: 40,
    position: 'relative',
  },

  headerShell: {
    position: 'relative',
    zIndex: 20,
  },
  pullSyncHeader: {
    overflow: 'visible',
    position: 'relative',
    width: '100%',
    zIndex: 2,
    backgroundColor: 'transparent',
  },
  pullSyncHeaderContent: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    paddingTop: 0,
    paddingBottom: 2,
  },
  dashboardTopBlock: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  dashboardTopBlockContent: {
    position: 'relative',
    width: '100%',
  },
  dashboardTopPatternBg: {
    ...StyleSheet.absoluteFillObject,
  },
  pullSyncOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  pullSyncText: {
    marginTop: 4,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    includeFontPadding: false,
    textAlign: 'center',
  },

  contentSheetOuter: {
    flex: 1,
    zIndex: 1,
    position: 'relative',
  },
  contentSheet: {
    flex: 1,
    overflow: 'hidden',
  },
  contentSheetWeb: Platform.select({
    web: {
      maxWidth: 900,
      width: '94%',
      alignSelf: 'center',
      transform: [{ translateZ: 0 }],
      backgroundColor: 'transparent',
    },
    default: {},
  }),
  webDashboardGrid: Platform.select({
    web: {
      flexDirection: 'column',
      gap: 32,
      paddingHorizontal: 24,
      paddingTop: 8,
    },
    default: {},
  }),
  webGridColLeft: Platform.select({
    web: {
      width: '100%',
    },
    default: {},
  }),
  webGridColRight: Platform.select({
    web: {
      width: '100%',
    },
    default: {},
  }),
  header: { 
    position: 'relative',
    paddingHorizontal: 20, 
    paddingBottom: 4,
    flexDirection: 'row', 
    alignItems: 'center',
  },
  headerCompact: {
    paddingHorizontal: 14,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minWidth: 0,
    marginRight: 10,
  },
  headerProfileTap: Platform.select({
    web: { cursor: 'pointer' },
    default: {},
  }),
  statusPill: { 
    flexGrow: 0,
    flexShrink: 1,
    maxWidth: Math.min(196, width * 0.46),
    borderRadius: 10,
    paddingLeft: 10,
    paddingRight: 6,
    paddingVertical: 7,
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    overflow: 'hidden',
  },
  statusPillDark: {
    ...Platform.select({
      web: { boxShadow: 'none', outlineStyle: 'none' },
      ios: {
        shadowColor: 'transparent',
        shadowOpacity: 0,
        shadowRadius: 0,
      },
      android: { elevation: 0 },
      default: {},
    }),
  },
  statusInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
    marginRight: 6,
  },
  statusDate: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.2,
    lineHeight: 11,
    flexShrink: 1,
  },
  statusDateDark: {
    fontSize: 9,
    lineHeight: 12,
    letterSpacing: 0.35,
  },
  statusArrowBox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    zIndex: 300,
    gap: 8,
  },
  menuAnchor: { position: 'relative', marginLeft: 8 },
  iconBtn: {
    width: 40,
    height: 40,
    backgroundColor: DASHBOARD_LIGHT_SURFACES.sheet,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: DASHBOARD_LIGHT_SURFACES.border,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  iconBtnInAnchor: { marginLeft: 0 },
  iconBtnDark: {
    backgroundColor: DASHBOARD_DARK_SURFACES.sheet,
    borderColor: DASHBOARD_DARK_SURFACES.border,
    shadowOpacity: 0,
  },
  notificationDot: {
    position: 'absolute',
    top: 11,
    right: 11,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  notificationDotDark: { borderColor: DASHBOARD_DARK_SURFACES.sheet },
  menuModalRoot: {
    flex: 1,
  },
  menuBackdropFill: {
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
  menuBackdropDark: {
    backgroundColor: 'rgba(2, 6, 23, 0.72)',
  },
  accountMenuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 12,
  },
  accountMenuHeaderDark: {},
  accountMenuMeta: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  accountMenuTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  accountMenuSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  accountMenuEmail: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94a3b8',
  },
  accountMenuDropdown: {
    minWidth: 268,
    maxWidth: Math.min(320, width - 28),
  },
  menuDropdown: {
    position: 'absolute',
    minWidth: 210,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: { elevation: 24 },
      default: {
        boxShadow: '0 12px 32px rgba(15, 23, 42, 0.18)',
      },
    }),
  },
  menuDropdownModal: {
    top: 0,
    right: 0,
    zIndex: 2,
  },
  menuDropdownLight: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
  },
  menuDropdownDark: {
    backgroundColor: DASHBOARD_DARK_SURFACES.sheet,
    borderColor: DASHBOARD_DARK_SURFACES.border,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  menuItemDestructive: {
    color: '#ef4444',
  },
  menuDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 12,
    marginVertical: 4,
  },
  menuDividerDark: {
    backgroundColor: DASHBOARD_DARK_SURFACES.border,
  },
  
  // Carousel
  heroCarouselBlock: {
    width: '100%',
    height: HERO_CAROUSEL_BLOCK_HEIGHT,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  heroList: {
    width: '100%',
    minHeight: HERO_SLOT_HEIGHT,
    marginTop: HERO_LIST_TOP_MARGIN,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    ...Platform.select({
      web: {
        backgroundColor: 'transparent',
        backgroundImage: 'none',
        scrollBehavior: 'smooth',
      },
      default: {},
    }),
  },
  heroListContent: {
    backgroundColor: 'transparent',
    ...Platform.select({
      web: { backgroundColor: 'transparent' },
      default: {},
    }),
  },
  heroCarouselPage: {
    backgroundColor: 'transparent',
  },
  heroCardPage: {
    height: HERO_SLOT_HEIGHT,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 2,
  },
  heroCardOuter: {
    borderRadius: HERO_CARD_RADIUS,
    borderBottomLeftRadius: HERO_CARD_RADIUS,
    borderBottomRightRadius: HERO_CARD_RADIUS,
    minHeight: HERO_CARD_MIN_HEIGHT,
    overflow: 'hidden',
    zIndex: 2,
    ...Platform.select({
      web: {
        borderRadius: HERO_CARD_RADIUS,
        overflow: 'hidden',
      },
      default: {},
    }),
  },
  heroCardOuterCompact: {
    minHeight: HERO_CARD_MIN_HEIGHT_COMPACT,
  },
  heroCardOuterLight: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    ...Platform.select({
      web: { boxShadow: '0 8px 28px rgba(15, 23, 42, 0.08)' },
      ios: {
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: { elevation: 4 },
      default: {},
    }),
  },
  heroCardOuterDark: {
    backgroundColor: DASHBOARD_DARK_SURFACES.heroElevated,
    borderWidth: 1,
    borderColor: DASHBOARD_DARK_SURFACES.borderWarm,
    ...Platform.select({
      web: { boxShadow: '0 8px 24px rgba(0, 0, 0, 0.28)' },
      android: { elevation: 5 },
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.22,
        shadowRadius: 10,
      },
      default: {},
    }),
  },
  heroCardInner: {
    flex: 1,
    minHeight: HERO_CARD_MIN_HEIGHT,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 0,
    justifyContent: 'space-between',
  },
  heroCardInnerCompact: {
    paddingHorizontal: 14,
    minHeight: HERO_CARD_MIN_HEIGHT_COMPACT,
  },
  userCardInner: {
    paddingTop: 18,
    paddingBottom: 18,
    justifyContent: 'space-between',
  },
  userCardInnerDark: {},
  userCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userCardBrandFloat: {
    position: 'absolute',
    right: 18,
    top: 18,
    alignItems: 'flex-end',
    gap: 2,
    opacity: 0.98,
  },
  userCardAvatarFloat: {
    position: 'absolute',
    right: 18,
    top: '50%',
    transform: [{ translateY: -22 }],
    opacity: 0.95,
  },
  userCardAvatarFloatCompact: {
    top: 62,
    transform: [{ translateY: 0 }],
  },
  userCardBarcodeWrap: {
    marginTop: 10,
    paddingTop: 6,
    paddingBottom: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
  },
  userCardBarcodeDigits: {
    marginTop: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  userCardBarcodeDigit: {
    fontSize: 9,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: 0.3,
  },
  userCardBarcodeIdCode: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: 0.6,
    textAlign: 'center',
    opacity: 0.85,
  },
  userCardBrand: {
    alignItems: 'flex-end',
    gap: 2,
  },
  userCardBrandText: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.6,
    color: '#0f172a',
  },
  userCardBrandSub: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.2,
  },
  userCardMain: {
    gap: 3,
    paddingRight: 92,
  },
  userCardName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  userCardRole: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },
  userCardEmail: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
  },
  userCardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingRight: 92,
  },
  userCardMetaRight: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  userCardMetaInlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  userCardMetaRightCompact: {
    marginLeft: 8,
  },
  userCardMetaInlineRowCompact: {
    gap: 10,
  },
  userCardMetaValueCompact: {
    fontSize: 12,
  },
  userCardMetaInlineItem: {
    alignItems: 'flex-end',
  },
  userCardMetaLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.6,
  },
  userCardMetaValue: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: 0.2,
  },
  heroCardMain: {
    flexShrink: 0,
  },
  heroCardFoot: {
    flexShrink: 0,
    marginHorizontal: -18,
    paddingHorizontal: 18,
    paddingBottom: 14,
    borderBottomLeftRadius: HERO_CARD_RADIUS,
    borderBottomRightRadius: HERO_CARD_RADIUS,
    overflow: 'hidden',
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    gap: 8,
  },
  heroSub: {
    flex: 1,
    minWidth: 0,
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  heroSubNarrow: {
    fontSize: 14,
    lineHeight: 18,
  },
  heroTag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  heroTagText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.55,
  },

  heroBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 12,
  },
  heroBodyCompact: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 12,
  },
  heroCountArea: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    flexShrink: 1,
  },
  heroCount: {
    fontSize: 42,
    fontWeight: '700',
    letterSpacing: -1.2,
    lineHeight: 44,
    flexShrink: 1,
  },
  heroCountCompact: {
    fontSize: 36,
    lineHeight: 38,
    letterSpacing: -0.8,
  },
  heroCountNarrow: {
    fontSize: 32,
    lineHeight: 34,
  },
  heroAmpm: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
    marginBottom: 6,
    color: '#64748B',
    flexShrink: 0,
  },
  heroAmpmCompact: {
    marginBottom: 4,
  },

  heroBtn: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    gap: 4,
    maxWidth: '100%',
    ...Platform.select({
      web: { boxShadow: '0 4px 14px rgba(15, 23, 42, 0.12)' },
      ios: {
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
      default: {},
    }),
  },
  heroBtnCompact: {
    alignSelf: 'flex-end',
  },
  heroBtnNarrow: {
    alignSelf: 'stretch',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  heroBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.15,
    flexShrink: 1,
  },
  heroBtnTextNarrow: {
    fontSize: 11,
  },

  heroDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: DASHBOARD_LIGHT_SURFACES.border,
    marginBottom: 8,
  },
  dividerDark: { backgroundColor: DASHBOARD_DARK_SURFACES.border },

  heroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 40,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    gap: 8,
  },
  heroFooterDark: {
    backgroundColor: DASHBOARD_DARK_SURFACES.heroFooter,
    borderWidth: 1,
    borderColor: DASHBOARD_DARK_SURFACES.border,
  },
  heroFooterIconWrap: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  heroFooterText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    color: '#475569',
  },
  footerTextLight: { color: '#475569' },
  footerTextDark: { color: '#94A3B8' },
  
  // Indicators
  indicatorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingVertical: 4,
    marginTop: 0,
    marginBottom: 4,
    backgroundColor: 'transparent',
  },
  sectionDivider: {
    alignSelf: 'stretch',
    width: '100%',
    height: 2,
    backgroundColor: DASHBOARD_LIGHT_SURFACES.border,
    marginBottom: 12,
  },
  dotsGroup: { flexDirection: 'row', alignItems: 'center' },
  fractionPill: {
    backgroundColor: DASHBOARD_LIGHT_SURFACES.sheet,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: DASHBOARD_LIGHT_SURFACES.border,
  },
  fractionPillDark: {
    backgroundColor: DASHBOARD_DARK_SURFACES.track,
    borderColor: DASHBOARD_DARK_SURFACES.border,
  },
  fractionText: { fontSize: 10, fontWeight: '900', color: '#1C2942' },
  dotsRow: { flexDirection: 'row', alignItems: 'center' },
  indicatorDot: { height: 4.5, borderRadius: 2.25, marginHorizontal: 2.5 },
  activeDotLight: { backgroundColor: '#1E293B' },
  inactiveDotLight: { backgroundColor: '#CBD5E1' },
  activeDotDark: { backgroundColor: '#F8FAFC' },
  inactiveDotDark: { backgroundColor: '#475569' },
  
  facultyIdBox: { flexDirection: 'row', alignItems: 'center' },
  idLabel: { fontSize: 10, fontWeight: '700', color: '#64748B', letterSpacing: 0.2 },
  idValue: { fontWeight: '900', color: '#0f172a' },
  copyBtn: {
    marginLeft: 8,
    padding: 6,
    borderRadius: 8,
    backgroundColor: DASHBOARD_LIGHT_SURFACES.promo,
  },
  copyBtnDark: {
    backgroundColor: DASHBOARD_DARK_SURFACES.copyBtn,
    borderWidth: 1,
    borderColor: DASHBOARD_DARK_SURFACES.border,
  },

  // Quick Actions Section
  section: { paddingHorizontal: 20 },
  sectionCompact: { paddingHorizontal: 14 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionHeaderText: { flex: 1 },
  sectionTitle: { fontSize: 14.5, fontWeight: '900', color: '#0B132B', letterSpacing: 0.5 },
  sectionSubtitle: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    letterSpacing: 0.15,
  },
  sectionSubtitleDark: { color: '#94A3B8' },
  sectionHistoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  sectionHistoryBtnDark: {
    borderColor: '#475569',
    backgroundColor: '#1E293B',
  },
  sectionHistoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.2,
  },
  sectionHistoryTextDark: { color: '#CBD5E1' },
  
  // Recent Latecomers Section
  activityGroupCard: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    backgroundColor: '#FAFBFC',
    marginBottom: 14,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow:
          '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        transition: 'all 0.2s ease-in-out',
        cursor: 'default',
        padding: 4, // More generous padding on Web
        gap: 4, // Spacing between items
      },
      ios: {
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 22,
      },
      android: { elevation: 4 },
      default: {},
    }),
  },
  activityGroupCardDark: {
    backgroundColor: DASHBOARD_DARK_SURFACES.sheet,
    borderColor: 'rgba(71, 85, 105, 0.65)',
    ...Platform.select({
      web: {
        boxShadow:
          '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1)',
      },
      default: {},
    }),
  },
  activityGroupCardRim: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.75)',
    zIndex: 1,
  },
  activityGroupCardRimDark: {
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  activityGroupPatternLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  activityGroupCell: {
    flex: 1,
    minWidth: 0,
    flexShrink: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 8,
    gap: 7,
    zIndex: 2,
    position: 'relative',
    backgroundColor: 'transparent',
  },
  activityGroupCellCompact: {
    paddingVertical: 14,
    paddingHorizontal: 4,
    gap: 5,
  },
  activityGroupCellPressed: {
    opacity: 0.88,
  },
  activityGroupCellDisabled: {
    opacity: 0.55,
  },
  activityGroupCellSyncReady: {
    backgroundColor: 'rgba(254, 243, 199, 0.35)',
  },
  activityGroupCellSyncReadyDark: {
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
  },
  activityGroupIconOuter: {
    marginBottom: 4,
    alignSelf: 'center',
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
      default: {},
    }),
  },
  activityGroupIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  activityGroupValue: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -1,
    lineHeight: 34,
    ...Platform.select({
      ios: { fontVariant: ['tabular-nums'] },
      android: { fontVariant: ['tabular-nums'] },
      default: {},
    }),
  },
  activityGroupValueCompact: {
    fontSize: 24,
    lineHeight: 28,
  },
  activityGroupValueDark: {
    color: '#F8FAFC',
  },
  activityGroupLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
    letterSpacing: 1.25,
    textTransform: 'uppercase',
  },
  activityGroupLabelCompact: {
    fontSize: 9,
    letterSpacing: 0.85,
  },
  activityGroupLabelDark: {
    color: '#94A3B8',
    letterSpacing: 1,
  },
  activityGroupDividerPremium: {
    width: 1,
    alignSelf: 'stretch',
    marginVertical: 14,
    opacity: 0.9,
    flexShrink: 0,
  },
  segmentSwitcherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    alignSelf: 'stretch',
    width: '100%',
    marginBottom: 12,
  },
  quickActionsSwitcherRowCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    alignSelf: 'flex-end',
    width: 'auto',
    marginLeft: 'auto',
    paddingLeft: 20,
    marginBottom: 12,
  },
  segmentPillPress: {
    borderRadius: 999,
    overflow: 'hidden',
    flex: 1,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
        outlineWidth: 0,
        boxShadow: 'none',
      },
      default: {},
    }),
  },
  quickActionTabPressCompact: {
    flex: 0,
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: 'auto',
    width: 'auto',
    alignSelf: 'auto',
  },
  quickActionTabGap: {
    marginLeft: 8,
  },
  segmentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 34,
    paddingVertical: 0,
    paddingHorizontal: 10,
    borderRadius: 999,
    minHeight: 0,
    overflow: 'hidden',
  },
  quickActionPillCompact: {
    paddingHorizontal: 12,
  },
  segmentPillSelected: {
    borderWidth: 1,
    borderColor: 'transparent',
    ...Platform.select({
      web: { boxShadow: 'none' },
      ios: {
        shadowColor: 'transparent',
        shadowOpacity: 0,
        shadowRadius: 0,
      },
      android: { elevation: 0 },
      default: {},
    }),
  },
  segmentPillIdle: {
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.45)',
    ...Platform.select({
      web: { boxShadow: '0 1px 4px rgba(15, 23, 42, 0.06)' },
      ios: {
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: { elevation: 1 },
      default: {},
    }),
  },
  activitySwitcherLabel: {
    flexShrink: 1,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.35,
  },
  activitySwitcherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    ...Platform.select({
      web: { justifyContent: 'center' },
      default: {},
    }),
  },
  activitySwitcherRowMain: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
    ...Platform.select({
      web: { flexGrow: 0, flexShrink: 0, flexBasis: 'auto', width: 400 },
      default: {},
    }),
  },
  activitySegmentSwitcherFill: {
    marginBottom: 0,
    width: '100%',
  },
  activityViewModeRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  activityViewModeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: DASHBOARD_LIGHT_SURFACES.border,
    backgroundColor: DASHBOARD_LIGHT_SURFACES.sheet,
    padding: 4,
    overflow: 'hidden',
  },
  activityViewModeGroupDark: {
    backgroundColor: DASHBOARD_DARK_SURFACES.track,
    borderColor: DASHBOARD_DARK_SURFACES.border,
  },
  activityViewModeBtn: {
    width: 38,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
  },
  activityViewModeBtnActive: {
    backgroundColor: DASHBOARD_LIGHT_SURFACES.promo,
  },
  activityViewModeBtnActiveDark: {
    backgroundColor: DASHBOARD_DARK_ACCENT_BG.amber,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.35)',
  },
  activityListVertical: {
    marginBottom: 2,
  },
  activityListRow: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: DASHBOARD_LIGHT_SURFACES.border,
    marginBottom: 8,
    minHeight: 78,
  },
  activityListRowLight: {
    borderColor: '#E8EDF3',
    backgroundColor: '#FFFFFF',
  },
  activityListRowDark: {
    borderColor: ACTIVITY_CARD_DARK_ACCENT,
    backgroundColor: ACTIVITY_CARD_DARK_SURFACE,
  },
  activityListRowBg: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 18,
  },
  activityListRowTopAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 28,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  activityListRowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  activityListRowAvatarRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityListRowAvatarRingDark: {
    backgroundColor: '#334155',
  },
  activityListRowAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityListRowAvatarText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  activityListRowBody: {
    flex: 1,
    minWidth: 0,
    marginRight: 10,
    justifyContent: 'center',
  },
  activityListRowName: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0B132B',
    letterSpacing: 0.35,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  activityListRowMeta: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 5,
  },
  activityListRowMetaDot: {
    color: '#CBD5E1',
    fontWeight: '700',
  },
  activityListRowWhenRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityListRowWhen: {
    flex: 1,
    marginLeft: 5,
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  activityListRowWhenDark: {
    color: '#94A3B8',
  },
  activityListRowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    flexShrink: 0,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
  },
  activityListRowBadgeText: {
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.4,
    marginLeft: 4,
  },
  quickActionsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
    gap: 6,
  },
  quickActionItem: {
    flex: 1,
    alignItems: 'center',
    maxWidth: 112,
    paddingHorizontal: 2,
    ...Platform.select({
      web: { outlineStyle: 'none', cursor: 'pointer' },
      default: {},
    }),
  },
  quickActionItemPressed: {},
  quickActionPressableInner: {
    alignItems: 'center',
    width: '100%',
  },
  quickActionPressableInnerPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.96 }],
  },
  quickActionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    lineHeight: 15,
    letterSpacing: -0.15,
  },
  quickActionTitleCompact: {
    fontSize: 11,
    lineHeight: 14,
  },
  quickActionTitleDark: {
    color: '#F1F5F9',
  },
  quickActionSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 14,
    marginTop: 1,
  },
  quickActionSubtitleCompact: {
    fontSize: 10,
    lineHeight: 13,
  },
  quickActionSubtitleDark: {
    color: '#94A3B8',
  },

  activityScroll: {
    marginHorizontal: -20,
    paddingLeft: 20,
    paddingRight: 20,
    paddingVertical: 4,
    alignItems: 'center',
  },
  activityListScroll: {
    backgroundColor: 'transparent',
    overflow: 'visible',
  },
  activityCardHit: {
    ...Platform.select({
      web: { width: 210 },
      default: { width: 188 },
    }),
    marginRight: 12,
  },
  activityCardSurface: {
    width: '100%',
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: { shadowOpacity: 0 },
      android: { elevation: 0 },
      default: { boxShadow: 'none' },
    }),
  },
  activityCardLight: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activityCardDark: {
    backgroundColor: ACTIVITY_CARD_DARK_SURFACE,
    borderWidth: 1,
    borderColor: ACTIVITY_CARD_DARK_ACCENT,
  },
  activityCardClip: {
    overflow: 'hidden',
    borderRadius: 22,
    paddingBottom: 14,
    backgroundColor: 'transparent',
  },
  activityCardBgGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 22,
  },
  activityHeaderBand: {
    height: 54,
    width: '100%',
  },
  activityAvatarWrap: {
    alignItems: 'center',
    marginTop: -27,
    marginBottom: 10,
  },
  activityAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  activityAvatarDark: {
    borderColor: ACTIVITY_CARD_DARK_SURFACE,
  },
  activityAvatarText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
  activityBody: {
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  activityName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
    marginBottom: 3,
    textAlign: 'center',
  },
  activityId: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
    textAlign: 'center',
  },
  activityIdDark: {
    color: '#38BDF8',
  },
  textMutedLight: { color: '#64748B' },
  activityDeptPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#3B82F6',
  },
  activityDeptPillDark: {
    backgroundColor: '#2563EB',
  },
  activityDeptPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  activityDeptPillTextDark: { color: '#FFFFFF' },
  activityFooter: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    paddingHorizontal: 14,
    borderTopWidth: StyleSheet.hairlineWidth * 2,
    borderTopColor: 'rgba(241, 245, 249, 1)',
  },
  activityFooterDark: {
    borderTopColor: '#475569',
  },
  activityWhenCol: {
    flex: 1,
    minWidth: 0,
    marginRight: 6,
  },
  activityDate: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },
  activityDateDark: {
    color: '#A1A1AA',
  },
  activityTime: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.1,
  },
  activityTimeDark: {
    color: '#F8FAFC',
  },
  activityStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  activityStatusText: {
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.35,
    marginLeft: 4,
  },

  borderDark: { borderColor: '#0F172A' },
  textWhite: { color: '#F8FAFC' },
  textDarkTitle: { color: '#CBD5E1' },
  textDark: { color: '#94A3B8' },
  textDarkMuted: { color: '#94A3B8' },

  studentDashboardCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  studentCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 8,
  },
  studentCardTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  studentCardSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  studentGraceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
  },
  studentGraceBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.3,
  },
  graceStatusBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 14,
  },
  graceHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  graceLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  graceValue: {
    fontSize: 12,
    fontWeight: '800',
  },
  chancePillsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  chancePill: {
    flex: 1,
    paddingVertical: 5,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chancePillUsed: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  chancePillTextUsed: {
    fontSize: 9,
    fontWeight: '700',
    color: '#B45309',
  },
  chancePillAvailable: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  chancePillTextAvailable: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669',
  },
  standingSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  standingSummaryText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#059669',
  },
  finesMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: 12,
    marginBottom: 14,
  },
  fineMetricCell: {
    flex: 1,
    alignItems: 'center',
  },
  fineMetricVal: {
    fontSize: 16,
    fontWeight: '800',
  },
  fineMetricLabel: {
    fontSize: 10.5,
    fontWeight: '500',
    marginTop: 2,
    textAlign: 'center',
  },
  fineDivider: {
    width: 1,
    height: 24,
  },
  openRecordBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  openRecordBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
  noticesList: {
    marginBottom: 12,
  },
  noticeRow: {
    paddingVertical: 11,
  },
  noticeRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  noticeTag: {
    paddingHorizontal: 6.5,
    paddingVertical: 2.5,
    borderRadius: 4,
  },
  noticeTagText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  noticeDate: {
    fontSize: 11,
    fontWeight: '500',
  },
  noticeTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  noticeDesc: {
    fontSize: 11.5,
    lineHeight: 16,
  },
  viewAllNoticesBtn: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 2,
  },
  viewAllNoticesBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});

