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
          backgroundColor: '#ffffffee',
          height: Sizes.tabBarHeight + 8,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          shadowColor: '#0288d1',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.13,
          shadowRadius: 16,
          elevation: 12,
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          borderTopWidth: 0,
        },
        tabBarActiveTintColor: '#0288d1',
        tabBarInactiveTintColor: '#b0bec5',
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 13,
          fontWeight: '600',
          marginBottom: 2,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
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
          tabBarIcon: ({ color, focused }: { color: string, focused: boolean }) => (
            <Ionicons size={focused ? 32 : 28} name="cube" color={color} style={focused ? { shadowColor: '#0288d1', shadowOpacity: 0.2, shadowRadius: 6 } : {}} />
          ),
        }}
      />
      <Tabs.Screen
        name="user"
        options={{
          title: i18n.t("menu.profile"),
          tabBarIcon: ({ color, focused }: { color: string, focused: boolean }) => (
            <Ionicons size={focused ? 32 : 28} name="person" color={color} style={focused ? { shadowColor: '#0288d1', shadowOpacity: 0.2, shadowRadius: 6 } : {}} />
          ),
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          headerShown: false,
          title: i18n.t("menu.settings"),
          tabBarIcon: ({ color, focused }: { color: string, focused: boolean }) => (
            <Ionicons size={focused ? 32 : 28} name="cog" color={color} style={focused ? { shadowColor: '#0288d1', shadowOpacity: 0.2, shadowRadius: 6 } : {}} />
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
