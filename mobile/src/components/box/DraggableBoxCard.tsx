import { useTheme } from '@react-navigation/native';
import React, { forwardRef, ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  SharedValue,
  runOnJS,
  useDerivedValue,
} from 'react-native-reanimated';

const OFFSET_SIDE_TRIGGER_REORDER = 40;
const BOX_CARD_OFFSET = 10;
const BOX_SECTION_HEADER_SIZE = 40;

const DraggableBoxCard = ({
  name,
  index,
  numReorders,
  numItems,
  draggable = true,
  onReorder,
  onEnd,
  children,
}: {
  name: string;
  index: number;
  numReorders: SharedValue<number>;
  numItems: number;
  draggable?: boolean;
  children?: React.ReactNode;
  onReorder?: Function;
  onEnd?: Function;
}) => {
  const draggableX = useSharedValue(0);

  const initialOffsetY = ((index + numReorders.value) % numItems) * BOX_CARD_OFFSET;
  const draggableY = useSharedValue(initialOffsetY);

  const isDragged = useSharedValue(false);
  const movingBack = useSharedValue(false);
  const posY = useDerivedValue(() => {
    return isDragged.value
      ? draggableY.value
      : ((index + numReorders.value) % numItems) * BOX_CARD_OFFSET;
  });

  const draggableAnimatedStyle = useAnimatedStyle(() => ({
    zIndex: (index + numReorders.value) % numItems,
    transform: [{ translateX: draggableX.value }, { translateY: posY.value }],
  }));

  const pan = Gesture.Pan()
    .onUpdate(e => {
      if (Math.abs(e.translationX) > OFFSET_SIDE_TRIGGER_REORDER) {
        if (!movingBack.value) {
          isDragged.value = false;

          if (onReorder) runOnJS(onReorder as any)();

          draggableX.value = withTiming(0, {}, finished => {
            if (finished) {
              console.log('Dragged (finished)', draggableX.value, draggableY.value);
              if (onEnd) runOnJS(onEnd as any)();
            }
          });

          movingBack.value = true;
        }
      } else {
        isDragged.value = true;
        movingBack.value = false;
        draggableX.value = e.translationX;
        draggableY.value = e.translationY + initialOffsetY;
      }
      //console.log("Dragged", draggableX.value, draggableY.value)
    })
    .onEnd(() => {
      isDragged.value = false;
      if (!movingBack.value) {
        draggableX.value = withTiming(0, {}, finished => {
          if (finished) {
            console.log('Dragged (finished)', draggableX.value, draggableY.value);
            if (onEnd) runOnJS(onEnd as any)();
          }
        });
        draggableY.value = withTiming(initialOffsetY);
      }
    });
  // console.log("DraggableBoxCard", index, name);

  const styles = StyleSheet.create({
    itemBox: {
      position: 'absolute',
      width: '100%',
      height: 150,
      backgroundColor: '#faf8b4',
      borderRadius: 20,
      paddingVertical: 5,
      paddingHorizontal: 15,
      borderWidth: 1,
      borderColor: '#dd8',
      justifyContent: 'center',
      shadowColor: '#171717',
      shadowOffset: { width: -2, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 5,
    },
  });

  if (!draggable) {
    return (
      <Animated.View style={[styles.itemBox, draggableAnimatedStyle]}>{children}</Animated.View>
    );
  }

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.itemBox, draggableAnimatedStyle]}>{children}</Animated.View>
    </GestureDetector>
  );
};

export default DraggableBoxCard;
