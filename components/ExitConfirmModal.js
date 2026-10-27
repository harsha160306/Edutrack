import { Platform, BackHandler } from 'react-native';

import { AppleAlertModal } from './AppleAlertModal';

export const ExitConfirmModal = ({ visible, colors, isDark = true, onCancel, onConfirm }) => (
  <AppleAlertModal
    visible={visible}
    title="Exit app?"
    message="Do you want to exit MIC EduTrack?"
    colors={colors}
    isDark={isDark}
    blurBackground
    onRequestClose={onCancel}
    buttons={[
      { label: 'Cancel', style: 'cancel', onPress: onCancel },
      { label: 'Exit', style: 'destructive', onPress: onConfirm },
    ]}
  />
);

export const confirmAppExit = () => {
  if (Platform.OS === 'android') {
    BackHandler.exitApp();
    return;
  }
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.close();
  }
};
