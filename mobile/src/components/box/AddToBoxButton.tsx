import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Menu, MenuOption, MenuOptions, MenuTrigger } from 'react-native-popup-menu';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { i18n } from '@/src/lib/i18n';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/src/context/ThemeContext';

export const AddToBoxModal = ({ boxId }: { boxId: number }) => {
  const { themeColors } = useThemeColors();
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const router = useRouter();

  const handleAddCollection = () => {
    setShowAddModal(false);
    addCollection();
  };
  const handleAddCards = () => {
    setShowAddModal(false);
  };

  const handleAddNote = () => {
    setShowAddModal(false);
    router.push(`/(tabs)/box/${boxId}/notes/edit/new`);
  };

  function addCollection() {
    router.push(`/(tabs)/box/${boxId}/collections/addCollection`);
  }

  return (
    <TouchableOpacity
      style={[
        styles.addFab,
        { backgroundColor: themeColors.primaryBtnBg, shadowColor: themeColors.primaryBtnShadow },
      ]}
      onPress={() => setShowAddModal(true)}
    >
      <Icon name="plus" size={32} color={themeColors.primaryBtnText} />
      <Menu
        opened={showAddModal}
        onBackdropPress={() => setShowAddModal(false)}
        style={{ backgroundColor: themeColors.popupBg }}
      >
        <MenuTrigger />
        <MenuOptions
          customStyles={{
            optionsContainer: {
              backgroundColor: themeColors.popupBg,
              borderRadius: 14,
              padding: 8,
              minWidth: 260,
            },
          }}
        >
          <Text style={[styles.modalTitle, { color: themeColors.popupText }]}>
            {i18n.t('box.addTitle')}
          </Text>
          <MenuOption onSelect={handleAddCollection}>
            <View style={styles.menuOptionRow}>
              <Ionicons
                name="albums-outline"
                size={22}
                color={themeColors.headerBg}
                style={{ marginRight: 8 }}
              />
              <Text style={{ color: themeColors.popupText }}>{i18n.t('boxes.flashCards')}</Text>
            </View>
          </MenuOption>
          <MenuOption onSelect={handleAddNote}>
            <View style={styles.menuOptionRow}>
              <Icon
                name="note-plus-outline"
                size={22}
                color={themeColors.headerBg}
                style={{ marginRight: 8 }}
              />
              <Text style={{ color: themeColors.popupText }}>{i18n.t('box.newNote')}</Text>
            </View>
          </MenuOption>
        </MenuOptions>
      </Menu>
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({
  addFab: {
    position: 'absolute',
    zIndex: 1000,
    right: 10,
    bottom: 10,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4f8cff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#4f8cff',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    marginTop: 12,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  menuOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
});
