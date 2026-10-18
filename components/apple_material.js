import React from 'react';
import { View, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, LinearGradient as SvgLinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';

const BLUR_INTENSITY = Platform.select({ ios: 40, default: 48 });
const LIQUID_BLUR_INTENSITY = Platform.select({ ios: 72, android: 56, default: 64 });

/** iOS systemBlue — light / dark (HIG action sheet links). */
export const APPLE_SYSTEM_BLUE = {
  light: '#007AFF',
  dark: '#0A84FF',
};

export const getAppleSystemBlue = (isDark) =>
  isDark ? APPLE_SYSTEM_BLUE.dark : APPLE_SYSTEM_BLUE.light;

export const hexToRgba = (hex, alpha) => {
  const normalized = hex.replace('#', '');
  const full =
    normalized.length === 3
      ? normalized
          .split('')
          .map((c) => c + c)
          .join('')
      : normalized;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/** Same translucent fill as web `backdrop-filter` glass. */
export const glassPanelStyle = (isDark) => ({
  backgroundColor: isDark ? 'rgba(30, 41, 59, 0.68)' : 'rgba(255, 255, 255, 0.78)',
  borderWidth: 1,
  borderColor: isDark ? 'rgba(71, 85, 105, 0.65)' : 'rgba(100, 116, 139, 0.28)',
});

const webGlassStyle = (isDark) => ({
  ...glassPanelStyle(isDark),
  backdropFilter: 'blur(40px) saturate(180%)',
  WebkitBackdropFilter: 'blur(40px) saturate(180%)',
});

/** iOS 26–style liquid glass: stronger blur, lighter veil, specular rim. */
export const liquidGlassPanelStyle = (isDark) => ({
  backgroundColor: isDark ? 'rgba(15, 23, 42, 0.52)' : 'rgba(255, 255, 255, 0.62)',
  borderWidth: StyleSheet.hairlineWidth * 2,
  borderColor: isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(255, 255, 255, 0.72)',
});

/** Silver edge tokens — cool slate highlight on glass chrome. */
const navSilverEdgeBorder = (isDark) =>
  isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(248, 250, 252, 0.92)';

/** Nav pill — iOS-style frosted bar (reference: milky white, soft edge). */
export const navLiquidGlassPanelStyle = (isDark) =>
  isDark
    ? {
        backgroundColor: 'rgba(22, 26, 34, 0.8)',
        borderWidth: StyleSheet.hairlineWidth * 2,
        borderColor: navSilverEdgeBorder(isDark),
      }
    : {
        backgroundColor: 'rgba(255, 255, 255, 0.94)',
        borderWidth: 1,
        borderColor: 'rgba(148, 163, 184, 0.5)',
      };

/** Frost veil on native blur — dark: original opaque frost; light: lighter for blur read-through. */
const navChromeVeilColor = (isDark) =>
  isDark ? 'rgba(22, 26, 34, 0.5)' : 'rgba(255, 255, 255, 0.38)';

/** expo-blur intensity for nav pill (light mode tuning). */
export const navPillBlurIntensity = (isDark) =>
  isDark
    ? Platform.select({ ios: 88, android: 64, default: 72 })
    : Platform.select({ ios: 88, android: 64, default: 72 });

/**
 * Round action buttons — solid (no backdrop blur; blur on circles shows hexagon/dot bleed-through).
 */
export const navChipOpaqueStyle = (isDark) =>
  isDark
    ? {
        backgroundColor: '#1C2430',
        borderWidth: 1,
        borderColor: 'rgba(203, 213, 225, 0.24)',
      }
    : {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: 'rgba(148, 163, 184, 0.55)',
      };

/** Web-only: outer glow + inset rim without backdrop-filter (no hexagon bleed). */
const navChipWebFrostedStyle = (isDark) =>
  Platform.OS === 'web'
    ? {
        boxShadow: isDark
          ? `${navChipWebSilverGlow(isDark)}, inset 0 1px 0 rgba(255, 255, 255, 0.14)`
          : `${navChipWebSilverGlow(isDark)}, inset 0 1px 0 rgba(255, 255, 255, 0.95)`,
      }
    : null;

export const navChipSolidStyle = (isDark) => navChipOpaqueStyle(isDark);

/** Web: soft float shadow + subtle top highlight (reference nav bar). */
const navGlassWebGlow = (isDark) =>
  isDark
    ? [
        '0 0 0 1px rgba(255, 255, 255, 0.08)',
        '0 8px 28px rgba(0, 0, 0, 0.28)',
        'inset 0 1px 1px rgba(255, 255, 255, 0.06)',
      ].join(', ')
    : [
        '0 0 0 1px rgba(148, 163, 184, 0.45)',
        '0 10px 32px rgba(15, 23, 42, 0.14)',
        '0 4px 12px rgba(15, 23, 42, 0.08)',
        'inset 0 1px 0 rgba(255, 255, 255, 1)',
      ].join(', ');

/** Web: silver ring on opaque round chips (no inset cross). */
const navChipWebSilverGlow = (isDark) =>
  isDark
    ? '0 0 0 1px rgba(203, 213, 225, 0.26), 0 0 10px rgba(203, 213, 225, 0.1), 0 6px 20px rgba(0, 0, 0, 0.16)'
    : '0 0 0 1px rgba(148, 163, 184, 0.55), 0 0 14px rgba(148, 163, 184, 0.2), 0 10px 28px rgba(15, 23, 42, 0.14)';

/** Single soft elevation for round nav chips (avoid stacked box-shadow rings on web). */
export const navChipElevation = (isDark) =>
  Platform.select({
    ios: isDark
      ? {
          shadowColor: '#cbd5e1',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.14,
          shadowRadius: 14,
        }
      : {
          shadowColor: '#64748b',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.22,
          shadowRadius: 18,
        },
    android: { elevation: isDark ? 6 : 10 },
    default: {},
  });

/** Nav chrome tokens (tabs + floating actions). */
export const getNavChromeTokens = (isDark) =>
  isDark
    ? {
        accent: '#D89B48',
        selectedIcon: '#D89B48',
        labelActive: '#F8FAFC',
        inactive: '#94A3B8',
        activePillBg: DASHBOARD_DARK_ACCENT_BG.amber,
        activePillBorder: 'rgba(251, 191, 36, 0.35)',
        trackWellBg: 'transparent',
        scanIcon: DASHBOARD_DARK_SURFACES.primary,
        searchIcon: '#F8FAFC',
        actionPrimaryBg: '#F8FAFC',
        actionPrimaryIcon: '#0F172A',
        actionSecondaryBg: DASHBOARD_DARK_SURFACES.sheet,
      }
    : {
        accent: DASHBOARD_LIGHT_SURFACES.accentDeep,
        selectedIcon: DASHBOARD_LIGHT_SURFACES.accentDeep,
        labelActive: '#0F172A',
        inactive: '#475569',
        activePillBg: DASHBOARD_LIGHT_SURFACES.promo,
        activePillBorder: 'rgba(245, 158, 11, 0.35)',
        trackWellBg: 'transparent',
        scanIcon: DASHBOARD_LIGHT_SURFACES.primary,
        searchIcon: '#0F172A',
        actionPrimaryBg: '#111827',
        actionPrimaryIcon: '#FFFFFF',
        actionSecondaryBg: DASHBOARD_LIGHT_SURFACES.sheet,
      };

/** Primary floating action — solid disk (reference: black circle). */
export const navActionPrimaryStyle = (isDark) => ({
  backgroundColor: getNavChromeTokens(isDark).actionPrimaryBg,
  borderWidth: 0,
});

export const navActionSecondaryStyle = (isDark) =>
  isDark
    ? navChipOpaqueStyle(true)
    : {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: 'rgba(148, 163, 184, 0.5)',
      };

const webLiquidGlassStyle = (isDark, surface = 'default') => {
  const isNav = surface === 'nav';
  const navBlur = isDark ? 'blur(64px) saturate(200%)' : 'blur(72px) saturate(180%)';
  const panelStyle = isNav ? navLiquidGlassPanelStyle(isDark) : liquidGlassPanelStyle(isDark);

  let boxShadow;
  if (isNav) {
    boxShadow = navGlassWebGlow(isDark);
  } else {
    boxShadow = isDark
      ? '0 12px 48px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.12)'
      : '0 12px 40px rgba(15, 23, 42, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.85)';
  }

  return {
    ...panelStyle,
    backdropFilter: isNav ? navBlur : 'blur(56px) saturate(200%)',
    WebkitBackdropFilter: isNav ? navBlur : 'blur(56px) saturate(200%)',
    boxShadow,
    ...(isNav && Platform.OS === 'web' ? { isolation: 'isolate' } : null),
  };
};

/** Web: backdrop-filter on a child layer (overflow:hidden on shell breaks blur on some engines). */
const NavPillWebGlass = ({ isDark, radius, children }) => (
  <View style={styles.navPillShell}>
    <View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        { borderRadius: radius, overflow: 'hidden' },
        webLiquidGlassStyle(isDark, 'nav'),
      ]}
    />
    <NavSilverShineRim isDark={isDark} />
    <View style={[styles.glassForeground, styles.liquidForeground]}>{children}</View>
  </View>
);

/** Silver top sheen — dark: soft fade only; light: sheen + crisp hairline on pill. */
const NavSilverShineRim = ({ isDark, hairlineInset = '8%', showHairline }) => {
  const useHairline = showHairline ?? !isDark;
  return (
    <>
      <LinearGradient
        pointerEvents="none"
        colors={
          isDark
            ? ['rgba(255,255,255,0.11)', 'rgba(255,255,255,0.04)', 'rgba(255,255,255,0)']
            : ['rgba(255,255,255,0.92)', 'rgba(226,232,240,0.38)', 'rgba(255,255,255,0)']
        }
        locations={isDark ? [0, 0.28, 0.68] : [0, 0.42, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[styles.navTopSheen, isDark && styles.navTopSheenDark]}
      />
      {useHairline ? (
        <View
          pointerEvents="none"
          style={[
            styles.navSilverHairline,
            { left: hairlineInset, right: hairlineInset },
            { backgroundColor: 'rgba(255, 255, 255, 1)' },
          ]}
        />
      ) : null}
    </>
  );
};

const RadialFadeStops = ({ color, peak }) => (
  <>
    <Stop offset="0%" stopColor={color} stopOpacity={peak} />
    <Stop offset="32%" stopColor={color} stopOpacity={peak * 0.5} />
    <Stop offset="58%" stopColor={color} stopOpacity={peak * 0.22} />
    <Stop offset="82%" stopColor={color} stopOpacity={peak * 0.06} />
    <Stop offset="100%" stopColor={color} stopOpacity={0} />
  </>
);

/** Web: SVG mesh. */
const WebRoleSelectBackdrop = ({ isDark, primary, background }) => {
  const { width, height } = useWindowDimensions();

  return (
    <View
      style={[StyleSheet.absoluteFill, { backgroundColor: background }]}
      pointerEvents="none"
    >
      <Svg width={width} height={height} style={styles.backdropSvg}>
        <Defs>
          <SvgLinearGradient id="roleBase" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={primary} stopOpacity={isDark ? 0.2 : 0.14} />
            <Stop offset="45%" stopColor={isDark ? '#2d2640' : '#e0e7ff'} stopOpacity={isDark ? 0.14 : 0.08} />
            <Stop offset="100%" stopColor={isDark ? '#93c5fd' : '#6366f1'} stopOpacity={isDark ? 0.16 : 0.1} />
          </SvgLinearGradient>
          <RadialGradient id="roleWarm" cx="18%" cy="12%" rx="90%" ry="45%" gradientUnits="objectBoundingBox">
            <RadialFadeStops color={primary} peak={isDark ? 0.32 : 0.22} />
          </RadialGradient>
          <RadialGradient id="roleViolet" cx="88%" cy="28%" rx="70%" ry="45%" gradientUnits="objectBoundingBox">
            <RadialFadeStops color="#a855f7" peak={isDark ? 0.28 : 0.16} />
          </RadialGradient>
          <RadialGradient id="roleBlue" cx="78%" cy="88%" rx="90%" ry="50%" gradientUnits="objectBoundingBox">
            <RadialFadeStops color="#3b82f6" peak={isDark ? 0.3 : 0.18} />
          </RadialGradient>
          <RadialGradient id="roleTeal" cx="50%" cy="72%" rx="60%" ry="38%" gradientUnits="objectBoundingBox">
            <RadialFadeStops color="#14b8a6" peak={isDark ? 0.2 : 0.12} />
          </RadialGradient>
        </Defs>
        <Rect x={0} y={0} width={width} height={height} fill="url(#roleBase)" />
        <Rect x={0} y={0} width={width} height={height} fill="url(#roleWarm)" />
        <Rect x={0} y={0} width={width} height={height} fill="url(#roleViolet)" />
        <Rect x={0} y={0} width={width} height={height} fill="url(#roleBlue)" />
        <Rect x={0} y={0} width={width} height={height} fill="url(#roleTeal)" />
      </Svg>
    </View>
  );
};

/** Native: layered washes tuned to match web SVG opacities (no muddy brown base). */
const NativeRoleSelectBackdrop = ({ isDark, primary, background }) => {
  const warm = (a) => hexToRgba(primary, a);
  const clear = 'transparent';

  if (!isDark) {
    return (
      <View style={[StyleSheet.absoluteFill, { backgroundColor: background }]} pointerEvents="none">
        <LinearGradient
          colors={['#fff7ed', '#f3e8ff', '#e0e7ff', '#f1f5f9']}
          locations={[0, 0.35, 0.68, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={[warm(0.22), warm(0.08), clear]}
          locations={[0, 0.5, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0.75 }}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={[hexToRgba('#a855f7', 0.16), clear]}
          locations={[0, 1]}
          start={{ x: 1, y: 0 }}
          end={{ x: 0.25, y: 0.55 }}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={[clear, hexToRgba('#3b82f6', 0.18)]}
          locations={[0.4, 1]}
          start={{ x: 0.5, y: 0.35 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </View>
    );
  }

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: background }]} pointerEvents="none">
      <LinearGradient
        colors={['#352a1c', '#2d2640', '#243247', background]}
        locations={[0, 0.38, 0.72, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <LinearGradient
        colors={[warm(0.26), warm(0.1), clear]}
        locations={[0, 0.45, 1]}
        start={{ x: 0.15, y: 0.08 }}
        end={{ x: 0.85, y: 0.55 }}
        style={StyleSheet.absoluteFill}
      />

      <LinearGradient
        colors={[hexToRgba('#c4b5fd', 0.22), hexToRgba('#a855f7', 0.08), clear]}
        locations={[0, 0.5, 1]}
        start={{ x: 1, y: 0.05 }}
        end={{ x: 0.2, y: 0.55 }}
        style={StyleSheet.absoluteFill}
      />

      <LinearGradient
        colors={[clear, hexToRgba('#93c5fd', 0.22), hexToRgba('#3b82f6', 0.08)]}
        locations={[0.35, 0.72, 1]}
        start={{ x: 0.75, y: 0.5 }}
        end={{ x: 0.35, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <LinearGradient
        colors={[clear, hexToRgba('#5eead4', 0.14)]}
        locations={[0.55, 1]}
        start={{ x: 0.5, y: 0.5 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
};

export const RoleSelectBackdrop = (props) => {
  if (Platform.OS === 'web') {
    return <WebRoleSelectBackdrop {...props} />;
  }
  return <NativeRoleSelectBackdrop {...props} />;
};

/** Amber-based light dashboard surfaces (warm header, white cards, MIC gold accents). */
export const DASHBOARD_LIGHT_SURFACES = {
  canvas: '#FFFBF5',
  promo: '#FEF3C7',
  sheet: '#FFFFFF',
  track: '#FEF4E8',
  border: '#F5DEB8',
  primary: '#F97316',
  accent: '#F59E0B',
  accentDeep: '#B45309',
  statusPill: '#FFF7ED',
  statusText: '#C2410C',
};

/** Light dashboard wash — amber header → warm cream behind the sheet curve (not near-white). */
export const DASHBOARD_LIGHT_GRADIENT = {
  colors: [
    '#FBBF24',
    '#FDE68A',
    DASHBOARD_LIGHT_SURFACES.canvas,
    '#FEF0C7',
    DASHBOARD_LIGHT_SURFACES.track,
  ],
  locations: [0, 0.12, 0.26, 0.46, 1],
  css: `linear-gradient(180deg, #FBBF24 0%, #FDE68A 12%, ${DASHBOARD_LIGHT_SURFACES.canvas} 26%, #FEF0C7 46%, ${DASHBOARD_LIGHT_SURFACES.track} 100%)`,
};

/** Web-only professional college backdrop — original yellow header band fading to slate-grey web canvas. */
export const DASHBOARD_WEB_YELLOW_GRADIENT = {
  colors: ['#FBBF24', '#FDE68A', '#F8FAFC', '#F8FAFC'],
  locations: [0, 0.14, 0.32, 1],
  css: 'linear-gradient(180deg, #FBBF24 0%, #FDE68A 110px, #F8FAFC 240px, #F8FAFC 100%)',
};

/**
 * Warm pastel dark surfaces — dark analog of light cream (#FFFBF5) + wheat borders,
 * not cold blue-slate (mirrors the hero pattern zone in light mode).
 */
export const DASHBOARD_DARK_SURFACES = {
  canvas: '#2A281F',
  promo: '#3A3628',
  sheet: '#2F3644',
  /** Hero / elevated cards — lighter than sheet so content reads on Android dark. */
  heroElevated: '#3A4254',
  track: '#242118',
  border: '#5C5748',
  borderWarm: '#6B5A3E',
  patternGrid: 'rgba(251, 191, 36, 0.11)',
  primary: '#FB923C',
  accent: '#FBBF24',
  accentDeep: '#F59E0B',
  statusPill: '#2C2418',
  statusText: '#FCD34D',
  heroFooter: '#2A3140',
  heroChip: 'rgba(148, 163, 184, 0.16)',
  copyBtn: 'rgba(148, 163, 184, 0.18)',
};

/** Pastel icon/chip backgrounds — light solids, dark tinted fills (matches light mode cards). */
export const DASHBOARD_LIGHT_ACCENT_BG = {
  blue: '#EFF6FF',
  green: '#ECFDF5',
  amber: '#FFFBEB',
  orange: '#FFF7ED',
  slate: '#F1F5F9',
};

export const DASHBOARD_DARK_ACCENT_BG = {
  blue: '#1E3352',
  green: '#163B30',
  amber: '#3D3218',
  orange: '#3D2818',
  slate: '#2C3344',
};

const accentKeyFromTone = (toneHex = '') => {
  const hex = toneHex.toLowerCase();
  if (hex.includes('3b82') || hex.includes('395e') || hex.includes('4271')) return 'blue';
  if (hex.includes('10b981') || hex.includes('059669') || hex.includes('6ee7')) return 'green';
  if (hex.includes('f97316') || hex.includes('ea580c')) return 'orange';
  if (hex.includes('f59e0b') || hex.includes('d97706')) return 'amber';
  return 'slate';
};

export function getDashboardAccentBackground(isDark, toneHex, lightBg) {
  if (!isDark) {
    return lightBg ?? DASHBOARD_LIGHT_ACCENT_BG[accentKeyFromTone(toneHex)];
  }
  const key = accentKeyFromTone(toneHex);
  return DASHBOARD_DARK_ACCENT_BG[key] ?? hexToRgba(toneHex, 0.28);
}

export function getDashboardAccentBorderColor(toneHex, isDark) {
  return hexToRgba(toneHex, isDark ? 0.48 : 0.22);
}

/** Per-card accent tints for hero icon badges and footer icons in dark mode. */
export function getHeroCardAccentSurfaces(isDark, accentHex, lightGlow) {
  if (!isDark) {
    return {
      iconBadge: lightGlow,
      footerIcon: hexToRgba(accentHex, 0.14),
    };
  }
  return {
    iconBadge: hexToRgba(accentHex, 0.16),
    footerIcon: hexToRgba(accentHex, 0.22),
  };
}

/** Dark dashboard wash — gold header → dark cream canvas → sheet (mirrors light gradient). */
export const DASHBOARD_DARK_GRADIENT = {
  colors: [
    '#E8C17A',
    '#C9A24E',
    '#6B5A3A',
    DASHBOARD_DARK_SURFACES.canvas,
    DASHBOARD_DARK_SURFACES.track,
    DASHBOARD_DARK_SURFACES.sheet,
  ],
  locations: [0, 0.1, 0.22, 0.36, 0.54, 1],
  css: `linear-gradient(180deg, #E8C17A 0%, #C9A24E 10%, #6B5A3A 22%, ${DASHBOARD_DARK_SURFACES.canvas} 36%, ${DASHBOARD_DARK_SURFACES.track} 54%, ${DASHBOARD_DARK_SURFACES.sheet} 100%)`,
};

export const getDashboardSurfaces = (isDark) =>
  isDark ? DASHBOARD_DARK_SURFACES : DASHBOARD_LIGHT_SURFACES;

/** Main scroll sheet chrome (radius applied separately via Animated for smooth scroll). */
export function getDashboardContentSheetStyle(isDark) {
  const surfaces = getDashboardSurfaces(isDark);
  const base = {
    backgroundColor: surfaces.sheet,
    overflow: 'hidden',
  };

  if (isDark) {
    return {
      ...base,
      borderTopWidth: 1,
      borderTopColor: surfaces.borderWarm,
      ...Platform.select({
        ios: {
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -6 },
          shadowOpacity: 0.24,
          shadowRadius: 16,
        },
        android: { elevation: 8 },
        web: { boxShadow: '0 -10px 32px rgba(0, 0, 0, 0.28)' },
        default: {},
      }),
    };
  }

  const isWeb = Platform.OS === 'web';
  return {
    ...base,
    backgroundColor: isWeb ? '#F8FAFC' : surfaces.sheet,
    borderTopWidth: 1,
    borderTopColor: isWeb ? '#FDE68A' : surfaces.border,
    ...Platform.select({
      ios: {
        shadowColor: '#92400E',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.14,
        shadowRadius: 14,
      },
      android: { elevation: 7 },
      web: {
        boxShadow:
          '0 4px 20px rgba(0, 0, 0, 0.04)',
      },
      default: {},
    }),
  };
}

/**
 * Header controls sit on the warm gold gradient — use elevated contrast, not body sheet colors.
 */
export function getDashboardHeaderChrome(isDark, networkStatus, lightPillSurface) {
  const sharedIconBtnLight = {
    backgroundColor: DASHBOARD_LIGHT_SURFACES.sheet,
    borderColor: DASHBOARD_LIGHT_SURFACES.border,
  };

  if (!isDark) {
    const isWeb = Platform.OS === 'web';
    return {
      statusPill: isWeb
        ? { backgroundColor: 'rgba(255, 255, 255, 0.9)', borderColor: 'rgba(251, 191, 36, 0.6)' }
        : lightPillSurface,
      statusText: isWeb ? '#78350F' : '#334155',
      statusIcon:
        ({
          online: '#16A34A',
          network: '#D97706',
          offline: '#DC2626',
        }[networkStatus] ?? '#16A34A'),
      iconBtn: isWeb ? { backgroundColor: 'rgba(255, 255, 255, 0.9)', borderColor: 'rgba(251, 191, 36, 0.6)' } : sharedIconBtnLight,
      iconColor: isWeb ? '#78350F' : '#475569',
      profileDotBorder: isWeb ? '#FBBF24' : '#FFFBF5',
    };
  }

  const byStatus = {
    online: {
      statusPill: { backgroundColor: '#1A3D32', borderColor: 'rgba(110, 231, 183, 0.38)' },
      statusText: '#ECFDF5',
      statusIcon: '#6EE7B7',
      statusArrow: '#34D399',
    },
    network: {
      statusPill: { backgroundColor: '#3D2E14', borderColor: 'rgba(251, 191, 36, 0.42)' },
      statusText: '#FEF9C3',
      statusIcon: '#FCD34D',
      statusArrow: '#D97706',
    },
    offline: {
      statusPill: { backgroundColor: '#3D1C1C', borderColor: 'rgba(248, 113, 113, 0.42)' },
      statusText: '#FEE2E2',
      statusIcon: '#FCA5A5',
      statusArrow: '#EF4444',
    },
  };

  const tone =
    byStatus[networkStatus] ??
    byStatus.online;

  return {
    ...tone,
    iconBtn: {
      backgroundColor: 'rgba(22, 34, 52, 0.88)',
      borderColor: 'rgba(226, 232, 240, 0.32)',
    },
    iconColor: '#F8FAFC',
    profileDotBorder: '#E8C17A',
  };
}

/** Shared app chrome tokens (onboarding, login, role select). */
export const APP_THEME_COLORS = {
  light: {
    background: '#f1f5f9',
    card: '#ffffff',
    cardAlt: '#f8fafc',
    text: '#0f172a',
    textMuted: '#64748b',
    border: '#e2e8f0',
    primary: '#f59e0b',
    secondary: '#3b82f6',
    success: '#10b981',
  },
  dark: {
    background: DASHBOARD_DARK_SURFACES.track,
    card: DASHBOARD_DARK_SURFACES.sheet,
    cardAlt: DASHBOARD_DARK_SURFACES.canvas,
    text: '#F1F5F9',
    textMuted: '#94A3B8',
    border: DASHBOARD_DARK_SURFACES.border,
    primary: '#f59e0b',
    secondary: '#60A5FA',
    success: '#34D399',
  },
};

/**
 * Web: CSS blur glass.
 * Android: semi-transparent panel only (BlurView + dark tint = solid black).
 * iOS: blur + light veil matching web opacity.
 */
export const SystemGlassPanel = ({ isDark, style, children }) => {
  if (Platform.OS === 'web') {
    return <View style={[style, webGlassStyle(isDark)]}>{children}</View>;
  }

  if (Platform.OS === 'android') {
    return (
      <View style={[style, styles.glassClip, glassPanelStyle(isDark)]}>
        <View style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? 'rgba(30,36,43,0.95)' : 'rgba(255,255,255,0.95)' }]} />
        <View style={styles.glassForeground}>{children}</View>
      </View>
    );
  }

  const tint = isDark ? 'dark' : 'light';
  return (
    <View style={[style, styles.glassClip, glassPanelStyle(isDark)]}>
      <BlurView intensity={BLUR_INTENSITY} tint={tint} style={StyleSheet.absoluteFill} />
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: isDark ? 'rgba(30, 41, 59, 0.42)' : 'rgba(255, 255, 255, 0.32)' },
        ]}
      />
      <View style={styles.glassForeground}>{children}</View>
    </View>
  );
};

/**
 * Floating nav / control surfaces — iOS 26 liquid glass (heavy blur + specular highlight, unified capsule).
 * @param {'default'|'nav'|'nav-chip'} surface — `nav` = tab pill; `nav-chip` = round icon buttons (no specular gradient).
 */
export const LiquidGlassPanel = ({ isDark, style, children, surface = 'default' }) => {
  const isNav = surface === 'nav';
  const isChip = surface === 'nav-chip';

  if (isChip) {
    return (
      <View
        style={[
          style,
          styles.glassClip,
          navChipOpaqueStyle(isDark),
          navChipElevation(isDark),
          navChipWebFrostedStyle(isDark),
        ]}
      >
        <View style={styles.chipForeground}>{children}</View>
      </View>
    );
  }

  if (isNav) {
    const panelStyle = navLiquidGlassPanelStyle(isDark);
    const veilColor = navChromeVeilColor(isDark);

    if (Platform.OS === 'web') {
      const flat = StyleSheet.flatten(style) || {};
      const radius = flat.borderRadius ?? 32;
      return (
        <View style={[style, navChipElevation(isDark)]}>
          <NavPillWebGlass isDark={isDark} radius={radius}>
            {children}
          </NavPillWebGlass>
        </View>
      );
    }

    if (Platform.OS === 'android') {
      const tint = isDark ? 'dark' : 'light';
      return (
        <View style={[style, styles.glassClip, navChipElevation(isDark), panelStyle]}>
          <View
            style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? 'rgba(30,36,43,0.85)' : 'rgba(255,255,255,0.85)' }]}
          />
          <View
            pointerEvents="none"
            style={[StyleSheet.absoluteFill, { backgroundColor: veilColor }]}
          />
          <NavSilverShineRim isDark={isDark} />
          <View style={[styles.glassForeground, styles.liquidForeground]}>{children}</View>
        </View>
      );
    }

    const tint = isDark ? 'dark' : 'light';
    return (
      <View style={[style, styles.glassClip, navChipElevation(isDark), panelStyle]}>
        <BlurView
          intensity={navPillBlurIntensity(isDark)}
          tint={tint}
          style={StyleSheet.absoluteFill}
        />
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: veilColor }]} />
        <NavSilverShineRim isDark={isDark} />
        <View style={[styles.glassForeground, styles.liquidForeground]}>{children}</View>
      </View>
    );
  }

  const panelStyle = liquidGlassPanelStyle(isDark);
  const veilColor = isDark ? 'rgba(15, 23, 42, 0.28)' : 'rgba(255, 255, 255, 0.22)';

  if (Platform.OS === 'web') {
    return (
      <View style={[style, styles.glassClip, webLiquidGlassStyle(isDark, surface)]}>
        <View style={[styles.glassForeground, styles.liquidForeground]}>{children}</View>
      </View>
    );
  }

  if (Platform.OS === 'android') {
    return (
      <View style={[style, styles.glassClip, panelStyle]}>
        <View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { backgroundColor: veilColor }]}
        />
        <View style={[styles.glassForeground, styles.liquidForeground]}>{children}</View>
      </View>
    );
  }

  const tint = isDark ? 'dark' : 'light';
  return (
    <View style={[style, styles.glassClip, panelStyle]}>
      <BlurView intensity={LIQUID_BLUR_INTENSITY} tint={tint} style={StyleSheet.absoluteFill} />
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: veilColor }]} />
      <View style={[styles.glassForeground, styles.liquidForeground]}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  backdropSvg: {
    ...StyleSheet.absoluteFillObject,
  },
  glassClip: {
    overflow: 'hidden',
  },
  navPillShell: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  glassForeground: {
    zIndex: 1,
  },
  liquidForeground: {
    flex: 1,
    width: '100%',
  },
  chipForeground: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTopSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '28%',
    zIndex: 2,
  },
  navTopSheenDark: {
    height: '22%',
  },
  navChipTopSheen: {
    height: '24%',
  },
  navSilverHairline: {
    position: 'absolute',
    top: 1,
    height: 1,
    borderRadius: 1,
    zIndex: 3,
  },
  dashboardBackdrop: {
    zIndex: 0,
  },
  dashboardBackdropAndroid: {
  },
});

const getDashboardBackdropNativeStyle = () => [
  StyleSheet.absoluteFillObject,
  styles.dashboardBackdrop,
  Platform.OS === 'android' && styles.dashboardBackdropAndroid,
];

const WebDashboardBackdrop = ({ isDark }) => {
  const gradient = isDark ? DASHBOARD_DARK_GRADIENT : DASHBOARD_WEB_YELLOW_GRADIENT;
  return (
    <View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFillObject,
        styles.dashboardBackdrop,
        {
          backgroundColor: isDark ? gradient.colors[gradient.colors.length - 1] : '#F8FAFC',
          backgroundImage: gradient.css,
        },
      ]}
    />
  );
};

const NativeDashboardBackdrop = ({ isDark, primary }) => {
  const warm = (a) => hexToRgba(primary, a);
  const gradient = isDark ? DASHBOARD_DARK_GRADIENT : DASHBOARD_LIGHT_GRADIENT;
  const { colors, locations } = gradient;
  const nativeStyle = getDashboardBackdropNativeStyle();
  const warmPeak = isDark ? 0.42 : 0.14;
  const warmMid = isDark ? 0.16 : 0.06;
  const warmFadeEnd = isDark ? 0.34 : 0.28;

  return (
    <>
      <LinearGradient
        pointerEvents="none"
        colors={colors}
        locations={locations}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={nativeStyle}
        collapsable={false}
      />
      <LinearGradient
        pointerEvents="none"
        colors={[warm(warmPeak), warm(warmMid), 'transparent']}
        locations={[0, 0.16, warmFadeEnd]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={nativeStyle}
        collapsable={false}
      />
      {isDark ? (
        <LinearGradient
          pointerEvents="none"
          colors={[
            'rgba(42, 40, 31, 0)',
            'rgba(36, 33, 24, 0.18)',
            'rgba(47, 54, 68, 0.55)',
          ]}
          locations={[0.68, 0.88, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={nativeStyle}
          collapsable={false}
        />
      ) : null}
    </>
  );
};

/** Dashboard wash — warm header band → body (web CSS + native gradients). */
export const DashboardBackdrop = ({ isDark, primary = '#F59E0B' }) => {
  const accent = isDark
    ? DASHBOARD_DARK_SURFACES.accent
    : primary || DASHBOARD_LIGHT_SURFACES.accent;

  if (Platform.OS === 'web') {
    return <WebDashboardBackdrop isDark={isDark} />;
  }

  return <NativeDashboardBackdrop isDark={isDark} primary={accent} />;
};
