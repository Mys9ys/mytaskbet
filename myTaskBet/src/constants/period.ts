export const PERIOD_LIST = ['daily', 'weekly', 'monthly'] as const;
export type TaskPeriod = (typeof PERIOD_LIST)[number];

export const PERIOD_LABELS: Record<TaskPeriod, string> = {
  daily: 'Ежедневная',
  weekly: 'Еженедельная',
  monthly: 'Ежемесячная',
};

export const PERIOD_SHORT_LABELS: Record<TaskPeriod, string> = {
  daily: 'День',
  weekly: 'Неделя',
  monthly: 'Месяц',
};

export function periodLabel(p: TaskPeriod | string | undefined): string {
  if (p && p in PERIOD_LABELS) {
    return PERIOD_LABELS[p as TaskPeriod];
  }
  return PERIOD_LABELS.daily;
}
