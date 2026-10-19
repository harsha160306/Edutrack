import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { ShieldCheck, CheckCircle2 } from 'lucide-react-native';

function formatMoney(value) {
  const amount = Number(value);
  if (Number.isNaN(amount)) return value;
  return `₹${amount.toFixed(2)}`;
}

function statusLabel(status) {
  switch (status) {
    case 'issued':
      return 'Issued';
    case 'appeal_pending':
      return 'Appeal pending';
    case 'partial_waived':
      return 'Partially waived';
    case 'full_waived':
      return 'Fully waived';
    case 'payment_due':
      return 'Payment due';
    default:
      return status;
  }
}

export function StudentDisciplineFinesCard({ colors, fines = [], loading, error }) {
  const isDark = colors.card === '#1E293B' || colors.background === '#0F172A';

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.cardHeaderRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.text }]}>Discipline fines</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Latecomer and dress code fines with wave-off status
          </Text>
        </View>

        <View style={[styles.gracePill, { backgroundColor: isDark ? '#064E3B' : '#ECFDF5', borderColor: '#A7F3D0' }]}>
          <ShieldCheck size={12} color="#059669" style={{ marginRight: 4 }} />
          <Text style={styles.gracePillText}>3-Chance Policy</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.secondary} style={styles.loader} />
      ) : error ? (
        <Text style={[styles.empty, { color: colors.textMuted }]}>{error}</Text>
      ) : fines.length === 0 ? (
        <View style={styles.cleanRecordBox}>
          <Text style={[styles.empty, { color: colors.text }]}>No fines on your record.</Text>
          <Text style={[styles.policyHint, { color: colors.textMuted }]}>
            All late-comer and in-discipline activities are covered under your 3-chance institutional warning quota. Zero monetary penalties due.
          </Text>
          <View style={styles.safeStatusRow}>
            <CheckCircle2 size={13} color="#059669" style={{ marginRight: 5 }} />
            <Text style={styles.safeStatusText}>Grace Period Active • Safe Standing</Text>
          </View>
        </View>
      ) : (
        fines.slice(0, 4).map((fine) => (
          <View key={fine.id} style={[styles.row, { borderTopColor: colors.border }]}>
            <View style={styles.rowMain}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>
                {fine.source_type === 'dress_code' ? 'Dress code' : 'Latecomer'}
              </Text>
              <Text style={[styles.rowMeta, { color: colors.textMuted }]}>
                {statusLabel(fine.status)}
                {fine.latest_appeal?.decided_wave_off_pct
                  ? ` · ${fine.latest_appeal.decided_wave_off_pct}% waived`
                  : ''}
              </Text>
            </View>
            <Text style={[styles.amount, { color: colors.text }]}>
              {formatMoney(fine.payable_amount)}
            </Text>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: 4,
  },
  gracePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
    borderWidth: 1,
  },
  gracePillText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.3,
  },
  cleanRecordBox: {
    marginTop: 4,
    gap: 4,
  },
  loader: {
    marginVertical: 12,
  },
  empty: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  policyHint: {
    fontSize: 12,
    lineHeight: 17,
  },
  safeStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  safeStatusText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#059669',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 10,
    marginTop: 10,
  },
  rowMain: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  rowMeta: {
    fontSize: 12,
  },
  amount: {
    fontSize: 14,
    fontWeight: '700',
  },
});
