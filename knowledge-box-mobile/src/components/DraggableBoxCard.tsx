import MyCardCollectionsCarousel from "@/src/components/MyCardCollectionsCarousel";
import { useBoxCollectionModel } from "@/src/data/BoxCollectionModel";
import { Box, useBoxModel } from "@/src/data/BoxModel";
import { Collection } from "@/src/data/CollectionModel";
import { useIsFocused, useTheme } from "@react-navigation/native";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { forwardRef, ReactNode, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  ViewStyle,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  SharedValue,
  runOnJS,
  useDerivedValue,
} from "react-native-reanimated";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import { Dimensions } from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Sizes } from "@/src/constants/Sizes";
import { useHeaderHeight } from "@react-navigation/elements";
import { i18n, t } from "@/src/lib/i18n";

const OFFSET_SIDE_TRIGGER_REORDER = 40;
const BOX_CARD_OFFSET = 10;
const BOX_SECTION_HEADER_SIZE = 40;

const DraggableBoxCard = ({
  name,
  index,
  numReorders,
  numItems,

  onReorder,
  children,
}: {
  name: string;
  index: number;
  numReorders: SharedValue<number>;
  numItems: number;

  children?: ReactNode;
  onReorder?: Function;
}) => {
  const draggableX = useSharedValue(0);

  const initialOffsetY =
    ((index + numReorders.value) % numItems) * BOX_CARD_OFFSET;
  const draggableY = useSharedValue(initialOffsetY);

  const isDragged = useSharedValue(false);
  const movingBack = useSharedValue(false);
  const posY = useDerivedValue(() => {
    return isDragged.value
      ? draggableY.value
      : ((index + numReorders.value) % numItems) * BOX_CARD_OFFSET;
  });

  const draggableAnimatedStyle = useAnimatedStyle(() => ({
    zIndex: (index + numReorders.value) % numItems,
    transform: [{ translateX: draggableX.value }, { translateY: posY.value }],
  }));

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      if (Math.abs(e.translationX) > OFFSET_SIDE_TRIGGER_REORDER) {
        if (!movingBack.value) {
          isDragged.value = false;

          if (onReorder) runOnJS(onReorder as any)();

          draggableX.value = withTiming(0);

          movingBack.value = true;
        }
      } else {
        isDragged.value = true;
        movingBack.value = false;
        draggableX.value = e.translationX;
        draggableY.value = e.translationY + initialOffsetY;
      }
    })
    .onEnd(() => {
      isDragged.value = false;
      if (!movingBack.value) {
        draggableX.value = withTiming(0);
        draggableY.value = withTiming(initialOffsetY);
      }
    });

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[
          styles.itemBox,
          styles.shadowProp,
          { transform: [{ translateY: 20 }], height: 150 },
          styles.elevation,
          draggableAnimatedStyle,
        ]}
      >
        {children}
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },

  collectionCard: {
    backgroundColor: "#f9c2ff",
  },
  notesCard: {
    backgroundColor: "#c2e1ff",
  },
  chatsCard: {
    backgroundColor: "#c2ffc2",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  sectionContainer: {
    borderColor: "#ddd",
    borderWidth: 1,
    borderBottomWidth: 0,
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    marginHorizontal: 10,
    backgroundColor: "#fff",
    elevation: 25,
  },
  sectionHeader: {
    paddingHorizontal: 5,
    paddingVertical: 7,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#c2fbc4",
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    backgroundColor: "#c2fbc4",
    height: BOX_SECTION_HEADER_SIZE,
    // elevation: 2,
  },
  sectionHeaderText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "black",

    flex: 1,
  },
  sectionFooter: {
    height: 10,
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    backgroundColor: "#cad1ca",
  },
  sectionIcons: { flexDirection: "row", gap: 32 },
  sectionListContainer: {
    paddingVertical: 5,
    paddingHorizontal: 7,
    alignItems: "center",
    // backgroundColor: "orange",
    flex: 0.95,
  },
  boxSection: {
    position: "absolute",
    width: "100%",
    //height: 500,
  },
  itemListBox: {
    //position: "absolute",
    //width: "100%",
    height: 60,
    backgroundColor: "#faf8b4",
    borderRadius: 5,

    //borderColor: "lightgrey",
    borderWidth: 1,
    borderColor: "#dd8",
    //paddingVertical: 5,
    //paddingHorizontal: 15,
    marginHorizontal: 5,
    marginVertical: 2,
    justifyContent: "center",
  },
  itemBox: {
    position: "absolute",
    width: "100%",
    height: 150,
    backgroundColor: "#faf8b4",
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#dd8",
    //margin: 5,
    justifyContent: "center",
  },
  colNameView: {
    flex: 0.6,
    justifyContent: "center",
    alignItems: "center",
    //alignSelf: "center",
    //backgroundColor: "orangered",
  },
  colNameTxt: {
    fontSize: 16,
  },
  cardCntView: {
    padding: 7,
    alignSelf: "flex-end",
  },
  cardsCntTxt: {
    fontSize: 12,
  },
  shadowProp: {
    shadowColor: "#171717",
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  elevation: {
    elevation: 5,
    shadowColor: "#52006A",
  },
  addBoxBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
    position: "absolute",
    bottom: 10,
    marginHorizontal: 10,
    marginVertical: 2,
    //right: 10,
    alignSelf: "flex-end", // Center horizontally
  },
  defaultText: {
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default DraggableBoxCard;
