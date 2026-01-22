import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

// Screens
import HomeScreen from '../screens/HomeScreen';
import TaskScreen from '../screens/TaskScreen';

export type RootStackParamList = {
  Home: undefined;
  Task: {taskId: string};
};

const Stack = createStackNavigator<RootStackParamList>();

function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{title: 'My Tasks'}} 
        />
        <Stack.Screen 
          name="Task" 
          component={TaskScreen} 
          options={{title: 'Task Details'}} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default RootNavigator;