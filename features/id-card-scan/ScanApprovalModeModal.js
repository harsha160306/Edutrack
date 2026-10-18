import React from 'react';
import { AppleAlertModal } from '../../components/AppleAlertModal';
import { SCAN_COPY } from './constants';

export const ScanApprovalModeModal = ({
  visible,
  colors,
  isDark,
  onCancel,
  onSelectAuto,
  onSelectManual,
}) => (
  <AppleAlertModal
    visible={visible}
    title={SCAN_COPY.approvalTitle}
    message={SCAN_COPY.approvalMessage}
    colors={colors}
    isDark={isDark}
    dismissOnBackdrop
    onRequestClose={onCancel}
    buttons={[
      { label: SCAN_COPY.approvalAuto, style: 'default', onPress: onSelectAuto },
      { label: SCAN_COPY.approvalManual, style: 'cancel', onPress: onSelectManual },
    ]}
  />
);
