import api from './api';
import {TaskCategory} from '../types/categories';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface TaskTemplate {
  id: number;
  title: string;
  description?: string;
  category?: TaskCategory | string;
  average_bid: number;
  max_allowed_bid: number;
  usage_count: number;
  fund_balance: number;
  completion_count: number;
  created_at: string;
  updated_at?: string;
}

export interface UserTask {
  id: number;
  user_id: number;
  template_id?: number | null;
  title: string;
  description?: string;
  category?: TaskCategory | string;
  bid_amount: number;
  difficulty: Difficulty;
  outcome?: string | null;
  is_completed: boolean;
  completion_date?: string | null;
  streak_count: number;
  created_at: string;
  updated_at?: string | null;
}

export type TaskFilterStatus = 'all' | 'active' | 'completed';

class TaskApi {
  async listMyTasks(params?: {
    status?: TaskFilterStatus;
    category?: TaskCategory | string;
  }): Promise<UserTask[]> {
    const resp = await api.get<UserTask[]>('/tasks/my-tasks', {params: params ?? {}});
    return resp.data;
  }

  async getMyTask(taskId: number): Promise<UserTask> {
    const resp = await api.get<UserTask>(`/tasks/my-tasks/${taskId}`);
    return resp.data;
  }

  async createMyTask(body: {
    title: string;
    description?: string;
    category?: TaskCategory | string;
    difficulty: Difficulty;
    template_id?: number;
  }): Promise<UserTask> {
    const resp = await api.post<UserTask>('/tasks/my-tasks', body);
    return resp.data;
  }

  async complete(taskId: number): Promise<UserTask> {
    const resp = await api.put<UserTask>(`/tasks/my-tasks/${taskId}/complete`);
    return resp.data;
  }

  async fail(taskId: number): Promise<UserTask> {
    const resp = await api.put<UserTask>(`/tasks/my-tasks/${taskId}/fail`);
    return resp.data;
  }
}

export default new TaskApi();
