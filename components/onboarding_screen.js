import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, useWindowDimensions, Keyboard } from 'react-native';
import { ScanLine, ClipboardList, ShieldCheck, ArrowRight, Bell, IdCard } from 'lucide-react-native';
import { BRAND_SANS_FONT } from './brand_header';
import { FlowTopBar } from '../features/network-status';
import { useEdgeSwipeBack } from '../hooks/useEdgeSwipeBack';

const ONBOARDING_STEPS = {
  faculty: [
    {
      icon: ScanLine,
      colorKey: 'primary',
      title: 'Efficient Scanning',
      desc: 'Quickly record latecomers by scanning student ID cards using your device camera.',
    },
    {
      icon: ClipboardList,
      colorKey: 'secondary',
      title: 'Real-time Records',
      desc: 'Monitor live attendance statistics and maintain accurate personal duty logs.',
    },
    {
      icon: ShieldCheck,
      colorKey: 'success',
      title: 'Committee Insight',
      desc: 'Stay connected with the central committee for global insights and campus security.',
    },
  ],
  student: [
    {
      icon: ClipboardList,
      colorKey: 'secondary',
      title: 'Your Attendance',
      desc: 'Check your discipline attendance history and late-entry records anytime.',
    },
    {
      icon: Bell,
      colorKey: 'primary',
      title: 'Stay Informed',
      desc: 'Receive committee notices, announcements, and updates relevant to your class.',
    },
    {
      icon: IdCard,
      colorKey: 'success',
      title: 'Digital Student ID',
      desc: 'Access your student profile and ID details linked to the discipline system.',
    },
  ],
};

export const OnboardingScreen = ({ colors, role = 'faculty', onComplete, onBack }) => {
  const { width: screenWidth } = useWindowDimensions();
  const [step, setStep] = useState(0);
  const steps = useMemo(() => ONBOARDING_STEPS[role] ?? ONBOARDING_STEPS.faculty, [role]);
  const compactFooter = screenWidth < 380;
  const continuePillHeight = compactFooter ? 48 : 52;
  const sidePillHeight = compactFooter ? 42 : 44;
  const continuePillRadius = continuePillHeight / 2;
  const sidePillRadius = sidePillHeight / 2;
  const continueFontSize = compactFooter ? 14 : 16;
  const sideFontSize = compactFooter ? 13 : 14;

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const canGoBack = step > 0;
  const showSkip = step < steps.length - 1;

  const current = steps[step];
  const Icon = current.icon;
  const iconColor = colors[current.colorKey];

  const handleBackPress = () => {
    Keyboard.dismiss();
    onBack?.();
  };

  const showTopBack = Boolean(onBack) && !canGoBack;
  const edgeSwipeBack = useEdgeSwipeBack(
    showTopBack ? handleBackPress : null,
    showTopBack,
  );

  return (
    <View style={styles.container} {...(showTopBack ? edgeSwipeBack : {})}>
      <FlowTopBar
        colors={colors}
        onBack={showTopBack ? handleBackPress : undefined}
        backAccessibilityLabel="Back to role selection"
        style={styles.topBar}
      />

      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}>
          <Icon size={64} color={iconColor} strokeWidth={1.5} />
        </View>
        <Text style={[styles.roleTag, { color: colors.textMuted }]}>
          {role === 'student' ? 'STUDENT MODE' : 'FACULTY MODE'}
        </Text>
        <Text style={[styles.title, { color: colors.text }]}>{current.title}</Text>
        <Text style={[styles.desc, { color: colors.textMuted }]}>{current.desc}</Text>
      </View>

      {/* Footer Navigation Area */}
      <View style={styles.footer}>
        <View style={styles.dotsRow}>
          <View style={styles.dotsContainer}>
            {steps.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    backgroundColor: i === step ? colors.primary : colors.border,
                    width: i === step ? 32 : 8,
                  },
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.actionRow}>
          {canGoBack ? (
            <Pressable
              style={({ pressed }) => [
                styles.backPill,
                {
                  height: sidePillHeight,
                  borderRadius: sidePillRadius,
                  borderColor: colors.border,
                },
                pressed && styles.pillPressed,
              ]}
              onPress={handlePrev}
              accessibilityRole="button"
              accessibilityLabel="Previous slide"
            >
              <Text style={[styles.backPillText, { color: colors.text, fontSize: sideFontSize }]}>Back</Text>
            </Pressable>
          ) : null}

          {showSkip ? (
            <>
              <Pressable
                style={({ pressed }) => [
                  styles.continuePill,
                  canGoBack ? styles.continuePillThreeUp : styles.continuePillTwoUp,
                  {
                    height: continuePillHeight,
                    borderRadius: continuePillRadius,
                    backgroundColor: colors.primary,
                  },
                  pressed && styles.pillPressed,
                ]}
                onPress={handleNext}
                accessibilityRole="button"
                accessibilityLabel="Continue onboarding"
              >
                <Text style={[styles.continuePillText, { fontSize: continueFontSize }]}>Continue</Text>
                <ArrowRight color="#ffffff" size={16} strokeWidth={3} />
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.skipPill,
                  !canGoBack && styles.skipPillTwoUp,
                  canGoBack && styles.skipPillCompact,
                  {
                    height: sidePillHeight,
                    borderRadius: sidePillRadius,
                    backgroundColor: colors.primary,
                  },
                  pressed && styles.pillPressed,
                ]}
                onPress={handleSkip}
                accessibilityRole="button"
                accessibilityLabel="Skip onboarding"
              >
                <Text style={[styles.skipPillText, { fontSize: sideFontSize }]}>Skip</Text>
              </Pressable>
            </>
          ) : (
            <Pressable
              style={({ pressed }) => [
                styles.continuePill,
                styles.continuePillWide,
                {
                  height: continuePillHeight,
                  borderRadius: continuePillRadius,
                  backgroundColor: colors.primary,
                },
                pressed && styles.pillPressed,
              ]}
              onPress={handleNext}
              accessibilityRole="button"
              accessibilityLabel="Get started"
            >
              <Text style={[styles.continuePillText, { fontSize: continueFontSize }]}>Get Started</Text>
              <ArrowRight color="#ffffff" size={18} strokeWidth={3} />
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 32, paddingBottom: 40 },
  topBar: {
    marginHorizontal: -8,
    marginBottom: 0,
  },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 45, // Fixed: Changed from 70 (circle) to 45 (squircle/rounded rect)
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 3
  },
  title: { fontSize: 28, fontWeight: '900', marginBottom: 16, textAlign: 'center' },
  roleTag: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 8,
    textAlign: 'center',
  },
  desc: { fontSize: 16, textAlign: 'center', lineHeight: 24, opacity: 0.8 },
  footer: { width: '100%' },
  dotsRow: {
    marginBottom: 20,
  },
  dotsContainer: { flexDirection: 'row', justifyContent: 'center' },
  dot: { height: 8, borderRadius: 4, marginHorizontal: 4 },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backPill: {
    width: 68,
    flexGrow: 0,
    flexShrink: 0,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  backPillText: {
    fontFamily: BRAND_SANS_FONT,
    fontWeight: '600',
  },
  skipPill: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  skipPillCompact: {
    width: 68,
    flexGrow: 0,
    flexShrink: 0,
  },
  skipPillText: {
    fontFamily: BRAND_SANS_FONT,
    fontWeight: '700',
    color: '#ffffff',
  },
  continuePill: {
    flex: 1,
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 108,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 12,
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  continuePillThreeUp: {
    flex: 1,
    flexGrow: 1,
  },
  continuePillTwoUp: {
    flex: 1,
    flexGrow: 1,
    minWidth: 0,
  },
  continuePillWide: {
    flex: 1,
    width: '100%',
  },
  skipPillTwoUp: {
    width: 72,
    flexGrow: 0,
    flexShrink: 0,
  },
  continuePillText: {
    fontFamily: BRAND_SANS_FONT,
    fontWeight: '700',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  pillPressed: {
    opacity: 0.88,
  },
});