import * as React from 'react';
import {ActivityIndicator, View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import TaskScreen from '../screens/TaskScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import {useAuth} from '../context/AuthContext';

export type RootStackParamList = {
  Home: undefined;
  Task: {taskId: string};
  Login: undefined;
  Register: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

function RootNavigator() {
  const {user, loading} = useAuth();

  if (loading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} options={{title: 'Сегодня'}} />
            <Stack.Screen name="Task" component={TaskScreen} options={{title: 'Задача'}} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{headerShown: false}} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{title: 'Регистрация'}} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default RootNavigator;
