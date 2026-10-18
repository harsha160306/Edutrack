import { Alert, Linking } from 'react-native';
import { SEARCH_COPY } from './constants';

const openUrl = async (url, unavailableMessage) => {
  try {
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      Alert.alert(SEARCH_COPY.contactUnavailableTitle, unavailableMessage);
      return;
    }
    await Linking.openURL(url);
  } catch {
    Alert.alert(SEARCH_COPY.contactUnavailableTitle, unavailableMessage);
  }
};

export const dialPhone = (phone) => {
  const digits = String(phone ?? '').replace(/\s/g, '');
  if (!digits) {
    Alert.alert(SEARCH_COPY.contactUnavailableTitle, SEARCH_COPY.contactNoPhone);
    return;
  }
  openUrl(`tel:${digits}`, SEARCH_COPY.contactDialFailed);
};

export const sendEmail = (email) => {
  const address = String(email ?? '').trim();
  if (!address) {
    Alert.alert(SEARCH_COPY.contactUnavailableTitle, SEARCH_COPY.contactNoEmail);
    return;
  }
  openUrl(`mailto:${address}`, SEARCH_COPY.contactEmailFailed);
};
