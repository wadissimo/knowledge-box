import {
  View,
  Text,
  Button,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Collection, useCollectionModel } from "@/data/CollectionModel";
import { useIsFocused } from "@react-navigation/native";
import { useBoxCollectionModel } from "@/data/BoxCollectionModel";
import MyCardCollections from "@/components/MyCardCollections";

import { Component } from "react";
import { WebView } from "react-native-webview";
import { Box, useBoxModel } from "@/data/BoxModel";
import Icon from "react-native-ionicons";

const BoxContent = () => {
  const router = useRouter();
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

  function handleAddCollection() {
    router.push(`/(tabs)/box/${boxId}/collections/addCollection`);
  }
  function handleAddNotePress() {
    router.push(`/(tabs)/box/${boxId}/notes/newNote`);
  }

  if (!box) return null;
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View>
        <View style={styles.header}>
          <Text style={styles.headerTxt}>{box.name}</Text>
        </View>

        <View style={styles.colContainer}>
          <Text style={styles.sectionHeaderText}>My Collections1</Text>
          <View style={styles.colListContainer}>
            <MyCardCollections collections={collections} />
          </View>
          <Button
            title="Add Collection"
            onPress={handleAddCollection}
            color={styles.addBtn.color}
          ></Button>
        </View>
        <View style={styles.notesView}>
          <Text style={styles.sectionHeaderText}>My Notes</Text>

          <Button
            title="New Note"
            onPress={handleAddNotePress}
            color={styles.addBtn.color}
          ></Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { paddingTop: 20, flex: 1, backgroundColor: "lightgrey" },
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
  colContainer: {
    padding: 5,
  },
  sectionHeaderText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  colListContainer: {
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
    height: 40,
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

export default BoxContent;
