import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { Link } from "expo-router";
import AIConfig from "./AIConfig";

const SettingsTab = () => {
  return (
    <View style={{ flex: 1 }}>
      <Text>SettingsTab</Text>
      <View style={styles.settings}>
        <Link href="./settings/database">Database</Link>
        <View style={{ height: 24 }} />
        <AIConfig />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  settings: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    //backgroundColor: "orange",
  },
});

export default SettingsTab;
