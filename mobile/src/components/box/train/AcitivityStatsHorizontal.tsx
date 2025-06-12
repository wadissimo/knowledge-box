import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useReviewLogModel } from '@/src/data/ReviewLogModel';
import { Collection, CollectionTrainingData, useCollectionModel } from '@/src/data/CollectionModel';
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

const AcitivityStatsHorizontal = () => {
  const { collectionId } = useLocalSearchParams();
  const { getCollectionReviewStats } = useReviewLogModel();
  const { getCollectionById, getCollectionTrainingData } = useCollectionModel();
  const { getCardsCount } = useCardModel();
  const { themeColors } = useThemeColors();
  const router = useRouter();

  const [weeks, setWeeks] = useState<any[]>([]);
  const [thresholds, setThresholds] = useState<number[]>([1, 5, 10]);
  const [loading, setLoading] = useState(true);
  const [collection, setCollection] = useState<Collection | null>(null);
  const [trainingData, setTrainingData] = useState<CollectionTrainingData | null>(null);
  const [cardsCount, setCardsCount] = useState<number>(0);

  useEffect(() => {
    if (collectionId === null) return;
    const colId = Number(collectionId);
    console.log('AcitivityStatsHorizontal useEffect', colId);
    setLoading(true);
    Promise.all([
      getCollectionReviewStats(colId),
      getCollectionById(colId),
      getCollectionTrainingData(colId),
      getCardsCount(colId),
    ])
      .then(([weeks, collection, trainingData, cardsCount]) => {
        console.log('AcitivityStatsHorizontal useEffect then ', collection);
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
        console.log('AcitivityStatsHorizontal useEffect then END');
      })
      .catch(e => {
        console.error('AcitivityStatsHorizontal Error', e);
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
  console.log('AcitivityStatsHorizontal render');

  const todayDayOfWeek = new Date().getDay();
  console.log('todayDayOfWeek', todayDayOfWeek);
  if (loading) return <ActivityIndicator />;
  return (
    <View>
      <View>
        <View style={{ flexDirection: 'row' }}>
          {/* Day labels */}
          <View style={{ flexDirection: 'column', marginRight: 4 }}>
            <Text key={'month'} style={styles.dayLabel}>
              {' '}
            </Text>
            {DAY_LABELS.map((label, dayIdx) => (
              <Text key={dayIdx} style={[styles.dayLabel, { color: themeColors.cardText }]}>
                {label}
              </Text>
            ))}
          </View>
          {/* Chart: columns=weeks, rows=days (Mon–Sun) */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {/* Month labels */}
            <View style={{ flexDirection: 'column' }}>
              <View
                style={{
                  flexDirection: 'row',
                  marginLeft: 38,
                  flex: 1,
                  justifyContent: 'space-evenly',
                }}
              >
                {displayWeeks.map((week: any, weekIdx: number) => (
                  <Text
                    key={weekIdx}
                    style={[
                      styles.monthLabel,
                      monthLabels[weekIdx] ? {} : { color: 'transparent' },
                      { color: themeColors.cardText },
                    ]}
                  >
                    {monthLabels[weekIdx] || ' '}
                  </Text>
                ))}
              </View>
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
                    return weekIdx === 0 && dayIdx > todayDayOfWeek - 1 ? (
                      // transparent cells for future days
                      <View
                        key={weekIdx}
                        style={{
                          width: 18,
                          height: 18,
                          marginBottom: 2,
                          marginRight: 2,
                          backgroundColor: '#0000',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text style={{ fontSize: 10, color: '#222', opacity: 0.7 }}> </Text>
                      </View>
                    ) : (
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

      {/* Legend */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20 }}>
        <Text style={[styles.legendLabel, { marginRight: 8, color: themeColors.cardText }]}>
          Less
        </Text>
        <View style={[styles.legendBox, { backgroundColor: '#e0e0e0' }]} />

        <View style={[styles.legendBox, { backgroundColor: '#b7e5c7' }]} />

        <View style={[styles.legendBox, { backgroundColor: '#6fdc8c' }]} />

        <View style={[styles.legendBox, { backgroundColor: '#34c759' }]} />

        <View style={[styles.legendBox, { backgroundColor: '#198d3c' }]} />

        <Text style={[styles.legendLabel, { marginLeft: 8, color: themeColors.cardText }]}>
          More
        </Text>
      </View>
    </View>
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
    height: 20,
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

export default AcitivityStatsHorizontal;
