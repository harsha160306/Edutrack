import React, { useState, useEffect } from 'react';
import { StatusBar, useColorScheme, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// Corrected relative paths for root level file
import { SplashScreen, LoadingScreen } from './components/splash_screen';
import { OnboardingScreen } from './components/onboarding_screen';
import { LoginScreen } from './components/auth_screens';
import { DashboardScreen } from './components/dashboard_screen';

export default function App() {
  const [appState, setAppState] = useState('splash'); // 'splash', 'onboarding', 'login', 'loading', 'dashboard', 'scanning'
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Initializing system...');
  
  const systemTheme = useColorScheme();
  const isDark = systemTheme === 'dark';

  const colors = {
    background: isDark ? '#0f172a' : '#f1f5f9',
    card: isDark ? '#1e293b' : '#ffffff',
    cardAlt: isDark ? '#0f172a' : '#f8fafc',
    text: isDark ? '#f1f5f9' : '#0f172a',
    textMuted: isDark ? '#94a3b8' : '#64748b',
    border: isDark ? '#1e293b' : '#e2e8f0',
    primary: '#f59e0b',   
    secondary: '#3b82f6', 
    success: '#10b981',   
  };

  useEffect(() => {
    if (appState === 'splash') {
      const timer = setTimeout(() => setAppState('onboarding'), 2500);
      return () => clearTimeout(timer);
    }

    if (appState === 'loading') {
      const phases = [
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
          setTimeout(() => setAppState('dashboard'), 500);
        }
      }, 700);
      return () => clearInterval(interval);
    }
  }, [appState]);

  return (
    <SafeAreaProvider>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar 
          barStyle={isDark ? 'light-content' : 'dark-content'} 
          backgroundColor="transparent" 
          translucent 
        />
        
        {appState === 'splash' && <SplashScreen colors={colors} theme={systemTheme} />}
        
        {appState === 'onboarding' && (
          <SafeAreaView style={{ flex: 1 }}>
            <OnboardingScreen colors={colors} onComplete={() => setAppState('login')} />
          </SafeAreaView>
        )}
        
        {appState === 'login' && (
          <SafeAreaView style={{ flex: 1 }}>
            <LoginScreen colors={colors} onLogin={() => setAppState('loading')} />
          </SafeAreaView>
        )}
        
        {appState === 'loading' && (
          <LoadingScreen progress={progress} loadingText={loadingText} colors={colors} theme={systemTheme} />
        )}
        
        {appState === 'dashboard' && (
          <DashboardScreen 
            colors={colors} 
            isDark={isDark} 
            onScan={() => setAppState('scanning')} // Updated to trigger state change
          />
        )}

        {/* Added scanning state handler */}
        {appState === 'scanning' && (
          <View style={{ flex: 1, backgroundColor: '#000' }}>
            {/* We will build the ScanningScreen component next */}
            <DashboardScreen colors={colors} isDark={isDark} onScan={() => setAppState('dashboard')} />
          </View>
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }
});