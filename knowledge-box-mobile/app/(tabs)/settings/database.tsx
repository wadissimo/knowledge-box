import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  FlatList,
  ScrollView,
  Keyboard,
} from "react-native";
import React, { useState } from "react";
import { useAppTheme } from "@/src/hooks/useAppTheme";
import { useDbUtils } from "@/src/data/DbUtils";

const COLUMN_WIDTH = 100; // Set a fixed width for each column

const DatabaseRun = () => {
  const { colors } = useAppTheme();
  const [query, setQuery] = useState<string>("");
  const [queryResult, setQueryResult] = useState<any[]>([]);
  const { runQuery } = useDbUtils();

  async function handleQuery() {
    if (query.length === 0) return;
    Keyboard.dismiss(); // Hide the keyboard
    const res = await runQuery(query);
    //console.log("query result", res);
    setQueryResult(res);
  }

  const renderHeader = () => {
    if (queryResult.length === 0) return null;
    const columns = Object.keys(queryResult[0]);

    return (
      <View style={styles.tableRow}>
        {columns.map((col, index) => (
          <Text
            key={index}
            style={[
              styles.tableCell,
              styles.headerCell,
              { width: COLUMN_WIDTH },
            ]}
          >
            {col}
          </Text>
        ))}
      </View>
    );
  };

  const renderRow = ({ item }: { item: any }) => {
    const values = Object.values(item);

    return (
      <View style={styles.tableRow}>
        {values.map((value, index) => (
          <Text key={index} style={[styles.tableCell, { width: COLUMN_WIDTH }]}>
            {value != null ? value.toString() : "NULL"}
          </Text>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View>
        <Text>DatabaseRun</Text>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder={"Query"}
          multiline
          numberOfLines={7}
        />
        <Button title="Run" onPress={handleQuery} color={colors.primary} />
      </View>
      <ScrollView horizontal>
        <View>
          {renderHeader()}
          <FlatList
            data={queryResult}
            renderItem={renderRow}
            keyExtractor={(item, index) => index.toString()}
            showsHorizontalScrollIndicator={true}
            style={{ height: 300 }} // Set a fixed height
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
  },
  input: {
    backgroundColor: "#FFF",
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
    color: "#555",
    textAlignVertical: "top",
    height: 150,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  tableCell: {
    padding: 10,
    borderRightWidth: 1,
    borderColor: "#ccc",
  },
  headerCell: {
    fontWeight: "bold",
    backgroundColor: "#f0f0f0",
  },
});

export default DatabaseRun;
