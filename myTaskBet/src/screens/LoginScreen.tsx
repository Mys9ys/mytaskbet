import * as React from 'react';
import {View, Text, TextInput, Button, StyleSheet, Alert} from 'react-native';
import {useAuth} from '../context/AuthContext';

function LoginScreen({navigation}: any) {
  const {login} = useAuth();
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [busy, setBusy] = React.useState(false);

  const onLogin = async () => {
    if (!username.trim() || !password) {
      Alert.alert('Ошибка', 'Введите логин и пароль');
      return;
    }
    setBusy(true);
    try {
      await login(username.trim(), password);
    } catch (e: any) {
      Alert.alert('Вход', e?.response?.data?.detail ?? 'Не удалось войти');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>myTaskBet</Text>
      <TextInput
        style={styles.input}
        placeholder="Логин (латиница)"
        autoCapitalize="none"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Пароль"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title={busy ? '...' : 'Войти'} onPress={onLogin} disabled={busy} />
      <View style={styles.spacer} />
      <Button title="Регистрация" onPress={() => navigation.navigate('Register')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, padding: 24, justifyContent: 'center'},
  title: {fontSize: 28, fontWeight: '700', textAlign: 'center', marginBottom: 24},
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

export default LoginScreen;
