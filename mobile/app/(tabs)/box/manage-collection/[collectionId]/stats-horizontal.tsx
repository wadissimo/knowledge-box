import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useReviewLogModel } from '@/src/data/ReviewLogModel';
import { useCollectionModel } from '@/src/data/CollectionModel';
import { useCardModel } from '@/src/data/CardModel';
import { useThemeColors } from '@/src/context/ThemeContext';

const getColor = (count: number, thresholds: number[]) => {
  if (count === 0) return '#e0e0e0';
  if (count < thresholds[0]) return '#b7e5c7';
  if (count < thresholds[1]) return '#6fdc8c';
  if (count < thresholds[2]) return '#34c759';
  return '#198d3c';
};

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const StatsHorizontalScreen = () => {
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
    ])
      .then(([weeks, collection, trainingData, cardsCount]) => {
        setWeeks(weeks);
        setCollection(collection);
        setTrainingData(trainingData);
        setCardsCount(cardsCount);
        const planned = trainingData?.maxReviewCards || 10;
        setThresholds([
          Math.max(1, Math.round(planned * 0.3)),
          Math.max(2, Math.round(planned * 0.7)),
          Math.max(3, planned),
        ]);
      })
      .finally(() => setLoading(false));
  }, [collectionId]);

  // Build day labels (Mon-Sun)
  const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Reverse weeks so the most recent week is rightmost
  const displayWeeks = weeks; // [...weeks].reverse();

  // Build month labels for displayWeeks columns (show only when first week of the month)
  const monthLabels: { [weekIdx: number]: string } = {};
  let lastMonth = '';
  displayWeeks.forEach((week, i) => {
    const month = MONTH_NAMES[new Date(week.weekStart).getMonth()];
    if (month !== lastMonth) {
      monthLabels[i] = month;
      lastMonth = month;
    }
  });

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: themeColors.cardBg }}
      contentContainerStyle={{ padding: 16 }}
      horizontal
    >
      <View>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 12 }}>
          <Text style={{ color: themeColors.activeTintColor, fontWeight: 'bold' }}>{'< Back'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Activity (Horizontal) for: {collection?.name || ''}</Text>
        {loading ? (
          <Text>Loading...</Text>
        ) : (
          <View>
            {/* Month labels */}
            <View style={{ flexDirection: 'row', marginLeft: 38, marginBottom: 4 }}>
              {displayWeeks.map((week: any, weekIdx: number) => (
                <Text
                  key={weekIdx}
                  style={[styles.monthLabel, monthLabels[weekIdx] ? {} : { color: 'transparent' }]}
                >
                  {monthLabels[weekIdx] || ' '}
                </Text>
              ))}
            </View>
            <View style={{ flexDirection: 'row' }}>
              {/* Day labels */}
              <View style={{ flexDirection: 'column', marginRight: 4 }}>
                {DAY_LABELS.map((label, dayIdx) => (
                  <Text key={dayIdx} style={styles.dayLabel}>
                    {label}
                  </Text>
                ))}
              </View>
              {/* Chart: columns=weeks, rows=days (Mon–Sun) */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'column' }}>
                  {DAY_LABELS.map((label, dayIdx) => (
                    <View key={dayIdx} style={{ flexDirection: 'row' }}>
                      {displayWeeks.map((week: any, weekIdx: number) => {
                        // Find the day in week.days that matches this weekday (0=Mon, ... 6=Sun)
                        const dayForThisWeekday = week.days.find((d: any) => {
                          const dateObj = new Date(d.date);
                          // JS: getDay() 0=Sun, 1=Mon, ..., 6=Sat
                          // Our mapping: 0=Mon, ..., 6=Sun
                          const weekdayIdx = dateObj.getDay() === 0 ? 6 : dateObj.getDay() - 1;
                          return weekdayIdx === dayIdx;
                        });
                        const count = dayForThisWeekday ? dayForThisWeekday.count : 0;
                        return (
                          <View
                            key={weekIdx}
                            style={{
                              width: 18,
                              height: 18,
                              marginBottom: 2,
                              marginRight: 2,
                              borderRadius: 6,
                              backgroundColor: getColor(count, thresholds),
                              borderWidth: 1,
                              borderColor: '#eee',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Text style={{ fontSize: 10, color: '#222', opacity: 0.7 }}>
                              {/* {count} */}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  ))}
                </View>
              </ScrollView>
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
    height: 32 * 1.1,
    textAlign: 'center',
    marginRight: 2,
  },
  dayLabel: {
    fontSize: 12,
    color: '#888',
    height: 18,
    textAlign: 'right',
    marginBottom: 2,
    fontWeight: 'bold',
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

export default StatsHorizontalScreen;
