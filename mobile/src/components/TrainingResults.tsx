import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import { Session } from '../data/SessionModel';
import { useThemeColors } from '../context/ThemeContext';
import { i18n } from '../lib/i18n';
import PrimaryButton from './common/PrimaryButton';

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
    <View style={styles.resultsHeaderView}>
      <Text style={[styles.resultsHeaderText, { color: themeColors.text }]}>
        {i18n.t('completeTraining.message')}
      </Text>
      <Text style={[styles.scoreText, { color: themeColors.text }]}>
        {i18n.t('completeTraining.totalViews')} {session.totalViews}
      </Text>
      <Text style={[styles.scoreText, { color: themeColors.text }]}>
        {i18n.t('completeTraining.newCards')} {session.newCards}
      </Text>
      <Text style={[styles.scoreText, { color: themeColors.text }]}>
        {i18n.t('completeTraining.reviewCards')} {session.reviewCards + session.learningCards}
      </Text>
      <Text style={[styles.scoreText, { color: themeColors.text }]}>
        {i18n.t('completeTraining.successful')} {session.successResponses}
      </Text>
      <Text style={[styles.scoreText, { color: themeColors.text }]}>
        {i18n.t('completeTraining.again')} {session.failedResponses}
      </Text>

      <Text style={[styles.scoreText, { color: themeColors.text }]}>
        {i18n.t('completeTraining.score')} {session.score}
      </Text>
      <View style={styles.buttonContainer}>
        <PrimaryButton
          text={i18n.t('completeTraining.newTraining')}
          onClick={() => onResetTraining()}
        />
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  resultsHeaderView: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsHeaderText: {
    fontSize: 22,
    fontWeight: 'bold',
    paddingBottom: 40,
  },
  scoreText: {
    fontSize: 18,
  },
  buttonContainer: {
    marginTop: 40,
  },
});
export default TrainingResults;
