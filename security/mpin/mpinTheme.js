/** Shared light/dark tokens for MPIN screens. */
export const getMpinUi = (colors, isDark) => ({
  dotEmptyBorder: isDark ? '#64748b' : '#94a3b8',
  dotEmptyBg: isDark ? 'rgba(148, 163, 184, 0.14)' : '#f8fafc',
  dotFilled: colors.secondary,
  keyBg: isDark ? '#1e293b' : colors.card,
  keyBorder: isDark ? '#334155' : '#cbd5e1',
  keyPressedBg: isDark ? '#334155' : '#f1f5f9',
  mutedText: isDark ? colors.textMuted : '#64748b',
});
