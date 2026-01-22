import * as React from 'react';
import {View, Text, StyleSheet, Button, Alert} from 'react-native';
import TaskList from '../components/TaskList';
import CategoryFilter from '../components/CategoryFilter';
import TaskService, {Task, TaskCategory} from '../utils/TaskService';
import {filterTasksByCategory} from '../utils/TaskUtils';

function HomeScreen({navigation}) {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [selectedCategory, setSelectedCategory] = React.useState<TaskCategory | 'all'>('all');
  
  React.useEffect(() => {
    loadTasks();
    
    const unsubscribe = navigation.addListener('focus', () => {
      loadTasks();
    });
    
    return unsubscribe;
  }, [navigation]);
  
  const loadTasks = async () => {
    const loadedTasks = await TaskService.getAll();
    setTasks(loadedTasks);
  };
  
  const handleTaskPress = (task: Task) => {
    navigation.navigate('Task', {taskId: task.id});
  };
  
  const handleDeleteTask = async (taskId: string) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await TaskService.delete(taskId);
            if (success) {
              loadTasks();
            } else {
              Alert.alert('Error', 'Failed to delete task');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Tasks</Text>
      <CategoryFilter 
        selectedCategory={selectedCategory} 
        onCategorySelect={setSelectedCategory} 
      />
      <TaskList 
        tasks={filterTasksByCategory(tasks, selectedCategory)} 
        onTaskPress={handleTaskPress} 
        onDelete={handleDeleteTask} 
        categoryFilter={selectedCategory}
      />
      <View style={styles.buttonContainer}>
        <Button 
          title="Create New Task" 
          onPress={() => navigation.navigate('Task', {taskId: 'new'})} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  buttonContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
});

export default HomeScreen;