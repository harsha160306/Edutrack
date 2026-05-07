import React from 'react';
import { View, Text, StyleSheet, Platform, Dimensions } from 'react-native'; 
import { ShieldCheck } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export const AnimatedLogo = ({ scale = 1, theme = 'light' }) => (
  <View style={[styles.logoContainer, { transform: [{ scale }] }]}>
    <View style={[
      styles.logoShield, 
      { backgroundColor: theme === 'dark' ? '#1e293b' : '#000000', 
        borderColor: theme === 'dark' ? '#334155' : '#000000' }
    ]}>
      <ShieldCheck color="#ffffff" size={44} strokeWidth={2} />
    </View>
  </View>
);

export const SplashScreen = ({ colors, theme }) => (
  <View style={styles.centerLayout}>
    <View style={styles.logoWrapper}>
      <View style={[styles.glow, { backgroundColor: colors.primary, opacity: theme === 'dark' ? 0.2 : 0.1 }]} />
      <AnimatedLogo scale={1.1} theme={theme} />
    </View>
    <View style={styles.textGroup}>
      <Text style={[styles.collegeName, { color: colors.textMuted }]}>
        DVR & DR. HS MIC COLLEGE
      </Text>
      <View style={{ marginTop: 12 }}>
        <Text style={[styles.mainTitle, { color: colors.text }]}>
          Discipline <Text style={{ color: colors.primary }}>Committee</Text>
        </Text>
        <Text style={[styles.subTitle, { color: colors.textMuted }]}>Faculty App</Text>
      </View>
    </View>
  </View>
);

export const LoadingScreen = ({ progress, loadingText, colors, theme }) => (
  <View style={[styles.centerLayout, { backgroundColor: '#0f172a' }]}>
    <View style={{ marginBottom: 60 }}>
      <AnimatedLogo scale={0.9} theme="dark" />
    </View>
    
    <View style={styles.textGroup}>
      <Text style={[styles.collegeName, { color: '#64748b' }]}>DVR & DR. HS MIC COLLEGE</Text>
      <Text style={[styles.mainTitle, { color: '#ffffff', fontSize: 24 }]}>
        Discipline <Text style={{ color: colors.primary }}>Committee</Text>
      </Text>
    </View>

    <View style={styles.loadingWrapper}>
      <View style={styles.loadingHeader}>
        <Text style={[styles.loadingStatus, { color: '#64748b' }]}>{loadingText}</Text>
        <Text style={[styles.percentage, { color: colors.primary }]}>{progress}%</Text>
      </View>
      <View style={[styles.progressBarBg, { backgroundColor: '#1e293b' }]}>
        <View style={[styles.progressBarFill, { width: `${progress}%`, backgroundColor: colors.primary }]} />
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  centerLayout: { flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%' },
  logoWrapper: { marginBottom: 30, alignItems: 'center', justifyContent: 'center' },
  glow: { position: 'absolute', width: 120, height: 120, borderRadius: 60, blurRadius: 50 },
  logoContainer: { alignItems: 'center', justifyContent: 'center' },
  logoShield: {
    width: 84, height: 84, borderRadius: 28,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  textGroup: { alignItems: 'center', paddingHorizontal: 20 },
  collegeName: { 
    fontSize: 12, fontWeight: '900', letterSpacing: 1.5, textTransform: 'uppercase',
    fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
    textAlign: 'center'
  },
  mainTitle: { fontSize: 30, fontWeight: '900', letterSpacing: -0.5, textAlign: 'center', marginTop: 4 },
  subTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginTop: 2, opacity: 0.8 },
  loadingWrapper: { width: '80%', maxWidth: 300, marginTop: 50 },
  loadingHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, alignItems: 'flex-end' },
  loadingStatus: { fontSize: 11, fontWeight: 'bold', letterSpacing: 0.5, textTransform: 'uppercase' },
  percentage: { fontSize: 14, fontWeight: '900' },
  progressBarBg: { height: 6, borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  progressBarFill: { height: '100%', borderRadius: 10 },
});