import { Slot, Stack, Tabs, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { Suspense, useEffect, useState } from "react";
import { useFonts } from "expo-font";
import "react-native-reanimated";

import { SQLiteProvider } from "expo-sqlite";
import { Text } from "react-native";
import { CollectionProvider } from "@/context/DatabaseContext";
import {
  DATABASE_NAME,
  useDatabaseFromAsset,
} from "@/hooks/useDatabaseFromAsset";
import {
  DefaultTheme,
  NavigationContainer,
  ThemeProvider,
  useTheme,
} from "@react-navigation/native";

const MyCustomTheme = {
  ...DefaultTheme, // or DarkTheme
  colors: {
    ...DefaultTheme.colors,
    primary: "#1da422", // primary button , header background
    background: "#ddd", // screen background
    text: "black",
    card: "#c2fbc4", // cards default background
    //card: "white",
    border: "gray",
    notification: "black",
  },
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const [database, dbLoaded] = useDatabaseFromAsset();

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);
  if (!fontsLoaded || !dbLoaded || !database) {
    return null;
  }

  return (
    <ThemeProvider value={MyCustomTheme}>
      <Suspense fallback={<Text>Loading...</Text>}>
        <SQLiteProvider
          databaseName={DATABASE_NAME}
          useSuspense={true}
          // assetSource={{ assetId: require("@/assets/userdata.db") }}
        >
          <CollectionProvider>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
          </CollectionProvider>
        </SQLiteProvider>
      </Suspense>
    </ThemeProvider>
  );
}
