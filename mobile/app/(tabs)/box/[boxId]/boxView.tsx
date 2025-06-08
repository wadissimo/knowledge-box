import { useBoxCollectionModel } from '@/src/data/BoxCollectionModel';
import { Box, useBoxModel } from '@/src/data/BoxModel';
import { Collection } from '@/src/data/CollectionModel';
import { useIsFocused } from '@react-navigation/native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { i18n } from '@/src/lib/i18n';
import CollectionBoxSection from '@/src/components/box/CollectionBoxSection';
import { Dimensions } from 'react-native';
import { Sizes } from '@/src/constants/Sizes';
import { AddToBoxModal } from '@/src/components/box/AddToBoxButton';
import { useThemeColors } from '@/src/context/ThemeContext';
import ScreenContainer from '@/src/components/common/ScreenContainer';
import { ActivityIndicator } from 'react-native';
import NotesBoxSection from '@/src/components/box/NotesBoxSection';
import { Note, useNoteModel } from '@/src/data/NoteModel';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

const BOX_SECTION_HEADER_SIZE = 40;
const COLLAPSED_SECTION_SIZE = BOX_SECTION_HEADER_SIZE + 50;

const BoxView = () => {
  const { themeColors } = useThemeColors();
  const [expandedSection, setExpandedSection] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const router = useRouter();
  const navigation = useNavigation();

  const { boxId } = useLocalSearchParams();
  const { getBoxById } = useBoxModel();
  const { fetchCollectionsByBoxId } = useBoxCollectionModel();
  const { getBoxNotes } = useNoteModel();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [box, setBox] = useState<Box | null>(null);

  const isFocused = useIsFocused();

  const [measuredContentHeight, setMeasuredContentHeight] = useState<number>(0);

  const tabBarHeight = useBottomTabBarHeight(); // Only works inside a screen
  const headerHeight = useHeaderHeight();

  // const availableHeight = measuredContentHeight;
  const availableHeight =
    measuredContentHeight !== 0
      ? measuredContentHeight
      : Dimensions.get('window').height - headerHeight - tabBarHeight;

  console.log('boxView.tsx availableHeight', availableHeight);

  const numSections = collections.length + (notes.length > 0 ? 1 : 0);

  const sectionSize = availableHeight / numSections;

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const box = await getBoxById(Number(boxId));
        const cols = await fetchCollectionsByBoxId(Number(boxId));
        const notes = await getBoxNotes(Number(boxId));
        setBox(box);
        setCollections(cols);
        setNotes(notes);
        if (box !== null) {
          var boxName = box.name.length > 14 ? box.name.substring(0, 12) + '...' : box.name;
          navigation.setOptions({
            title: boxName,
            headerRight: () => (
              <TouchableOpacity onPress={handleManageBox}>
                <Icon name="pencil-outline" size={32} color="white" />
              </TouchableOpacity>
            ),
          });
        }
      } finally {
        setLoading(false);
      }
    }
    if (isFocused) {
      loadData();
      console.log('fetch data');
    }
  }, [isFocused]);

  const handleLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    setMeasuredContentHeight(height);
    console.log('Actual Measured Content Height:', height);
  };

  function onExpand(index: number) {
    if (expandedSection === index) {
      setExpandedSection(null);
    } else {
      setExpandedSection(index);
    }
  }
  function handleManageBox() {
    router.push(`./boxManage`);
  }

  const calcSectionHeight = (index: number): number => {
    let height = 0;
    if (expandedSection !== null) {
      if (expandedSection === index) {
        height = availableHeight - (numSections - 1) * BOX_SECTION_HEADER_SIZE;
      } else {
        height = COLLAPSED_SECTION_SIZE;
      }
    } else {
      height = sectionSize + 12;
    }
    // console.log('height', index, height);
    return height;
  };

  const calcSectionOffset = (index: number): number => {
    // if (index == 2) {
    //   return 720;
    // }
    if (expandedSection !== null) {
      if (index <= expandedSection) {
        return index * BOX_SECTION_HEADER_SIZE;
      }
      return availableHeight - (numSections - index) * BOX_SECTION_HEADER_SIZE;
    }
    //console.log('offset', index, sectionSize * index);
    return sectionSize * index;
  };

  if (loading || box === null) {
    console.log('boxView.tsx loading');
    return (
      <View style={{ height: '100%' }} onLayout={handleLayout}>
        <ScreenContainer>
          <ActivityIndicator size="large" color={themeColors.headerText} />
        </ScreenContainer>
      </View>
    );
  }

  // console.log('BoxView');
  if (!isFocused) return null;
  return (
    <View style={{ height: '100%' }} onLayout={handleLayout}>
      <ScreenContainer>
        {collections.length === 0 && (
          <View style={styles.emptyStateContainer}>
            <Icon
              name="inbox-arrow-down"
              size={80}
              color={themeColors.headerText}
              style={{ marginBottom: 12 }}
            />
            <Text style={[styles.emptyStateText, { color: themeColors.headerText }]}>
              {i18n.t('boxes.noCollectionsDefault')}
            </Text>
          </View>
        )}
        {collections.length > 0 && (
          <>
            {collections.map((col, i) => (
              <CollectionBoxSection
                key={`col_${col.id}`}
                boxId={String(box.id)}
                col={col}
                index={i}
                numSections={numSections}
                expandedSection={expandedSection}
                onExpand={onExpand}
                calcSectionHeight={calcSectionHeight}
                calcSectionOffset={calcSectionOffset}
              />
            ))}
          </>
        )}
        {notes.length > 0 && (
          <NotesBoxSection
            boxId={box.id}
            sectionTitle={i18n.t('boxes.notes')}
            index={collections.length}
            numSections={numSections}
            expandedSection={expandedSection}
            onExpand={onExpand}
            calcSectionHeight={calcSectionHeight}
            calcSectionOffset={calcSectionOffset}
          />
        )}

        <AddToBoxModal boxId={box.id} />
      </ScreenContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#6c7280',
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default BoxView;
