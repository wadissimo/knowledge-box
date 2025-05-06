import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { Href, Link, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '@react-navigation/native';
import { Sizes } from '@/src/constants/Sizes';
import { i18n } from '@/src/lib/i18n';

const BoxLayout = () => {
  const router = useRouter();
  const { colors } = useTheme();

  const headerTitleStyle = {
    color: '#fff', // White text for contrast
    fontSize: 28, // Slightly smaller for balance
    fontWeight: 'bold' as 'bold',
    height: 100,
    letterSpacing: 0.5,
    textShadowColor: '#1565c0', // Subtle shadow for visibility
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  };

  const defaultHeaderOptions = {
    headerShown: true,
    headerLeft: () => (
      <TouchableOpacity onPress={() => router.back()}>
        <Icon
          name="chevron-left"
          size={38}
          color="#fff"
          style={{
            textShadowColor: '#1565c0',
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 2,
          }}
        />
      </TouchableOpacity>
    ),
    headerBackVisible: false,
    headerShadowVisible: false,
    headerStyle: {
      height: Sizes.headerHeight,
      backgroundColor: '#2196f3', // Brighter blue
      borderBottomWidth: 0,
      elevation: 0,
      shadowOpacity: 0,
    },
    headerTitleStyle,
  };

  return (
    <Stack>
      <Stack.Screen
        name="boxes"
        options={{
          title: '',
          headerTitle: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="cube-outline" size={28} color="#fff" style={{ marginRight: 8 }} />
              <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#fff', letterSpacing: 0.5 }}>
                {i18n.t('boxes.myBoxesTitle')}
              </Text>
            </View>
          ),
          headerBackTitleVisible: false,
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: 'transparent',
            elevation: 0,
            shadowOpacity: 0,
          },
          ...defaultHeaderOptions,
          headerLeft: () => null,
        }}
      />
      <Stack.Screen
        name="[boxId]/boxView"
        options={{
          title: '',
          ...defaultHeaderOptions,
        }}
      />
      <Stack.Screen
        name="[boxId]/boxManage"
        options={{
          title: i18n.t('boxes.editBox'),
          ...defaultHeaderOptions,
        }}
      />
      <Stack.Screen name="[boxId]/boxTest" options={{ title: 'Box', headerShown: false }} />
      <Stack.Screen
        name="[boxId]/boxTest2"
        options={{
          title: '',
          ...defaultHeaderOptions,
        }}
      />
      <Stack.Screen
        name="newBox"
        options={{
          title: i18n.t('boxes.newBox'),
          ...defaultHeaderOptions,
        }}
      />
      <Stack.Screen
        name="[boxId]/collections/addCollection"
        options={{
          title: i18n.t('cards.cardsCollections'),
          ...defaultHeaderOptions,
        }}
      />
      <Stack.Screen
        name="[boxId]/collections/previewCollection/[previewColId]"
        options={{
          title: i18n.t('cards.addCollection'),
          ...defaultHeaderOptions,
        }}
      />
      <Stack.Screen
        name="manage-collection/[collectionId]/index"
        options={{
          title: i18n.t('cards.collection'),
          ...defaultHeaderOptions,
          headerRight: () => (
            <Link href={`./manage` as Href}>
              <Icon
                name="pencil-outline"
                size={32}
                color="#fff"
                style={{
                  textShadowColor: '#1565c0',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 2,
                }}
              />
            </Link>
          ),
        }}
      />
      <Stack.Screen
        name="manage-collection/[collectionId]/manage"
        options={{
          title: i18n.t('cards.manageCollection'),
          ...defaultHeaderOptions,
        }}
      />
      <Stack.Screen
        name="manage-collection/[collectionId]/edit"
        options={{
          title: i18n.t('cards.editCollection'),
          ...defaultHeaderOptions,
        }}
      />
      <Stack.Screen
        name="manage-collection/[collectionId]/[cardId]"
        options={{
          title: i18n.t('cards.editCard'),
          ...defaultHeaderOptions,
        }}
      />
      <Stack.Screen
        name="manage-collection/[collectionId]/train"
        options={{
          title: i18n.t('cards.trainHeader'),
          ...defaultHeaderOptions,
        }}
      />
      <Stack.Screen
        name="manage-collection/[collectionId]/trainOptions"
        options={{
          title: i18n.t('collection.train.options'),
          ...defaultHeaderOptions,
        }}
      />
      <Stack.Screen
        name="[boxId]/notes/newNote"
        options={{
          title: i18n.t('notes.newNote'),
          ...defaultHeaderOptions,
        }}
      />
      <Stack.Screen
        name="[boxId]/chats/newChat"
        options={{
          title: i18n.t('chats.chatHeader'),
          ...defaultHeaderOptions,
        }}
      />
    </Stack>
  );
};

export default BoxLayout;
