import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { Suspense, useEffect, useState } from "react";
import { useFonts } from "expo-font";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import { SQLiteProvider } from "expo-sqlite";
import { Text } from "react-native";
import { CollectionProvider } from "@/context/DatabaseContext";
import * as FileSystem from "expo-file-system";
import { useAssets } from "expo-asset";
import * as SQLite from "expo-sqlite";

SplashScreen.preventAutoHideAsync();

const copyDatabaseAsync = async (assetDbName: string, dbName: string) => {
  const dbDir = FileSystem.documentDirectory + "SQLite/" + dbName;

  // Check if the database already exists in the document directory
  const { exists } = await FileSystem.getInfoAsync(dbDir);

  if (!exists || FORCE_COPY_DATABASE) {
    console.log("database doesn't exist: copy");
    // console.log("src", assetDbName);
    // console.log("dist", dbDir);

    // Copy the database from assets to document directory
    await FileSystem.copyAsync({
      from: assetDbName,
      to: dbDir,
    });
  } else {
    console.log("database already exists: ignore");
  }

  // console.log("dbDir", dbDir);
  // const db = await SQLite.openDatabaseAsync("userdata.db");
  // console.log("dbopen successful");
  // const result = await db.getFirstAsync<number>(
  //   "SELECT count(*) FROM collections"
  // );
  // console.log("result", result);
  // await db.closeAsync();
};

const FORCE_COPY_DATABASE = false; // TODO: Set True only to reimport initial database, wipes out all user data!
const DATABASE_NAME: string = "userdata.db";

function useDatabaseFromAsset(): [string | null, boolean] {
  const [dbLoaded, setDbLoaded] = useState<boolean>(false);
  const [assets, error] = useAssets([require("@/assets/userdata.db")]);
  const [database, setDatabase] = useState<string | null>(null);

  useEffect(() => {
    async function initDb(dbAssetUri: string) {
      if (!dbLoaded) {
        await copyDatabaseAsync(dbAssetUri, DATABASE_NAME);

        setDbLoaded(true);
        setDatabase(DATABASE_NAME);
      }
    }
    if (assets && assets[0].localUri) {
      console.log("initDb from ", assets[0].localUri);
      initDb(assets[0].localUri);
    }
  }, [assets]);
  return [database, dbLoaded];
}
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const [database, dbLoaded] = useDatabaseFromAsset();

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded || !dbLoaded || !database) {
    return null;
  }

  console.log("database", database);
  return (
    <Suspense fallback={<Text>Loading...</Text>}>
      <SQLiteProvider
        databaseName={DATABASE_NAME}
        useSuspense={true}
        // assetSource={{ assetId: require("@/assets/userdata.db") }}
      >
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
              <Stack.Screen
                name="manage-collection/[collectionId]/train"
                options={{
                  headerShown: true,
                  //headerBackTitle: "Edit Collection",
                  title: "Training",
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
