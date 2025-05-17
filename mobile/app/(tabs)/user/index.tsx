import { View, Text } from 'react-native';
import React, { useEffect } from 'react';
import { Redirect, useRouter } from 'expo-router';

const UserTab = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace('/(tabs)/user/login');
  }, []);

  // return null;
  return (
    <View style={{ backgroundColor: 'orange', flex: 1 }}>
      <Text>UserTab</Text>
    </View>
  );
};

export default UserTab;
