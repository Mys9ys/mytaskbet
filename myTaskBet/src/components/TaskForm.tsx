import * as React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  Button,
  Alert,
  useWindowDimensions,
} from 'react-native';
import {Difficulty, CreateTaskInput} from '../utils/TaskService';
import {
  CATEGORY_LIST,
  categoryChipLabel,
  getCategoryMeta,
  TaskCategory,
} from '../types/categories';
import {DIFFICULTY_OPTIONS, difficultyDisplay} from '../constants/difficulty';
import {PERIOD_LIST, PERIOD_LABELS, TaskPeriod} from '../constants/period';
import {
  buildMeasureSteps,
  clampMeasureValue,
  formatMeasureDescription,
  getMeasurability,
  nearestStepId,
} from '../constants/measurability';
import {
  DIFFICULTY_DIAL_COLOR,
  FORM_NEUTRAL,
  measurabilitySegmentColor,
  PERIOD_DIAL_COLOR,
} from '../constants/dialColors';
import ArcSectorPicker, {ARC_CAPTION_H, ARC_TITLE_H} from './ArcSectorPicker';
import MeasurabilityEditModal from './MeasurabilityEditModal';

type TaskFormProps = {
  onSubmit: (taskData: CreateTaskInput) => void;
};

const PERIOD_ARC = PERIOD_LIST.map(p => ({
  id: p,
  label: PERIOD_LABELS[p],
  shortLabel: p === 'daily' ? 'День' : p === 'weekly' ? 'Нед' : 'Мес',
}));

const DIFF_ARC = DIFFICULTY_OPTIONS.map(o => ({
  id: o.id,
  label: difficultyDisplay(o.id),
  shortLabel: String(o.id === 'easy' ? 20 : o.id === 'medium' ? 50 : 100),
}));

const DIAL_COUNT = 3;
const DIAL_GAPS = 8;

function useTripleDialSize(shellPad: number, railW: number) {
  const {width} = useWindowDimensions();
  const body = width - 16 * 2 - shellPad * 2 - railW - DIAL_GAPS * (DIAL_COUNT - 1);
  return Math.min(112, Math.max(88, Math.floor(body / DIAL_COUNT)));
}

function applyCategoryMeasureDefaults(c: TaskCategory) {
  const p = getMeasurability(c);
  return {
    min: p.defaultMin,
    max: p.defaultMax,
    unit: p.defaultUnitLabel,
    value: p.defaultValue,
  };
}

function TaskForm({onSubmit}: TaskFormProps) {
  const dialSize = useTripleDialSize(14, 6);
  const [category, setCategory] = React.useState<TaskCategory>('reading');
  const [bookTitle, setBookTitle] = React.useState('');
  const [sportTitle, setSportTitle] = React.useState('');

  const initialM = applyCategoryMeasureDefaults('reading');
  const [measureMin, setMeasureMin] = React.useState(initialM.min);
  const [measureMax, setMeasureMax] = React.useState(initialM.max);
  const [measureUnit, setMeasureUnit] = React.useState(initialM.unit);
  const [measureAmount, setMeasureAmount] = React.useState(initialM.value);

  const [difficulty, setDifficulty] = React.useState<Difficulty>('easy');
  const [period, setPeriod] = React.useState<TaskPeriod>('daily');
  const [measureEditOpen, setMeasureEditOpen] = React.useState(false);
  const [draftMin, setDraftMin] = React.useState(String(initialM.min));
  const [draftMax, setDraftMax] = React.useState(String(initialM.max));
  const [draftVal, setDraftVal] = React.useState(String(initialM.value));
  const [draftUnit, setDraftUnit] = React.useState(initialM.unit);

  const meta = getCategoryMeta(category);
  const measureProfile = getMeasurability(category);
  const measureSteps = React.useMemo(
    () => buildMeasureSteps(measureMin, measureMax),
    [measureMin, measureMax],
  );
  const measureArc = measureSteps.map(s => ({
    id: s.id,
    label: s.label,
    shortLabel: s.shortLabel,
  }));
  const measureArcValue = nearestStepId(measureSteps, measureAmount);

  const selectCategory = (c: TaskCategory) => {
    setCategory(c);
    const d = applyCategoryMeasureDefaults(c);
    setMeasureMin(d.min);
    setMeasureMax(d.max);
    setMeasureUnit(d.unit);
    setMeasureAmount(d.value);
    if (c === 'reading') {
      setPeriod('daily');
      setDifficulty('easy');
    }
    if (c === 'sports') {
      setPeriod('daily');
      setDifficulty('medium');
    }
  };

  const onMeasureArcPress = (stepId: string) => {
    const step = measureSteps.find(s => s.id === stepId);
    if (step) {
      setMeasureAmount(step.value);
    }
  };

  const openMeasureEdit = () => {
    setDraftMin(String(measureMin));
    setDraftMax(String(measureMax));
    setDraftVal(String(measureAmount));
    setDraftUnit(measureUnit);
    setMeasureEditOpen(true);
  };

  const saveMeasureEdit = () => {
    const minN = parseInt(draftMin.replace(/[^\d]/g, ''), 10);
    const maxN = parseInt(draftMax.replace(/[^\d]/g, ''), 10);
    const valN = parseInt(draftVal.replace(/[^\d]/g, ''), 10);
    if (!Number.isFinite(minN) || !Number.isFinite(maxN)) {
      Alert.alert('Измеримость', 'Укажи корректные мин. и макс.');
      return;
    }
    const lo = Math.min(minN, maxN);
    const hi = Math.max(minN, maxN);
    if (hi - lo < 1) {
      Alert.alert('Измеримость', 'Макс. должен быть больше мин.');
      return;
    }
    setMeasureMin(lo);
    setMeasureMax(hi);
    setMeasureUnit(draftUnit.trim() || measureProfile.defaultUnitLabel);
    setMeasureAmount(
      clampMeasureValue(Number.isFinite(valN) ? valN : measureAmount, lo, hi),
    );
    setMeasureEditOpen(false);
  };

  const handleSubmit = () => {
    const amount = clampMeasureValue(measureAmount, measureMin, measureMax);
    const description = formatMeasureDescription(
      amount,
      measureUnit,
      category,
      period,
    );

    if (category === 'reading') {
      if (!bookTitle.trim()) {
        Alert.alert('Чтение', 'Укажи название книги');
        return;
      }
      onSubmit({
        title: bookTitle.trim(),
        description,
        category: 'reading',
        difficulty,
        period,
      });
      return;
    }
    if (category === 'sports') {
      if (!sportTitle.trim()) {
        Alert.alert('Физкультура', 'Напиши, что будешь делать');
        return;
      }
      onSubmit({
        title: sportTitle.trim(),
        description,
        category: 'sports',
        difficulty,
        period,
      });
    }
  };

  const dialBlockH = ARC_TITLE_H + Math.round(dialSize * 0.54) + 8;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Категория</Text>
      <View style={styles.catRow}>
        {CATEGORY_LIST.map(c => {
          const m = getCategoryMeta(c);
          const on = category === c;
          return (
            <TouchableOpacity
              key={c}
              style={[
                styles.catChip,
                on && {backgroundColor: m.soft, borderColor: m.color},
              ]}
              onPress={() => selectCategory(c)}>
              <Text style={[styles.catChipText, on && {color: m.color}]}>
                {categoryChipLabel(c)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.shell}>
        <View style={[styles.rail, {backgroundColor: meta.color}]} />
        <View style={styles.shellBody}>
          <Text style={styles.shellEyebrow} numberOfLines={1}>
            {meta.emoji} {meta.label}
          </Text>

          <Text style={styles.fieldLabel} numberOfLines={1}>
            {category === 'reading' ? 'Название книги *' : 'Что сделать *'}
          </Text>
          <TextInput
            style={styles.input}
            value={category === 'reading' ? bookTitle : sportTitle}
            onChangeText={category === 'reading' ? setBookTitle : setSportTitle}
            placeholder={
              category === 'reading'
                ? 'Например: Мастер и Маргарита'
                : 'Пробежка, зарядка, зал…'
            }
            placeholderTextColor="#a8a29e"
          />

          <View style={[styles.dialRow, {minHeight: dialBlockH}]}>
            <View style={styles.dialCol}>
              <ArcSectorPicker
                title="Период"
                options={PERIOD_ARC}
                value={period}
                onChange={setPeriod}
                accent={PERIOD_DIAL_COLOR[period]}
                colorForOption={id => PERIOD_DIAL_COLOR[id as TaskPeriod]}
                fillMode="cumulative"
                size={dialSize}
              />
            </View>
            <View style={styles.dialCol}>
              <ArcSectorPicker
                title="Сложность"
                options={DIFF_ARC}
                value={difficulty}
                onChange={setDifficulty}
                accent={DIFFICULTY_DIAL_COLOR[difficulty]}
                colorForOption={id => DIFFICULTY_DIAL_COLOR[id as Difficulty]}
                fillMode="cumulative"
                size={dialSize}
              />
            </View>
            <View style={styles.dialCol}>
              <ArcSectorPicker
                title={measureProfile.dialTitle}
                options={measureArc}
                value={measureArcValue}
                onChange={onMeasureArcPress}
                accent={measurabilitySegmentColor(0)}
                colorForOption={id => {
                  const idx = measureArc.findIndex(o => o.id === id);
                  return measurabilitySegmentColor(idx >= 0 ? idx : 0);
                }}
                fillMode="continuous"
                continuousScale="percentOfMax"
                colorForDecileIndex={i =>
                  measurabilitySegmentColor(Math.min(i, 4))
                }
                continuousValue={measureAmount}
                continuousMin={measureMin}
                continuousMax={measureMax}
                captionText={String(measureAmount)}
                showCaptionEdit
                onCaptionEditPress={openMeasureEdit}
                size={dialSize}
              />
            </View>
          </View>
        </View>
      </View>

      <MeasurabilityEditModal
        visible={measureEditOpen}
        min={draftMin}
        max={draftMax}
        value={draftVal}
        unit={draftUnit}
        onChangeMin={setDraftMin}
        onChangeMax={setDraftMax}
        onChangeValue={setDraftVal}
        onChangeUnit={setDraftUnit}
        onCancel={() => setMeasureEditOpen(false)}
        onSave={saveMeasureEdit}
      />

      <View style={styles.submit}>
        <Button
          title="Создать"
          color={FORM_NEUTRAL.primaryButton}
          onPress={handleSubmit}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {padding: 16, paddingBottom: 32},
  label: {fontSize: 13, fontWeight: '700', marginBottom: 8, color: '#334155'},
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 4,
    color: '#44403c',
    height: 18,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d6d3d1',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
    fontSize: 15,
    minHeight: 46,
  },
  catRow: {flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12},
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    marginRight: 8,
    marginBottom: 4,
    backgroundColor: '#fff',
  },
  catChipText: {color: '#334155', fontSize: 14, fontWeight: '600'},
  shell: {
    borderWidth: 1,
    borderColor: FORM_NEUTRAL.shellBorder,
    borderRadius: 12,
    overflow: 'hidden',
    flexDirection: 'row',
    backgroundColor: FORM_NEUTRAL.shellBg,
  },
  rail: {width: 6},
  shellBody: {flex: 1, padding: 12, paddingBottom: 14},
  shellEyebrow: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  dialRow: {
    flexDirection: 'row',
    marginTop: 12,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: DIAL_GAPS,
  },
  dialCol: {
    flex: 1,
    alignItems: 'center',
    maxWidth: `${100 / DIAL_COUNT}%`,
  },
  submit: {marginTop: 18},
});

export default TaskForm;
