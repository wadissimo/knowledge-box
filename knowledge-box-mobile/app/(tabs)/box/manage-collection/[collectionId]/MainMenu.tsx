import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/src/constants/Colors';
import { i18n } from '@/src/lib/i18n';

interface MainMenuProps {
  visible: boolean;
  onOpen: () => void;
  onClose: () => void;
  onAddCard: () => void;
  onAskAI: () => void;
  onEditCollection: () => void;
  onDeleteCollection: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  visible,
  onOpen,
  onClose,
  onAddCard,
  onAskAI,
  onEditCollection,
  onDeleteCollection,
}) => (
  <View
    style={{ position: 'absolute', bottom: 62, right: 24, zIndex: 1000, elevation: 20 }}
    pointerEvents="box-none"
  >
    <Menu opened={visible} onBackdropPress={onClose}>
      <MenuTrigger customStyles={{ TriggerTouchableComponent: TouchableOpacity }}>
        <TouchableOpacity
          style={{
            backgroundColor: Colors.light.tint,
            borderRadius: 50,
            padding: 16,
            elevation: 20,
            zIndex: 1001,
          }}
          onPress={onOpen}
          accessibilityLabel="Show collection actions"
          activeOpacity={0.8}
        >
          <Ionicons name="ellipsis-horizontal" size={32} color="#fff" />
        </TouchableOpacity>
      </MenuTrigger>
      <MenuOptions
        customStyles={{
          optionsContainer: { borderRadius: 18, padding: 4, zIndex: 1002, elevation: 21 },
        }}
      >
        <MenuOption onSelect={onAddCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 8 }}>
            <Ionicons
              name="add-circle-outline"
              size={22}
              color={Colors.light.tint}
              style={{ marginRight: 8 }}
            />
            <Text>{i18n.t('cards.addCardBtn')}</Text>
          </View>
        </MenuOption>
        <MenuOption onSelect={onAskAI}>
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 8 }}>
            <Ionicons
              name="sparkles"
              size={22}
              color={Colors.light.tint}
              style={{ marginRight: 8 }}
            />
            <Text>{i18n.t('cards.askAiBtn') || 'Ask AI to Generate'}</Text>
          </View>
        </MenuOption>
        <MenuOption onSelect={onEditCollection}>
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 8 }}>
            <Ionicons
              name="create-outline"
              size={22}
              color={Colors.light.tint}
              style={{ marginRight: 8 }}
            />
            <Text>{i18n.t('cards.editCollection')}</Text>
          </View>
        </MenuOption>
        <MenuOption
          onSelect={onDeleteCollection}
          customStyles={{
            optionWrapper: { backgroundColor: Colors.light.deleteBtn + '22', borderRadius: 10 },
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 8 }}>
            <Ionicons
              name="trash-outline"
              size={22}
              color={Colors.light.deleteBtn}
              style={{ marginRight: 8 }}
            />
            <Text style={{ color: Colors.light.deleteBtn, fontWeight: 'bold' }}>
              {i18n.t('cards.deleteCollection')}
            </Text>
          </View>
        </MenuOption>
      </MenuOptions>
    </Menu>
  </View>
);
