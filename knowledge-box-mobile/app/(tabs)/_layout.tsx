import { View, Text } from "react-native";
import React from "react";
import { Tabs } from "expo-router";
import { Sizes } from "@/src/constants/Sizes";
import { i18n } from "@/src/lib/i18n";
import Ionicons from "@expo/vector-icons/Ionicons";

const _layout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: "#fff",
          height: Sizes.tabBarHeight,
        },
        tabBarActiveTintColor: "#444",
        tabBarInactiveTintColor: "#aaa",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="box"
        options={{
          headerShown: false,
          title: i18n.t("menu.boxes"),
          tabBarIcon: ({ color }: { color: string }) => (
            <Ionicons size={28} name="cube" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="user"
        options={{
          title: i18n.t("menu.profile"),
          tabBarIcon: ({ color }: { color: string }) => (
            <Ionicons size={28} name="person" color={color} />
          ),
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          headerShown: false,
          title: i18n.t("menu.settings"),
          tabBarIcon: ({ color }: { color: string }) => (
            <Ionicons size={28} name="cog" color={color} />
          ),
        }}
      />
      {/* <Tabs.Screen
        name="boxTest"
        options={{
          title: "Test",
          tabBarIcon: ({ color }: { color: string }) => (
            <Icon size={28} name="cog" color={color} />
          ),
        }}
      /> */}
      {/* <Tabs.Screen
        name="boxShadow"
        options={{
          title: "Shadow",
          tabBarIcon: ({ color }: { color: string }) => (
            <Icon size={28} name="cog" color={color} />
          ),
        }}
      /> */}
    </Tabs>
  );
};

export default _layout;
