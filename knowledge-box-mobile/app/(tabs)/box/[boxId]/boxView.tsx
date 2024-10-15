import {
  View,
  Text,
  Button,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React, { ReactNode, useEffect, useState } from "react";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { Collection } from "@/data/CollectionModel";
import { useIsFocused, useTheme } from "@react-navigation/native";
import { useBoxCollectionModel } from "@/data/BoxCollectionModel";

import { Box, useBoxModel } from "@/data/BoxModel";
//import Icon from "react-native-ionicons";
import Icon from "react-native-vector-icons/MaterialIcons";

import MyCardCollectionsCarousel from "@/components/MyCardCollectionsCarousel";

const ICON_SIZE = 22;
const BoxViewContent = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const navigation = useNavigation();

  const { boxId } = useLocalSearchParams();
  const { getBoxById } = useBoxModel();
  const { fetchCollectionsByBoxId } = useBoxCollectionModel();
  const [collections, setCollections] = useState<Collection[]>([]);

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
    <SafeAreaView style={styles.container}>
      {/* <View style={[styles.header, { backgroundColor: colors.card }]}>
        <Text style={styles.headerTxt}>{box.description}</Text>
      </View> */}
      <ScrollView style={styles.boxContainer}>
        <BoxSection name="My Collections">
          <MyCardCollectionsCarousel collections={collections} />
        </BoxSection>
        <BoxSection name="My Notes">
          <MyCardCollectionsCarousel collections={collections} />
        </BoxSection>
        <BoxSection name="My Chats">
          <MyCardCollectionsCarousel collections={collections} />
        </BoxSection>

        <View style={styles.footer}>
          <Button title="Test" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const BoxSection = ({
  name,
  children,
}: {
  name: string;
  children: ReactNode;
}) => {
  return (
    <View style={styles.sectionContainer}>
      <View style={[styles.sectionHeader]}>
        <Text style={[styles.sectionHeaderText]}>{name}</Text>
        {/* <View style={styles.sectionIcons}>
              <Icon name="expand-less" size={ICON_SIZE} color="black" />
              <Icon name="expand-more" size={ICON_SIZE} color="black" />
              <Icon name="add-circle-outline" size={ICON_SIZE} color="black" />
            </View> */}
      </View>
      <View style={[styles.colListContainer]}>
        {children}
        {/* <MyCardCollectionsCarousel collections={collections} /> */}
      </View>
      <View style={styles.sectionFooter}></View>
      {/* <Button
            title="Add Collection"
            onPress={handleAddCollection}
            color={colors.primary}
          ></Button> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    margin: 2,
  },
  headerTxt: {
    fontSize: 16,
  },
  boxContainer: {
    paddingTop: 0,
    // paddingHorizontal: 10,
    paddingBottom: 10,
  },
  sectionContainer: {
    // borderColor: "#eee",
    // borderWidth: 1,
    borderBottomWidth: 0,
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    marginHorizontal: 10,
    backgroundColor: "#eee",

    // padding: 5,
  },
  sectionHeader: {
    paddingHorizontal: 5,
    paddingVertical: 7,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#c2fbc4",
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    backgroundColor: "#c2fbc4",

    elevation: 2,
  },
  sectionHeaderText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "black",

    flex: 1,
  },
  sectionFooter: {
    height: 10,
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    backgroundColor: "#cad1ca",
  },
  sectionIcons: { flexDirection: "row", gap: 32 },
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

  footer: {
    paddingVertical: 10,
  },
});

export default BoxViewContent;
