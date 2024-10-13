import {
  View,
  Text,
  Button,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { Collection } from "@/data/CollectionModel";
import { useIsFocused, useTheme } from "@react-navigation/native";
import { useBoxCollectionModel } from "@/data/BoxCollectionModel";

import { Box, useBoxModel } from "@/data/BoxModel";
//import Icon from "react-native-ionicons";
import Icon from "react-native-vector-icons/MaterialIcons";
import MyCardCollectionsCarousel from "@/components/MyCardCollectionsCarousel";

const BoxViewContent = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const navigation = useNavigation();

  const { boxId } = useLocalSearchParams();
  const { getBoxById } = useBoxModel();
  const { fetchCollectionsByBoxId } = useBoxCollectionModel();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [box, setBox] = useState<Box | null>(null);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      getBoxById(Number(boxId)).then((res) => setBox(res));
      fetchCollectionsByBoxId(Number(boxId)).then((res) => setCollections(res));
    }
  }, [isFocused]);

  useEffect(() => {
    if (box !== null) {
      navigation.setOptions({
        title: box.name,
        headerShown: true,
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()}>
            <Icon name="chevron-left" size={42} color="white" />
          </TouchableOpacity>
        ),
        headerBackVisible: false,
        headerShadowVisible: false,

        headerStyle: {
          backgroundColor: "#1da422",
        },
        headerTitleStyle: {
          color: "white",
          fontSize: 32,
          fontWeight: "bold",
        },
      });
    }
  }, [box]);

  function handleAddCollection() {
    router.push(`/(tabs)/box/${boxId}/collections/addCollection`);
  }
  function handleAddNotePress() {
    router.push(`/(tabs)/box/${boxId}/notes/newNote`);
  }
  function handleAddChatPress() {
    router.push(`/(tabs)/box/${boxId}/chats/newChat`);
  }

  if (!box) return null;
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View>
        {/* <View style={styles.header}>
          <Text style={styles.headerTxt}>{box.name}</Text>
        </View> */}

        <View style={styles.colContainer}>
          <Text style={styles.sectionHeaderText}>My Collections</Text>
          <View style={styles.colListContainer}>
            <MyCardCollectionsCarousel collections={collections} />
          </View>
          <Button
            title="Add Collection"
            onPress={handleAddCollection}
            color={colors.primary}
          ></Button>
        </View>
        <View style={styles.notesView}>
          <Text style={styles.sectionHeaderText}>My Notes</Text>
          <View style={styles.notesContainer}>
            <MyCardCollectionsCarousel collections={collections} />
          </View>
          <Button
            title="New Note"
            onPress={handleAddNotePress}
            color={colors.primary}
          ></Button>
        </View>
        <View style={styles.notesView}>
          <Text style={styles.sectionHeaderText}>My Chats</Text>
          <View style={styles.chatsContainer}>
            <MyCardCollectionsCarousel collections={collections} />
          </View>
          <Button
            title="New Chat"
            onPress={handleAddChatPress}
            color={colors.primary}
          ></Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { paddingTop: 20, flex: 1, backgroundColor: "lightgrey" },
  colContainer: {
    // padding: 5,
  },
  sectionHeaderText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  colListContainer: {
    padding: 10,
  },
  notesContainer: {
    // height: 100,
    padding: 10,
  },
  chatsContainer: {
    // height: 100,
    padding: 10,
  },
  addBtn: {
    color: "#4CAF50",
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "grey",
    marginVertical: 1,
  },
  notesView: {},
  webView: {
    flex: 1,
    elevation: 4,
    backgroundColor: "orange",
  },
  tib: {
    textAlign: "center",
    color: "#515156",
  },
  notesPanel: {
    height: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  addBoxBtn: {
    backgroundColor: "#1da422",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",

    alignSelf: "center", // Center horizontally
  },
  addBoxBtnTxt: {
    color: "white",
    fontSize: 56,
    fontWeight: "bold",
  },
});

export default BoxViewContent;
