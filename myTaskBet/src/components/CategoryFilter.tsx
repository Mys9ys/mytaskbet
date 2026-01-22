import * as React from 'react';
import {View, StyleSheet, TouchableOpacity, Text} from 'react-native';
import {TaskCategory} from '../utils/TaskService';
import {CATEGORY_COLORS, CATEGORY_NAMES} from '../utils/TaskUtils';

type CategoryFilterProps = {
  selectedCategory: TaskCategory | 'all';
  onCategorySelect: (category: TaskCategory | 'all') => void;
};

function CategoryFilter({selectedCategory, onCategorySelect}: CategoryFilterProps) {
  const categories: (TaskCategory | 'all')[] = ['all', 'work', 'personal', 'shopping', 'health', 'education', 'other'];

  return (
    <View style={styles.container}>
      {categories.map(category => (
        <TouchableOpacity
          key={category}
          style={[
            styles.button,
            selectedCategory === category && styles.selectedButton,
            category !== 'all' && {borderLeftColor: CATEGORY_COLORS[category as TaskCategory]},
          ]}
          onPress={() => onCategorySelect(category)}
        >
          <Text
            style={[
              styles.buttonText,
              selectedCategory === category && styles.selectedButtonText,
            ]}
          >
            {category === 'all' ? 'All' : CATEGORY_NAMES[category as TaskCategory]}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  button: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    borderLeftWidth: 4,
  },
  selectedButton: {
    backgroundColor: '#e0f7fa',
    borderColor: '#00acc1',
  },
  buttonText: {
    fontSize: 14,
    color: '#666',
  },
  selectedButtonText: {
    color: '#00acc1',
    fontWeight: '600',
  },
});

export default CategoryFilter;