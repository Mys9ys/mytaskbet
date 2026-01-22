'use strict';

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const TermsAgreement = ({ agreed, onAgreeToggle }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.checkboxContainer} onPress={onAgreeToggle}>
        <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
          {agreed && <Icon name="check" size={18} color="#fff" />}
        </View>
        <Text style={styles.label}>
          Я согласен с <Text style={styles.link}>Условиями использования</Text> и <Text style={styles.link}>Политикой конфиденциальности</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#4CAF50',
    marginRight: 8,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4CAF50',
  },
  label: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  link: {
    color: '#4CAF50',
    fontWeight: '600',
  },
});

export default TermsAgreement;