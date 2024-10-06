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
} from "../../knowledge-box-mobile/hooks/useDatabaseFromAsset";

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
          {/* <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen
              name="collections"
              options={{ headerShown: true, title: "Collections" }}
            />
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
            <Stack.Screen
              name="manage-collection/[collectionId]/train"
              options={{
                headerShown: true,
                //headerBackTitle: "Edit Collection",
                title: "Training",
              }}
            />
            <Stack.Screen
              name="newBox"
              options={{
                headerShown: true,
                //headerBackTitle: "Edit Collection",
                title: "New Box",
              }}
            />
            <Stack.Screen
              name="box/[boxId]/index"
              options={{
                headerShown: true,
                //headerBackTitle: "Edit Collection",
                title: "Box",
              }}
            />
            <Stack.Screen
              name="box/[boxId]/collections/new"
              options={{
                headerShown: true,
                //headerBackTitle: "Edit Collection",
                title: "New Collection",
              }}
            />

           
          </Stack> */}
        </CollectionProvider>
      </SQLiteProvider>
    </Suspense>
  );
}
