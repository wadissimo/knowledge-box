import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useHeaderHeight } from '@react-navigation/elements';
import { Link } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Button, Dimensions, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Testing = () => {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight(); // Only works inside a screen
  const headerHeight = useHeaderHeight();

  const [measuredContentHeight, setMeasuredContentHeight] = useState<number>(0);

  const availableHeight =
    Dimensions.get('window').height - headerHeight - tabBarHeight - (StatusBar.currentHeight ?? 0);

  console.log('Testing Dimensions.get(screen).height', Dimensions.get('screen').height);
  console.log('Testing Dimensions.get(window).height', Dimensions.get('window').height);
  console.log('Testing headerHeight', headerHeight);
  console.log('Testing tabBarHeight', tabBarHeight);
  console.log('Testing StatusBar.currentHeight', StatusBar.currentHeight);
  console.log('Testing insets', insets);
  const handleLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    setMeasuredContentHeight(height);
    console.log('Actual Measured Content Height:', height);
  };

  return (
    <View
      style={{ padding: 20, height: '100%', backgroundColor: 'orangered' }}
      onLayout={handleLayout}
    >
      <Link href="/(tabs)/box/1/notes/edit/new">Add new note</Link>
      <Link href="/(tabs)/box/1/notes/edit/1">Edit note 1</Link>
      <Link href="/(tabs)/box/1/notes/edit/2">Edit note 2</Link>
      <Link href="/(tabs)/box/1/notes/edit/3">Edit note 3</Link>
    </View>
  );
};

export default Testing;
