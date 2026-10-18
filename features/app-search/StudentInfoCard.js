import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User } from 'lucide-react-native';

const AVATAR_GRADIENT = ['#FDE68A', '#F59E0B', '#EA580C'];

export const StudentInfoCard = ({
  student,
  colors,
  isDark,
  showProfileIcon = true,
  embedded = false,
}) => {
  if (!student) return null;

  return (
    <View
      style={[
        styles.card,
        embedded
          ? styles.cardEmbedded
          : {
              backgroundColor: isDark ? '#0f172a' : colors.cardAlt,
              borderColor: colors.border,
              borderWidth: 1,
            },
      ]}
    >
      <LinearGradient
        colors={AVATAR_GRADIENT}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.avatar}
      >
        <Text style={styles.avatarText}>{student.initials}</Text>
      </LinearGradient>
      <View style={styles.body}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {student.name}
        </Text>
        <Text style={[styles.meta, { color: colors.textMuted }]} numberOfLines={1}>
          {student.rollNo}
          <Text style={styles.metaDot}> · </Text>
          {student.dept}
        </Text>
      </View>
      {showProfileIcon ? (
        <User size={18} color={isDark ? '#64748b' : '#94a3b8'} strokeWidth={2.2} />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 12,
    gap: 12,
    width: '100%',
  },
  cardEmbedded: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  body: { flex: 1, minWidth: 0 },
  name: { fontSize: 14, fontWeight: '700', marginBottom: 3 },
  meta: { fontSize: 12, fontWeight: '500' },
  metaDot: { fontWeight: '700' },
});
