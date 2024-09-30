// app/index.tsx
import { Link, useRouter } from "expo-router";
import { View, Text, Button, FlatList, StyleSheet } from "react-native";
import * as SQLite from "expo-sqlite";
import { useEffect, useState } from "react";
import { Collection, useDatabase } from "@/context/DatabaseContext";

export default function CollectionsScreen() {
  const router = useRouter();
  const { collections } = useDatabase();

  const handleAddPress = () => {
    router.push("/manage-collection/new");
  };
  return (
    <View style={styles.container}>
      <View style={styles.table}>
        <View style={styles.header}>
          <Text style={styles.headerItem}>Collection Name</Text>
          <Text style={styles.headerItem}>Number of Cards</Text>
          <Text style={styles.headerItem}> </Text>
        </View>
        {/* <FlatList
        data={collections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
            <View>
            <Text>{item.name}</Text>
            <Button
            title="Manage Collection"
            onPress={() => router.push(`/manage-collection/${item.id}`)}
            />
            <Button
            title="Start Training"
            onPress={() => router.push(`/training/${item.id}`)}
            />
            </View>
            )}
            /> */}

        <FlatList
          data={collections}
          keyExtractor={(item: Collection) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Link
                href={`/manage-collection/${item.id}`}
                //href={`/manage-collection/test`}
                style={[styles.rowItem, styles.link]}
              >
                <Text>{item.name}</Text>
              </Link>
              <Text style={styles.rowItem}>{item.cardsNumber}</Text>
              <Link
                href={`/manage-collection/${item.id}/train`}
                style={[styles.rowItem, styles.link]}
              >
                <Text>Train</Text>
              </Link>
            </View>
          )}
        />
        <Button
          title="Add Collection"
          color="#4CAF50"
          onPress={handleAddPress}
        ></Button>
      </View>
    </View>
  );
}

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
    backgroundColor: "#666666",
    flexDirection: "column",
    //flex: 1,
    justifyContent: "flex-start",
    alignItems: "stretch",
  },
  header: {
    //flex: 1,
    flexDirection: "row",

    backgroundColor: "#808080",
  },
  headerItem: { flex: 1, padding: 5 },
  row: {
    flexDirection: "row",
    backgroundColor: "#909090",
    borderColor: "#777777",
    borderWidth: 1,
  },
  rowItem: { flex: 1, padding: 5 },
  link: {
    color: "#1010FF", // Blue color commonly used for links
    textDecorationLine: "underline", // Underline to indicate it's a link
    //fontWeight: "bold", // Bold to make it more obvious
  },
});
