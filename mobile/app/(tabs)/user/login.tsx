import {
  View,
  Text,
  KeyboardAvoidingView,
  TextInput,
  Button,
  ActivityIndicator,
} from 'react-native';
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { getAuth } from '@react-native-firebase/auth';
import { FirebaseError } from 'firebase/app';
import ScreenContainer from '@/src/components/common/ScreenContainer';
import PrimaryButton from '@/src/components/common/PrimaryButton';
import { useThemeColors } from '@/src/context/ThemeContext';
import { i18n } from '@/src/lib/i18n';

const Login = () => {
  const { themeColors } = useThemeColors();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const signUp = async () => {
    setLoading(true);
    try {
      await getAuth().createUserWithEmailAndPassword(email, password);
      alert('Sheck you emails');
    } catch (e: any) {
      const err = e as FirebaseError;
      alert('Registration failed:' + err.message);
    } finally {
      setLoading(false);
    }
  };
  const signIn = async () => {
    setLoading(true);
    try {
      await getAuth().signInWithEmailAndPassword(email, password);
    } catch (e: any) {
      const err = e as FirebaseError;
      alert('Sign in failed:' + err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <ScreenContainer>
      <View style={styles.container}>
        <KeyboardAvoidingView behavior="padding">
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder={i18n.t('user.email')}
          />
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder={i18n.t('user.password')}
          />
          {loading ? (
            <ActivityIndicator size={'small'} style={{ margin: 28 }} />
          ) : (
            <View style={styles.btns}>
              <PrimaryButton text={i18n.t('user.signUp')} onClick={signUp} />
              <PrimaryButton text={i18n.t('user.signIn')} onClick={signIn} />
            </View>
          )}
        </KeyboardAvoidingView>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  btns: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  input: {
    backgroundColor: '#FFF',
    borderColor: '#DDD',
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
    color: '#333',
    textAlignVertical: 'top',
  },
});
export default Login;
