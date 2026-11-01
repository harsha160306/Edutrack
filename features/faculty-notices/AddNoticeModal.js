import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  Alert,
  Vibration,
} from 'react-native';
import {
  X,
  Send,
  Bell,
  FileText,
  AlertTriangle,
  Users,
  GraduationCap,
  Sparkles,
  Paperclip,
  CheckCircle2,
} from 'lucide-react-native';
import { addNoticeByAdmin } from './noticesStore';

export const AddNoticeModal = ({
  visible,
  onClose,
  isDark = false,
  colors,
}) => {
  const [title, setTitle] = useState('');
  const [audience, setAudience] = useState('All'); // 'All' | 'Faculty' | 'Students'
  const [category, setCategory] = useState('Discipline');
  const [priority, setPriority] = useState('Important'); // 'Urgent' | 'Important' | 'General'
  const [content, setContent] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [publishing, setPublishing] = useState(false);

  const textColor = isDark ? '#F8FAFC' : '#0F172A';
  const mutedColor = isDark ? '#94A3B8' : '#64748B';
  const cardBg = isDark ? '#1E293B' : '#FFFFFF';
  const inputBg = isDark ? '#0F172A' : '#F8FAFC';
  const borderCol = isDark ? '#334155' : '#E2E8F0';

  const audienceOptions = [
    { id: 'All', label: 'All Portals', Icon: Sparkles },
    { id: 'Faculty', label: 'Faculty Only', Icon: Users },
    { id: 'Students', label: 'Students Only', Icon: GraduationCap },
  ];

  const categoryOptions = ['Discipline', 'Exams', 'Academic', 'Admin', 'Campus'];
  const priorityOptions = [
    { id: 'Urgent', label: 'Urgent', color: '#DC2626', bg: isDark ? 'rgba(220, 38, 38, 0.2)' : '#FEF2F2' },
    { id: 'Important', label: 'Important', color: '#D97706', bg: isDark ? 'rgba(217, 119, 6, 0.2)' : '#FFFBEB' },
    { id: 'General', label: 'General', color: '#2563EB', bg: isDark ? 'rgba(37, 99, 235, 0.2)' : '#EFF6FF' },
  ];

  const handlePublish = () => {
    if (!title.trim()) {
      Alert.alert('Notice Title Required', 'Please enter a title for the circular.');
      return;
    }
    if (!content.trim()) {
      Alert.alert('Notice Content Required', 'Please enter the circular body text.');
      return;
    }

    if (Platform.OS !== 'web') Vibration.vibrate(40);
    setPublishing(true);

    setTimeout(() => {
      addNoticeByAdmin({
        title: title.trim(),
        category,
        priority,
        audience,
        content: content.trim(),
        attachmentName: attachmentName.trim() ? attachmentName.trim() : `${category}_Circular_${Date.now().toString().slice(-4)}.pdf`,
      });

      setPublishing(false);
      Alert.alert(
        'Circular Broadcasted',
        `Notice "${title.trim()}" has been published and is now live on the ${audience === 'All' ? 'Faculty & Student' : audience} portals.`,
        [{ text: 'OK', onPress: onClose }],
      );
      // Reset fields
      setTitle('');
      setContent('');
      setAttachmentName('');
    }, 400);
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
                <Bell size={18} color="#2563EB" />
              </View>
              <View style={{ marginLeft: 10 }}>
                <Text style={[styles.headerTitle, { color: textColor }]}>Broadcast Circular</Text>
                <Text style={[styles.headerSubtitle, { color: mutedColor }]}>
                  Publish to Department Faculty & Students
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={20} color={mutedColor} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* Target Audience Segment */}
            <Text style={[styles.fieldLabel, { color: mutedColor }]}>TARGET AUDIENCE</Text>
            <View style={styles.audienceRow}>
              {audienceOptions.map((opt) => {
                const isSelected = audience === opt.id;
                const Icon = opt.Icon;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    style={[
                      styles.audiencePill,
                      { backgroundColor: isSelected ? '#2563EB' : inputBg, borderColor: isSelected ? '#2563EB' : borderCol },
                    ]}
                    onPress={() => setAudience(opt.id)}
                    activeOpacity={0.8}
                  >
                    <Icon size={14} color={isSelected ? '#FFFFFF' : mutedColor} style={{ marginRight: 6 }} />
                    <Text style={[styles.audienceText, { color: isSelected ? '#FFFFFF' : textColor }]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Circular Title Input */}
            <Text style={[styles.fieldLabel, { color: mutedColor, marginTop: 14 }]}>CIRCULAR TITLE</Text>
            <TextInput
              style={[styles.input, { backgroundColor: inputBg, borderColor: borderCol, color: textColor }]}
              placeholder="e.g. Mandatory Gate Cutoff & Morning Attendance"
              placeholderTextColor={mutedColor}
              value={title}
              onChangeText={setTitle}
            />

            {/* Priority & Category */}
            <View style={styles.twoColRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={[styles.fieldLabel, { color: mutedColor, marginTop: 14 }]}>PRIORITY</Text>
                <View style={styles.priorityRow}>
                  {priorityOptions.map((p) => {
                    const isSelected = priority === p.id;
                    return (
                      <TouchableOpacity
                        key={p.id}
                        style={[
                          styles.priorityPill,
                          {
                            backgroundColor: isSelected ? p.color : p.bg,
                            borderColor: p.color,
                            borderWidth: 1,
                          },
                        ]}
                        onPress={() => setPriority(p.id)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.priorityText, { color: isSelected ? '#FFFFFF' : p.color }]}>
                          {p.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={[styles.fieldLabel, { color: mutedColor, marginTop: 14 }]}>CATEGORY</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                  {categoryOptions.map((c) => {
                    const isSelected = category === c;
                    return (
                      <TouchableOpacity
                        key={c}
                        style={[
                          styles.categoryPill,
                          {
                            backgroundColor: isSelected ? '#2563EB' : inputBg,
                            borderColor: isSelected ? '#2563EB' : borderCol,
                          },
                        ]}
                        onPress={() => setCategory(c)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.categoryText, { color: isSelected ? '#FFFFFF' : textColor }]}>
                          {c}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </View>

            {/* Content / Body */}
            <Text style={[styles.fieldLabel, { color: mutedColor, marginTop: 14 }]}>CIRCULAR DETAILS / CONTENT</Text>
            <TextInput
              style={[styles.textArea, { backgroundColor: inputBg, borderColor: borderCol, color: textColor }]}
              placeholder="Enter official circular message, instructions, and guidelines..."
              placeholderTextColor={mutedColor}
              multiline
              numberOfLines={4}
              value={content}
              onChangeText={setContent}
              textAlignVertical="top"
            />

            {/* Attachment filename */}
            <Text style={[styles.fieldLabel, { color: mutedColor, marginTop: 14 }]}>ATTACHED PDF DOCUMENT (OPTIONAL)</Text>
            <View style={[styles.attachmentInputWrap, { backgroundColor: inputBg, borderColor: borderCol }]}>
              <Paperclip size={16} color={mutedColor} style={{ marginRight: 8 }} />
              <TextInput
                style={[styles.attachmentInput, { color: textColor }]}
                placeholder="e.g. Schedule_Notice_Nov2026.pdf"
                placeholderTextColor={mutedColor}
                value={attachmentName}
                onChangeText={setAttachmentName}
              />
            </View>
          </ScrollView>

          {/* Action buttons */}
          <View style={[styles.footerRow, { borderTopColor: borderCol }]}>
            <TouchableOpacity style={[styles.cancelBtn, { borderColor: borderCol }]} onPress={onClose} activeOpacity={0.7}>
              <Text style={[styles.cancelBtnText, { color: mutedColor }]}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.publishBtn, { opacity: publishing ? 0.7 : 1 }]}
              onPress={handlePublish}
              disabled={publishing}
              activeOpacity={0.85}
            >
              <Send size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.publishBtnText}>
                {publishing ? 'Broadcasting...' : 'Broadcast Notice'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '90%',
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
    width: 36,
    height: 36,
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
  scrollBody: {
    padding: 18,
  },
  fieldLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  audienceRow: {
    flexDirection: 'row',
    gap: 8,
  },
  audiencePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  audienceText: {
    fontSize: 11,
    fontWeight: '700',
  },
  input: {
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: '600',
  },
  twoColRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 4,
  },
  priorityPill: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '800',
  },
  categoryPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
  },
  textArea: {
    minHeight: 88,
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  attachmentInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  attachmentInput: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    paddingVertical: 0,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
  },
  cancelBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  publishBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 42,
    borderRadius: 10,
    backgroundColor: '#2563EB',
  },
  publishBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
