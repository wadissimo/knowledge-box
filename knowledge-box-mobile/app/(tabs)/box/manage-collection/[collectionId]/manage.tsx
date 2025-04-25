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
import { generateFlashcardsWithAI } from "@/src/service/AIService";
import { ActivityIndicator } from "react-native";

const SCROLL_ARROW_SIZE = 32;

export default function ManageCollectionScreen() {
  // --- AI Card Generation Modal State (must be at top, before any returns!) ---
  const [aiModalVisible, setAiModalVisible] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiErrorModal, setAiErrorModal] = useState(false);
  const [aiAmbiguous, setAiAmbiguous] = useState<string | null>(null);

  const ambiguityMessages: Record<string, string> = {
    missing_topic: i18n.t("cards.ambiguousMissingTopic") || "Please specify the topic for the flashcards.",
    missing_num_cards: i18n.t("cards.ambiguousMissingNumCards") || "Please specify how many cards you want.",
    missing_level: i18n.t("cards.ambiguousMissingLevel") || "Please specify the difficulty or level for the cards."
  };

  // --- AI Generated Cards State ---
  const [aiGeneratedCards, setAiGeneratedCards] = useState<{
    id: number;
    front: string;
    back: string;
    checked: boolean;
    isDuplicate?: boolean;
  }[]>([]);
  const [aiDuplicatesLoading, setAIDuplicatesLoading] = useState(false);

  const { colors } = useAppTheme();

  const router = useRouter();
  const { collectionId, affectedCardId } = useLocalSearchParams<{
    collectionId?: string;
    affectedCardId?: string;
  }>();

  const [selectedCard, setSelectedCard] = useState<number | null>(null);

  const { getCollectionById, deleteCollection } = useCollectionModel();
  const { getCards, deleteCard, isDuplicateCard, newCards } = useCardModel();
  const [cards, setCards] = useState<Card[]>([]);
  const [collection, setCollection] = useState<Collection | null>(null);
  const numCards = cards.length;

  // --- State for menus (must be before any return/conditional logic) ---
  const [mainMenuVisible, setMainMenuVisible] = useState(false);

  // --- Menu handlers ---
  const openMainMenu = () => setMainMenuVisible(true);
  const closeMainMenu = () => setMainMenuVisible(false);

  // --- FlashList ref and scroll arrows state (must be declared at the top level, not conditionally) ---
  const flashListRef = React.useRef<any>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(true);

  const aiCardsScrollRef = useRef<ScrollView>(null); // Fix type of aiCardsScrollRef
  const [aiCardsShowScrollArrow, setAiCardsShowScrollArrow] = useState(false);

  const handleAICardsScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const contentHeight = event.nativeEvent.contentSize.height;
    const layoutHeight = event.nativeEvent.layoutMeasurement.height;
    // Show arrow if not at bottom and content is scrollable
    setAiCardsShowScrollArrow(offsetY + layoutHeight < contentHeight - 10);
  };

  const scrollAICardsToBottom = () => {
    if (aiCardsScrollRef.current) {
      aiCardsScrollRef.current.scrollToEnd({ animated: true });
    }
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
    if (collectionId !== null)
      getCollectionById(Number(collectionId)).then((collection) =>
        setCollection(collection)
      );
  }, [collectionId]);
  useFocusEffect(
    useCallback(() => {
      fetchCards();
    }, [collectionId, affectedCardId])
  );

  const handleCardPress = (id: number) => {
    setSelectedCard(id);
    if (id !== null) {
      router.push(`/(tabs)/box/manage-collection/${collectionId}/${id}`);
    }
  };

  if (!collection) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const handleAddCardPress = () => {
    if (!collectionId) {
      console.error("collectionId is undefined");
      return;
    }
    closeMainMenu();
    console.log("handleAddCardPress");
    router.push(`/(tabs)/box/manage-collection/${collectionId}/new`);
  };

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

  // Check for duplicates for AI generated cards
  async function checkAIDuplicates(cards: { front: string; back: string }[]) {
    if (!collectionId) return [];
    setAIDuplicatesLoading(true);
    const results = await Promise.all(
      cards.map(card =>
        isDuplicateCard(Number(collectionId), card.front, card.back)
      )
    );
    setAIDuplicatesLoading(false);
    return results;
  }

  // Call after AI cards are generated
  async function handleAICardsWithDuplicates(cards: { id: number; front: string; back: string; checked: boolean }[]) {
    const duplicateFlags = await checkAIDuplicates(cards);
    setAiGeneratedCards(
      cards.map((card, idx) => ({
        ...card,
        isDuplicate: duplicateFlags[idx],
        checked: !duplicateFlags[idx] // uncheck if duplicate
      }))
    );
  }

  async function handleAIGenerate() {
    setAiGenerating(true);
    setAiGeneratedCards([]);
    setAiAmbiguous(null);
    try {
      const aiResult = await generateFlashcardsWithAI({
        prompt: aiPrompt,
        language: "en",
        collectionName: collection?.name || "",
        boxTitle: collection?.name || "",
        boxDescription: collection?.description || ""
      });
      if (Array.isArray(aiResult)) {
        // Cards returned
        const aiCardsWithId = aiResult.map((c, idx) => ({
          id: idx + 1,
          front: c.front,
          back: c.back,
          checked: true
        }));
        await handleAICardsWithDuplicates(aiCardsWithId);
      } else if (aiResult && typeof aiResult === 'object' && 'ambiguous' in aiResult) {
        setAiAmbiguous(aiResult.ambiguous);
      } else {
        setAiErrorModal(true);
      }
    } catch (e) {
      setAiErrorModal(true);
    }
    setAiGenerating(false);
  };

  const handleToggleAICard = (id: number) => {
    setAiGeneratedCards((prev) =>
      prev.map((card) =>
        card.id === id ? { ...card, checked: !card.checked } : card
      )
    );
  };

  const handleAcceptAICards = async () => {
    // Add checked cards to deck
    const accepted = aiGeneratedCards.filter((c) => c.checked);
    if (accepted.length === 0) return;
    // Prepare cards for newCards function
    const newCardsInput = accepted.map((c) => ({
      collectionId: collectionId ? Number(collectionId) : 0,
      front: c.front,
      back: c.back,
      frontImg: null,
      backImg: null,
      frontSound: null,
      backSound: null,
      initialEaseFactor: 2.5,
    }));
    // Save scroll position
    let scrollOffset = 0;
    if (flashListRef.current && flashListRef.current.scrollToOffset) {
      try {
        // @ts-ignore
        scrollOffset = await flashListRef.current.getScrollableNode().scrollTop || 0;
      } catch {}
    }
    setAiGenerating(true);
    await newCards(newCardsInput);
    setAiGeneratedCards([]);
    setAiModalVisible(false);
    await fetchCards();
    setAiGenerating(false);
    // Restore scroll position if possible
    if (flashListRef.current && flashListRef.current.scrollToOffset) {
      try {
        flashListRef.current.scrollToOffset({ offset: scrollOffset, animated: false });
      } catch {}
    }
    Alert.alert(i18n.t("cards.aiSuccess") || "New cards generated!");
  };

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

  return (
    <View style={styles.container}>
      {/* --- Header: only collection name --- */}
      <View style={[styles.colNameContainer, { backgroundColor: colors.card }]}> 
        <Text style={styles.colNameTxt}>{collection.name}</Text>
      </View>

      {/* --- Move edit/menu button (FAB) to bottom right --- */}
      <View style={styles.fabFixedMenuBtnBottomRight}>
        <Menu opened={mainMenuVisible} onBackdropPress={closeMainMenu}>
          <MenuTrigger customStyles={{ TriggerTouchableComponent: TouchableOpacity }}>
            <TouchableOpacity style={styles.fabBtnOnly} onPress={openMainMenu} accessibilityLabel="Show collection actions" activeOpacity={0.8}>
              <Ionicons name="ellipsis-horizontal" size={32} color="#fff" />
            </TouchableOpacity>
          </MenuTrigger>
          <MenuOptions customStyles={{ optionsContainer: { borderRadius: 18, padding: 4 } }}>
            <MenuOption onSelect={handleAddCardPress}>
              <View style={styles.menuOptionRow}><Ionicons name="add-circle-outline" size={22} color={Colors.light.tint} style={{ marginRight: 8 }} /><Text>{i18n.t("cards.addCardBtn")}</Text></View>
            </MenuOption>
            <MenuOption onSelect={() => { closeMainMenu(); setAiModalVisible(true); }}>
              <View style={styles.menuOptionRow}><Ionicons name="sparkles" size={22} color={Colors.light.tint} style={{ marginRight: 8 }} /><Text>{i18n.t("cards.askAiBtn") || "Ask AI to Generate"}</Text></View>
            </MenuOption>
            <MenuOption onSelect={handleEditCollection}>
              <View style={styles.menuOptionRow}><Ionicons name="create-outline" size={22} color={Colors.light.tint} style={{ marginRight: 8 }} /><Text>{i18n.t("cards.editCollection")}</Text></View>
            </MenuOption>
            <MenuOption onSelect={handleDeleteCollection} customStyles={{ optionWrapper: { backgroundColor: Colors.light.deleteBtn + '22', borderRadius: 10 } }}>
              <View style={styles.menuOptionRow}><Ionicons name="trash-outline" size={22} color={Colors.light.deleteBtn} style={{ marginRight: 8 }} /><Text style={{ color: Colors.light.deleteBtn, fontWeight: 'bold' }}>{i18n.t("cards.deleteCollection")}</Text></View>
            </MenuOption>
          </MenuOptions>
        </Menu>
      </View>

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

      {/* AI Card Generation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={aiModalVisible}
        onRequestClose={() => setAiModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{i18n.t("cards.askAiTitle") || "Ask AI to Generate Cards"}</Text>
            <Text style={styles.modalLabel}>{i18n.t("cards.askAiPrompt") || "Describe what cards you need:"}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. 5 cards about photosynthesis, easy level"
              value={aiPrompt}
              onChangeText={setAiPrompt}
              multiline
              editable={!aiGenerating && aiGeneratedCards.length === 0}
            />
            {/* Show loading spinner or AI card selection UI */}
            {aiGenerating && (
              <Text style={{ textAlign: 'center', marginVertical: 10 }}>{i18n.t("cards.generating") || "Generating..."}</Text>
            )}
            {!aiGenerating && aiGeneratedCards.length > 0 && (
              <View style={styles.aiCardsPreview}>
                <Text style={styles.modalLabel}>{i18n.t("cards.aiPreview") || "Review suggested cards:"}</Text>
                {aiDuplicatesLoading && <ActivityIndicator size="small" color="red" style={{ marginBottom: 8 }} />}
                <View style={{ maxHeight: 300, position: 'relative' }}>
                  <ScrollView
                    ref={aiCardsScrollRef}
                    showsVerticalScrollIndicator={true}
                    onScroll={handleAICardsScroll}
                    scrollEventThrottle={16}
                    style={{}}
                  >
                    {aiGeneratedCards.map((card) => (
                      <View key={card.id} style={styles.aiCardRow}>
                        <Pressable onPress={() => handleToggleAICard(card.id)} style={styles.aiCardCheckbox}>
                          <Ionicons name={card.checked ? "checkbox-outline" : "square-outline"} size={24} color={card.checked ? Colors.light.tint : '#aaa'} />
                        </Pressable>
                        <View style={styles.aiCardContent}>
                          <Text style={styles.aiCardFront}>{card.front}</Text>
                          <Text style={styles.aiCardBack}>{card.back}</Text>
                        </View>
                        {card.isDuplicate && (
                          <View style={{ marginLeft: 8, alignSelf: 'flex-start', backgroundColor: '#fee', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 }}>
                            <Text style={{ color: 'red', fontWeight: 'bold', fontSize: 12 }}>duplicate</Text>
                          </View>
                        )}
                      </View>
                    ))}
                  </ScrollView>
                  {aiCardsShowScrollArrow && (
                    <TouchableOpacity
                      style={{ position: 'absolute', right: 8, bottom: 8, backgroundColor: '#fff', borderRadius: 16, padding: 4, elevation: 2, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4 }}
                      onPress={scrollAICardsToBottom}
                      accessibilityLabel="Scroll to bottom of AI cards"
                      activeOpacity={0.85}
                    >
                      <Ionicons name="arrow-down" size={28} color="#222" />
                    </TouchableOpacity>
                  )}
                </View>
                <View style={styles.modalButtonRow}>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: Colors.light.tint }]} 
                    onPress={handleAcceptAICards}
                    disabled={aiGeneratedCards.filter(c => c.checked).length === 0}
                  >
                    <Text style={styles.modalButtonText}>{i18n.t("cards.save") || "Save"}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: Colors.light.deleteBtn }]} 
                    onPress={() => { setAiGeneratedCards([]); setAiModalVisible(false); }}
                  >
                    <Text style={styles.modalButtonText}>{i18n.t("common.cancel") || "Cancel"}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            {!aiGenerating && aiAmbiguous && (
              <View style={styles.aiCardsPreview}>
                <Text style={styles.modalLabel}>{i18n.t("cards.noSuggestedCardsTitle") || "No Cards Suggested"}</Text>
                <Text style={{ color: 'red', marginVertical: 10 }}>
                  {ambiguityMessages[aiAmbiguous] || i18n.t("cards.noSuggestedCardsMsg")}
                </Text>
                <View style={styles.modalButtonRow}>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: Colors.light.tint }]}
                    onPress={() => setAiAmbiguous(null)}
                  >
                    <Text style={styles.modalButtonText}>{i18n.t("cards.tryAgain") || "Edit Prompt & Try Again"}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: Colors.light.deleteBtn }]}
                    onPress={() => { setAiAmbiguous(null); setAiModalVisible(false); }}
                  >
                    <Text style={styles.modalButtonText}>{i18n.t("common.cancel") || "Cancel"}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            {!aiGenerating && aiErrorModal && (
              <View style={styles.aiCardsPreview}>
                <Text style={styles.modalLabel}>{i18n.t("cards.aiError") || "AI Error"}</Text>
                <Text style={{ color: 'red', marginVertical: 10 }}>{i18n.t("cards.noSuggestedCardsMsg")}</Text>
                <View style={styles.modalButtonRow}>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: Colors.light.tint }]}
                    onPress={() => { setAiErrorModal(false); }}
                  >
                    <Text style={styles.modalButtonText}>{i18n.t("cards.tryAgain") || "Edit Prompt & Try Again"}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: Colors.light.deleteBtn }]}
                    onPress={() => { setAiErrorModal(false); setAiModalVisible(false); }}
                  >
                    <Text style={styles.modalButtonText}>{i18n.t("common.cancel") || "Cancel"}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            {/* Show ask AI button if not generating and no cards yet, and not ambiguous */}
            {!aiGenerating && aiGeneratedCards.length === 0 && !aiAmbiguous && (
              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: Colors.light.tint }]} 
                  onPress={handleAIGenerate}
                  disabled={aiGenerating || !aiPrompt.trim()}
                >
                  <Text style={styles.modalButtonText}>
                    {i18n.t("cards.askAiBtn") || "Ask AI"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: Colors.light.deleteBtn }]} 
                  onPress={() => setAiModalVisible(false)}
                  disabled={aiGenerating}
                >
                  <Text style={styles.modalButtonText}>{i18n.t("common.cancel") || "Cancel"}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
      {/* Error Modal for no cards or error */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={aiErrorModal}
        onRequestClose={() => setAiErrorModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{i18n.t("cards.noSuggestedCardsTitle") || "No Cards Suggested"}</Text>
            <Text style={styles.modalLabel}>{i18n.t("cards.noSuggestedCardsMsg") || "No cards were suggested by AI. Please modify your prompt and try again."}</Text>
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: Colors.light.tint }]} 
                onPress={() => { setAiErrorModal(false); setAiModalVisible(true); }}
              >
                <Text style={styles.modalButtonText}>{i18n.t("common.tryAgain") || "Edit Prompt & Try Again"}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: Colors.light.deleteBtn }]} 
                onPress={() => setAiErrorModal(false)}
              >
                <Text style={styles.modalButtonText}>{i18n.t("common.cancel") || "Cancel"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
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
