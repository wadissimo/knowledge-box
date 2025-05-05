import { Slot, Stack, Tabs, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { Suspense, useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import 'react-native-reanimated';

import { SQLiteProvider } from 'expo-sqlite';
import { Text, useColorScheme } from 'react-native';

import { DATABASE_NAME, useDatabaseFromAsset } from '@/src/hooks/useDatabaseFromAsset';
import { ThemeProvider } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { darkTheme, lightTheme } from '@/src/hooks/useAppTheme';
import { MenuProvider } from 'react-native-popup-menu';
import { migrateDbIfNeeded } from '@/src/data/DbUtils';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [database, dbLoaded] = useDatabaseFromAsset();
  const currentTheme = lightTheme;

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);
  if (!fontsLoaded || !dbLoaded || !database) {
    return null;
  }

  return (
    <GestureHandlerRootView>
      <ThemeProvider value={currentTheme}>
        <MenuProvider>
          <Suspense fallback={<Text>Loading...</Text>}>
            <SQLiteProvider
              databaseName={DATABASE_NAME}
              useSuspense={true}
              onInit={migrateDbIfNeeded}
              // assetSource={{ assetId: require("@/assets/userdata.db") }}
            >
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              </Stack>
            </SQLiteProvider>
          </Suspense>
        </MenuProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
