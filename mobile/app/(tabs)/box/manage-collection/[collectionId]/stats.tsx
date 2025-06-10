import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useReviewLogModel } from '@/src/data/ReviewLogModel';
import { useCollectionModel } from '@/src/data/CollectionModel';
import { useCardModel } from '@/src/data/CardModel';
import { useThemeColors } from '@/src/context/ThemeContext';

// Helper for color scale (GitHub style, shades of green)
const getColor = (count: number, thresholds: number[]) => {
  if (count === 0) return '#e0e0e0'; // Light gray
  if (count < thresholds[0]) return '#b7e5c7';
  if (count < thresholds[1]) return '#6fdc8c';
  if (count < thresholds[2]) return '#34c759';
  return '#198d3c';
};

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const StatsScreen = () => {
  const { collectionId } = useLocalSearchParams();
  const { getCollectionReviewStats } = useReviewLogModel();
  const { getCollectionById, getCollectionTrainingData } = useCollectionModel();
  const { getCardsCount } = useCardModel();
  const { themeColors } = useThemeColors();
  const router = useRouter();

  const [weeks, setWeeks] = useState<any[]>([]);
  const [thresholds, setThresholds] = useState<number[]>([1, 5, 10]);
  const [loading, setLoading] = useState(true);
  const [collection, setCollection] = useState<any>(null);
  const [trainingData, setTrainingData] = useState<any>(null);
  const [cardsCount, setCardsCount] = useState<number>(0);

  useEffect(() => {
    if (!collectionId) return;
    const colId = Number(collectionId);
    setLoading(true);
    Promise.all([
      getCollectionReviewStats(colId),
      getCollectionById(colId),
      getCollectionTrainingData(colId),
      getCardsCount(colId),
    ]).then(([weeks, collection, trainingData, cardsCount]) => {
      setWeeks(weeks);
      setCollection(collection);
      setTrainingData(trainingData);
      setCardsCount(cardsCount);
      // Calculate thresholds based on trainingOptions and collection size
      const planned = trainingData?.maxReviewCards || 10;
      setThresholds([
        Math.max(1, Math.round(planned * 0.3)),
        Math.max(2, Math.round(planned * 0.7)),
        Math.max(3, planned),
      ]);
    }).finally(() => setLoading(false));
  }, [collectionId]);

  // Build month labels (show only when first week of the month)
  const monthLabels: { [weekIdx: number]: string } = {};
  let lastMonth = '';
  weeks.forEach((week, i) => {
    const month = MONTH_NAMES[new Date(week.weekStart).getMonth()];
    if (month !== lastMonth) {
      monthLabels[i] = month;
      lastMonth = month;
    }
  });

  return (
    <ScrollView style={{ flex: 1, backgroundColor: themeColors.cardBg }} contentContainerStyle={{ padding: 16 }}>
      <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 12 }}>
        <Text style={{ color: themeColors.activeTintColor, fontWeight: 'bold' }}>{'< Back'}</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Activity for: {collection?.name || ''}</Text>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          {/* Month labels */}
          <View style={{ width: 36, marginTop: 24 }}>
            {weeks.map((_, i) => (
              <Text key={i} style={[styles.monthLabel, monthLabels[i] ? {} : { color: 'transparent' }]}>
                {monthLabels[i] || ' '}
              </Text>
            ))}
          </View>
          {/* Chart */}
          <View style={{ flex: 1 }}>
            {weeks.map((week: any, weekIdx: number) => (
              <View key={weekIdx} style={{ flexDirection: 'row', marginBottom: 2 }}>
                {week.days.map((day: { date: string; count: number }, dayIdx: number) => (
                  <View
                    key={dayIdx}
                    style={{
                      width: 22,
                      height: 22,
                      marginRight: 2,
                      borderRadius: 4,
                      backgroundColor: getColor(day.count, thresholds),
                      borderWidth: 1,
                      borderColor: '#eee',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 10, color: '#222', opacity: 0.7 }}>{day.count}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        </View>
      )}
      {/* Legend */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20 }}>
        <Text style={{ marginRight: 8 }}>Legend:</Text>
        <View style={[styles.legendBox, { backgroundColor: '#e0e0e0' }]} />
        <Text style={styles.legendLabel}>0</Text>
        <View style={[styles.legendBox, { backgroundColor: '#b7e5c7' }]} />
        <Text style={styles.legendLabel}>{`<${thresholds[0]}`}</Text>
        <View style={[styles.legendBox, { backgroundColor: '#6fdc8c' }]} />
        <Text style={styles.legendLabel}>{`<${thresholds[1]}`}</Text>
        <View style={[styles.legendBox, { backgroundColor: '#34c759' }]} />
        <Text style={styles.legendLabel}>{`<${thresholds[2]}`}</Text>
        <View style={[styles.legendBox, { backgroundColor: '#198d3c' }]} />
        <Text style={styles.legendLabel}>{`≥${thresholds[2]}`}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  monthLabel: {
    fontSize: 14,
    color: '#888',
    height: 22 * 1.1,
    textAlign: 'right',
    marginBottom: 2,
  },
  legendBox: {
    width: 22,
    height: 22,
    marginHorizontal: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#eee',
  },
  legendLabel: {
    marginRight: 8,
    marginLeft: 2,
    fontSize: 12,
    color: '#888',
  },
});

export default StatsScreen;
