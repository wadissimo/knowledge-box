import React, { useEffect, useState } from "react";
import { Link, useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Box, useBoxModel } from "@/src/data/BoxModel";
import { useIsFocused, useTheme } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

export default function BoxesPage() {
  const { colors } = useTheme();
  const router = useRouter();
  const { fetchBoxes } = useBoxModel();
  const isFocused = useIsFocused();
  const [boxes, setBoxes] = useState<Box[]>([]);

  useEffect(() => {
    if (isFocused) {
      fetchBoxes().then((res) => {
        setBoxes(res);
      });
    }
  }, [isFocused]);

  const handleAddPress = () => {
    router.push("./newBox");
  };
  const handleBoxPress = (boxId: number) => {
    router.push(`/(tabs)/box/${boxId}/boxView`);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={["#2196f3", "#7dc5f5"]}
        style={{ flex: 1 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={{ flex: 1 }}>
          <ScrollView style={{ flex: 1 }}>
            {boxes.length === 0 && (
              <Text>No boxes yet. Tap + to add one!</Text>
            )}
            {boxes.map((box) => (
              <TouchableOpacity
                onPress={() => handleBoxPress(box.id)}
                key={`box_${box.id}`}
                activeOpacity={0.85}
                style={{
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
                  shadowOpacity: 0.10,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <Text style={{ fontSize: 18, color: '#263238', fontWeight: '600', flex: 1 }}>{box.name}</Text>
                <Ionicons name="chevron-forward" size={26} color="#1976d2" />
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 12, backgroundColor: 'transparent', position: 'relative' }}>
            <View style={{ position: 'absolute', bottom: 72, left: 0, right: 0, alignItems: 'center' }}>
              <TouchableOpacity onPress={handleAddPress} activeOpacity={0.85}>
                <View style={{ width: 64, height: 64, borderRadius: 32, justifyContent: "center", alignItems: "center", backgroundColor: "#1976d2", shadowColor: "#0288d1", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.16, shadowRadius: 8, elevation: 8 }}>
                  <Ionicons name="add" color="white" size={36} />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bottomPanel: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  addBoxBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1976d2",
  },
});
