import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import {
  ArrowLeft,
  Clock,
  ShieldAlert,
  Search,
  CheckCircle,
  AlertTriangle,
  MapPin,
  UserCheck,
  Calendar,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Info,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const STUDENT = {
  name: 'SANDHYA P.',
  regNo: '22H71A05A1',
  dept: 'B.Tech CSE - 3A',
  academicYear: '2025-2026',
  semester: 'Semester 5',
};

const DISCIPLINARY_RECORDS = [
  {
    id: 'rec-001',
    type: 'latecomer', // 'latecomer' | 'indiscipline'
    title: 'Late Campus Entry (Morning Cutoff)',
    date: '03 Oct 2026',
    time: '09:42 AM',
    semester: 'Semester 5',
    reportedBy: 'Dr. R. Sharma',
    committee: 'Discipline Committee Member',
    location: 'Main Gate #1',
    severity: 'Warning',
    status: 'Recorded',
    chanceNumber: 2,
    chanceStatus: 'warning',
    chanceBadgeLabel: 'Chance 2 of 3 • 2nd Warning',
    penaltyStatus: 'Zero Fine (Within 3-Chance Grace Allowance)',
    description:
      'Arrived 12 minutes after the scheduled morning cutoff gate closure (09:30 AM). Biometric verification completed at Gate #1.',
    actionTaken:
      '2nd Morning Entry Warning logged under 3-Chance Policy. Zero fine applicable. Student counseled on gate timings.',
  },
  {
    id: 'rec-002',
    type: 'indiscipline',
    title: 'Missing Physical Identity Card',
    date: '24 Sep 2026',
    time: '11:15 AM',
    semester: 'Semester 5',
    reportedBy: 'Prof. S. Rao',
    committee: 'Campus Vigilance Squad',
    location: 'Central Library Entrance',
    severity: 'Warning',
    status: 'Resolved',
    chanceNumber: 1,
    chanceStatus: 'warning',
    chanceBadgeLabel: 'Chance 1 of 3 • 1st Warning',
    penaltyStatus: 'Zero Fine (Within 3-Chance Grace Allowance)',
    description:
      'Student was not wearing physical institutional ID tag during campus corridor random check. Digital ID on phone was verified.',
    actionTaken:
      '1st Warning issued under 3-Chance Policy. Advised to always wear institutional lanyard. Zero fine applicable.',
  },
  {
    id: 'rec-003',
    type: 'latecomer',
    title: 'Post-Lunch Session Delay',
    date: '11 Sep 2026',
    time: '01:52 PM',
    semester: 'Semester 5',
    reportedBy: 'Mr. P. V. Ramana',
    committee: 'Floor In-charge',
    location: 'CSE Block 3rd Floor',
    severity: 'Excused',
    status: 'Excused',
    chanceNumber: null,
    chanceStatus: 'excused',
    chanceBadgeLabel: 'Excused • 0 Chances Deducted',
    penaltyStatus: 'Zero Fine (Approved by HOD Consent)',
    description:
      'Reported 7 minutes late for Database Systems practical lab session due to technical seminar wrap-up.',
    actionTaken:
      'Subject faculty verified seminar participation. Excused with HOD consent. Grace chances fully preserved.',
  },
];

export const StudentRecordScreen = ({ colors, isDark, onBack }) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'latecomer' | 'indiscipline'
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const textColor = isDark ? '#F8FAFC' : '#0F172A';
  const mutedColor = isDark ? '#94A3B8' : '#64748B';
  const cardBg = isDark ? '#1E293B' : '#FFFFFF';
  const borderCol = isDark ? '#334155' : '#E2E8F0';
  const isWeb = Platform.OS === 'web';

  const filteredRecords = DISCIPLINARY_RECORDS.filter((rec) => {
    if (activeTab === 'latecomer' && rec.type !== 'latecomer') return false;
    if (activeTab === 'indiscipline' && rec.type !== 'indiscipline') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        rec.title.toLowerCase().includes(q) ||
        rec.reportedBy.toLowerCase().includes(q) ||
        rec.description.toLowerCase().includes(q) ||
        rec.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalChancesAllowed = 3;
  const lateCount = DISCIPLINARY_RECORDS.filter((r) => r.type === 'latecomer').length;
  const indisciplineCount = DISCIPLINARY_RECORDS.filter((r) => r.type === 'indiscipline').length;
  const usedChances = DISCIPLINARY_RECORDS.filter((r) => r.chanceStatus === 'warning').length;
  const remainingChances = Math.max(0, totalChancesAllowed - usedChances);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 8,
            backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
            borderBottomColor: borderCol,
          },
        ]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
            <ArrowLeft color={textColor} size={22} />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <Text style={[styles.headerTitle, { color: textColor }]}>My Record</Text>
            <Text style={[styles.headerSubtitle, { color: mutedColor }]}>
              In-Discipline & Latecomer Logs • 3-Chance Policy
            </Text>
          </View>
          <View style={{ width: 36 }} />
        </View>

        {/* Student Tag */}
        <View style={[styles.studentPill, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
          <Text style={[styles.studentName, { color: textColor }]}>{STUDENT.name}</Text>
          <Text style={[styles.studentMeta, { color: mutedColor }]}>
            {STUDENT.regNo} • {STUDENT.dept} • {STUDENT.semester}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          isWeb && styles.webScrollContent,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Metric KPI Cards (Removed monetary fines, integrated 3-Chance Rule) */}
        <View style={styles.kpiGrid}>
          <View
            style={[
              styles.kpiCard,
              { backgroundColor: isDark ? '#1E293B' : '#FFF7ED', borderColor: '#FDBA74' },
            ]}
          >
            <View style={styles.kpiHeader}>
              <Clock size={18} color="#EA580C" />
              <Text style={[styles.kpiCount, { color: '#EA580C' }]}>{lateCount}</Text>
            </View>
            <Text style={[styles.kpiLabel, { color: textColor }]}>Late Entries</Text>
            <Text style={[styles.kpiSub, { color: mutedColor }]}>This Semester</Text>
          </View>

          <View
            style={[
              styles.kpiCard,
              { backgroundColor: isDark ? '#1E293B' : '#FEF2F2', borderColor: '#FCA5A5' },
            ]}
          >
            <View style={styles.kpiHeader}>
              <ShieldAlert size={18} color="#DC2626" />
              <Text style={[styles.kpiCount, { color: '#DC2626' }]}>{indisciplineCount}</Text>
            </View>
            <Text style={[styles.kpiLabel, { color: textColor }]}>In-Discipline</Text>
            <Text style={[styles.kpiSub, { color: mutedColor }]}>Reported Incidents</Text>
          </View>

          <View
            style={[
              styles.kpiCard,
              { backgroundColor: isDark ? '#064E3B20' : '#ECFDF5', borderColor: '#6EE7B7' },
            ]}
          >
            <View style={styles.kpiHeader}>
              <ShieldCheck size={18} color="#059669" />
              <Text style={[styles.kpiCount, { color: '#059669' }]}>
                {usedChances}/{totalChancesAllowed}
              </Text>
            </View>
            <Text style={[styles.kpiLabel, { color: textColor }]}>Grace Chances</Text>
            <Text style={[styles.kpiSub, { color: '#059669', fontWeight: '700' }]}>
              {remainingChances} Warning Left (Safe)
            </Text>
          </View>
        </View>

        {/* Institutional 3-Chance Grace Policy Banner */}
        <View
          style={[
            styles.policyCard,
            { backgroundColor: isDark ? '#1E293B' : '#F0FDF4', borderColor: isDark ? '#334155' : '#BBF7D0' },
          ]}
        >
          <View style={styles.policyTopRow}>
            <View style={styles.policyIconBadge}>
              <ShieldCheck size={16} color="#059669" />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={[styles.policyTitle, { color: textColor }]}>
                3-Chance Disciplinary Policy
              </Text>
              <Text style={[styles.policySubtitle, { color: mutedColor }]}>
                Institutional Academic Standing • Semester 5
              </Text>
            </View>
            <View style={styles.policySafeTag}>
              <Text style={styles.policySafeTagText}>GRACE ACTIVE</Text>
            </View>
          </View>

          <Text style={[styles.policyDesc, { color: mutedColor }]}>
            Under university regulations, students receive up to <Text style={{ fontWeight: '700', color: textColor }}>3 official warnings</Text> per semester across late arrivals and in-discipline activities before any disciplinary fines are levied. You have used <Text style={{ fontWeight: '700', color: textColor }}>{usedChances} of {totalChancesAllowed}</Text> chances.
          </Text>

          <View style={styles.chancePillsRow}>
            <View style={[styles.chancePill, styles.chancePillUsed]}>
              <Text style={styles.chancePillTextUsed}>● Chance 1: Used (ID Check)</Text>
            </View>
            <View style={[styles.chancePill, styles.chancePillUsed]}>
              <Text style={styles.chancePillTextUsed}>● Chance 2: Used (Late Entry)</Text>
            </View>
            <View style={[styles.chancePill, styles.chancePillAvailable]}>
              <Text style={styles.chancePillTextAvailable}>✓ Chance 3: Available (Safe)</Text>
            </View>
          </View>
        </View>

        {/* Filter Switcher Tabs */}
        <View style={[styles.filterBar, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
          <TouchableOpacity
            style={[styles.filterTab, activeTab === 'all' && styles.filterTabActive]}
            onPress={() => setActiveTab('all')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterTabText,
                { color: activeTab === 'all' ? '#FFFFFF' : mutedColor },
              ]}
            >
              ALL ({DISCIPLINARY_RECORDS.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, activeTab === 'latecomer' && styles.filterTabActiveOrange]}
            onPress={() => setActiveTab('latecomer')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterTabText,
                { color: activeTab === 'latecomer' ? '#FFFFFF' : mutedColor },
              ]}
            >
              LATE-COMER ({lateCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, activeTab === 'indiscipline' && styles.filterTabActiveRed]}
            onPress={() => setActiveTab('indiscipline')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterTabText,
                { color: activeTab === 'indiscipline' ? '#FFFFFF' : mutedColor },
              ]}
            >
              IN-DISCIPLINE ({indisciplineCount})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View
          style={[
            styles.searchBox,
            { backgroundColor: cardBg, borderColor: borderCol },
          ]}
        >
          <Search size={18} color={mutedColor} style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder="Search by faculty, title, location..."
            placeholderTextColor={mutedColor}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Section Heading */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Recorded Entries ({filteredRecords.length})
          </Text>
          <Text style={[styles.sectionHint, { color: mutedColor }]}>
            Tap entry to view remarks
          </Text>
        </View>

        {/* Records List */}
        {filteredRecords.length === 0 ? (
          <View style={[styles.emptyBox, { backgroundColor: cardBg, borderColor: borderCol }]}>
            <CheckCircle size={44} color="#10B981" style={{ marginBottom: 12 }} />
            <Text style={[styles.emptyTitle, { color: textColor }]}>No Records Found</Text>
            <Text style={[styles.emptySub, { color: mutedColor }]}>
              {searchQuery
                ? 'No matches found for your search query.'
                : 'Great job! You have a clean disciplinary record for this category.'}
            </Text>
          </View>
        ) : (
          filteredRecords.map((rec) => {
            const isExpanded = expandedId === rec.id;
            const isLate = rec.type === 'latecomer';
            const badgeBg = isLate ? (isDark ? '#431407' : '#FFEDD5') : (isDark ? '#450A0A' : '#FEE2E2');
            const badgeColor = isLate ? '#EA580C' : '#DC2626';

            return (
              <TouchableOpacity
                key={rec.id}
                style={[
                  styles.recordCard,
                  { backgroundColor: cardBg, borderColor: borderCol },
                ]}
                onPress={() => setExpandedId(isExpanded ? null : rec.id)}
                activeOpacity={0.88}
              >
                <View style={styles.cardTopRow}>
                  <View style={[styles.typeBadge, { backgroundColor: badgeBg }]}>
                    {isLate ? (
                      <Clock size={13} color={badgeColor} style={{ marginRight: 5 }} />
                    ) : (
                      <ShieldAlert size={13} color={badgeColor} style={{ marginRight: 5 }} />
                    )}
                    <Text style={[styles.typeBadgeText, { color: badgeColor }]}>
                      {isLate ? 'LATECOMER' : 'IN-DISCIPLINE'}
                    </Text>
                  </View>

                  <View style={styles.dateBadge}>
                    <Calendar size={13} color={mutedColor} style={{ marginRight: 4 }} />
                    <Text style={[styles.dateText, { color: mutedColor }]}>{rec.date}</Text>
                    <Text style={[styles.timeText, { color: textColor }]}> • {rec.time}</Text>
                  </View>
                </View>

                <Text style={[styles.cardTitle, { color: textColor }]}>{rec.title}</Text>

                <View style={styles.reportedRow}>
                  <UserCheck size={14} color={mutedColor} style={{ marginRight: 6 }} />
                  <Text style={[styles.reportedText, { color: mutedColor }]}>
                    Reported by{' '}
                    <Text style={{ color: textColor, fontWeight: '600' }}>{rec.reportedBy}</Text>
                    {' '}({rec.committee})
                  </Text>
                </View>

                <View style={styles.locationRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 }}>
                    <MapPin size={13} color={mutedColor} style={{ marginRight: 5 }} />
                    <Text style={[styles.locationText, { color: mutedColor }]}>{rec.location}</Text>
                  </View>

                  {/* 3-Chance Grace Badge (Replaced monetary fines) */}
                  <View
                    style={[
                      styles.chanceBadge,
                      rec.chanceStatus === 'excused' ? styles.chanceBadgeExcused : styles.chanceBadgeWarning,
                    ]}
                  >
                    {rec.chanceStatus === 'excused' ? (
                      <CheckCircle size={11} color="#059669" style={{ marginRight: 4 }} />
                    ) : (
                      <AlertTriangle size={11} color="#EA580C" style={{ marginRight: 4 }} />
                    )}
                    <Text
                      style={[
                        styles.chanceBadgeText,
                        { color: rec.chanceStatus === 'excused' ? '#059669' : '#EA580C' },
                      ]}
                    >
                      {rec.chanceBadgeLabel}
                    </Text>
                  </View>
                </View>

                {/* Expanded Details */}
                {isExpanded ? (
                  <View
                    style={[
                      styles.expandedArea,
                      { borderTopColor: borderCol, backgroundColor: isDark ? '#0F172A' : '#F8FAFC' },
                    ]}
                  >
                    <Text style={[styles.descTitle, { color: textColor }]}>Description & Notes:</Text>
                    <Text style={[styles.descBody, { color: mutedColor }]}>{rec.description}</Text>

                    <Text style={[styles.descTitle, { color: textColor, marginTop: 8 }]}>
                      Action Taken:
                    </Text>
                    <Text style={[styles.descBody, { color: '#2563EB', fontWeight: '500' }]}>
                      {rec.actionTaken}
                    </Text>

                    <Text style={[styles.descTitle, { color: textColor, marginTop: 8 }]}>
                      Disciplinary Fine Status:
                    </Text>
                    <View style={styles.fineStatusRow}>
                      <ShieldCheck size={14} color="#059669" style={{ marginRight: 5 }} />
                      <Text style={[styles.descBody, { color: '#059669', fontWeight: '700' }]}>
                        {rec.penaltyStatus}
                      </Text>
                    </View>
                  </View>
                ) : null}

                <View style={styles.cardFooter}>
                  <Text style={[styles.expandHint, { color: '#3B82F6' }]}>
                    {isExpanded ? 'Hide notes' : 'Tap for incident remarks'}
                  </Text>
                  {isExpanded ? (
                    <ChevronUp size={16} color="#3B82F6" />
                  ) : (
                    <ChevronDown size={16} color="#3B82F6" />
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backBtn: {
    padding: 6,
    borderRadius: 8,
  },
  headerTitleWrap: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  studentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  studentName: {
    fontSize: 13,
    fontWeight: '700',
  },
  studentMeta: {
    fontSize: 12,
  },
  scrollContent: {
    padding: 16,
  },
  webScrollContent: {
    maxWidth: 860,
    width: '100%',
    alignSelf: 'center',
  },
  kpiGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  kpiCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  kpiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  kpiCount: {
    fontSize: 20,
    fontWeight: '800',
  },
  kpiLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  kpiSub: {
    fontSize: 10,
    marginTop: 2,
  },

  /* 3-Chance Policy Banner */
  policyCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  policyTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  policyIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  policyTitle: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  policySubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  policySafeTag: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  policySafeTagText: {
    color: '#059669',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  policyDesc: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 10,
  },
  chancePillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chancePill: {
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
    borderWidth: 1,
  },
  chancePillUsed: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FED7AA',
  },
  chancePillTextUsed: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#EA580C',
  },
  chancePillAvailable: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  chancePillTextAvailable: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#059669',
  },

  filterBar: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 4,
    marginBottom: 14,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  filterTabActive: {
    backgroundColor: '#3B82F6',
  },
  filterTabActiveOrange: {
    backgroundColor: '#EA580C',
  },
  filterTabActiveRed: {
    backgroundColor: '#DC2626',
  },
  filterTabText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14.5,
    fontWeight: '700',
  },
  sectionHint: {
    fontSize: 11.5,
  },
  recordCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
  },
  timeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  reportedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  reportedText: {
    fontSize: 12.5,
    flex: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
  },

  /* Chance Status Badges (Replaced monetary fines) */
  chanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
    borderWidth: 1,
  },
  chanceBadgeWarning: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FED7AA',
  },
  chanceBadgeExcused: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  chanceBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },

  expandedArea: {
    borderTopWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginTop: 6,
    marginBottom: 4,
  },
  descTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  descBody: {
    fontSize: 12.5,
    lineHeight: 18,
  },
  fineStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingTop: 6,
  },
  expandHint: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  emptyBox: {
    alignItems: 'center',
    padding: 36,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
