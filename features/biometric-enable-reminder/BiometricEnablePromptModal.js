import React from 'react';
import { AppleAlertModal } from '../../components/AppleAlertModal';
import { BIOMETRIC_ENABLE_COPY } from './constants';

export const BiometricEnablePromptModal = ({
  visible,
  colors,
  isDark,
  biometricLabel,
  enabling,
  onEnable,
  onNotNow,
}) => {
  const label = biometricLabel ?? 'Biometrics';

  return (
    <AppleAlertModal
      visible={visible}
      colors={colors}
      isDark={isDark}
      title={BIOMETRIC_ENABLE_COPY.postMpinTitle}
      message={BIOMETRIC_ENABLE_COPY.postMpinMessage(label)}
      dismissOnBackdrop={false}
      onRequestClose={onNotNow}
      buttons={[
        {
          label: BIOMETRIC_ENABLE_COPY.postMpinNotNow,
          style: 'cancel',
          onPress: () => {
            if (!enabling) onNotNow?.();
          },
        },
        {
          label: enabling ? '…' : BIOMETRIC_ENABLE_COPY.postMpinEnable,
          style: 'default',
          onPress: () => {
            if (!enabling) onEnable?.();
          },
        },
      ]}
    />
  );
};
