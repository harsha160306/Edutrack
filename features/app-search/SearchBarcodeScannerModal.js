import React, { useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { X, ScanLine } from 'lucide-react-native';
import { parseStudentIdPayload } from '../id-card-scan/parseStudentIdPayload';
import { SEARCH_COPY } from './constants';

const IS_WEB = Platform.OS === 'web';
const SCAN_COOLDOWN_MS = 1800;

const BARCODE_TYPES = ['qr', 'code128', 'code39', 'ean13', 'ean8', 'upc_a', 'upc_e'];

export const SearchBarcodeScannerModal = ({
  visible,
  colors,
  isDark,
  onClose,
  onScanned,
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const scanLockRef = useRef(false);
  const lastScanAtRef = useRef(0);

  const handleBarcodeScanned = useCallback(
    ({ data }) => {
      if (!visible || scanLockRef.current) return;
      const now = Date.now();
      if (now - lastScanAtRef.current < SCAN_COOLDOWN_MS) return;
      lastScanAtRef.current = now;

      const parsed = parseStudentIdPayload(data);
      if (!parsed?.studentId) {
        Alert.alert(SEARCH_COPY.scanInvalidTitle, SEARCH_COPY.scanInvalidMessage);
        return;
      }

      scanLockRef.current = true;
      onScanned?.(parsed);
      onClose?.();
      scanLockRef.current = false;
    },
    [visible, onScanned, onClose],
  );

  React.useEffect(() => {
    if (!visible) return;
    scanLockRef.current = false;
    lastScanAtRef.current = 0;

    (async () => {
      if (IS_WEB) {
        Alert.alert(SEARCH_COPY.scanUnavailableTitle, SEARCH_COPY.scanUnavailableMessage);
        onClose?.();
        return;
      }
      if (!permission?.granted) {
        const result = await requestPermission();
        if (!result.granted) {
          Alert.alert(SEARCH_COPY.scanPermissionTitle, SEARCH_COPY.scanPermissionMessage);
          onClose?.();
        }
      }
    })();
  }, [visible, permission?.granted, onClose, requestPermission]);

  const showCamera = !IS_WEB && visible && permission?.granted;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView
        style={[styles.root, { backgroundColor: colors.background }]}
        edges={['top', 'bottom']}
      >
        <View style={styles.topBar}>
          <Text style={[styles.title, { color: colors.text }]}>{SEARCH_COPY.scanTitle}</Text>
          <TouchableOpacity
            onPress={onClose}
            style={[
              styles.closeBtn,
              { backgroundColor: isDark ? '#1e293b' : colors.card, borderColor: colors.border },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Close scanner"
          >
            <X size={22} color={colors.text} strokeWidth={2.4} />
          </TouchableOpacity>
        </View>

        {showCamera ? (
          <View style={styles.cameraWrap}>
            <CameraView
              style={styles.camera}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: BARCODE_TYPES }}
              onBarcodeScanned={handleBarcodeScanned}
            />
            <View style={styles.overlay} pointerEvents="none">
              <View style={styles.viewfinder}>
                <View style={[styles.corner, styles.cornerTL]} />
                <View style={[styles.corner, styles.cornerTR]} />
                <View style={[styles.corner, styles.cornerBL]} />
                <View style={[styles.corner, styles.cornerBR]} />
              </View>
              <Text style={styles.hint}>{SEARCH_COPY.scanHint}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.placeholder}>
            <ScanLine size={40} color={colors.textMuted} strokeWidth={2} />
            <Text style={[styles.placeholderText, { color: colors.textMuted }]}>
              {permission?.granted === false
                ? SEARCH_COPY.scanPermissionMessage
                : SEARCH_COPY.scanLoading}
            </Text>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const CORNER = { width: 22, height: 22, borderColor: '#fff' };

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  title: { fontSize: 17, fontWeight: '700', letterSpacing: -0.2 },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraWrap: { flex: 1, position: 'relative' },
  camera: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  viewfinder: {
    width: 260,
    height: 160,
    position: 'relative',
  },
  corner: { position: 'absolute', ...CORNER },
  cornerTL: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3 },
  hint: {
    marginTop: 20,
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 32,
  },
  placeholderText: { fontSize: 14, fontWeight: '500', textAlign: 'center', lineHeight: 20 },
});
