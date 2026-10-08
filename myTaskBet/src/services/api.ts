import axios, {AxiosInstance, InternalAxiosRequestConfig} from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {API_BASE_URL as CONFIG_URL} from '../config';

export const API_BASE_URL = CONFIG_URL;

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await AsyncStorage.getItem('@jwt_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn('[api] Failed to attach token:', e);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        await AsyncStorage.multiRemove(['@jwt_token', '@current_user']);
      } catch (e) {
        console.warn('[api] Failed to clear auth storage:', e);
      }
    }
    return Promise.reject(error);
  },
);

export default api;
