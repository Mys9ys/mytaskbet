import {TaskCategory} from '../types/categories';
import {TaskPeriod} from './period';

export type MeasurabilityUnit = 'pages' | 'minutes' | 'km';

export type MeasurabilityStep = {
  id: string;
  value: number;
  shortLabel: string;
  label: string;
};

export type MeasurabilityProfile = {
  unit: MeasurabilityUnit;
  defaultUnitLabel: string;
  dialTitle: string;
  defaultMin: number;
  defaultMax: number;
  defaultValue: number;
};

/** Category defaults — later overridden per activity from dictionary. */
export const MEASURABILITY: Record<TaskCategory, MeasurabilityProfile> = {
  reading: {
    unit: 'pages',
    defaultUnitLabel: 'стр.',
    dialTitle: 'Измеримость',
    defaultMin: 10,
    defaultMax: 100,
    defaultValue: 20,
  },
  sports: {
    unit: 'minutes',
    defaultUnitLabel: 'мин.',
    dialTitle: 'Измеримость',
    defaultMin: 15,
    defaultMax: 90,
    defaultValue: 30,
  },
};

const TICK_COUNT = 5;

export function getMeasurability(category: TaskCategory): MeasurabilityProfile {
  return MEASURABILITY[category];
}

export function buildMeasureSteps(min: number, max: number): MeasurabilityStep[] {
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  if (hi <= lo) {
    return [{id: String(lo), value: lo, shortLabel: String(lo), label: String(lo)}];
  }
  const steps: MeasurabilityStep[] = [];
  for (let i = 0; i < TICK_COUNT; i++) {
    const t = i / (TICK_COUNT - 1);
    const raw = lo + t * (hi - lo);
    const value = Math.round(raw);
    const id = String(value);
    steps.push({
      id,
      value,
      shortLabel: id,
      label: String(value),
    });
  }
  return steps;
}

export function defaultMeasurabilityValue(category: TaskCategory): number {
  return getMeasurability(category).defaultValue;
}

export function clampMeasureValue(n: number, min: number, max: number): number {
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  if (!Number.isFinite(n)) {
    return lo;
  }
  return Math.min(hi, Math.max(lo, Math.round(n)));
}

export function nearestStepId(steps: MeasurabilityStep[], value: number): string {
  let best = steps[0]?.id ?? '1';
  let dist = Infinity;
  for (const s of steps) {
    const d = Math.abs(s.value - value);
    if (d < dist) {
      dist = d;
      best = s.id;
    }
  }
  return best;
}

export function formatMeasureDescription(
  value: number,
  unitLabel: string,
  category: TaskCategory,
  _period: TaskPeriod,
): string {
  const u = unitLabel.trim() || getMeasurability(category).defaultUnitLabel;
  if (category === 'reading') {
    return `${value} ${u} в день`;
  }
  return `${value} ${u} за период`;
}
