import * as React from 'react';
import {View, Text, FlatList, TouchableOpacity, StyleSheet} from 'react-native';
import {Task} from '../utils/TaskService';
import {getCategoryMeta} from '../types/categories';
import TaskCommitmentStrip from './TaskCommitmentStrip';

type TaskListProps = {
  tasks: Task[];
  onTaskPress: (task: Task) => void;
};

function volumeFromDescription(description: string | undefined): string {
  if (!description?.trim()) {
    return '—';
  }
  const s = description.trim();
  const cut = s.split(/\s+(?:в|за)\s+/i)[0];
  return cut || s;
}

function TaskList({tasks, onTaskPress}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Нет активных задач. Создай первую!</Text>
      </View>
    );
  }

  const renderItem = ({item}: {item: Task}) => {
    const meta = getCategoryMeta(item.category ?? 'reading');
    return (
      <TouchableOpacity
        style={styles.taskItem}
        onPress={() => onTaskPress(item)}
        activeOpacity={0.85}>
        <View style={[styles.rail, {backgroundColor: meta.color}]} />
        <View style={styles.taskContent}>
          <Text style={styles.taskTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <TaskCommitmentStrip
            stake={item.bid_amount}
            period={item.period}
            volume={volumeFromDescription(item.description)}
            borderAccent={meta.color}
          />
        </View>
      </TouchableOpacity>
    );
  };

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
    flexDirection: 'row',
    overflow: 'hidden',
    marginVertical: 6,
    marginHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  rail: {width: 6},
  taskContent: {flex: 1, paddingVertical: 12, paddingHorizontal: 12},
  taskTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  emptyContainer: {flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20},
  emptyText: {fontSize: 16, color: '#666', textAlign: 'center'},
});

export default TaskList;
