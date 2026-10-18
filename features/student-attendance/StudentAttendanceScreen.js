import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ChevronLeft, ChevronRight, AlertTriangle, CheckCircle, ArrowLeft, LayoutGrid } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

const STUDENT = {
  name: 'SANDHYA P.',
  regNo: '22H71A05A1',
  dept: 'B.Tech CSE',
  semester: 'Semester 5',
};

const ATTENDANCE_DATA = {
  overall: 86.36,
  totalClasses: 120,
  present: 103,
  minimumRequired: 75,
};

const SUBJECTS = [
  { id: '1', code: 'CS501', name: 'Python Programming', percent: 90, total: 30, present: 27 },
  { id: '2', code: 'CS502', name: 'Database Management Systems', percent: 72, total: 25, present: 18 },
  { id: '3', code: 'CS503', name: 'Computer Networks', percent: 88, total: 34, present: 30 },
  { id: '4', code: 'CS504', name: 'Software Engineering', percent: 93, total: 31, present: 28 },
];

const MONTHS = ['July 2026', 'August 2026', 'September 2026'];
const MONTHLY_DATA = {
  'September 2026': { working: 22, present: 19, percent: 86.36 },
  'August 2026': { working: 24, present: 20, percent: 83.33 },
  'July 2026': { working: 18, present: 16, percent: 88.88 },
};

const CircularProgress = ({ percent, size = 100, strokeWidth = 10, color = '#3B82F6', trackColor = '#E2E8F0' }) => {
  const radius = (size - strokeWidth) / 2;
  const circum = radius * 2 * Math.PI;
  const dashoffset = circum - (percent / 100) * circum;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Circle stroke={trackColor} fill="none" cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth} />
        <Circle
          stroke={color}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circum}
          strokeDashoffset={dashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFillObject, { position: 'absolute', alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ fontSize: size * 0.22, fontWeight: '700', color: '#1E293B' }}>{percent}%</Text>
      </View>
    </View>
  );
};

export const StudentAttendanceScreen = ({ colors, isDark, onBack }) => {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [empty, setEmpty] = useState(false);
  const [monthIndex, setMonthIndex] = useState(2); // September

  useEffect(() => {
    // Simulate fetching data
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
      // setEmpty(true) or setError(true) for testing
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const textColor = isDark ? '#F8FAFC' : '#0F172A';
  const mutedColor = isDark ? '#94A3B8' : '#64748B';
  const cardBg = isDark ? '#1E293B' : '#FFFFFF';
  const borderCol = isDark ? '#334155' : '#E2E8F0';
  const accent = '#3B82F6';
  
  const currentMonthData = MONTHLY_DATA[MONTHS[monthIndex]];

  const renderHeader = () => (
    <View style={[styles.header, { paddingTop: insets.top, backgroundColor: isDark ? '#0F172A' : '#FFFFFF', borderBottomColor: borderCol }]}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <ArrowLeft color={textColor} size={24} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Attendance</Text>
        <View style={{ width: 24 }} />
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {renderHeader()}
        <View style={styles.centerWrap}>
          <ActivityIndicator size="large" color={accent} />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {renderHeader()}
        <View style={styles.centerWrap}>
          <AlertTriangle size={48} color="#EF4444" strokeWidth={1.5} style={{ marginBottom: 16 }} />
          <Text style={[styles.emptyTitle, { color: textColor }]}>Unable to Load Data</Text>
          <Text style={[styles.emptyDesc, { color: mutedColor }]}>Please try again later.</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => { setLoading(true); setError(false); setTimeout(() => setLoading(false), 800); }}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (empty) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {renderHeader()}
        <View style={styles.centerWrap}>
          <LayoutGrid size={48} color={mutedColor} strokeWidth={1.5} style={{ marginBottom: 16 }} />
          <Text style={[styles.emptyTitle, { color: textColor }]}>No Attendance Records</Text>
          <Text style={[styles.emptyDesc, { color: mutedColor }]}>Attendance records have not been published for the selected period.</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => { setLoading(true); setEmpty(false); setTimeout(() => setLoading(false), 800); }}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const alertSubject = SUBJECTS.find(s => s.percent < ATTENDANCE_DATA.minimumRequired);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {renderHeader()}
      
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}>
        
        {/* Student Info */}
        <View style={styles.studentInfo}>
          <Text style={[styles.studentName, { color: textColor }]}>{STUDENT.name}</Text>
          <Text style={[styles.studentDetails, { color: mutedColor }]}>
            {STUDENT.regNo} • {STUDENT.dept} • {STUDENT.semester}
          </Text>
        </View>

        {/* Overall Attendance Card */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor: borderCol }]}>
          <Text style={[styles.cardTitle, { color: textColor }]}>Overall Attendance</Text>
          <View style={styles.overallRow}>
            <CircularProgress 
              percent={ATTENDANCE_DATA.overall} 
              size={110} 
              color={ATTENDANCE_DATA.overall >= ATTENDANCE_DATA.minimumRequired ? '#10B981' : '#EF4444'} 
              trackColor={isDark ? '#334155' : '#E2E8F0'}
            />
            <View style={styles.overallStats}>
              <View style={styles.statBox}>
                <Text style={[styles.statLabel, { color: mutedColor }]}>Total Classes</Text>
                <Text style={[styles.statValue, { color: textColor }]}>{ATTENDANCE_DATA.totalClasses}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statLabel, { color: mutedColor }]}>Present</Text>
                <Text style={[styles.statValue, { color: textColor }]}>{ATTENDANCE_DATA.present}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statLabel, { color: mutedColor }]}>Minimum Req</Text>
                <Text style={[styles.statValue, { color: textColor }]}>{ATTENDANCE_DATA.minimumRequired}%</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Alerts */}
        {alertSubject ? (
          <View style={[styles.alertCard, { backgroundColor: isDark ? 'rgba(239,68,68,0.1)' : '#FEF2F2', borderColor: '#FECACA' }]}>
            <View style={styles.alertHeader}>
              <AlertTriangle color="#EF4444" size={20} />
              <Text style={styles.alertTitle}>Attendance Alert</Text>
            </View>
            <Text style={[styles.alertText, { color: isDark ? '#FCA5A5' : '#991B1B' }]}>
              Your {alertSubject.name} attendance is {alertSubject.percent}%. Minimum required is {ATTENDANCE_DATA.minimumRequired}%. Please monitor your attendance.
            </Text>
          </View>
        ) : (
          <View style={[styles.alertCard, { backgroundColor: isDark ? 'rgba(16,185,129,0.1)' : '#ECFDF5', borderColor: '#A7F3D0' }]}>
            <View style={styles.alertHeader}>
              <CheckCircle color="#10B981" size={20} />
              <Text style={[styles.alertTitle, { color: '#065F46' }]}>Attendance Good</Text>
            </View>
            <Text style={[styles.alertText, { color: isDark ? '#6EE7B7' : '#065F46' }]}>
              Your current attendance is {ATTENDANCE_DATA.overall}%. Keep it up!
            </Text>
          </View>
        )}

        {/* Monthly Attendance */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor: borderCol }]}>
          <View style={styles.monthSelector}>
            <TouchableOpacity 
              onPress={() => setMonthIndex(Math.max(0, monthIndex - 1))}
              disabled={monthIndex === 0}
              style={styles.monthBtn}
            >
              <ChevronLeft color={monthIndex === 0 ? mutedColor : textColor} size={20} />
            </TouchableOpacity>
            <Text style={[styles.monthText, { color: textColor }]}>{MONTHS[monthIndex]}</Text>
            <TouchableOpacity 
              onPress={() => setMonthIndex(Math.min(MONTHS.length - 1, monthIndex + 1))}
              disabled={monthIndex === MONTHS.length - 1}
              style={styles.monthBtn}
            >
              <ChevronRight color={monthIndex === MONTHS.length - 1 ? mutedColor : textColor} size={20} />
            </TouchableOpacity>
          </View>
          <View style={styles.monthlyStatsRow}>
            <View style={styles.monthStat}>
              <Text style={[styles.monthStatVal, { color: textColor }]}>{currentMonthData.working}</Text>
              <Text style={[styles.monthStatLabel, { color: mutedColor }]}>Working</Text>
            </View>
            <View style={styles.monthStat}>
              <Text style={[styles.monthStatVal, { color: textColor }]}>{currentMonthData.present}</Text>
              <Text style={[styles.monthStatLabel, { color: mutedColor }]}>Present</Text>
            </View>
            <View style={styles.monthStat}>
              <Text style={[styles.monthStatVal, { color: '#3B82F6' }]}>{currentMonthData.percent}%</Text>
              <Text style={[styles.monthStatLabel, { color: mutedColor }]}>Attendance</Text>
            </View>
          </View>
        </View>

        {/* Subject Wise */}
        <Text style={[styles.sectionTitle, { color: textColor, marginTop: 12 }]}>Subject-wise Attendance</Text>
        
        {SUBJECTS.map((sub) => (
          <View key={sub.id} style={[styles.subjectCard, { backgroundColor: cardBg, borderColor: borderCol }]}>
            <View style={styles.subCardTop}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.subCode, { color: mutedColor }]}>{sub.code}</Text>
                <Text style={[styles.subName, { color: textColor }]}>{sub.name}</Text>
              </View>
              <View style={[styles.subPercentBadge, { backgroundColor: sub.percent >= 75 ? '#ECFDF5' : '#FEF2F2' }]}>
                <Text style={[styles.subPercentText, { color: sub.percent >= 75 ? '#059669' : '#DC2626' }]}>{sub.percent}%</Text>
              </View>
            </View>
            <View style={[styles.subCardMiddle, { borderTopColor: borderCol, borderBottomColor: borderCol }]}>
              <View style={styles.subStat}>
                <Text style={[styles.subStatVal, { color: textColor }]}>{sub.total}</Text>
                <Text style={[styles.subStatLabel, { color: mutedColor }]}>Classes</Text>
              </View>
              <View style={styles.subStatDivider} />
              <View style={styles.subStat}>
                <Text style={[styles.subStatVal, { color: textColor }]}>{sub.present}</Text>
                <Text style={[styles.subStatLabel, { color: mutedColor }]}>Present</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.subCardBottom}>
              <Text style={[styles.viewDetailsText, { color: '#3B82F6' }]}>View Details</Text>
              <ChevronRight color="#3B82F6" size={16} />
            </TouchableOpacity>
          </View>
        ))}

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  loadingCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  centerWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptyDesc: { fontSize: 14, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  retryBtn: { backgroundColor: '#3B82F6', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  retryBtnText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  scrollContent: { padding: 16 },
  
  studentInfo: { marginBottom: 20, alignItems: 'center' },
  studentName: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  studentDetails: { fontSize: 14, fontWeight: '500' },
  
  card: { borderRadius: 16, padding: 16, borderWidth: 1, marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 16 },
  overallRow: { flexDirection: 'row', alignItems: 'center' },
  overallStats: { flex: 1, marginLeft: 20 },
  statBox: { marginBottom: 12 },
  statLabel: { fontSize: 12, marginBottom: 2, fontWeight: '500' },
  statValue: { fontSize: 16, fontWeight: '600' },
  
  alertCard: { borderRadius: 12, padding: 16, borderWidth: 1, marginBottom: 16 },
  alertHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  alertTitle: { fontSize: 15, fontWeight: '700', marginLeft: 8, color: '#991B1B' },
  alertText: { fontSize: 14, lineHeight: 20, fontWeight: '500' },
  
  monthSelector: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  monthBtn: { padding: 8 },
  monthText: { fontSize: 16, fontWeight: '600' },
  monthlyStatsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  monthStat: { alignItems: 'center' },
  monthStatVal: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  monthStatLabel: { fontSize: 12, fontWeight: '500' },
  
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  
  subjectCard: { borderRadius: 16, borderWidth: 1, marginBottom: 12, overflow: 'hidden' },
  subCardTop: { flexDirection: 'row', padding: 16, alignItems: 'flex-start' },
  subCode: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  subName: { fontSize: 15, fontWeight: '600', paddingRight: 16 },
  subPercentBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  subPercentText: { fontSize: 13, fontWeight: '700' },
  
  subCardMiddle: { flexDirection: 'row', borderTopWidth: 1, borderBottomWidth: 1, paddingVertical: 12, backgroundColor: 'rgba(0,0,0,0.02)' },
  subStat: { flex: 1, alignItems: 'center' },
  subStatDivider: { width: 1, backgroundColor: '#E2E8F0' },
  subStatVal: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  subStatLabel: { fontSize: 12 },
  
  subCardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12 },
  viewDetailsText: { fontSize: 14, fontWeight: '600', marginRight: 4 },
});
