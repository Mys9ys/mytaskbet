export const CATEGORY_LIST = [
  'habits',
  'daily_tasks',
  'goals',
  'challenges',
  'work',
  'personal',
  'shopping',
  'health',
  'education',
  'other',
] as const;

export type TaskCategory = (typeof CATEGORY_LIST)[number];

export const CATEGORY_META: Record<TaskCategory, {label: string; color: string}> = {
  habits:        {label: 'Привычки',   color: '#33a02c'},
  daily_tasks:   {label: 'Ежедневно',  color: '#1f78b4'},
  goals:         {label: 'Цели',       color: '#6a3d9a'},
  challenges:    {label: 'Челленджи',  color: '#ff7f00'},
  work:          {label: 'Работа',     color: '#005f73'},
  personal:      {label: 'Личное',     color: '#0a9396'},
  shopping:      {label: 'Покупки',    color: '#e31a1c'},
  health:        {label: 'Здоровье',   color: '#ee9b00'},
  education:     {label: 'Обучение',   color: '#9b5de5'},
  other:         {label: 'Другое',     color: '#6c757d'},
};

export function getCategoryLabel(cat: TaskCategory | string): string {
  return (CATEGORY_META as any)[cat]?.label ?? String(cat);
}

export function getCategoryColor(cat: TaskCategory | string): string {
  return (CATEGORY_META as any)[cat]?.color ?? CATEGORY_META.other.color;
}

export function isTaskCategory(v: any): v is TaskCategory {
  return typeof v === 'string' && (CATEGORY_LIST as readonly string[]).includes(v);
}
