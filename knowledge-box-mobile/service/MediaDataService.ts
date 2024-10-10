import { useBoxCollectionModel } from "@/data/BoxCollectionModel";
import { Card, useCardModel } from "@/data/CardModel";
import { Collection, useCollectionModel } from "@/data/CollectionModel";
import { SoundData, useSoundModel } from "@/data/SoundModel";
import * as SQLite from "expo-sqlite";
import { useEffect, useState } from "react";
import * as FileSystem from "expo-file-system";
import { Audio } from "expo-av";

const getMediaUriByName = (name: string) => {
  return FileSystem.documentDirectory + name;
};

async function ensureDirExists() {
  const dir = getMediaUriByName("media/sounds/");
  const { exists } = await FileSystem.getInfoAsync(dir);
  if (!exists) {
    console.log("Creating media directories", dir);

    await FileSystem.makeDirectoryAsync(dir);
  } else {
    console.log("Media dirs exist", dir);
  }
}

export default function useMediaDataService() {
  const { newSound } = useSoundModel();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { newSoundWithId, getSoundById, updateSound } = useSoundModel();
  const [initialized, setInitialized] = useState<boolean>(false);
  //const db = SQLite.useSQLiteContext();
  const [sound, setSound] = useState<Audio.Sound>();

  useEffect(() => {
    if (!initialized) {
      console.log("Init Media Service");
      ensureDirExists().then(() => setInitialized(true));
    }
  }, []);

  useEffect(() => {
    return sound
      ? () => {
          console.log("Unloading Sound");
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  async function downloadSound(
    globalSoundId: number,
    targetFileName: string
  ): Promise<void> {
    console.log("downloadSound", globalSoundId);
    setError(null);
    setLoading(true);
    try {
      const URL =
        process.env.EXPO_PUBLIC_API_URL + "sounds/download/" + globalSoundId;

      const response = await fetch(URL);
      if (response.ok) {
        const fileBlob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64data = reader.result as string;
          const fileUri = getMediaUriByName(targetFileName);
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
      } else {
        throw Error("server response is not ok");
      }
    } catch (error) {
      console.error(`Error downloading soundId ${globalSoundId}:`, error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(true);
    }
  }

  const importGlobalSoundIfNotExists = async (
    globalSoundId: number
  ): Promise<number> => {
    const newSoundId = -globalSoundId;
    const soundData = await getSoundById(newSoundId);
    if (soundData === null) {
      const fileName = `media/sounds/-${globalSoundId}.mp3`; // "-" for global files
      await downloadSound(globalSoundId, fileName);
      await newSoundWithId(newSoundId, fileName, null, null);
    } else {
      //console.log("sound data exists", soundData);
    }
    return newSoundId;
  };

  const playSound = async (soundId: number) => {
    const soundData = await getSoundById(soundId);

    var fileName: string;
    if (!soundData) {
      if (soundId < 0) {
        console.log("sound missing, download");
        fileName = `media/sounds/${soundId}.mp3`; // "-" for global files
        await downloadSound(-soundId, fileName);
        await newSoundWithId(soundId, fileName, null, null);
      } else {
        console.error("cant find media sound", soundId);
        return;
      }
    } else {
      fileName = soundData.file;
    }

    const { sound } = await Audio.Sound.createAsync({
      uri: getMediaUriByName(fileName),
    });
    setSound(sound);
    console.log("Playing Sound ", fileName);
    await sound.playAsync();
    //await sound.unloadAsync();
  };

  return {
    loading,
    error,

    importGlobalSoundIfNotExists,
    playSound,
  };
}
