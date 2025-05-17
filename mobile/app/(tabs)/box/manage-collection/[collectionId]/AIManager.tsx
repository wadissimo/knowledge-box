import React, { useState, useRef, useCallback } from 'react';
import { ScrollView, Alert } from 'react-native';
import { AICardModal } from './AICardModal';
import { AIErrorModal } from './AIErrorModal';
import { generateFlashcardsWithAI } from '@/src/service/AIService';
import { useCardModel } from '@/src/data/CardModel';
import { i18n } from '@/src/lib/i18n';
import { Colors } from '@/src/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { isAISetupCompleted } from '@/src/utils/aiSetup';
import { SETTING_IDS, useSettingsModel } from '@/src/data/SettingsModel';

const ambiguityMessages: Record<string, string> = {
  missing_topic:
    i18n.t('cards.ambiguousTopic') || 'The topic is ambiguous. Please clarify your request.',
  missing_num_cards:
    i18n.t('cards.ambiguousQuantity') ||
    'The number of cards requested is ambiguous. Please clarify the amount.',
  missing_level:
    i18n.t('cards.ambiguousLevel') ||
    'The requested difficulty level is ambiguous. Please specify.',
  default:
    i18n.t('cards.noSuggestedCardsMsg') ||
    'No cards were suggested by AI. Please modify your prompt and try again.',
};

interface AIManagerProps {
  visible: boolean;
  onClose: () => void;
  collectionId: string | undefined;
  collectionName: string | undefined;
  collectionDescription: string | undefined;
  onCardsAccepted: () => void;
}

export const AIManager: React.FC<AIManagerProps & { setAiModalVisible?: (v: boolean) => void }> = ({
  visible,
  onClose,
  collectionId,
  collectionName,
  collectionDescription,
  onCardsAccepted,
  setAiModalVisible,
}) => {
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiErrorModal, setAiErrorModal] = useState(false);
  const [aiAmbiguous, setAiAmbiguous] = useState<string | null>(null);
  const [aiGeneratedCards, setAiGeneratedCards] = useState<
    {
      id: number;
      front: string;
      back: string;
      checked: boolean;
      isDuplicate?: boolean;
    }[]
  >([]);
  const [aiDuplicatesLoading, setAIDuplicatesLoading] = useState(false);
  const aiCardsScrollRef = useRef<ScrollView>(null);
  const [aiCardsShowScrollArrow, setAiCardsShowScrollArrow] = useState(false);

  const { isDuplicateCard, newCards } = useCardModel();
  const router = useRouter();
  const { getSettingById } = useSettingsModel();

  const handleAICardsScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const contentHeight = event.nativeEvent.contentSize.height;
    const layoutHeight = event.nativeEvent.layoutMeasurement.height;
    setAiCardsShowScrollArrow(offsetY + layoutHeight < contentHeight - 10);
  };

  const scrollAICardsToBottom = () => {
    if (aiCardsScrollRef.current) {
      aiCardsScrollRef.current.scrollToEnd({ animated: true });
    }
  };

  // Check for duplicates for AI generated cards
  async function checkAIDuplicates(cards: { front: string; back: string }[]) {
    if (!collectionId) return [];
    setAIDuplicatesLoading(true);
    const results = await Promise.all(
      cards.map(card => isDuplicateCard(Number(collectionId), card.front, card.back))
    );
    setAIDuplicatesLoading(false);
    return results;
  }

  // Call after AI cards are generated
  async function handleAICardsWithDuplicates(
    cards: { id: number; front: string; back: string; checked: boolean }[]
  ) {
    const duplicateFlags = await checkAIDuplicates(cards);
    setAiGeneratedCards(
      cards.map((card, idx) => ({
        ...card,
        isDuplicate: duplicateFlags[idx],
        checked: !duplicateFlags[idx], // uncheck if duplicate
      }))
    );
  }

  async function handleAIGenerate() {
    // Debug log for AI setup status
    const setupCompleted = await isAISetupCompleted();
    const apiKey = await getSettingById(SETTING_IDS.apiKey);
    console.log('[AIManager] AI setup completed:', setupCompleted);
    if (!setupCompleted || !apiKey || !apiKey.value) {
      if (setAiModalVisible) setAiModalVisible(false);
      if (typeof onClose === 'function') onClose();
      router.push('./AISetup');
      return;
    }
    setAiGenerating(true);
    setAiGeneratedCards([]);
    setAiAmbiguous(null);
    try {
      if (!apiKey || !apiKey.value) {
        throw new Error('API Key not found. Please set it up in AI Settings.');
      }
      const aiResult = await generateFlashcardsWithAI({
        apiKey: apiKey.value,
        prompt: aiPrompt,
        language: 'en',
        collectionName: collectionName || '',
        boxTitle: collectionName || '',
        boxDescription: collectionDescription || '',
      });
      if (Array.isArray(aiResult)) {
        const aiCardsWithId = aiResult.map((c, idx) => ({
          id: idx + 1,
          front: c.front,
          back: c.back,
          checked: true,
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
  }

  const handleToggleAICard = (id: number) => {
    setAiGeneratedCards(prev =>
      prev.map(card => (card.id === id ? { ...card, checked: !card.checked } : card))
    );
  };

  const handleAcceptAICards = async () => {
    const accepted = aiGeneratedCards.filter(c => c.checked);
    if (accepted.length === 0) return;
    const newCardsInput = accepted.map(c => ({
      collectionId: collectionId ? Number(collectionId) : 0,
      front: c.front,
      back: c.back,
      frontImg: null,
      backImg: null,
      frontSound: null,
      backSound: null,
      initialEaseFactor: 2.5,
    }));
    setAiGenerating(true);
    await newCards(newCardsInput);
    setAiGeneratedCards([]);
    setAiPrompt('');
    setAiAmbiguous(null);
    setAiGenerating(false);
    onClose();
    onCardsAccepted();
    Alert.alert(i18n.t('cards.aiSuccess') || 'New cards generated!');
  };

  console.log('aiModalVisible', visible);

  return (
    <>
      <AICardModal
        visible={visible}
        onRequestClose={onClose}
        aiPrompt={aiPrompt}
        setAiPrompt={setAiPrompt}
        aiGenerating={aiGenerating}
        aiGeneratedCards={aiGeneratedCards}
        aiDuplicatesLoading={aiDuplicatesLoading}
        aiCardsScrollRef={aiCardsScrollRef}
        aiCardsShowScrollArrow={aiCardsShowScrollArrow}
        handleAICardsScroll={handleAICardsScroll}
        scrollAICardsToBottom={scrollAICardsToBottom}
        handleToggleAICard={handleToggleAICard}
        handleAcceptAICards={handleAcceptAICards}
        setAiGeneratedCards={setAiGeneratedCards}
        setAiModalVisible={onClose}
        handleAIGenerate={handleAIGenerate}
        aiAmbiguous={aiAmbiguous}
        ambiguityMessages={ambiguityMessages}
        aiErrorModal={aiErrorModal}
        setAiErrorModal={setAiErrorModal}
        Colors={Colors}
        setAiAmbiguous={setAiAmbiguous}
      />
      <AIErrorModal
        visible={aiErrorModal}
        onTryAgain={() => {
          setAiErrorModal(false);
        }}
        onCancel={() => setAiErrorModal(false)}
      />
    </>
  );
};
