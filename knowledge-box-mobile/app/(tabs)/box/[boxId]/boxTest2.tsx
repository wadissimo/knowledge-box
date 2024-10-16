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
const OFFSET_SIDE_TRIGGER_SHUFFLE = 40;
const BOX_CARD_OFFSET = 10;

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
        console.log("thr reached", movingBack.value);
        if (!movingBack.value) {
          if (onDraggedSide) runOnJS(onDraggedSide as any)();

          draggableX.value = withTiming(0);
          draggableState.zIndex.value = 0;
          draggableState.offsetY.value = withTiming(0);
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
          { transform: [{ translateY: 20 }] },
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
    const [boxItems, setBoxItems] = useState(["Card 1", "Card 2", "Card 3"]);

    const draggablesState = boxItems.map((item, index) => ({
      zIndex: useSharedValue(index + 1),
      offsetY: useSharedValue(index * BOX_CARD_OFFSET),
    }));

    console.log("draggablesState", draggablesState);
    const handleItemDraggedSide = (index: number) => {
      console.log("handleItemDraggedSide", index);
      const len = boxItems.length;
      setBoxItems((prevItems) => [
        prevItems[len - 1],
        ...prevItems.slice(0, len - 1),
      ]);
      draggablesState.forEach((item, idx) => {
        const newIndex = (item.zIndex.value + 1) % len;

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
                onDraggedSide={() => handleItemDraggedSide(index)}
                key={`boxCar_${index}`}
              >
                <View style={styles.colNameView}>
                  <Text style={styles.colNameTxt} numberOfLines={4}>
                    {item}
                  </Text>
                </View>
                <View style={styles.cardCntView}>
                  <Text style={styles.cardsCntTxt}>
                    Cards: {index + 1} {10 * index}
                  </Text>
                </View>
              </DraggableBoxCard>
            ))}
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  }
);

const AnimatedBoxSection = Animated.createAnimatedComponent(BoxSection);

const BoxView = () => {
  const [expanded, setExpanded] = useState<string | null>(null);

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
        headerShown: true,
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()}>
            <Icon name="chevron-left" size={42} color="white" />
          </TouchableOpacity>
        ),
        headerBackVisible: false,
        headerShadowVisible: false,

        headerStyle: {
          backgroundColor: "#1da422",
        },
        headerTitleStyle: {
          color: "white",
          fontSize: 32,
          fontWeight: "bold",
        },
      });
    }
  }, [box]);

  const collectionOffset = useSharedValue(400);
  const notesOffset = useSharedValue(200);
  const chatsOffset = useSharedValue(0);
  const collectionHeight = useSharedValue(300);
  const notesHeight = useSharedValue(300);
  const chatsHeight = useSharedValue(300);

  // Animated styles
  const animatedCollectionStyle = useAnimatedStyle(() => ({
    zIndex: 3, //expanded === "Collections" ? 3 : 1,
    transform: [{ translateY: collectionOffset.value }],
    height: collectionHeight.value,
    // shadowOpacity: expanded === "Collections" ? 0.4 : 0.2,
    // shadowRadius: expanded === "Collections" ? 10 : 5,
  }));

  const animatedNotesStyle = useAnimatedStyle(() => ({
    zIndex: expanded === "Notes" ? 3 : 2,
    transform: [{ translateY: notesOffset.value }],
    height: notesHeight.value,
    // shadowOpacity: expanded === "Notes" ? 0.4 : 0.2,
    // shadowRadius: expanded === "Notes" ? 10 : 5,
  }));

  const animatedChatsStyle = useAnimatedStyle(() => ({
    zIndex: expanded === "Chats" ? 1 : 1,
    transform: [{ translateY: chatsOffset.value }],
    height: chatsHeight.value,
    // shadowOpacity: expanded === "Chats" ? 0.4 : 0.2,
    // shadowRadius: expanded === "Chats" ? 10 : 5,
  }));

  // Function to handle card expansion
  const handleExpand = (section: string) => {
    setExpanded(section);
    switch (section) {
      case "Collections":
        collectionOffset.value = withTiming(
          section === "Collections" ? 400 : -20
        );
    }
    collectionOffset.value = withTiming(section === "Collections" ? 400 : -20);
    notesOffset.value = withTiming(section === "Notes" ? 200 : 10);
    chatsOffset.value = withTiming(section === "Chats" ? 0 : 20);
  };

  const handleExpandCollections = () => {
    collectionOffset.value = withTiming(80);
    notesOffset.value = withTiming(40);
    chatsOffset.value = withTiming(0);
    collectionHeight.value = withTiming(600);
  };

  const handleExpandNotes = () => {
    collectionOffset.value = withTiming(600);
    notesOffset.value = withTiming(40);
    chatsOffset.value = withTiming(0);
    notesHeight.value = withTiming(600);
  };
  const handleExpandChats = () => {
    collectionOffset.value = withTiming(600);
    notesOffset.value = withTiming(560);
    chatsOffset.value = withTiming(0);
    chatsHeight.value = withTiming(600);
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
    <View style={styles.container}>
      <AnimatedBoxSection
        name="Chats"
        style={[styles.boxSection, animatedChatsStyle]}
        onPress={handleExpandChats}
      >
        <MyCardCollectionsCarousel collections={collections} />
        <Button
          title="Add Collection"
          onPress={handleAddCollection}
          color={colors.primary}
        ></Button>
      </AnimatedBoxSection>

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

      {/* <TouchableWithoutFeedback onPress={() => handleExpand("Collections")}>
        <Animated.View
          style={[styles.card, styles.collectionCard, animatedCollectionStyle]}
        >
          <Text style={styles.cardTitle}>Collections</Text>
          {expanded === "Collections" && (
            <Text>Expanded content for Collections...</Text>
          )}
        </Animated.View>
      </TouchableWithoutFeedback> */}
      {/* 
      <TouchableWithoutFeedback onPress={() => handleExpand("Notes")}>
        <Animated.View
          style={[styles.card, styles.notesCard, animatedNotesStyle]}
        >
          <Text style={styles.cardTitle}>Notes</Text>
          {expanded === "Notes" && <Text>Expanded content for Notes...</Text>}
        </Animated.View>
      </TouchableWithoutFeedback> */}

      {/* <TouchableWithoutFeedback onPress={() => handleExpand("Chats")}>
        <Animated.View
          style={[styles.card, styles.chatsCard, animatedChatsStyle]}
        >
          <Text style={styles.cardTitle}>Chats</Text>
          {expanded === "Chats" && <Text>Expanded content for Chats...</Text>}
        </Animated.View>
      </TouchableWithoutFeedback> */}
    </View>
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
  card: {
    position: "absolute",
    width: "90%",
    height: 150,
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 10, height: 10 },
    backgroundColor: "#fff",
    elevation: 10,
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
  },
  boxSection: {
    position: "absolute",
    width: "100%",
    height: 300, // Adjust this based on your needs
  },
  colBox: {
    position: "absolute",
    width: "100%",
    height: 200,
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
});

export default BoxView;
