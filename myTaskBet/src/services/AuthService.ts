import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

export interface User {
  id: number;
  username: string;
  email: string;
  points: number;
  negative_points: number;
  total_earned_points: number;
  streak_count: number;
  max_streak: number;
  task_slots: number;
  achievement_points: number;
  created_at: string;
  profile_data: Record<string, any>;
}

export interface AuthTokens {
  access_token: string;
  token_type: string;
}

const TOKEN_KEY = '@jwt_token';
const USER_KEY = '@current_user';

class AuthService {
  async register(data: {username: string; email: string; password: string}): Promise<User> {
    const resp = await api.post<User>('/auth/register', data);
    return resp.data;
  }

  async login(data: {username: string; password: string}): Promise<User> {
    const resp = await api.post<AuthTokens>('/auth/login', data);
    const {access_token} = resp.data;
    await AsyncStorage.setItem(TOKEN_KEY, access_token);
    const me = await this.fetchMe();
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(me));
    return me;
  }

  async fetchMe(): Promise<User> {
    const resp = await api.get<User>('/auth/me');
    return resp.data;
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const raw = await AsyncStorage.getItem(USER_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }

  async refreshMe(): Promise<User> {
    const me = await this.fetchMe();
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(me));
    return me;
  }

  async getToken(): Promise<string | null> {
    return AsyncStorage.getItem(TOKEN_KEY);
  }

  async logout(): Promise<void> {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }
}

export default new AuthService();
