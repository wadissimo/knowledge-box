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
} from "react-native";
import React, { useState } from "react";
import { Collection, useCollectionModel } from "@/data/CollectionModel";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useBoxCollectionModel } from "@/data/BoxCollectionModel";
import SeparatorWithText from "@/components/utils/SeparatorWithText";
import CreateCollectionForm from "@/components/collections/CreateCollectionForm";
import Icon from "react-native-ionicons";
import useCollectionRemoteService from "@/service/CollectionRemoteService";
import SearchTags from "@/components/collections/SearchTags";

const AddCollection = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Collection[]>([]);

  const [noResults, setNoResults] = useState<boolean>(false);

  const { newCollection } = useCollectionModel();
  const { newBoxCollection } = useBoxCollectionModel();
  const { boxId } = useLocalSearchParams();
  const router = useRouter();

  const { error, loading, searchCollections } = useCollectionRemoteService();

  const handleCollectionCreate = async (name: string) => {
    const colId = await newCollection(name, null, null, 0, null);
    await newBoxCollection(Number(boxId), colId);
    router.back();
  };

  const handleSearch = () => {
    searchCollections(searchQuery)
      .then((collections) => {
        if (error) {
          console.log("Error fetching collection");
        } else if (!collections || collections.length == 0) {
          setNoResults(true);
          setSearchResults([]);
        } else {
          setNoResults(false);

          setSearchResults(collections);
        }
      })
      .finally(() => {
        // Hide keyboard after search
        Keyboard.dismiss();
      });
  };

  const handleCollectionPress = (collectionId: number) => {
    console.log("Collection ID clicked", collectionId);
    router.push(
      `/(tabs)/box/${boxId}/collections/previewCollection/${collectionId}`
    );
  };

  const handleTagPress = (tag: string) => {
    setSearchQuery(tag);
  };
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <View style={styles.searchContainer}>
            <Text style={styles.searchText}>Search</Text>
            <View style={styles.searchBar}>
              <TextInput
                style={styles.input}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search Collections"
              />

              {searchQuery.length > 0 && (
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={handleSearch}
                >
                  <Icon name="search" size={24} color="#333" />
                </TouchableOpacity>
              )}
            </View>
            <SearchTags onTagPressed={handleTagPress} />
          </View>

          <ScrollView>
            <View style={styles.searchResult}>
              {noResults ? (
                <View>
                  <Text>No results</Text>
                </View>
              ) : (
                searchResults.map((searchResult) => (
                  <View
                    key={`sr_${searchResult.id}`}
                    style={[
                      styles.searchResultBox,
                      styles.elevation,
                      styles.shadowProp,
                    ]}
                  >
                    <TouchableOpacity
                      onPress={() => handleCollectionPress(searchResult.id)}
                    >
                      <Text
                        style={styles.searchResultNameTxt}
                        numberOfLines={1}
                      >
                        {searchResult.name}
                      </Text>
                      <Text
                        style={styles.searchResultDescrTxt}
                        numberOfLines={3}
                      >
                        {searchResult.description}
                      </Text>
                      <Text>Cards: {searchResult.cardsNumber}</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          </ScrollView>
          <SeparatorWithText text="or" />
          <CreateCollectionForm onCreate={handleCollectionCreate} />
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    backgroundColor: "#1da422",
    height: 80,
  },
  headerTxt: {
    color: "white",
    fontSize: 36,
    fontWeight: "bold",
  },
  container: {
    flex: 1,
    paddingBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: "#F5F5F5",
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
    fontWeight: "bold",
    marginVertical: 10,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  input: {
    flex: 1,
    backgroundColor: "#FFF",
    borderColor: "#DDD",
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    fontSize: 16,
    color: "#333",
    paddingRight: 40,
  },
  iconButton: {
    position: "absolute",
    right: 10,
    padding: 5,
  },
  searchResultBox: {
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "lightgrey",
    backgroundColor: "#c2fbc4",
    margin: 5,
    height: 100,
  },
  searchResultNameTxt: {
    fontSize: 16,
    fontWeight: "bold",
  },
  searchResultDescrTxt: {
    fontSize: 12,
  },

  shadowProp: {
    shadowColor: "#171717",
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  elevation: {
    elevation: 5,
    shadowColor: "#52006A",
  },
});

export default AddCollection;
