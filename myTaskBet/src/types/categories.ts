/** MVP categories — each can grow its own form extras later. */
export const CATEGORY_LIST = ['reading', 'sports'] as const;

export type TaskCategory = (typeof CATEGORY_LIST)[number];

export type CategoryMeta = {
  label: string;
  /** Saturated accent (left rail, selected chip, controls) */
  color: string;
  /** Soft fill behind the form shell */
  soft: string;
  emoji: string;
};

export const CATEGORY_META: Record<TaskCategory, CategoryMeta> = {
  reading: {
    label: 'Чтение',
    /** Sepia / old book binding */
    color: '#8b5e34',
    /** Aged paper */
    soft: '#f4ecd8',
    emoji: '📖',
  },
  sports: {
    label: 'Физкультура',
    color: '#ea580c',
    soft: '#fff7ed',
    emoji: '🏃',
  },
};

export function getCategoryMeta(cat: TaskCategory | string): CategoryMeta {
  return (
    (CATEGORY_META as Record<string, CategoryMeta>)[cat] ?? {
      label: String(cat),
      color: '#6c757d',
      soft: '#f1f5f9',
      emoji: '•',
    }
  );
}

export function getCategoryLabel(cat: TaskCategory | string): string {
  return getCategoryMeta(cat).label;
}

export function getCategoryColor(cat: TaskCategory | string): string {
  return getCategoryMeta(cat).color;
}

export function getCategoryEmoji(cat: TaskCategory | string): string {
  return getCategoryMeta(cat).emoji;
}

export function categoryChipLabel(cat: TaskCategory | string): string {
  const m = getCategoryMeta(cat);
  return `${m.emoji} ${m.label}`;
}

export function isTaskCategory(v: any): v is TaskCategory {
  return typeof v === 'string' && (CATEGORY_LIST as readonly string[]).includes(v);
}
