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
  ArrowLeft,
  User,
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShieldCheck,
  Award,
  BookOpen,
  Users,
  Bus,
  Copy,
  CheckCircle,
  ExternalLink,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PROFILE_DATA = {
  personal: {
    fullName: 'SANDHYA P.',
    regNo: '22H71A05A1',
    gender: 'Female',
    dob: '14 July 2004',
    bloodGroup: 'O +ve',
  },
  academic: {
    program: 'Bachelor of Technology (B.Tech)',
    department: 'Computer Science and Engineering',
    deptShort: 'CSE',
    section: 'CSE-3A',
    currentSemester: 'Semester 5 (3rd Year)',
    batch: '2022 - 2026',
    regulation: 'R20 Autonomous',
    admissionQuota: 'Convener Quota (APEAPCET Rank: 4210)',
    admissionDate: '18 August 2022',
    cgpa: '8.51',
    attendance: '86.4%',
    creditsEarned: '96 / 160',
    activeBacklogs: '0 Active',
    counselorName: 'Dr. K. V. Raman',
    counselorRole: 'Associate Professor, CSE Dept.',
    counselorEmail: 'raman.kv@mic.edu',
  },
  contact: {
    collegeEmail: 'student@mic.edu',
    personalEmail: 'sandhya.p@gmail.com',
    primaryMobile: '+91 98765 43210',
    emergencyMobile: '+91 98480 12345 (Father)',
    currentAddress: 'Flat 302, Sri Sai Nilayam, Beside MIC Campus, Kanchikacherla, AP - 521180',
    permanentAddress: 'D.No: 4-12/1, Benz Circle, Vijayawada, Krishna District, AP - 520001',
  },
  parents: {
    fatherName: 'P. Venkata Rao',
    fatherOccupation: 'Business & Agriculture',
    fatherContact: '+91 98480 12345',
    motherName: 'P. Lakshmi',
    motherOccupation: 'Homemaker',
  },
  campus: {
    commuteMode: 'College Bus Service',
    busRoute: 'Route #12 (Benz Circle to Campus)',
    busPassId: 'BP-2025-0982',
    libraryId: 'LIB-CSE-22H71A05A1',
    biometricId: 'BIO-05A1 (Enrolled & Active)',
    idCardValidity: 'Valid through June 2026',
  },
};

export const StudentProfileScreen = ({ colors, isDark, onBack }) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('academic'); // 'academic' | 'personal' | 'contact' | 'parents' | 'campus'
  const [copiedKey, setCopiedKey] = useState(null);

  const textColor = isDark ? '#F8FAFC' : '#0F172A';
  const mutedColor = isDark ? '#94A3B8' : '#64748B';
  const cardBg = isDark ? '#1E293B' : '#FFFFFF';
  const borderCol = isDark ? '#334155' : '#E2E8F0';
  const isWeb = Platform.OS === 'web';

  const copyToClipboard = (text, key) => {
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
    } else {
      Alert.alert('Copied to Clipboard', text);
    }
  };

  const renderInfoRow = (label, value, keyToCopy = null) => {
    return (
      <View style={[styles.infoRow, { borderBottomColor: borderCol }]}>
        <Text style={[styles.infoLabel, { color: mutedColor }]}>{label}</Text>
        <View style={styles.infoValueWrap}>
          <Text style={[styles.infoValue, { color: textColor }]}>{value}</Text>
          {keyToCopy ? (
            <TouchableOpacity
              onPress={() => copyToClipboard(value, keyToCopy)}
              style={styles.copyBtn}
              activeOpacity={0.7}
            >
              {copiedKey === keyToCopy ? (
                <CheckCircle size={14} color="#10B981" />
              ) : (
                <Copy size={14} color={mutedColor} />
              )}
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  };

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
          <Text style={[styles.headerTitle, { color: textColor }]}>Student Profile</Text>
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
        {/* Profile Hero Card */}
        <View style={[styles.heroCard, { backgroundColor: cardBg, borderColor: borderCol }]}>
          <View style={styles.heroTopRow}>
            <View style={styles.avatarWrap}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>SP</Text>
              </View>
              <View style={styles.statusDot} />
            </View>

            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={[styles.profileName, { color: textColor }]}>
                {PROFILE_DATA.personal.fullName}
              </Text>
              
              <View style={styles.regNoRow}>
                <Text style={[styles.regNoText, { color: '#3B82F6' }]}>
                  {PROFILE_DATA.personal.regNo}
                </Text>
                <TouchableOpacity
                  onPress={() => copyToClipboard(PROFILE_DATA.personal.regNo, 'heroRegNo')}
                  style={styles.copyIconMini}
                >
                  {copiedKey === 'heroRegNo' ? (
                    <CheckCircle size={13} color="#10B981" />
                  ) : (
                    <Copy size={13} color="#3B82F6" />
                  )}
                </TouchableOpacity>
              </View>

              <Text style={[styles.profileBranch, { color: mutedColor }]}>
                {PROFILE_DATA.academic.program} • {PROFILE_DATA.academic.deptShort}
              </Text>

              <View style={styles.badgeRow}>
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>ACTIVE STUDENT</Text>
                </View>
                <View style={[styles.activeBadge, { backgroundColor: '#EFF6FF' }]}>
                  <Text style={[styles.activeBadgeText, { color: '#2563EB' }]}>BATCH 2022-26</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Quick Stats Grid */}
          <View style={[styles.quickStatsRow, { borderTopColor: borderCol }]}>
            <View style={styles.statCell}>
              <Text style={[styles.statVal, { color: textColor }]}>
                {PROFILE_DATA.academic.cgpa}
              </Text>
              <Text style={[styles.statLabel, { color: mutedColor }]}>CGPA</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: borderCol }]} />

            <View style={styles.statCell}>
              <Text style={[styles.statVal, { color: '#10B981' }]}>
                {PROFILE_DATA.academic.attendance}
              </Text>
              <Text style={[styles.statLabel, { color: mutedColor }]}>Attendance</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: borderCol }]} />

            <View style={styles.statCell}>
              <Text style={[styles.statVal, { color: textColor }]}>
                {PROFILE_DATA.academic.creditsEarned.split(' ')[0]}
              </Text>
              <Text style={[styles.statLabel, { color: mutedColor }]}>Credits</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: borderCol }]} />

            <View style={styles.statCell}>
              <Text style={[styles.statVal, { color: '#059669' }]}>0</Text>
              <Text style={[styles.statLabel, { color: mutedColor }]}>Backlogs</Text>
            </View>
          </View>
        </View>

        {/* Section Tabs Switcher */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScroll}
        >
          {[
            { id: 'academic', label: 'Academic', Icon: GraduationCap },
            { id: 'personal', label: 'Personal', Icon: User },
            { id: 'contact', label: 'Contact', Icon: Mail },
            { id: 'parents', label: 'Parents', Icon: Users },
            { id: 'campus', label: 'Campus & Transit', Icon: Bus },
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            const TabIcon = tab.Icon;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.profileTab,
                  isSelected && styles.profileTabActive,
                  { borderColor: isSelected ? '#3B82F6' : borderCol },
                ]}
                onPress={() => setActiveTab(tab.id)}
                activeOpacity={0.8}
              >
                <TabIcon size={14} color={isSelected ? '#FFFFFF' : mutedColor} style={{ marginRight: 6 }} />
                <Text
                  style={[
                    styles.profileTabText,
                    { color: isSelected ? '#FFFFFF' : textColor },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Dynamic Card Content Based on Active Tab */}
        <View style={[styles.detailsCard, { backgroundColor: cardBg, borderColor: borderCol }]}>
          {activeTab === 'academic' && (
            <View>
              <View style={styles.cardHeaderWithIcon}>
                <GraduationCap size={18} color="#2563EB" style={{ marginRight: 8 }} />
                <Text style={[styles.cardHeaderTitle, { color: textColor }]}>
                  Academic Program & Institutional Details
                </Text>
              </View>

              {renderInfoRow('Roll / Registration No', PROFILE_DATA.personal.regNo, 'rollNo')}
              {renderInfoRow('Program Degree', PROFILE_DATA.academic.program)}
              {renderInfoRow('Department / Branch', PROFILE_DATA.academic.department)}
              {renderInfoRow('Current Semester', PROFILE_DATA.academic.currentSemester)}
              {renderInfoRow('Section', PROFILE_DATA.academic.section)}
              {renderInfoRow('Curriculum Regulation', PROFILE_DATA.academic.regulation)}
              {renderInfoRow('Admission Quota', PROFILE_DATA.academic.admissionQuota)}
              {renderInfoRow('Date of Admission', PROFILE_DATA.academic.admissionDate)}
              {renderInfoRow('Faculty Mentor', `${PROFILE_DATA.academic.counselorName} (${PROFILE_DATA.academic.counselorRole})`)}
              {renderInfoRow('Mentor Email', PROFILE_DATA.academic.counselorEmail, 'counselorEmail')}
            </View>
          )}

          {activeTab === 'personal' && (
            <View>
              <View style={styles.cardHeaderWithIcon}>
                <User size={18} color="#2563EB" style={{ marginRight: 8 }} />
                <Text style={[styles.cardHeaderTitle, { color: textColor }]}>
                  Personal & Identity Information
                </Text>
              </View>

              {renderInfoRow('Full Legal Name', PROFILE_DATA.personal.fullName)}
              {renderInfoRow('Date of Birth', PROFILE_DATA.personal.dob)}
              {renderInfoRow('Gender', PROFILE_DATA.personal.gender)}
              {renderInfoRow('Blood Group', PROFILE_DATA.personal.bloodGroup)}
            </View>
          )}

          {activeTab === 'contact' && (
            <View>
              <View style={styles.cardHeaderWithIcon}>
                <Mail size={18} color="#2563EB" style={{ marginRight: 8 }} />
                <Text style={[styles.cardHeaderTitle, { color: textColor }]}>
                  Contact & Communication Information
                </Text>
              </View>

              {renderInfoRow('Institutional Email', PROFILE_DATA.contact.collegeEmail, 'instEmail')}
              {renderInfoRow('Personal Email', PROFILE_DATA.contact.personalEmail, 'persEmail')}
              {renderInfoRow('Primary Phone', PROFILE_DATA.contact.primaryMobile, 'phone')}
              {renderInfoRow('Emergency Contact', PROFILE_DATA.contact.emergencyMobile, 'emPhone')}
              {renderInfoRow('Current / Campus Address', PROFILE_DATA.contact.currentAddress)}
              {renderInfoRow('Permanent Residence', PROFILE_DATA.contact.permanentAddress)}
            </View>
          )}

          {activeTab === 'parents' && (
            <View>
              <View style={styles.cardHeaderWithIcon}>
                <Users size={18} color="#2563EB" style={{ marginRight: 8 }} />
                <Text style={[styles.cardHeaderTitle, { color: textColor }]}>
                  Parent & Guardian Information
                </Text>
              </View>

              {renderInfoRow("Father's Name", PROFILE_DATA.parents.fatherName)}
              {renderInfoRow("Father's Occupation", PROFILE_DATA.parents.fatherOccupation)}
              {renderInfoRow("Father's Contact", PROFILE_DATA.parents.fatherContact, 'fatherPhone')}
              {renderInfoRow("Mother's Name", PROFILE_DATA.parents.motherName)}
              {renderInfoRow("Mother's Occupation", PROFILE_DATA.parents.motherOccupation)}
            </View>
          )}

          {activeTab === 'campus' && (
            <View>
              <View style={styles.cardHeaderWithIcon}>
                <Bus size={18} color="#2563EB" style={{ marginRight: 8 }} />
                <Text style={[styles.cardHeaderTitle, { color: textColor }]}>
                  Campus Transport & Facility Information
                </Text>
              </View>

              {renderInfoRow('Mode of Commute', PROFILE_DATA.campus.commuteMode)}
              {renderInfoRow('Bus Route & Stop', PROFILE_DATA.campus.busRoute)}
              {renderInfoRow('Bus Pass ID', PROFILE_DATA.campus.busPassId, 'busPass')}
              {renderInfoRow('Library Membership ID', PROFILE_DATA.campus.libraryId, 'libId')}
              {renderInfoRow('Biometric Attendance Punch ID', PROFILE_DATA.campus.biometricId)}
              {renderInfoRow('Digital ID Validity', PROFILE_DATA.campus.idCardValidity)}
            </View>
          )}
        </View>
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
  },
  backBtn: {
    padding: 6,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
  },
  webScrollContent: {
    maxWidth: 860,
    width: '100%',
    alignSelf: 'center',
  },
  heroCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  statusDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    position: 'absolute',
    bottom: 2,
    right: 2,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '800',
  },
  regNoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 6,
  },
  regNoText: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  copyIconMini: {
    padding: 2,
  },
  profileBranch: {
    fontSize: 12.5,
    marginTop: 3,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  activeBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  activeBadgeText: {
    color: '#059669',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  quickStatsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 14,
    alignItems: 'center',
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 16,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
  },
  tabScroll: {
    paddingBottom: 14,
    gap: 8,
  },
  profileTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 6,
  },
  profileTabActive: {
    backgroundColor: '#3B82F6',
  },
  profileTabText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  detailsCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cardHeaderWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  cardHeaderTitle: {
    fontSize: 14.5,
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  infoLabel: {
    fontSize: 12.5,
    fontWeight: '500',
    flex: 1,
  },
  infoValueWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1.5,
    justifyContent: 'flex-end',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right',
  },
  copyBtn: {
    marginLeft: 8,
    padding: 4,
  },
});
