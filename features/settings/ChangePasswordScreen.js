import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { useNetworkStatus } from '../network-status';
import { isNetworkAvailable } from '../../security/networkGate';
import { changeAccountPassword } from '../../security/accountPassword';

export const ChangePasswordScreen = ({ colors, isDark, accountId, onBack, onComplete }) => {
  const { status: networkStatus } = useNetworkStatus();
  const [step, setStep] = useState('confirm');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const online = isNetworkAvailable(networkStatus);
  const ui = useMemo(
    () => ({
      cardBg: isDark ? '#151a24' : colors.card,
      border: isDark ? '#232a37' : colors.border,
      inputBg: isDark ? '#0f172a' : '#f8fafc',
      muted: colors.textMuted,
    }),
    [colors, isDark],
  );

  const handleConfirmStart = () => {
    if (!online) {
      Alert.alert('Internet required', 'Needed internet connection.');
      return;
    }
    setStep('form');
  };

  const handleSubmit = async () => {
    if (!online) {
      Alert.alert('Internet required', 'Needed internet connection.');
      return;
    }
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert('Missing fields', 'Enter old, new, and confirm password.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Weak password', 'New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Mismatch', 'New password and confirm password do not match.');
      return;
    }
    setSubmitting(true);
    try {
      const result = await changeAccountPassword(accountId, oldPassword, newPassword);
      if (!result.ok) {
        Alert.alert('Invalid old password', 'Old password is incorrect.');
        return;
      }
      Alert.alert('Password changed', 'Your password has been updated.', [
        { text: 'OK', onPress: () => onComplete?.() },
      ]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={12}>
          <ChevronLeft color={colors.text} size={26} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Change Password</Text>
        <View style={styles.backBtn} />
      </View>

      <View style={[styles.card, { backgroundColor: ui.cardBg, borderColor: ui.border }]}>
        {step === 'confirm' ? (
          <>
            <Text style={[styles.title, { color: colors.text }]}>Do you wish to change password?</Text>
            <Text style={[styles.subtitle, { color: ui.muted }]}>
              We will verify old password before applying changes.
            </Text>
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.secondary }]} onPress={handleConfirmStart}>
              <Text style={styles.primaryText}>Yes, Continue</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={[styles.label, { color: ui.muted }]}>Old password</Text>
            <TextInput
              value={oldPassword}
              onChangeText={setOldPassword}
              secureTextEntry
              style={[styles.input, { color: colors.text, backgroundColor: ui.inputBg, borderColor: ui.border }]}
              placeholder="Enter old password"
              placeholderTextColor={ui.muted}
            />
            <Text style={[styles.label, { color: ui.muted }]}>New password</Text>
            <TextInput
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              style={[styles.input, { color: colors.text, backgroundColor: ui.inputBg, borderColor: ui.border }]}
              placeholder="Enter new password"
              placeholderTextColor={ui.muted}
            />
            <Text style={[styles.label, { color: ui.muted }]}>Confirm password</Text>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              style={[styles.input, { color: colors.text, backgroundColor: ui.inputBg, borderColor: ui.border }]}
              placeholder="Confirm new password"
              placeholderTextColor={ui.muted}
            />

            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: colors.secondary, opacity: submitting ? 0.7 : 1 }]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>Change Password</Text>}
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
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
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 22, fontWeight: '700' },
  card: {
    marginHorizontal: 16,
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
  },
  title: { fontSize: 18, fontWeight: '700' },
  subtitle: { fontSize: 13, fontWeight: '500', marginTop: 6, marginBottom: 14 },
  label: { fontSize: 12, fontWeight: '700', marginBottom: 6, marginTop: 10 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
    fontWeight: '600',
  },
  primaryBtn: {
    marginTop: 16,
    borderRadius: 12,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
