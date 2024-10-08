import { View, Text, FlatList, StyleSheet } from "react-native";
import React from "react";
import { Link } from "expo-router";
import { Collection } from "@/context/DatabaseContext";

const MyCardCollections: React.FC<{
  collections: Collection[];
}> = ({ collections }) => {
  return (
    <View style={styles.table}>
      <View style={styles.header}>
        <Text style={styles.headerItem}>Name</Text>
        <Text style={styles.headerItem}>Cards</Text>
        <Text style={styles.headerItem}> </Text>
      </View>

      <FlatList
        data={collections}
        keyExtractor={(item: Collection) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Link
              href={`/(tabs)/box/manage-collection/${item.id}`}
              //href={`/manage-collection/test`}
              style={[styles.rowItem, styles.link]}
            >
              <Text>{item.name}</Text>
            </Link>
            <Text style={styles.rowItem}>{item.cardsNumber}</Text>
            <Link
              href={`/(tabs)/box/manage-collection/${item.id}/train`}
              style={[styles.rowItem, styles.link]}
            >
              <Text>Train</Text>
            </Link>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    flexDirection: "column",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
  table: {
    marginHorizontal: 30,
    borderColor: "#000",
    borderWidth: 1,
    borderRadius: 10,
    padding: 5,
    backgroundColor: "#c2fbc4",
    flexDirection: "column",
    //flex: 1,
    justifyContent: "flex-start",
    alignItems: "stretch",
  },
  header: {
    //flex: 1,
    flexDirection: "row",
    borderBottomWidth: 1,
    //backgroundColor: "#808080",
  },
  headerItem: { flex: 1, padding: 5, fontSize: 18 },
  row: {
    flexDirection: "row",
    //backgroundColor: "#909090",
    borderColor: "#777777",
    //borderWidth: 1,
  },
  rowItem: { flex: 1, padding: 5, fontSize: 18 },
  link: {
    color: "#1010FF", // Blue color commonly used for links
    textDecorationLine: "underline", // Underline to indicate it's a link
    //fontWeight: "bold", // Bold to make it more obvious
  },
});

export default MyCardCollections;
