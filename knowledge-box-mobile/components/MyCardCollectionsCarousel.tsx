import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React from "react";
import { Link, useRouter } from "expo-router";
import { Collection } from "@/data/CollectionModel";

const MyCardCollectionsCarousel: React.FC<{
  collections: Collection[];
}> = ({ collections }) => {
  const router = useRouter();
  function handleCollectionPress(collectionId: number) {
    router.push(`/(tabs)/box/manage-collection/${collectionId}`);
  }
  return (
    <ScrollView horizontal>
      <View style={styles.scrollContainer}>
        {collections.map((collection) => (
          <TouchableOpacity
            key={`col_${collection.id}`}
            onPress={() => handleCollectionPress(collection.id)}
          >
            <View style={[styles.colBox, styles.shadowProp, styles.elevation]}>
              <View style={styles.colNameView}>
                <Text style={styles.colNameTxt} numberOfLines={4}>
                  {collection.name}
                </Text>
              </View>
              <View style={styles.cardCntView}>
                <Text style={styles.cardsCntTxt}>
                  Cards: {collection.cardsNumber}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
    // <View style={styles.table}>
    //   <View style={styles.header}>
    //     <Text style={styles.headerItem}>Name</Text>
    //     <Text style={styles.headerItem}>Cards</Text>
    //     <Text style={styles.headerItem}> </Text>
    //   </View>

    //   <FlatList
    //     data={collections}
    //     keyExtractor={(item: Collection) => item.id.toString()}
    //     renderItem={({ item }) => (
    //       <View style={styles.row}>
    //         <Link
    //           href={`/(tabs)/box/manage-collection/${item.id}`}
    //           //href={`/manage-collection/test`}
    //           style={[styles.rowItem, styles.link]}
    //         >
    //           <Text>{item.name}</Text>
    //         </Link>
    //         <Text style={styles.rowItem}>{item.cardsNumber}</Text>
    //         <Link
    //           href={`/(tabs)/box/manage-collection/${item.id}/train`}
    //           style={[styles.rowItem, styles.link]}
    //         >
    //           <Text>Train</Text>
    //         </Link>
    //       </View>
    //     )}
    //   />
    // </View>
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
    marginHorizontal: 10,
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
  scrollContainer: {
    flexDirection: "row",
    gap: 1,
    paddingBottom: 10,
  },
  colBox: {
    width: 200,
    height: 100,
    backgroundColor: "#c2fbc4",
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 15,
    margin: 5,
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

export default MyCardCollectionsCarousel;
