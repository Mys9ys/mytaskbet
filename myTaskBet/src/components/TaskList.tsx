import * as React from 'react';
import {View, Text, FlatList, TouchableOpacity, StyleSheet} from 'react-native';
import {Task, TaskCategory} from '../utils/TaskService';
import {getCategoryColor, getCategoryName} from '../utils/TaskUtils';

type TaskListProps = {
  tasks: Task[];
  onTaskPress: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  categoryFilter?: TaskCategory | 'all';
};

function TaskList({tasks, onTaskPress, onDelete}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No tasks yet. Create your first task!</Text>
      </View>
    );
  }

  const handleDelete = (taskId: string, e: any) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(taskId);
    }
  };

  const renderItem = ({item}: {item: Task}) => (
    <TouchableOpacity style={styles.taskItem} onPress={() => onTaskPress(item)}>
      <View style={styles.taskContent}>
        <View style={styles.headerRow}>
          <Text style={styles.taskTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={[styles.categoryBadge, {backgroundColor: getCategoryColor(item.category)}]}>
            <Text style={styles.categoryText}>
              {getCategoryName(item.category)}
            </Text>
          </View>
        </View>
        <Text style={styles.taskStatus}>
          {item.status.replace('-', ' ').toUpperCase()}
        </Text>
        <Text style={styles.taskDate} numberOfLines={1}>
          Created: {new Date(item.createdAt).toLocaleDateString()}
        </Text>
        {item.description ? (
          <Text style={styles.taskDescription} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}
      </View>
      {onDelete && (
        <TouchableOpacity 
          style={styles.deleteButton} 
          onPress={(e) => handleDelete(item.id, e)}
        >
          <Text style={styles.deleteButtonText}>✕</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={tasks}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      style={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  taskItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskContent: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  taskStatus: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  taskDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default TaskList;