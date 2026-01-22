'use strict';

import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const PasswordInput = ({
  value,
  onChangeText,
  placeholder = 'Введите пароль',
  error,
  style,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <View style={[styles.container, style, error && styles.errorContainer]}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={!showPassword}
        autoCapitalize="none"
      />
      <TouchableOpacity style={styles.toggleButton} onPress={toggleShowPassword}>
        <Icon 
          name={showPassword ? 'visibility' : 'visibility-off'} 
          size={24} 
          color="#666" 
        />
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  errorContainer: {
    borderColor: '#dc3545',
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  toggleButton: {
    paddingHorizontal: 12,
  },
  errorText: {
    fontSize: 12,
    color: '#dc3545',
    marginTop: 4,
    marginLeft: 4,
    alignSelf: 'flex-start',
  },
});

export default PasswordInput;