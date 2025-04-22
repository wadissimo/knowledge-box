import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
} from "react-native";
import { i18n } from "@/src/lib/i18n";
import { useRouter } from "expo-router";
import { Collection } from "@/src/data/CollectionModel";
import { Card, useCardModel } from "@/src/data/CardModel";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useTheme } from "@react-navigation/native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import DraggableBoxCard from "./DraggableBoxCard";



const BOX_SECTION_HEADER_SIZE = 40;

const CollectionBoxSection = ({
    boxId,
    col,
    index,
  
  numSections,
  expandedSection,
  onExpand,
  calcSectionHeight,
  calcSectionOffset,
}: {
  
  boxId: string;
  col: Collection;
  index:number;
  numSections: number;
  expandedSection: number | null;
  onExpand: (index: number) => void;
  calcSectionHeight: (index: number) => number;
  calcSectionOffset: (index: number) => number;
    }) => {
    const { colors } = useTheme();
    const router = useRouter();
    const { getPreviewCards } = useCardModel();
    const [cards, setCards] = useState<Card[]>([]);

    useEffect(()=>{
        async function loadCards() {
            // console.log("fetch preview cards", col.id);
            const cards = await getPreviewCards(Number(col.id));
            setCards(cards);
          }
          if (col.id !== null) {
            loadCards();
          }
    }, [col.id]);

    const offset = useSharedValue(calcSectionOffset(index));
    const height = useSharedValue(calcSectionHeight(index));
  
    const isExpanded = expandedSection === index;
  

    const animatedStyle = useAnimatedStyle(() => ({
        zIndex: index + 1,
        transform: [{ translateY: offset.value }],
        height: height.value,
      }));

    const numReorders = useSharedValue(0);
    
    useEffect(() => {
      offset.value = withTiming(calcSectionOffset(index));
      height.value = withTiming(calcSectionHeight(index));
    }, [expandedSection, index]);
  
    // handle items reordering
    const reorderItems = (index: number) => {
      numReorders.value = numReorders.value + 1;
    };
  
    const handleTrainCollection = () => {
      router.push(`/(tabs)/box/manage-collection/${col.id}`);
    };

    function handleAddCollection() {
        router.push(`/(tabs)/box/${boxId}/collections/addCollection`);
    }

    function handleCollectionClick(collectionId: number) {
        console.log("handleCollectionClick");
        router.push(`/(tabs)/box/manage-collection/${collectionId}`);
     }
     function handleCardClick(cardId: number) {
        console.log("handleCardClick");
       
      }
      // console.log("collection id",col.id);
  return (
    <>
    <TouchableWithoutFeedback onPress={() => onExpand(index)}>
      <Animated.View style={[styles.sectionContainer, styles.boxSection, animatedStyle]}>
        <View style={[styles.sectionHeader]}>
          <Text style={[styles.sectionHeaderText]}>{col.name}</Text>
        </View>
        {cards.length === 0 && (
          <View
            style={{
              flex: 1,
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            <Text style={styles.defaultText}>{i18n.t("boxes.noCollectionsDefault")}</Text>
          </View>
        )}
        {isExpanded ? (
          <ScrollView>
            {cards.map((card, index) => (
              <Animated.View
                style={[
                  styles.itemListBox,
                  styles.shadowProp,
                  styles.elevation,
                ]}
                key={`listitem_${index}`}
              >
                <TouchableOpacity
                onPress={() => handleCardClick(card.id)}
                style={{ flex: 1, justifyContent: "center" }}>
                <View style={styles.colNameView}>
                  <Text style={styles.colNameTxt} numberOfLines={1}>
                    {card.front}
                  </Text>
                </View>
              </TouchableOpacity>

              </Animated.View>
            ))}
          </ScrollView>
        ) : (
          <View style={[styles.sectionListContainer]}>            
            {cards.map((card, index) => (
              <DraggableBoxCard
                name={card.front}
                index={index}
                numItems={cards.length}
                numReorders={numReorders}
                onReorder={() => reorderItems(index)}
                key={`boxCar_${index}`}
              >
                <TouchableOpacity
                onPress={() => handleCardClick(card.id)}
                style={{ flex: 1 }}
              >
                <View style={styles.colNameView}>
                  <Text style={styles.colNameTxt} numberOfLines={4}>
                    {card.front}
                  </Text>
                </View>
              </TouchableOpacity>
              </DraggableBoxCard>
            ))}
          </View>
        )}
        
        
        <View style={[styles.trainBoxBtn, { backgroundColor: colors.primary }]}>
            <TouchableOpacity onPress={() => handleTrainCollection()}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Icon name="arm-flex" size={24} color="white" />
                <Text style={styles.trainBoxBtnText}>Train</Text>
              </View>
            </TouchableOpacity>
          </View>
      </Animated.View>
    </TouchableWithoutFeedback>
      {/* <BoxSection
        key={`col_${col.id}`}
            name={col.name}
            index={index}
            numSections={numSections}
            expandedSection={expandedSection}
            style={styles.boxSection}
            onAddNew={handleAddCollection}
            onExpand={onExpand}
            items={cards.slice(0, 5)}
            defaultText={i18n.t("boxes.noCollectionsDefault")}
            calcSectionHeight={calcSectionHeight}
            calcSectionOffset={calcSectionOffset}
            renderItem={(card: Card, index: number) => (
              <TouchableOpacity
                onPress={() => handleCardClick(card.id)}
                style={{ flex: 1 }}
              >
                <View style={styles.colNameView}>
                  <Text style={styles.colNameTxt} numberOfLines={4}>
                    {card.front}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            renderListItem={(card: Card, index: number) => (
              <TouchableOpacity
                onPress={() => handleCardClick(card.id)}
                style={{ flex: 1, justifyContent: "center" }}
              >
                <View style={styles.colNameView}>
                  <Text style={styles.colNameTxt} numberOfLines={1}>
                    {card.front}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          /> */}
          
    </>
  );
};


const styles = StyleSheet.create({
  boxSection: {
    position: "absolute",
    width: "100%",
    //height: 500,
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
    alignSelf: "flex-end", // Center horizontally
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
  defaultText: {
    fontSize: 18,
    fontWeight: "bold",
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

  trainBoxBtn: {
    width: 100,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
    position: "absolute",
    bottom: 10,
    marginHorizontal: 10,
    marginVertical: 2,
    //right: 10,
    alignSelf: "flex-end", // Center horizontally
  },
  trainBoxBtnText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default CollectionBoxSection;
