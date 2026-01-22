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
import TermsAgreement from '../../components/auth/TermsAgreement';



const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Имя пользователя обязательно';
    } else if (!/^[a-zA-Z0-9]+$/.test(formData.username)) {
      newErrors.username = 'Имя пользователя должно содержать только буквы и цифры';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email обязателен';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Неверный формат email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Пароль обязателен';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Пароль должен содержать не менее 6 символов';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Подтверждение пароля обязательно';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      await authAPI.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirmPassword,
      });
      
      Alert.alert(
        'Успешно',
        'Вы успешно зарегистрировались! Теперь вы можете войти в свой аккаунт.',
        [
          {
            text: 'Войти',
            onPress: () => navigation.navigate('Login')
          }
        ]
      );
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle different error cases
      if (error.message === 'Username already registered') {
        Alert.alert('Ошибка', 'Имя пользователя уже занято');
      } else if (error.message === 'Email already registered') {
        Alert.alert('Ошибка', 'Email уже зарегистрирован');
      } else {
        Alert.alert('Ошибка', 'Не удалось зарегистрироваться. Пожалуйста, попробуйте еще раз.');
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

  const handleAgreeToggle = () => {
    setAgreedToTerms(!agreedToTerms);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <AuthHeader 
          title="Создайте аккаунт" 
          subtitle="Регистрация в myTaskBet" 
        />
        
        <Card>
          <Input
            label="Имя пользователя"
            value={formData.username}
            onChangeText={(value) => handleInputChange('username', value)}
            placeholder="Введите имя пользователя"
            error={errors.username}
          />
          
          <Input
            label="Email"
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            placeholder="Введите email"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />
          
          <PasswordInput
            value={formData.password}
            onChangeText={(value) => handleInputChange('password', value)}
            placeholder="Введите пароль"
            error={errors.password}
          />
          
          <PasswordInput
            value={formData.confirmPassword}
            onChangeText={(value) => handleInputChange('confirmPassword', value)}
            placeholder="Повторите пароль"
            error={errors.confirmPassword}
          />
          
          <TermsAgreement 
            agreed={agreedToTerms} 
            onAgreeToggle={handleAgreeToggle} 
          />
          
          <Button
            title={loading ? 'Регистрация...' : 'Зарегистрироваться'}
            onPress={handleRegister}
            disabled={loading || !agreedToTerms}
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
            Уже есть аккаунт?{' '}
            <Text 
              style={styles.link}
              onPress={() => navigation.navigate('Login')}
            >
              Войти
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

export default RegisterScreen;