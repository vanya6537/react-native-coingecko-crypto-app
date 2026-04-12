// Polyfills for i18next (MUST be before i18n import)
import '@formatjs/intl-pluralrules/polyfill-force';
import '@formatjs/intl-pluralrules/locale-data/en';
import '@formatjs/intl-pluralrules/locale-data/ru';
import '@formatjs/intl-getcanonicallocales/polyfill-force';
import '@formatjs/intl-locale/polyfill-force';

import { AppRegistry } from 'react-native';
import './src/shared/i18n'; // Initialize i18n before app loads
import { App } from './src/app/App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
