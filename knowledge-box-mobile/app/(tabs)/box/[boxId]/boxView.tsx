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
import { LinearGradient } from 'expo-linear-gradient';

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

  function handleTest(){
    router.push("./FlashcardCollectionsScreen");
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
    return (
      <LinearGradient colors={['#f0f4ff', '#e5e9f7']} style={styles.gradientBg}>
        <View style={styles.container} />
      </LinearGradient>
    );
  }
  if (box === null) {
    return (
      <LinearGradient colors={['#f0f4ff', '#e5e9f7']} style={styles.gradientBg}>
        <View style={styles.container} />
      </LinearGradient>
    );
  }
  return (
    <LinearGradient colors={['#f0f4ff', '#e5e9f7']} style={styles.gradientBg}>
      <SafeAreaProvider>
        <View style={styles.container}>
        
          {collections.length === 0 && (
            <View style={styles.emptyStateContainer}>
              <Icon name="inbox-arrow-down" size={80} color="#b0b6c1" style={{marginBottom: 12}} />
              <Text style={styles.emptyStateText}>{i18n.t("boxes.noCollectionsDefault")}</Text>
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
            
          
            </>
          )
          }
   
        <TouchableOpacity style={styles.addFab} onPress={addCollection} activeOpacity={0.8}>
          <Icon name="plus" size={32} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaProvider>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientBg: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 10,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    //backgroundColor: "orange",
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
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e9f7',
    borderTopRightRadius: 16,
    borderTopLeftRadius: 16,
    backgroundColor: '#e5e9f7',
    height: BOX_SECTION_HEADER_SIZE,
  },
  sectionHeaderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3142',
    flex: 1,
    letterSpacing: 0.5,
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
    position: 'absolute',
    width: '100%',
    borderRadius: 18,
    backgroundColor: '#fff',
    shadowColor: '#171717',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
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
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#6c7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  addFab: {
    position: "absolute",
    zIndex: 1000,
    right: 20,
    bottom: 20,
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
  defaultText: {
    fontSize: 16,
    
  },
});

export default BoxView;
