import {Difficulty} from '../services/TaskApi';

export const STAKE_BY_DIFFICULTY: Record<Difficulty, number> = {
  easy: 20,
  medium: 50,
  hard: 100,
};

export const DIFFICULTY_OPTIONS: {id: Difficulty; title: string}[] = [
  {id: 'easy', title: 'Лёгкая'},
  {id: 'medium', title: 'Средняя'},
  {id: 'hard', title: 'Тяжёлая'},
];

export function difficultyDisplay(d: Difficulty | string): string {
  const id = (d === 'easy' || d === 'medium' || d === 'hard' ? d : 'easy') as Difficulty;
  const opt = DIFFICULTY_OPTIONS.find(o => o.id === id)!;
  return `${opt.title} (${STAKE_BY_DIFFICULTY[id]})`;
}
