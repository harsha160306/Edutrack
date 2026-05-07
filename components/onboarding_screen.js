import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { ScanLine, ClipboardList, ShieldCheck, ArrowRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export const OnboardingScreen = ({ colors, onComplete }) => {
  const [step, setStep] = useState(0);
  
  // Define the walkthrough steps for the Discipline Committee App
  const steps = [
    { 
      icon: <ScanLine size={64} color={colors.primary} strokeWidth={1.5} />, 
      title: "Efficient Scanning", 
      desc: "Quickly record latecomers by scanning student ID cards using your device camera." 
    },
    { 
      icon: <ClipboardList size={64} color={colors.secondary} strokeWidth={1.5} />, 
      title: "Real-time Records", 
      desc: "Monitor live attendance statistics and maintain accurate personal duty logs." 
    },
    { 
      icon: <ShieldCheck size={64} color={colors.success} strokeWidth={1.5} />, 
      title: "Committee Insight", 
      desc: "Stay connected with the central committee for global insights and campus security." 
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete(); // Transition to the next state (e.g., login or loading)
    }
  };

  return (
    <View style={styles.container}>
      {/* Visual Content Area */}
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}>
          {steps[step].icon}
        </View>
        <Text style={[styles.title, { color: colors.text }]}>{steps[step].title}</Text>
        <Text style={[styles.desc, { color: colors.textMuted }]}>{steps[step].desc}</Text>
      </View>

      {/* Footer Navigation Area */}
      <View style={styles.footer}>
        {/* Progress Indicators (Dots) */}
        <View style={styles.dotsContainer}>
          {steps.map((_, i) => (
            <View 
              key={i} 
              style={[
                styles.dot, 
                { 
                  backgroundColor: i === step ? colors.primary : colors.border,
                  width: i === step ? 32 : 8 
                }
              ]} 
            />
          ))}
        </View>

        {/* Primary Action Button */}
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>
            {step === steps.length - 1 ? "Get Started" : "Continue"}
          </Text>
          <ArrowRight color="#ffffff" size={20} strokeWidth={3} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 32, paddingBottom: 40 },
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
  desc: { fontSize: 16, textAlign: 'center', lineHeight: 24, opacity: 0.8 },
  footer: { width: '100%' },
  dotsContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 40 },
  dot: { height: 8, borderRadius: 4, marginHorizontal: 4 },
  button: { 
    flexDirection: 'row', 
    paddingVertical: 18, 
    borderRadius: 20, 
    alignItems: 'center', 
    justifyContent: 'center',
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5
  },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold', marginRight: 10, textTransform: 'uppercase', letterSpacing: 0.5 }
});