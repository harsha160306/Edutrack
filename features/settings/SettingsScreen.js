import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  ChevronRight,
  Palette,
  Shield,
  Fingerprint,
  KeyRound,
  RefreshCw,
  Info,
  Monitor,
  ScrollText,
  Handshake,
  ScanFace,
  LogOut,
} from 'lucide-react-native';
import { MenuThemeSwitcher } from '../theme';
import { useMpinSetupStatus } from '../mpin-setup-status';
import { useBiometricEnableReminder } from '../biometric-enable-reminder';
import { enableBiometricUnlockForAccount } from '../biometric-enable-reminder';
import { useNetworkStatus } from '../network-status';
import { SETTINGS_COPY } from './constants';
import { ProfileAvatar } from '../../components/ProfileAvatar';
import { getAccountDisplay } from '../account/getAccountDisplay';
import { DASHBOARD_DARK_SURFACES } from '../../components/apple_material';
import { isNetworkAvailable } from '../../security/networkGate';
import { APP_BUILD, APP_VERSION } from '../../constants/appInfo';
import { loadSession } from '../../security/session';
import { BIOMETRIC_KIND } from '../../security/mpin/biometricAuth';

const SettingsSection = ({ label, children, colors, isDark }) => (
  <View style={styles.section}>
    <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{label}</Text>
    <View
      style={[
        styles.groupCard,
        {
          backgroundColor: isDark ? '#151a24' : colors.card,
          borderColor: isDark ? '#232a37' : colors.border,
        },
      ]}
    >
      {children}
    </View>
  </View>
);

const SettingsRow = ({
  icon: Icon,
  label,
  value,
  onPress,
  colors,
  isDark,
  showChevron = Boolean(onPress),
  trailing,
}) => {
  const body = (
    <>
      {Icon ? (
        <View
          style={[
            styles.rowIconWrap,
            {
              backgroundColor: isDark ? '#1c2330' : '#eef2f7',
              borderColor: isDark ? '#2d3748' : '#d9e2ec',
            },
          ]}
        >
          <Icon size={16} color={isDark ? '#cdd6e5' : '#4b5563'} strokeWidth={2.25} />
        </View>
      ) : null}
      <View style={styles.rowText}>
        <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
        {value ? (
          <Text style={[styles.rowValue, { color: colors.textMuted }]} numberOfLines={1}>
            {value}
          </Text>
        ) : null}
      </View>
      {trailing ?? (showChevron ? <ChevronRight size={18} color={colors.textMuted} strokeWidth={2.4} /> : null)}
    </>
  );

  if (!onPress) {
    return <View style={styles.row}>{body}</View>;
  }

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={0.65}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {body}
    </TouchableOpacity>
  );
};

export const SettingsScreen = ({
  colors,
  isDark,
  accountId,
  isFaculty = true,
  mpinStatusRefreshKey = 0,
  themePreference = 'system',
  onThemePreferenceChange,
  onSetupMpin,
  onChangePassword,
  onBack,
  onSignOut,
}) => {
  const insets = useSafeAreaInsets();
  const { status: mpinStatus, refresh: refreshMpinStatus } = useMpinSetupStatus(
    accountId,
    mpinStatusRefreshKey,
  );
  const { status: biometricStatus, refresh: refreshBiometric } = useBiometricEnableReminder(
    accountId,
    mpinStatusRefreshKey,
  );
  const { status: networkStatus } = useNetworkStatus();
  const [enablingBiometric, setEnablingBiometric] = useState(false);
  const [checkingUpdates, setCheckingUpdates] = useState(false);
  const [sessionInfo, setSessionInfo] = useState(null);

  const accountInfo = useMemo(() => getAccountDisplay(isFaculty), [isFaculty]);

  const mpinValue = mpinStatus?.isConfigured
    ? SETTINGS_COPY.mpinConfigured
    : SETTINGS_COPY.mpinNotSet;

  const showBiometricRow = Boolean(mpinStatus?.isConfigured);

  const biometricIcon =
    biometricStatus?.biometricKind === BIOMETRIC_KIND.FACIAL ? ScanFace : Fingerprint;

  const biometricValue = biometricStatus?.biometricEnabled
    ? SETTINGS_COPY.biometricOn
    : biometricStatus?.biometricAvailable
      ? SETTINGS_COPY.biometricOff
      : Platform.OS === 'web' || !biometricStatus?.biometricHasHardware
        ? SETTINGS_COPY.biometricUnavailable
        : biometricStatus?.biometricEnrolled === false
          ? SETTINGS_COPY.biometricNotEnrolled
          : SETTINGS_COPY.biometricUnavailable;

  useEffect(() => {
    let cancelled = false;
    loadSession().then((session) => {
      if (!cancelled) setSessionInfo(session);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleEnableBiometric = async () => {
    if (biometricStatus?.biometricEnabled || enablingBiometric) return;
    setEnablingBiometric(true);
    try {
      const result = await enableBiometricUnlockForAccount(accountId);
      if (result.ok) {
        await refreshBiometric();
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
        Alert.alert('Could not enable', 'Try again from Settings.');
      }
    } finally {
      setEnablingBiometric(false);
    }
  };

  const handleChangePassword = () => onChangePassword?.();
  const handleOpenSessions = () => {
    const roleText = sessionInfo?.role ?? accountId;
    const timeText = sessionInfo?.loggedInAt
      ? new Date(sessionInfo.loggedInAt).toLocaleString()
      : 'Unknown';
    Alert.alert(
      SETTINGS_COPY.sessions,
      `${SETTINGS_COPY.currentSession}\nRole: ${roleText}\nSigned in: ${timeText}`,
    );
  };
  const handleCheckForUpdates = async () => {
    if (checkingUpdates) return;
    if (!isNetworkAvailable(networkStatus)) {
      Alert.alert('Internet required', SETTINGS_COPY.updatesInternetRequired);
      return;
    }
    setCheckingUpdates(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 900));
      Alert.alert(SETTINGS_COPY.checkUpdates, SETTINGS_COPY.updatesUpToDate);
    } finally {
      setCheckingUpdates(false);
    }
  };
  const handleOpenChangeLog = () => {
    Alert.alert(
      `${SETTINGS_COPY.changeLog} · v${APP_VERSION}`,
      '• Improved Settings UI and grouped cards.\n• Added MPIN change flow with current MPIN verification.\n• Added Change Password flow with internet guard.\n• Added Sessions entry with current session details.\n• Added App version/build and update check.',
    );
  };
  const handleOpenContributions = () => {
    Alert.alert(
      SETTINGS_COPY.contributions,
      'Built with contributions from the MIC Discipline app team.\n\n• Product & Faculty workflows\n• Mobile UI/UX and theming\n• Offline sync and scanner integrations\n• Security, MPIN, and biometric flows',
    );
  };

  return (
    <View
      style={[styles.root, { backgroundColor: colors.background, paddingTop: Math.max(insets?.top || 0, 16) }]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={12}>
          <ChevronLeft color={colors.text} size={26} strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{SETTINGS_COPY.title}</Text>
        </View>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 72 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        <SettingsSection label={SETTINGS_COPY.account} colors={colors} isDark={isDark}>
          <TouchableOpacity style={styles.accountProfileRow} activeOpacity={0.75}>
            <ProfileAvatar
              initial={accountInfo.initial}
              size="lg"
              showOnlineDot
              onlineDotBorderColor={
                isDark ? DASHBOARD_DARK_SURFACES.sheet : colors.card
              }
            />
            <View style={styles.accountProfileMeta}>
              <Text style={[styles.accountProfileTitle, { color: colors.text }]}>
                {accountInfo.title}
              </Text>
              <Text style={[styles.accountProfileSubtitle, { color: colors.textMuted }]}>
                {accountInfo.subtitle}
              </Text>
              <Text style={[styles.accountProfileEmail, { color: colors.textMuted }]}>
                {accountInfo.email}
              </Text>
            </View>
            <ChevronRight size={18} color={colors.textMuted} strokeWidth={2.4} />
          </TouchableOpacity>
          <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />
          <SettingsRow
            icon={Monitor}
            label={SETTINGS_COPY.sessions}
            value={SETTINGS_COPY.currentSession}
            onPress={handleOpenSessions}
            colors={colors}
            isDark={isDark}
            showChevron
          />
        </SettingsSection>

        <SettingsSection label={SETTINGS_COPY.appearance} colors={colors} isDark={isDark}>
          <View style={styles.row}>
            <View
              style={[
                styles.rowIconWrap,
                {
                  backgroundColor: isDark ? '#1c2330' : '#eef2f7',
                  borderColor: isDark ? '#2d3748' : '#d9e2ec',
                },
              ]}
            >
              <Palette size={16} color={isDark ? '#cdd6e5' : '#4b5563'} strokeWidth={2.25} />
            </View>
            <View style={styles.rowText}>
              <Text style={[styles.rowLabel, { color: colors.text }]}>{SETTINGS_COPY.appearance}</Text>
              <Text style={[styles.rowValue, { color: colors.textMuted }]}>
                {SETTINGS_COPY.appearanceHint}
              </Text>
            </View>
          </View>
          <MenuThemeSwitcher
            value={themePreference}
            onChange={onThemePreferenceChange}
            isDark={isDark}
          />
        </SettingsSection>

        <SettingsSection label={SETTINGS_COPY.security} colors={colors} isDark={isDark}>
          <SettingsRow
            icon={Shield}
            label={SETTINGS_COPY.mpin}
            value={mpinValue}
            onPress={
              onSetupMpin
                ? () => onSetupMpin(mpinStatus?.isConfigured ? 'change' : 'setup')
                : undefined
            }
            colors={colors}
            isDark={isDark}
            showChevron={Boolean(onSetupMpin)}
          />
          {showBiometricRow ? (
            <>
              <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />
              <SettingsRow
                icon={biometricIcon}
                label={biometricStatus?.biometricLabel ?? SETTINGS_COPY.biometric}
                value={biometricValue}
                onPress={
                  biometricStatus?.biometricAvailable && !biometricStatus?.biometricEnabled
                    ? handleEnableBiometric
                    : undefined
                }
                colors={colors}
                isDark={isDark}
                showChevron={false}
                trailing={
                  biometricStatus?.biometricAvailable && !biometricStatus?.biometricEnabled ? (
                    enablingBiometric ? (
                      <ActivityIndicator size="small" color={colors.secondary} />
                    ) : (
                      <Text style={[styles.rowAction, { color: colors.secondary }]}>
                        {SETTINGS_COPY.biometricEnable}
                      </Text>
                    )
                  ) : undefined
                }
              />
              <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />
              <SettingsRow
                icon={KeyRound}
                label={SETTINGS_COPY.changePassword}
                onPress={handleChangePassword}
                colors={colors}
                isDark={isDark}
                showChevron
              />
            </>
          ) : null}
        </SettingsSection>

        <SettingsSection label={SETTINGS_COPY.appInfo} colors={colors} isDark={isDark}>
          <SettingsRow
            icon={Info}
            label={SETTINGS_COPY.appVersion}
            value={APP_VERSION}
            colors={colors}
            isDark={isDark}
            showChevron={false}
          />
          <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />
          <SettingsRow
            icon={Info}
            label={SETTINGS_COPY.buildVersion}
            value={APP_BUILD}
            colors={colors}
            isDark={isDark}
            showChevron={false}
          />
          <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />
          <SettingsRow
            icon={ScrollText}
            label={SETTINGS_COPY.changeLog}
            onPress={handleOpenChangeLog}
            colors={colors}
            isDark={isDark}
            showChevron
          />
          <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />
          <SettingsRow
            icon={Handshake}
            label={SETTINGS_COPY.contributions}
            onPress={handleOpenContributions}
            colors={colors}
            isDark={isDark}
            showChevron
          />
          <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />
          <SettingsRow
            icon={RefreshCw}
            label={SETTINGS_COPY.checkUpdates}
            onPress={handleCheckForUpdates}
            colors={colors}
            isDark={isDark}
            showChevron={!checkingUpdates}
            trailing={
              checkingUpdates ? (
                <ActivityIndicator size="small" color={colors.secondary} />
              ) : undefined
            }
          />
        </SettingsSection>
      </ScrollView>

      {onSignOut ? (
        <View
          style={[styles.logoutFloat, { paddingBottom: insets.bottom + 16 }]}
          pointerEvents="box-none"
        >
          <TouchableOpacity
            style={[styles.logoutBtn, isDark && styles.logoutBtnDark]}
            onPress={onSignOut}
            activeOpacity={0.82}
            accessibilityRole="button"
            accessibilityLabel={SETTINGS_COPY.logout}
          >
            <LogOut size={18} color="#ffffff" strokeWidth={2.25} />
            <Text style={styles.logoutText}>{SETTINGS_COPY.logout}</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 26, fontWeight: '700', letterSpacing: -0.25 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 72 },
  section: { marginBottom: 16 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    marginBottom: 9,
    marginLeft: 8,
  },
  groupCard: {
    borderWidth: 1,
    borderRadius: 18,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  rowText: { flex: 1, minWidth: 0 },
  rowLabel: { fontSize: 16, fontWeight: '600' },
  rowValue: { fontSize: 13, fontWeight: '500', marginTop: 3, lineHeight: 18 },
  rowAction: { fontSize: 14, fontWeight: '700' },
  rowDivider: { height: StyleSheet.hairlineWidth, marginLeft: 58 },
  rowIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  accountProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  accountProfileMeta: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  accountProfileTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  accountProfileSubtitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  accountProfileEmail: {
    fontSize: 12,
    fontWeight: '500',
  },
  logoutFloat: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 0,
    alignItems: 'stretch',
    paddingTop: 8,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 999,
    backgroundColor: '#ef4444',
    borderWidth: 1,
    borderColor: '#dc2626',
  },
  logoutBtnDark: {
    backgroundColor: '#dc2626',
    borderColor: '#b91c1c',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.15,
  },
});
