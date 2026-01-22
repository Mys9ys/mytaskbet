'use strict';

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Button from '../ui/Button';

const SocialAuthButtons = () => {
  const handleGoogleLogin = () => {
    // Handle Google login
    console.log('Google login');
  };
  
  const handleAppleLogin = () => {
    // Handle Apple login
    console.log('Apple login');
  };
  
  const handleFacebookLogin = () => {
    // Handle Facebook login
    console.log('Facebook login');
  };

  return (
    <View style={styles.container}>
      <Button
        title="Войти с Google"
        variant="secondary"
        onPress={handleGoogleLogin}
        style={styles.button}
      />
      <Button
        title="Войти с Apple"
        variant="secondary"
        onPress={handleAppleLogin}
        style={styles.button}
      />
      <Button
        title="Войти с Facebook"
        variant="secondary"
        onPress={handleFacebookLogin}
        style={styles.button}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 16,
  },
  button: {
    marginBottom: 8,
  },
});

export default SocialAuthButtons;