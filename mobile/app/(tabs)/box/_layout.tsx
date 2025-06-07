import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { Href, Link, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { i18n } from '@/src/lib/i18n';
import { useHeaderOptions, useHeaderTitleStyle, useThemeColors } from '@/src/context/ThemeContext';

const BoxLayout = () => {
  const { themeColors } = useThemeColors();
  const defaultHeaderOptions = useHeaderOptions();
  const headerTitleStyle = useHeaderTitleStyle();

  return (
    <Stack>
      <Stack.Screen
        name="boxes"
        options={{
          title: '',
          headerTitle: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons
                name="cube-outline"
                size={28}
                color={themeColors.headerText}
                style={[headerTitleStyle, { marginRight: 8 }]}
              />
              <Text style={headerTitleStyle}>{i18n.t('boxes.myBoxesTitle')}</Text>
            </View>
          ),

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
        name="manage-collection/[collectionId]/main"
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
                  textShadowColor: themeColors.headerTextShadowColor,
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
          title: i18n.t('cards.editCardTitle'),
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
        name="manage-collection/[collectionId]/trainingResults/[sessionId]"
        options={{
          title: i18n.t('collection.train.trainingResults'),
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
        name="[boxId]/notes/edit/[textNoteId]"
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
