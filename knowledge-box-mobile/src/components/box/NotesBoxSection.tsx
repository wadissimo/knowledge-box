import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";
import { i18n } from "@/src/lib/i18n";

import BoxSection from "./BoxSection";

const NotesBoxSection = ({
  index,
  numSections,
  expandedSection,
  onExpand,
  calcSectionHeight,
  calcSectionOffset,
  
}: {
  
  index: number;
  numSections: number;
  expandedSection: number | null;
  onExpand: (index: number) => void;
  calcSectionHeight: (index: number) => number;
  calcSectionOffset: (index: number) => number;
}) => {
    const items: any[] = ["c 1", "3", "5"];

    const handleAddNotePress = () => {
      console.log("handleAddNotePress");
    };
  return (
<BoxSection
          key={`boxSection_notes`}
          name={i18n.t("boxes.notes")}
          index={index}
          numSections={numSections}
          calcSectionHeight={calcSectionHeight}
          calcSectionOffset={calcSectionOffset}
          expandedSection={expandedSection}
          style={styles.boxSection}
          onAddNew={handleAddNotePress}
          onExpand={onExpand}
          items={items}
          defaultText={i18n.t("boxes.noNotesDefault")}
          renderItem={(item: any, index: number) => (
            <>
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
            </>
          )}
          renderListItem={(item: any, index: number) => (
            <View style={styles.colNameView}>
              <Text style={styles.colNameTxt} numberOfLines={1}>
                {item}
              </Text>
            </View>
          )}
        />

  );
};


const styles = StyleSheet.create({
  boxSection: {
    position: "absolute",
    width: "100%",
    //height: 500,
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
});

export default NotesBoxSection;
