import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { i18n } from '@/src/lib/i18n';
import { useRouter } from 'expo-router';
import { Collection } from '@/src/data/CollectionModel';
import { Card, useCardModel } from '@/src/data/CardModel';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '@react-navigation/native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import DraggableBoxCard from './DraggableBoxCard';
import { useThemeColors } from '@/src/context/ThemeContext';
import { TodayStudyCardsCount, useCardTrainingService } from '@/src/service/CardTrainingService';

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
  const { themeColors } = useThemeColors();
  const router = useRouter();
  const { getCardsWindow, getCardsCount } = useCardModel();
  const { getTodayStudyCardsCount } = useCardTrainingService();

  const [cards, setCards] = useState<Card[]>([]);
  const [topCardIndex, setTopCardIndex] = useState<number>(0);
  const [cardOffset, setCardOffset] = useState<number>(0);
  const [isLoadingCards, setIsLoadingCards] = useState(false);
  const [cardCount, setCardCount] = useState<number>(0);
  const CARD_WINDOW_SIZE = Math.min(MAX_CARD_WINDOW_SIZE, cardCount);
  const [studyData, setStudyData] = useState<TodayStudyCardsCount | null>(null);
  const [showTodo, setShowTodo] = useState<boolean>(false);
  const [frontFlipped, setFrontFlipped] = useState<boolean>(false);

  const todoCount =
    (studyData?.reviewCardCount ?? 0) +
    (studyData?.newCardCount ?? 0) +
    (studyData?.learningCardCount ?? 0);
  const isTodo = todoCount > 0;
  // console.log(
  //   'CollectionBoxSection refresh',
  //   topCardIndex,
  //   cards.map(card => card.front)
  // );

  useEffect(() => {
    let isMounted = true;
    async function loadInitial() {
      setIsLoadingCards(true);
      const count = await getCardsCount(Number(col.id));
      setCardCount(count);
      const window = await getCardsWindow(Number(col.id), 0, Math.min(MAX_CARD_WINDOW_SIZE, count));

      const studyData = await getTodayStudyCardsCount(Number(col.id));

      if (isMounted) {
        setCards(window);
        setIsLoadingCards(false);
        setStudyData(studyData);
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
    console.log('handleReorderingEnd');
    const nextCardIndex = (cardOffset + CARD_WINDOW_SIZE) % cardCount;
    const nextCard = await getCardsWindow(Number(col.id), nextCardIndex, 1);
    if (nextCard.length > 0) {
      let newCards = [...cards];
      console.log(
        'newCards1',
        newCards.map(card => card.front)
      );
      newCards[topCardIndex] = nextCard[0];
      console.log('nextCard', nextCard);
      console.log(
        'newCards2',
        newCards.map(card => card.front)
      );
      setCards(newCards);
    }

    setCardOffset((cardOffset + 1) % cardCount);
    setTopCardIndex((topCardIndex + 1) % CARD_WINDOW_SIZE);
    setFrontFlipped(false);
  };

  const handleTrainCollection = () => {
    router.push(`/(tabs)/box/manage-collection/${col.id}/main`);
  };

  function handleCollectionClick() {
    console.log('handleCollectionClick');
    router.push(`/(tabs)/box/manage-collection/${col.id}/manage`);
  }
  function handleCardClick(cardId: number) {
    console.log('handleCardClick setFrontFlipped, cardId', cardId);
    setFrontFlipped(!frontFlipped);
  }
  console.log('CollectionBoxSection frontFlipped', frontFlipped, 'collectionId', col.id);
  return (
    <>
      <TouchableWithoutFeedback onPress={() => onExpand(index)}>
        <Animated.View
          style={[
            styles.sectionContainer,
            styles.boxSection,
            animatedStyle,
            { backgroundColor: themeColors.popupBg },
          ]}
        >
          <View
            style={[
              styles.sectionHeader,
              {
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: themeColors.subHeaderBg,
              },
            ]}
          >
            <Text style={[styles.sectionHeaderText, { color: themeColors.subHeaderText }]}>
              {col.name}{' '}
            </Text>
            {showTodo && (
              <View
                style={{
                  position: 'absolute',
                  right: 110,
                  bottom: 2,
                  zIndex: 10,
                  backgroundColor: themeColors.subHeaderText,
                  padding: 2,
                  borderRadius: 5,
                }}
              >
                {isTodo ? (
                  <Text
                    style={[
                      styles.sectionHeaderText,
                      { color: themeColors.subHeaderBg, fontSize: 12, fontWeight: 'normal' },
                    ]}
                  >
                    <Icon name="alert" size={14} color={themeColors.subHeaderBg} />{' '}
                    {studyData?.newCardCount} {studyData?.learningCardCount}{' '}
                    {studyData?.reviewCardCount}
                  </Text>
                ) : (
                  <Icon name="check" size={28} color={themeColors.subHeaderText} />
                )}
              </View>
            )}
            <TouchableOpacity
              onPress={handleCollectionClick}
              style={[styles.iconCircleBtn, { marginRight: 0, paddingRight: 0, width: 40 }]}
              accessibilityLabel="Edit Collection"
              activeOpacity={0.7}
            >
              <Icon name="pencil-outline" size={28} color={themeColors.subHeaderText} />
              <Text style={[styles.iconLabel, { color: themeColors.subHeaderText }]}>
                {' '}
                {/* {i18n.t('common.edit')} */}
              </Text>
            </TouchableOpacity>

            <View style={[styles.actionIconsRow]}>
              <TouchableOpacity
                onPress={handleTrainCollection}
                style={styles.iconCircleBtn}
                accessibilityLabel="Start Training"
                activeOpacity={0.7}
              >
                <Icon name="school-outline" size={28} color="#34b233" />
                <View style={{ flexDirection: 'row' }}>
                  <Text
                    style={[
                      styles.iconLabel,
                      {
                        color: themeColors.subHeaderText,
                      },
                    ]}
                  >
                    {i18n.t('common.study')}
                  </Text>
                  <Text
                    style={[
                      styles.iconLabel,
                      {
                        color: themeColors.subHeaderText,
                      },
                    ]}
                  >
                    {isTodo ? `(${todoCount})` : ''}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {cards.length === 0 && (
            <View
              style={{
                flex: 1,
                justifyContent: 'flex-end',
                alignItems: 'center',
                backgroundColor: themeColors.popupBg,
              }}
            >
              <Text style={[styles.defaultText, { color: themeColors.popupText }]}>
                {i18n.t('boxes.noCardsDefault')}
              </Text>
            </View>
          )}
          {isExpanded ? (
            <ScrollView>
              {cards.map((card, index) => (
                <Animated.View
                  style={[styles.itemListBox, styles.shadowProp, styles.elevation]}
                  key={`listitem_${index}`}
                >
                  <TouchableOpacity
                    onPress={() => handleCardClick(card.id)}
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
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
                  name={index === topCardIndex && frontFlipped ? card.back : card.front}
                  index={CARD_WINDOW_SIZE - 1 - index}
                  numItems={cards.length}
                  numReorders={numReorders}
                  onReorder={() => reorderItems(index)}
                  onEnd={handleReorderingEnd}
                  key={`boxCar_${card.id}`}
                  draggable={index === topCardIndex}
                >
                  <TouchableOpacity onPress={() => handleCardClick(card.id)} style={{ flex: 1 }}>
                    <View style={styles.colNameView}>
                      <Text style={styles.colNameTxt} numberOfLines={4}>
                        {index === topCardIndex && frontFlipped ? card.back : card.front}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </DraggableBoxCard>
              ))}
              {isLoadingCards && (
                <View style={{ alignItems: 'center', margin: 12 }}>
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
    position: 'absolute',
    width: '100%',
    //height: 500,
  },
  colNameView: {
    flex: 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    //alignSelf: "center",
    //backgroundColor: "orangered",
  },
  colNameTxt: {
    fontSize: 16,
  },
  cardCntView: {
    padding: 7,
    alignSelf: 'flex-end',
  },
  cardsCntTxt: {
    fontSize: 12,
  },
  addBoxBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    position: 'absolute',
    bottom: 10,
    marginHorizontal: 10,
    marginVertical: 2,
    //right: 10,
    alignSelf: 'flex-end', // Center horizontally
  },
  sectionContainer: {
    borderColor: '#ddd',
    borderWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 16,
    borderTopLeftRadius: 16,
    marginHorizontal: 10,
    backgroundColor: 'orangered',
    elevation: 25,
  },
  sectionHeader: {
    paddingHorizontal: 12,
    paddingVertical: 0,
    flexDirection: 'row',
    alignItems: 'center',

    borderTopRightRadius: 16,
    borderTopLeftRadius: 16,
    backgroundColor: '#b3e5fc',
    height: BOX_SECTION_HEADER_SIZE + 24,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0288d1',
    flex: 1,
    letterSpacing: 0.5,
    textAlignVertical: 'center',
    textAlign: 'left',
    includeFontPadding: false,
    paddingVertical: 0,
    marginVertical: 0,
  },
  actionIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircleBtn: {
    width: 50,
    height: 50,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  iconLabel: {
    fontSize: 10,
    color: '#6c7280',
    textAlign: 'center',
    marginTop: 1,
  },
  iconSeparator: {
    width: 1,
    height: 32,
    backgroundColor: '#81d4fa',
    marginHorizontal: 8,
    borderRadius: 1,
  },
  sectionFooter: {
    height: 10,
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    backgroundColor: '#cad1ca',
  },
  sectionIcons: { flexDirection: 'row', gap: 32 },
  sectionListContainer: {
    paddingVertical: 5,
    paddingHorizontal: 7,
    alignItems: 'center',
    // backgroundColor: "orange",
    flex: 0.95,
  },
  defaultText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  itemListBox: {
    //position: "absolute",
    //width: "100%",
    height: 60,
    backgroundColor: '#faf8b4',
    borderRadius: 5,

    //borderColor: "lightgrey",
    borderWidth: 1,
    borderColor: '#dd8',
    //paddingVertical: 5,
    //paddingHorizontal: 15,
    marginHorizontal: 5,
    marginVertical: 2,
    justifyContent: 'center',
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

  trainBoxBtn: {
    width: 100,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    position: 'absolute',
    bottom: 10,
    marginHorizontal: 10,
    marginVertical: 2,
    //right: 10,
    alignSelf: 'flex-end', // Center horizontally
  },
  trainBoxBtnText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default CollectionBoxSection;
