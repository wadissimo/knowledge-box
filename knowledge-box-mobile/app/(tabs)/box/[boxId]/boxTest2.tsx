import MyCardCollectionsCarousel from "@/components/MyCardCollectionsCarousel";
import { useBoxCollectionModel } from "@/data/BoxCollectionModel";
import { Box, useBoxModel } from "@/data/BoxModel";
import { Collection } from "@/data/CollectionModel";
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
  Button,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureType,
} from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  SharedValue,
  runOnJS,
} from "react-native-reanimated";
import Icon from "react-native-vector-icons/MaterialIcons";

import { Dimensions } from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Sizes } from "@/constants/Sizes";
import { useHeaderHeight } from "@react-navigation/elements";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const OFFSET_SIDE_TRIGGER_SHUFFLE = 40;
const BOX_CARD_OFFSET = 10;
const BOX_SECTION_HEADER_SIZE = 40;

const DraggableBoxCard = ({
  offsetY,
  onDraggedSide,
  children,

  draggableState,
}: {
  offsetY: number;
  children?: ReactNode;
  onDraggedSide?: Function;
  draggableState: any;
}) => {
  const draggableX = useSharedValue(0);

  const movingBack = useSharedValue(false);

  const draggableAnimatedStyle = useAnimatedStyle(() => ({
    zIndex: draggableState.zIndex.value,
    transform: [
      { translateX: draggableX.value },
      { translateY: draggableState.offsetY.value },
    ],
  }));

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      if (Math.abs(e.translationX) > OFFSET_SIDE_TRIGGER_SHUFFLE) {
        //console.log("thr reached", movingBack.value);
        if (!movingBack.value) {
          if (onDraggedSide) runOnJS(onDraggedSide as any)();

          draggableX.value = withTiming(0);
          // draggableState.zIndex.value = 0;
          // draggableState.offsetY.value = withTiming(0);
          movingBack.value = true;
        }
      } else {
        movingBack.value = false;
        draggableX.value = e.translationX;
        draggableState.offsetY.value = e.translationY + offsetY;
      }
    })
    .onEnd(() => {
      if (!movingBack.value) {
        draggableX.value = withTiming(0);
        draggableState.offsetY.value = withTiming(offsetY);
      }
    });

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[
          styles.colBox,
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

const BoxSection = forwardRef(
  (
    {
      name,
      children,
      style,
      onPress,
    }: {
      name: string;
      children?: ReactNode;
      style?: ViewStyle;
      onPress: Function;
    },
    ref: any
  ) => {
    const { colors } = useTheme();
    const [boxItems, setBoxItems] = useState([
      "Card 1",
      "Card 2",
      "Card 3",
      "Card 4",
      "Card 5",
    ]);

    const draggablesState = boxItems.map((item, index) => ({
      zIndex: useSharedValue(index + 1),
      offsetY: useSharedValue(index * BOX_CARD_OFFSET),
    }));

    const handleItemDraggedToSide = (index: number) => {
      console.log("handleItemDraggedSide", index);
      const len = boxItems.length;
      // setBoxItems((prevItems) => [
      //   prevItems[len - 1],
      //   ...prevItems.slice(0, len - 1),
      // ]);
      draggablesState.forEach((item, idx) => {
        const newIndex = item.zIndex.value % len;
        console.log(
          "updating ",
          idx,
          "zIndex",
          newIndex + 1,
          "offset",
          newIndex * BOX_CARD_OFFSET
        );
        item.zIndex.value = withTiming(newIndex + 1);
        item.offsetY.value = withTiming(newIndex * BOX_CARD_OFFSET);
      });
    };

    return (
      <TouchableWithoutFeedback onPress={() => onPress()}>
        <View ref={ref} style={[styles.sectionContainer, style]}>
          <View style={[styles.sectionHeader]}>
            <Text style={[styles.sectionHeaderText]}>{name}</Text>
          </View>
          <View style={[styles.sectionListContainer]}>
            {boxItems.map((item, index) => (
              <DraggableBoxCard
                offsetY={10 * index}
                draggableState={draggablesState[index]}
                onDraggedSide={() => handleItemDraggedToSide(index)}
                key={`boxCar_${index}`}
              >
                <View style={styles.cardCntView}>
                  <Text style={styles.cardsCntTxt}>
                    Cards: {index + 1} {10 * index}
                  </Text>
                </View>
                <View style={styles.colNameView}>
                  <Text style={styles.colNameTxt} numberOfLines={4}>
                    {item}
                  </Text>
                </View>
              </DraggableBoxCard>
            ))}
          </View>
          <View style={[styles.addBoxBtn, { backgroundColor: colors.primary }]}>
            <Icon name="add" size={48} color="white" />
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  }
);

const AnimatedBoxSection = Animated.createAnimatedComponent(BoxSection);

const BoxView = () => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const router = useRouter();
  const navigation = useNavigation();

  const { boxId } = useLocalSearchParams();
  const { getBoxById } = useBoxModel();
  const { fetchCollectionsByBoxId } = useBoxCollectionModel();
  const [collections, setCollections] = useState<Collection[]>([]);

  const [box, setBox] = useState<Box | null>(null);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      getBoxById(Number(boxId)).then((res) => setBox(res));
      fetchCollectionsByBoxId(Number(boxId)).then((res) => setCollections(res));
    }
  }, [isFocused]);
  // Shared values for animation
  useEffect(() => {
    if (box !== null) {
      navigation.setOptions({
        title: box.name,
      });
    }
  }, [box]);

  //console.log("screenHeight", screenHeight);
  const headerHeight = useHeaderHeight();

  const availableHeight =
    Dimensions.get("window").height - headerHeight - Sizes.tabBarHeight;
  const availableWidth =
    Dimensions.get("window").width - insets.left - insets.right;

  console.log(insets.top, insets.bottom, headerHeight, availableHeight);
  const sectionSize = availableHeight / 3;
  const collectionOffset = useSharedValue(sectionSize * 2);
  const notesOffset = useSharedValue(sectionSize);
  const chatsOffset = useSharedValue(0);
  const collectionHeight = useSharedValue(sectionSize + 5);
  const notesHeight = useSharedValue(sectionSize + 5);
  const chatsHeight = useSharedValue(sectionSize + 5);

  // Animated styles
  const animatedCollectionStyle = useAnimatedStyle(() => ({
    zIndex: 3,
    transform: [{ translateY: collectionOffset.value }],
    height: collectionHeight.value,
  }));

  const animatedNotesStyle = useAnimatedStyle(() => ({
    zIndex: expanded === "Notes" ? 3 : 2,
    transform: [{ translateY: notesOffset.value }],
    height: notesHeight.value,
  }));

  const animatedChatsStyle = useAnimatedStyle(() => ({
    zIndex: 1,
    transform: [{ translateY: chatsOffset.value }],
    height: chatsHeight.value,
  }));

  const handleExpandCollections = () => {
    collectionOffset.value = withTiming(BOX_SECTION_HEADER_SIZE * 2);
    notesOffset.value = withTiming(BOX_SECTION_HEADER_SIZE);
    chatsOffset.value = withTiming(0);
    collectionHeight.value = withTiming(
      availableHeight - 2 * BOX_SECTION_HEADER_SIZE
    );
  };

  const handleExpandNotes = () => {
    collectionOffset.value = withTiming(
      availableHeight - BOX_SECTION_HEADER_SIZE
    );
    notesOffset.value = withTiming(BOX_SECTION_HEADER_SIZE);
    chatsOffset.value = withTiming(0);
    notesHeight.value = withTiming(
      availableHeight - 2 * BOX_SECTION_HEADER_SIZE
    );
  };
  const handleExpandChats = () => {
    collectionOffset.value = withTiming(
      availableHeight - BOX_SECTION_HEADER_SIZE
    );
    notesOffset.value = withTiming(
      availableHeight - 2 * BOX_SECTION_HEADER_SIZE
    );
    chatsOffset.value = withTiming(0);
    chatsHeight.value = withTiming(
      availableHeight - 2 * BOX_SECTION_HEADER_SIZE
    );
  };

  function handleAddCollection() {
    router.push(`/(tabs)/box/${boxId}/collections/addCollection`);
  }
  function handleAddNotePress() {
    router.push(`/(tabs)/box/${boxId}/notes/newNote`);
  }
  function handleAddChatPress() {
    router.push(`/(tabs)/box/${boxId}/chats/newChat`);
  }

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <AnimatedBoxSection
          name="Chats"
          style={[styles.boxSection, animatedChatsStyle]}
          onPress={handleExpandChats}
        />

        <AnimatedBoxSection
          name="Notes"
          style={[styles.boxSection, animatedNotesStyle]}
          onPress={handleExpandNotes}
        >
          <Text>Content</Text>
        </AnimatedBoxSection>

        <AnimatedBoxSection
          name="Collections"
          style={[styles.boxSection, animatedCollectionStyle]}
          onPress={handleExpandCollections}
        >
          <Text>Content</Text>
        </AnimatedBoxSection>
      </View>
    </SafeAreaProvider>
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
  colBox: {
    position: "absolute",
    width: "100%",
    height: 150,
    backgroundColor: "#faf8b4",
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 15,
    //margin: 5,
    justifyContent: "center",
  },
  colNameView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
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
    zIndex: 10,
    //position: "absolute",
    //bottom: 40,
    marginHorizontal: 10,
    marginVertical: 2,
    //right: 10,
    alignSelf: "flex-end", // Center horizontally
  },
});

export default BoxView;
