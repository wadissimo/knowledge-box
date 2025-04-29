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
const MAX_CARD_WINDOW_SIZE = 5;

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
  index: number;
  numSections: number;
  expandedSection: number | null;
  onExpand: (index: number) => void;
  calcSectionHeight: (index: number) => number;
  calcSectionOffset: (index: number) => number;
}) => {
    const { colors } = useTheme();
    const router = useRouter();
    const { getCardsWindow, getCardsCount } = useCardModel();

    const [cards, setCards] = useState<Card[]>([]);
    const [topCardIndex, setTopCardIndex] = useState<number>(0);
    const [cardOffset,setCardOffset] = useState<number>(0);
    const [isLoadingCards, setIsLoadingCards] = useState(false);
    const [cardCount, setCardCount] = useState<number>(0);
    const CARD_WINDOW_SIZE = Math.min(MAX_CARD_WINDOW_SIZE, cardCount);
    console.log("CollectionBoxSection refresh", topCardIndex, cards.map((card) => card.front))

    useEffect(() => {
      let isMounted = true;
      async function loadInitial() {
        setIsLoadingCards(true);
        const count = await getCardsCount(Number(col.id));
        setCardCount(count);
        const window = await getCardsWindow(Number(col.id), 0, Math.min(MAX_CARD_WINDOW_SIZE, count));
        //window.reverse();
        if (isMounted) {
          setCards(window);
          setIsLoadingCards(false);
        }
      }
      if (col.id !== null) loadInitial();
      return () => {
        isMounted = false;
      };
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
  
    const handleReorderingEnd = async () => {
      console.log("handleReorderingEnd");
      const nextCardIndex = (cardOffset + CARD_WINDOW_SIZE)%cardCount;
      const nextCard = await getCardsWindow(Number(col.id), nextCardIndex, 1);
      if(nextCard.length > 0){
        let newCards = [...cards];
        console.log("newCards1", newCards.map((card) => card.front));
        newCards[topCardIndex] = nextCard[0];
        console.log("nextCard", nextCard)
        console.log("newCards2", newCards.map((card) => card.front));
        setCards(newCards);
      }
      
      setCardOffset((cardOffset+1)%cardCount);
      setTopCardIndex((topCardIndex + 1) % CARD_WINDOW_SIZE);
    };
      
    const handleTrainCollection = () => {
      router.push(`/(tabs)/box/manage-collection/${col.id}`);
    };

    function handleCollectionClick() {
        console.log("handleCollectionClick");
        router.push(`/(tabs)/box/manage-collection/${col.id}/manage`);
     }
     function handleCardClick(cardId: number) {
        console.log("handleCardClick");
       
      }
  return (
    <>
      <TouchableWithoutFeedback onPress={() => onExpand(index)}>
        <Animated.View style={[styles.sectionContainer, styles.boxSection, animatedStyle]}>
          <View style={[styles.sectionHeader, { flexDirection: "row", alignItems: "center" }]}>
            <Text style={[styles.sectionHeaderText, { flex: 1 }]}>{col.name}</Text>
            <View style={styles.iconSeparator} />
            <View style={styles.actionIconsRow}>
              <TouchableOpacity onPress={handleCollectionClick} style={styles.iconCircleBtn} accessibilityLabel="Edit Collection" activeOpacity={0.7}>
                <Icon name="note-edit-outline" size={24} color="#4f8cff" />
                <Text style={styles.iconLabel}>{i18n.t("common.edit")}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleTrainCollection} style={styles.iconCircleBtn} accessibilityLabel="Start Training" activeOpacity={0.7}>
                <Icon name="school-outline" size={24} color="#34b233" />
                <Text style={styles.iconLabel}>{i18n.t("common.train")}</Text>
              </TouchableOpacity>
            </View>
          </View>
          {cards.length === 0 && (
            <View
              style={{
                flex: 1,
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            >
              <Text style={styles.defaultText}>{i18n.t("boxes.noCardsDefault")}</Text>
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
                  index={CARD_WINDOW_SIZE - 1 - index}
                  numItems={cards.length}
                  numReorders={numReorders}
                  onReorder={() => reorderItems(index)}
                  onEnd={handleReorderingEnd}
                  key={`boxCar_${card.id}`}
                  draggable={index === topCardIndex}
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
              {isLoadingCards && (
                <View style={{ alignItems: "center", margin: 12 }}>
                  <Text>Loading more cards...</Text>
                </View>
              )}
            </View>
          )}
        </Animated.View>
      </TouchableWithoutFeedback>
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
    borderWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 16,
    borderTopLeftRadius: 16,
    marginHorizontal: 10,
    backgroundColor: "#fff",
    elevation: 25,
  },
  sectionHeader: {
    paddingHorizontal: 12,
    paddingVertical: 0,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#81d4fa",
    borderTopRightRadius: 16,
    borderTopLeftRadius: 16,
    backgroundColor: "#b3e5fc",
    height: BOX_SECTION_HEADER_SIZE + 24,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0288d1",
    flex: 1,
    letterSpacing: 0.5,
    textAlignVertical: "center",
    textAlign: "left",
    includeFontPadding: false,
    paddingVertical: 0,
    marginVertical: 0,
  },
  actionIconsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginLeft: 12,
  },
  iconCircleBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 2,
  },
  iconLabel: {
    fontSize: 10,
    color: "#6c7280",
    textAlign: "center",
    marginTop: 1,
  },
  iconSeparator: {
    width: 1,
    height: 32,
    backgroundColor: "#81d4fa",
    marginHorizontal: 10,
    borderRadius: 1,
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
    textAlign: "center",
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
