import * as React from 'react';
import {View, Text, FlatList, TouchableOpacity, StyleSheet} from 'react-native';
import {Task} from '../utils/TaskService';
import {getCategoryColor, getCategoryName, difficultyLabel} from '../utils/TaskUtils';

type TaskListProps = {
  tasks: Task[];
  onTaskPress: (task: Task) => void;
};

function TaskList({tasks, onTaskPress}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Нет активных задач. Создай первую!</Text>
      </View>
    );
  }

  const renderItem = ({item}: {item: Task}) => (
    <TouchableOpacity style={styles.taskItem} onPress={() => onTaskPress(item)}>
      <View style={styles.taskContent}>
        <View style={styles.headerRow}>
          <Text style={styles.taskTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={[styles.categoryBadge, {backgroundColor: getCategoryColor(item.category ?? 'other')}]}>
            <Text style={styles.categoryText}>{getCategoryName(item.category)}</Text>
          </View>
        </View>
        <Text style={styles.meta}>{difficultyLabel(item.difficulty)}</Text>
        {item.description ? (
          <Text style={styles.taskDescription} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={tasks}
      renderItem={renderItem}
      keyExtractor={item => String(item.id)}
      style={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  taskItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 10,
    elevation: 2,
  },
  taskContent: {flex: 1},
  headerRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4},
  taskTitle: {fontSize: 18, fontWeight: '600', flex: 1, marginRight: 8},
  categoryBadge: {paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12},
  categoryText: {color: 'white', fontSize: 11, fontWeight: '600'},
  meta: {fontSize: 14, color: '#00796b', marginBottom: 4},
  taskDescription: {fontSize: 14, color: '#666'},
  emptyContainer: {flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20},
  emptyText: {fontSize: 16, color: '#666', textAlign: 'center'},
});

export default TaskList;
