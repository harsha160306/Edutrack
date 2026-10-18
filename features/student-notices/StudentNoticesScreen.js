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
  ExternalLink,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const NOTICES_DATA = [
  {
    id: 'not-01',
    title: 'Mandatory Gate Cutoff & Morning Attendance Timing Update',
    category: 'Discipline',
    priority: 'Urgent',
    isPinned: true,
    isUnread: true,
    date: '14 Oct 2026',
    time: '08:30 AM',
    facultyName: 'Dr. K. S. Rao',
    facultyRole: 'Chief Warden & Discipline Convener',
    department: 'Central Administration',
    content:
      'Dear Students,\n\nAll students are hereby informed that the morning gate cutoff timing is strictly enforced at 09:30 AM sharp. Students arriving after 09:30 AM will be recorded as latecomers through biometric validation.\n\nStudents accumulating more than three late entries in a semester will be required to bring their parents for counseling before being issued hall tickets for semester end examinations.\n\nPlease cooperate and maintain institutional punctuality.',
    attachment: {
      name: 'Circular_Gate_Timings_Oct2026.pdf',
      size: '1.2 MB',
    },
  },
  {
    id: 'not-02',
    title: 'B.Tech Semester-V Mid-2 Examination Schedule & Instructions',
    category: 'Exams',
    priority: 'Important',
    isPinned: true,
    isUnread: true,
    date: '12 Oct 2026',
    time: '11:15 AM',
    facultyName: 'Prof. M. V. Subbarao',
    facultyRole: 'Controller of Examinations',
    department: 'Examination Cell',
    content:
      'The B.Tech Semester V Second Internal Examinations (Mid-2) will commence from 28th October 2026. Hall tickets will be issued through student portal from 24th October.\n\nStudents must bring physical ID cards and registered hall tickets to the examination halls. Scientific calculators are permitted only for specified subjects.',
    attachment: {
      name: 'Mid_2_Exam_Timetable_V_Sem.pdf',
      size: '850 KB',
    },
  },
  {
    id: 'not-03',
    title: 'Adherence to Lab Dress Code & Institutional Identity Cards',
    category: 'Discipline',
    priority: 'Important',
    isPinned: false,
    isUnread: false,
    date: '08 Oct 2026',
    time: '02:00 PM',
    facultyName: 'Dr. R. K. Varma',
    facultyRole: 'Head of Department',
    department: 'Computer Science & Engineering',
    content:
      'It has been noticed that several students are not wearing approved uniform and shoes during practical programming lab sessions. Entry into computing facilities without approved lab uniform and tag will not be permitted under any circumstances.',
    attachment: null,
  },
  {
    id: 'not-04',
    title: 'Guest Lecture on Generative AI & Cloud Architectures',
    category: 'Academic',
    priority: 'General',
    isPinned: false,
    isUnread: false,
    date: '02 Oct 2026',
    time: '10:00 AM',
    facultyName: 'Dr. K. V. Raman',
    facultyRole: 'Associate Professor & Academic Coordinator',
    department: 'CSE Department',
    content:
      'A special guest technical lecture by Industry Architect from Google Cloud will be conducted on Saturday at the Central Auditorium. Attendance is mandatory for 3rd and 4th year CSE & IT students.',
    attachment: {
      name: 'Session_Brochure_GoogleCloud.pdf',
      size: '2.4 MB',
    },
  },
  {
    id: 'not-05',
    title: 'Annual Sports & Cultural Fest Nominations Open',
    category: 'Campus',
    priority: 'General',
    isPinned: false,
    isUnread: false,
    date: '25 Sep 2026',
    time: '04:30 PM',
    facultyName: 'Mr. B. Anil Kumar',
    facultyRole: 'Physical Education Director',
    department: 'Sports & Student Activities',
    content:
      'Inter-department sports meet registrations are now open for Cricket, Badminton, Volleyball, and Chess. Interested students can register via student sports committee representatives.',
    attachment: null,
  },
];

const CATEGORIES = ['All', 'Discipline', 'Exams', 'Academic', 'Campus'];

export const StudentNoticesScreen = ({ colors, isDark, onBack }) => {
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

  const filteredNotices = NOTICES_DATA.filter((n) => {
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
      `Downloading ${attachment.name} (${attachment.size}). File saved to device downloads.`,
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
          <View style={styles.headerTitleWrap}>
            <Text style={[styles.headerTitle, { color: textColor }]}>View Notices</Text>
            <Text style={[styles.headerSubtitle, { color: mutedColor }]}>
              Faculty & Department Circulars
            </Text>
          </View>
          <View style={{ width: 36 }} />
        </View>

        {/* Search Input */}
        <View
          style={[
            styles.searchBox,
            { backgroundColor: isDark ? '#1E293B' : '#F1F5F9', borderColor: borderCol },
          ]}
        >
          <Search size={18} color={mutedColor} style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder="Search circulars, faculty, exam schedules..."
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
                  { borderColor: isSelected ? '#3B82F6' : borderCol },
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
          <Text style={[styles.liveIndicator, { color: '#10B981' }]}>● Live Updates</Text>
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

                {/* Faculty Sender Footer */}
                <View style={[styles.senderRow, { borderTopColor: borderCol }]}>
                  <View style={styles.facultyAvatar}>
                    <Text style={styles.facultyAvatarText}>
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
                      <FileText size={12} color="#3B82F6" style={{ marginRight: 4 }} />
                      <Text style={[styles.attachmentPillText, { color: textColor }]}>PDF</Text>
                    </View>
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Detailed Notice Modal */}
      {selectedNotice ? (
        <Modal
          visible={Boolean(selectedNotice)}
          transparent
          animationType="slide"
          onRequestClose={() => setSelectedNotice(null)}
        >
          <View style={styles.modalBackdrop}>
            <View
              style={[
                styles.modalCard,
                { backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderColor: borderCol },
                isWeb && styles.webModalCard,
              ]}
            >
              <View style={styles.modalTopRow}>
                <View style={[styles.priorityBadge, { backgroundColor: '#EFF6FF' }]}>
                  <Text style={[styles.priorityText, { color: '#2563EB' }]}>
                    {selectedNotice.category.toUpperCase()} • {selectedNotice.priority.toUpperCase()}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedNotice(null)} style={styles.modalCloseBtn}>
                  <X size={20} color={textColor} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={[styles.modalTitle, { color: textColor }]}>
                  {selectedNotice.title}
                </Text>

                <View style={[styles.modalSenderBox, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderColor: borderCol }]}>
                  <Text style={[styles.modalSenderLabel, { color: mutedColor }]}>PUBLISHED BY</Text>
                  <Text style={[styles.modalSenderName, { color: textColor }]}>
                    {selectedNotice.facultyName}
                  </Text>
                  <Text style={[styles.modalSenderRole, { color: mutedColor }]}>
                    {selectedNotice.facultyRole} • {selectedNotice.department}
                  </Text>
                  <Text style={[styles.modalDate, { color: mutedColor }]}>
                    {selectedNotice.date} at {selectedNotice.time}
                  </Text>
                </View>

                <Text style={[styles.modalBody, { color: textColor }]}>
                  {selectedNotice.content}
                </Text>

                {selectedNotice.attachment ? (
                  <View
                    style={[
                      styles.modalAttachmentBox,
                      { backgroundColor: isDark ? '#0F172A' : '#EFF6FF', borderColor: '#BFDBFE' },
                    ]}
                  >
                    <FileText size={22} color="#2563EB" style={{ marginRight: 10 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.attachmentName, { color: textColor }]} numberOfLines={1}>
                        {selectedNotice.attachment.name}
                      </Text>
                      <Text style={[styles.attachmentSize, { color: mutedColor }]}>
                        {selectedNotice.attachment.size} • Official Circular Document
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.downloadBtn}
                      onPress={() => handleDownloadAttachment(selectedNotice.attachment)}
                      activeOpacity={0.8}
                    >
                      <Download size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                ) : null}
              </ScrollView>

              <TouchableOpacity
                style={styles.modalDoneBtn}
                onPress={() => setSelectedNotice(null)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalDoneText}>Done Reading</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      ) : null}
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
    marginBottom: 10,
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
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
  },
  categoryScroll: {
    paddingVertical: 4,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 6,
  },
  categoryChipActive: {
    backgroundColor: '#3B82F6',
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 16,
  },
  webScrollContent: {
    maxWidth: 860,
    width: '100%',
    alignSelf: 'center',
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listCount: {
    fontSize: 12,
    fontWeight: '500',
  },
  liveIndicator: {
    fontSize: 12,
    fontWeight: '600',
  },
  noticeCard: {
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
  unreadCardBorder: {
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  dateWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
    marginLeft: 6,
  },
  noticeTitle: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 21,
    marginBottom: 6,
  },
  noticeSnippet: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  senderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 10,
    gap: 10,
  },
  facultyAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  facultyAvatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  facultyName: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  facultyRole: {
    fontSize: 11,
  },
  attachmentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  attachmentPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  emptyBox: {
    alignItems: 'center',
    padding: 36,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 20,
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxHeight: '85%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  webModalCard: {
    maxWidth: 600,
  },
  modalTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 24,
    marginBottom: 14,
  },
  modalSenderBox: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
  },
  modalSenderLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  modalSenderName: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  modalSenderRole: {
    fontSize: 12,
    marginTop: 2,
  },
  modalDate: {
    fontSize: 11.5,
    marginTop: 4,
  },
  modalBody: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
  },
  modalAttachmentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
  },
  attachmentName: {
    fontSize: 13,
    fontWeight: '600',
  },
  attachmentSize: {
    fontSize: 11,
    marginTop: 2,
  },
  downloadBtn: {
    backgroundColor: '#2563EB',
    padding: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  modalDoneBtn: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  modalDoneText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
