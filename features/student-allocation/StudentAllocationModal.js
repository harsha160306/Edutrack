import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  Vibration,
} from 'react-native';
import {
  X,
  Users,
  UserCheck,
  GraduationCap,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Search,
  BookOpen,
  ArrowRight,
  Phone,
  RotateCcw,
} from 'lucide-react-native';

const INITIAL_FACULTY_ALLOCATIONS = [
  {
    id: 'fac-1',
    name: 'Dr. K. V. Raman',
    designation: 'Associate Professor & Discipline Convener',
    initials: 'KR',
    department: 'CSE',
    year: '3rd Year',
    section: 'CSE-3A',
    rollRange: '22H71A0501 - 22H71A0525',
    allocatedCount: 25,
    targetCount: 25,
  },
  {
    id: 'fac-2',
    name: 'Dr. Arun Kumar',
    designation: 'Assistant Professor',
    initials: 'AK',
    department: 'CSE',
    year: '2nd Year',
    section: 'CSE-2B',
    rollRange: '23H71A0526 - 23H71A0550',
    allocatedCount: 25,
    targetCount: 25,
  },
  {
    id: 'fac-3',
    name: 'Prof. M. V. Subbarao',
    designation: 'Professor & Exam Controller',
    initials: 'MS',
    department: 'CSE',
    year: '4th Year',
    section: 'CSE-4A',
    rollRange: '21H71A0501 - 21H71A0525',
    allocatedCount: 25,
    targetCount: 25,
  },
  {
    id: 'fac-4',
    name: 'Mrs. S. Lakshmi',
    designation: 'Assistant Professor',
    initials: 'SL',
    department: 'CSE',
    year: '1st Year',
    section: 'CSE-1A',
    rollRange: '24H71A0501 - 24H71A0525',
    allocatedCount: 25,
    targetCount: 25,
  },
  {
    id: 'fac-5',
    name: 'Mr. P. Rajesh',
    designation: 'Assistant Professor & Lab In-charge',
    initials: 'PR',
    department: 'CSE',
    year: '2nd Year',
    section: 'CSE-2A',
    rollRange: '23H71A0501 - 23H71A0525',
    allocatedCount: 0,
    targetCount: 25,
  },
  {
    id: 'fac-6',
    name: 'Dr. A. V. Ramana',
    designation: 'Dean (Research & Development)',
    initials: 'AR',
    department: 'CSE',
    year: '3rd Year',
    section: 'CSE-3B',
    rollRange: '22H71A0526 - 22H71A0550',
    allocatedCount: 0,
    targetCount: 25,
  },
  {
    id: 'fac-7',
    name: 'Dr. R. Narendra',
    designation: 'Associate Professor',
    initials: 'RN',
    department: 'CSE',
    year: '4th Year',
    section: 'CSE-4B',
    rollRange: '21H71A0526 - 21H71A0550',
    allocatedCount: 0,
    targetCount: 25,
  },
  {
    id: 'fac-8',
    name: 'Mrs. K. Bhavani',
    designation: 'Assistant Professor',
    initials: 'KB',
    department: 'CSE',
    year: '1st Year',
    section: 'CSE-1B',
    rollRange: '24H71A0526 - 24H71A0550',
    allocatedCount: 0,
    targetCount: 25,
  },
];

// Generates 25 mock students for a given faculty allocation
const generate25Students = (fac) => {
  const prefix = fac.rollRange.split(' - ')[0].slice(0, 8);
  const startNum = parseInt(fac.rollRange.split(' - ')[0].slice(8), 10) || 1;
  const names = [
    'Aarav Sharma', 'Aditi Verma', 'Akhil Reddy', 'Ananya Patel', 'Bhavya Sri',
    'Chaitanya K.', 'Deepak Rao', 'Divya M.', 'Ganesh P.', 'Harshitha R.',
    'Ishan Joshi', 'Jaya Krishna', 'Karthik S.', 'Keerthi Priya', 'Manoj Kumar',
    'Meghana B.', 'Naveen Teja', 'Pooja Rani', 'Pradeep V.', 'Rahul Dev',
    'Sai Sandeep', 'Sneha Latha', 'Tarun G.', 'Varun Tej', 'Yamini Devi',
  ];

  return Array.from({ length: 25 }, (_, idx) => {
    const numStr = String(startNum + idx).padStart(2, '0');
    return {
      rollNo: `${prefix}${numStr}`,
      name: names[idx % names.length],
      attendance: `${(80 + ((idx * 7) % 19))}%`,
      status: idx % 6 === 0 ? 'Late Warning' : 'Good Standing',
      phone: `+91 98480 ${String(10000 + idx * 37).slice(0, 5)}`,
    };
  });
};

export const StudentAllocationModal = ({
  visible,
  onClose,
  isDark = false,
  colors,
}) => {
  const [allocations, setAllocations] = useState(INITIAL_FACULTY_ALLOCATIONS);
  const [selectedYear, setSelectedYear] = useState('All');
  const [rosterModalFaculty, setRosterModalFaculty] = useState(null);

  const textColor = isDark ? '#F8FAFC' : '#0F172A';
  const mutedColor = isDark ? '#94A3B8' : '#64748B';
  const cardBg = isDark ? '#1E293B' : '#FFFFFF';
  const itemBg = isDark ? '#0F172A' : '#F8FAFC';
  const borderCol = isDark ? '#334155' : '#E2E8F0';

  const yearFilters = ['All', '1st Year', '2nd Year', '3rd Year', '4th Year'];

  const filteredFaculty = allocations.filter((f) => {
    if (selectedYear !== 'All' && f.year !== selectedYear) return false;
    return true;
  });

  const totalAllocated = allocations.reduce((sum, f) => sum + f.allocatedCount, 0);
  const totalTarget = allocations.length * 25;

  const handleAllocate25 = (facultyId) => {
    if (Platform.OS !== 'web') Vibration.vibrate(35);
    setAllocations((prev) =>
      prev.map((f) => (f.id === facultyId ? { ...f, allocatedCount: 25 } : f)),
    );
    const faculty = allocations.find((f) => f.id === facultyId);
    Alert.alert(
      'Allocation Completed',
      `Allocated 25 students of ${faculty?.year} (${faculty?.section}) to ${faculty?.name}. Mentorship roster active.`,
    );
  };

  const handleAutoAllocateAll = () => {
    if (Platform.OS !== 'web') Vibration.vibrate(50);
    setAllocations((prev) => prev.map((f) => ({ ...f, allocatedCount: 25 })));
    Alert.alert(
      'Batch Allocation Complete',
      'All 8 faculty members across 1st to 4th Year B.Tech have been allocated 25 students each (Total: 200 students).',
    );
  };

  const handleResetAllocations = () => {
    setAllocations(INITIAL_FACULTY_ALLOCATIONS);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { backgroundColor: cardBg, borderColor: borderCol }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: borderCol }]}>
            <View style={styles.headerTitleWrap}>
              <View style={styles.iconBadge}>
                <GraduationCap size={20} color="#2563EB" />
              </View>
              <View style={{ marginLeft: 10 }}>
                <Text style={[styles.headerTitle, { color: textColor }]}>Student Mentorship Allocation</Text>
                <Text style={[styles.headerSubtitle, { color: mutedColor }]}>
                  Allocate ≥ 25 students per faculty (1st - 4th Year B.Tech)
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={20} color={mutedColor} />
            </TouchableOpacity>
          </View>

          {/* KPI Summary Banner */}
          <View style={[styles.kpiBanner, { backgroundColor: isDark ? '#0F172A' : '#EFF6FF', borderColor: borderCol }]}>
            <View style={styles.kpiCol}>
              <Text style={[styles.kpiVal, { color: '#2563EB' }]}>{totalAllocated} / {totalTarget}</Text>
              <Text style={[styles.kpiLabel, { color: mutedColor }]}>Students Allocated</Text>
            </View>
            <View style={[styles.kpiDivider, { backgroundColor: borderCol }]} />
            <View style={styles.kpiCol}>
              <Text style={[styles.kpiVal, { color: '#10B981' }]}>25 / Faculty</Text>
              <Text style={[styles.kpiLabel, { color: mutedColor }]}>Quota Standard</Text>
            </View>
            <View style={[styles.kpiDivider, { backgroundColor: borderCol }]} />
            <TouchableOpacity
              style={styles.autoAllocateBtn}
              onPress={handleAutoAllocateAll}
              activeOpacity={0.8}
            >
              <Sparkles size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={styles.autoAllocateText}>Auto-Allocate All</Text>
            </TouchableOpacity>
          </View>

          {/* Year Filter Chips */}
          <View style={styles.yearScrollWrap}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.yearScroll}>
              {yearFilters.map((yr) => {
                const isSelected = selectedYear === yr;
                return (
                  <TouchableOpacity
                    key={yr}
                    style={[
                      styles.yearChip,
                      {
                        backgroundColor: isSelected ? '#2563EB' : itemBg,
                        borderColor: isSelected ? '#2563EB' : borderCol,
                      },
                    ]}
                    onPress={() => setSelectedYear(yr)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.yearChipText, { color: isSelected ? '#FFFFFF' : textColor }]}>
                      {yr}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Faculty List */}
          <ScrollView style={styles.scrollList} showsVerticalScrollIndicator={false}>
            {filteredFaculty.map((fac) => {
              const isAllocated = fac.allocatedCount >= 25;
              const percent = Math.min(100, Math.round((fac.allocatedCount / fac.targetCount) * 100));

              return (
                <View
                  key={fac.id}
                  style={[
                    styles.facultyCard,
                    { backgroundColor: itemBg, borderColor: borderCol },
                    isAllocated && styles.facultyCardDone,
                  ]}
                >
                  <View style={styles.cardTopRow}>
                    <View style={[styles.avatarBox, { backgroundColor: isAllocated ? '#ECFDF5' : '#EFF6FF' }]}>
                      <Text style={[styles.avatarText, { color: isAllocated ? '#059669' : '#2563EB' }]}>
                        {fac.initials}
                      </Text>
                    </View>

                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={[styles.facultyName, { color: textColor }]}>{fac.name}</Text>
                      <Text style={[styles.facultyMeta, { color: mutedColor }]}>
                        {fac.designation} • Dept. of {fac.department}
                      </Text>
                      <View style={styles.badgeRow}>
                        <View style={styles.yearBadge}>
                          <Text style={styles.yearBadgeText}>{fac.year}</Text>
                        </View>
                        <View style={[styles.yearBadge, { backgroundColor: '#F1F5F9' }]}>
                          <Text style={[styles.yearBadgeText, { color: '#475569' }]}>{fac.section}</Text>
                        </View>
                        <Text style={[styles.rollRangeText, { color: mutedColor }]}>{fac.rollRange}</Text>
                      </View>
                    </View>

                    <View style={styles.statusCol}>
                      {isAllocated ? (
                        <View style={styles.doneBadge}>
                          <CheckCircle2 size={13} color="#059669" style={{ marginRight: 3 }} />
                          <Text style={styles.doneBadgeText}>25 / 25</Text>
                        </View>
                      ) : (
                        <View style={styles.pendingBadge}>
                          <AlertCircle size={13} color="#D97706" style={{ marginRight: 3 }} />
                          <Text style={styles.pendingBadgeText}>0 / 25</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Progress Bar */}
                  <View style={styles.progressWrap}>
                    <View style={[styles.progressBarBg, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' }]}>
                      <View
                        style={[
                          styles.progressBarFill,
                          {
                            width: `${percent}%`,
                            backgroundColor: isAllocated ? '#10B981' : '#F59E0B',
                          },
                        ]}
                      />
                    </View>
                  </View>

                  {/* Card Actions */}
                  <View style={[styles.cardFooter, { borderTopColor: borderCol }]}>
                    {isAllocated ? (
                      <TouchableOpacity
                        style={[styles.viewRosterBtn, { borderColor: borderCol }]}
                        onPress={() => setRosterModalFaculty(fac)}
                        activeOpacity={0.7}
                      >
                        <Users size={13} color="#2563EB" style={{ marginRight: 5 }} />
                        <Text style={styles.viewRosterText}>View 25 Mentored Students</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={styles.allocateBtn}
                        onPress={() => handleAllocate25(fac.id)}
                        activeOpacity={0.8}
                      >
                        <UserCheck size={14} color="#FFFFFF" style={{ marginRight: 5 }} />
                        <Text style={styles.allocateBtnText}>Allocate 25 Students ({fac.section})</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Modal Footer */}
          <View style={[styles.modalFooter, { borderTopColor: borderCol }]}>
            <TouchableOpacity style={styles.resetBtn} onPress={handleResetAllocations} activeOpacity={0.7}>
              <RotateCcw size={14} color={mutedColor} style={{ marginRight: 5 }} />
              <Text style={[styles.resetText, { color: mutedColor }]}>Reset Defaults</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.doneBtn} onPress={onClose} activeOpacity={0.85}>
              <Text style={styles.doneText}>Done & Save Allocations</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Sub-modal: View 25 Mentored Students */}
      {rosterModalFaculty && (
        <Modal
          visible={Boolean(rosterModalFaculty)}
          transparent
          animationType="fade"
          onRequestClose={() => setRosterModalFaculty(null)}
        >
          <View style={styles.overlay}>
            <View style={[styles.rosterCard, { backgroundColor: cardBg, borderColor: borderCol }]}>
              <View style={[styles.rosterHeader, { borderBottomColor: borderCol }]}>
                <View>
                  <Text style={[styles.rosterTitle, { color: textColor }]}>
                    25 Students Allocated to {rosterModalFaculty.name}
                  </Text>
                  <Text style={[styles.rosterSub, { color: mutedColor }]}>
                    {rosterModalFaculty.year} • {rosterModalFaculty.section} ({rosterModalFaculty.rollRange})
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setRosterModalFaculty(null)} style={styles.closeBtn}>
                  <X size={20} color={mutedColor} />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
                {generate25Students(rosterModalFaculty).map((st, idx) => (
                  <View
                    key={st.rollNo}
                    style={[
                      styles.studentRow,
                      { borderBottomColor: borderCol },
                      idx % 2 === 0 && { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.015)' },
                    ]}
                  >
                    <View style={styles.studentIndexBadge}>
                      <Text style={styles.studentIndexText}>#{idx + 1}</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <Text style={[styles.studentName, { color: textColor }]}>{st.name}</Text>
                      <Text style={[styles.studentRoll, { color: '#2563EB' }]}>{st.rollNo}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={[styles.studentAtt, { color: '#10B981' }]}>{st.attendance}</Text>
                      <Text style={[styles.studentStatus, { color: mutedColor }]}>{st.status}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>

              <View style={[styles.rosterFooter, { borderTopColor: borderCol }]}>
                <TouchableOpacity
                  style={styles.closeRosterBtn}
                  onPress={() => setRosterModalFaculty(null)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.closeRosterText}>Close Roster</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '92%',
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
      },
      android: {
        elevation: 10,
      },
      web: {
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  closeBtn: {
    padding: 4,
  },
  kpiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 6,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  kpiCol: {
    alignItems: 'center',
    flex: 1,
  },
  kpiVal: {
    fontSize: 14,
    fontWeight: '800',
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
  },
  kpiDivider: {
    width: 1,
    height: 24,
  },
  autoAllocateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
  },
  autoAllocateText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  yearScrollWrap: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  yearScroll: {
    gap: 6,
  },
  yearChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  yearChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  scrollList: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  facultyCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  facultyCardDone: {
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '800',
  },
  facultyName: {
    fontSize: 14,
    fontWeight: '700',
  },
  facultyMeta: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  yearBadge: {
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  yearBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#2563EB',
  },
  rollRangeText: {
    fontSize: 10.5,
    fontWeight: '500',
  },
  statusCol: {
    alignItems: 'flex-end',
  },
  doneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  doneBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pendingBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706',
  },
  progressWrap: {
    marginTop: 10,
  },
  progressBarBg: {
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    marginTop: 10,
    paddingTop: 8,
  },
  viewRosterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
  },
  viewRosterText: {
    color: '#2563EB',
    fontSize: 11,
    fontWeight: '700',
  },
  allocateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  allocateBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderTopWidth: 1,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
  },
  resetText: {
    fontSize: 12,
    fontWeight: '600',
  },
  doneBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  doneText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  rosterCard: {
    width: '100%',
    maxWidth: 480,
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  rosterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
  },
  rosterTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  rosterSub: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderBottomWidth: 1,
  },
  studentIndexBadge: {
    width: 26,
    alignItems: 'center',
  },
  studentIndexText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  studentName: {
    fontSize: 13,
    fontWeight: '700',
  },
  studentRoll: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  studentAtt: {
    fontSize: 12,
    fontWeight: '800',
  },
  studentStatus: {
    fontSize: 10,
    fontWeight: '500',
  },
  rosterFooter: {
    padding: 12,
    borderTopWidth: 1,
    alignItems: 'flex-end',
  },
  closeRosterBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  closeRosterText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
