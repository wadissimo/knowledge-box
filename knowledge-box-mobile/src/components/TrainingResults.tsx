import { View, Text, StyleSheet, Button } from "react-native";
import React from "react";
import { Session } from "../data/SessionModel";
import { useAppTheme } from "../hooks/useAppTheme";

const TrainingResults = ({
  session,
  onResetTraining,
}: {
  session: Session;
  onResetTraining: Function;
}) => {
  const { colors } = useAppTheme();
  return (
    <View style={styles.noMoreCardsTextView}>
      <Text style={styles.noMoreCardsText}>Well done. Training complete!</Text>
      <Text>Total Card Views: {session.totalViews}</Text>
      <Text>New Cards: {session.newCards}</Text>
      <Text>Review Cards: {session.reviewCards + session.learningCards}</Text>
      <Text>Successful Responses: {session.successResponses}</Text>
      <Text>Failed Responses: {session.failedResponses}</Text>

      <Text style={styles.scoreText}>Your score: {session.score}</Text>
      <View>
        <Button
          title="New Training"
          onPress={() => onResetTraining()}
          color={colors.primary}
        />
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  noMoreCardsTextView: {
    flex: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  noMoreCardsText: {
    fontSize: 20,
    fontWeight: "bold",
    paddingBottom: 40,
  },
  scoreText: {
    fontSize: 20,

    paddingBottom: 40,
  },
});
export default TrainingResults;
