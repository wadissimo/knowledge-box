import { useEffect, useState } from "react";
import * as FileSystem from "expo-file-system";
import { useAssets } from "expo-asset";
import { Asset } from "expo-asset";

const copyDatabaseAsync = async (assetModule: number, dbName: string) => {
  const dbDir = FileSystem.documentDirectory + "SQLite/";
  const destPath = dbDir + dbName;

  // Check if the database already exists in the document directory
  const { exists } = await FileSystem.getInfoAsync(destPath);

  if (!exists || FORCE_COPY_DATABASE) {
    console.log("Database doesn't exist, copying from bundle...");

    // Make sure target dir exists
    await FileSystem.makeDirectoryAsync(dbDir, { intermediates: true });

    // Load and download asset
    const asset = Asset.fromModule(assetModule);
    await asset.downloadAsync();

    console.log("Asset downloaded:", asset.localUri);

    // Copy to SQLite directory
    await FileSystem.copyAsync({
      from: asset.localUri!,
      to: destPath,
    });

    console.log("Database copied to:", destPath);
  } else {
    console.log("Database already exists, skipping copy.");
  }
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
        await copyDatabaseAsync(require(DATABASE_ASSET), DATABASE_NAME);

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
