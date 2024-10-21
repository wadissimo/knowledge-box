import { useEffect, useState } from "react";
import * as FileSystem from "expo-file-system";
import { useAssets } from "expo-asset";
import * as SQLite from "expo-sqlite";

const copyDatabaseAsync = async (assetDbName: string, dbName: string) => {
  const dbDir = FileSystem.documentDirectory + "SQLite/" + dbName;

  // Check if the database already exists in the document directory
  const { exists } = await FileSystem.getInfoAsync(dbDir);

  if (!exists) {
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
};

const COPY_TEST_ASSET = false;

function useLocalAudio(): [string | null, boolean] {
  return [null, false];
}

export { useLocalAudio };
