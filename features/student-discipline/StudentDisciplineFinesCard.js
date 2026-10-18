import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

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

export function StudentDisciplineFinesCard({ colors, fines, loading, error }) {
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.text }]}>Discipline fines</Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>
        Latecomer and dress code fines with wave-off status
      </Text>

      {loading ? (
        <ActivityIndicator color={colors.secondary} style={styles.loader} />
      ) : error ? (
        <Text style={[styles.empty, { color: colors.textMuted }]}>{error}</Text>
      ) : fines.length === 0 ? (
        <Text style={[styles.empty, { color: colors.textMuted }]}>No fines on your record.</Text>
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
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 4,
  },
  loader: {
    marginVertical: 12,
  },
  empty: {
    fontSize: 13,
    marginTop: 8,
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
