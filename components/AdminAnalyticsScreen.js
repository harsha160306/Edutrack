import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import {
  BarChart3,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Download,
  Filter,
  Users,
} from 'lucide-react-native';

export const AdminAnalyticsScreen = ({
  isDark = false,
  bottomOffset = 0,
}) => {
  const [timeframe, setTimeframe] = useState('Month'); // 'Today' | 'Week' | 'Month' | 'Semester'

  const textColor = isDark ? '#F8FAFC' : '#0F172A';
  const mutedColor = isDark ? '#94A3B8' : '#64748B';
  const cardBg = isDark ? '#111827' : '#FFFFFF';
  const itemBg = isDark ? '#1F2937' : '#F8FAFC';
  const borderCol = isDark ? '#374151' : '#E2E8F0';

  const yearBreakdown = [
    { year: '1st Year B.Tech', count: 26, percent: 18, color: '#3B82F6' },
    { year: '2nd Year B.Tech', count: 45, percent: 32, color: '#10B981' },
    { year: '3rd Year B.Tech', count: 51, percent: 36, color: '#F59E0B' },
    { year: '4th Year B.Tech', count: 20, percent: 14, color: '#8B5CF6' },
  ];

  const violationCategories = [
    { label: 'Morning Gate Cutoff (> 09:30 AM)', count: 91, percent: 64, color: '#EF4444' },
    { label: 'Lab Uniform / Dress Code', count: 31, percent: 22, color: '#F59E0B' },
    { label: 'Missing RFID ID Card', count: 20, percent: 14, color: '#3B82F6' },
  ];

  const handleExport = () => {
    Alert.alert('Analytics Report Generated', 'Department Disciplinary & Attendance Summary for October 2026 exported to PDF.');
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0B1220' : '#F8FAFC', paddingBottom: bottomOffset }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.screenTitle, { color: textColor }]}>Department Analytics</Text>
            <Text style={[styles.screenSubtitle, { color: mutedColor }]}>
              CSE Discipline, Gate Cutoff & Attendance Metrics
            </Text>
          </View>
          <TouchableOpacity style={[styles.exportBtn, { borderColor: borderCol }]} onPress={handleExport} activeOpacity={0.7}>
            <Download size={14} color="#2563EB" style={{ marginRight: 4 }} />
            <Text style={styles.exportBtnText}>Export</Text>
          </TouchableOpacity>
        </View>

        {/* Timeframe Chips */}
        <View style={styles.timeframeRow}>
          {['Today', 'Week', 'Month', 'Semester'].map((tf) => {
            const isSelected = timeframe === tf;
            return (
              <TouchableOpacity
                key={tf}
                style={[
                  styles.timeframeChip,
                  {
                    backgroundColor: isSelected ? '#2563EB' : cardBg,
                    borderColor: isSelected ? '#2563EB' : borderCol,
                  },
                ]}
                onPress={() => setTimeframe(tf)}
                activeOpacity={0.8}
              >
                <Text style={[styles.timeframeText, { color: isSelected ? '#FFFFFF' : textColor }]}>
                  {tf === 'Today' ? 'Today' : tf === 'Week' ? 'This Week' : tf === 'Month' ? 'This Month' : 'Full Semester'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 4 KPI Grid Cards */}
        <View style={styles.kpiGrid}>
          <View style={[styles.kpiCard, { backgroundColor: cardBg, borderColor: borderCol }]}>
            <View style={[styles.kpiIconBox, { backgroundColor: 'rgba(239, 68, 68, 0.12)' }]}>
              <Clock size={18} color="#EF4444" />
            </View>
            <Text style={[styles.kpiVal, { color: textColor }]}>142</Text>
            <Text style={[styles.kpiTitle, { color: mutedColor }]}>Late Arrivals</Text>
            <View style={styles.trendRow}>
              <TrendingDown size={12} color="#10B981" />
              <Text style={[styles.trendText, { color: '#10B981' }]}>-8.4% vs last mo</Text>
            </View>
          </View>

          <View style={[styles.kpiCard, { backgroundColor: cardBg, borderColor: borderCol }]}>
            <View style={[styles.kpiIconBox, { backgroundColor: 'rgba(245, 158, 11, 0.12)' }]}>
              <AlertTriangle size={18} color="#F59E0B" />
            </View>
            <Text style={[styles.kpiVal, { color: textColor }]}>28</Text>
            <Text style={[styles.kpiTitle, { color: mutedColor }]}>In-Discipline</Text>
            <View style={styles.trendRow}>
              <TrendingDown size={12} color="#10B981" />
              <Text style={[styles.trendText, { color: '#10B981' }]}>-12% vs last mo</Text>
            </View>
          </View>

          <View style={[styles.kpiCard, { backgroundColor: cardBg, borderColor: borderCol }]}>
            <View style={[styles.kpiIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.12)' }]}>
              <Users size={18} color="#3B82F6" />
            </View>
            <Text style={[styles.kpiVal, { color: textColor }]}>9</Text>
            <Text style={[styles.kpiTitle, { color: mutedColor }]}>Repeat Offenders</Text>
            <View style={styles.trendRow}>
              <Text style={[styles.trendText, { color: '#D97706' }]}>Flagged for Parents</Text>
            </View>
          </View>

          <View style={[styles.kpiCard, { backgroundColor: cardBg, borderColor: borderCol }]}>
            <View style={[styles.kpiIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
              <ShieldCheck size={18} color="#10B981" />
            </View>
            <Text style={[styles.kpiVal, { color: '#10B981' }]}>94.2%</Text>
            <Text style={[styles.kpiTitle, { color: mutedColor }]}>Resolution Rate</Text>
            <View style={styles.trendRow}>
              <CheckCircle2 size={12} color="#10B981" />
              <Text style={[styles.trendText, { color: '#10B981' }]}>Resolved by Counselors</Text>
            </View>
          </View>
        </View>

        {/* Year-wise Breakdown Chart Card */}
        <View style={[styles.sectionCard, { backgroundColor: cardBg, borderColor: borderCol }]}>
          <View style={styles.sectionCardHeader}>
            <Text style={[styles.sectionCardTitle, { color: textColor }]}>B.Tech Year-Wise Latecomer Distribution</Text>
            <Text style={[styles.sectionCardSub, { color: mutedColor }]}>Total cases registered across CSE batches</Text>
          </View>

          <View style={styles.barsList}>
            {yearBreakdown.map((item) => (
              <View key={item.year} style={styles.barItem}>
                <View style={styles.barHeader}>
                  <Text style={[styles.barLabel, { color: textColor }]}>{item.year}</Text>
                  <Text style={[styles.barVal, { color: mutedColor }]}>{item.count} cases ({item.percent}%)</Text>
                </View>
                <View style={[styles.barTrack, { backgroundColor: itemBg }]}>
                  <View style={[styles.barFill, { width: `${item.percent}%`, backgroundColor: item.color }]} />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Violation Category Breakdown */}
        <View style={[styles.sectionCard, { backgroundColor: cardBg, borderColor: borderCol, marginTop: 14 }]}>
          <View style={styles.sectionCardHeader}>
            <Text style={[styles.sectionCardTitle, { color: textColor }]}>Violation Type Breakdown</Text>
            <Text style={[styles.sectionCardSub, { color: mutedColor }]}>Most frequent student disciplinary reports</Text>
          </View>

          <View style={styles.barsList}>
            {violationCategories.map((v) => (
              <View key={v.label} style={styles.barItem}>
                <View style={styles.barHeader}>
                  <Text style={[styles.barLabel, { color: textColor }]}>{v.label}</Text>
                  <Text style={[styles.barVal, { color: mutedColor }]}>{v.count} ({v.percent}%)</Text>
                </View>
                <View style={[styles.barTrack, { backgroundColor: itemBg }]}>
                  <View style={[styles.barFill, { width: `${v.percent}%`, backgroundColor: v.color }]} />
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 40,
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  screenSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  exportBtnText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '700',
  },
  timeframeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  timeframeChip: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
  },
  timeframeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  kpiCard: {
    width: '48%',
    flexGrow: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  kpiIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  kpiVal: {
    fontSize: 22,
    fontWeight: '900',
  },
  kpiTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  trendText: {
    fontSize: 10,
    fontWeight: '700',
  },
  sectionCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  sectionCardHeader: {
    marginBottom: 14,
  },
  sectionCardTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  sectionCardSub: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  barsList: {
    gap: 12,
  },
  barItem: {
    gap: 4,
  },
  barHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  barLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  barVal: {
    fontSize: 11,
    fontWeight: '600',
  },
  barTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
});
