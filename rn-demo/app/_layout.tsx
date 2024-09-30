import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { Suspense, useEffect } from "react";
import { useFonts } from "expo-font";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import { SQLiteProvider } from "expo-sqlite";
import { Text } from "react-native";
import { CollectionProvider } from "@/context/DatabaseContext";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <Suspense fallback={<Text>Loading...</Text>}>
      <SQLiteProvider databaseName="cards.db" useSuspense={true}>
        <CollectionProvider>
          <ThemeProvider
            value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
          >
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen
                name="manage-collection/[collectionId]/index"
                options={{
                  headerShown: true,
                  //headerBackTitle: "Manage Collection",
                  title: "Manage Collection",
                }}
              />
              <Stack.Screen
                name="manage-collection/[collectionId]/[cardId]"
                options={{
                  headerShown: true,
                  //headerBackTitle: "Edit Collection",
                  title: "Edit Card",
                }}
              />
              {/* <Stack.Screen
          name="manage-collection/addcard"
          options={{ headerShown: true, title: "Add Card" }}
        /> */}
            </Stack>
          </ThemeProvider>
        </CollectionProvider>
      </SQLiteProvider>
    </Suspense>
  );
}
