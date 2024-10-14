import { View, Text } from "react-native";
import React from "react";
import { Tabs } from "expo-router";
import Icon from "react-native-ionicons";

const _layout = () => {
  return (
    <Tabs screenOptions={{}}>
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
    </Tabs>
  );
};

export default _layout;
