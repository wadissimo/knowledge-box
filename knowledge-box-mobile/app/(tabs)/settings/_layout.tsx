import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { Stack } from "expo-router";

const SettingsLayout = () => {
  return <Stack>
    
    <Stack.Screen
  name="index"
  options={{
    headerShown: true,
    headerBackVisible: false,
    headerShadowVisible: false,
    title: '',
    headerStyle: { backgroundColor: '#2196f3' },
    headerTitle: () => (
      <Text style={styles.headerTitle}>Settings</Text>
    ),
  }}
/>
  </Stack>;
};

const styles = StyleSheet.create({
  headerTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    letterSpacing: 0.5,
    textShadowColor: '#1565c0',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default SettingsLayout;
