import * as React from 'react';
import {ScrollView, StyleSheet, TouchableOpacity, Text} from 'react-native';
import {TaskCategory, CATEGORY_LIST, getCategoryLabel, getCategoryColor} from '../types/categories';

type CategoryFilterProps = {
  selectedCategory: TaskCategory | 'all';
  onCategorySelect: (category: TaskCategory | 'all') => void;
};

function CategoryFilter({selectedCategory, onCategorySelect}: CategoryFilterProps) {
  const items: (TaskCategory | 'all')[] = ['all', ...CATEGORY_LIST];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}>
      {items.map(category => (
        <TouchableOpacity
          key={category}
          style={[
            styles.button,
            selectedCategory === category && styles.selectedButton,
            category !== 'all' && {borderLeftColor: getCategoryColor(category)},
          ]}
          onPress={() => onCategorySelect(category)}>
          <Text style={[styles.buttonText, selectedCategory === category && styles.selectedButtonText]}>
            {category === 'all' ? 'Все' : getCategoryLabel(category)}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {maxHeight: 48, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee'},
  button: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginHorizontal: 4,
    marginVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    borderLeftWidth: 4,
  },
  selectedButton: {backgroundColor: '#e0f2f1', borderColor: '#00796b'},
  buttonText: {fontSize: 13, color: '#666'},
  selectedButtonText: {color: '#00796b', fontWeight: '600'},
});

export default CategoryFilter;
