import * as React from 'react';
import {View, Text, StyleSheet, Button} from 'react-native';
import TaskForm from '../components/TaskForm';
import TaskService, {Task} from '../utils/TaskService';

function TaskScreen({route, navigation}) {
  const {taskId} = route.params || {};
  const isCreatingNew = taskId === 'new';
  const [task, setTask] = React.useState<Task | null>(null);
  
  React.useEffect(() => {
    if (!isCreatingNew && taskId) {
      loadTask();
    }
  }, [taskId]);
  
  const loadTask = async () => {
    const loadedTask = await TaskService.getById(taskId);
    if (loadedTask) {
      setTask(loadedTask);
    } else {
      navigation.goBack();
    }
  };
  
  const handleSave = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (isCreatingNew) {
      await TaskService.create(taskData);
    } else if (taskId) {
      await TaskService.update(taskId, taskData);
    }
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <TaskForm 
        task={task || undefined} 
        onSubmit={handleSave} 
      />
      {!isCreatingNew && (
        <View style={styles.buttonContainer}>
          <Button 
            title="Delete Task" 
            color="#ff4444"
            onPress={() => {
              TaskService.delete(taskId).then(success => {
                if (success) {
                  navigation.goBack();
                }
              });
            }} 
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  buttonContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
});

export default TaskScreen;