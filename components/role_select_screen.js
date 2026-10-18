import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GraduationCap, UserRound, ArrowRight, Check } from 'lucide-react-native';
import { BrandHeader } from './brand_header';
import { RoleSelectBackdrop, SystemGlassPanel, DASHBOARD_DARK_SURFACES } from './apple_material';
import { NetworkStatusBadge } from '../features/network-status';

const ROLE_ACCENTS = {
  faculty: {
    accent: '#FBBF24',
    soft: 'rgba(251, 191, 36, 0.24)',
    glow: 'rgba(251, 191, 36, 0.5)',
  },
  student: {
    accent: '#60A5FA',
    soft: 'rgba(96, 165, 250, 0.24)',
    glow: 'rgba(96, 165, 250, 0.45)',
  },
};

const DARK = {
  cardBorder: 'rgba(62, 77, 102, 0.65)',
  cardBorderMuted: 'rgba(62, 77, 102, 0.5)',
  cardFill: 'rgba(38, 50, 71, 0.92)',
  cardFillBorder: 'rgba(77, 68, 54, 0.55)',
  buttonDisabledBorder: 'rgba(62, 77, 102, 0.45)',
  buttonDisabledFill: 'rgba(31, 42, 60, 0.9)',
  buttonDisabledText: '#e2e8f0',
  desc: '#cbd5e1',
};

const LIGHT = {
  cardBorder: 'rgba(148, 163, 184, 0.4)',
  cardBorderMuted: 'rgba(148, 163, 184, 0.4)',
  cardFill: '#ffffff',
  cardFillBorder: 'rgba(148, 163, 184, 0.28)',
  buttonDisabledBorder: 'rgba(148, 163, 184, 0.35)',
  buttonDisabledFill: '#ffffff',
  buttonDisabledText: '#64748b',
  desc: '#64748b',
  radioBorder: 'rgba(148, 163, 184, 0.65)',
};

const NATIVE_DARK = {
  cardFill: DASHBOARD_DARK_SURFACES.sheet,
  cardBorder: DASHBOARD_DARK_SURFACES.border,
  cardBorderSelectedWidth: 2.5,
  cardBorderWidth: 1.5,
  radioBorder: '#f8fafc',
  radioFill: '#475569',
  radioBorderWidth: 3,
  radioSize: 30,
  title: '#f8fafc',
  desc: '#e2e8f0',
  iconFaculty: ROLE_ACCENTS.faculty.accent,
  iconStudent: ROLE_ACCENTS.student.accent,
  iconFacultyBg: ROLE_ACCENTS.faculty.soft,
  iconStudentBg: ROLE_ACCENTS.student.soft,
};

const getNativeCardSurface = (isDark, isSelected, accent) => {
  if (IS_NATIVE_MOBILE && isDark) {
    return {
      backgroundColor: NATIVE_DARK.cardFill,
      borderColor: isSelected ? accent : NATIVE_DARK.cardBorder,
      borderWidth: isSelected ? NATIVE_DARK.cardBorderSelectedWidth : NATIVE_DARK.cardBorderWidth,
    };
  }
  return isDark
    ? {
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        borderColor: isSelected ? accent : DARK.cardFillBorder,
        borderWidth: isSelected ? 2 : 1,
      }
    : {
        backgroundColor: LIGHT.cardFill,
        borderColor: isSelected ? accent : LIGHT.cardBorderMuted,
        borderWidth: isSelected ? 2 : 1,
      };
};

const getNativeButtonSurface = (isDark) => {
  if (IS_NATIVE_MOBILE && isDark) {
    return {
      backgroundColor: '#1e293b',
      borderColor: '#475569',
    };
  }
  return isDark
    ? {
        backgroundColor: DARK.buttonDisabledFill,
        borderColor: DARK.buttonDisabledBorder,
      }
    : {
        backgroundColor: LIGHT.buttonDisabledFill,
        borderColor: LIGHT.buttonDisabledBorder,
      };
};

const getIconWrapBg = (isDark, roleId) => {
  if (IS_NATIVE_MOBILE && isDark) {
    return roleId === 'faculty' ? NATIVE_DARK.iconFacultyBg : NATIVE_DARK.iconStudentBg;
  }
  return roleId === 'faculty' ? ROLE_ACCENTS.faculty.soft : ROLE_ACCENTS.student.soft;
};

const RoleRadio = ({ selected, accent, accentSoft, accentGlow, isDark }) => {
  if (selected) {
    return (
      <View
        style={[
          styles.radioTrack,
          styles.radioTrackSelected,
          {
            borderColor: accent,
            backgroundColor: accentSoft,
            shadowColor: accent,
          },
        ]}
      >
        <View style={[styles.radioKnob, { backgroundColor: accent, shadowColor: accentGlow }]}>
          <Check size={13} color="#ffffff" strokeWidth={3.2} />
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.radioTrack,
        isDark ? styles.radioTrackDark : styles.radioTrackLight,
      ]}
    >
      <View style={[styles.radioHollow, isDark ? styles.radioHollowDark : styles.radioHollowLight]} />
    </View>
  );
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const H_PADDING = 24;
const IS_NATIVE_MOBILE = Platform.OS === 'ios' || Platform.OS === 'android';
const FOOTER_BOTTOM_GAP = Platform.select({ ios: 8, android: 12, default: 24 });

/** Clears legacy web CSS that forced left alignment on brand lines. */
const useClearLegacyBrandTextWebCss = () => {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return undefined;
    document.getElementById('mic-role-select-brand-text')?.remove();
    return undefined;
  }, []);
};

export const RoleSelectScreen = ({ colors, isDark = false, onSelect }) => {
  useClearLegacyBrandTextWebCss();
  const insets = useSafeAreaInsets();
  const [selectedRole, setSelectedRole] = useState(null);
  const isReady = Boolean(selectedRole);
  const footerHeight = 56 + Math.max(insets.bottom, IS_NATIVE_MOBILE ? 8 : 12) + FOOTER_BOTTOM_GAP;

  const roles = [
    {
      id: 'faculty',
      title: 'Faculty',
      desc: 'Record latecomers, manage duty logs, and access committee insights.',
      icon: UserRound,
      ...ROLE_ACCENTS.faculty,
    },
    {
      id: 'student',
      title: 'Student',
      desc: 'View your attendance record, notices, and discipline status.',
      icon: GraduationCap,
      ...ROLE_ACCENTS.student,
    },
  ];
  const continueAccent = ROLE_ACCENTS.faculty.accent;

  return (
    <View style={styles.root}>
      <RoleSelectBackdrop
        isDark={isDark}
        primary={ROLE_ACCENTS.faculty.accent}
        background={colors.background}
      />
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <View style={styles.topBar}>
          <NetworkStatusBadge colors={colors} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={IS_NATIVE_MOBILE}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.mainBlock}>
          <View style={styles.header}>
            <BrandHeader
              colors={colors}
              isDark={isDark}
              logoSize={72}
              gradientId="roleSelectLogoRing"
              style={styles.brandRow}
            />
            <Text style={[styles.title, { color: colors.text }]}>Select Your Role</Text>
          </View>

          <View style={styles.cards}>
            {roles.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.id;
              const isWeb = Platform.OS === 'web';
              const cardBorder = isSelected
                ? role.accent
                : isDark
                  ? DARK.cardBorderMuted
                  : LIGHT.cardBorderMuted;
              const nativeSurface = getNativeCardSurface(isDark, isSelected, role.accent);
              const useNativeDark = IS_NATIVE_MOBILE && isDark && !isWeb;
              const titleColor = useNativeDark ? NATIVE_DARK.title : colors.text;
              const descColor = useNativeDark ? NATIVE_DARK.desc : isDark ? DARK.desc : LIGHT.desc;

              const cardContent = (
                <View style={styles.card}>
                  <View
                    style={[
                      styles.iconWrap,
                      { backgroundColor: getIconWrapBg(isDark, role.id) },
                    ]}
                  >
                    <Icon
                      size={26}
                      color={role.accent}
                      strokeWidth={2.4}
                    />
                  </View>

                  <View style={styles.cardBody}>
                    <Text style={[styles.cardTitle, { color: titleColor }]}>{role.title}</Text>
                    <Text style={[styles.cardDesc, { color: descColor }]}>{role.desc}</Text>
                  </View>

                  <RoleRadio
                    selected={isSelected}
                    accent={role.accent}
                    accentSoft={role.soft}
                    accentGlow={role.glow}
                    isDark={isDark}
                  />
                </View>
              );

              return (
                <TouchableOpacity
                  key={role.id}
                  style={[
                    styles.cardShell,
                    isWeb
                      ? {
                          borderColor: cardBorder,
                          borderWidth: isSelected ? 2.5 : 1,
                        }
                      : [nativeSurface, isDark ? styles.cardShellDarkNative : styles.cardShellLightNative],
                    isSelected && styles.cardSelected,
                  ]}
                  onPress={() => setSelectedRole(role.id)}
                  activeOpacity={0.85}
                >
                  {isWeb ? (
                    <SystemGlassPanel isDark={isDark} style={styles.cardGlass}>
                      {cardContent}
                    </SystemGlassPanel>
                  ) : (
                    cardContent
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
          </View>
        </ScrollView>

        <View
          style={[
            styles.footer,
            {
              minHeight: footerHeight,
              paddingBottom: Math.max(insets.bottom, IS_NATIVE_MOBILE ? 8 : 12) + FOOTER_BOTTOM_GAP,
            },
          ]}
        >
          {isReady ? (
            <TouchableOpacity
              style={[
                styles.button,
                styles.buttonEnabled,
                {
                  backgroundColor: continueAccent,
                  shadowColor: continueAccent,
                },
              ]}
              onPress={() => onSelect(selectedRole)}
              activeOpacity={0.85}
            >
              <Text style={[styles.buttonText, { color: '#ffffff' }]}>Continue</Text>
              <ArrowRight color="#ffffff" size={20} strokeWidth={3} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.buttonShell,
                Platform.OS === 'web'
                  ? { borderColor: isDark ? DARK.buttonDisabledBorder : LIGHT.buttonDisabledBorder }
                  : [getNativeButtonSurface(isDark), styles.buttonShellNative],
              ]}
              disabled
              activeOpacity={1}
            >
              {Platform.OS === 'web' ? (
                <SystemGlassPanel isDark={isDark} style={styles.buttonGlass}>
                  <View style={styles.button}>
                    <Text
                      style={[
                        styles.buttonText,
                        { color: isDark ? DARK.buttonDisabledText : LIGHT.buttonDisabledText },
                      ]}
                    >
                      Continue
                    </Text>
                    <ArrowRight
                      color={isDark ? DARK.buttonDisabledText : LIGHT.buttonDisabledText}
                      size={20}
                      strokeWidth={3}
                    />
                  </View>
                </SystemGlassPanel>
              ) : (
                <View style={styles.button}>
                  <Text
                    style={[
                      styles.buttonText,
                      { color: isDark ? DARK.buttonDisabledText : LIGHT.buttonDisabledText },
                    ]}
                  >
                    Continue
                  </Text>
                  <ArrowRight
                    color={isDark ? DARK.buttonDisabledText : LIGHT.buttonDisabledText}
                    size={20}
                    strokeWidth={3}
                  />
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: SCREEN_WIDTH,
    minHeight: SCREEN_HEIGHT,
    overflow: 'hidden',
  },
  screen: {
    flex: 1,
    zIndex: 1,
    backgroundColor: 'transparent',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: H_PADDING,
    paddingTop: 12,
    paddingBottom: 4,
    zIndex: 2,
  },
  scroll: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: H_PADDING,
    paddingVertical: 20,
    backgroundColor: 'transparent',
  },
  mainBlock: {
    width: '100%',
  },
  header: {
    alignItems: 'stretch',
    paddingBottom: 14,
  },
  brandRow: {
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.3,
    marginBottom: 6,
    textAlign: 'left',
    alignSelf: 'flex-start',
    width: '100%',
  },
  cards: {
    gap: 10,
  },
  cardShell: {
    borderRadius: 18,
  },
  cardShellLightNative: {
    ...Platform.select({
      ios: {
        shadowColor: '#64748b',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: { elevation: 3 },
      default: {},
    }),
  },
  cardShellDarkNative: {
    backgroundColor: '#1e293b',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
      },
      android: { elevation: 6 },
      default: {},
    }),
  },
  cardGlass: {
    borderRadius: 18,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  cardSelected: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.22,
        shadowRadius: 14,
      },
      android: { elevation: 6 },
      default: {},
    }),
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardBody: {
    flex: 1,
    paddingRight: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 3,
  },
  cardDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  radioTrack: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  radioTrackSelected: {
    borderWidth: 2.5,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.55,
        shadowRadius: 8,
      },
      android: { elevation: 5 },
      default: {},
    }),
  },
  radioTrackDark: {
    borderColor: 'rgba(100, 116, 139, 0.4)',
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
  },
  radioTrackLight: {
    borderColor: LIGHT.radioBorder,
    backgroundColor: '#ffffff',
  },
  radioKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.35,
        shadowRadius: 3,
      },
      android: { elevation: 2 },
      default: {},
    }),
  },
  radioHollow: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  radioHollowDark: {
    borderColor: 'rgba(100, 116, 139, 0.38)',
    backgroundColor: 'transparent',
  },
  radioHollowLight: {
    borderColor: 'rgba(148, 163, 184, 0.45)',
    backgroundColor: 'transparent',
  },
  footer: {
    paddingHorizontal: H_PADDING,
    paddingTop: 12,
    marginBottom: 4,
  },
  buttonShell: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  buttonShellNative: {
    borderWidth: 1,
    borderRadius: 18,
    ...Platform.select({
      ios: {
        shadowColor: '#64748b',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
      default: {},
    }),
  },
  buttonGlass: {
    borderRadius: 18,
  },
  button: {
    flexDirection: 'row',
    paddingVertical: 15,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  buttonEnabled: {
    borderColor: 'transparent',
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
      },
      android: { elevation: 5 },
    }),
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '800',
    marginRight: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
});
