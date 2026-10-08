import * as React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useAuth} from '../context/AuthContext';

function StatsHeader() {
  const {user, logout} = useAuth();
  if (!user) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text style={styles.username}>{user.username}</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logout}>Выход</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.label}>Баланс</Text>
          <Text style={styles.value}>{Math.round(user.points)}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.label}>Бонусы</Text>
          <Text style={styles.value}>{Math.round(user.total_earned_points)}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.label}>Потери</Text>
          <Text style={styles.value}>{Math.round(user.negative_points)}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.label}>Очки</Text>
          <Text style={styles.value}>{user.achievement_points}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, backgroundColor: '#fff'},
  row: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8},
  username: {fontSize: 18, fontWeight: '700'},
  logout: {color: '#00796b', fontSize: 14},
  stats: {flexDirection: 'row', justifyContent: 'space-between'},
  stat: {alignItems: 'center', flex: 1},
  label: {fontSize: 11, color: '#666'},
  value: {fontSize: 16, fontWeight: '600'},
});

export default StatsHeader;
