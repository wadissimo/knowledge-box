import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  SafeAreaView,
  FlatList,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { Collection, useCollectionModel } from '@/src/data/CollectionModel';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useBoxCollectionModel } from '@/src/data/BoxCollectionModel';
import SeparatorWithText from '@/src/components/utils/SeparatorWithText';
import CreateCollectionForm from '@/src/components/collections/CreateCollectionForm';
import Ionicons from '@expo/vector-icons/Ionicons';
import useCollectionRemoteService, {
  CollectionGroup,
  convertServerCollectionGroup,
  ServerCollectionGroup,
  ServerGroup,
} from '@/src/service/CollectionRemoteService';
import SearchTags from '@/src/components/collections/SearchTags';
import { i18n } from '@/src/lib/i18n';
import ScreenContainer from '@/src/components/common/ScreenContainer';
import { useThemeColors } from '@/src/context/ThemeContext';
import { CollectionCard } from '@/src/components/collections/CollectionCard';
import { ActivityIndicator } from 'react-native';
type LibraryGroup = {
  id: number;
  name: string;
  description: string;
  collections: Collection[];
};
const OTHER_GROUP_ID = 0;

function prepareGroupLibrary(
  groups: ServerGroup[],
  collections: Collection[],
  collectionGroups: CollectionGroup[]
): LibraryGroup[] {
  const libraryGroupMap = new Map<number, LibraryGroup>();
  const collectionMap = new Map<number, Collection>();
  for (const collection of collections) {
    collectionMap.set(collection.id, collection);
  }
  for (const group of groups) {
    libraryGroupMap.set(group.id, {
      id: group.id,
      name: group.name,
      description: group.description,
      collections: [],
    });
  }
  console.log('libraryGroupMap', libraryGroupMap);

  var mappedCollections: Collection[] = [];
  for (const collectionGroup of collectionGroups) {
    const group = libraryGroupMap.get(collectionGroup.groupId);
    const collection = collectionMap.get(collectionGroup.collectionId);

    if (group !== undefined && collection !== undefined) {
      group.collections.push(collection);
      mappedCollections.push(collection);
    } else {
      console.warn('no mapping found');
    }
  }
  const unmappedCollections: Collection[] = collections.filter(
    collection => !mappedCollections.includes(collection)
  );
  for (const collection of unmappedCollections) {
    libraryGroupMap.get(OTHER_GROUP_ID)?.collections.push(collection);
  }

  var libraryGroups: LibraryGroup[] = Array.from(libraryGroupMap.values());
  //put 0s(Other group) element to the end of the library group
  libraryGroups.sort((a, b) => (a.id === OTHER_GROUP_ID ? 1 : b.id === OTHER_GROUP_ID ? -1 : 0));
  // remove groups without collections
  libraryGroups = libraryGroups.filter(group => group.collections.length > 0);

  return libraryGroups;
}
const AddCollection = () => {
  const { themeColors } = useThemeColors();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Collection[]>([]);
  const [showLibrary, setShowLibrary] = useState<boolean>(true);

  const [noResults, setNoResults] = useState<boolean>(false);

  const { newCollection } = useCollectionModel();
  const { newBoxCollection } = useBoxCollectionModel();
  const { boxId } = useLocalSearchParams();
  const router = useRouter();

  const { error, loading, searchCollections, fetchLibrary } = useCollectionRemoteService();
  const [library, setLibrary] = useState<LibraryGroup[]>([]);

  useEffect(() => {
    const run = async () => {
      const data = await fetchLibrary();
      if (data !== null) {
        const groups = data.groups;
        const collections = data.collections;
        const collectionGroups = data.collectionGroups.map(
          (collectionGroup: ServerCollectionGroup) => convertServerCollectionGroup(collectionGroup)
        );

        const libraryGroups = prepareGroupLibrary(groups, collections, collectionGroups);

        setLibrary(libraryGroups);
      }
    };
    run();
  }, []);
  useEffect(() => {
    if (searchQuery === '') {
      setShowLibrary(true);
    }
  }, [searchQuery]);
  const handleCollectionCreate = async (name: string) => {
    const colId = await newCollection(name, null, null, 0, null);
    await newBoxCollection(Number(boxId), colId);
    router.back();
  };

  const handleSearch = () => {
    searchCollections(searchQuery)
      .then(collections => {
        if (error) {
          console.log('Error fetching collection');
        } else if (!collections || collections.length == 0) {
          setNoResults(true);
          setShowLibrary(false);
          setSearchResults([]);
        } else {
          setNoResults(false);
          setShowLibrary(false);
          setSearchResults(collections);
        }
      })
      .finally(() => {
        // Hide keyboard after search
        Keyboard.dismiss();
      });
  };
  const handleClearSearch = () => {
    setSearchQuery('');
    setShowLibrary(true);
  };

  const handleCollectionPress = (collectionId: number) => {
    console.log('Collection ID clicked', collectionId);
    router.push(`/(tabs)/box/${boxId}/collections/previewCollection/${collectionId}`);
  };

  const handleTagPress = (tag: string) => {
    setSearchQuery(tag);
  };

  console.log('rendering addCollections');
  return (
    <ScreenContainer>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <View style={styles.searchContainer}>
            <Text style={[styles.searchText, { color: themeColors.text }]}>
              {i18n.t('cards.search')}
            </Text>
            <View style={styles.searchBar}>
              <TextInput
                style={styles.input}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder={i18n.t('cards.searchPlaceholder')}
              />

              {searchQuery.length > 0 && (
                <View style={styles.iconButtons}>
                  <TouchableOpacity style={styles.iconButton} onPress={handleClearSearch}>
                    <Ionicons name="close" size={24} color="#333" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconButton} onPress={handleSearch}>
                    <Ionicons name="search" size={24} color="#333" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
            <SearchTags onTagPressed={handleTagPress} />
          </View>
          {error && (
            <View>
              <Text>Error: {error}</Text>
            </View>
          )}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#000" />
            </View>
          ) : (
            <ScrollView>
              {showLibrary ? (
                <View>
                  {library.map(group => (
                    <View key={`group_${group.id}`}>
                      <Text style={styles.groupHeader}>{group.name}</Text>
                      <FlatList
                        horizontal
                        data={group.collections}
                        renderItem={({ item }) => (
                          <CollectionCard
                            key={`collection_${item.id}`}
                            collection={item}
                            onCollectionPress={handleCollectionPress}
                          />
                        )}
                      />
                    </View>
                  ))}
                </View>
              ) : (
                <CollectionSearchRestults
                  searchResults={searchResults}
                  onCollectionPress={handleCollectionPress}
                />
              )}
            </ScrollView>
          )}

          <SeparatorWithText text={i18n.t('common.or')} />
          <CreateCollectionForm onCreate={handleCollectionCreate} />
        </View>
      </TouchableWithoutFeedback>
    </ScreenContainer>
  );
};

const CollectionSearchRestults = ({
  searchResults,
  onCollectionPress,
}: {
  searchResults: Collection[];
  onCollectionPress: (collectionId: number) => void;
}) => {
  const { themeColors } = useThemeColors();
  const noResults = searchResults.length === 0;
  return (
    <View style={styles.searchResult}>
      {noResults ? (
        <View>
          <Text style={{ color: themeColors.text }}>{i18n.t('cards.searchNoResults')}</Text>
        </View>
      ) : (
        searchResults.map(collection => (
          <CollectionCard
            key={`collection_${collection.id}`}
            collection={collection}
            onCollectionPress={onCollectionPress}
          />
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    backgroundColor: '#1da422',
    height: 80,
  },
  headerTxt: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    paddingBottom: 10,
    paddingHorizontal: 10,
    //backgroundColor: "#F5F5F5",
  },
  searchContainer: {
    flex: 0,
    marginBottom: 20,
  },
  searchResult: {
    flex: 1,
  },
  searchText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  input: {
    flex: 1,
    backgroundColor: '#FFF',
    borderColor: '#DDD',
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    fontSize: 16,
    color: '#333',
    paddingRight: 40,
  },

  iconButtons: {
    position: 'absolute',
    right: 0,
    padding: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButton: {
    padding: 10,
  },
  groupHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 5,
  },
});

export default AddCollection;
