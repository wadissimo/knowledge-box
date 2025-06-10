import { View, Text, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Button } from 'react-native';
import { useIsFocused, useTheme } from '@react-navigation/native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';
import { Collection, CollectionTrainingData, useCollectionModel } from '@/src/data/CollectionModel';
import { i18n } from '@/src/lib/i18n';
import { CardStatus, useCardModel } from '@/src/data/CardModel';
import { useThemeColors } from '@/src/context/ThemeContext';
import PrimaryButton from '@/src/components/common/PrimaryButton';
import ScreenContainer from '@/src/components/common/ScreenContainer';
import { Session, SessionStatus, useSessionModel } from '@/src/data/SessionModel';
import { ScrollView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

const CollectionView = () => {
  const { themeColors } = useThemeColors();
  const { collectionId } = useLocalSearchParams();
  const { getCollectionById, getCollectionTrainingData } = useCollectionModel();
  const { getCardCountByStatus } = useCardModel();
  const { getSessionsByCollectionId } = useSessionModel();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [trainingData, setTrainingData] = useState<CollectionTrainingData | null>(null);
  const [newCardCount, setNewCardCount] = useState<number>(0);
  const [reviewCardCount, setReviewCardCount] = useState<number>(0);
  const [learningCardCount, setLearningCardCount] = useState<number>(0);
  const [sessions, setSessions] = useState<Session[] | null>(null);

  const router = useRouter();
  const isFocused = useIsFocused();

  useEffect(() => {
    if (collectionId && isFocused) {
      const colId = Number(collectionId);
      // console.log('manage-collection\main: collectionId', colId);
      Promise.all([
        getCollectionById(colId),
        getCollectionTrainingData(colId),
        getCardCountByStatus(colId, CardStatus.New),
        getCardCountByStatus(colId, CardStatus.Review),
        getCardCountByStatus(colId, CardStatus.Learning),
        getSessionsByCollectionId(colId),
      ])
        .then(([col, data, newCount, reviewCount, learningCount, sessions]) => {
          setCollection(col);
          setTrainingData(data);
          setNewCardCount(newCount);
          setReviewCardCount(reviewCount);
          setLearningCardCount(learningCount);
          setSessions(sessions);
        })
        .catch(error => {
          console.error('Error fetching collection data:', error);
        });
      //getCollectionById(Number(collectionId)).then((col) => setCollection(col));
    }
  }, [collectionId, isFocused]);

  function handleStatsPress() {
    router.push(`/(tabs)/box/manage-collection/${collectionId}/stats-horizontal`);
  }

  function handleManageCollectionPress() {
    router.push(`/(tabs)/box/manage-collection/${collectionId}/manage`);
  }
  function handleTrainPress() {
    router.push(`/(tabs)/box/manage-collection/${collectionId}/train`);
  }
  function handleTrainOptions() {
    router.push(`/(tabs)/box/manage-collection/${collectionId}/trainOptions`);
  }
  // console.log('CollectionView', collectionId);

  if (collection === null) return null;
  return (
    <View style={styles.container}>
      <View style={[styles.colNameContainer, { backgroundColor: themeColors.subHeaderBg }]}>
        <Text style={[styles.colNameTxt, { color: themeColors.subHeaderText }]}>
          {collection.name}
        </Text>
      </View>
      <TouchableOpacity
        onPress={handleStatsPress}
        style={{ marginVertical: 12, alignSelf: 'flex-start' }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons
            name="stats-chart"
            size={20}
            color={themeColors.activeTintColor}
            style={{ marginRight: 6 }}
          />
          <Text style={{ color: themeColors.activeTintColor, fontWeight: 'bold', fontSize: 16 }}>
            View Activity Stats
          </Text>
        </View>
      </TouchableOpacity>
      <ScreenContainer>
        <View style={styles.statsContainer}>
          <View style={[styles.stats, { backgroundColor: themeColors.cardBg }]}>
            <Text style={styles.statsHeaderTxt}>{i18n.t('collection.train.stats')}</Text>

            <Text style={styles.statsTxt}>
              {i18n.t('collection.train.cardViews')} {trainingData?.totalCardViews ?? 0}
            </Text>

            <Text style={styles.statsTxt}>
              {i18n.t('collection.stats.newCards')} {newCardCount}
            </Text>
            <Text style={styles.statsTxt}>
              {i18n.t('collection.stats.reviewCards')} {reviewCardCount + learningCardCount}
            </Text>

            <Text style={styles.statsTxt}>
              {i18n.t('collection.train.score')} {trainingData?.totalScore ?? 0}
            </Text>
            <Text style={styles.statsTxt}>
              {i18n.t('collection.train.streak')} {trainingData?.streak ?? 0}
            </Text>
          </View>
          <View style={styles.trainOptBtnContainer}>
            <PrimaryButton text={i18n.t('collection.train.options')} onClick={handleTrainOptions} />
          </View>
          <View style={styles.trainBtnContainer}>
            <PrimaryButton text={i18n.t('collection.train.trainBtn')} onClick={handleTrainPress} />
          </View>
        </View>

        <View style={styles.sessionsContainer}>
          <View>
            <Text style={[styles.sessionsHeader, { color: themeColors.text }]}>
              {i18n.t('collection.train.sessionsHeader')}
            </Text>
          </View>
          <ScrollView>
            {sessions?.map(session => (
              <SessionCard key={`session${session.id}`} session={session} />
            ))}
          </ScrollView>
        </View>

        {/* <View style={styles.mngBtnContainer}>
        <Button
          title={i18n.t("cards.manageCollection")}
          color={colors.primary}
          onPress={handleManageCollectionPress}
        />
      </View> */}
      </ScreenContainer>
    </View>
  );
};

const SessionCard = ({ session }: { session: Session }) => {
  const { themeColors } = useThemeColors();
  const [expanded, setExpanded] = useState(false);

  return (
    <View
      style={[
        styles.sessionCard,
        {
          backgroundColor: themeColors.cardBg,
        },
      ]}
    >
      <TouchableOpacity onPress={() => setExpanded(!expanded)} style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text style={[styles.sessionCardText, { color: themeColors.cardText }]}>
            Date: {session.trainingDate}
          </Text>
          <Text style={[styles.sessionCardText, { color: themeColors.cardText }]}>
            Score: {session.score}
          </Text>
          {session.status === SessionStatus.Started && (
            <Ionicons name="timer-outline" size={24} color={themeColors.cardText} />
          )}
        </View>
        {expanded && (
          <View>
            <Text style={[styles.sessionCardText, { color: themeColors.cardText }]}>
              New Cards: {session.newCards}
            </Text>
            <Text style={[styles.sessionCardText, { color: themeColors.cardText }]}>
              Review Cards: {session.reviewCards}
            </Text>
            <Text style={[styles.sessionCardText, { color: themeColors.cardText }]}>
              Learning Cards: {session.learningCards}
            </Text>
            <Text style={[styles.sessionCardText, { color: themeColors.cardText }]}>
              Total Views: {session.totalViews}
            </Text>
            <Text style={[styles.sessionCardText, { color: themeColors.cardText }]}>
              Success Responses: {session.successResponses}
            </Text>
            <Text style={[styles.sessionCardText, { color: themeColors.cardText }]}>
              Failed Responses: {session.failedResponses}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  colNameContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  colNameTxt: {
    fontWeight: 'bold',
    fontSize: 24,
  },
  trainOptBtnContainer: {
    justifyContent: 'center',
    margin: 5,
    height: 40,
  },
  trainBtnContainer: {
    justifyContent: 'center',
    margin: 5,
    height: 40,
  },
  mngBtnContainer: {
    margin: 5,
  },
  sessionsHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statsContainer: {
    flex: 0.6,
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 20,
    // backgroundColor: "orange",
  },
  sessionsContainer: {
    flex: 0.4,
    justifyContent: 'center',
    paddingHorizontal: 10,

    // backgroundColor: 'orange',
  },
  stats: {
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
  },
  statsHeaderTxt: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statsTxt: {
    fontSize: 18,
    margin: 5,
  },

  sessionCard: {
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
  sessionCardText: {
    fontSize: 18,
    margin: 5,
  },
});

export default CollectionView;
