import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import { Stack } from 'expo-router';
import { useHeaderOptions, useHeaderTitleStyle } from '@/src/context/ThemeContext';

const SettingsLayout = () => {
  const defaultHeaderOptions = useHeaderOptions();
  const headerTitleStyle = useHeaderTitleStyle();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          ...defaultHeaderOptions,
          headerTitle: () => <Text style={headerTitleStyle}>Settings</Text>,
        }}
      />
    </Stack>
  );
};

export default SettingsLayout;
