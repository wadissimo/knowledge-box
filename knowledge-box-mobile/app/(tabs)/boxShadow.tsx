import { View, Text } from "react-native";
import React from "react";

import { Shadow } from "react-native-shadow-2";

const BoxShadow = () => {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Shadow distance={5} offset={[0, -5]}>
        <View style={{ backgroundColor: "#fff" }}>
          <Text style={{ margin: 20, fontSize: 20 }}>🙂</Text>
        </View>
      </Shadow>
    </View>
  );
};

export default BoxShadow;
