import { View, Text, Button, StyleSheet } from "react-native";
import React from "react";
import auth from "@react-native-firebase/auth";
import { useTheme } from "@react-navigation/native";
const UserPage = () => {
  const { colors } = useTheme();
  const user = auth().currentUser;
  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Text>Welcome, {user?.email}</Text>
        <Button
          title="Sign out"
          onPress={() => auth().signOut()}
          color={colors.primary}
        />
      </View>
      <View style={styles.mainContainer}>
        <View style={styles.statsContainer}>
          <View>
            <Text>Stats</Text>
          </View>
          <View>
            <Text>Total cards: XXX</Text>
          </View>
          <View>
            <Text>Studying: XXX</Text>
          </View>
          <View>
            <Text>Total XP: XXX</Text>
          </View>
          <View>
            <Text>Time Spent: X days XX hrs XX mins</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 5,
  },
  mainContainer: {
    flex: 1,
  },
  headerText: {
    fontSize: 16,
  },
  statsContainer: {
    padding: 20,
  },
});
export default UserPage;
