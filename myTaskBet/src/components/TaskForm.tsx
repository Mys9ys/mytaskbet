import * as React from 'react';
import {View, TextInput, StyleSheet, Text, TouchableOpacity, Button} from 'react-native';
import {Task, Difficulty, CreateTaskInput} from '../utils/TaskService';
import {CATEGORY_LIST, getCategoryLabel} from '../types/categories';

type TaskFormProps = {
  onSubmit: (taskData: CreateTaskInput) => void;
};

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];

function TaskForm({onSubmit}: TaskFormProps) {
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [category, setCategory] = React.useState<string>('habits');
  const [difficulty, setDifficulty] = React.useState<Difficulty>('easy');

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      difficulty,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Название *</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Дело" />

      <Text style={styles.label}>Описание</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
      />

      <Text style={styles.label}>Сложность (ставка автоматически)</Text>
      <View style={styles.row}>
        {DIFFICULTIES.map(d => (
          <TouchableOpacity
            key={d}
            style={[styles.chip, difficulty === d && styles.chipActive]}
            onPress={() => setDifficulty(d)}>
            <Text style={difficulty === d ? styles.chipTextActive : styles.chipText}>
              {d === 'easy' ? '20' : d === 'medium' ? '50' : '100'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Категория</Text>
      <View style={styles.categories}>
        {CATEGORY_LIST.map(c => (
          <TouchableOpacity
            key={c}
            style={[styles.catChip, category === c && styles.chipActive]}
            onPress={() => setCategory(c)}>
            <Text style={category === c ? styles.chipTextActive : styles.chipText}>
              {getCategoryLabel(c)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Button title="Создать задачу" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {padding: 20},
  label: {fontSize: 14, fontWeight: '600', marginBottom: 6, marginTop: 8},
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  textArea: {height: 80, textAlignVertical: 'top'},
  row: {flexDirection: 'row', gap: 8, marginBottom: 8},
  chip: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  chipActive: {backgroundColor: '#00796b', borderColor: '#00796b'},
  chipText: {color: '#333'},
  chipTextActive: {color: '#fff', fontWeight: '600'},
  categories: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16},
  catChip: {paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#ddd'},
});

export default TaskForm;
