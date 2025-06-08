import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { i18n } from '@/src/lib/i18n';
import { useRouter } from 'expo-router';
import { Collection } from '@/src/data/CollectionModel';
import { Card, useCardModel } from '@/src/data/CardModel';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '@react-navigation/native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import DraggableBoxCard from './DraggableBoxCard';
import { useThemeColors } from '@/src/context/ThemeContext';
import { Note, useNoteModel } from '@/src/data/NoteModel';
import RenderHtml from 'react-native-render-html';

const BOX_SECTION_HEADER_SIZE = 40;
const MAX_CARD_WINDOW_SIZE = 5;

const NotesBoxSection = ({
  boxId,
  sectionTitle,
  index,
  numSections,
  expandedSection,
  onExpand,
  calcSectionHeight,
  calcSectionOffset,
}: {
  boxId: number;
  sectionTitle: string;
  index: number;
  numSections: number;
  expandedSection: number | null;
  onExpand: (index: number) => void;
  calcSectionHeight: (index: number) => number;
  calcSectionOffset: (index: number) => number;
}) => {
  const { themeColors } = useThemeColors();
  const router = useRouter();
  const { getNotesWindow, getNotesCount } = useNoteModel();

  const [notes, setNotes] = useState<Note[]>([]);
  const [topNoteIndex, setTopNoteIndex] = useState<number>(0);
  const [noteOffset, setNoteOffset] = useState<number>(0);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [noteCount, setNoteCount] = useState<number>(0);
  const CARD_WINDOW_SIZE = Math.min(MAX_CARD_WINDOW_SIZE, noteCount);
  // console.log('NotesBoxSection notes', notes);

  useEffect(() => {
    let isMounted = true;
    async function loadInitial() {
      try {
        setIsLoadingNotes(true);
        const count = await getNotesCount(boxId);
        setNoteCount(count);
        const window = await getNotesWindow(boxId, 0, Math.min(MAX_CARD_WINDOW_SIZE, count));

        //window.reverse();
        if (isMounted) {
          setNotes(window);
          setIsLoadingNotes(false);
        }
      } catch (error) {
        console.error('Error loading notes:', error);
      } finally {
        setIsLoadingNotes(false);
      }
    }
    if (boxId !== null) loadInitial();
    return () => {
      isMounted = false;
    };
  }, [boxId]);

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

  const handleReorderingEnd = async () => {
    console.log('handleReorderingEnd');
    const nextNoteIndex = (noteOffset + CARD_WINDOW_SIZE) % noteCount;
    const nextNote = await getNotesWindow(boxId, nextNoteIndex, 1);
    if (nextNote.length > 0) {
      let newNotes = [...notes];
      console.log(
        'newNotes1',
        newNotes.map(note => note.title)
      );
      newNotes[topNoteIndex] = nextNote[0];
      console.log('nextNote', nextNote);
      console.log(
        'newNotes2',
        newNotes.map(note => note.title)
      );
      setNotes(newNotes);
    }

    setNoteOffset((noteOffset + 1) % noteCount);
    setTopNoteIndex((topNoteIndex + 1) % CARD_WINDOW_SIZE);
  };

  function handleNoteClick(noteId: number) {
    console.log('NotesBoxSection handleNoteClick', noteId);
    router.push(`/(tabs)/box/${boxId}/notes/edit/${noteId}`);
  }
  return (
    <>
      <TouchableWithoutFeedback onPress={() => onExpand(index)}>
        <Animated.View
          style={[
            styles.sectionContainer,
            styles.boxSection,
            animatedStyle,
            { backgroundColor: themeColors.popupBg },
          ]}
        >
          <View
            style={[
              styles.sectionHeader,
              {
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: themeColors.subHeaderBg,
              },
            ]}
          >
            <Text style={[styles.sectionHeaderText, { flex: 1, color: themeColors.subHeaderText }]}>
              {sectionTitle}
            </Text>
          </View>
          {notes.length === 0 && (
            <View
              style={{
                flex: 1,
                justifyContent: 'flex-end',
                alignItems: 'center',
                backgroundColor: themeColors.popupBg,
              }}
            >
              <Text style={[styles.defaultText, { color: themeColors.popupText }]}>
                {i18n.t('boxes.noNotesDefault')}
              </Text>
            </View>
          )}
          {isExpanded ? (
            <ScrollView>
              {notes.map((note, index) => (
                <Animated.View
                  style={[styles.itemListBox, styles.shadowProp, styles.elevation]}
                  key={`listitem_${index}`}
                >
                  <TouchableOpacity
                    onPress={() => handleNoteClick(note.id)}
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    <View style={styles.noteExpandedSectionContainer}>
                      <View style={styles.noteTitleContainer}>
                        <Text style={styles.text} numberOfLines={1}>
                          {note.title}
                        </Text>
                      </View>
                      <View style={styles.noteDateContainer}>
                        <Text style={styles.datetimeText} numberOfLines={1}>
                          {new Date(note.createdAt).toLocaleDateString()}
                        </Text>
                        <Text style={styles.datetimeText} numberOfLines={1}>
                          {new Date(note.createdAt).toLocaleTimeString()}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </ScrollView>
          ) : (
            <View style={[styles.sectionListContainer]}>
              {notes.map((note, index) => (
                <DraggableBoxCard
                  name={note.title}
                  index={CARD_WINDOW_SIZE - 1 - index}
                  numItems={notes.length}
                  numReorders={numReorders}
                  onReorder={() => reorderItems(index)}
                  onEnd={handleReorderingEnd}
                  key={`boxCar_${note.id}`}
                  draggable={index === topNoteIndex}
                >
                  <TouchableOpacity onPress={() => handleNoteClick(note.id)} style={{ flex: 1 }}>
                    <View style={styles.htmlContentContainer}>
                      {/* <Text style={styles.colNameTxt} numberOfLines={4}>
                        {note.title}
                      </Text> */}
                      <RenderHtml source={{ html: note.content }} tagsStyles={customTagsStyles} />
                    </View>
                  </TouchableOpacity>
                </DraggableBoxCard>
              ))}
              {isLoadingNotes && (
                <View style={{ alignItems: 'center', margin: 12 }}>
                  <Text>Loading more notes...</Text>
                </View>
              )}
            </View>
          )}
        </Animated.View>
      </TouchableWithoutFeedback>
    </>
  );
};
const customTagsStyles = {
  h1: {
    fontSize: 24,
    fontWeight: 'bold' as 'bold',
    marginBottom: 10,
    color: '#333',
  },
  p: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 5,
    color: '#555',
  },
  strong: {
    fontWeight: 'bold' as 'bold',
  },
  em: {
    fontStyle: 'italic' as 'italic',
  },
  a: {
    color: 'blue',
    textDecorationLine: 'underline' as 'underline',
  },
  b: {
    fontWeight: 'bold' as 'bold',
  },
  i: {
    fontStyle: 'italic' as 'italic',
  },
  u: {
    textDecorationLine: 'underline' as 'underline',
  },
  s: {
    textDecorationLine: 'line-through' as 'line-through',
  },
  strike: {
    textDecorationLine: 'line-through' as 'line-through',
  },
};

const styles = StyleSheet.create({
  boxSection: {
    position: 'absolute',
    width: '100%',
    //height: 500,
  },

  text: {
    fontSize: 16,
  },
  cardCntView: {
    padding: 7,
    alignSelf: 'flex-end',
  },
  cardsCntTxt: {
    fontSize: 12,
  },
  addBoxBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    position: 'absolute',
    bottom: 10,
    marginHorizontal: 10,
    marginVertical: 2,
    //right: 10,
    alignSelf: 'flex-end', // Center horizontally
  },
  sectionContainer: {
    borderColor: '#ddd',
    borderWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 16,
    borderTopLeftRadius: 16,
    marginHorizontal: 10,
    backgroundColor: 'orangered',
    elevation: 25,
  },
  sectionHeader: {
    paddingHorizontal: 12,
    paddingVertical: 0,
    flexDirection: 'row',
    alignItems: 'center',

    borderTopRightRadius: 16,
    borderTopLeftRadius: 16,
    backgroundColor: '#b3e5fc',
    height: BOX_SECTION_HEADER_SIZE + 24,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0288d1',
    flex: 1,
    letterSpacing: 0.5,
    textAlignVertical: 'center',
    textAlign: 'left',
    includeFontPadding: false,
    paddingVertical: 0,
    marginVertical: 0,
  },
  actionIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  iconCircleBtn: {
    width: 54,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  iconLabel: {
    fontSize: 10,
    color: '#6c7280',
    textAlign: 'center',
    marginTop: 1,
  },
  iconSeparator: {
    width: 1,
    height: 32,
    backgroundColor: '#81d4fa',
    marginHorizontal: 4,
    borderRadius: 1,
  },
  sectionFooter: {
    height: 10,
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    backgroundColor: '#cad1ca',
  },
  sectionIcons: { flexDirection: 'row', gap: 32 },
  sectionListContainer: {
    paddingVertical: 5,
    paddingHorizontal: 7,
    alignItems: 'center',
    // backgroundColor: "orange",
    flex: 0.95,
  },
  defaultText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  itemListBox: {
    //position: "absolute",
    //width: "100%",
    height: 60,
    backgroundColor: '#faf8b4',
    borderRadius: 5,

    //borderColor: "lightgrey",
    borderWidth: 1,
    borderColor: '#dd8',
    //paddingVertical: 5,
    //paddingHorizontal: 15,
    marginHorizontal: 5,
    marginVertical: 2,
    justifyContent: 'center',
  },
  shadowProp: {
    shadowColor: '#171717',
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  elevation: {
    elevation: 5,
    shadowColor: '#52006A',
  },

  trainBoxBtn: {
    width: 100,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    position: 'absolute',
    bottom: 10,
    marginHorizontal: 10,
    marginVertical: 2,
    //right: 10,
    alignSelf: 'flex-end', // Center horizontally
  },
  trainBoxBtnText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  noteExpandedSectionContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingBottom: 5,
    alignItems: 'center',
  },
  noteTitleContainer: {
    flex: 0.5,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  noteDateContainer: {
    flex: 0.5,
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  htmlContentContainer: {
    flex: 1,
    paddingHorizontal: 10,
    paddingBottom: 5,
    overflow: 'hidden',
  },
  datetimeText: {
    fontSize: 12,
    color: '#6c7280',
  },
});

export default NotesBoxSection;
