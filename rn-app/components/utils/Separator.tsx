import { View, Text, StyleSheet } from "react-native";
import React from "react";

const Separator = () => {
  return (
    <View
      style={{
        height: StyleSheet.hairlineWidth,
        backgroundColor: "grey",
        marginVertical: 1,
        marginHorizontal: 0,
      }}
    ></View>
  );
};

export default Separator;
