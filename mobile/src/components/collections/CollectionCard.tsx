import { useThemeColors } from '@/src/context/ThemeContext';
import { Collection } from '@/src/data/CollectionModel';
import { i18n } from '@/src/lib/i18n';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const CollectionCard = ({
  collection,
  onCollectionPress,
}: {
  collection: Collection;
  onCollectionPress: (collectionId: number) => void;
}) => {
  const { themeColors } = useThemeColors();
  return (
    <View
      style={[
        styles.collectionCard,
        styles.elevation,
        styles.shadowProp,
        { backgroundColor: themeColors.cardBg },
      ]}
    >
      <TouchableOpacity
        style={{
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'space-evenly',
        }}
        onPress={() => onCollectionPress(collection.id)}
      >
        <Text style={[styles.collectionNameTxt, { color: themeColors.text }]} numberOfLines={1}>
          {collection.name}
        </Text>
        <Text style={[styles.collectionDescrTxt, { color: themeColors.text }]} numberOfLines={3}>
          {collection.description}
        </Text>
        <Text style={[styles.collectionDescrTxt, { color: themeColors.text }]}>
          {i18n.t('cards.numCards')}: {collection.cardsNumber}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  collectionCard: {
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,

    backgroundColor: '#c2fbc4',
    margin: 5,
    height: 100,
    width: 240,
  },
  collectionNameTxt: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  collectionDescrTxt: {
    fontSize: 12,
  },
  shadowProp: {
    shadowColor: '#171717',
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  elevation: {
    elevation: 5,
    shadowColor: '#52006A',
  },
});
