import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StatusBar, Platform, useColorScheme, StyleSheet, View, BackHandler } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { SplashScreen, LoadingScreen } from './components/splash_screen';
import { RoleSelectScreen } from './components/role_select_screen';
import { OnboardingScreen } from './components/onboarding_screen';
import { LoginScreen } from './components/auth_screens';
import { DashboardScreen } from './components/dashboard_screen';
import { ExitConfirmModal, confirmAppExit } from './components/ExitConfirmModal';
import {
  getAppBackTarget,
  shouldPromptExitOnBack,
} from './navigation/appBackNavigation';
import {
  hasMpinForAccount,
  MpinSetupPromptModal,
  MpinSetupScreen,
  MpinUnlockScreen,
} from './security/mpin';
import { markMpinSetupSkipped } from './features/mpin-setup-status';
import { saveSession, loadSession } from './security/session';
import { signInWithPlatform } from './features/platform-auth';
import { clearAllStoredCredentials } from './security/signOut';
import { OFFLINE_COPY } from './features/faculty-offline-sync';
import { IdCardScanScreen } from './features/id-card-scan';
import { AppSearchScreen } from './features/app-search';
import { MembersListScreen } from './features/faculty-members';
import { StudentAttendanceScreen } from './features/student-attendance/StudentAttendanceScreen';
import { StudentMarksScreen } from './features/student-marks/StudentMarksScreen';
import { StudentRecordScreen } from './features/student-record/StudentRecordScreen';
import { StudentNoticesScreen } from './features/student-notices/StudentNoticesScreen';
import { StudentProfileScreen } from './features/student-profile/StudentProfileScreen';
import {
  MarkedLatecomersScreen,
  LatecomerHistoryScreen,
} from './features/marked-latecomers';
import { SettingsScreen } from './features/settings';
import { ChangePasswordScreen } from './features/settings/ChangePasswordScreen';
import { loadThemePreference, saveThemePreference, THEME_PREFERENCES } from './features/theme';
import { useAppFonts } from './features/typography';
import { AppleAlertModal } from './components/AppleAlertModal';
import { APP_THEME_COLORS } from './components/apple_material';

const getUrlColorScheme = () => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  const value = new URLSearchParams(window.location.search).get('colorScheme');
  return value === 'light' || value === 'dark' ? value : null;
};

export default function App() {
  const fontsLoaded = useAppFonts();
  const [appState, setAppState] = useState('splash');
  const [userRole, setUserRole] = useState(null);
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Initializing system...');
  const [urlColorScheme, setUrlColorScheme] = useState(() => getUrlColorScheme());
  const [themePreference, setThemePreference] = useState('system');
  const [exitPromptVisible, setExitPromptVisible] = useState(false);
  const [mpinPromptVisible, setMpinPromptVisible] = useState(false);
  const [postLoginOfflineAlertVisible, setPostLoginOfflineAlertVisible] = useState(false);
  const [postLoginSyncNonce, setPostLoginSyncNonce] = useState(0);
  const [mpinStatusEpoch, setMpinStatusEpoch] = useState(0);
  const [scanPrefill, setScanPrefill] = useState(null);
  const [scanApprovalMode, setScanApprovalMode] = useState('auto');
  const [scanBehavior, setScanBehavior] = useState('mark'); // 'mark' | 'search'
  const [scanType, setScanType] = useState('latecomer'); // 'latecomer' | 'indiscipline'
  const [historyInitialFilter, setHistoryInitialFilter] = useState('all'); // 'all' | 'self' | 'committee'
  /** Screen to restore when leaving scan (dashboard, searching, marked, …). */
  const [scanReturnTo, setScanReturnTo] = useState('dashboard');
  const scanReturnToRef = useRef('dashboard');
  const skipHistoryPushRef = useRef(false);
  /** In-memory only: skip MPIN re-entry until app reload / close. */
  const mpinUnlockedRef = useRef(false);
  /** Prevents async theme load from overwriting a user selection. */
  const themePreferenceTouchedRef = useRef(false);

  const accountId = userRole ?? 'faculty';

  const bumpMpinStatus = useCallback(() => {
    setMpinStatusEpoch((n) => n + 1);
  }, []);

  const handleSignOut = useCallback(async () => {
    mpinUnlockedRef.current = false;
    const signedOutRole = userRole ?? accountId;
    try {
      if (signedOutRole) {
        await clearAllStoredCredentials(signedOutRole);
      }
    } catch (err) {
      console.warn('Sign out: failed to clear stored credentials', err);
    } finally {
      setUserRole(null);
      setMpinPromptVisible(false);
      bumpMpinStatus();
      setAppState('role-select');
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        skipHistoryPushRef.current = true;
        window.history.replaceState({ micScreen: 'role-select' }, '');
      }
    }
  }, [accountId, userRole, bumpMpinStatus]);

  const requestPostLoginSync = useCallback(() => {
    setPostLoginSyncNonce((n) => n + 1);
  }, []);

  const handleMpinUnlocked = useCallback(() => {
    mpinUnlockedRef.current = true;
    bumpMpinStatus();
    requestPostLoginSync();
    setAppState('dashboard');
  }, [bumpMpinStatus, requestPostLoginSync]);

  const goToDashboardAfterSignIn = useCallback(() => {
    requestPostLoginSync();
    setAppState('dashboard');
  }, [requestPostLoginSync]);

  const handleLockApp = useCallback(async () => {
    mpinUnlockedRef.current = false;
    setMpinPromptVisible(false);
    const mpinExists = await hasMpinForAccount(accountId);
    if (mpinExists) {
      setAppState('mpin-unlock');
    } else {
      setMpinPromptVisible(true);
    }
  }, [accountId]);

  const systemTheme = useColorScheme();
  const theme =
    themePreference === 'light'
      ? 'light'
      : themePreference === 'dark'
        ? 'dark'
        : urlColorScheme ?? systemTheme ?? 'light';
  const isDark = theme === 'dark';

  const handleThemePreferenceChange = useCallback((preference) => {
    if (!THEME_PREFERENCES.includes(preference)) return;
    themePreferenceTouchedRef.current = true;
    setThemePreference(preference);
    void saveThemePreference(preference);
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadThemePreference().then((stored) => {
      if (!cancelled && !themePreferenceTouchedRef.current) {
        setThemePreference(stored);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
    }
  }, [isDark]);

  useEffect(() => {
    if (Platform.OS === 'web') {
      if (typeof window === 'undefined') return undefined;

      const syncFromUrl = () => {
        setUrlColorScheme(getUrlColorScheme());
      };

      syncFromUrl();
      window.addEventListener('popstate', syncFromUrl);
      return () => window.removeEventListener('popstate', syncFromUrl);
    }

    return undefined;
  }, []);

  const colors = isDark ? APP_THEME_COLORS.dark : APP_THEME_COLORS.light;

  const showExitPrompt = useCallback(() => {
    setExitPromptVisible(true);
  }, []);

  const navigateToBackTarget = useCallback((target) => {
    if (target === 'role-select') {
      setUserRole(null);
    }
    setAppState(target);
    setExitPromptVisible(false);
  }, []);

  const setScanReturnTarget = useCallback((target) => {
    scanReturnToRef.current = target;
    setScanReturnTo(target);
  }, []);

  const openScanScreen = useCallback(
    ({ returnTo = 'dashboard', prefill = null, approvalMode = 'auto', behavior = 'mark', scanType = 'latecomer' } = {}) => {
      setScanReturnTarget(returnTo);
      setScanPrefill(prefill);
      setScanApprovalMode(approvalMode === 'manual' ? 'manual' : 'auto');
      setScanBehavior(behavior === 'search' ? 'search' : 'mark');
      setScanType(scanType);
      setAppState('scanning');
    },
    [setScanReturnTarget],
  );

  const exitScanScreen = useCallback(() => {
    setScanPrefill(null);
    setAppState(scanReturnToRef.current);
  }, []);

  const handleAppBack = useCallback(() => {
    if (exitPromptVisible) {
      setExitPromptVisible(false);
      return true;
    }

    if (mpinPromptVisible) {
      setMpinPromptVisible(false);
      setAppState('dashboard');
      return true;
    }

    if (appState === 'mpin-unlock') {
      handleSignOut();
      return true;
    }

    const backTarget = getAppBackTarget(appState, { scanReturnTo: scanReturnToRef.current });
    if (backTarget) {
      if (appState === 'scanning') {
        setScanPrefill(null);
      }
      navigateToBackTarget(backTarget);
      return true;
    }

    if (shouldPromptExitOnBack(appState)) {
      showExitPrompt();
      return true;
    }

    return false;
  }, [
    appState,
    exitPromptVisible,
    mpinPromptVisible,
    navigateToBackTarget,
    showExitPrompt,
    handleSignOut,
  ]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', handleAppBack);
    return () => sub.remove();
  }, [handleAppBack]);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') {
      return undefined;
    }
    if (skipHistoryPushRef.current) {
      skipHistoryPushRef.current = false;
      return undefined;
    }
    if (
      appState === 'splash' ||
      appState === 'loading' ||
      appState === 'mpin-setup' ||
      appState === 'mpin-unlock'
    ) {
      return undefined;
    }
    window.history.pushState({ micScreen: appState }, '');
    return undefined;
  }, [appState]);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') {
      return undefined;
    }

    const onPopState = () => {
      skipHistoryPushRef.current = true;
      handleAppBack();
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [handleAppBack]);

  useEffect(() => {
    if (appState === 'splash') {
      let cancelled = false;

      const bootstrap = async () => {
        const [storedSession] = await Promise.all([
          loadSession(),
          new Promise((resolve) => setTimeout(resolve, 2500)),
        ]);

        if (cancelled) return;

        if (storedSession?.role) {
          setUserRole(storedSession.role);
          setProgress(0);
          setLoadingText('Restoring your session...');
          setAppState('loading');
        } else {
          setAppState('role-select');
        }
      };

      bootstrap();
      return () => {
        cancelled = true;
      };
    }

    if (appState === 'loading') {
      const phases =
        userRole === 'student'
          ? [
              { p: 20, t: 'Connecting to student portal...' },
              { p: 50, t: 'Verifying your enrollment...' },
              { p: 80, t: 'Loading attendance records...' },
              { p: 100, t: 'Ready to view your profile.' },
            ]
          : [
              { p: 20, t: 'Establishing secure connection...' },
              { p: 50, t: 'Authenticating credentials...' },
              { p: 80, t: 'Loading faculty permissions...' },
              { p: 100, t: 'System Ready.' },
            ];
      let step = 0;
      const interval = setInterval(() => {
        if (step < phases.length) {
          setProgress(phases[step].p);
          setLoadingText(phases[step].t);
          step++;
        } else {
          clearInterval(interval);
          setTimeout(async () => {
            const mpinExists = await hasMpinForAccount(accountId);
            if (mpinExists) {
              if (mpinUnlockedRef.current) {
                goToDashboardAfterSignIn();
              } else {
                setAppState('mpin-unlock');
              }
            } else {
              setMpinPromptVisible(true);
            }
          }, 500);
        }
      }, 700);
      return () => clearInterval(interval);
    }

    return undefined;
  }, [appState, userRole, accountId, goToDashboardAfterSignIn]);

  if (!fontsLoaded) {
    return <View style={styles.container} />;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
    <SafeAreaProvider>
      <View
        style={[
          styles.container,
          {
            backgroundColor: appState === 'dashboard' ? 'transparent' : colors.background,
          },
        ]}
      >
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor="transparent"
          translucent
        />

        {appState === 'splash' && <SplashScreen colors={colors} theme={theme} />}

        {appState === 'role-select' && (
          <RoleSelectScreen
            colors={colors}
            isDark={isDark}
            onSelect={(role) => {
              setUserRole(role);
              setAppState('onboarding');
            }}
          />
        )}

        {appState === 'onboarding' && userRole && (
          <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
            <OnboardingScreen
              key={userRole}
              colors={colors}
              role={userRole}
              onComplete={() => setAppState('login')}
              onBack={handleAppBack}
            />
          </SafeAreaView>
        )}

        {appState === 'login' && (
          <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
            <LoginScreen
              colors={colors}
              isDark={isDark}
              role={userRole}
              onLogin={async (credentials) => {
                if (!userRole) return;
                if (credentials?.email && credentials?.password) {
                  const result = await signInWithPlatform({
                    email: credentials.email,
                    password: credentials.password,
                    expectedRole: userRole,
                  });
                  await saveSession({
                    role: result.role,
                    accessToken: result.accessToken,
                    refreshToken: result.refreshToken,
                    profile: result.profile,
                  });
                  setUserRole(result.role);
                } else {
                  await saveSession({ role: userRole });
                }
                setAppState('loading');
              }}
              onBack={handleAppBack}
            />
          </SafeAreaView>
        )}

        {appState === 'loading' && (
          <LoadingScreen progress={progress} loadingText={loadingText} colors={colors} theme={theme} />
        )}

        {appState === 'mpin-unlock' && (
          <MpinUnlockScreen
            colors={colors}
            isDark={isDark}
            accountId={accountId}
            onUnlocked={handleMpinUnlocked}
            onSignOut={handleSignOut}
          />
        )}

        {appState === 'mpin-change-verify' && (
          <MpinUnlockScreen
            colors={colors}
            isDark={isDark}
            accountId={accountId}
            onUnlocked={() => setAppState('change-password')}
            onSignOut={() => setAppState('settings')}
          />
        )}

        {appState === 'change-password' && (
          <View style={[styles.fullScreen, { backgroundColor: colors.background }]}>
            <ChangePasswordScreen
              colors={colors}
              isDark={isDark}
              accountId={accountId}
              onBack={() => setAppState('settings')}
              onComplete={() => setAppState('settings')}
            />
          </View>
        )}

        {appState === 'mpin-setup' && (
          <MpinSetupScreen
            colors={colors}
            isDark={isDark}
            accountId={accountId}
            onComplete={async () => {
              try {
                await clearMpinSetupSkipped(accountId);
              } catch {
                // Still enter the app if preference cleanup fails.
              }
              bumpMpinStatus();
              mpinUnlockedRef.current = true;
              goToDashboardAfterSignIn();
            }}
            onSkip={async () => {
              await markMpinSetupSkipped(accountId);
              bumpMpinStatus();
              mpinUnlockedRef.current = true;
              goToDashboardAfterSignIn();
            }}
          />
        )}

        {appState === 'dashboard' && (
          <View style={styles.dashboardHost}>
            <DashboardScreen
              colors={colors}
              isDark={isDark}
              role={accountId}
              accountId={accountId}
              mpinStatusRefreshKey={mpinStatusEpoch}
              postLoginSyncNonce={postLoginSyncNonce}
              onPostLoginOffline={() => setPostLoginOfflineAlertVisible(true)}
              themePreference={themePreference}
              onThemePreferenceChange={handleThemePreferenceChange}
              onSetupMpin={() => setAppState('mpin-setup')}
              onSignOut={handleSignOut}
              onLockApp={handleLockApp}
              onScan={({ approvalMode, scanType } = {}) =>
                openScanScreen({ returnTo: 'dashboard', approvalMode, scanType })
              }
              onSearch={() => {
                setScanPrefill(null);
                setAppState('searching');
              }}
              onMembers={() => setAppState('members')}
              onOpenMarked={() => setAppState('marked')}
              onOpenHistory={(filter = 'all') => {
                setHistoryInitialFilter(filter);
                setAppState('latecomer-history');
              }}
              onOpenSettings={() => setAppState('settings')}
              onOpenAttendance={() => setAppState('student-attendance')}
              onOpenMarks={() => setAppState('student-marks')}
              onOpenStudentRecord={() => setAppState('student-record')}
              onOpenStudentNotices={() => setAppState('student-notices')}
              onOpenStudentProfile={() => setAppState('student-profile')}
            />
          </View>
        )}

        {appState === 'marked' && accountId === 'faculty' && (
          <View style={[styles.fullScreen, { backgroundColor: colors.background }]}>
            <MarkedLatecomersScreen
              colors={colors}
              isDark={isDark}
              accountId={accountId}
              onBack={() => setAppState('dashboard')}
              onMarkAnother={() => openScanScreen({ returnTo: 'marked' })}
            />
          </View>
        )}

        {appState === 'latecomer-history' && accountId === 'faculty' && (
          <View style={[styles.fullScreen, { backgroundColor: colors.background }]}>
            <LatecomerHistoryScreen
              colors={colors}
              isDark={isDark}
              accountId={accountId}
              initialFilter={historyInitialFilter}
              hideFilters={historyInitialFilter === 'self'}
              onBack={() => setAppState('dashboard')}
            />
          </View>
        )}

        {appState === 'members' && accountId === 'faculty' && (
          <View style={[styles.fullScreen, { backgroundColor: colors.background }]}>
            <MembersListScreen
              colors={colors}
              isDark={isDark}
              onBack={() => setAppState('dashboard')}
            />
          </View>
        )}

        {appState === 'student-attendance' && (
          <View style={[styles.fullScreen, { backgroundColor: colors.background }]}>
            <StudentAttendanceScreen
              colors={colors}
              isDark={isDark}
              onBack={() => setAppState('dashboard')}
            />
          </View>
        )}

        {appState === 'student-marks' && (
          <View style={[styles.fullScreen, { backgroundColor: colors.background }]}>
            <StudentMarksScreen
              colors={colors}
              isDark={isDark}
              onBack={() => setAppState('dashboard')}
            />
          </View>
        )}

        {appState === 'student-record' && (
          <View style={[styles.fullScreen, { backgroundColor: colors.background }]}>
            <StudentRecordScreen
              colors={colors}
              isDark={isDark}
              onBack={() => setAppState('dashboard')}
            />
          </View>
        )}

        {appState === 'student-notices' && (
          <View style={[styles.fullScreen, { backgroundColor: colors.background }]}>
            <StudentNoticesScreen
              colors={colors}
              isDark={isDark}
              onBack={() => setAppState('dashboard')}
            />
          </View>
        )}

        {appState === 'student-profile' && (
          <View style={[styles.fullScreen, { backgroundColor: colors.background }]}>
            <StudentProfileScreen
              colors={colors}
              isDark={isDark}
              onBack={() => setAppState('dashboard')}
              onOpenSettings={() => setAppState('settings')}
              onLockApp={handleLockApp}
            />
          </View>
        )}

        {appState === 'settings' && (
          <View style={[styles.fullScreen, { backgroundColor: colors.background }]}>
            <SettingsScreen
              colors={colors}
              isDark={isDark}
              accountId={accountId}
              isFaculty={accountId === 'faculty'}
              mpinStatusRefreshKey={mpinStatusEpoch}
              themePreference={themePreference}
              onThemePreferenceChange={handleThemePreferenceChange}
              onSetupMpin={(intent = 'setup') => {
                if (intent === 'change') {
                  setAppState('mpin-change-verify');
                  return;
                }
                setAppState('mpin-setup');
              }}
              onChangePassword={() => setAppState('mpin-change-verify')}
              onBack={() => setAppState('dashboard')}
              onSignOut={handleSignOut}
            />
          </View>
        )}

        {(appState === 'searching' ||
          (appState === 'scanning' && scanReturnTo === 'searching')) &&
          accountId === 'faculty' && (
          <View
            style={[
              styles.fullScreen,
              { backgroundColor: colors.background },
              appState === 'scanning' && styles.screenUnderScan,
            ]}
            pointerEvents={appState === 'searching' ? 'auto' : 'none'}
          >
            <AppSearchScreen
              colors={colors}
              isDark={isDark}
              isFaculty
              accountId={accountId}
              onBack={() => setAppState('dashboard')}
              onQuickActionPress={(action) => {
                if (action.id === 'scan') {
                  openScanScreen({ returnTo: 'searching' });
                  return;
                }
                setAppState('dashboard');
              }}
            />
          </View>
        )}

        {appState === 'scanning' && accountId === 'faculty' && (
          <View
            style={[
              styles.fullScreen,
              styles.screenAboveSearch,
              { backgroundColor: colors.background },
            ]}
          >
            <IdCardScanScreen
              colors={colors}
              isDark={isDark}
              accountId={accountId}
              approvalMode={scanApprovalMode}
              behavior={scanBehavior}
              scanType={scanType}
              initialStudent={scanPrefill}
              onBack={exitScanScreen}
            />
          </View>
        )}

        <MpinSetupPromptModal
          visible={mpinPromptVisible}
          colors={colors}
          isDark={isDark}
          onSetup={() => {
            setMpinPromptVisible(false);
            setAppState('mpin-setup');
          }}
          onLater={async () => {
            await markMpinSetupSkipped(accountId);
            bumpMpinStatus();
            setMpinPromptVisible(false);
            goToDashboardAfterSignIn();
          }}
        />

        <AppleAlertModal
          visible={postLoginOfflineAlertVisible}
          title={OFFLINE_COPY.postLoginOfflineTitle}
          message={OFFLINE_COPY.postLoginOfflineMessage}
          colors={colors}
          isDark={isDark}
          dismissOnBackdrop={false}
          buttons={[
            {
              label: 'OK',
              style: 'default',
              onPress: () => setPostLoginOfflineAlertVisible(false),
            },
          ]}
        />

        <ExitConfirmModal
          visible={exitPromptVisible}
          colors={colors}
          isDark={isDark}
          onCancel={() => setExitPromptVisible(false)}
          onConfirm={() => {
            setExitPromptVisible(false);
            confirmAppExit();
          }}
        />

      </View>
    </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  dashboardHost: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  fullScreen: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    zIndex: 100,
    elevation: 100,
  },
  fullScreenWeb: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 1000,
  },
  screenUnderScan: {
    zIndex: 100,
    elevation: 100,
  },
  screenAboveSearch: {
    zIndex: 110,
    elevation: 110,
  },
});
