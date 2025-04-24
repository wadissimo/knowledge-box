// FlashcardCollectionsScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  StatusBar,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Make sure to install expo/vector-icons

// Define the structure of a collection
interface Collection {
  id: string;
  title: string;
  cardCount: number; // Optional: useful info
  previewText?: string; // Text for the top card preview
}

// --- Dummy Data (Replace with your actual data fetching) ---
const DUMMY_COLLECTIONS: Collection[] = [
  { id: '1', title: 'English to Chinese', cardCount: 50, previewText: 'Please' },
  { id: '2', title: 'Chinese to English', cardCount: 50, previewText: '请\nQǐng' },
  { id: '3', title: 'World Capitals', cardCount: 195, previewText: 'Andorra' },
  { id: '4', title: 'React Native Concepts', cardCount: 30, previewText: 'useState' },
  { id: '5', title: 'German Articles', cardCount: 100, previewText: 'Der' },
];
// --- End Dummy Data ---

const { width } = Dimensions.get('window');
const CARD_PREVIEW_WIDTH = width * 0.7;
const CARD_PREVIEW_HEIGHT = 100;

const FlashcardCollectionsScreen: React.FC = () => {
  // --- State ---
  // Replace DUMMY_COLLECTIONS with useState and fetch your actual data
  const [collections] = React.useState<Collection[]>(DUMMY_COLLECTIONS);

  // --- Handlers (Implement your navigation/logic here) ---
  const handleEditCollection = (id: string) => {
    console.log('Edit collection:', id);
    // Navigate to Edit Screen or show modal
  };

  const handleTrainCollection = (id: string) => {
    console.log('Train collection:', id);
    // Navigate to Training Screen
  };

  const handleAddCollection = () => {
    console.log('Add new collection');
    // Navigate to Add Collection Screen or show modal
  };

  // --- Render Item for FlatList ---
  const renderCollectionItem = ({ item }: { item: Collection }) => (
    <View style={styles.collectionItemContainer}>
      {/* Header: Title and Actions */}
      <View style={styles.collectionHeader}>
        <Text style={styles.collectionTitle}>{item.title}</Text>
        <View style={styles.collectionActions}>
          <TouchableOpacity
            onPress={() => handleEditCollection(item.id)}
            style={styles.iconButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 5 }} // Increase tap area
          >
            <MaterialCommunityIcons name="pencil-outline" size={24} color="#444" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleTrainCollection(item.id)}
            style={styles.iconButton}
            hitSlop={{ top: 10, bottom: 10, left: 5, right: 10 }} // Increase tap area
          >
            <MaterialCommunityIcons name="play-circle-outline" size={26} color="#34A853" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Card Stack Preview */}
      <View style={styles.cardStackContainer}>
        {/* Create a subtle stacking effect */}
        <View style={[styles.cardPreviewBase, styles.cardPreview3]}>
            {/* Optional: Could show card count or different info */}
        </View>
        <View style={[styles.cardPreviewBase, styles.cardPreview2]}>
             {/* Optional: Could show card count or different info */}
        </View>
        <View style={[styles.cardPreviewBase, styles.cardPreview1]}>
          <Text style={styles.cardPreviewText} numberOfLines={2}>
             {item.previewText || `(${item.cardCount} cards)`}
          </Text>
        </View>
      </View>
    </View>
  );

  // --- Main Component Return ---
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f0f0" />
      <View style={styles.screenContainer}>
         {/* Optional Header - You can uncomment and style this if needed
         <View style={styles.headerBar}>
            <Text style={styles.headerTitle}>My Flashcard Box</Text>
         </View>
         */}

        <FlatList
          data={collections}
          renderItem={renderCollectionItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContentContainer}
          ItemSeparatorComponent={() => <View style={styles.separator} />} // Visual gap between items
          showsVerticalScrollIndicator={false}
        />

        {/* Floating Action Button to Add Collection */}
        <TouchableOpacity style={styles.fab} onPress={handleAddCollection}>
          <MaterialCommunityIcons name="plus" size={30} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f0f0', // Light background for the "box" interior
  },
  screenContainer: {
    flex: 1,
  },
//   headerBar: { // Optional header style
//     padding: 15,
//     backgroundColor: '#ffffff',
//     borderBottomWidth: 1,
//     borderBottomColor: '#e0e0e0',
//     alignItems: 'center', // Or 'flex-start' if you want it left-aligned
//   },
//   headerTitle: { // Optional header style
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#333',
//   },
  listContentContainer: {
    paddingHorizontal: 15,
    paddingTop: 20,
    paddingBottom: 100, // Ensure space for FAB
  },
  collectionItemContainer: {
    backgroundColor: '#ffffff', // White background for each collection "section"
    borderRadius: 12,
    marginBottom: 5, // Reduced margin, separator adds visual space
    overflow: 'hidden', // Keeps shadows contained
    // iOS Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Android Elevation
    elevation: 3,
  },
   separator: {
    height: 15, // Creates the gap between collection items
  },
  collectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#e8f0fe', // A slightly different color for the header/tab
    borderBottomWidth: 1,
    borderBottomColor: '#d0d9e8'
  },
  collectionTitle: {
    fontSize: 17,
    fontWeight: '600', // Semi-bold
    color: '#333',
    flex: 1, // Allow text to take available space
    marginRight: 10,
  },
  collectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 5, // Tap area helper
    marginLeft: 10, // Space between icons
  },
  cardStackContainer: {
    height: CARD_PREVIEW_HEIGHT + 20, // Adjust height to contain the stack
    alignItems: 'center', // Center the stack horizontally
    justifyContent: 'center', // Center the stack vertically
    paddingVertical: 15,
    position: 'relative', // Needed for absolute positioning of cards
    // backgroundColor: '#f8f9fa', // Optional subtle background for the card area
  },
  cardPreviewBase: { // Base styles for all cards in the stack
    width: CARD_PREVIEW_WIDTH,
    height: CARD_PREVIEW_HEIGHT,
    borderRadius: 10,
    position: 'absolute', // Key for stacking
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fffbe5', // Creamy paper color
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
     // iOS Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    // Android Elevation
    elevation: 2,
  },
  // Individual card styles for positioning and rotation
  cardPreview1: { // Top card
    zIndex: 3, // Ensure it's on top
    // transform: [{ rotate: '0deg' }], // No rotation for the top card
  },
  cardPreview2: { // Middle card
    zIndex: 2,
    transform: [{ translateX: 4 }, { translateY: 4 }, { rotate: '1.5deg' }], // Offset and slight rotation
    backgroundColor: '#fff9e0', // Slightly darker shade maybe
  },
  cardPreview3: { // Bottom card
     zIndex: 1,
    transform: [{ translateX: 8 }, { translateY: 8 }, { rotate: '-1deg' }], // Offset more and opposite rotation
     backgroundColor: '#fff7da', // Even darker shade maybe
  },
    cardPreviewText: {
    fontSize: 16,
    color: '#444',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1a73e8', // Google Blue - or your app's primary color
    justifyContent: 'center',
    alignItems: 'center',
    // iOS Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    // Android Elevation
    elevation: 8,
  },
});

export default FlashcardCollectionsScreen;