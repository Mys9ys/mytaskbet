import TaskApi, {
  UserTask,
  TaskTemplate,
  TaskFilterStatus,
  Difficulty,
} from '../services/TaskApi';
import {TaskCategory} from '../types/categories';
import {TaskPeriod} from '../constants/period';

export type Task = UserTask;
export type {TaskTemplate, TaskFilterStatus, TaskCategory, Difficulty};

export type CreateTaskInput = {
  title: string;
  description?: string;
  category?: TaskCategory | string;
  difficulty: Difficulty;
  period?: TaskPeriod;
  template_id?: number;
};

class TaskService {
  async getAll(status: TaskFilterStatus = 'active'): Promise<Task[]> {
    return TaskApi.listMyTasks({status});
  }

  async getById(id: number | string): Promise<Task | null> {
    if (id === 'new') return null;
    const num = typeof id === 'string' ? parseInt(id, 10) : id;
    if (Number.isNaN(num)) return null;
    return TaskApi.getMyTask(num);
  }

  async create(data: CreateTaskInput): Promise<Task> {
    return TaskApi.createMyTask(data);
  }

  async complete(taskId: number): Promise<Task> {
    return TaskApi.complete(taskId);
  }

  async fail(taskId: number): Promise<Task> {
    return TaskApi.fail(taskId);
  }
}

export default new TaskService();
