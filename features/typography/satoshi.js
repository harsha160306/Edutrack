import { Platform, StyleSheet, Text, TextInput } from 'react-native';
import { useFonts } from 'expo-font';

/** Fontshare Satoshi — Light, Regular, Medium, Bold. */
export const SATOSHI_FONT_FILES = {
  'Satoshi-Light': require('../../assets/fonts/Satoshi-Light.ttf'),
  'Satoshi-Regular': require('../../assets/fonts/Satoshi-Regular.ttf'),
  'Satoshi-Medium': require('../../assets/fonts/Satoshi-Medium.ttf'),
  'Satoshi-Bold': require('../../assets/fonts/Satoshi-Bold.ttf'),
};

export const APP_FONTS = Platform.select({
  web: {
    light: 'Satoshi',
    regular: 'Satoshi',
    medium: 'Satoshi',
    bold: 'Satoshi',
  },
  default: {
    light: 'Satoshi-Light',
    regular: 'Satoshi-Regular',
    medium: 'Satoshi-Medium',
    bold: 'Satoshi-Bold',
  },
});

const FONTSHARE_CSS =
  'https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700&display=swap';

const normalizeWeight = (weight) => {
  if (weight == null) return 400;
  if (typeof weight === 'number') return weight;
  const map = {
    light: 300,
    normal: 400,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  };
  if (map[weight]) return map[weight];
  const parsed = parseInt(String(weight), 10);
  return Number.isFinite(parsed) ? parsed : 400;
};

/** Maps fontWeight to the correct Satoshi face (native) or CSS weight (web). */
export const fontFamilyForWeight = (weight = '400') => {
  const w = normalizeWeight(weight);
  if (w >= 700) return APP_FONTS.bold;
  if (w >= 500) return APP_FONTS.medium;
  if (w <= 300) return APP_FONTS.light;
  return APP_FONTS.regular;
};

export const resolveTextFontStyle = (style) => {
  const flat = StyleSheet.flatten(style) || {};
  const weight = flat.fontWeight ?? '400';
  const w = normalizeWeight(weight);
  const explicit = flat.fontFamily;
  const skip =
    explicit &&
    !['System', 'sans-serif', 'sans-serif-medium', 'serif'].includes(explicit) &&
    !String(explicit).includes('Times');
  if (skip) {
    return flat;
  }
  if (Platform.OS === 'web') {
    return {
      ...flat,
      fontFamily: APP_FONTS.regular,
      fontWeight: String(w),
    };
  }
  const { fontWeight: _fw, fontFamily: _ff, ...rest } = flat;
  return {
    ...rest,
    fontFamily: fontFamilyForWeight(w),
  };
};

let typographyPatched = false;

/** Apply Satoshi to all Text / TextInput without per-screen changes. */
export const applyGlobalTypography = () => {
  if (typographyPatched) return;
  typographyPatched = true;

  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    const id = 'mic-satoshi-fontshare';
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = FONTSHARE_CSS;
      document.head.appendChild(link);
    }
  }

  const patchComponent = (Component) => {
    if (Component.__micSatoshiPatched) return;
    Component.__micSatoshiPatched = true;
    const originalRender = Component.render;
    if (typeof originalRender !== 'function') return;

    Component.render = function patchedRender(props, ref) {
      const fontPatch = resolveTextFontStyle(props?.style);
      return originalRender.call(
        this,
        {
          ...props,
          style: [props?.style, fontPatch],
        },
        ref,
      );
    };
  };

  if (typeof Text.render === 'function') {
    patchComponent(Text);
    patchComponent(TextInput);
  } else {
    const base = { fontFamily: APP_FONTS.regular };
    Text.defaultProps = { ...Text.defaultProps, style: base };
    TextInput.defaultProps = { ...TextInput.defaultProps, style: base };
  }
};

export function useAppFonts() {
  const [loaded] = useFonts(SATOSHI_FONT_FILES);
  return loaded;
}
