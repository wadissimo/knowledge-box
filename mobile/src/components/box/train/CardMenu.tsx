import { useThemeColors } from '@/src/context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Menu, MenuOption, MenuOptions, MenuTrigger } from 'react-native-popup-menu';
import { i18n } from '@/src/lib/i18n';
import { StyleSheet, Text } from 'react-native';

const CardMenu = ({
  onEdit,
  onPostpone,
  onMarkEasy,
}: {
  onEdit: Function;
  onPostpone: Function;
  onMarkEasy: Function;
}) => {
  const { themeColors } = useThemeColors();

  return (
    <Menu>
      <MenuTrigger>
        <Icon
          name="dots-vertical"
          color={themeColors.subHeaderText}
          size={32}
          style={styles.topPanelMenuIcon}
        />
      </MenuTrigger>
      <MenuOptions customStyles={{ optionWrapper: { backgroundColor: themeColors.popupBg } }}>
        <MenuOption onSelect={() => onEdit()}>
          <Text>{i18n.t('cards.popupMenu.editCard')}</Text>
        </MenuOption>

        <MenuOption onSelect={() => onPostpone()}>
          <Text>{i18n.t('cards.popupMenu.postpone')}</Text>
        </MenuOption>
        <MenuOption onSelect={() => onMarkEasy()}>
          <Text>{i18n.t('cards.popupMenu.tooEasy')}</Text>
        </MenuOption>
      </MenuOptions>
    </Menu>
  );
};
const styles = StyleSheet.create({
  topPanelMenuIcon: {
    marginLeft: 10,
  },
});
export default CardMenu;
