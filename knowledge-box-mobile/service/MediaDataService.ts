import { useBoxCollectionModel } from "@/data/BoxCollectionModel";
import { Card, useCardModel } from "@/data/CardModel";
import { Collection, useCollectionModel } from "@/data/CollectionModel";
import { SoundData, useSoundModel } from "@/data/SoundModel";
import * as SQLite from "expo-sqlite";
import { useState } from "react";
import * as FileSystem from "expo-file-system";

const getMediaUriByName = (name: string) => {
  return FileSystem.documentDirectory + "media/" + name;
};

export default function useMediaDataService() {
  const { newSound } = useSoundModel();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  //const db = SQLite.useSQLiteContext();

  async function downloadSound(soundId: number): Promise<void> {
    console.log("downloadSound", soundId);
    setError(null);
    setLoading(true);
    try {
      const URL =
        process.env.EXPO_PUBLIC_API_URL + "sounds/download/" + soundId;

      const response = await fetch(URL);
      if (response.ok) {
        const fileBlob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64data = reader.result as string;
          const fileUri = getMediaUriByName(`${soundId}.mp3`);
          // Write the base64 string to the local file system
          await FileSystem.writeAsStringAsync(
            fileUri,
            base64data.split(",")[1],
            {
              encoding: FileSystem.EncodingType.Base64,
            }
          );

          console.log(`Downloaded and saved ${fileUri}`);
        };
        reader.readAsDataURL(fileBlob);
      }
    } catch (error) {
      console.error(`Error downloading soundId ${soundId}:`, error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(true);
    }
  }

  return {
    loading,
    error,
    downloadSound,
  };
}
