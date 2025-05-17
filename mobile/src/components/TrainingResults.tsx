import { View, Text, StyleSheet, Button } from 'react-native';
import React from 'react';
import { Session } from '../data/SessionModel';
import { useThemeColors } from '../context/ThemeContext';
import { i18n } from '../lib/i18n';

const TrainingResults = ({
  session,
  onResetTraining,
}: {
  session: Session;
  onResetTraining: Function;
}) => {
  const { themeColors } = useThemeColors();
  //const {} = useCollectionModel();
  return (
    <View style={styles.noMoreCardsTextView}>
      <Text style={styles.noMoreCardsText}>{i18n.t('completeTraining.message')}</Text>
      <Text>
        {i18n.t('completeTraining.totalViews')} {session.totalViews}
      </Text>
      <Text>
        {i18n.t('completeTraining.newCards')} {session.newCards}
      </Text>
      <Text>
        {i18n.t('completeTraining.reviewCards')} {session.reviewCards + session.learningCards}
      </Text>
      <Text>
        {i18n.t('completeTraining.successful')} {session.successResponses}
      </Text>
      <Text>
        {i18n.t('completeTraining.again')} {session.failedResponses}
      </Text>

      <Text style={styles.scoreText}>
        {i18n.t('completeTraining.score')} {session.score}
      </Text>
      <View>
        <Button
          title={i18n.t('completeTraining.newTraining')}
          onPress={() => onResetTraining()}
          color={themeColors.primaryBtnBg}
        />
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  noMoreCardsTextView: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noMoreCardsText: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingBottom: 40,
  },
  scoreText: {
    fontSize: 20,

    paddingBottom: 40,
  },
});
export default TrainingResults;
