import * as React from 'react';
import {View, TextInput, StyleSheet, Picker, Text} from 'react-native';
import {Task} from '../utils/TaskService';

type TaskFormProps = {
  task?: Task;
  onSubmit: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
};

function TaskForm({task, onSubmit}: TaskFormProps) {
  const [title, setTitle] = React.useState(task?.title || '');
  const [description, setDescription] = React.useState(task?.description || '');
  const [status, setStatus] = React.useState<"pending" | "in-progress" | "completed">(task?.status || 'pending');
  const [category, setCategory] = React.useState<TaskCategory>(task?.category || 'other');

  const handleSubmit = () => {
    if (!title.trim()) return;
    
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      status,
      category,
    });
  };

  React.useEffect(() => {
    handleSubmit();
  }, [status, category]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Title*</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Enter task title"
        onSubmitEditing={handleSubmit}
      />
      
      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        placeholder="Enter task description"
        multiline
        numberOfLines={4}
      />
      
      <Text style={styles.label}>Status</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={status}
          style={styles.picker}
          onValueChange={(itemValue) => setStatus(itemValue)}>
          <Picker.Item label="Pending" value="pending" />
          <Picker.Item label="In Progress" value="in-progress" />
          <Picker.Item label="Completed" value="completed" />
        </Picker>
      </View>
      
      <Text style={styles.label}>Category</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={category}
          style={styles.picker}
          onValueChange={(itemValue) => setCategory(itemValue)}>
          <Picker.Item label="Work" value="work" />
          <Picker.Item label="Personal" value="personal" />
          <Picker.Item label="Shopping" value="shopping" />
          <Picker.Item label="Health" value="health" />
          <Picker.Item label="Education" value="education" />
          <Picker.Item label="Other" value="other" />
        </Picker>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  picker: {
    width: '100%',
  },
});

export default TaskForm;