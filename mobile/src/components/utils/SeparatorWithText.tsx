import { View, Text, StyleSheet } from "react-native";
import React from "react";

const SeparatorWithText: React.FC<{
  text: string;
}> = ({ text }) => {
  return (
    <View style={styles.sepContainer}>
      <View style={styles.sep}></View>
      <View style={styles.textContainer}>
        <Text style={styles.text}>{text}</Text>
      </View>
      <View style={styles.sep}></View>
    </View>
  );
};

const styles = StyleSheet.create({
  sepContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sep: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "grey",
    marginVertical: 1,
    marginHorizontal: 0,
    flex: 1,
  },
  textContainer: {
    marginHorizontal: 20,
  },
  text: {
    fontSize: 16,
    color: "grey",
  },
});

export default SeparatorWithText;
