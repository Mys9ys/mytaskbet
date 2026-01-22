import {Task, TaskCategory} from './TaskService';

// Цвета для категорий
export const CATEGORY_COLORS = {
  work: '#1f78b4',
  personal: '#33a02c',
  shopping: '#e31a1c',
  health: '#ff7f00',
  education: '#6a3d9a',
  other: '#b15928',
};

// Названия категорий
export const CATEGORY_NAMES = {
  work: 'Work',
  personal: 'Personal',
  shopping: 'Shopping',
  health: 'Health',
  education: 'Education',
  other: 'Other',
};

// Получить цвет категории
export function getCategoryColor(category: TaskCategory): string {
  return CATEGORY_COLORS[category];
}

// Получить название категории
export function getCategoryName(category: TaskCategory): string {
  return CATEGORY_NAMES[category];
}

// Фильтрация задач по категории
export function filterTasksByCategory(tasks: Task[], category: TaskCategory | 'all'): Task[] {
  if (category === 'all') {
    return tasks;
  }
  return tasks.filter(task => task.category === category);
}

// Группировка задач по категориям
export function groupTasksByCategory(tasks: Task[]): Record<TaskCategory, Task[]> {
  const groups = {
    work: [],
    personal: [],
    shopping: [],
    health: [],
    education: [],
    other: [],
  };
  
  tasks.forEach(task => {
    groups[task.category].push(task);
  });
  
  return groups;
}