import {TaskCategory, CATEGORY_LIST, CATEGORY_META, getCategoryColor, getCategoryLabel} from '../types/categories';
import {UserTask} from '../services/TaskApi';

export {TaskCategory, CATEGORY_LIST, getCategoryColor, getCategoryLabel};

export type Task = UserTask;

export const CATEGORY_NAMES: Record<string, string> = Object.fromEntries(
  CATEGORY_LIST.map(c => [c, CATEGORY_META[c].label]),
);

export const CATEGORY_COLORS: Record<string, string> = Object.fromEntries(
  CATEGORY_LIST.map(c => [c, CATEGORY_META[c].color]),
);

export function getCategoryName(cat: TaskCategory | string | undefined): string {
  return getCategoryLabel(cat ?? 'other');
}

export function filterTasksByCategory(tasks: Task[], category: TaskCategory | 'all'): Task[] {
  if (category === 'all') return tasks;
  return tasks.filter(t => t.category === category);
}

export function difficultyLabel(d: string): string {
  switch (d) {
    case 'easy':
      return 'Лёгкая · 20';
    case 'medium':
      return 'Средняя · 50';
    case 'hard':
      return 'Сложная · 100';
    default:
      return d;
  }
}

export default filterTasksByCategory;
