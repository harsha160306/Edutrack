import React from 'react';
import { AppleAlertModal } from '../../../components/AppleAlertModal';
import { MPIN_PROMPT } from '../constants';

/**
 * Post-login MPIN prompt — native iOS-style alert (Cancel | Create).
 */
export const MpinSetupPromptModal = ({
  visible,
  colors,
  isDark = true,
  onSetup,
  onLater,
}) => (
  <AppleAlertModal
    visible={visible}
    title={MPIN_PROMPT.title}
    message={MPIN_PROMPT.message}
    colors={colors}
    isDark={isDark}
    dismissOnBackdrop={false}
    buttons={[
      { label: MPIN_PROMPT.laterLabel, onPress: onLater, style: 'destructive' },
      { label: MPIN_PROMPT.setupLabel, onPress: onSetup, style: 'default' },
    ]}
  />
);
