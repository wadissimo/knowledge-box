import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import {
  Href,
  Link,
  Stack,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useTheme } from "@react-navigation/native";
import { Sizes } from "@/constants/Sizes";

const BoxLayout = () => {
  const router = useRouter();
  const { colors } = useTheme();

  const headerTitleStyle = {
    color: "white",
    fontSize: 32,
    fontWeight: "bold" as "bold",
    height: 100,
  };

  const defaultHeaderOptions = {
    headerShown: true,
    headerLeft: () => (
      <TouchableOpacity onPress={() => router.back()}>
        <Icon name="chevron-left" size={42} color="white" />
      </TouchableOpacity>
    ),
    headerBackVisible: false,
    headerShadowVisible: false,
    headerStyle: {
      height: Sizes.headerHeight,
      backgroundColor: colors.primary,
    },
    headerTitleStyle,
  };

  return (
    <Stack>
      <Stack.Screen
        name="boxes"
        options={{
          title: "My Boxes",

          ...defaultHeaderOptions,
          headerLeft: () => null,
        }}
      />
      <Stack.Screen
        name="[boxId]/boxView"
        options={{
          title: "",
          ...defaultHeaderOptions,
        }}
      />
      <Stack.Screen
        name="[boxId]/boxManage"
        options={{
          title: "Edit Box",
          ...defaultHeaderOptions,
        }}
      />
      <Stack.Screen
        name="[boxId]/boxTest"
        options={{ title: "Box", headerShown: false }}
      />
      <Stack.Screen
        name="[boxId]/boxTest2"
        options={{
          title: "",
          ...defaultHeaderOptions,
        }}
      />
      <Stack.Screen
        name="newBox"
        options={{
          title: "New Box",
          ...defaultHeaderOptions,
        }}
      />
      <Stack.Screen
        name="[boxId]/collections/addCollection"
        options={{
          title: "Cards Collections",
          ...defaultHeaderOptions,
        }}
      />
      <Stack.Screen
        name="[boxId]/collections/previewCollection/[previewColId]"
        options={{
          title: "Add Collection",
          ...defaultHeaderOptions,
        }}
      />
      <Stack.Screen
        name="manage-collection/[collectionId]/index"
        options={{
          title: "Collection",
          ...defaultHeaderOptions,
          headerRight: () => (
            <Link href={`./manage` as Href}>
              <Icon name="pencil-outline" size={32} color="white" />
            </Link>
          ),
        }}
      />
      <Stack.Screen
        name="manage-collection/[collectionId]/manage"
        options={{
          title: "Manage Collection",
          ...defaultHeaderOptions,
        }}
      />
      <Stack.Screen
        name="manage-collection/[collectionId]/edit"
        options={{
          title: "Edit Collection",
          ...defaultHeaderOptions,
        }}
      />
      <Stack.Screen
        name="manage-collection/[collectionId]/[cardId]"
        options={{
          title: "Edit Card",
          ...defaultHeaderOptions,
        }}
      />
      <Stack.Screen
        name="manage-collection/[collectionId]/train"
        options={{
          title: "Train",
          ...defaultHeaderOptions,
        }}
      />
      <Stack.Screen
        name="[boxId]/notes/newNote"
        options={{
          title: "New Note",
          ...defaultHeaderOptions,
        }}
      />
      <Stack.Screen
        name="[boxId]/chats/newChat"
        options={{
          title: "Chat",
          ...defaultHeaderOptions,
        }}
      />
    </Stack>
  );
};

export default BoxLayout;
