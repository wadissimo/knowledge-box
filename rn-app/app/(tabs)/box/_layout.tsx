import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";

const BoxLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="boxes" options={{ headerShown: false }} />
      <Stack.Screen
        name="[boxId]/boxView"
        options={{ title: "Box", headerShown: false }}
      />
    </Stack>
  );
};

export default BoxLayout;
