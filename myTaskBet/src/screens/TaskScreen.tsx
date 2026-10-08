import * as React from 'react';
import {View, Text, StyleSheet, Button, Alert, ActivityIndicator, ScrollView} from 'react-native';
import TaskForm from '../components/TaskForm';
import TaskService, {Task, CreateTaskInput} from '../utils/TaskService';
import {difficultyLabel, getCategoryName} from '../utils/TaskUtils';
import {useAuth} from '../context/AuthContext';

function TaskScreen({route, navigation}: any) {
  const {taskId} = route.params || {};
  const isCreatingNew = taskId === 'new';
  const {refreshUser} = useAuth();
  const [task, setTask] = React.useState<Task | null>(null);
  const [loading, setLoading] = React.useState(!isCreatingNew);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (!isCreatingNew && taskId) {
      (async () => {
        try {
          const loaded = await TaskService.getById(taskId);
          if (!loaded) navigation.goBack();
          else setTask(loaded);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [taskId, isCreatingNew, navigation]);

  const handleSave = async (taskData: CreateTaskInput) => {
    setBusy(true);
    try {
      await TaskService.create(taskData);
      await refreshUser();
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Создание', e?.response?.data?.detail ?? 'Не удалось создать');
    } finally {
      setBusy(false);
    }
  };

  const closeWith = async (action: 'complete' | 'fail') => {
    if (!task) return;
    setBusy(true);
    try {
      if (action === 'complete') await TaskService.complete(task.id);
      else await TaskService.fail(task.id);
      await refreshUser();
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Задача', e?.response?.data?.detail ?? 'Ошибка');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <ActivityIndicator style={{marginTop: 48}} />;
  }

  if (isCreatingNew) {
    return (
      <ScrollView style={styles.container}>
        <TaskForm onSubmit={handleSave} />
        {busy ? <ActivityIndicator style={{margin: 16}} /> : null}
      </ScrollView>
    );
  }

  if (!task) return null;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{task.title}</Text>
        {task.description ? <Text style={styles.desc}>{task.description}</Text> : null}
        <Text style={styles.meta}>{difficultyLabel(task.difficulty)}</Text>
        <Text style={styles.meta}>Категория: {getCategoryName(task.category)}</Text>
        <Text style={styles.meta}>Ставка (резерв): {task.bid_amount}</Text>
      </View>
      {!task.is_completed ? (
        <View style={styles.actions}>
          <Button title="Выполнено" onPress={() => closeWith('complete')} disabled={busy} />
          <View style={styles.gap} />
          <Button title="Не выполнено" color="#c62828" onPress={() => closeWith('fail')} disabled={busy} />
        </View>
      ) : (
        <Text style={styles.closed}>Закрыто: {task.outcome === 'success' ? 'успех' : 'провал'}</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f5f5f5'},
  card: {margin: 16, padding: 16, backgroundColor: '#fff', borderRadius: 10},
  title: {fontSize: 22, fontWeight: '700', marginBottom: 8},
  desc: {fontSize: 15, color: '#444', marginBottom: 8},
  meta: {fontSize: 14, color: '#00796b', marginTop: 4},
  actions: {padding: 16},
  gap: {height: 12},
  closed: {textAlign: 'center', margin: 24, fontSize: 16, color: '#666'},
});

export default TaskScreen;
