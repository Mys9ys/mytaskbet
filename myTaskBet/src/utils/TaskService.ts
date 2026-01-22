import AsyncStorage from '@react-native-async-storage/async-storage';

export type TaskCategory = 'work' | 'personal' | 'shopping' | 'health' | 'education' | 'other';

export type Task = {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  category: TaskCategory;
  createdAt: string;
  updatedAt: string;
};

const TASKS_STORAGE_KEY = '@tasks';

class TaskService {
  // Получить все задачи
  async getAll(): Promise<Task[]> {
    try {
      const tasksString = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
      if (tasksString !== null) {
        return JSON.parse(tasksString);
      }
      return [];
    } catch (error) {
      console.error('Error getting tasks:', error);
      return [];
    }
  }

  // Получить задачу по ID
  async getById(id: string): Promise<Task | null> {
    const tasks = await this.getAll();
    return tasks.find(task => task.id === id) || null;
  }

  // Создать новую задачу
  async create(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const now = new Date().toISOString();
    const newTask: Task = {
      id: Date.now().toString(),
      ...taskData,
      category: taskData.category || 'other',
      createdAt: now,
      updatedAt: now,
    };
    
    const tasks = await this.getAll();
    tasks.push(newTask);
    
    await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    
    return newTask;
  }

  // Обновить задачу
  async update(id: string, taskData: Partial<Omit<Task, 'id' | 'createdAt'>>): Promise<Task | null> {
    const tasks = await this.getAll();
    const taskIndex = tasks.findIndex(task => task.id === id);
    
    if (taskIndex === -1) {
      return null;
    }
    
    const updatedTask = {
      ...tasks[taskIndex],
      ...taskData,
      updatedAt: new Date().toISOString(),
    };
    
    tasks[taskIndex] = updatedTask;
    
    await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    
    return updatedTask;
  }

  // Удалить задачу
  async delete(id: string): Promise<boolean> {
    const tasks = await this.getAll();
    const newTasks = tasks.filter(task => task.id !== id);
    
    if (newTasks.length === tasks.length) {
      return false; // Задача не найдена
    }
    
    await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(newTasks));
    return true;
  }
}

export default new TaskService();