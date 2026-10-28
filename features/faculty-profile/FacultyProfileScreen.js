import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  Modal,
  TouchableWithoutFeedback,
  Linking,
} from 'react-native';
import {
  ArrowLeft,
  User,
  GraduationCap,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShieldCheck,
  Award,
  BookOpen,
  Copy,
  CheckCircle,
  ExternalLink,
  Menu,
  Settings,
  Lock,
  HelpCircle,
  X,
  ChevronRight,
  Headphones,
  Clock,
  Building,
  FileText,
  Layers,
  Key,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const FACULTY_PROFILE_DATA = {
  personal: {
    fullName: 'Dr. K. V. Raman',
    employeeId: 'MIC-FAC-042',
    designation: 'Associate Professor & Discipline Convener',
    department: 'Computer Science and Engineering',
    deptShort: 'CSE',
    dateOfJoining: '12 June 2017',
    experience: '14+ Years (8 Years at MIC)',
    bloodGroup: 'B +ve',
    biometricId: 'BIO-8921',
  },
  professional: {
    highestQualification: 'Ph.D. in Computer Science & Engineering',
    specialization: 'Distributed Systems, Cloud & Machine Learning',
    phdUniversity: 'Jawaharlal Nehru Technological University (JNTUK)',
    mtechDetails: 'M.Tech (CSE - First Class with Distinction)',
    btechDetails: 'B.Tech in Information Technology',
    researchPublications: '18 Scopus / 6 SCI Indexed Papers, 2 Patents Filed',
    currentSubjects: 'Distributed Systems (CSE-3A), Cloud Computing (CSE-4B)',
    labIncharge: 'Advanced Cloud & Virtualization Lab (Room 314)',
  },
  duties: {
    primaryRole: 'Convener, Central Discipline Committee',
    activeShift: 'Morning Gate Cutoff Duty (07:50 AM - 09:30 AM)',
    assignedZone: 'Main Campus Gate & Academic Block A',
    escalationAuthority: 'Immediate Disciplinary Logging & Parent Alert',
    additionalRoles: 'Chief Warden (Boys Hostel Block-2), NBA Criteria-3 Incharge',
    committeeTenure: '2024 - 2027 (Active)',
  },
  contact: {
    collegeEmail: 'member@mic.edu',
    directEmail: 'raman.kv@mic.edu',
    primaryMobile: '+91 98765 43210',
    intercomExtension: 'Ext. 4210',
    officeLocation: 'Room 312, 3rd Floor, Ramanujan Academic Block',
    disciplineOffice: 'Gate Control Room & Discipline Chamber, Admin Ground Floor',
    reportingAuthority: 'Head of Department (CSE) & Principal, MIC',
  },
};

export const FacultyProfileScreen = ({
  colors,
  isDark,
  onBack,
  onOpenSettings,
  onLockApp,
}) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('professional'); // 'professional' | 'duties' | 'contact'
  const [copiedKey, setCopiedKey] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [helpModalVisible, setHelpModalVisible] = useState(false);

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
              accessibilityRole="button"
              accessibilityLabel={`Copy ${label}`}
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
      {/* Top Header */}
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
            onPress={onBack}
            style={styles.backBtn}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Back to Dashboard"
          >
            <ArrowLeft color={textColor} size={22} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>Faculty Profile</Text>
          <TouchableOpacity
            onPress={() => setMenuVisible(true)}
            style={styles.menuBtn}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Open options menu"
          >
            <Menu color={textColor} size={22} />
          </TouchableOpacity>
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
        {/* Profile Executive Hero Card */}
        <View style={[styles.heroCard, { backgroundColor: cardBg, borderColor: borderCol }]}>
          <View style={styles.heroTopRow}>
            <View style={styles.avatarWrap}>
              <View style={[styles.avatarCircle, { backgroundColor: isDark ? '#1E3A8A' : '#EFF6FF' }]}>
                <Text style={[styles.avatarText, { color: isDark ? '#93C5FD' : '#1D4ED8' }]}>KR</Text>
              </View>
              <View style={styles.statusDot} />
            </View>

            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={[styles.profileName, { color: textColor }]}>
                {FACULTY_PROFILE_DATA.personal.fullName}
              </Text>

              <View style={styles.empIdRow}>
                <Text style={[styles.empIdText, { color: '#2563EB' }]}>
                  {FACULTY_PROFILE_DATA.personal.employeeId}
                </Text>
                <TouchableOpacity
                  onPress={() => copyToClipboard(FACULTY_PROFILE_DATA.personal.employeeId, 'heroEmpId')}
                  style={styles.copyIconMini}
                  activeOpacity={0.7}
                >
                  {copiedKey === 'heroEmpId' ? (
                    <CheckCircle size={13} color="#10B981" />
                  ) : (
                    <Copy size={13} color="#2563EB" />
                  )}
                </TouchableOpacity>
              </View>

              <Text style={[styles.profileBranch, { color: mutedColor }]}>
                {FACULTY_PROFILE_DATA.personal.designation}
              </Text>
              <Text style={[styles.profileBranch, { color: mutedColor, marginTop: 1 }]}>
                Dept. of {FACULTY_PROFILE_DATA.personal.deptShort} · MIC
              </Text>

              <View style={styles.badgeRow}>
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>ACTIVE FACULTY</Text>
                </View>
                <View style={[styles.activeBadge, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE', borderWidth: 0.8 }]}>
                  <Text style={[styles.activeBadgeText, { color: '#1D4ED8' }]}>DISCIPLINE CONVENER</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Quick Stats Grid */}
          <View style={[styles.quickStatsRow, { borderTopColor: borderCol }]}>
            <View style={styles.statCell}>
              <Text style={[styles.statVal, { color: textColor }]}>14+ Yrs</Text>
              <Text style={[styles.statLabel, { color: mutedColor }]}>Experience</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: borderCol }]} />

            <View style={styles.statCell}>
              <Text style={[styles.statVal, { color: '#2563EB' }]}>18</Text>
              <Text style={[styles.statLabel, { color: mutedColor }]}>Publications</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: borderCol }]} />

            <View style={styles.statCell}>
              <Text style={[styles.statVal, { color: '#10B981' }]}>Gate Duty</Text>
              <Text style={[styles.statLabel, { color: mutedColor }]}>Active Shift</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: borderCol }]} />

            <View style={styles.statCell}>
              <Text style={[styles.statVal, { color: '#F59E0B' }]}>2</Text>
              <Text style={[styles.statLabel, { color: mutedColor }]}>Patents</Text>
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
            { id: 'professional', label: 'Professional', Icon: Briefcase },
            { id: 'duties', label: 'Duties & Committee', Icon: ShieldCheck },
            { id: 'contact', label: 'Contact & Office', Icon: Mail },
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            const TabIcon = tab.Icon;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.profileTab,
                  isSelected && styles.profileTabActive,
                  { borderColor: isSelected ? '#2563EB' : borderCol },
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
          {activeTab === 'professional' && (
            <View>
              <View style={styles.cardHeaderWithIcon}>
                <GraduationCap size={18} color="#2563EB" style={{ marginRight: 8 }} />
                <Text style={[styles.cardHeaderTitle, { color: textColor }]}>
                  Academic Qualifications & Research
                </Text>
              </View>

              {renderInfoRow('Employee ID', FACULTY_PROFILE_DATA.personal.employeeId, 'empId')}
              {renderInfoRow('Designation', FACULTY_PROFILE_DATA.personal.designation)}
              {renderInfoRow('Department', FACULTY_PROFILE_DATA.personal.department)}
              {renderInfoRow('Highest Degree', FACULTY_PROFILE_DATA.professional.highestQualification)}
              {renderInfoRow('Ph.D. Awarded By', FACULTY_PROFILE_DATA.professional.phdUniversity)}
              {renderInfoRow('Post-Graduation', FACULTY_PROFILE_DATA.professional.mtechDetails)}
              {renderInfoRow('Under-Graduation', FACULTY_PROFILE_DATA.professional.btechDetails)}
              {renderInfoRow('Core Specialization', FACULTY_PROFILE_DATA.professional.specialization)}
              {renderInfoRow('Research & Patents', FACULTY_PROFILE_DATA.professional.researchPublications)}
              {renderInfoRow('Current Teaching Load', FACULTY_PROFILE_DATA.professional.currentSubjects)}
              {renderInfoRow('Lab In-Charge', FACULTY_PROFILE_DATA.professional.labIncharge)}
              {renderInfoRow('Joining Date', FACULTY_PROFILE_DATA.personal.dateOfJoining)}
            </View>
          )}

          {activeTab === 'duties' && (
            <View>
              <View style={styles.cardHeaderWithIcon}>
                <ShieldCheck size={18} color="#2563EB" style={{ marginRight: 8 }} />
                <Text style={[styles.cardHeaderTitle, { color: textColor }]}>
                  Discipline Committee & Campus Roles
                </Text>
              </View>

              {renderInfoRow('Primary Responsibility', FACULTY_PROFILE_DATA.duties.primaryRole)}
              {renderInfoRow('Active Shift Details', FACULTY_PROFILE_DATA.duties.activeShift)}
              {renderInfoRow('Assigned Gate Zone', FACULTY_PROFILE_DATA.duties.assignedZone)}
              {renderInfoRow('Escalation Authority', FACULTY_PROFILE_DATA.duties.escalationAuthority)}
              {renderInfoRow('Additional Campus Duties', FACULTY_PROFILE_DATA.duties.additionalRoles)}
              {renderInfoRow('Committee Tenure', FACULTY_PROFILE_DATA.duties.committeeTenure)}
              {renderInfoRow('Biometric Staff ID', FACULTY_PROFILE_DATA.personal.biometricId, 'bioId')}
            </View>
          )}

          {activeTab === 'contact' && (
            <View>
              <View style={styles.cardHeaderWithIcon}>
                <Mail size={18} color="#2563EB" style={{ marginRight: 8 }} />
                <Text style={[styles.cardHeaderTitle, { color: textColor }]}>
                  Office & Communication Details
                </Text>
              </View>

              {renderInfoRow('College Email', FACULTY_PROFILE_DATA.contact.collegeEmail, 'colEmail')}
              {renderInfoRow('Direct Faculty Email', FACULTY_PROFILE_DATA.contact.directEmail, 'dirEmail')}
              {renderInfoRow('Primary Contact Phone', FACULTY_PROFILE_DATA.contact.primaryMobile, 'mobPhone')}
              {renderInfoRow('Intercom Extension', FACULTY_PROFILE_DATA.contact.intercomExtension, 'extIntercom')}
              {renderInfoRow('Faculty Cabin / Office', FACULTY_PROFILE_DATA.contact.officeLocation, 'cabinRoom')}
              {renderInfoRow('Discipline Cell Chamber', FACULTY_PROFILE_DATA.contact.disciplineOffice)}
              {renderInfoRow('Reporting Authority', FACULTY_PROFILE_DATA.contact.reportingAuthority)}
            </View>
          )}
        </View>
      </ScrollView>

      {/* 3-Lines Options Modal (Help center, App settings, Lock App) */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.menuSheet, { backgroundColor: cardBg, borderColor: borderCol }]}>
                <View style={styles.menuSheetHeader}>
                  <Text style={[styles.menuSheetTitle, { color: textColor }]}>Faculty Profile Options</Text>
                  <TouchableOpacity
                    onPress={() => setMenuVisible(false)}
                    style={styles.closeBtn}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <X size={20} color={mutedColor} />
                  </TouchableOpacity>
                </View>

                {/* Option 1: Help center */}
                <TouchableOpacity
                  style={[styles.menuOptionRow, { borderBottomColor: borderCol }]}
                  activeOpacity={0.7}
                  onPress={() => {
                    setMenuVisible(false);
                    setTimeout(() => setHelpModalVisible(true), 150);
                  }}
                >
                  <View style={[styles.menuOptionIconWrap, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.18)' : '#EFF6FF' }]}>
                    <HelpCircle size={20} color="#2563EB" />
                  </View>
                  <View style={styles.menuOptionTextWrap}>
                    <Text style={[styles.menuOptionTitle, { color: textColor }]}>Help Center</Text>
                    <Text style={[styles.menuOptionSub, { color: mutedColor }]}>
                      Security control room & administrative desk
                    </Text>
                  </View>
                  <ChevronRight size={18} color={mutedColor} />
                </TouchableOpacity>

                {/* Option 2: App settings */}
                <TouchableOpacity
                  style={[styles.menuOptionRow, { borderBottomColor: borderCol }]}
                  activeOpacity={0.7}
                  onPress={() => {
                    setMenuVisible(false);
                    onOpenSettings?.();
                  }}
                >
                  <View style={[styles.menuOptionIconWrap, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.18)' : '#ECFDF5' }]}>
                    <Settings size={20} color="#059669" />
                  </View>
                  <View style={styles.menuOptionTextWrap}>
                    <Text style={[styles.menuOptionTitle, { color: textColor }]}>App Settings</Text>
                    <Text style={[styles.menuOptionSub, { color: mutedColor }]}>
                      Theme, notifications & security
                    </Text>
                  </View>
                  <ChevronRight size={18} color={mutedColor} />
                </TouchableOpacity>

                {/* Option 3: Lock App */}
                <TouchableOpacity
                  style={[styles.menuOptionRow, { borderBottomWidth: 0 }]}
                  activeOpacity={0.7}
                  onPress={() => {
                    setMenuVisible(false);
                    onLockApp?.();
                  }}
                >
                  <View style={[styles.menuOptionIconWrap, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.18)' : '#FEF2F2' }]}>
                    <Lock size={20} color="#DC2626" />
                  </View>
                  <View style={styles.menuOptionTextWrap}>
                    <Text style={[styles.menuOptionTitle, { color: textColor }]}>Lock App</Text>
                    <Text style={[styles.menuOptionSub, { color: mutedColor }]}>
                      Secure session with MPIN or Biometrics
                    </Text>
                  </View>
                  <ChevronRight size={18} color={mutedColor} />
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Help Center Details Modal */}
      <Modal
        visible={helpModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setHelpModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setHelpModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.helpModalCard, { backgroundColor: cardBg, borderColor: borderCol }]}>
                <View style={styles.helpHeaderRow}>
                  <View style={styles.helpIconBadge}>
                    <Headphones size={22} color="#2563EB" />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.helpTitle, { color: textColor }]}>Faculty Support Desk</Text>
                    <Text style={[styles.helpSub, { color: mutedColor }]}>
                      MIC Campus Emergency & Helpdesk
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setHelpModalVisible(false)} style={styles.closeBtn}>
                    <X size={20} color={mutedColor} />
                  </TouchableOpacity>
                </View>

                <View style={[styles.helpDivider, { backgroundColor: borderCol }]} />

                {/* Support Contact 1: Security Control Room */}
                <View style={[styles.supportContactCard, { borderColor: borderCol }]}>
                  <Text style={[styles.supportRoleLabel, { color: mutedColor }]}>CAMPUS SECURITY CONTROL ROOM</Text>
                  <Text style={[styles.supportPersonName, { color: textColor }]}>Main Gate Control Office</Text>
                  <Text style={[styles.supportMeta, { color: mutedColor }]}>Emergency Gate Coordination & Vigilance</Text>
                  <TouchableOpacity
                    style={styles.actionCallBtn}
                    onPress={() => copyToClipboard('+91 8678 273535', 'secPhone')}
                    activeOpacity={0.7}
                  >
                    <Phone size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.actionCallText}>Copy Security Phone (+91 8678 273535)</Text>
                  </TouchableOpacity>
                </View>

                {/* Support Contact 2: IT & Software Support */}
                <View style={[styles.supportContactCard, { borderColor: borderCol, marginTop: 12 }]}>
                  <Text style={[styles.supportRoleLabel, { color: mutedColor }]}>MIC IT PORTAL HELPDESK</Text>
                  <Text style={[styles.supportPersonName, { color: textColor }]}>Systems Administration Center</Text>
                  <Text style={[styles.supportMeta, { color: mutedColor }]}>Biometric sync, attendance & login assistance</Text>
                  <TouchableOpacity
                    style={[styles.actionCallBtn, { backgroundColor: '#10B981' }]}
                    onPress={() => copyToClipboard('support@mic.edu', 'itEmail')}
                    activeOpacity={0.7}
                  >
                    <Mail size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.actionCallText}>Copy IT Support (support@mic.edu)</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  menuBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  scrollContent: {
    padding: 16,
  },
  webScrollContent: {
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  heroCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
      },
    }),
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarWrap: {
    position: 'relative',
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  empIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  empIdText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  copyIconMini: {
    marginLeft: 6,
    padding: 2,
  },
  profileBranch: {
    fontSize: 13,
    marginTop: 3,
    fontWeight: '500',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  activeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#ECFDF5',
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.5,
  },
  quickStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    marginTop: 16,
    paddingTop: 12,
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 14,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
  },
  tabScroll: {
    paddingBottom: 12,
    gap: 8,
  },
  profileTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  profileTabActive: {
    backgroundColor: '#2563EB',
  },
  profileTabText: {
    fontSize: 13,
    fontWeight: '700',
  },
  detailsCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
      },
    }),
  },
  cardHeaderWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.1)',
  },
  cardHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
    width: '38%',
  },
  infoValueWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
    paddingLeft: 8,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right',
    flexShrink: 1,
  },
  copyBtn: {
    marginLeft: 8,
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  menuSheet: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
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
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
      },
    }),
  },
  menuSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 8,
  },
  menuSheetTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 4,
  },
  menuOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  menuOptionIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuOptionTextWrap: {
    flex: 1,
  },
  menuOptionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  menuOptionSub: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  helpModalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
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
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
      },
    }),
  },
  helpHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  helpIconBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  helpSub: {
    fontSize: 12,
    marginTop: 1,
    fontWeight: '500',
  },
  helpDivider: {
    height: 1,
    marginVertical: 14,
  },
  supportContactCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  supportRoleLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  supportPersonName: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  supportMeta: {
    fontSize: 12,
    marginTop: 1,
    fontWeight: '500',
  },
  actionCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  actionCallText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
