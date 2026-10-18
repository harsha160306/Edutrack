import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import { ScanLine } from 'lucide-react-native';
import { AppleAlertModal } from '../../components/AppleAlertModal';
import { SCAN_COPY } from './constants';

export const MarkLatecomerPromptModal = ({
  visible,
  colors,
  isDark,
  onCancel,
  onConfirmScan,
}) => {
  const { width } = useWindowDimensions();
  const compact = width < 380;
  const iconSize = compact ? 46 : 52;

  return (
  <AppleAlertModal
    visible={visible}
    title={SCAN_COPY.promptTitle}
    message={SCAN_COPY.promptMessage}
    colors={colors}
    isDark={isDark}
    dismissOnBackdrop
    onRequestClose={onCancel}
    icon={
      <View
        style={{
          width: iconSize,
          height: iconSize,
          borderRadius: iconSize / 2,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isDark ? 'rgba(249, 115, 22, 0.2)' : '#FFF7ED',
        }}
      >
        <ScanLine color={colors.secondary} size={compact ? 22 : 26} strokeWidth={2.2} />
      </View>
    }
    buttons={[
      { label: SCAN_COPY.promptCancel, style: 'cancel', onPress: onCancel },
      { label: SCAN_COPY.promptContinue, style: 'default', onPress: onConfirmScan },
    ]}
  />
  );
};
