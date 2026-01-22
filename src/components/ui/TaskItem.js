'use strict';

import React from 'react';
import { View, Text, StyleSheet, PanResponder, Animated } from 'react-native';
import Card from './Card';
import Button from './Button';

const TaskItem = ({ task, onTaskComplete, onTaskFail }) => {
  const [animatedValue] = React.useState(new Animated.Value(0));

  // PanResponder for swipe gestures
  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gestureState) => {
        // Update animated value based on swipe
        animatedValue.setValue(gestureState.dx);
        
        // Opacity effect based on swipe distance
        const opacity = Math.min(Math.abs(gestureState.dx) / 100, 1);
        // Here you could also change the background color based on direction
      },
      onPanResponderRelease: (event, gestureState) => {
        // Determine swipe direction and threshold
        const swipeThreshold = 100;
        
        if (gestureState.dx > swipeThreshold) {
          // Swiped right - complete task
          onTaskComplete(task.id);
        } else if (gestureState.dx < -swipeThreshold) {
          // Swiped left - fail task
          onTaskFail(task.id);
        }
        
        // Reset animation
        Animated.spring(animatedValue, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  // Animated style for swipe effect
  const animatedStyle = {
    transform: [
      {
        translateX: animatedValue,
      },
    ],
  };

  return (
    <Animated.View
      style={[animatedStyle, styles.animatedContainer]}
      {...panResponder.panHandlers}
    >
      <Card style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={2}>
            {task.title}
          </Text>
          <View style={styles.pointsContainer}>
            <Text style={styles.pointsLabel}>Ставка:</Text>
            <Text style={styles.pointsValue}>{task.bid_amount}</Text>
          </View>
        </View>
        
        {task.description && (
          <Text style={styles.description} numberOfLines={2}>
            {task.description}
          </Text>
        )}
        
        <View style={styles.footer}>
          <Text style={styles.category}>Категория: {task.category}</Text>
          <View style={styles.actions}>
            <Button
              title="Выполнено"
              variant="success"
              onPress={() => onTaskComplete(task.id)}
              style={styles.actionButton}
            />
            <Button
              title="Провалено"
              variant="danger"
              onPress={() => onTaskFail(task.id)}
              style={styles.actionButton}
            />
          </View>
        </View>
      </Card>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  animatedContainer: {
    overflow: 'hidden',
  },
  card: {
    marginVertical: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  pointsContainer: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  pointsLabel: {
    fontSize: 12,
    color: '#666',
  },
  pointsValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  footer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  category: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingHorizontal: 8,
  },
});

export default TaskItem;