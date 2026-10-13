import * as React from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

type Props = {
  visible: boolean;
  min: string;
  max: string;
  value: string;
  unit: string;
  onChangeMin: (s: string) => void;
  onChangeMax: (s: string) => void;
  onChangeValue: (s: string) => void;
  onChangeUnit: (s: string) => void;
  onCancel: () => void;
  onSave: () => void;
};

function FieldRow({
  label,
  value,
  onChangeText,
  keyboardType = 'default',
  hint,
}: {
  label: string;
  value: string;
  onChangeText: (s: string) => void;
  keyboardType?: 'default' | 'number-pad';
  hint?: string;
}) {
  return (
    <View style={styles.fieldBlock}>
      <View style={styles.fieldHead}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <Text style={styles.pencil} accessibilityElementsHidden>
          ✎
        </Text>
      </View>
      {hint ? <Text style={styles.fieldHint}>{hint}</Text> : null}
      <TextInput
        style={styles.fieldInput}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
      />
    </View>
  );
}

export default function MeasurabilityEditModal({
  visible,
  min,
  max,
  value,
  unit,
  onChangeMin,
  onChangeMax,
  onChangeValue,
  onChangeUnit,
  onCancel,
  onSave,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Измеримость</Text>
          <Text style={styles.subtitle}>
            Диапазон шкалы, текущее значение и единица — позже подтянем из справочника.
          </Text>

          <View style={styles.row2}>
            <View style={styles.half}>
              <FieldRow
                label="Мин."
                value={min}
                onChangeText={onChangeMin}
                keyboardType="number-pad"
              />
            </View>
            <View style={styles.half}>
              <FieldRow
                label="Макс."
                value={max}
                onChangeText={onChangeMax}
                keyboardType="number-pad"
              />
            </View>
          </View>

          <FieldRow
            label="Сейчас"
            value={value}
            onChangeText={onChangeValue}
            keyboardType="number-pad"
            hint="Попадает на дугу между делениями"
          />

          <FieldRow
            label="Единица"
            value={unit}
            onChangeText={onChangeUnit}
            hint="Например: стр., мин., км"
          />

          <View style={styles.actions}>
            <TouchableOpacity onPress={onCancel}>
              <Text style={styles.cancel}>Отмена</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onSave}>
              <Text style={styles.save}>Готово</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    maxHeight: '90%',
  },
  title: {fontSize: 17, fontWeight: '800', color: '#334155'},
  subtitle: {fontSize: 12, color: '#94a3b8', marginTop: 4, marginBottom: 14},
  row2: {flexDirection: 'row', gap: 10},
  half: {flex: 1},
  fieldBlock: {marginBottom: 12},
  fieldHead: {flexDirection: 'row', alignItems: 'center', marginBottom: 4},
  fieldLabel: {fontSize: 12, fontWeight: '800', color: '#64748b', flex: 1},
  pencil: {fontSize: 14, color: '#94a3b8'},
  fieldHint: {fontSize: 10, color: '#94a3b8', marginBottom: 4},
  fieldInput: {
    borderWidth: 1,
    borderColor: '#d6d3d1',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 20,
  },
  cancel: {fontSize: 15, color: '#64748b', fontWeight: '600'},
  save: {fontSize: 15, color: '#2563eb', fontWeight: '800'},
});
