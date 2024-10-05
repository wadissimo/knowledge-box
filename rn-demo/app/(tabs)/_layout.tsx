import { View, Text } from "react-native";
import React from "react";
import { Tabs } from "expo-router";
import Icon from "react-native-ionicons";

const _layout = () => {
  return (
    <Tabs initialRouteName="box">
      {/* <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Icon size={28} name="home" color={color} />
          ),
        }}
      /> */}
      <Tabs.Screen
        name="box"
        options={{
          headerShown: false,
          title: "Boxes",
          tabBarIcon: ({ color }) => (
            <Icon size={28} name="cube" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="user"
        options={{
          title: "User",
          tabBarIcon: ({ color }) => (
            <Icon size={28} name="person" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <Icon size={28} name="cog" color={color} />
          ),
        }}
      />
    </Tabs>
  );
};

export default _layout;
