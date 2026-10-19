import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {
  ArrowLeft,
  ChevronRight,
  Award,
  BookOpen,
  CheckCircle2,
  Calendar,
  Layers,
  FileText,
  LayoutList,
  Table as TableIcon,
  ShieldCheck,
  TrendingUp,
  Info,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const STUDENT = {
  name: 'SANDHYA P.',
  regNo: '22H71A05A1',
  dept: 'B.Tech CSE - 3A',
  academicYear: '2025-2026',
  semester: 'Semester 5 (3rd Year)',
  regulation: 'R20 Autonomous',
};

const SGPA_DETAILS = [
  { id: '1', semester: 'SEMESTER-I', semCode: 'SEM-I', sgpa: 8.61, cgpa: 8.61, totalCredits: 20, creditsSecured: 20, status: 'Passed' },
  { id: '2', semester: 'SEMESTER-II', semCode: 'SEM-II', sgpa: 8.78, cgpa: 8.69, totalCredits: 20, creditsSecured: 20, status: 'Passed' },
  { id: '3', semester: 'SEMESTER-III', semCode: 'SEM-III', sgpa: 8.19, cgpa: 8.52, totalCredits: 20, creditsSecured: 20, status: 'Passed' },
  { id: '4', semester: 'SEMESTER-IV', semCode: 'SEM-IV', sgpa: 8.35, cgpa: 8.48, totalCredits: 20, creditsSecured: 20, status: 'Passed' },
  { id: '5', semester: 'SEMESTER-V', semCode: 'SEM-V', sgpa: 8.65, cgpa: 8.51, totalCredits: 20, creditsSecured: 20, status: 'Passed' },
];

const BACKLOG_DETAILS = [
  { semester: 'SEMESTER-I', count: 0, subjects: [{ code: '---', name: '---', result: '' }] },
  { semester: 'SEMESTER-II', count: 0, subjects: [{ code: '---', name: '---', result: '' }] },
  { semester: 'SEMESTER-III', count: 0, subjects: [{ code: '---', name: '---', result: '' }] },
  { semester: 'SEMESTER-IV', count: 0, subjects: [{ code: '---', name: '---', result: '' }] },
  { semester: 'SEMESTER-V', count: 0, subjects: [{ code: '---', name: '---', result: '' }] },
];

const SUBJECT_DETAILS = {
  'SEMESTER-I': [
    { code: '20BS1T01', name: 'Linear Algebra and Differential Equations', cr: 3, gr: 'B', grpts: 8, exammy: 'FEB-23', result: 'PASS' },
    { code: '20BS1T02', name: 'Applied Physics', cr: 3, gr: 'A', grpts: 9, exammy: 'FEB-23', result: 'PASS' },
    { code: '20HS1T01', name: 'Communicative English', cr: 3, gr: 'A', grpts: 9, exammy: 'FEB-23', result: 'PASS' },
    { code: '20CS1T01', name: 'Problem Solving and Python Programming', cr: 3, gr: 'S', grpts: 10, exammy: 'FEB-23', result: 'PASS' },
    { code: '20CS1L01', name: 'Python Programming Laboratory', cr: 1.5, gr: 'S', grpts: 10, exammy: 'FEB-23', result: 'PASS' },
    { code: '20BS1L01', name: 'Applied Physics Laboratory', cr: 1.5, gr: 'S', grpts: 10, exammy: 'FEB-23', result: 'PASS' },
    { code: '20HS1L01', name: 'English Communication Skills Lab', cr: 1.5, gr: 'A', grpts: 9, exammy: 'FEB-23', result: 'PASS' },
  ],
  'SEMESTER-II': [
    { code: '20BS2T01', name: 'Numerical Methods and Vector Calculus', cr: 3, gr: 'B', grpts: 8, exammy: 'JUL-23', result: 'PASS' },
    { code: '20BS2T02', name: 'Engineering Chemistry', cr: 3, gr: 'A', grpts: 9, exammy: 'JUL-23', result: 'PASS' },
    { code: '20ES2T01', name: 'Basic Electrical & Electronics Engineering', cr: 3, gr: 'B', grpts: 8, exammy: 'JUL-23', result: 'PASS' },
    { code: '20CS2T01', name: 'Data Structures using C', cr: 3, gr: 'S', grpts: 10, exammy: 'JUL-23', result: 'PASS' },
    { code: '20CS2L01', name: 'Data Structures Laboratory', cr: 1.5, gr: 'S', grpts: 10, exammy: 'JUL-23', result: 'PASS' },
    { code: '20BS2L01', name: 'Chemistry Laboratory', cr: 1.5, gr: 'A', grpts: 9, exammy: 'JUL-23', result: 'PASS' },
    { code: '20ES2L01', name: 'Basic Electrical & Electronics Lab', cr: 1.5, gr: 'S', grpts: 10, exammy: 'JUL-23', result: 'PASS' },
  ],
  'SEMESTER-III': [
    { code: '20BS3T01', name: 'Discrete Mathematical Structures', cr: 3, gr: 'A', grpts: 9, exammy: 'DEC-23', result: 'PASS' },
    { code: '20CS3T01', name: 'Software Engineering', cr: 3, gr: 'A', grpts: 9, exammy: 'DEC-23', result: 'PASS' },
    { code: '20CS3T02', name: 'Object Oriented Programming through Java', cr: 3, gr: 'S', grpts: 10, exammy: 'DEC-23', result: 'PASS' },
    { code: '20CS3T03', name: 'Computer Organization & Architecture', cr: 3, gr: 'B', grpts: 8, exammy: 'DEC-23', result: 'PASS' },
    { code: '20CS3L01', name: 'Java Programming Laboratory', cr: 1.5, gr: 'S', grpts: 10, exammy: 'DEC-23', result: 'PASS' },
    { code: '20CS3L02', name: 'Software Engineering & UML Lab', cr: 1.5, gr: 'A', grpts: 9, exammy: 'DEC-23', result: 'PASS' },
    { code: '20SC3L01', name: 'Web Application Development Skill Lab', cr: 2, gr: 'S', grpts: 10, exammy: 'DEC-23', result: 'PASS' },
  ],
  'SEMESTER-IV': [
    { code: '20BS4T01', name: 'Probability and Statistics', cr: 3, gr: 'B', grpts: 8, exammy: 'APR-24', result: 'PASS' },
    { code: '20CS4T01', name: 'Operating Systems', cr: 3, gr: 'A', grpts: 9, exammy: 'APR-24', result: 'PASS' },
    { code: '20CS4T02', name: 'Design and Analysis of Algorithms', cr: 3, gr: 'A', grpts: 9, exammy: 'APR-24', result: 'PASS' },
    { code: '20CS4T03', name: 'Formal Languages & Automata Theory', cr: 3, gr: 'B', grpts: 8, exammy: 'APR-24', result: 'PASS' },
    { code: '20CS4L01', name: 'Operating Systems & Linux Lab', cr: 1.5, gr: 'S', grpts: 10, exammy: 'APR-24', result: 'PASS' },
    { code: '20CS4L02', name: 'Algorithms Laboratory', cr: 1.5, gr: 'S', grpts: 10, exammy: 'APR-24', result: 'PASS' },
    { code: '20SC4L01', name: 'Full Stack Development Skill Lab', cr: 2, gr: 'S', grpts: 10, exammy: 'APR-24', result: 'PASS' },
  ],
  'SEMESTER-V': [
    { code: '20CS5T01', name: 'Database Management Systems', cr: 3, gr: 'S', grpts: 10, exammy: 'NOV-24', result: 'PASS' },
    { code: '20CS5T02', name: 'Computer Networks', cr: 3, gr: 'A', grpts: 9, exammy: 'NOV-24', result: 'PASS' },
    { code: '20CS5T03', name: 'Artificial Intelligence & Machine Learning', cr: 3, gr: 'S', grpts: 10, exammy: 'NOV-24', result: 'PASS' },
    { code: '20PE5T01', name: 'Cloud Computing & Virtualization', cr: 3, gr: 'A', grpts: 9, exammy: 'NOV-24', result: 'PASS' },
    { code: '20OE5T01', name: 'Renewable Energy Technologies', cr: 3, gr: 'A', grpts: 9, exammy: 'NOV-24', result: 'PASS' },
    { code: '20CS5L01', name: 'DBMS Laboratory', cr: 1.5, gr: 'S', grpts: 10, exammy: 'NOV-24', result: 'PASS' },
    { code: '20CS5L02', name: 'Computer Networks Laboratory', cr: 1.5, gr: 'S', grpts: 10, exammy: 'NOV-24', result: 'PASS' },
    { code: '20SC5L01', name: 'DevOps & CI/CD Pipelines Lab', cr: 2, gr: 'S', grpts: 10, exammy: 'NOV-24', result: 'PASS' },
  ],
};

export const StudentMarksScreen = ({ colors, isDark, onBack }) => {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [subjectViewMode, setSubjectViewMode] = useState('cards'); // 'cards' | 'table'

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(timer);
  }, []);

  const textColor = isDark ? '#F8FAFC' : '#0F172A';
  const mutedColor = isDark ? '#94A3B8' : '#64748B';
  const cardBg = isDark ? '#1E293B' : '#FFFFFF';
  const borderCol = isDark ? '#334155' : '#E2E8F0';
  const headerBlue = isDark ? '#3B82F6' : '#1D4ED8';
  const tableHeaderBg = isDark ? '#1E3A8A' : '#2563EB';
  const tableHeaderText = '#FFFFFF';
  const zebraBg = isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.015)';

  const isWeb = Platform.OS === 'web';

  const semStats = selectedSemester ? SGPA_DETAILS.find((s) => s.semester === selectedSemester || s.semCode === selectedSemester) : null;

  // Grade color helper
  const getGradeBadge = (grade) => {
    switch (grade) {
      case 'S':
        return { bg: isDark ? '#064E3B' : '#ECFDF5', color: '#059669', label: 'Outstanding (S)' };
      case 'A':
        return { bg: isDark ? '#1E3A8A' : '#EFF6FF', color: '#2563EB', label: 'Excellent (A)' };
      case 'B':
        return { bg: isDark ? '#312E81' : '#EEF2FF', color: '#4F46E5', label: 'Good (B)' };
      case 'C':
        return { bg: isDark ? '#451A03' : '#FFFBEB', color: '#D97706', label: 'Fair (C)' };
      default:
        return { bg: isDark ? '#1E293B' : '#F1F5F9', color: mutedColor, label: grade };
    }
  };

  /* =========================================================================
     VIEW 2: SUBJECT DETAILS SCREEN (Full visibility of all 7 attributes!)
     ========================================================================= */
  const renderSubjectDetails = () => {
    const currentSemKey = selectedSemester || 'SEMESTER-I';
    const subjects = SUBJECT_DETAILS[currentSemKey] || [];

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
            <TouchableOpacity
              onPress={() => setSelectedSemester(null)}
              style={styles.backBtn}
              activeOpacity={0.7}
            >
              <ArrowLeft color={textColor} size={22} />
            </TouchableOpacity>
            <View style={styles.headerTitleWrap}>
              <Text style={[styles.headerTitle, { color: textColor }]}>Subject Details</Text>
              <Text style={[styles.headerSubtitle, { color: mutedColor }]}>
                {currentSemKey} • Complete Academic Records
              </Text>
            </View>
            <View style={{ width: 36 }} />
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
          {/* Semester Selector Pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.semSelectorScroll}
          >
            {SGPA_DETAILS.map((s) => {
              const isSelected = s.semester === currentSemKey || s.semCode === currentSemKey;
              return (
                <TouchableOpacity
                  key={s.id}
                  style={[
                    styles.semSelectorPill,
                    isSelected && styles.semSelectorPillActive,
                    { borderColor: isSelected ? '#2563EB' : borderCol },
                  ]}
                  onPress={() => setSelectedSemester(s.semester)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.semSelectorText,
                      { color: isSelected ? '#FFFFFF' : textColor },
                    ]}
                  >
                    {s.semCode}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

            {/* Semester KPI Summary Banner */}
            <View
              style={[
                styles.semHeroCard,
                { backgroundColor: cardBg, borderColor: borderCol },
              ]}
            >
              <View style={styles.semHeroTopStacked}>
                <Text style={[styles.semHeroTitle, { color: textColor }]}>
                  {currentSemKey} SUBJECT PERFORMANCE
                </Text>
                <Text style={[styles.semHeroMeta, { color: mutedColor }]}>
                  {STUDENT.name} • Reg: {STUDENT.regNo} • {STUDENT.regulation}
                </Text>
                <View style={styles.allClearBadge}>
                  <CheckCircle2 size={12} color="#059669" style={{ marginRight: 4 }} />
                  <Text style={styles.allClearText}>ALL CLEAR</Text>
                </View>
              </View>

              <View style={[styles.semKpiRow, { borderTopColor: borderCol }]}>
                <View style={styles.semKpiCol}>
                  <Text style={[styles.semKpiVal, { color: '#2563EB' }]}>
                    {semStats?.sgpa?.toFixed(2) || '8.61'}
                  </Text>
                  <Text style={[styles.semKpiLabel, { color: mutedColor }]}>Semester SGPA</Text>
                </View>
                <View style={[styles.kpiDivider, { backgroundColor: borderCol }]} />

                <View style={styles.semKpiCol}>
                  <Text style={[styles.semKpiVal, { color: textColor }]}>
                    {semStats?.cgpa?.toFixed(2) || '8.61'}
                  </Text>
                  <Text style={[styles.semKpiLabel, { color: mutedColor }]}>Cumulative CGPA</Text>
                </View>
                <View style={[styles.kpiDivider, { backgroundColor: borderCol }]} />

                <View style={styles.semKpiCol}>
                  <Text style={[styles.semKpiVal, { color: '#059669' }]}>
                    {semStats?.creditsSecured || 20} / {semStats?.totalCredits || 20}
                  </Text>
                  <Text style={[styles.semKpiLabel, { color: mutedColor }]}>Credits Secured</Text>
                </View>
              </View>
            </View>

            {/* Section Heading & View Switcher (Cards vs Table) */}
            <View style={styles.subjectSectionBlock}>
              <Text style={[styles.sectionTitle, { color: '#166534', marginBottom: 6 }]}>
                SEMESTER WISE SUBJECT DETAILS
              </Text>
              <View style={styles.subjectSubHeaderRow}>
                <Text style={[styles.sectionSubtitleText, { color: mutedColor }]}>
                  Showing all {subjects.length} enrolled subjects
                </Text>

                <View style={[styles.viewModeSwitcher, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9', borderColor: borderCol }]}>
                  <TouchableOpacity
                    style={[styles.viewModeBtn, subjectViewMode === 'cards' && styles.viewModeBtnActive]}
                    onPress={() => setSubjectViewMode('cards')}
                    activeOpacity={0.8}
                  >
                    <LayoutList size={13} color={subjectViewMode === 'cards' ? '#FFFFFF' : mutedColor} />
                    <Text style={[styles.viewModeBtnText, { color: subjectViewMode === 'cards' ? '#FFFFFF' : mutedColor }]}>
                      Cards
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.viewModeBtn, subjectViewMode === 'table' && styles.viewModeBtnActive]}
                    onPress={() => setSubjectViewMode('table')}
                    activeOpacity={0.8}
                  >
                    <TableIcon size={13} color={subjectViewMode === 'table' ? '#FFFFFF' : mutedColor} />
                    <Text style={[styles.viewModeBtnText, { color: subjectViewMode === 'table' ? '#FFFFFF' : mutedColor }]}>
                      Table
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

          {/* MODE A: MOBILE-FIRST FULL-DETAIL CARDS (100% details visible with NO cutoff!) */}
          {subjectViewMode === 'cards' && (
            <View style={{ gap: 12 }}>
              {subjects.map((sub, idx) => {
                const gradeInfo = getGradeBadge(sub.gr);
                return (
                  <View
                    key={idx}
                    style={[
                      styles.subjectCard,
                      { backgroundColor: cardBg, borderColor: borderCol },
                    ]}
                  >
                    {/* Top Row: Code, Exam Session, Result Badge */}
                    <View style={styles.subCardTopRow}>
                      <View style={styles.subCodeBadge}>
                        <BookOpen size={12} color="#2563EB" style={{ marginRight: 4 }} />
                        <Text style={styles.subCodeText}>{sub.code}</Text>
                      </View>

                      <View style={styles.subTopRight}>
                        <View style={styles.examBadge}>
                          <Calendar size={11} color={mutedColor} style={{ marginRight: 3 }} />
                          <Text style={[styles.examText, { color: mutedColor }]}>
                            {sub.exammy}
                          </Text>
                        </View>

                        <View style={styles.resultPassBadge}>
                          <Text style={styles.resultPassText}>{sub.result}</Text>
                        </View>
                      </View>
                    </View>

                    {/* Course Full Title */}
                    <Text style={[styles.subCourseTitle, { color: textColor }]}>
                      {sub.name}
                    </Text>

                    {/* Bottom Stats Grid: Credits, Grade, Grade Points */}
                    <View style={[styles.subStatsGrid, { borderTopColor: borderCol, backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)' }]}>
                      <View style={styles.subStatBox}>
                        <Text style={[styles.subStatLabel, { color: mutedColor }]}>CREDITS (CR)</Text>
                        <Text style={[styles.subStatVal, { color: textColor }]}>{sub.cr}</Text>
                      </View>

                      <View style={[styles.subStatDivider, { backgroundColor: borderCol }]} />

                      <View style={styles.subStatBox}>
                        <Text style={[styles.subStatLabel, { color: mutedColor }]}>GRADE (GR)</Text>
                        <View style={[styles.gradePill, { backgroundColor: gradeInfo.bg }]}>
                          <Text style={[styles.gradePillText, { color: gradeInfo.color }]}>
                            {sub.gr}
                          </Text>
                        </View>
                      </View>

                      <View style={[styles.subStatDivider, { backgroundColor: borderCol }]} />

                      <View style={styles.subStatBox}>
                        <Text style={[styles.subStatLabel, { color: mutedColor }]}>GRADE POINTS</Text>
                        <Text style={[styles.subStatVal, { color: '#2563EB' }]}>
                          {sub.grpts} <Text style={{ fontSize: 11, color: mutedColor }}>/ 10</Text>
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* MODE B: COMPLETE SPREADSHEET TABLE VIEW */}
          {subjectViewMode === 'table' && (
            <View>
              {!isWeb && (
                <View style={[styles.scrollHintBanner, { backgroundColor: isDark ? '#1E293B' : '#EFF6FF', borderColor: borderCol }]}>
                  <Info size={14} color="#3B82F6" style={{ marginRight: 6 }} />
                  <Text style={[styles.scrollHintText, { color: textColor }]}>
                    Swipe left/right to view all 7 columns (Credits, Grades, Exam & Results)
                  </Text>
                </View>
              )}

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={true}
                contentContainerStyle={{ flexGrow: 1 }}
              >
                <View style={[styles.tableContainer, { borderColor: borderCol, minWidth: isWeb ? '100%' : 760 }]}>
                  {/* Table Header */}
                  <View style={[styles.tableHeaderRow, { backgroundColor: tableHeaderBg }]}>
                    <Text style={[styles.thCell, { width: 120 }]}>Code</Text>
                    <Text style={[styles.thCell, { width: 280, textAlign: 'left' }]}>Course Name</Text>
                    <Text style={[styles.thCell, { width: 60 }]}>CR</Text>
                    <Text style={[styles.thCell, { width: 60 }]}>GR</Text>
                    <Text style={[styles.thCell, { width: 70 }]}>GRPTS</Text>
                    <Text style={[styles.thCell, { width: 90 }]}>EXAMMY</Text>
                    <Text style={[styles.thCell, { width: 80 }]}>Result</Text>
                  </View>

                  {/* Group Row */}
                  <View style={[styles.tableGroupRow, { backgroundColor: isDark ? '#1E3A8A' : '#EFF6FF' }]}>
                    <Text style={[styles.tdCell, { width: 120 }]}></Text>
                    <Text style={[styles.tdCell, { width: 280, textAlign: 'left', fontWeight: '800', color: textColor }]}>
                      {currentSemKey}
                    </Text>
                    <Text style={[styles.tdCell, { width: 60 }]}></Text>
                    <Text style={[styles.tdCell, { width: 60 }]}></Text>
                    <Text style={[styles.tdCell, { width: 70 }]}></Text>
                    <Text style={[styles.tdCell, { width: 90 }]}></Text>
                    <Text style={[styles.tdCell, { width: 80 }]}></Text>
                  </View>

                  {/* Rows */}
                  {subjects.map((sub, idx) => {
                    const gradeInfo = getGradeBadge(sub.gr);
                    return (
                      <View
                        key={idx}
                        style={[
                          styles.tableDataRow,
                          {
                            backgroundColor: idx % 2 === 1 ? zebraBg : cardBg,
                            borderTopColor: borderCol,
                          },
                        ]}
                      >
                        <Text style={[styles.tdCell, { width: 120, fontWeight: '700', color: textColor }]}>
                          {sub.code}
                        </Text>
                        <Text style={[styles.tdCell, { width: 280, textAlign: 'left', color: textColor }]}>
                          {sub.name}
                        </Text>
                        <Text style={[styles.tdCell, { width: 60, color: textColor }]}>{sub.cr}</Text>
                        <View style={[styles.tdCell, { width: 60, alignItems: 'center' }]}>
                          <View style={[styles.gradePillMini, { backgroundColor: gradeInfo.bg }]}>
                            <Text style={[styles.gradePillTextMini, { color: gradeInfo.color }]}>
                              {sub.gr}
                            </Text>
                          </View>
                        </View>
                        <Text style={[styles.tdCell, { width: 70, fontWeight: '700', color: '#2563EB' }]}>
                          {sub.grpts}
                        </Text>
                        <Text style={[styles.tdCell, { width: 90, color: mutedColor }]}>
                          {sub.exammy}
                        </Text>
                        <View style={[styles.tdCell, { width: 80, alignItems: 'center' }]}>
                          <View style={styles.resultBadgeMini}>
                            <Text style={styles.resultBadgeTextMini}>{sub.result}</Text>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          )}
        </ScrollView>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: isDark ? '#0F172A' : '#FFFFFF', borderBottomColor: borderCol }]}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={onBack} style={styles.backBtn}>
              <ArrowLeft color={textColor} size={22} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: textColor }]}>Academic Performance</Text>
            <View style={{ width: 36 }} />
          </View>
        </View>
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={[styles.loadingText, { color: mutedColor }]}>Loading academic performance...</Text>
        </View>
      </View>
    );
  }

  if (selectedSemester) {
    return renderSubjectDetails();
  }

  /* =========================================================================
     VIEW 1: ACADEMIC PERFORMANCE MAIN DASHBOARD (Images 1 & 2 Upgrade)
     ========================================================================= */
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
            <Text style={[styles.headerTitle, { color: textColor }]}>Academic Performance</Text>
            <Text style={[styles.headerSubtitle, { color: mutedColor }]}>
              Examinations, SGPA, CGPA & Backlogs
            </Text>
          </View>
          <View style={{ width: 36 }} />
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
        {/* Student Profile Card */}
        <View style={[styles.studentCard, { backgroundColor: cardBg, borderColor: borderCol }]}>
          <View style={styles.studentTopRow}>
            <View style={styles.studentAvatar}>
              <Text style={styles.studentAvatarText}>SP</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.studentNameText, { color: textColor }]}>{STUDENT.name}</Text>
              <View style={styles.studentMetaInlineRow}>
                <Text style={[styles.studentMetaText, { color: mutedColor }]}>
                  {STUDENT.regNo} • {STUDENT.dept} • {STUDENT.academicYear}
                </Text>
                <View style={styles.inlineStandingBadge}>
                  <ShieldCheck size={11} color="#059669" style={{ marginRight: 3 }} />
                  <Text style={styles.inlineStandingText}>REGULAR</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Academic Highlights 4-KPI Row */}
          <View style={[styles.kpiRow, { borderTopColor: borderCol }]}>
            <View style={styles.kpiCol}>
              <Text style={[styles.kpiVal, { color: '#2563EB' }]}>8.51</Text>
              <Text style={[styles.kpiLabel, { color: mutedColor }]}>Cumulative CGPA</Text>
            </View>

            <View style={[styles.kpiDivider, { backgroundColor: borderCol }]} />

            <View style={styles.kpiCol}>
              <Text style={[styles.kpiVal, { color: '#059669' }]}>8.65</Text>
              <Text style={[styles.kpiLabel, { color: mutedColor }]}>Current SGPA (Sem 5)</Text>
            </View>

            <View style={[styles.kpiDivider, { backgroundColor: borderCol }]} />

            <View style={styles.kpiCol}>
              <Text style={[styles.kpiVal, { color: textColor }]}>96</Text>
              <Text style={[styles.kpiLabel, { color: mutedColor }]}>Earned Credits</Text>
            </View>

            <View style={[styles.kpiDivider, { backgroundColor: borderCol }]} />

            <View style={styles.kpiCol}>
              <Text style={[styles.kpiVal, { color: '#10B981' }]}>0</Text>
              <Text style={[styles.kpiLabel, { color: mutedColor }]}>Active Backlogs</Text>
            </View>
          </View>
        </View>

        {/* Dual Section Grid (Side-by-side on Web, Stacked on Mobile) */}
        <View style={isWeb ? styles.webDualColRow : undefined}>
          {/* SECTION 1: SGPA & CGPA DETAILS */}
          <View style={isWeb ? styles.webColHalf : undefined}>
            <View style={styles.sectionTitleRow}>
              <Text style={[styles.sectionHeading, { color: headerBlue }]}>
                SGPA & CGPA DETAILS
              </Text>
              <Text style={[styles.sectionCountBadge, { color: mutedColor }]}>
                5 Completed Semesters
              </Text>
            </View>

            <View style={[styles.tableCard, { backgroundColor: cardBg, borderColor: borderCol }]}>
              {/* Table Header */}
              <View style={[styles.tableHeaderRow, { backgroundColor: tableHeaderBg }]}>
                <Text style={[styles.thCell, styles.colSem]}>Semester</Text>
                <Text style={[styles.thCell, styles.colStat]}>SGPA</Text>
                <Text style={[styles.thCell, styles.colStat]}>CGPA</Text>
                <Text style={[styles.thCell, styles.colCredit]}>Total Credits</Text>
                <Text style={[styles.thCell, styles.colSecured]}>Secured</Text>
              </View>

              {/* Rows */}
              {SGPA_DETAILS.map((row, idx) => (
                <View
                  key={row.id}
                  style={[
                    styles.tableDataRow,
                    {
                      backgroundColor: idx % 2 === 1 ? zebraBg : cardBg,
                      borderTopColor: borderCol,
                    },
                  ]}
                >
                  <Text style={[styles.tdCell, styles.colSem, { fontWeight: '700', color: textColor }]}>
                    {row.semCode}
                  </Text>
                  <Text style={[styles.tdCell, styles.colStat, { fontWeight: '700', color: textColor }]}>
                    {row.sgpa.toFixed(2)}
                  </Text>
                  <Text style={[styles.tdCell, styles.colStat, { fontWeight: '700', color: '#2563EB' }]}>
                    {row.cgpa.toFixed(2)}
                  </Text>
                  <Text style={[styles.tdCell, styles.colCredit, { color: textColor }]}>
                    {row.totalCredits}
                  </Text>

                  <View style={[styles.tdCell, styles.colSecured, styles.securedCellWrap]}>
                    <Text style={[styles.securedText, { color: textColor }]}>{row.creditsSecured}</Text>
                    <TouchableOpacity
                      onPress={() => setSelectedSemester(row.semester)}
                      style={styles.detailsBtn}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.detailsBtnText}>Details</Text>
                      <ChevronRight size={12} color="#2563EB" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* SECTION 2: SEMESTER WISE BACKLOGS DETAILS */}
          <View style={isWeb ? styles.webColHalf : { marginTop: 24 }}>
            <View style={styles.sectionTitleRow}>
              <Text style={[styles.sectionHeading, { color: headerBlue }]}>
                SEMESTER WISE BACKLOGS DETAILS
              </Text>
              <View style={styles.cleanRecordPill}>
                <CheckCircle2 size={12} color="#059669" style={{ marginRight: 3 }} />
                <Text style={styles.cleanRecordText}>0 Backlogs</Text>
              </View>
            </View>

            <View style={[styles.tableCard, { backgroundColor: cardBg, borderColor: borderCol }]}>
              {/* Header */}
              <View style={[styles.tableHeaderRow, { backgroundColor: tableHeaderBg }]}>
                <Text style={[styles.thCell, styles.colBacklogCode]}>Code</Text>
                <Text style={[styles.thCell, styles.colBacklogName]}>Course Name</Text>
                <Text style={[styles.thCell, styles.colBacklogResult]}>Result</Text>
              </View>

              {/* Rows grouped by semester */}
              {BACKLOG_DETAILS.map((semBlock, idx) => (
                <React.Fragment key={idx}>
                  {/* Semester Sub-header */}
                  <View style={[styles.backlogSemRow, { backgroundColor: isDark ? '#1E3A8A' : '#EFF6FF', borderTopColor: borderCol }]}>
                    <Text style={[styles.backlogSemText, { color: textColor }]}>
                      {semBlock.semester}
                    </Text>
                    <Text style={[styles.backlogStatusHint, { color: '#059669' }]}>
                      ✓ Cleared in 1st Attempt
                    </Text>
                  </View>

                  {/* Subject Entries */}
                  {semBlock.subjects.map((sub, sidx) => (
                    <View
                      key={sidx}
                      style={[
                        styles.tableDataRow,
                        {
                          backgroundColor: cardBg,
                          borderTopColor: borderCol,
                        },
                      ]}
                    >
                      <Text style={[styles.tdCell, styles.colBacklogCode, { color: '#94A3B8', fontStyle: 'italic' }]}>
                        {sub.code}
                      </Text>
                      <Text style={[styles.tdCell, styles.colBacklogName, { color: '#94A3B8', fontStyle: 'italic' }]}>
                        {sub.name === '---' ? 'No backlogs in this semester' : sub.name}
                      </Text>
                      <View style={[styles.tdCell, styles.colBacklogResult, { alignItems: 'center' }]}>
                        <View style={[styles.clearedBadge, { borderColor: borderCol }]}>
                          <Text style={styles.clearedBadgeText}>NIL</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </React.Fragment>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
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
    fontSize: 11.5,
    marginTop: 2,
  },
  loadingCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
  },
  scrollContent: {
    padding: 16,
  },
  webScrollContent: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },

  /* Student Card */
  studentCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  studentTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  studentAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  studentNameText: {
    fontSize: 17,
    fontWeight: '800',
  },
  studentMetaText: {
    fontSize: 12.5,
  },
  studentMetaInlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 3,
  },
  inlineStandingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  inlineStandingText: {
    color: '#059669',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  standingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  standingText: {
    color: '#059669',
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  /* 4-KPI Row */
  kpiRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 12,
    alignItems: 'center',
  },
  kpiCol: {
    flex: 1,
    alignItems: 'center',
  },
  kpiVal: {
    fontSize: 18,
    fontWeight: '800',
  },
  kpiLabel: {
    fontSize: 10.5,
    fontWeight: '500',
    marginTop: 2,
    textAlign: 'center',
  },
  kpiDivider: {
    width: 1,
    height: 24,
  },

  /* Layout */
  webDualColRow: {
    flexDirection: 'row',
    gap: 24,
  },
  webColHalf: {
    flex: 1,
  },

  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 14.5,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  sectionCountBadge: {
    fontSize: 11.5,
  },
  cleanRecordPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  cleanRecordText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },

  /* Tables */
  tableCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    minHeight: 44,
    alignItems: 'center',
  },
  thCell: {
    paddingHorizontal: 8,
    paddingVertical: 10,
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  tableDataRow: {
    flexDirection: 'row',
    minHeight: 46,
    alignItems: 'center',
    borderTopWidth: 1,
  },
  tdCell: {
    paddingHorizontal: 8,
    paddingVertical: 10,
    fontSize: 12.5,
    textAlign: 'center',
  },

  /* Column widths for SGPA/CGPA Table */
  colSem: { flex: 1.5, textAlign: 'left', paddingLeft: 10 },
  colStat: { flex: 0.95 },
  colCredit: { flex: 1.6 },
  colSecured: { flex: 2.3, paddingRight: 6 },

  securedCellWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  securedText: {
    fontWeight: '700',
    fontSize: 12.5,
    marginRight: 4,
  },

  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 7,
    paddingVertical: 3.5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    gap: 2,
  },
  detailsBtnText: {
    color: '#2563EB',
    fontSize: 11,
    fontWeight: '700',
  },

  /* Column widths for Backlogs Table */
  colBacklogCode: { flex: 1.5, textAlign: 'left', paddingLeft: 12 },
  colBacklogName: { flex: 3.5, textAlign: 'left' },
  colBacklogResult: { flex: 1.2 },

  backlogSemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  backlogSemText: {
    fontSize: 12,
    fontWeight: '800',
  },
  backlogStatusHint: {
    fontSize: 11,
    fontWeight: '600',
  },
  clearedBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  clearedBadgeText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '700',
  },

  /* =========================================
     Subject Details Screen Styles
     ========================================= */
  semSelectorScroll: {
    paddingBottom: 14,
    gap: 8,
  },
  semSelectorPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  semSelectorPillActive: {
    backgroundColor: '#2563EB',
  },
  semSelectorText: {
    fontSize: 12.5,
    fontWeight: '700',
  },

  semHeroCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  semHeroTopStacked: {
    marginBottom: 12,
  },
  allClearBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  allClearText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.5,
  },
  semHeroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  semHeroTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  semHeroMeta: {
    fontSize: 11.5,
    marginTop: 2,
  },
  semPassBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  semPassText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#059669',
  },
  semKpiRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 10,
  },
  semKpiCol: {
    flex: 1,
    alignItems: 'center',
  },
  semKpiVal: {
    fontSize: 17,
    fontWeight: '800',
  },
  semKpiLabel: {
    fontSize: 10.5,
    marginTop: 2,
  },

  subjectSectionBlock: {
    marginBottom: 12,
  },
  subjectSubHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14.5,
    fontWeight: '800',
  },
  sectionSubtitleText: {
    fontSize: 11.5,
  },
  viewModeSwitcher: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    padding: 2,
  },
  viewModeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  viewModeBtnActive: {
    backgroundColor: '#2563EB',
  },
  viewModeBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },

  /* Subject Card Mode (Zero cut-off!) */
  subjectCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  subCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subCodeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  subCodeText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#2563EB',
  },
  subTopRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  examBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  examText: {
    fontSize: 11,
    fontWeight: '500',
  },
  resultPassBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  resultPassText: {
    color: '#059669',
    fontSize: 10.5,
    fontWeight: '800',
  },
  subCourseTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: 12,
  },
  subStatsGrid: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 10,
    paddingBottom: 2,
    borderRadius: 8,
  },
  subStatBox: {
    flex: 1,
    alignItems: 'center',
  },
  subStatLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  subStatVal: {
    fontSize: 14,
    fontWeight: '800',
  },
  subStatDivider: {
    width: 1,
    height: 24,
    alignSelf: 'center',
  },
  gradePill: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 10,
  },
  gradePillText: {
    fontSize: 13,
    fontWeight: '800',
  },

  /* Spreadsheet Table Mode */
  scrollHintBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  scrollHintText: {
    fontSize: 11,
    fontWeight: '500',
  },
  tableContainer: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  tableGroupRow: {
    flexDirection: 'row',
    minHeight: 40,
    alignItems: 'center',
  },
  gradePillMini: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  gradePillTextMini: {
    fontSize: 11,
    fontWeight: '800',
  },
  resultBadgeMini: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  resultBadgeTextMini: {
    color: '#059669',
    fontSize: 10,
    fontWeight: '800',
  },
});
