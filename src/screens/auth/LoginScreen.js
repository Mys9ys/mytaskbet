'use strict';

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { authAPI } from '../../services/api';
import AuthHeader from '../../components/auth/AuthHeader';
import SocialAuthButtons from '../../components/auth/SocialAuthButtons';

const LoginScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Имя пользователя обязательно';
    }
    
    if (!formData.password) {
      newErrors.password = 'Пароль обязателен';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Пароль должен содержать не менее 6 символов';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      await authAPI.login({
        username: formData.username,
        password: formData.password,
      });
      
      // Navigate to main app
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle different error cases
      if (error.message === 'Invalid credentials') {
        Alert.alert('Ошибка', 'Неверное имя пользователя или пароль');
      } else {
        Alert.alert('Ошибка', 'Не удалось войти. Пожалуйста, попробуйте еще раз.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <AuthHeader 
          title="Добро пожаловать в myTaskBet" 
          subtitle="Войдите в свой аккаунт" 
        />
        
        <Card>
          <Input
            label="Имя пользователя"
            value={formData.username}
            onChangeText={(value) => handleInputChange('username', value)}
            placeholder="Введите имя пользователя"
            error={errors.username}
          />
          
          <PasswordInput
            label="Пароль"
            value={formData.password}
            onChangeText={(value) => handleInputChange('password', value)}
            placeholder="Введите пароль"
            error={errors.password}
          />
          
          <Button
            title={loading ? 'Вход...' : 'Войти'}
            onPress={handleLogin}
            disabled={loading}
          />
          
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#4CAF50" />
            </View>
          )}
        </Card>
        
        <SocialAuthButtons />
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Нет аккаунта?{' '}
            <Text 
              style={styles.link}
              onPress={() => navigation.navigate('Register')}
            >
              Зарегистрироваться
            </Text>
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  link: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
});

export default LoginScreen;