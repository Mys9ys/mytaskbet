import * as React from 'react';
import {View, TextInput, Button, StyleSheet, Alert} from 'react-native';
import {useAuth} from '../context/AuthContext';

function RegisterScreen({navigation}: any) {
  const {register} = useAuth();
  const [username, setUsername] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [busy, setBusy] = React.useState(false);

  const onRegister = async () => {
    setBusy(true);
    try {
      await register(username.trim(), email.trim(), password);
    } catch (e: any) {
      const detail = e?.response?.data?.detail;
      Alert.alert('Регистрация', typeof detail === 'string' ? detail : 'Ошибка регистрации');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Логин (a-z, 0-9)"
        autoCapitalize="none"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Пароль (мин. 6)"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title={busy ? '...' : 'Создать аккаунт'} onPress={onRegister} disabled={busy} />
      <View style={styles.spacer} />
      <Button title="Назад ко входу" onPress={() => navigation.goBack()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, padding: 24, justifyContent: 'center'},
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  spacer: {height: 16},
});

export default RegisterScreen;
