import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SessionCard } from '@/src/data/SessionCardModel';
import { Card } from '@/src/data/CardModel';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Image } from 'expo-image';
import * as FileSystem from 'expo-file-system';
import useMediaDataService from '@/src/service/MediaDataService';
import { i18n } from '@/src/lib/i18n';
import {
  runOnJS,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  default as Animated,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useThemeColors } from '@/src/context/ThemeContext';

const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

const DRAG_THRESHOLD = 8; // px, distinguish tap from drag

const FEEDBACK_KEYS = ['again', 'hard', 'good', 'easy'] as const;
type FeedbackKey = (typeof FEEDBACK_KEYS)[number];

const FEEDBACK_OPTIONS: { key: FeedbackKey; color: string; label: string }[] = [
  { key: 'again', color: '#fa4b4b', label: i18n.t('trainer.responses.dontknow') },
  { key: 'hard', color: '#f7b731', label: i18n.t('trainer.responses.hard') },
  { key: 'good', color: '#4b82fa', label: i18n.t('trainer.responses.good') },
  { key: 'easy', color: '#26de81', label: i18n.t('trainer.responses.easy') },
];
const FEEDBACK_BUTTON_COUNT = 4; // Keep in sync with FEEDBACK_OPTIONS

const CardComponent: React.FC<{
  currentCard: Card;
  onUserResponse: (response: FeedbackKey) => void | Promise<void>;
  cardDimensions?: { height: number; width: number };
  playSound: Function;
  getImageSource: Function;
}> = ({ currentCard, onUserResponse, cardDimensions, playSound, getImageSource }) => {
  const { themeColors } = useThemeColors();
  const [cardFlip, setCardFlip] = useState(false);
  const [answerShown, setAnswerShown] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [frontImgSrc, setFrontImgSrc] = useState<string | null>(null);
  const [backImgSrc, setBackImgSrc] = useState<string | null>(null);

  // --- DRAGGABLE STATE ---
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const dragMoved = useSharedValue(false);
  const hoveredButtonIndex = useSharedValue(-1);
  const [cardRootLayout, setCardRootLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const buttonLayouts = useSharedValue<{ x: number; y: number; width: number; height: number }[]>(
    []
  );

  useEffect(() => {
    translateX.value = 0;
    translateY.value = 0;
    isDragging.value = false;
    dragMoved.value = false;
    hoveredButtonIndex.value = -1;
  }, [cardFlip]);

  async function loadImages(card: Card) {
    if (card.backImg !== null) {
      setBackImgSrc(await getImageSource(card.backImg));
    }
    if (card.frontImg !== null) {
      const imgSrc = await getImageSource(card.frontImg);
      setFrontImgSrc(imgSrc);
      if (imgSrc) {
        var { exists } = await FileSystem.getInfoAsync(imgSrc);
      }
    }
  }
  useEffect(() => {
    setCardFlip(false);
    setAnswerShown(false);
    if (currentCard) {
      if (currentCard.backImg !== null || currentCard.frontImg !== null) {
        setLoading(true);
        loadImages(currentCard).then(() => {
          setLoading(false);
        });
      }
    }
  }, [currentCard]);

  function handleCardFlip() {
    setCardFlip(flip => !flip);
    setAnswerShown(true);
  }

  async function handlePlay(soundId: number | null, e?: any) {
    if (e) e.stopPropagation && e.stopPropagation(); // Prevent drag/tap propagation
    if (soundId !== null) {
      await playSound(soundId);
    }
  }

  // Helper to update button layouts (called from onLayout via runOnJS)
  const updateButtonLayouts = (
    i: number,
    layout: { x: number; y: number; width: number; height: number }
  ) => {
    // Update shared value (for worklet)
    const arr = buttonLayouts.value.slice();
    arr[i] = { ...layout, x: layout.x + cardRootLayout.x, y: layout.y + cardRootLayout.y };
    buttonLayouts.value = arr;
  };

  // --- DRAG/FLIP LOGIC ---
  const tapToFlip = () => {
    if (!dragMoved.value) {
      handleCardFlip();
    }
  };

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      dragMoved.value = false;
      isDragging.value = true;
      hoveredButtonIndex.value = -1;
    })
    .onUpdate(e => {
      if (
        !dragMoved.value &&
        (Math.abs(e.translationX) > DRAG_THRESHOLD || Math.abs(e.translationY) > DRAG_THRESHOLD)
      ) {
        dragMoved.value = true;
      }
      if (dragMoved.value) {
        translateX.value = e.translationX;
        translateY.value = e.translationY;
        // Card center position
        const cardCenterX = cardRootLayout.x + cardRootLayout.width / 2 + e.translationX;
        const cardCenterY = cardRootLayout.y + cardRootLayout.height / 2 + e.translationY;
        // Only activate if card center is below drag start Y + threshold
        if (e.translationY >= DRAG_THRESHOLD) {
          const containerLeft = cardRootLayout.x;
          const containerRight = cardRootLayout.x + cardRootLayout.width;
          const quarter = (containerRight - containerLeft) / 4;
          if (cardCenterX < containerLeft + quarter) hoveredButtonIndex.value = 0;
          else if (cardCenterX < containerLeft + 2 * quarter) hoveredButtonIndex.value = 1;
          else if (cardCenterX < containerLeft + 3 * quarter) hoveredButtonIndex.value = 2;
          else hoveredButtonIndex.value = 3;
        } else {
          hoveredButtonIndex.value = -1;
        }
      }
    })
    .onEnd(() => {
      isDragging.value = false;
      if (hoveredButtonIndex.value !== -1) {
        runOnJS(onUserResponse)(FEEDBACK_OPTIONS[hoveredButtonIndex.value].key);
      }
      hoveredButtonIndex.value = -1;
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      dragMoved.value = false;
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: isDragging.value ? 0.96 : 1 },
    ],
    zIndex: isDragging.value ? 10 : 1,
    shadowOpacity: isDragging.value ? 0.35 : 0.2,
    shadowRadius: isDragging.value ? 8 : 3,
  }));

  // --- FEEDBACK BUTTONS Z-INDEX ANIMATION ---
  const feedbackButtonAnimatedStyles = FEEDBACK_OPTIONS.map((_, i) =>
    useAnimatedStyle(() => {
      const isHovered = hoveredButtonIndex.value === i;
      return {
        transform: [{ scale: isHovered ? 1.18 : 1 }],
        zIndex: isHovered ? 100 : 2,
      };
    }, [hoveredButtonIndex])
  );

  // --- FEEDBACK BUTTONS (RELATIVE TO CARD CONTAINER, NOT SCREEN) ---
  const renderFeedbackButtons = () => (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 8,
        zIndex: 30,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-end',
      }}
    >
      <View
        style={[styles.feedbackRow, { backgroundColor: 'transparent', alignItems: 'flex-end' }]}
      >
        {FEEDBACK_OPTIONS.map((opt, i) => (
          <Animated.View
            key={opt.key}
            style={[
              styles.feedbackBtnWrap,
              { height: 54, alignItems: 'center', justifyContent: 'center', marginHorizontal: 8 },
              feedbackButtonAnimatedStyles[i],
            ]}
          >
            <TouchableOpacity
              style={[
                styles.feedbackBtn,
                {
                  backgroundColor: opt.color,
                  height: 54,
                  minWidth: 90,
                  maxWidth: 120,
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingHorizontal: 8,
                },
              ]}
              onPress={() => onUserResponse(opt.key)}
              activeOpacity={0.8}
            >
              <Text style={styles.feedbackBtnText} numberOfLines={1} ellipsizeMode="tail">
                {opt.label}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </View>
  );

  if (loading) return null;

  return (
    <View
      style={styles.cardContainer}
      onLayout={(e: any) =>
        setCardRootLayout({
          x: e.nativeEvent.layout.x,
          y: e.nativeEvent.layout.y,
          width: e.nativeEvent.layout.width,
          height: e.nativeEvent.layout.height,
        })
      }
    >
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.card,
            animatedStyle,
            {
              height: cardDimensions?.height ?? styles.card.height,
              width: cardDimensions?.width ?? styles.card.width,
            },
            styles.elevation,
            styles.shadowProp,
            { backgroundColor: themeColors.cardBg },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.95}
            style={{ flex: 1, width: '100%', height: '100%', borderRadius: 20, overflow: 'hidden' }}
            onPress={tapToFlip}
          >
            {cardFlip ? (
              <CardBackSide
                currentCard={currentCard}
                onSoundPlay={handlePlay}
                imgSrc={backImgSrc}
              />
            ) : (
              <CardFrontSide
                currentCard={currentCard}
                onSoundPlay={handlePlay}
                imgSrc={frontImgSrc}
              />
            )}
          </TouchableOpacity>
        </Animated.View>
      </GestureDetector>
      {/* Add empty space below the card for feedback buttons */}
      <View style={{ height: 96 }} />
      {answerShown && renderFeedbackButtons()}
    </View>
  );
};

// --- CENTERED CARD SIDES ---
const CardFrontSide = ({
  currentCard,
  onSoundPlay,
  imgSrc,
}: {
  currentCard: Card;
  onSoundPlay: (soundId: number | null, e?: any) => void;
  imgSrc: string | null;
}) => {
  const { themeColors } = useThemeColors();

  return (
    <View style={styles.sideContainer}>
      <View style={styles.frontBackTextView}>
        <Text style={[styles.frontBackText, { color: themeColors.cardText }]}>Front</Text>
      </View>
      {imgSrc && (
        <View style={styles.imageContainer}>
          <Image
            style={styles.image}
            source={{ uri: imgSrc }}
            placeholder={{ blurhash }}
            contentFit="contain"
          />
        </View>
      )}
      <View style={styles.cardTextView}>
        <Text style={[styles.cardText, { color: themeColors.cardText }]}>{currentCard?.front}</Text>
      </View>
      {currentCard && currentCard.frontSound && (
        <View style={styles.soundContainer}>
          <TouchableOpacity onPress={e => onSoundPlay(currentCard.frontSound, e)}>
            <Icon name="play-circle-outline" size={48} color={themeColors.cardText} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const CardBackSide = ({
  currentCard,
  onSoundPlay,
  imgSrc,
}: {
  currentCard: Card;
  onSoundPlay: (soundId: number | null, e?: any) => void;
  imgSrc: string | null;
}) => {
  const { themeColors } = useThemeColors();

  return (
    <View style={styles.sideContainer}>
      <View style={styles.frontBackTextView}>
        <Text style={[styles.frontBackText, { color: themeColors.cardText }]}>Back</Text>
      </View>
      {imgSrc && (
        <View style={styles.imageContainer}>
          <Image
            style={styles.image}
            source={{ uri: imgSrc }}
            placeholder={{ blurhash }}
            contentFit="contain"
          />
        </View>
      )}
      <View style={styles.cardTextView}>
        <Text style={[styles.cardText, { color: themeColors.cardText }]}>{currentCard?.back}</Text>
      </View>
      {currentCard && currentCard.backSound && (
        <View style={styles.soundContainer}>
          <TouchableOpacity onPress={e => onSoundPlay(currentCard.backSound, e)}>
            <Icon name="play-circle-outline" size={48} color={themeColors.cardText} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  cardContainer: {
    alignItems: 'center',
    margin: 20,
  },
  card: {
    padding: 10,
    height: 500,
    width: 300,
    backgroundColor: '#c2fbc4',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedbackRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 10,
    marginTop: 20,
    width: '100%',
    gap: 8,
  },
  feedbackBtnWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackBtn: {
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
    marginHorizontal: 2,
  },
  feedbackBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: 'center',
  },
  cardBtnsContainer: {
    margin: 10,
    flexDirection: 'row',
    gap: 10,
  },
  cardBtn: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  greenCardBtn: {
    backgroundColor: '#4b82fa',
    color: 'white',
  },
  redCardBtn: {
    backgroundColor: '#fa4b4b',
    color: 'white',
  },
  cardBtnText: {
    color: 'white',
  },
  frontBackTextView: {
    marginBottom: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frontBackText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cardTextView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  cardText: {
    fontSize: 20,
    textAlign: 'center',
  },
  soundContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    width: '100%',
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
  editIcon: {
    position: 'absolute',
    bottom: 10,
    right: 5,
  },
  sideContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
});

export default CardComponent;
