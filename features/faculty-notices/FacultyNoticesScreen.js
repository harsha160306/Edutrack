import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
  Alert,
} from 'react-native';
import {
  ArrowLeft,
  Bell,
  Search,
  FileText,
  Download,
  CheckCircle2,
  Calendar,
  User,
  X,
  Share2,
  Pin,
  Clock,
  Building,
  ShieldCheck,
  CheckCheck,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const FACULTY_NOTICES_DATA = [
  {
    id: 'fac-not-01',
    title: 'Morning Gate Cutoff & Disciplinary Enforcement Drive (07:50 - 09:30 AM)',
    category: 'Discipline',
    priority: 'Urgent',
    isPinned: true,
    isUnread: true,
    date: 'Today',
    time: '07:45 AM',
    facultyName: 'Dr. K. S. Rao',
    facultyRole: 'Chief Warden & Discipline Convener',
    department: 'Campus Vigilance & Discipline Cell',
    content:
      'Dear Faculty Members,\n\nAll designated committee members on morning shift duty are requested to report to the Main Campus Gate by 07:50 AM sharp.\n\nThe morning gate cutoff is strictly enforced at 09:30 AM. Students arriving past cutoff must be validated via the barcode scanner in MIC EduTrack. Recurrent late arrivals (more than 3 instances) will be automatically flagged for parental notification and formal counseling.\n\nPlease ensure smooth coordination with campus security personnel and maintain institutional decorum.',
    attachment: {
      name: 'Gate_Cutoff_Discipline_SOP_2026.pdf',
      size: '1.4 MB',
    },
  },
  {
    id: 'fac-not-02',
    title: 'Semester-V Mid-2 Examination Invigilation Duty Roster',
    category: 'Duties',
    priority: 'Urgent',
    isPinned: true,
    isUnread: true,
    date: 'Yesterday',
    time: '04:15 PM',
    facultyName: 'Prof. M. V. Subbarao',
    facultyRole: 'Controller of Examinations',
    department: 'Examination Cell (Autonomous)',
    content:
      'The comprehensive invigilation roster for the upcoming B.Tech Semester-V Mid-2 Examinations has been published.\n\nAll assigned faculty invigilators must report to the Central Examination Control Room 25 minutes prior to session commencement to collect sealed question packets and answer booklets.\n\nReliever duties and squad surveillance will be handled by the Flying Squad Committee. In case of emergency duty adjustments, submit exchange slips signed by the respective HOD 24 hours in advance.',
    attachment: {
      name: 'Exam_Invigilation_Roster_Oct2026.pdf',
      size: '2.8 MB',
    },
  },
  {
    id: 'fac-not-03',
    title: 'NBA Criteria-3 & Internal Academic Course File Audit Schedule',
    category: 'Academic',
    priority: 'Important',
    isPinned: false,
    isUnread: true,
    date: '25 Oct 2026',
    time: '11:30 AM',
    facultyName: 'Dr. P. Srinivas',
    facultyRole: 'Dean Academics & IQAC Coordinator',
    department: 'Internal Quality Assurance Cell',
    content:
      'The Department Internal Academic Audit for the ongoing odd semester will commence from Monday.\n\nFaculty members are requested to keep their course files updated with:\n1. Syllabus copy & Unit lesson plan\n2. CO-PO attainment matrices & assessment rubrics\n3. Mid-1 evaluated answer scripts with mark analysis\n4. Remedial classes log for slow learners\n\nPeer review committees will visit departmental blocks as per the attached schedule.',
    attachment: {
      name: 'IQAC_Faculty_Course_File_Rubrics.pdf',
      size: '940 KB',
    },
  },
  {
    id: 'fac-not-04',
    title: 'Research Seed Funding & DST-SERB Proposal Submissions Open',
    category: 'Research',
    priority: 'General',
    isPinned: false,
    isUnread: false,
    date: '20 Oct 2026',
    time: '02:00 PM',
    facultyName: 'Dr. A. V. Ramana',
    facultyRole: 'Dean (Research & Development)',
    department: 'R&D and Innovation Council',
    content:
      'Proposals are invited from faculty members for the MIC Internal Research Seed Grant (up to ₹2,00,000 per project) for the academic year 2026-2027.\n\nPriority will be given to inter-disciplinary domains including Cloud Computing, Embedded IoT, Renewable Energy, and Generative AI applications.\n\nSelected proposals will receive financial support for prototype hardware fabrication, software licenses, and SCI/Scopus journal publication charges.',
    attachment: {
      name: 'MIC_R&D_Seed_Grant_Policy_2026.pdf',
      size: '3.2 MB',
    },
  },
  {
    id: 'fac-not-05',
    title: 'Administrative Memo: Faculty Biometric Shift Regularization',
    category: 'Admin',
    priority: 'General',
    isPinned: false,
    isUnread: false,
    date: '16 Oct 2026',
    time: '10:00 AM',
    facultyName: 'Sri K. Venkataswamy',
    facultyRole: 'Administrative Officer (AO)',
    department: "Principal's Secretariat & HR",
    content:
      'All teaching and non-teaching faculty members are reminded that biometric logging at entry and exit terminals is mandatory.\n\nAny discrepancies or regularization requests for On-Duty (OD), university examination duties, or authorized off-campus academic tasks must be submitted via the HR portal before the 24th of each month to ensure seamless payroll processing.',
    attachment: null,
  },
  {
    id: 'fac-not-06',
    title: 'Institutional Code of Conduct & Student Dress Code Enforcement',
    category: 'Discipline',
    priority: 'Important',
    isPinned: false,
    isUnread: false,
    date: '10 Oct 2026',
    time: '03:45 PM',
    facultyName: 'Dr. B. K. Prasad',
    facultyRole: 'Principal, MIC College of Technology',
    department: 'Office of the Principal',
    content:
      'Faculty mentors are requested to conduct weekly counseling sessions with their allocated ward students to emphasize adherence to institutional guidelines.\n\nStudents must wear formal college uniforms on scheduled days and carry physical RFID identity cards at all times. Use of mobile phones during lecture hours or in academic corridors is strictly prohibited and subject to confiscation by the vigilance squad.',
    attachment: {
      name: 'Campus_Discipline_Manual_2026.pdf',
      size: '1.8 MB',
    },
  },
];

const CATEGORIES = ['All', 'Discipline', 'Duties', 'Academic', 'Research', 'Admin'];

export const FacultyNoticesScreen = ({ colors, isDark, onBack }) => {
  const insets = useSafeAreaInsets();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [readNotices, setReadNotices] = useState({});

  const textColor = isDark ? '#F8FAFC' : '#0F172A';
  const mutedColor = isDark ? '#94A3B8' : '#64748B';
  const cardBg = isDark ? '#1E293B' : '#FFFFFF';
  const borderCol = isDark ? '#334155' : '#E2E8F0';
  const isWeb = Platform.OS === 'web';

  const filteredNotices = FACULTY_NOTICES_DATA.filter((n) => {
    if (activeCategory !== 'All' && n.category !== activeCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        n.title.toLowerCase().includes(q) ||
        n.facultyName.toLowerCase().includes(q) ||
        n.department.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenNotice = (notice) => {
    setSelectedNotice(notice);
    setReadNotices((prev) => ({ ...prev, [notice.id]: true }));
  };

  const handleDownloadAttachment = (attachment) => {
    Alert.alert(
      'Attachment Download',
      `Downloading ${attachment.name} (${attachment.size}). Saved to your device downloads folder.`,
    );
  };

  const handleShareNotice = (notice) => {
    Alert.alert(
      'Share Circular',
      `Sharing "${notice.title}" with Department Faculty via College Messaging.`,
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
          <View style={styles.headerTitleWrap}>
            <Text style={[styles.headerTitle, { color: textColor }]}>Faculty Circulars</Text>
            <Text style={[styles.headerSubtitle, { color: mutedColor }]}>
              Official Duties & Administrative Notices
            </Text>
          </View>
          <View style={{ width: 36 }} />
        </View>

        {/* Search Input Box */}
        <View
          style={[
            styles.searchBox,
            { backgroundColor: isDark ? '#1E293B' : '#F1F5F9', borderColor: borderCol },
          ]}
        >
          <Search size={18} color={mutedColor} style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder="Search circulars, duties, exam orders..."
            placeholderTextColor={mutedColor}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Category Horizontal Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  isSelected && styles.categoryChipActive,
                  { borderColor: isSelected ? '#2563EB' : borderCol },
                ]}
                onPress={() => setActiveCategory(cat)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    { color: isSelected ? '#FFFFFF' : textColor },
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Notices Feed */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          isWeb && styles.webScrollContent,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.listHeaderRow}>
          <Text style={[styles.listCount, { color: mutedColor }]}>
            Showing {filteredNotices.length} notices
          </Text>
          <Text style={[styles.liveIndicator, { color: '#10B981' }]}>● Live Notices</Text>
        </View>

        {filteredNotices.length === 0 ? (
          <View style={[styles.emptyBox, { backgroundColor: cardBg, borderColor: borderCol }]}>
            <Bell size={44} color={mutedColor} style={{ marginBottom: 12 }} />
            <Text style={[styles.emptyTitle, { color: textColor }]}>No Notices Found</Text>
            <Text style={[styles.emptySub, { color: mutedColor }]}>
              There are no notices published in this category matching your search.
            </Text>
          </View>
        ) : (
          filteredNotices.map((notice) => {
            const isUnread = notice.isUnread && !readNotices[notice.id];
            const isUrgent = notice.priority === 'Urgent';
            const isImportant = notice.priority === 'Important';

            let priorityBg = isDark ? '#1E3A8A' : '#EFF6FF';
            let priorityColor = '#2563EB';
            if (isUrgent) {
              priorityBg = isDark ? '#450A0A' : '#FEF2F2';
              priorityColor = '#DC2626';
            } else if (isImportant) {
              priorityBg = isDark ? '#451A03' : '#FFFBEB';
              priorityColor = '#D97706';
            }

            return (
              <TouchableOpacity
                key={notice.id}
                style={[
                  styles.noticeCard,
                  { backgroundColor: cardBg, borderColor: borderCol },
                  isUnread && styles.unreadCardBorder,
                ]}
                onPress={() => handleOpenNotice(notice)}
                activeOpacity={0.85}
              >
                {/* Notice Top Meta */}
                <View style={styles.cardHeaderRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    {notice.isPinned ? (
                      <View style={styles.pinnedBadge}>
                        <Pin size={11} color="#D97706" />
                        <Text style={styles.pinnedText}>PINNED</Text>
                      </View>
                    ) : null}

                    <View style={[styles.priorityBadge, { backgroundColor: priorityBg }]}>
                      <Text style={[styles.priorityText, { color: priorityColor }]}>
                        {notice.priority.toUpperCase()}
                      </Text>
                    </View>

                    <View style={[styles.categoryBadge, { borderColor: borderCol }]}>
                      <Text style={[styles.categoryBadgeText, { color: mutedColor }]}>
                        {notice.category}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.dateWrap}>
                    <Calendar size={12} color={mutedColor} style={{ marginRight: 4 }} />
                    <Text style={[styles.dateText, { color: mutedColor }]}>{notice.date}</Text>
                    {isUnread ? <View style={styles.unreadDot} /> : null}
                  </View>
                </View>

                {/* Title */}
                <Text style={[styles.noticeTitle, { color: textColor }]}>{notice.title}</Text>

                {/* Content snippet */}
                <Text style={[styles.noticeSnippet, { color: mutedColor }]} numberOfLines={2}>
                  {notice.content}
                </Text>

                {/* Sender Authority Footer */}
                <View style={[styles.senderRow, { borderTopColor: borderCol }]}>
                  <View style={[styles.facultyAvatar, { backgroundColor: isDark ? '#1E3A8A' : '#EFF6FF' }]}>
                    <Text style={[styles.facultyAvatarText, { color: isDark ? '#93C5FD' : '#1D4ED8' }]}>
                      {notice.facultyName
                        .split(' ')
                        .map((w) => w[0])
                        .filter(Boolean)
                        .slice(0, 2)
                        .join('')}
                    </Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={[styles.facultyName, { color: textColor }]}>
                      {notice.facultyName}
                    </Text>
                    <Text style={[styles.facultyRole, { color: mutedColor }]} numberOfLines={1}>
                      {notice.facultyRole} • {notice.department}
                    </Text>
                  </View>

                  {notice.attachment ? (
                    <View style={[styles.attachmentPill, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]}>
                      <FileText size={12} color="#2563EB" style={{ marginRight: 4 }} />
                      <Text style={[styles.attachmentPillText, { color: textColor }]}>PDF</Text>
                    </View>
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Notice Detail Executive Modal */}
      {selectedNotice && (
        <Modal
          visible={Boolean(selectedNotice)}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedNotice(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.detailModalCard, { backgroundColor: cardBg, borderColor: borderCol }]}>
              {/* Modal Header */}
              <View style={styles.modalHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View
                    style={[
                      styles.priorityBadge,
                      {
                        backgroundColor:
                          selectedNotice.priority === 'Urgent'
                            ? isDark
                              ? '#450A0A'
                              : '#FEF2F2'
                            : selectedNotice.priority === 'Important'
                              ? isDark
                                ? '#451A03'
                                : '#FFFBEB'
                              : isDark
                                ? '#1E3A8A'
                                : '#EFF6FF',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.priorityText,
                        {
                          color:
                            selectedNotice.priority === 'Urgent'
                              ? '#DC2626'
                              : selectedNotice.priority === 'Important'
                                ? '#D97706'
                                : '#2563EB',
                        },
                      ]}
                    >
                      {selectedNotice.priority.toUpperCase()}
                    </Text>
                  </View>

                  <View style={[styles.categoryBadge, { borderColor: borderCol }]}>
                    <Text style={[styles.categoryBadgeText, { color: mutedColor }]}>
                      {selectedNotice.category}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => setSelectedNotice(null)}
                  style={styles.closeBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <X size={20} color={mutedColor} />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={{ maxHeight: 460 }}
                contentContainerStyle={{ paddingBottom: 16 }}
                showsVerticalScrollIndicator={false}
              >
                {/* Full Title */}
                <Text style={[styles.detailTitle, { color: textColor }]}>{selectedNotice.title}</Text>

                {/* Issuer Authority & Date Card */}
                <View style={[styles.detailSenderBox, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderColor: borderCol }]}>
                  <View style={[styles.facultyAvatar, { backgroundColor: isDark ? '#1E3A8A' : '#EFF6FF' }]}>
                    <Text style={[styles.facultyAvatarText, { color: isDark ? '#93C5FD' : '#1D4ED8' }]}>
                      {selectedNotice.facultyName
                        .split(' ')
                        .map((w) => w[0])
                        .filter(Boolean)
                        .slice(0, 2)
                        .join('')}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.detailSenderName, { color: textColor }]}>
                      {selectedNotice.facultyName}
                    </Text>
                    <Text style={[styles.detailSenderRole, { color: mutedColor }]}>
                      {selectedNotice.facultyRole}
                    </Text>
                    <Text style={[styles.detailSenderDept, { color: mutedColor }]}>
                      {selectedNotice.department} · {selectedNotice.date} at {selectedNotice.time}
                    </Text>
                  </View>
                </View>

                {/* Circular Body Content */}
                <Text style={[styles.detailContent, { color: textColor }]}>
                  {selectedNotice.content}
                </Text>

                {/* Attachment Download Box */}
                {selectedNotice.attachment && (
                  <View style={[styles.attachmentBox, { borderColor: borderCol, backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}>
                    <View style={styles.attachmentIconWrap}>
                      <FileText size={22} color="#2563EB" />
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={[styles.attachmentName, { color: textColor }]} numberOfLines={1}>
                        {selectedNotice.attachment.name}
                      </Text>
                      <Text style={[styles.attachmentSize, { color: mutedColor }]}>
                        {selectedNotice.attachment.size} · Official Document
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.downloadBtn}
                      onPress={() => handleDownloadAttachment(selectedNotice.attachment)}
                      activeOpacity={0.7}
                      accessibilityRole="button"
                      accessibilityLabel="Download Attachment"
                    >
                      <Download size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>

              {/* Modal Actions Footer */}
              <View style={[styles.modalActionsRow, { borderTopColor: borderCol }]}>
                <TouchableOpacity
                  style={[styles.shareBtn, { borderColor: borderCol }]}
                  onPress={() => handleShareNotice(selectedNotice)}
                  activeOpacity={0.7}
                >
                  <Share2 size={15} color={textColor} style={{ marginRight: 6 }} />
                  <Text style={[styles.shareBtnText, { color: textColor }]}>Share</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.doneBtn}
                  onPress={() => setSelectedNotice(null)}
                  activeOpacity={0.8}
                >
                  <CheckCheck size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.doneBtnText}>Acknowledge</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 10,
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
  headerTitleWrap: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 8,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    paddingVertical: 0,
  },
  categoryScroll: {
    paddingBottom: 4,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
  },
  categoryChipActive: {
    backgroundColor: '#2563EB',
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
  },
  webScrollContent: {
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  listHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  listCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  liveIndicator: {
    fontSize: 12,
    fontWeight: '700',
  },
  emptyBox: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '500',
  },
  noticeCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: {
        elevation: 1.5,
      },
      web: {
        boxShadow: '0 1px 6px rgba(0, 0, 0, 0.04)',
      },
    }),
  },
  unreadCardBorder: {
    borderLeftWidth: 3.5,
    borderLeftColor: '#2563EB',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  pinnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3,
  },
  pinnedText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#D97706',
  },
  priorityBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  categoryBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 0.8,
  },
  categoryBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
  },
  dateWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 11,
    fontWeight: '600',
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2563EB',
    marginLeft: 6,
  },
  noticeTitle: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: 6,
  },
  noticeSnippet: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    marginBottom: 12,
  },
  senderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 10,
  },
  facultyAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  facultyAvatarText: {
    fontSize: 12,
    fontWeight: '800',
  },
  facultyName: {
    fontSize: 13,
    fontWeight: '700',
  },
  facultyRole: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  attachmentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  attachmentPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  detailModalCard: {
    width: '100%',
    maxWidth: 480,
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
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  closeBtn: {
    padding: 4,
  },
  detailTitle: {
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 23,
    marginBottom: 12,
  },
  detailSenderBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 14,
  },
  detailSenderName: {
    fontSize: 13,
    fontWeight: '700',
  },
  detailSenderRole: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  detailSenderDept: {
    fontSize: 10.5,
    fontWeight: '500',
    marginTop: 2,
  },
  detailContent: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
    marginBottom: 14,
  },
  attachmentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 4,
  },
  attachmentIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachmentName: {
    fontSize: 13,
    fontWeight: '700',
  },
  attachmentSize: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  downloadBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  modalActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderTopWidth: 1,
    paddingTop: 14,
    marginTop: 10,
  },
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
  },
  shareBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  doneBtn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 42,
    borderRadius: 10,
    backgroundColor: '#2563EB',
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
