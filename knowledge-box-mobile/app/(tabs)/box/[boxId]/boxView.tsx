import { useBoxCollectionModel } from "@/src/data/BoxCollectionModel";
import { Box, useBoxModel } from "@/src/data/BoxModel";
import { Collection } from "@/src/data/CollectionModel";
import { useIsFocused, useTheme } from "@react-navigation/native";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { i18n } from "@/src/lib/i18n";
import BoxSection from "@/src/components/box/BoxSection";
import NotesBoxSection from "@/src/components/box/NotesBoxSection";
import ToolsBoxSection from "@/src/components/box/ToolsBoxSection";
import CollectionBoxSection from "@/src/components/box/CollectionBoxSection";
import { Dimensions } from "react-native";
import { Sizes } from "@/src/constants/Sizes";

const BOX_SECTION_HEADER_SIZE = 40;
const COLLAPSED_SECTION_SIZE = BOX_SECTION_HEADER_SIZE + 50;
//const AnimatedBoxSection = Animated.createAnimatedComponent(BoxSection);

const BoxView = () => {
  const { colors } = useTheme();

  const [expandedSection, setExpandedSection] = useState<number | null>(null);
  
  const [loading, setLoading] = useState<boolean>(true);

  const insets = useSafeAreaInsets();

  const router = useRouter();
  const navigation = useNavigation();

  const { boxId } = useLocalSearchParams();
  const { getBoxById } = useBoxModel();
  const { fetchCollectionsByBoxId } = useBoxCollectionModel();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [box, setBox] = useState<Box | null>(null);

  const isFocused = useIsFocused();
  //const headerHeight = useHeaderHeight();
  const availableHeight = Dimensions.get("window").height - Sizes.headerHeight - Sizes.tabBarHeight;
  console.log("availableHeight", availableHeight, Dimensions.get("window").height, Sizes.headerHeight, Sizes.tabBarHeight);
  // const numSections = 2 + collections.length;
  const numSections = collections.length;
  console.log("numSections", numSections);
  const sectionSize = availableHeight / numSections;
  
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const box = await getBoxById(Number(boxId));
        const cols = await fetchCollectionsByBoxId(Number(boxId));
        setBox(box);
        setCollections(cols);
        if (box !== null) {
          var boxName =
            box.name.length > 14 ? box.name.substring(0, 12) + "..." : box.name;
          navigation.setOptions({
            title: boxName,
            headerRight: () => (
              <TouchableOpacity onPress={handleManageBox}>
                <Icon name="pencil-outline" size={32} color="white" />
              </TouchableOpacity>
            ),
          });
        }
      } finally {
        setLoading(false);
      }
    }
    if (isFocused) {
      loadData();
      console.log("fetch data");
    }
  }, [isFocused]);

  const items: any[] = ["c 1", "3", "5"];

  function onExpand(index: number) {
    if (expandedSection === index) {
      setExpandedSection(null);
    } else {
      setExpandedSection(index);
    }
  }
  function handleManageBox() {
    router.push(`./boxManage`);
  }

  function addCollection() {
    router.push(`/(tabs)/box/${boxId}/collections/addCollection`);
  }
  
  function handleCollectionClick(collectionId: number) {
    console.log("handleCollectionClick");
    router.push(`/(tabs)/box/manage-collection/${collectionId}`);
  }
  const calcSectionHeight = (index:number):number => {
    let height = 0;
    if (expandedSection !== null) {
      if (expandedSection === index) {
        height =  availableHeight - (numSections - 1) * BOX_SECTION_HEADER_SIZE;
      } else {
        height = COLLAPSED_SECTION_SIZE;
      }
    } else {
      height = sectionSize+5;
    }
    // console.log("height", index, height);
    return height;
  }

  const calcSectionOffset = (index:number):number => {
    if (expandedSection !== null) {
      if (index <= expandedSection) {
        return index * BOX_SECTION_HEADER_SIZE;
      }
      return availableHeight - (numSections - index) * BOX_SECTION_HEADER_SIZE;
    } 
    return sectionSize * index;
  }
  
  //console.log("rendering BoxView");
  if(loading) {
    return <View style={styles.container} />;
  }
  if (box === null) {
    return <View style={styles.container} />;
  }
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
      {/* <ToolsBoxSection
        index={0}
        numSections={numSections}
        expandedSection={expandedSection}
        onExpand={onExpand}
        calcSectionHeight={calcSectionHeight}
        calcSectionOffset={calcSectionOffset}
      />
      <NotesBoxSection
        index={1}
        numSections={numSections}
        expandedSection={expandedSection}
        onExpand={onExpand}
        calcSectionHeight={calcSectionHeight}
        calcSectionOffset={calcSectionOffset}
      /> */}
{collections.length === 0 && (
  <View
    style={{
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <Text style={styles.defaultText}>{i18n.t("boxes.noCollectionsDefault")}</Text>
    <View style={[styles.addBoxBtnMid, { backgroundColor: colors.primary }]}>
      <TouchableOpacity onPress={addCollection}>
        <Icon name="plus" size={48} color="white" />
      </TouchableOpacity>
    </View>
  </View>
)}
{collections.length > 0 &&(
<>
  {collections.map((col, i)=>(
    <CollectionBoxSection
      key={`col_${col.id}`}
      boxId={String(box.id)}
      col={col}
      index={i}
      numSections={numSections}
      expandedSection={expandedSection}
      onExpand={onExpand}
      calcSectionHeight={calcSectionHeight}
      calcSectionOffset={calcSectionOffset}
    />
  ))}
  <View style={[styles.addBoxBtn, { backgroundColor: colors.primary }]}>
    <TouchableOpacity onPress={addCollection}>
      <Icon name="plus" size={48} color="white" />
    </TouchableOpacity>
  </View>
  </>
)
}
        
{/* <BoxSection
          key={`boxSection_conversations_${boxId}`}
          name={i18n.t("boxes.conversations")}
          index={numSections-1}
          numSections={numSections}
          expandedSection={expandedSection}
          style={styles.boxSection}
          onAddNew={handleAddChatPress}
          onExpand={onExpand}
          items={items}
          defaultText={i18n.t("boxes.noConversationsDefault")}
          renderItem={(item: any, index: number) => (
            <>
              <View style={styles.cardCntView}>
                <Text style={styles.cardsCntTxt}>
                  Cards: {index + 1} {10 * index}
                </Text>
              </View>
              <View style={styles.colNameView}>
                <Text style={styles.colNameTxt} numberOfLines={4}>
                  {item}
                </Text>
              </View>
            </>
          )}
          renderListItem={(item: any, index: number) => (
            <View style={styles.colNameView}>
              <Text style={styles.colNameTxt} numberOfLines={1}>
                {item}
              </Text>
            </View>
          )}
        /> */}
        
      </View>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    justifyContent: "flex-start",
    alignItems: "center",
    //backgroundColor: "#f0f0f0",
    backgroundColor: "orange",
  },

  collectionCard: {
    backgroundColor: "#f9c2ff",
  },
  notesCard: {
    backgroundColor: "#c2e1ff",
  },
  chatsCard: {
    backgroundColor: "#c2ffc2",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  sectionContainer: {
    borderColor: "#ddd",
    borderWidth: 1,
    borderBottomWidth: 0,
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    marginHorizontal: 10,
    backgroundColor: "#fff",
    elevation: 25,
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
    height: BOX_SECTION_HEADER_SIZE,
    // elevation: 2,
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
  sectionListContainer: {
    paddingVertical: 5,
    paddingHorizontal: 7,
    alignItems: "center",
    // backgroundColor: "orange",
    flex: 0.95,
  },
  boxSection: {
    position: "absolute",
    width: "100%",
    //height: 500,
  },
  itemListBox: {
    //position: "absolute",
    //width: "100%",
    height: 60,
    backgroundColor: "#faf8b4",
    borderRadius: 5,

    //borderColor: "lightgrey",
    borderWidth: 1,
    borderColor: "#dd8",
    //paddingVertical: 5,
    //paddingHorizontal: 15,
    marginHorizontal: 5,
    marginVertical: 2,
    justifyContent: "center",
  },
  itemBox: {
    position: "absolute",
    width: "100%",
    height: 150,
    backgroundColor: "#faf8b4",
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#dd8",
    //margin: 5,
    justifyContent: "center",
  },
  colNameView: {
    flex: 0.6,
    justifyContent: "center",
    alignItems: "center",
    //alignSelf: "center",
    //backgroundColor: "orangered",
  },
  colNameTxt: {
    fontSize: 16,
  },
  cardCntView: {
    padding: 7,
    alignSelf: "flex-end",
  },
  cardsCntTxt: {
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
  addBoxBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
    position: "absolute",
    bottom: 10,
    marginHorizontal: 10,
    marginVertical: 2,
    //right: 10,
    alignSelf: "center", // Center horizontally
  },
  addBoxBtnMid: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    
    bottom: 10,
    marginHorizontal: 10,
    marginVertical: 60,
    
  },
  defaultText: {
    fontSize: 16,
    
  },
});

export default BoxView;
