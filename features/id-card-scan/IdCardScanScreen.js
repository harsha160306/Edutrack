import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { CheckCircle2, ChevronLeft, ChevronDown, ScanLine } from 'lucide-react-native';
import { OFFLINE_COPY, SYNC_STATUS } from '../faculty-offline-sync/constants';
import { useFacultyOfflineSync } from '../faculty-offline-sync';
import { SCAN_BARCODE_TYPES, SCAN_COPY } from './constants';
import { parseStudentIdPayload } from './parseStudentIdPayload';
import { DashboardBackdrop } from '../../components/apple_material';
const IS_WEB = Platform.OS === 'web';
const SCAN_COOLDOWN_MS = 2200;

/** @typedef {'auto' | 'manual'} ScanApprovalMode */

export const IdCardScanScreen = ({
  colors,
  isDark,
  accountId,
  onBack,
  initialStudent,
  approvalMode = 'auto',
  behavior = 'mark', // 'mark' | 'search'
  scanType = 'latecomer', // 'latecomer' | 'indiscipline'
  onLookupResult,
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [mode, setMode] = useState(IS_WEB ? 'manual' : 'camera');
  const [pendingScan, setPendingScan] = useState(null);
  const [markedResult, setMarkedResult] = useState(null);
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [dept, setDept] = useState('');
  const [indisciplineOption, setIndisciplineOption] = useState('Dress-code');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activityDescription, setActivityDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const scanLockRef = useRef(false);
  const lastScanAtRef = useRef(0);

  const {
    isOffline,
    pendingCount,
    todayMarksByYou: todayMarks,
    markLatecomer,
    canSync,
  } = useFacultyOfflineSync(accountId, true);

  const resetScanLock = useCallback(() => {
    scanLockRef.current = false;
    setPendingScan(null);
    setMarkedResult(null);
    setActivityDescription('');
    setIndisciplineOption('Dress-code');
    setDropdownOpen(false);
    setSaving(false);
    if (!IS_WEB) setMode('camera');
  }, []);

  const applyMarkForStudent = useCallback(
    async (payload) => {
      const roll = payload.studentId?.trim();
      if (!roll) {
        Alert.alert('Roll number required', 'Enter or scan a valid student roll number.');
        scanLockRef.current = false;
        return;
      }

      setPendingScan(payload);
      setMarkedResult(null);
      setMode('marking');
      setSaving(true);

      try {
        await markLatecomer({
          studentId: roll,
          studentName: payload.studentName?.trim() || undefined,
          dept: payload.dept?.trim() || undefined,
          type: scanType,
          description: scanType === 'indiscipline'
            ? (indisciplineOption === 'Others' ? (activityDescription?.trim() || 'Others') : indisciplineOption)
            : undefined,
        });
        setMarkedResult({
          payload,
          offline: isOffline || !canSync,
        });
        setMode('success');
        setStudentId('');
        setStudentName('');
        setDept('');
      } catch (err) {
        Alert.alert('Could not save', err?.message ?? 'Try again.');
        scanLockRef.current = false;
        setMode(IS_WEB ? 'manual' : 'camera');
        setPendingScan(null);
      } finally {
        setSaving(false);
      }
    },
    [canSync, isOffline, markLatecomer, scanType, indisciplineOption, activityDescription],
  );

  const queueStudentFromScan = useCallback(
    (parsed) => {
      scanLockRef.current = true;
      setPendingScan(parsed);
      setMarkedResult(null);

      if (behavior === 'search') {
        onLookupResult?.(parsed);
        // Immediately return to caller screen (history/search) without marking.
        onBack?.();
        return;
      }

      if (approvalMode === 'auto') {
        void applyMarkForStudent(parsed);
        return;
      }

      // Manual mode: show review card and wait for user to tap Approve or Cancel
      setMode('review');
    },
    [approvalMode, applyMarkForStudent, behavior, onBack, onLookupResult],
  );

  useEffect(() => {
    const roll = initialStudent?.studentId?.trim();
    if (!roll) return;

    const payload = {
      studentId: roll,
      studentName: initialStudent.studentName?.trim() || undefined,
      dept: initialStudent.dept?.trim() || undefined,
    };

    queueStudentFromScan(payload);
    setStudentId(roll);
    setStudentName(payload.studentName ?? '');
    setDept(payload.dept ?? '');
  }, [initialStudent, queueStudentFromScan]);

  const handleBarcodeScanned = useCallback(
    ({ data }) => {
      if (scanLockRef.current || mode === 'marking' || mode === 'success') return;
      if (!IS_WEB && mode !== 'camera') return;

      const now = Date.now();
      if (now - lastScanAtRef.current < SCAN_COOLDOWN_MS) return;
      lastScanAtRef.current = now;

      const parsed = parseStudentIdPayload(data);
      if (!parsed?.studentId) {
        Alert.alert(SCAN_COPY.invalidQr, SCAN_COPY.invalidQrMessage);
        return;
      }

      queueStudentFromScan(parsed);
    },
    [mode, queueStudentFromScan],
  );

  const handleManualMark = () => {
    void applyMarkForStudent({
      studentId,
      studentName,
      dept,
    });
  };

  const pendingMarks = todayMarks.filter((m) => m.syncStatus === SYNC_STATUS.PENDING);
  const syncedMarks = todayMarks.filter((m) => m.syncStatus === SYNC_STATUS.SYNCED);

  const showCamera =
    !IS_WEB &&
    (mode === 'camera' || mode === 'review' || mode === 'marking') &&
    permission?.granted &&
    mode !== 'success';

  const displayStudent = markedResult?.payload ?? pendingScan;
  const showStudentCard =
    displayStudent && (mode === 'review' || mode === 'marking' || mode === 'success');

  const approvalLabel =
    approvalMode === 'auto' ? SCAN_COPY.approvalAuto : SCAN_COPY.approvalManual;

  const insets = useSafeAreaInsets();

  const webContainerStyle = IS_WEB ? {
    maxWidth: 800,
    width: '90%',
    marginHorizontal: 'auto',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    marginTop: 40,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flex: 1,
  } : { flex: 1 };
  
  const webRootStyle = IS_WEB ? {
    flex: 1,
  } : { backgroundColor: colors.background, flex: 1 };

  return (
    <View style={[styles.root, webRootStyle, { paddingTop: Math.max(insets?.top || 0, 16), paddingBottom: Math.max(insets?.bottom || 0, 16) }]}>
      {IS_WEB && <DashboardBackdrop isDark={isDark} primary={colors?.primary} />}
      <View style={[webContainerStyle, IS_WEB && { position: 'relative', zIndex: 1 }]}>
      {IS_WEB ? (
        <View style={{ backgroundColor: '#F59E0B', borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden' }}>
          <View style={[styles.header, { backgroundColor: 'transparent', borderBottomWidth: 0, paddingTop: 20, paddingBottom: 20 }]}>
            <TouchableOpacity onPress={onBack} style={[styles.backBtn, { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginLeft: 16 }]} hitSlop={12}>
              <ChevronLeft color="#FFFFFF" size={24} strokeWidth={2.5} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={[styles.headerTitle, { color: '#FFFFFF', fontSize: 20, fontWeight: '700' }]}>
                {scanType === 'indiscipline' ? 'In-discipline' : 'Late-comers'}
              </Text>
            </View>
            <View style={[styles.backBtn, { marginRight: 16 }]} />
          </View>
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={12}>
              <ChevronLeft color={colors.text} size={26} strokeWidth={2.5} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <ScanLine color={colors.secondary} size={22} strokeWidth={2.5} />
              <Text style={[styles.headerTitle, { color: colors.text }]}>{SCAN_COPY.title}</Text>
            </View>
            <View style={styles.backBtn} />
          </View>
          <View style={[styles.modeChip, { backgroundColor: isDark ? '#334155' : '#E2E8F0' }]}>
            <Text style={[styles.modeChipText, { color: isDark ? '#E2E8F0' : '#475569' }]}>
              {approvalLabel}
            </Text>
          </View>
        </>
      )}

      {showCamera ? (
        <View style={styles.cameraWrap}>
          <CameraView
            style={styles.camera}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: SCAN_BARCODE_TYPES }}
            onBarcodeScanned={mode === 'camera' ? handleBarcodeScanned : undefined}
          />
          <View style={styles.cameraOverlay} pointerEvents="none">
            <View style={styles.viewfinder}>
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
            </View>
            <Text style={styles.cameraHint}>{SCAN_COPY.subtitle}</Text>
          </View>
          {mode === 'camera' ? (
            <TouchableOpacity
              style={styles.manualFab}
              onPress={() => {
                scanLockRef.current = true;
                setMode('manual');
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.manualFabText}>{SCAN_COPY.manualLink}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}

      {!IS_WEB && mode === 'camera' && !permission?.granted ? (
        <View style={styles.permissionBox}>
          <ScanLine color={colors.secondary} size={40} strokeWidth={2} />
          <Text style={[styles.permissionTitle, { color: colors.text }]}>
            {SCAN_COPY.permissionTitle}
          </Text>
          <Text style={[styles.permissionMsg, { color: isDark ? '#94a3b8' : '#64748b' }]}>
            {SCAN_COPY.permissionMessage}
          </Text>
          <TouchableOpacity
            style={[styles.permissionBtn, { backgroundColor: colors.secondary }]}
            onPress={requestPermission}
          >
            <Text style={styles.permissionBtnText}>{SCAN_COPY.grantButton}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMode('manual')} style={styles.permissionLink}>
            <Text style={[styles.permissionLinkText, { color: colors.secondary }]}>
              {SCAN_COPY.manualLink}
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {showStudentCard ? (
        <View
          style={[
            !showCamera && styles.studentCardStandalone,
          ]}
        >
        <View
          style={[
            styles.studentCard,
            showCamera && styles.studentCardOverCamera,
            { backgroundColor: isDark ? '#1e293b' : colors.card },
          ]}
        >
          {mode === 'success' ? (
            <View style={styles.successIconWrap}>
              <CheckCircle2 color="#22C55E" size={36} strokeWidth={2.5} />
            </View>
          ) : saving ? (
            <ActivityIndicator color={colors.secondary} style={styles.cardSpinner} />
          ) : null}

          <Text style={[styles.cardTitle, { color: colors.text }]}>
            {mode === 'success'
              ? (scanType === 'indiscipline' ? 'Marked as indiscipline' : SCAN_COPY.markedTitle)
              : mode === 'review'
                ? (scanType === 'indiscipline' ? 'Confirm In-discipline Activity' : SCAN_COPY.reviewTitle)
                : SCAN_COPY.markingTitle}
          </Text>

          {mode === 'success' ? (
            <Text style={[styles.cardSubtitle, { color: isDark ? '#94a3b8' : '#64748b' }]}>
              {SCAN_COPY.markedSubtitle}
            </Text>
          ) : null}

          <Text style={[styles.confirmRoll, { color: colors.text }]}>{displayStudent.studentId}</Text>
          {displayStudent.studentName ? (
            <Text style={[styles.confirmMeta, { color: isDark ? '#94a3b8' : '#64748b' }]}>
              {displayStudent.studentName}
            </Text>
          ) : null}
          {displayStudent.dept ? (
            <Text style={[styles.confirmMeta, { color: isDark ? '#94a3b8' : '#64748b' }]}>
              {displayStudent.dept}
            </Text>
          ) : null}

          {mode === 'success' ? (
            <Text style={[styles.syncNote, { color: markedResult?.offline ? '#F59E0B' : '#22C55E' }]}>
              {markedResult?.offline 
                ? (scanType === 'indiscipline' ? 'In-discipline mark saved offline.' : OFFLINE_COPY.savedOffline) 
                : (scanType === 'indiscipline' ? 'In-discipline mark recorded and synced.' : OFFLINE_COPY.savedAndSynced)}
            </Text>
          ) : null}

          {mode === 'review' && scanType === 'indiscipline' ? (
            <View style={{ width: '100%', paddingHorizontal: 16, marginTop: 16 }}>
              <TouchableOpacity
                onPress={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
                  borderColor: isDark ? '#334155' : '#E2E8F0',
                  borderWidth: 1,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  borderRadius: 12,
                }}
                activeOpacity={0.8}
              >
                <Text style={{ color: colors.text, fontSize: 15, fontWeight: '500' }}>
                  {indisciplineOption}
                </Text>
                <ChevronDown size={20} color={isDark ? '#94A3B8' : '#64748B'} />
              </TouchableOpacity>

              {dropdownOpen && (
                <View style={{
                  marginTop: 6,
                  backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                  borderColor: isDark ? '#334155' : '#E2E8F0',
                  borderWidth: 1,
                  borderRadius: 12,
                  overflow: 'hidden',
                }}>
                  {['Dress-code', 'Roaming-around', 'Others'].map((opt, i) => (
                    <TouchableOpacity
                      key={opt}
                      style={{
                        paddingVertical: 14,
                        paddingHorizontal: 16,
                        borderBottomWidth: i < 2 ? 1 : 0,
                        borderBottomColor: isDark ? '#334155' : '#E2E8F0',
                      }}
                      onPress={() => {
                        setIndisciplineOption(opt);
                        setDropdownOpen(false);
                        if (opt !== 'Others') {
                          setActivityDescription('');
                        }
                      }}
                    >
                      <Text style={{ color: colors.text, fontSize: 15 }}>{opt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {indisciplineOption === 'Others' && (
                <TextInput
                  style={[
                    styles.activityInput,
                    {
                      backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
                      borderColor: isDark ? '#334155' : '#E2E8F0',
                      color: colors.text,
                    },
                  ]}
                  placeholder="Enter specific activity..."
                  placeholderTextColor={isDark ? '#94A3B8' : '#94A3B8'}
                  value={activityDescription}
                  onChangeText={setActivityDescription}
                  multiline
                  autoFocus
                />
              )}
            </View>
          ) : null}

          {/* Manual mode: Approve / Cancel buttons */}
          {mode === 'review' ? (
            <View style={styles.reviewActions}>
              <TouchableOpacity
                style={[styles.reviewCancelBtn, { borderColor: colors.border, backgroundColor: isDark ? '#334155' : '#F1F5F9' }]}
                onPress={resetScanLock}
                activeOpacity={0.82}
              >
                <Text style={[styles.reviewCancelText, { color: isDark ? '#E2E8F0' : '#334155' }]}>
                  {SCAN_COPY.reviewCancel}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.reviewApproveBtn, { backgroundColor: colors.secondary }]}
                onPress={() => pendingScan && void applyMarkForStudent(pendingScan)}
                activeOpacity={0.85}
              >
                <Text style={styles.reviewApproveText}>{SCAN_COPY.reviewApprove}</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Success: Scan another */}
          {mode === 'success' ? (
            <TouchableOpacity
              style={[styles.scanAnotherBtn, { backgroundColor: colors.secondary }]}
              onPress={resetScanLock}
              activeOpacity={0.85}
            >
              <Text style={styles.scanAnotherText}>{SCAN_COPY.scanAnother}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        </View>
      ) : null}

      {(mode === 'manual' || IS_WEB) && mode !== 'success' && mode !== 'marking' && mode !== 'review' ? (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={[styles.subtitle, { color: isDark ? '#94a3b8' : '#64748b' }]}>
              {IS_WEB ? SCAN_COPY.webSubtitle : OFFLINE_COPY.scanSubtitle}
            </Text>

            {isOffline ? (
              <View style={[styles.offlineChip, { backgroundColor: isDark ? '#422006' : '#fef3c7' }]}>
                <Text style={[styles.offlineChipText, { color: isDark ? '#fcd34d' : '#b45309' }]}>
                  {SCAN_COPY.offlineChip}
                </Text>
              </View>
            ) : null}

            <Field
              label={SCAN_COPY.rollLabel}
              value={studentId}
              onChangeText={setStudentId}
              colors={colors}
              isDark={isDark}
              autoCapitalize="characters"
            />
            <Field
              label={SCAN_COPY.nameLabel}
              value={studentName}
              onChangeText={setStudentName}
              colors={colors}
              isDark={isDark}
            />
            <Field
              label={SCAN_COPY.deptLabel}
              value={dept}
              onChangeText={setDept}
              colors={colors}
              isDark={isDark}
            />

            {scanType === 'indiscipline' && (
              <View style={{ width: '100%', marginBottom: 24 }}>
                <TouchableOpacity
                  onPress={() => setDropdownOpen(!dropdownOpen)}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: IS_WEB ? '#FFFFFF' : (isDark ? '#1E293B' : '#F1F5F9'),
                    borderColor: IS_WEB ? '#E2E8F0' : (isDark ? '#334155' : '#E2E8F0'),
                    borderWidth: 1,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    borderRadius: 12,
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={{ color: IS_WEB ? '#0F172A' : colors.text, fontSize: 15, fontWeight: '500' }}>
                    {indisciplineOption}
                  </Text>
                  <ChevronDown size={20} color={IS_WEB ? '#64748B' : (isDark ? '#94A3B8' : '#64748B')} />
                </TouchableOpacity>

                {dropdownOpen && (
                  <View style={{
                    marginTop: 6,
                    backgroundColor: IS_WEB ? '#FFFFFF' : (isDark ? '#1E293B' : '#FFFFFF'),
                    borderColor: IS_WEB ? '#E2E8F0' : (isDark ? '#334155' : '#E2E8F0'),
                    borderWidth: 1,
                    borderRadius: 12,
                    overflow: 'hidden',
                  }}>
                    {['Dress-code', 'Roaming-around', 'Others'].map((opt, i) => (
                      <TouchableOpacity
                        key={opt}
                        style={{
                          paddingVertical: 14,
                          paddingHorizontal: 16,
                          borderBottomWidth: i < 2 ? 1 : 0,
                          borderBottomColor: IS_WEB ? '#E2E8F0' : (isDark ? '#334155' : '#E2E8F0'),
                        }}
                        onPress={() => {
                          setIndisciplineOption(opt);
                          setDropdownOpen(false);
                          if (opt !== 'Others') {
                            setActivityDescription('');
                          }
                        }}
                      >
                        <Text style={{ color: IS_WEB ? '#0F172A' : colors.text, fontSize: 15 }}>{opt}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {indisciplineOption === 'Others' && (
                  <TextInput
                    style={[
                      styles.activityInput,
                      {
                        backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
                        borderColor: isDark ? '#334155' : '#E2E8F0',
                        color: colors.text,
                      },
                    ]}
                    placeholder="Enter specific activity..."
                    placeholderTextColor={isDark ? '#94A3B8' : '#94A3B8'}
                    value={activityDescription}
                    onChangeText={setActivityDescription}
                    multiline
                  />
                )}
              </View>
            )}

            <TouchableOpacity
              style={[styles.markBtn, { backgroundColor: colors.secondary }, saving && styles.btnDisabled]}
              onPress={handleManualMark}
              disabled={saving}
              activeOpacity={0.85}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.markBtnText}>
                  {scanType === 'indiscipline' ? 'Mark as indiscipline' : SCAN_COPY.markButton}
                </Text>
              )}
            </TouchableOpacity>

            {!IS_WEB ? (
              <TouchableOpacity
                onPress={() => {
                  scanLockRef.current = false;
                  setMode('camera');
                }}
                style={styles.backToScan}
              >
                <Text style={[styles.backToScanText, { color: colors.secondary }]}>
                  Back to camera scan
                </Text>
              </TouchableOpacity>
            ) : null}

            {pendingMarks.length > 0 ? (
              <MarkList
                title={`${SCAN_COPY.pendingSection} (${pendingCount})`}
                items={pendingMarks}
                colors={colors}
                isDark={isDark}
                pending
              />
            ) : null}

            {syncedMarks.length > 0 ? (
              <MarkList
                title={SCAN_COPY.syncedSection}
                items={syncedMarks.slice(0, 8)}
                colors={colors}
                isDark={isDark}
              />
            ) : null}
          </ScrollView>
        </KeyboardAvoidingView>
      ) : null}

      {showCamera && (pendingMarks.length > 0 || syncedMarks.length > 0) && !showStudentCard ? (
        <View style={[styles.todayStrip, { backgroundColor: isDark ? '#0f172a' : '#f8fafc' }]}>
          <Text style={[styles.todayStripText, { color: isDark ? '#94a3b8' : '#64748b' }]}>
            Today: {todayMarks.length} mark{todayMarks.length === 1 ? '' : 's'}
            {pendingCount > 0 ? ` · ${pendingCount} pending` : ''}
          </Text>
        </View>
      ) : null}
      </View>
    </View>
  );
};

const Field = ({ label, value, onChangeText, colors, isDark, autoCapitalize }) => (
  <View style={styles.field}>
    <Text style={[styles.label, { color: isDark ? '#94a3b8' : '#64748b' }]}>{label}</Text>
    <TextInput
      style={[
        styles.input,
        {
          color: IS_WEB ? '#0F172A' : colors.text,
          backgroundColor: IS_WEB ? '#FFFFFF' : (isDark ? '#1e293b' : '#FFFFFF'),
          borderColor: IS_WEB ? '#E2E8F0' : (isDark ? '#334155' : '#E2E8F0'),
        },
      ]}
      value={value}
      onChangeText={onChangeText}
      placeholderTextColor={IS_WEB ? '#94A3B8' : (isDark ? '#64748b' : '#94a3b8')}
      autoCapitalize={autoCapitalize ?? 'sentences'}
    />
  </View>
);

const MarkList = ({ title, items, colors, isDark, pending }) => (
  <View style={styles.listSection}>
    <Text style={[styles.listTitle, { color: colors.text }]}>{title}</Text>
    {items.map((item) => (
      <View
        key={item.id}
        style={[
          styles.listRow,
          { backgroundColor: isDark ? '#1e293b' : colors.card, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.listRoll, { color: colors.text }]}>{item.studentId}</Text>
        {item.studentName ? (
          <Text style={[styles.listMeta, { color: isDark ? '#94a3b8' : '#64748b' }]}>
            {item.studentName}
          </Text>
        ) : null}
        <Text style={[styles.listStatus, { color: pending ? '#f59e0b' : '#22c55e' }]}>
          {pending ? 'Pending sync' : 'Synced'}
        </Text>
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    zIndex: 2,
  },
  backBtn: { width: 40, alignItems: 'flex-start' },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  headerTitle: { fontSize: 17, fontWeight: '800' },
  modeChip: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    marginBottom: 6,
  },
  modeChipText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.4, textTransform: 'uppercase' },
  cameraWrap: { flex: 1, position: 'relative' },
  camera: { flex: 1 },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  viewfinder: {
    width: 220,
    height: 220,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: '#fff',
  },
  cornerTL: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 8 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 8 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 8 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 8 },
  cameraHint: {
    marginTop: 24,
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  manualFab: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: 'rgba(15,23,42,0.85)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  manualFabText: { color: '#f8fafc', fontSize: 13, fontWeight: '700' },
  permissionBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 12,
  },
  permissionTitle: { fontSize: 18, fontWeight: '800', textAlign: 'center' },
  permissionMsg: { fontSize: 14, lineHeight: 20, textAlign: 'center' },
  permissionBtn: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },
  permissionBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  permissionLink: { marginTop: 8 },
  permissionLinkText: { fontSize: 14, fontWeight: '700' },
  studentCardStandalone: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  studentCard: {
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  studentCardOverCamera: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  successIconWrap: { marginBottom: 8 },
  cardSpinner: { marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: '800', textAlign: 'center', marginBottom: 4 },
  cardSubtitle: { fontSize: 13, textAlign: 'center', marginBottom: 10 },
  confirmRoll: { fontSize: 24, fontWeight: '900', letterSpacing: 0.5, marginTop: 4 },
  confirmMeta: { fontSize: 14, marginTop: 4, textAlign: 'center' },
  activityInput: {
    minHeight: 80,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 12,
    fontSize: 15,
    textAlignVertical: 'top',
  },
  syncNote: { fontSize: 12, fontWeight: '700', marginTop: 12, textAlign: 'center' },
  reviewActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
    alignSelf: 'stretch',
  },
  reviewCancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
  },
  reviewCancelText: { fontSize: 15, fontWeight: '700' },
  reviewApproveBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 999,
    alignItems: 'center',
  },
  reviewApproveText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  scanAnotherBtn: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: 999,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  scanAnotherText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  scroll: { paddingHorizontal: 20, paddingBottom: 32 },
  subtitle: { fontSize: 14, lineHeight: 20, marginBottom: 16, textAlign: 'center' },
  offlineChip: {
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  offlineChipText: { fontSize: 12, fontWeight: '700', textAlign: 'center' },
  field: { marginBottom: 14 },
  label: { fontSize: 12, fontWeight: '700', marginBottom: 6, textTransform: 'uppercase' },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '600',
  },
  markBtn: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  btnDisabled: { opacity: 0.7 },
  markBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  backToScan: { alignItems: 'center', marginBottom: 20 },
  backToScanText: { fontSize: 14, fontWeight: '700' },
  listSection: { marginBottom: 20 },
  listTitle: { fontSize: 13, fontWeight: '800', marginBottom: 10, letterSpacing: 0.3 },
  listRow: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  listRoll: { fontSize: 15, fontWeight: '800' },
  listMeta: { fontSize: 13, marginTop: 2 },
  listStatus: { fontSize: 11, fontWeight: '800', marginTop: 6, textTransform: 'uppercase' },
  todayStrip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(148,163,184,0.35)',
  },
  todayStripText: { fontSize: 12, fontWeight: '700', textAlign: 'center' },
});
