import { View, Text, Touchable, TouchableOpacity } from "react-native";
import React from "react";
import { Stack, useRouter } from "expo-router";
import Icon from "react-native-vector-icons/MaterialIcons";

const BoxLayout = () => {
  const router = useRouter();

  return (
    <Stack>
      <Stack.Screen name="boxes" options={{ headerShown: false }} />
      <Stack.Screen
        name="[boxId]/boxView"
        options={{ title: "Box", headerShown: false }}
      />
      <Stack.Screen
        name="[boxId]/collections/addCollection"
        options={{
          title: "Add Collection",
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Icon name="chevron-left" size={42} color="white" />
            </TouchableOpacity>
          ),
          headerBackVisible: false,
          headerShadowVisible: false,

          headerStyle: {
            backgroundColor: "#1da422",
          },
          headerTitleStyle: {
            color: "white",
            fontSize: 32,
            fontWeight: "bold",
          },
        }}
      />
      <Stack.Screen
        name="[boxId]/collections/previewCollection/[previewColId]"
        options={{
          title: "Add Collection",
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Icon name="chevron-left" size={42} color="white" />
            </TouchableOpacity>
          ),
          headerBackVisible: false,
          headerShadowVisible: false,

          headerStyle: {
            backgroundColor: "#1da422",
          },
          headerTitleStyle: {
            color: "white",
            fontSize: 32,
            fontWeight: "bold",
          },
        }}
      />
      <Stack.Screen
        name="manage-collection/[collectionId]/index"
        options={{
          title: "Manage Collection",
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Icon name="chevron-left" size={42} color="white" />
            </TouchableOpacity>
          ),
          headerBackVisible: false,
          headerShadowVisible: false,

          headerStyle: {
            backgroundColor: "#1da422",
          },
          headerTitleStyle: {
            color: "white",
            fontSize: 32,
            fontWeight: "bold",
          },
        }}
      />
      <Stack.Screen
        name="manage-collection/[collectionId]/edit"
        options={{
          title: "Edit Collection",
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Icon name="chevron-left" size={42} color="white" />
            </TouchableOpacity>
          ),
          headerBackVisible: false,
          headerShadowVisible: false,

          headerStyle: {
            backgroundColor: "#1da422",
          },
          headerTitleStyle: {
            color: "white",
            fontSize: 32,
            fontWeight: "bold",
          },
        }}
      />
      <Stack.Screen
        name="manage-collection/[collectionId]/[cardId]"
        options={{
          title: "Edit Card",
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Icon name="chevron-left" size={42} color="white" />
            </TouchableOpacity>
          ),
          headerBackVisible: false,
          headerShadowVisible: false,

          headerStyle: {
            backgroundColor: "#1da422",
          },
          headerTitleStyle: {
            color: "white",
            fontSize: 32,
            fontWeight: "bold",
          },
        }}
      />
      <Stack.Screen
        name="manage-collection/[collectionId]/train"
        options={{
          title: "Train",
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Icon name="chevron-left" size={42} color="white" />
            </TouchableOpacity>
          ),
          headerBackVisible: false,
          headerShadowVisible: false,

          headerStyle: {
            backgroundColor: "#1da422",
          },
          headerTitleStyle: {
            color: "white",
            fontSize: 32,
            fontWeight: "bold",
          },
        }}
      />
    </Stack>
  );
};

export default BoxLayout;
