import { Slot, Stack, Tabs, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { Suspense, useEffect, useState } from "react";
import { useFonts } from "expo-font";
import "react-native-reanimated";

import { SQLiteProvider } from "expo-sqlite";
import { Text, useColorScheme } from "react-native";
import { CollectionProvider } from "@/src/context/DatabaseContext";
import {
  DATABASE_NAME,
  useDatabaseFromAsset,
} from "@/src/hooks/useDatabaseFromAsset";
import {
  DefaultTheme,
  NavigationContainer,
  ThemeProvider,
  useTheme,
} from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Colors } from "@/src/constants/Colors";
import { darkTheme, lightTheme } from "@/src/hooks/useAppTheme";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const [database, dbLoaded] = useDatabaseFromAsset();
  const currentTheme = useColorScheme() === "dark" ? darkTheme : lightTheme;

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
        <Suspense fallback={<Text>Loading...</Text>}>
          <SQLiteProvider
            databaseName={DATABASE_NAME}
            useSuspense={true}
            // assetSource={{ assetId: require("@/assets/userdata.db") }}
          >
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
          </SQLiteProvider>
        </Suspense>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
