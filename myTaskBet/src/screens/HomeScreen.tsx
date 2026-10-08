import * as React from 'react';
import {View, StyleSheet, Button, Alert, ActivityIndicator} from 'react-native';
import TaskList from '../components/TaskList';
import CategoryFilter from '../components/CategoryFilter';
import StatsHeader from '../components/StatsHeader';
import TaskService, {Task, TaskCategory} from '../utils/TaskService';
import {filterTasksByCategory} from '../utils/TaskUtils';
import {useAuth} from '../context/AuthContext';

function HomeScreen({navigation}: any) {
  const {refreshUser} = useAuth();
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedCategory, setSelectedCategory] = React.useState<TaskCategory | 'all'>('all');

  const loadTasks = React.useCallback(async () => {
    setLoading(true);
    try {
      const loaded = await TaskService.getAll('active');
      setTasks(loaded);
      await refreshUser();
    } catch (e: any) {
      Alert.alert('Ошибка', e?.response?.data?.detail ?? 'Не удалось загрузить задачи');
    } finally {
      setLoading(false);
    }
  }, [refreshUser]);

  React.useEffect(() => {
    const unsub = navigation.addListener('focus', loadTasks);
    loadTasks();
    return unsub;
  }, [navigation, loadTasks]);

  const handleTaskPress = (task: Task) => {
    navigation.navigate('Task', {taskId: String(task.id)});
  };

  return (
    <View style={styles.container}>
      <StatsHeader />
      <CategoryFilter selectedCategory={selectedCategory} onCategorySelect={setSelectedCategory} />
      {loading ? (
        <ActivityIndicator style={{marginTop: 40}} />
      ) : (
        <TaskList tasks={filterTasksByCategory(tasks, selectedCategory)} onTaskPress={handleTaskPress} />
      )}
      <View style={styles.buttonContainer}>
        <Button title="Новая задача" onPress={() => navigation.navigate('Task', {taskId: 'new'})} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f5f5f5'},
  buttonContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
});

export default HomeScreen;
