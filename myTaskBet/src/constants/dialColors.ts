import {Difficulty} from '../services/TaskApi';
import {TaskPeriod} from './period';

/** Period arc: cool → warm by horizon length. */
export const PERIOD_DIAL_COLOR: Record<TaskPeriod, string> = {
  daily: '#0d9488',
  weekly: '#4f46e5',
  monthly: '#7c3aed',
};

export const DIFFICULTY_DIAL_COLOR: Record<Difficulty, string> = {
  easy: '#16a34a',
  medium: '#ca8a04',
  hard: '#dc2626',
};

/** Measurability ink steps (light → dark along the arc). */
export const MEASURABILITY_SEGMENT_COLORS = [
  '#a8a29e',
  '#78716c',
  '#57534e',
  '#44403c',
  '#292524',
] as const;

export function measurabilitySegmentColor(index: number): string {
  const palette = MEASURABILITY_SEGMENT_COLORS;
  return palette[Math.min(index, palette.length - 1)] ?? palette[0];
}

export const FORM_NEUTRAL = {
  shellBg: '#ffffff',
  shellBorder: '#e2e8f0',
  title: '#64748b',
  primaryButton: '#2563eb',
} as const;
