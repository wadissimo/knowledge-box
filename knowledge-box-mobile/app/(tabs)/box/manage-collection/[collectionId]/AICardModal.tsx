import React, { RefObject } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/src/constants/Colors';
import { i18n } from '@/src/lib/i18n';

interface Card {
  id: number;
  front: string;
  back: string;
  checked: boolean;
  isDuplicate?: boolean;
}

interface AICardModalProps {
  visible: boolean;
  onRequestClose: () => void;
  aiPrompt: string;
  setAiPrompt: (prompt: string) => void;
  aiGenerating: boolean;
  aiGeneratedCards: Card[];
  aiDuplicatesLoading: boolean;
  aiCardsScrollRef: RefObject<ScrollView>;
  aiCardsShowScrollArrow: boolean;
  handleAICardsScroll: (event: any) => void;
  scrollAICardsToBottom: () => void;
  handleToggleAICard: (id: number) => void;
  handleAcceptAICards: () => void;
  setAiGeneratedCards: (cards: Card[]) => void;
  setAiModalVisible: (visible: boolean) => void;
  handleAIGenerate: () => void;
  aiAmbiguous: string | null;
  ambiguityMessages: Record<string, string>;
  aiErrorModal: boolean;
  setAiErrorModal: (visible: boolean) => void;
  setAiAmbiguous: (val: string | null) => void;
  Colors: typeof Colors;
}

export const AICardModal: React.FC<AICardModalProps> = ({
  visible,
  onRequestClose,
  aiPrompt,
  setAiPrompt,
  aiGenerating,
  aiGeneratedCards,
  aiDuplicatesLoading,
  aiCardsScrollRef,
  aiCardsShowScrollArrow,
  handleAICardsScroll,
  scrollAICardsToBottom,
  handleToggleAICard,
  handleAcceptAICards,
  setAiGeneratedCards,
  setAiModalVisible,
  handleAIGenerate,
  aiAmbiguous,
  ambiguityMessages,
  aiErrorModal,
  setAiErrorModal,
  setAiAmbiguous,
  Colors,
}) => (
  <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onRequestClose}>
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)',
      }}
    >
      <View style={{ width: '90%', backgroundColor: '#fff', borderRadius: 18, padding: 20 }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 8 }}>
          {i18n.t('cards.askAiTitle') || 'Ask AI to Generate Cards'}
        </Text>
        <Text style={{ fontSize: 15, marginBottom: 8 }}>
          {i18n.t('cards.askAiPrompt') || 'Describe what cards you need:'}
        </Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: Colors.light.border,
            borderRadius: 8,
            padding: 8,
            minHeight: 60,
            marginBottom: 10,
          }}
          placeholder="e.g. 5 cards about photosynthesis, easy level"
          value={aiPrompt}
          onChangeText={setAiPrompt}
          multiline
          editable={!aiGenerating && aiGeneratedCards.length === 0}
        />
        {aiGenerating && (
          <Text style={{ textAlign: 'center', marginVertical: 10 }}>
            {i18n.t('cards.generating') || 'Generating...'}
          </Text>
        )}
        {!aiGenerating && aiGeneratedCards.length > 0 && (
          <View style={{ marginBottom: 10 }}>
            <Text style={{ fontSize: 15, marginBottom: 8 }}>
              {i18n.t('cards.aiPreview') || 'Review suggested cards:'}
            </Text>
            {aiDuplicatesLoading && (
              <ActivityIndicator size="small" color="red" style={{ marginBottom: 8 }} />
            )}
            <View style={{ maxHeight: 300, position: 'relative' }}>
              <ScrollView
                ref={aiCardsScrollRef}
                showsVerticalScrollIndicator={true}
                onScroll={handleAICardsScroll}
                scrollEventThrottle={16}
              >
                {aiGeneratedCards.map(card => (
                  <View
                    key={card.id}
                    style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 }}
                  >
                    <Pressable
                      onPress={() => handleToggleAICard(card.id)}
                      style={{ marginRight: 8, marginTop: 2 }}
                    >
                      <Ionicons
                        name={card.checked ? 'checkbox-outline' : 'square-outline'}
                        size={24}
                        color={card.checked ? Colors.light.tint : '#aaa'}
                      />
                    </Pressable>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: 'bold' }}>{card.front}</Text>
                      <Text>{card.back}</Text>
                    </View>
                    {card.isDuplicate && (
                      <View
                        style={{
                          marginLeft: 8,
                          alignSelf: 'flex-start',
                          backgroundColor: '#fee',
                          borderRadius: 4,
                          paddingHorizontal: 6,
                          paddingVertical: 2,
                        }}
                      >
                        <Text style={{ color: 'red', fontWeight: 'bold', fontSize: 12 }}>
                          duplicate
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </ScrollView>
              {aiCardsShowScrollArrow && (
                <TouchableOpacity
                  style={{
                    position: 'absolute',
                    right: 8,
                    bottom: 8,
                    backgroundColor: '#fff',
                    borderRadius: 16,
                    padding: 4,
                    elevation: 2,
                    shadowColor: '#000',
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                  }}
                  onPress={scrollAICardsToBottom}
                  accessibilityLabel="Scroll to bottom of AI cards"
                  activeOpacity={0.85}
                >
                  <Ionicons name="arrow-down" size={28} color="#222" />
                </TouchableOpacity>
              )}
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: Colors.light.tint,
                  borderRadius: 8,
                  padding: 10,
                  marginRight: 8,
                  alignItems: 'center',
                }}
                onPress={handleAcceptAICards}
                disabled={aiGeneratedCards.filter(c => c.checked).length === 0}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                  {i18n.t('cards.save') || 'Save'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: Colors.light.deleteBtn,
                  borderRadius: 8,
                  padding: 10,
                  alignItems: 'center',
                }}
                onPress={() => {
                  setAiGeneratedCards([]);
                  setAiModalVisible(false);
                }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                  {i18n.t('common.cancel') || 'Cancel'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        {!aiGenerating && aiAmbiguous && (
          <View style={{ marginBottom: 10 }}>
            <Text style={{ fontSize: 15, marginBottom: 8 }}>
              {i18n.t('cards.noSuggestedCardsTitle') || 'No Cards Suggested'}
            </Text>
            <Text style={{ color: 'red', marginVertical: 10 }}>
              {ambiguityMessages[aiAmbiguous] || ambiguityMessages.default}
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: Colors.light.tint,
                  borderRadius: 8,
                  padding: 10,
                  marginRight: 8,
                  alignItems: 'center',
                }}
                onPress={handleAIGenerate}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                  {i18n.t('cards.regenerate') || 'Regenerate'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: Colors.light.deleteBtn,
                  borderRadius: 8,
                  padding: 10,
                  alignItems: 'center',
                }}
                onPress={() => {
                  setAiAmbiguous(null);
                  setAiModalVisible(false);
                }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                  {i18n.t('common.cancel') || 'Cancel'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        {!aiGenerating && aiErrorModal && (
          <View style={{ marginBottom: 10 }}>
            <Text style={{ fontSize: 15, marginBottom: 8 }}>
              {i18n.t('cards.aiError') || 'AI Error'}
            </Text>
            <Text style={{ color: 'red', marginVertical: 10 }}>
              {i18n.t('cards.noSuggestedCardsMsg')}
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: Colors.light.tint,
                  borderRadius: 8,
                  padding: 10,
                  marginRight: 8,
                  alignItems: 'center',
                }}
                onPress={() => {
                  setAiErrorModal(false);
                }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                  {i18n.t('cards.tryAgain') || 'Edit Prompt & Try Again'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: Colors.light.deleteBtn,
                  borderRadius: 8,
                  padding: 10,
                  alignItems: 'center',
                }}
                onPress={() => {
                  setAiErrorModal(false);
                  setAiModalVisible(false);
                }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                  {i18n.t('common.cancel') || 'Cancel'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        {!aiGenerating && aiGeneratedCards.length === 0 && !aiAmbiguous && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: Colors.light.tint,
                borderRadius: 8,
                padding: 10,
                marginRight: 8,
                alignItems: 'center',
              }}
              onPress={handleAIGenerate}
              disabled={aiGenerating || !aiPrompt.trim()}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                {i18n.t('cards.askAiBtn') || 'Ask AI'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: Colors.light.deleteBtn,
                borderRadius: 8,
                padding: 10,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={() => setAiModalVisible(false)}
              disabled={aiGenerating}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                {i18n.t('common.cancel') || 'Cancel'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  </Modal>
);
