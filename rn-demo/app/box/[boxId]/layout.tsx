import { View, Text } from "react-native";
import React from "react";
import { Stack, Slot } from "expo-router";

const BoxLayout = () => {
  return (
    <Slot />
    // <Stack>
    //   <Stack.Screen name="index" options={{ headerShown: false }} />
    //   <Stack.Screen
    //     name="collections/new"
    //     options={{ headerShown: true, title: "New Collection" }}
    //   />
    // </Stack>
  );
};

export default BoxLayout;
