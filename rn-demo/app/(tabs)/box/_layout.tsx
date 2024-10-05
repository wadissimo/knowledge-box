import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";

const BoxLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="[boxId]/index" options={{ title: "Box" }} />
    </Stack>
  );
};

export default BoxLayout;
