import * as React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {TaskPeriod, PERIOD_SHORT_LABELS} from '../constants/period';

type Props = {
  stake: number;
  period: TaskPeriod | string | undefined;
  volume: string;
  /** Category accent — border only */
  borderAccent: string;
};

/** Compact «обязательство» row for task cards (stake · period · volume). */
export default function TaskCommitmentStrip({
  stake,
  period,
  volume,
  borderAccent,
}: Props) {
  const p =
    period && period in PERIOD_SHORT_LABELS
      ? PERIOD_SHORT_LABELS[period as TaskPeriod]
      : PERIOD_SHORT_LABELS.daily;

  return (
    <View style={[styles.box, {borderColor: borderAccent}]}>
      <Text style={styles.heading}>Обязательство</Text>
      <View style={styles.row}>
        <View style={styles.cell}>
          <Text style={styles.cellLabel}>Ставка</Text>
          <Text style={styles.stakeValue}>{stake}</Text>
        </View>
        <View style={styles.cell}>
          <Text style={styles.cellLabel}>Период</Text>
          <Text style={styles.cellValue}>{p}</Text>
        </View>
        <View style={styles.cell}>
          <Text style={styles.cellLabel}>Объём</Text>
          <Text style={styles.cellValue} numberOfLines={2}>
            {volume}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    marginTop: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 2,
    backgroundColor: '#fafafa',
  },
  heading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  cell: {flex: 1, minWidth: 0},
  cellLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 2,
  },
  stakeValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#b45309',
  },
  cellValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
});
