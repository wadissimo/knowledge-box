// app/manage-collection/[collectionId].tsx
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  TextInput,
  Image,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  TouchableOpacity,
  Modal,
  Platform,
  ScrollView, // Add ScrollView import
  ActivityIndicator, // Import ActivityIndicator
} from "react-native";

import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from "react-native-popup-menu";

import {
  Collection, useCollectionModel
} from "@/src/data/CollectionModel";
import { Card, useCardModel } from "@/src/data/CardModel";
import { useTheme } from "@react-navigation/native";
import { Colors } from "@/src/constants/Colors";
import { i18n } from "@/src/lib/i18n";
import { useAppTheme } from "@/src/hooks/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from '@shopify/flash-list';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { AIManager } from "./AIManager";
import { MainMenu } from "./MainMenu";

const SCROLL_ARROW_SIZE = 32;

const ambiguityMessages: Record<string, string> = {
  missing_topic: i18n.t("cards.ambiguousTopic") || "The topic is ambiguous. Please clarify your request.",
  missing_num_cards: i18n.t("cards.ambiguousQuantity") || "The number of cards requested is ambiguous. Please clarify the amount.",
  missing_level: i18n.t("cards.ambiguousLevel") || "The requested difficulty level is ambiguous. Please specify.",
  default: i18n.t("cards.noSuggestedCardsMsg") || "No cards were suggested by AI. Please modify your prompt and try again."
};

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

  const { colors } = useAppTheme();

  const router = useRouter();
  const { collectionId, affectedCardId } = useLocalSearchParams<{
    collectionId?: string;
    affectedCardId?: string;
  }>();
  console.log("collectionId", collectionId);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);

  const { getCollectionById, deleteCollection } = useCollectionModel();
  const { getCards, deleteCard, newCards } = useCardModel();
  const [cards, setCards] = useState<Card[]>([]);
  const [collection, setCollection] = useState<Collection | null>(null);
  const numCards = cards.length;

  const handleCardPress = (id: number) => {
    setSelectedCard(id);
    if (id !== null) {
      router.push(`/(tabs)/box/manage-collection/${collectionId}/${id}`);
    }
  };

  const handleAddCardPress = () => {
    if (!collectionId) {
      console.error("collectionId is undefined");
      Alert.alert("Error", "Collection ID is undefined");
      return;
    }
    closeMainMenu();
    setTimeout(() => {
      console.log("Navigating to new card screen for collectionId:", collectionId);
      router.push(`/(tabs)/box/manage-collection/${collectionId}/new`);
    }, 250); // Wait for menu to close to avoid navigation bug
  };

  const EmptyState = (
    <>
      <View style={[styles.colNameContainer, { backgroundColor: colors.card }]}> 
        <Text style={styles.colNameTxt}>{collection?.name}</Text>
      </View>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Ionicons name="albums-outline" size={56} color={Colors.light.tint} style={{ marginBottom: 16 }} />
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: Colors.light.text, marginBottom: 12, textAlign: 'center' }}>
          {i18n.t("cards.noCardsYet")}
        </Text>
        <Text style={{ fontSize: 16, color: '#666', marginBottom: 18, textAlign: 'center', maxWidth: 320 }}>
          {i18n.t("cards.noCardsHint")}
          <Ionicons name="ellipsis-horizontal" size={20} color={Colors.light.tint} />
          {i18n.t("cards.noCardsHint2")}
        </Text>
        <Text style={{ fontSize: 16, color: Colors.light.tint, marginBottom: 28, textAlign: 'center', maxWidth: 320 }}>
          {i18n.t("cards.noCardsAIHint")}
        </Text>
        <View style={{ position: 'absolute', right: 80, bottom: 35, alignItems: 'center' }}>
          <Ionicons name="arrow-down" size={40} color={Colors.light.tint} style={{ transform: [{ rotate: '-45deg' }] }} />
        </View>
      </View>
      <View style={styles.cardCountFooter}>
        <Ionicons name="albums-outline" size={16} color={Colors.light.tint} style={{ marginRight: 4 }} />
        <Text style={styles.cardCountText}>{cards.length} {i18n.t("cards.numCards")}</Text>
      </View>
    </>
  );

  

  const handleEditCardPress = (id?: number) => {
    const cardId = typeof id === 'number' ? id : selectedCard;
    if (!collectionId || cardId == null) {
      console.error("collectionId or cardId is undefined");
      return;
    }
    router.push(`/(tabs)/box/manage-collection/${collectionId}/${cardId}`);
  };

  const handleDeleteCardPress = (id?: number) => {
    const cardId = typeof id === 'number' ? id : selectedCard;
    if (!cardId) return;
    Alert.alert(
      i18n.t("common.confirm.deletion"),
      i18n.t("cards.confirmDeletionText"),
      [
        {
          text: i18n.t("common.cancel"),
          onPress: () => console.log("Deletion cancelled"),
          style: "cancel",
        },
        {
          text: i18n.t("common.delete"),
          onPress: () => {
            console.log("Deleting card...");
            async function onDeleteCard() {
              await deleteCard(Number(cardId));
              fetchCards();
              setSelectedCard(null);
            }
            onDeleteCard();
          },
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  const handleEditCollection = () => {
    if (!collectionId) {
      console.error("collectionId is undefined");
      return;
    }

    router.push(`/(tabs)/box/manage-collection/${collectionId}/edit`);
  };

  const handleDeleteCollection = () => {
    Alert.alert(
      i18n.t("common.confirm.deletion"),
      i18n.t("cards.collectionConfirmDeletionText"),
      [
        {
          text: i18n.t("common.cancel"),
          onPress: () => console.log("Deletion cancelled"),
          style: "cancel",
        },
        {
          text: i18n.t("common.delete"),
          onPress: () => {
            console.log("Deleting collection...");
            deleteCollection(Number(collectionId));
            router.back();
            router.back();
          },
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  async function fetchCards() {
    var cards = await getCards(Number(collectionId));
    setCards(cards);
    if (affectedCardId) {
      if (affectedCardId == "-1") {
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
        console.log("Fetching collection...")
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
    // Show loading spinner instead of just text
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
        <Text style={{marginTop: 16}}>{i18n.t("common.loading") || "Loading..."}</Text>
      </View>
    );
  }

  if (cards.length === 0) {
    console.log("no cards, collection", collection);
    return (
      <View style={styles.container}>
        {EmptyState}
        <MainMenu
          visible={mainMenuVisible}
          onOpen={openMainMenu}
          onClose={closeMainMenu}
          onAddCard={handleAddCardPress}
          onAskAI={() => { closeMainMenu(); setAiModalVisible(true); }}
          onEditCollection={handleEditCollection}
          onDeleteCollection={handleDeleteCollection}
        />
        <AIManager
          visible={aiModalVisible}
          onClose={() => setAiModalVisible(false)}
          collectionId={collectionId ?? undefined}
          collectionName={collection?.name ?? undefined}
          collectionDescription={collection?.description ?? undefined}
          onCardsAccepted={fetchCards}
          setAiModalVisible={setAiModalVisible}
        />
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {cards.length === 0 ? EmptyState : (
        <>
          {/* --- Header: only collection name --- */}
          <View style={[styles.colNameContainer, { backgroundColor: colors.card }]}> 
            <Text style={styles.colNameTxt}>{collection.name}</Text>
          </View>

          {/* --- Move edit/menu button (FAB) to bottom right --- */}
          <MainMenu
            visible={mainMenuVisible}
            onOpen={openMainMenu}
            onClose={closeMainMenu}
            onAddCard={handleAddCardPress}
            onAskAI={() => { closeMainMenu(); console.log("Ask AI"); setAiModalVisible(true); }}
            onEditCollection={handleEditCollection}
            onDeleteCollection={handleDeleteCollection}
          />

          <View style={{ flex: 1 }}>
            <View style={styles.cardGridNoOutline}>
              {/* FlashList of cards */}
              <FlashList
                ref={flashListRef}
                data={cards}
                keyExtractor={(item) => item.id.toString()}
                numColumns={Platform.OS === 'web' ? 3 : 1}
                renderItem={({ item }) => (
                  <View
                    style={[
                      styles.cardGridItem,
                      item.id === selectedCard && styles.selectedCardGridItem,
                      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', position: 'relative' },
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardGridFront}>{item.front}</Text>
                      <Text style={styles.cardGridBack}>{item.back}</Text>
                    </View>
                    <Menu>
                      <MenuTrigger customStyles={{ TriggerTouchableComponent: Pressable }}>
                        <Ionicons name="ellipsis-vertical" size={24} style={styles.cardMenuDots} />
                      </MenuTrigger>
                      <MenuOptions customStyles={{ optionsContainer: { borderRadius: 14, padding: 2, minWidth: 140 } }}>
                        <MenuOption onSelect={() => handleEditCardPress(item.id)}>
                          <View style={styles.menuOptionRow}><Ionicons name="create-outline" size={20} color={Colors.light.tint} style={{ marginRight: 6 }} /><Text>{i18n.t("cards.editCardBtn")}</Text></View>
                        </MenuOption>
                        <MenuOption onSelect={() => handleDeleteCardPress(item.id)} customStyles={{ optionWrapper: { backgroundColor: Colors.light.deleteBtn + '22', borderRadius: 10 } }}>
                          <View style={styles.menuOptionRow}><Ionicons name="trash-outline" size={20} color={Colors.light.deleteBtn} style={{ marginRight: 6 }} /><Text style={{ color: Colors.light.deleteBtn, fontWeight: 'bold' }}>{i18n.t("cards.deleteCardBtn")}</Text></View>
                        </MenuOption>
                      </MenuOptions>
                    </Menu>
                  </View>
                )}
                estimatedItemSize={120}
                ListFooterComponent={null}
                onScroll={handleScroll}
                scrollEventThrottle={16}
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
          </View>

          {/* --- Move card count to footer --- */}
          <View style={styles.cardCountFooter}>
            <Ionicons name="albums-outline" size={16} color={Colors.light.tint} style={{ marginRight: 4 }} />
            <Text style={styles.cardCountText}>{cards.length} {i18n.t("cards.numCards")}</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 10,
    flexDirection: "column",
    justifyContent: "flex-start",
    width: "100%",
    height: "100%",
  },
  colNameContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    //backgroundColor: "#c2fbc4",
    marginBottom: 10,
  },
  colNameTxt: {
    fontWeight: "bold",
    fontSize: 24,
  },
  cardGridNoOutline: {
    flex: 1,
    padding: 8,
  },
  navBtns: {
    flexDirection: "row",
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
    color: Colors.light.textDim || '#888',
  },

  addCardBtn: {
    paddingTop: 5,
  },

  deleteCollectionBtn: {
    paddingTop: 5,
  },
  cardEditBtns: {
    flexDirection: "row",
    gap: 10,
    paddingTop: 5,
    justifyContent: "space-evenly",
  },
  editColBtn: {
    paddingTop: 5,
  },
  collectionEditBtns: {
    paddingTop: 10,
    flexDirection: "row",
    gap: 10,

    justifyContent: "space-evenly",
  },
  deleteCardBtn: {
    paddingTop: 5,
  },
  spacer: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: Platform.OS === 'ios' ? 34 : 24,
    backgroundColor: Colors.light.tint,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
    zIndex: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    alignItems: 'stretch',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  modalInput: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    minHeight: 60,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  modalButton: {
    flex: 1, // Make buttons share available space
    height: 70, // Increased for full text visibility
    paddingHorizontal: 12, // Slightly less padding to avoid overflow
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
    minWidth: 0, // Prevent flexbox overflow
    maxWidth: '100%',
  },
  modalButtonText: {
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false, // Android only
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18, // Further increased for clarity
  },
  aiCardsPreview: {
    marginTop: 16,
    marginBottom: 8,
  },
  aiCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 8,
  },
  aiCardCheckbox: {
    marginRight: 12,
  },
  aiCardContent: {
    flex: 1,
  },
  aiCardFront: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  aiCardBack: {
    fontSize: 15,
    color: '#444',
  },
  menuOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  cardCountFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  cardCountText: {
    color: Colors.light.tint,
    fontWeight: 'bold',
    fontSize: 16,
  },
  fabFixedMenuBtnBottomRight: {
    position: 'absolute',
    right: 18,
    bottom: 18,
    zIndex: 30,
  },
  fabBtnOnly: {
    backgroundColor: Colors.light.tint,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
    zIndex: 20,
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
    shadowOpacity: 0.10,
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
    shadowOpacity: 0.10,
    shadowRadius: 2,
  },
});
