import { View, Text } from "react-native";
import React from "react";
import { Tabs } from "expo-router";
import Icon from "react-native-ionicons";

const _layout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: "#fff",
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
          title: "Boxes",
          tabBarIcon: ({ color }: { color: string }) => (
            <Icon size={28} name="cube" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="user"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }: { color: string }) => (
            <Icon size={28} name="person" color={color} />
          ),
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }: { color: string }) => (
            <Icon size={28} name="cog" color={color} />
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
