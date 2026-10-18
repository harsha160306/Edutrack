import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';

import { applyGlobalTypography } from './features/typography';

applyGlobalTypography();

import App from './App';

registerRootComponent(App);
