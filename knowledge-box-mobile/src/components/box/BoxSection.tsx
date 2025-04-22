import { useTheme } from "@react-navigation/native";
import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  ViewStyle,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";


import { Dimensions } from "react-native";
import { Sizes } from "@/src/constants/Sizes";
import DraggableBoxCard from "./DraggableBoxCard";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const OFFSET_SIDE_TRIGGER_REORDER = 40;
const BOX_CARD_OFFSET = 10;
const BOX_SECTION_HEADER_SIZE = 40;

const BoxSection = ({
  name,
  index,
  numSections,
  expandedSection,
  style,
  onExpand,
  onAddNew,
  items,
  renderItem,
  renderListItem,
  defaultText,
  calcSectionHeight,
  calcSectionOffset,
}: {
  name: string;
  index: number;
  numSections: number;
  expandedSection: number | null;
  style?: ViewStyle;
  onExpand: Function;
  onAddNew?: Function;
  items: any[];
  renderItem: Function;
  renderListItem: Function;
  defaultText?: String;
  
  calcSectionOffset: (index: number) => number;
  calcSectionHeight: (index: number) => number;
}) => {
  const availableHeight =
    Dimensions.get("window").height - Sizes.headerHeight - Sizes.tabBarHeight;
  const sectionSize = availableHeight / numSections;
  const { colors } = useTheme();

  const offset = useSharedValue(calcSectionOffset(index));
  const height = useSharedValue(calcSectionHeight(index));

  const isExpanded = expandedSection === index;

  const animatedStyle = useAnimatedStyle(() => ({
    zIndex: index + 1,
    transform: [{ translateY: offset.value }],
    height: height.value,
  }));
  const numReorders = useSharedValue(0);

  useEffect(() => {
    offset.value = withTiming(calcSectionOffset(index));
    height.value = withTiming(calcSectionHeight(index));
  }, [expandedSection, index]);

  // handle items reordering
  const reorderItems = (index: number) => {
    numReorders.value = numReorders.value + 1;
  };
  // console.log("box_section---------", name, index, isExpanded, expandedSection, sectionSize, availableHeight);

  return (
    <TouchableWithoutFeedback onPress={() => onExpand(index)}>
      <Animated.View style={[styles.sectionContainer, style, animatedStyle]}>
        <View style={[styles.sectionHeader]}>
          <Text style={[styles.sectionHeaderText]}>{name}</Text>
        </View>
        {items.length === 0 && defaultText && (
          <View
            style={{
              flex: 1,
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            <Text style={styles.defaultText}>{defaultText}</Text>
          </View>
        )}
        {isExpanded ? (
          <ScrollView>
            {items.map((item, index) => (
              <Animated.View
                style={[
                  styles.itemListBox,
                  styles.shadowProp,
                  styles.elevation,
                ]}
                key={`listitem_${index}`}
              >
                {renderListItem(item, index)}
              </Animated.View>
            ))}
          </ScrollView>
        ) : (
          <View style={[styles.sectionListContainer]}>            
            {items.map((item, index) => (
              <DraggableBoxCard
                name={name}
                index={index}
                numItems={items.length}
                numReorders={numReorders}
                onReorder={() => reorderItems(index)}
                key={`boxCar_${index}`}
              >
                {renderItem(item, index)}
              </DraggableBoxCard>
            ))}
          </View>
        )}
        
        
        
      </Animated.View>
    </TouchableWithoutFeedback>
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

export default BoxSection;
