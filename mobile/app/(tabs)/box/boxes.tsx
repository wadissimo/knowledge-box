import React, { useEffect, useState } from 'react';
import { Link, useRouter } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Box, useBoxModel } from '@/src/data/BoxModel';
import { useIsFocused, useTheme } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '@/src/context/ThemeContext';
import ScreenContainer from '@/src/components/common/ScreenContainer';
import { TodayStudyCardsCount, useCardTrainingService } from '@/src/service/CardTrainingService';

export default function BoxesPage() {
  const router = useRouter();
  const { fetchBoxes } = useBoxModel();
  const isFocused = useIsFocused();
  const [boxes, setBoxes] = useState<Box[]>([]);
  const { themeColors } = useThemeColors();
  const { getTodayStudyCardsCountByBox } = useCardTrainingService();
  const [todoCardCounts, setTodoCardCounts] = useState<TodayStudyCardsCount[]>([]);
  // console.log('boxes.tsx: rendering', isFocused);
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isFocused) {
          const boxes = await fetchBoxes();
          const counts = await Promise.all(boxes.map(box => getTodayStudyCardsCountByBox(box.id)));
          setTodoCardCounts(counts);
          setBoxes(boxes);
        }
      } catch (e) {
        console.error('boxes.tsx: fetchData error', e);
      }
    };
    fetchData();
  }, [isFocused]);

  const handleAddPress = () => {
    router.push('./newBox');
  };
  const handleBoxPress = (boxId: number) => {
    router.push(`/(tabs)/box/${boxId}/boxView`);
  };
  if (!isFocused) return null;

  return (
    <ScreenContainer>
      <ScrollView style={{ flex: 1 }}>
        {boxes.length === 0 && <Text>No boxes yet. Tap + to add one!</Text>}
        {boxes.map((box, index) => (
          <TouchableOpacity
            onPress={() => handleBoxPress(box.id)}
            key={`box_${box.id}`}
            activeOpacity={0.85}
            style={[styles.box, { backgroundColor: themeColors.cardBg }]}
          >
            <Text style={[styles.boxText, { color: themeColors.cardText }]}>{box.name}</Text>
            {todoCardCounts[index].newCardCount +
              todoCardCounts[index].learningCardCount +
              todoCardCounts[index].reviewCardCount >
              0 && (
              <Text style={[styles.todoText, { color: themeColors.cardText }]}>
                {todoCardCounts[index].newCardCount} {todoCardCounts[index].learningCardCount}{' '}
                {todoCardCounts[index].reviewCardCount}
              </Text>
            )}

            <Ionicons name="chevron-forward" size={26} color={themeColors.cardText} />
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 12,
          backgroundColor: 'transparent',
          position: 'relative',
        }}
      >
        <View style={styles.boxBtnContainer}>
          <TouchableOpacity onPress={handleAddPress} activeOpacity={0.85}>
            <View
              style={[
                styles.addBoxBtn,
                {
                  backgroundColor: themeColors.primaryBtnBg,
                  shadowColor: themeColors.primaryBtnShadow,
                },
              ]}
            >
              <Ionicons name="add" color={themeColors.primaryBtnText} size={36} />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  bottomPanel: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },

  box: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 14,
    backgroundColor: '#e3f2fd',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#0288d1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  boxText: {
    fontSize: 18,
    color: '#263238',
    fontWeight: '600',
    flex: 1,
  },
  todoText: {
    fontSize: 12,
    color: '#263238',
    fontWeight: 'normal',
  },
  boxBtnContainer: { position: 'absolute', bottom: 24, left: 0, right: 0, alignItems: 'center' },
  addBoxBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1976d2',
    shadowColor: '#0288d1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 10,
  },
});
