import { useEffect, useState } from "react";
import * as FileSystem from "expo-file-system";
import { useAssets } from "expo-asset";
import * as SQLite from "expo-sqlite";

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
  // const result = await db.getFirstAsync<number>("SELECT count(*) FROM boxes");
  // console.log("result", result);
  // await db.closeAsync();
};

const FORCE_COPY_DATABASE = false; // TODO: Set True only to reimport initial database, wipes out all user data!
const DATABASE_NAME: string = "userdata.db";
const DATABASE_ASSET: string = "@/assets/userdata.db";

function useDatabaseFromAsset(): [string | null, boolean] {
  const [dbLoaded, setDbLoaded] = useState<boolean>(false);
  const [assets, error] = useAssets([require(DATABASE_ASSET)]);
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

export { useDatabaseFromAsset, DATABASE_NAME };
