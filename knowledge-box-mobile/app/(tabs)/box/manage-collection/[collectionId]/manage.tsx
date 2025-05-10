import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';

import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';

import { Collection, useCollectionModel } from '@/src/data/CollectionModel';
import { Card, useCardModel } from '@/src/data/CardModel';
import { Colors } from '@/src/constants/Colors';
import { i18n } from '@/src/lib/i18n';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { AIManager } from './AIManager';
import { ManageCollectionMainMenu } from './ManageCollectionMainMenu';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenContainer from '@/src/components/common/ScreenContainer';
import { useThemeColors } from '@/src/context/ThemeContext';

const SCROLL_ARROW_SIZE = 32;

export default function ManageCollectionScreen() {
  // --- State for menus (must be before any return/conditional logic) ---
  const [mainMenuVisible, setMainMenuVisible] = useState(false);

  // --- Menu handlers ---
  const openMainMenu = () => setMainMenuVisible(true);
  const closeMainMenu = () => setMainMenuVisible(false);

  // --- FlashList ref and scroll arrows state (must be declared at the top level, not conditionally) ---
  const flashListRef = React.useRef<any>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(true);

  // --- AI Modal State ---
  const [aiModalVisible, setAiModalVisible] = useState(false);

  const { themeColors } = useThemeColors();

  const router = useRouter();
  const { collectionId, affectedCardId } = useLocalSearchParams<{
    collectionId?: string;
    affectedCardId?: string;
  }>();
  console.log('collectionId', collectionId);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);

  const { getCollectionById, deleteCollection } = useCollectionModel();
  const { getCards, deleteCard, newCards } = useCardModel();
  const [cards, setCards] = useState<Card[]>([]);
  const [collection, setCollection] = useState<Collection | null>(null);

  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  const totalBottomPadding = insets.bottom + tabBarHeight;
  console.log('totalBottomPadding', totalBottomPadding);
  const numCards = cards.length;

  const handleCardPress = (id: number) => {
    setSelectedCard(id);
    if (id !== null) {
      router.push(`/(tabs)/box/manage-collection/${collectionId}/${id}`);
    }
  };

  const handleAddCardPress = () => {
    if (!collectionId) {
      console.error('collectionId is undefined');
      Alert.alert('Error', 'Collection ID is undefined');
      return;
    }
    closeMainMenu();
    setTimeout(() => {
      console.log('Navigating to new card screen for collectionId:', collectionId);
      router.push(`/(tabs)/box/manage-collection/${collectionId}/new`);
    }, 250); // Wait for menu to close to avoid navigation bug
  };

  const EmptyState = <></>;

  const handleEditCardPress = (id?: number) => {
    const cardId = typeof id === 'number' ? id : selectedCard;
    if (!collectionId || cardId == null) {
      console.error('collectionId or cardId is undefined');
      return;
    }
    router.push(`/(tabs)/box/manage-collection/${collectionId}/${cardId}`);
  };

  const handleDeleteCardPress = (id?: number) => {
    const cardId = typeof id === 'number' ? id : selectedCard;
    if (!cardId) return;
    Alert.alert(
      i18n.t('common.confirm.deletion'),
      i18n.t('cards.confirmDeletionText'),
      [
        {
          text: i18n.t('common.cancel'),
          onPress: () => console.log('Deletion cancelled'),
          style: 'cancel',
        },
        {
          text: i18n.t('common.delete'),
          onPress: () => {
            console.log('Deleting card...');
            async function onDeleteCard() {
              await deleteCard(Number(cardId));
              fetchCards();
              setSelectedCard(null);
            }
            onDeleteCard();
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const handleEditCollection = () => {
    closeMainMenu();
    if (!collectionId) {
      console.error('collectionId is undefined');
      return;
    }

    router.push(`/(tabs)/box/manage-collection/${collectionId}/edit`);
  };

  const handleDeleteCollection = () => {
    Alert.alert(
      i18n.t('common.confirm.deletion'),
      i18n.t('cards.collectionConfirmDeletionText'),
      [
        {
          text: i18n.t('common.cancel'),
          onPress: () => console.log('Deletion cancelled'),
          style: 'cancel',
        },
        {
          text: i18n.t('common.delete'),
          onPress: () => {
            console.log('Deleting collection...');
            deleteCollection(Number(collectionId));
            router.back();
            router.back();
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  async function fetchCards() {
    var cards = await getCards(Number(collectionId));
    setCards(cards);
    if (affectedCardId) {
      if (affectedCardId == '-1') {
        // choose last card
        if (cards.length > 0) {
          const lastElement = cards.at(-1);
          if (lastElement) setSelectedCard(lastElement.id);
        } else {
          setSelectedCard(null);
        }
      } else {
        setSelectedCard(Number(affectedCardId));
      }
    }
  }

  useEffect(() => {
    if (collectionId !== undefined && collectionId !== null) {
      (async () => {
        console.log('Fetching collection...');
        const collection = await getCollectionById(Number(collectionId));
        await fetchCards();
        console.log(collection?.name);
        setCollection(collection);
      })();
    }
  }, [collectionId]);
  useFocusEffect(
    useCallback(() => {
      fetchCards();
    }, [collectionId, affectedCardId])
  );

  // Handler for scrolling
  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const contentHeight = event.nativeEvent.contentSize.height;
    const layoutHeight = event.nativeEvent.layoutMeasurement.height;
    setShowScrollTop(offsetY > 80);
    setShowScrollBottom(offsetY + layoutHeight < contentHeight - 80);
  };

  // Scroll to top/bottom handlers
  const scrollToTop = () => {
    flashListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };
  const scrollToBottom = () => {
    flashListRef.current?.scrollToEnd({ animated: true });
  };

  if (collection === null) {
    return (
      <View style={styles.emptyContainer}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

  return (
    <>
      <View style={[styles.colNameContainer, { backgroundColor: themeColors.subHeaderBg }]}>
        <Text style={[styles.colNameTxt, { color: themeColors.subHeaderText }]}>
          {collection?.name}
        </Text>
      </View>
      <ScreenContainer>
        {cards.length === 0 ? (
          <>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Ionicons
                name="albums-outline"
                size={56}
                color={themeColors.text}
                style={{ marginBottom: 16 }}
              />
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: 'bold',
                  color: themeColors.text,
                  marginBottom: 12,
                  textAlign: 'center',
                }}
              >
                {i18n.t('cards.noCardsYet')}
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: '#666',
                  marginBottom: 18,
                  textAlign: 'center',
                  maxWidth: 320,
                }}
              >
                {i18n.t('cards.noCardsHint')}
                <Ionicons name="ellipsis-horizontal" size={20} color={Colors.light.tint} />
                {i18n.t('cards.noCardsHint2')}
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: Colors.light.tint,
                  marginBottom: 28,
                  textAlign: 'center',
                  maxWidth: 320,
                }}
              >
                {i18n.t('cards.noCardsAIHint')}
              </Text>
              <View style={{ position: 'absolute', right: 80, bottom: 35, alignItems: 'center' }}>
                <Ionicons
                  name="arrow-down"
                  size={40}
                  color={Colors.light.tint}
                  style={{ transform: [{ rotate: '-45deg' }] }}
                />
              </View>
            </View>
          </>
        ) : (
          <>
            <View style={styles.cardGridNoOutline}>
              <FlashList
                ref={flashListRef}
                data={cards}
                keyExtractor={item => item.id.toString()}
                numColumns={Platform.OS === 'web' ? 3 : 1}
                renderItem={({ item }) => (
                  <View
                    style={[
                      styles.cardGridItem,
                      item.id === selectedCard && styles.selectedCardGridItem,
                      {
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        position: 'relative',
                        backgroundColor: themeColors.cardBg,
                      },
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.cardGridFront, { color: themeColors.cardText }]}>
                        {item.front}
                      </Text>
                      <Text style={[styles.cardGridBack, { color: themeColors.cardText }]}>
                        {item.back}
                      </Text>
                    </View>
                    <Menu>
                      <MenuTrigger customStyles={{ TriggerTouchableComponent: Pressable }}>
                        <Ionicons name="ellipsis-vertical" size={24} style={styles.cardMenuDots} />
                      </MenuTrigger>
                      <MenuOptions
                        customStyles={{
                          optionsContainer: {
                            borderRadius: 14,
                            padding: 2,
                            minWidth: 140,
                            backgroundColor: themeColors.popupBg,
                          },
                        }}
                      >
                        <MenuOption onSelect={() => handleEditCardPress(item.id)}>
                          <View style={styles.menuOptionRow}>
                            <Ionicons
                              name="create-outline"
                              size={20}
                              color={themeColors.headerBg}
                              style={{ marginRight: 6 }}
                            />
                            <Text style={{ color: themeColors.popupText }}>
                              {i18n.t('cards.editCardBtn')}
                            </Text>
                          </View>
                        </MenuOption>
                        <MenuOption
                          onSelect={() => handleDeleteCardPress(item.id)}
                          customStyles={{
                            optionWrapper: {
                              backgroundColor: themeColors.popupBg,
                              borderRadius: 10,
                            },
                          }}
                        >
                          <View style={styles.menuOptionRow}>
                            <Ionicons
                              name="trash-outline"
                              size={20}
                              color={themeColors.deleteBtnBg}
                              style={{ marginRight: 6 }}
                            />
                            <Text style={{ color: themeColors.deleteBtnBg, fontWeight: 'bold' }}>
                              {i18n.t('cards.deleteCardBtn')}
                            </Text>
                          </View>
                        </MenuOption>
                      </MenuOptions>
                    </Menu>
                  </View>
                )}
                estimatedItemSize={120}
                ListFooterComponent={null}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                contentContainerStyle={{
                  paddingBottom: totalBottomPadding,
                }}
              />
              {/* Floating arrow buttons */}
              {showScrollTop && (
                <TouchableOpacity
                  style={styles.fabScrollTop}
                  onPress={scrollToTop}
                  accessibilityLabel="Scroll to top"
                  activeOpacity={0.85}
                >
                  <Ionicons name="arrow-up" size={SCROLL_ARROW_SIZE} color="#222" />
                </TouchableOpacity>
              )}
              {showScrollBottom && (
                <TouchableOpacity
                  style={styles.fabScrollBottom}
                  onPress={scrollToBottom}
                  accessibilityLabel="Scroll to bottom"
                  activeOpacity={0.85}
                >
                  <Ionicons name="arrow-down" size={SCROLL_ARROW_SIZE} color="#222" />
                </TouchableOpacity>
              )}
            </View>
          </>
        )}

        <AIManager
          visible={aiModalVisible}
          onClose={() => setAiModalVisible(false)}
          collectionId={collectionId ?? undefined}
          collectionName={collection?.name ?? undefined}
          collectionDescription={collection?.description ?? undefined}
          onCardsAccepted={fetchCards}
          setAiModalVisible={setAiModalVisible}
        />
      </ScreenContainer>
      <ManageCollectionMainMenu
        visible={mainMenuVisible}
        onOpen={openMainMenu}
        onClose={closeMainMenu}
        onAddCard={handleAddCardPress}
        onAskAI={() => {
          closeMainMenu();
          console.log('Ask AI');
          setAiModalVisible(true);
        }}
        onEditCollection={handleEditCollection}
        onDeleteCollection={handleDeleteCollection}
      />
      <View style={[styles.cardCountFooter, { backgroundColor: themeColors.headerBg }]}>
        <Ionicons
          name="albums-outline"
          size={16}
          color={themeColors.headerText}
          style={{ marginRight: 4 }}
        />
        <Text style={[styles.cardCountText, { color: themeColors.headerText }]}>
          {cards.length} {i18n.t('cards.numCards')}
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    width: '100%',
    height: '100%',
  },
  emptyContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  colNameContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    //backgroundColor: '#e3f2fd',
    backgroundColor: '#b3e5fc', //7dc5f5
  },
  colNameTxt: {
    fontWeight: 'bold',
    fontSize: 24,
    //color: '#000',
    color: '#0288d1',
  },
  cardGridNoOutline: {
    flex: 1,
    paddingHorizontal: 8,
  },
  navBtns: {
    flexDirection: 'row',
    paddingHorizontal: 15,
  },
  cardGridItem: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginVertical: 8,
    marginHorizontal: 4,
    flex: 1,
    minHeight: 90,
    justifyContent: 'center',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCardGridItem: {
    borderColor: Colors.light.tint,
    backgroundColor: '#e8f7ee',
  },
  cardGridFront: {
    fontWeight: 'bold',
    fontSize: 18,
    color: Colors.light.text,
    marginBottom: 6,
  },
  cardGridBack: {
    fontSize: 16,
    color: '#888',
  },
  menuOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  cardCountFooter: {
    paddingBottom: 8, // Add safe area + spacing
    paddingTop: 8,
    backgroundColor: '#0288d1', // Optional: background for visibility
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    // borderTopWidth: 1,
    // borderColor: '#ccc',
  },
  cardCountText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cardMenuDots: {
    color: '#000',
    padding: 8,
  },

  fabScrollTop: {
    position: 'absolute',
    right: 4,
    top: 16,
    zIndex: 20,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 30,
    padding: 2,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  fabScrollBottom: {
    position: 'absolute',
    right: 4,
    bottom: 90, // Above FAB menu button
    zIndex: 20,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 30,
    padding: 2,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
});
