import { useBoxCollectionModel } from '@/src/data/BoxCollectionModel';
import { Box, useBoxModel } from '@/src/data/BoxModel';
import { Collection } from '@/src/data/CollectionModel';
import { useIsFocused } from '@react-navigation/native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { i18n } from '@/src/lib/i18n';
import CollectionBoxSection from '@/src/components/box/CollectionBoxSection';
import { Dimensions } from 'react-native';
import { Sizes } from '@/src/constants/Sizes';
import { AddToBoxModal } from '@/src/components/box/AddToBoxButton';
import { useThemeColors } from '@/src/context/ThemeContext';
import ScreenContainer from '@/src/components/common/ScreenContainer';
import { ActivityIndicator } from 'react-native';

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
  const [collections, setCollections] = useState<Collection[]>([]);
  const [box, setBox] = useState<Box | null>(null);

  const isFocused = useIsFocused();
  const availableHeight = Dimensions.get('window').height - Sizes.headerHeight - Sizes.tabBarHeight;

  const numSections = collections.length;
  const sectionSize = availableHeight / numSections;

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const box = await getBoxById(Number(boxId));
        const cols = await fetchCollectionsByBoxId(Number(boxId));
        setBox(box);
        setCollections(cols);
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
      height = sectionSize + 5;
    }
    // console.log("height", index, height);
    return height;
  };

  const calcSectionOffset = (index: number): number => {
    if (expandedSection !== null) {
      if (index <= expandedSection) {
        return index * BOX_SECTION_HEADER_SIZE;
      }
      return availableHeight - (numSections - index) * BOX_SECTION_HEADER_SIZE;
    }
    return sectionSize * index;
  };

  if (loading || box === null) {
    return (
      <ScreenContainer>
        <ActivityIndicator size="large" color={themeColors.headerText} />
      </ScreenContainer>
    );
  }

  return (
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

      <AddToBoxModal boxId={box.id} />
    </ScreenContainer>
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
