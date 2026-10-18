import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { ArrowLeft, ChevronRight, LayoutGrid, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const STUDENT = {
  name: 'SANDHYA P.',
  regNo: '22H71A05A1',
  dept: 'B.Tech CSE',
  academicYear: '2025-2026',
};

const SGPA_DETAILS = [
  { id: '1', semester: 'SEMESTER-I', sgpa: 8.61, cgpa: 8.61, totalCredits: 20, creditsSecured: 20 },
  { id: '2', semester: 'SEMESTER-II', sgpa: 8.78, cgpa: 8.69, totalCredits: 20, creditsSecured: 20 },
  { id: '3', semester: 'SEMESTER-III', sgpa: 8.19, cgpa: 8.52, totalCredits: 20, creditsSecured: 20 },
  { id: '4', semester: 'SEMESTER-IV', sgpa: 8.35, cgpa: 8.48, totalCredits: 20, creditsSecured: 20 },
  { id: '5', semester: 'SEMESTER-V', sgpa: 8.65, cgpa: 8.51, totalCredits: 20, creditsSecured: 20 },
];

const BACKLOG_DETAILS = [
  { semester: 'SEMESTER-I', subjects: [{ code: '---', name: '---', result: '' }] },
  { semester: 'SEMESTER-II', subjects: [{ code: '---', name: '---', result: '' }] },
  { semester: 'SEMESTER-III', subjects: [{ code: '---', name: '---', result: '' }] },
];

const SUBJECT_DETAILS = {
  'SEMESTER-I': [
    { code: '20BS1T01', name: 'LINEAR ALGEBRA AND DIFFERENTIAL EQUATIONS', cr: 3, gr: 'B', grpts: 8, exammy: 'FEB-23', result: 'P' },
    { code: '20BS1T02', name: 'APPLIED PHYSICS', cr: 3, gr: 'A', grpts: 9, exammy: 'FEB-23', result: 'P' },
    { code: '20HS1T01', name: 'ENGLISH', cr: 3, gr: 'A', grpts: 9, exammy: 'FEB-23', result: 'P' },
    { code: '20CS1T01', name: 'PROBLEM SOLVING USING C', cr: 3, gr: 'B', grpts: 8, exammy: 'FEB-23', result: 'P' },
    { code: '20CS1L01', name: 'C PROGRAMMING LAB', cr: 1.5, gr: 'S', grpts: 10, exammy: 'FEB-23', result: 'P' },
  ],
  'SEMESTER-II': [
    { code: '20BS2T01', name: 'NUMERICAL METHODS AND VECTOR CALCULUS', cr: 3, gr: 'B', grpts: 8, exammy: 'JUL-23', result: 'P' },
    { code: '20CS2T01', name: 'DATA STRUCTURES', cr: 3, gr: 'A', grpts: 9, exammy: 'JUL-23', result: 'P' },
  ],
  'SEMESTER-III': [
    { code: '20CS3T01', name: 'SOFTWARE ENGINEERING', cr: 3, gr: 'A', grpts: 9, exammy: 'DEC-23', result: 'P' },
    { code: '20CS3T02', name: 'OBJECT ORIENTED PROGRAMMING', cr: 3, gr: 'S', grpts: 10, exammy: 'DEC-23', result: 'P' },
  ],
  'SEMESTER-IV': [
    { code: '20CS4T01', name: 'OPERATING SYSTEMS', cr: 3, gr: 'A', grpts: 9, exammy: 'APR-24', result: 'P' },
  ],
  'SEMESTER-V': [
    { code: '20CS5T01', name: 'DATABASE MANAGEMENT SYSTEMS', cr: 3, gr: 'S', grpts: 10, exammy: 'NOV-24', result: 'P' },
  ]
};

export const StudentMarksScreen = ({ colors, isDark, onBack }) => {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const textColor = isDark ? '#F8FAFC' : '#0F172A';
  const mutedColor = isDark ? '#94A3B8' : '#64748B';
  const cardBg = isDark ? '#1E293B' : '#FFFFFF';
  const borderCol = isDark ? '#334155' : '#E2E8F0';
  const headerBlue = '#2563EB';
  const headerBg = isDark ? '#1E3A8A' : '#EFF6FF';
  const tableHeaderBg = isDark ? '#3B82F6' : '#3B82F6';
  const tableHeaderText = '#FFFFFF';
  const tableBorder = isDark ? '#334155' : '#CBD5E1';

  const isWeb = Platform.OS === 'web';

  const renderSubjectDetails = () => {
    const subjects = SUBJECT_DETAILS[selectedSemester] || [];
    
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: insets.top, backgroundColor: isDark ? '#0F172A' : '#FFFFFF', borderBottomColor: borderCol }]}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => setSelectedSemester(null)} style={styles.backBtn}>
              <ArrowLeft color={textColor} size={24} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: textColor }]}>Subject Details</Text>
            <View style={{ width: 24 }} />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={[styles.sectionTitle, { color: '#166534', marginBottom: 16 }]}>SEMESTER WISE SUBJECT DETAILS</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={[styles.table, { borderColor: tableBorder, minWidth: isWeb ? '100%' : 700 }]}>
              {/* Header Row */}
              <View style={[styles.tableRow, { backgroundColor: tableHeaderBg }]}>
                <Text style={[styles.tableHeaderCell, styles.cellCode, { color: tableHeaderText }]}>Code</Text>
                <Text style={[styles.tableHeaderCell, styles.cellName, { color: tableHeaderText }]}>Course Name</Text>
                <Text style={[styles.tableHeaderCell, styles.cellSmall, { color: tableHeaderText }]}>CR</Text>
                <Text style={[styles.tableHeaderCell, styles.cellSmall, { color: tableHeaderText }]}>GR</Text>
                <Text style={[styles.tableHeaderCell, styles.cellSmall, { color: tableHeaderText }]}>GRPTS</Text>
                <Text style={[styles.tableHeaderCell, styles.cellDate, { color: tableHeaderText }]}>EXAMMY</Text>
                <Text style={[styles.tableHeaderCell, styles.cellSmall, { color: tableHeaderText }]}>Result</Text>
              </View>
              
              {/* Group Row */}
              <View style={[styles.tableRow, { backgroundColor: headerBg }]}>
                <Text style={[styles.tableCell, styles.cellCode]}></Text>
                <Text style={[styles.tableCell, styles.cellName, { color: textColor, fontWeight: '700' }]}>{selectedSemester}</Text>
                <Text style={[styles.tableCell, styles.cellSmall]}></Text>
                <Text style={[styles.tableCell, styles.cellSmall]}></Text>
                <Text style={[styles.tableCell, styles.cellSmall]}></Text>
                <Text style={[styles.tableCell, styles.cellDate]}></Text>
                <Text style={[styles.tableCell, styles.cellSmall]}></Text>
              </View>

              {/* Subjects */}
              {subjects.map((sub, idx) => (
                <View key={idx} style={[styles.tableRow, { backgroundColor: cardBg, borderTopColor: tableBorder, borderTopWidth: 1 }]}>
                  <Text style={[styles.tableCell, styles.cellCode, { color: textColor }]}>{sub.code}</Text>
                  <Text style={[styles.tableCell, styles.cellName, { color: textColor }]}>{sub.name}</Text>
                  <Text style={[styles.tableCell, styles.cellSmall, { color: textColor }]}>{sub.cr}</Text>
                  <Text style={[styles.tableCell, styles.cellSmall, { color: textColor }]}>{sub.gr}</Text>
                  <Text style={[styles.tableCell, styles.cellSmall, { color: textColor }]}>{sub.grpts}</Text>
                  <Text style={[styles.tableCell, styles.cellDate, { color: textColor }]}>{sub.exammy}</Text>
                  <Text style={[styles.tableCell, styles.cellSmall, { color: textColor }]}>{sub.result}</Text>
                </View>
              ))}
              {subjects.length === 0 && (
                <View style={[styles.tableRow, { backgroundColor: cardBg, borderTopColor: tableBorder, borderTopWidth: 1, padding: 16 }]}>
                  <Text style={{ color: mutedColor, flex: 1, textAlign: 'center' }}>No subjects found for this semester.</Text>
                </View>
              )}
            </View>
          </ScrollView>
        </ScrollView>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: insets.top, backgroundColor: isDark ? '#0F172A' : '#FFFFFF', borderBottomColor: borderCol }]}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={onBack} style={styles.backBtn}><ArrowLeft color={textColor} size={24} /></TouchableOpacity>
            <Text style={[styles.headerTitle, { color: textColor }]}>Academic Performance</Text>
            <View style={{ width: 24 }} />
          </View>
        </View>
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      </View>
    );
  }

  if (selectedSemester) {
    return renderSubjectDetails();
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top, backgroundColor: isDark ? '#0F172A' : '#FFFFFF', borderBottomColor: borderCol }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <ArrowLeft color={textColor} size={24} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>Academic Performance</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>
      
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}>
        
        <View style={styles.studentInfo}>
          <Text style={[styles.studentName, { color: textColor }]}>{STUDENT.name}</Text>
          <Text style={[styles.studentDetails, { color: mutedColor }]}>
            {STUDENT.regNo} • {STUDENT.dept} • {STUDENT.academicYear}
          </Text>
        </View>

        <View style={isWeb ? styles.webRow : undefined}>
          <View style={isWeb ? styles.webCol : undefined}>
            {/* SECTION 1: SGPA & CGPA DETAILS */}
            <Text style={[styles.sectionTitle, { color: headerBlue }]}>SGPA & CGPA DETAILS</Text>
            
            <View style={[styles.table, { borderColor: tableBorder, marginBottom: 32 }]}>
              <View style={[styles.tableRow, { backgroundColor: tableHeaderBg }]}>
                <Text style={[styles.tableHeaderCell, styles.cellSem, { color: tableHeaderText }]}>Semester</Text>
                <Text style={[styles.tableHeaderCell, styles.cellSgpa, { color: tableHeaderText }]}>SGPA</Text>
                <Text style={[styles.tableHeaderCell, styles.cellSgpa, { color: tableHeaderText }]}>CGPA</Text>
                <Text style={[styles.tableHeaderCell, styles.cellCredit, { color: tableHeaderText }]}>{isWeb ? 'Total Credits' : 'Total\nCredits'}</Text>
                <Text style={[styles.tableHeaderCell, styles.cellCreditLg, { color: tableHeaderText }]}>{isWeb ? 'Credits Secured' : 'Credits\nSecured'}</Text>
              </View>

              {SGPA_DETAILS.map((row, idx) => (
                <View key={row.id} style={[styles.tableRow, { backgroundColor: cardBg, borderTopColor: tableBorder, borderTopWidth: 1 }]}>
                  <Text style={[styles.tableCell, styles.cellSem, { color: textColor }]}>{row.semester.replace('SEMESTER-', 'SEM-')}</Text>
                  <Text style={[styles.tableCell, styles.cellSgpa, { color: textColor }]}>{row.sgpa}</Text>
                  <Text style={[styles.tableCell, styles.cellSgpa, { color: textColor }]}>{row.cgpa}</Text>
                  <Text style={[styles.tableCell, styles.cellCredit, { color: textColor }]}>{row.totalCredits}</Text>
                  <View style={[styles.tableCell, styles.cellCreditLg, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
                    <Text style={{ color: textColor }}>{row.creditsSecured}</Text>
                    <TouchableOpacity onPress={() => setSelectedSemester(row.semester)} style={styles.detailsBtn}>
                      <Text style={styles.detailsText}>Details</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={isWeb ? styles.webCol : undefined}>
            {/* SECTION 2: SEMESTER WISE BACKLOGS DETAILS */}
            <Text style={[styles.sectionTitle, { color: headerBlue }]}>SEMESTER WISE BACKLOGS DETAILS</Text>

            <View style={[styles.table, { borderColor: tableBorder }]}>
              <View style={[styles.tableRow, { backgroundColor: tableHeaderBg }]}>
                <Text style={[styles.tableHeaderCell, styles.cellCodeLg, { color: tableHeaderText }]}>Code</Text>
                <Text style={[styles.tableHeaderCell, styles.cellNameLg, { color: tableHeaderText }]}>Course Name</Text>
                <Text style={[styles.tableHeaderCell, styles.cellResult, { color: tableHeaderText }]}>Result</Text>
              </View>

              {BACKLOG_DETAILS.map((semBlock, idx) => (
                <React.Fragment key={idx}>
                  <View style={[styles.tableRow, { backgroundColor: headerBg, borderTopColor: tableBorder, borderTopWidth: 1 }]}>
                    <Text style={[styles.tableCell, styles.cellCodeLg]}></Text>
                    <Text style={[styles.tableCell, styles.cellNameLg, { color: textColor, fontWeight: '700' }]}>{semBlock.semester}</Text>
                    <Text style={[styles.tableCell, styles.cellResult]}></Text>
                  </View>
                  {semBlock.subjects.map((sub, sidx) => (
                    <View key={sidx} style={[styles.tableRow, { backgroundColor: cardBg, borderTopColor: tableBorder, borderTopWidth: 1 }]}>
                      <Text style={[styles.tableCell, styles.cellCodeLg, { color: sub.code === '---' ? '#EF4444' : textColor }]}>{sub.code}</Text>
                      <Text style={[styles.tableCell, styles.cellNameLg, { color: sub.name === '---' ? '#EF4444' : textColor }]}>{sub.name}</Text>
                      <View style={[styles.tableCell, styles.cellResult]}>
                        <View style={[styles.resultBox, { borderColor: tableBorder }]}>
                          <Text style={{ color: textColor, fontSize: 12 }}>{sub.result}</Text>
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
  header: { borderBottomWidth: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 8, paddingBottom: 12 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  loadingCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 16 },
  
  studentInfo: { alignItems: 'center', marginBottom: 24 },
  studentName: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  studentDetails: { fontSize: 14, fontWeight: '500' },
  
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12, textTransform: 'uppercase' },
  
  /* Web specific layout */
  webRow: { flexDirection: 'row', gap: 24 },
  webCol: { flex: 1 },
  
  table: { borderWidth: 1, borderRadius: 8, overflow: 'hidden', width: '100%' },
  tableRow: { flexDirection: 'row', minHeight: 48, alignItems: 'center' },
  
  tableHeaderCell: { paddingHorizontal: Platform.OS === 'web' ? 12 : 4, paddingVertical: 12, fontSize: Platform.OS === 'web' ? 14 : 11, fontWeight: '700', textAlign: 'center' },
  tableCell: { paddingHorizontal: Platform.OS === 'web' ? 12 : 4, paddingVertical: 12, fontSize: Platform.OS === 'web' ? 14 : 11, textAlign: 'center' },
  
  /* Column flex settings for SGPA/CGPA to auto-fit screen */
  cellSem: { flex: 2, textAlign: 'left' },
  cellSgpa: { flex: 1 },
  cellCredit: { flex: 1.2 },
  cellCreditLg: { flex: Platform.OS === 'web' ? 2 : 2.5 },
  
  /* Details Button */
  detailsBtn: { backgroundColor: '#EFF6FF', paddingHorizontal: Platform.OS === 'web' ? 12 : 6, paddingVertical: Platform.OS === 'web' ? 6 : 4, borderRadius: 16, borderWidth: 1, borderColor: '#3B82F6' },
  detailsText: { color: '#2563EB', fontSize: Platform.OS === 'web' ? 12 : 10, fontWeight: '600' },
  
  /* Column flex settings for Backlogs */
  cellCodeLg: { flex: 1.5, textAlign: 'left' },
  cellNameLg: { flex: 3, textAlign: 'left' },
  cellResult: { flex: 1 },
  resultBox: { borderWidth: 1, borderRadius: 4, height: 24, width: Platform.OS === 'web' ? 40 : 28, alignSelf: 'center', alignItems: 'center', justifyContent: 'center' },
  
  /* Fixed column widths for Subject Details (since it has 7 columns, it scrolls on mobile) */
  cellCode: { width: 110, textAlign: 'left' },
  cellName: { width: 300, textAlign: 'left' },
  cellSmall: { width: 60 },
  cellDate: { width: 80 },
});
