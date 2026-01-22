'use strict';

import React, {useState} from 'react';
import {SafeAreaView, StyleSheet, View, StatusBar} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

// Screens
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import TasksScreen from './screens/TasksScreen';
import RankingsScreen from './screens/RankingsScreen';
import ProfileScreen from './screens/ProfileScreen';

// Services
import AuthService from './services/AuthService';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 4,
        },
      })}>
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{headerShown: false}} 
      />
      <Tab.Screen 
        name="Tasks" 
        component={TasksScreen} 
        options={{headerShown: false}} 
      />
      <Tab.Screen 
        name="Rankings" 
        component={RankingsScreen} 
        options={{headerShown: false}} 
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{headerShown: false}} 
      />
    </Tab.Navigator>
  );
};

const App = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    // Check if user is already logged in
    const checkLoginStatus = async () => {
      const loggedInUser = await AuthService.getCurrentUser();
      setUser(loggedInUser);
      setIsLoading(false);
    };

    checkLoginStatus();
  }, []);

  if (isLoading) {
    return null; // or a splash screen
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {user ? <MainTabs /> : <AuthStack />}
        </View>
      </SafeAreaView>
    </NavigationContainer>
  );
};

const AuthStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Login" 
        component={LoginScreen} 
        options={{headerShown: false}} 
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen} 
        options={{headerShown: false}} 
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
});

export default App;