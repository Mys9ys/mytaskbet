import {Platform} from 'react-native';

/** Android emulator → host machine localhost */
export const API_BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:8000/api'
    : 'http://127.0.0.1:8000/api';
