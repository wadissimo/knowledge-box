import React from 'react';
import { Tabs } from 'expo-router';
import { Sizes } from '@/src/constants/Sizes';
import { i18n } from '@/src/lib/i18n';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useThemeColors } from '@/src/context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const _layout = () => {
  const { themeColors } = useThemeColors();
  const insets = useSafeAreaInsets();
  console.log('(tabs)/_layout.tsx insets', insets);
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: themeColors.tabsBg,
          height: Sizes.tabBarHeight,

          shadowColor: '#0288d1',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.13,
          shadowRadius: 16,
          elevation: 12,
          borderTopWidth: 0,
        },

        tabBarActiveTintColor: themeColors.activeTintColor,
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
        tabBarLabelPosition: 'below-icon', // <- add this
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
          title: i18n.t('menu.boxes'),
          tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
            <Ionicons
              size={focused ? 32 : 28}
              name="cube"
              color={color}
              style={focused ? { shadowColor: '#0288d1', shadowOpacity: 0.2, shadowRadius: 6 } : {}}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="user"
        options={{
          title: i18n.t('menu.profile'),
          tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
            <Ionicons
              size={focused ? 32 : 28}
              name="person"
              color={color}
              style={focused ? { shadowColor: '#0288d1', shadowOpacity: 0.2, shadowRadius: 6 } : {}}
            />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          headerShown: false,
          title: i18n.t('menu.settings'),
          tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
            <Ionicons
              size={focused ? 32 : 28}
              name="cog"
              color={color}
              style={focused ? { shadowColor: '#0288d1', shadowOpacity: 0.2, shadowRadius: 6 } : {}}
            />
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
