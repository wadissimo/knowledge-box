import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { getAuth } from '@react-native-firebase/auth';
import { useTheme } from '@react-navigation/native';
import { useHeaderOptions, useHeaderTitleStyle, useThemeColors } from '@/src/context/ThemeContext';
import { i18n } from '@/src/lib/i18n';

const UserLayout = () => {
  const { themeColors } = useThemeColors();
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>();
  const headerTitleStyle = useHeaderTitleStyle();
  const defaultHeaderOptions = useHeaderOptions();
  const router = useRouter();
  const segments = useSegments();

  const onAuthStateChanged = (user: FirebaseAuthTypes.User | null) => {
    console.log('onAuthStateChanged', user);
    setUser(user);
    if (initializing) setInitializing(false);
  };
  useEffect(() => {
    const subscriber = getAuth().onAuthStateChanged(onAuthStateChanged);
    console.log('subscriber', subscriber);
    return subscriber;
  }, []);

  useEffect(() => {
    console.log('initializing');
    if (initializing) return;

    console.log('segments', segments);
    const inAuthGroup = segments.includes('(auth)' as never);
    console.log('inAuthGroup', inAuthGroup);
    if (user && !inAuthGroup) {
      console.log('userpage');
      router.replace('/(tabs)/user/userpage');
    } else if (!user && inAuthGroup) {
      console.log('login');
      router.replace('/(tabs)/user/login');
    }
    console.log('inAuthGroup', inAuthGroup);
    console.log('user', user !== null);
    // console.log("segments", segments);
  }, [user, initializing]);

  if (initializing)
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  return (
    <Stack>
      <Stack.Screen
        name="login"
        options={{
          ...defaultHeaderOptions,
          title: i18n.t('user.login'),
        }}
      />
      <Stack.Screen
        name="(auth)/userpage"
        options={{ ...defaultHeaderOptions, title: i18n.t('menu.profile'), headerLeft: () => null }}
      />
    </Stack>
  );
};

export default UserLayout;
