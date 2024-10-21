import { useBoxCollectionModel } from "@/src/data/BoxCollectionModel";
import { Card, useCardModel } from "@/src/data/CardModel";
import { Collection, useCollectionModel } from "@/src/data/CollectionModel";
import { SoundData, useSoundModel } from "@/src/data/SoundModel";
import * as SQLite from "expo-sqlite";
import { useEffect, useState } from "react";
import * as FileSystem from "expo-file-system";
import { Audio } from "expo-av";
import { useImageModel } from "@/src/data/ImageModel";

const getMediaUriByName = (name: string) => {
  return FileSystem.documentDirectory + name;
};

async function ensureDirExists() {
  const dir = getMediaUriByName("media/sounds/");
  var { exists } = await FileSystem.getInfoAsync(dir);
  if (!exists) {
    console.log("Creating media directories", dir);

    await FileSystem.makeDirectoryAsync(dir);
  } else {
    console.log("Sound dirs exist", dir);
  }

  const imgDir = getMediaUriByName("media/images/");
  var { exists } = await FileSystem.getInfoAsync(imgDir);
  if (!exists) {
    console.log("Creating media directories", imgDir);

    await FileSystem.makeDirectoryAsync(imgDir);
  } else {
    console.log("Image dirs exist", imgDir);
  }
}

export default function useMediaDataService() {
  const { newSound } = useSoundModel();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { newSoundWithId, getSoundById, updateSound } = useSoundModel();
  const { getImageById, newImageWithId } = useImageModel();
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

  async function downloadImage(
    globalImageId: number,
    targetFileName: string
  ): Promise<string | null> {
    console.log("downloadImage", globalImageId);
    setError(null);
    setLoading(true);
    try {
      const URL =
        process.env.EXPO_PUBLIC_API_URL + "images/download/" + globalImageId;

      const response = await fetch(URL);
      if (response.ok) {
        const contentDisposition = response.headers.get("Content-Disposition");
        let filename = "unknown";

        // Parse filename from Content-Disposition header
        if (contentDisposition) {
          const match = contentDisposition.match(/filename="(.+)"/);
          if (match && match.length > 1) {
            filename = match[1]; // Get the filename
          }
        }
        console.log("filename", filename);

        // Extract the file extension
        const fileExtension = filename.split(".").pop();

        if (fileExtension) targetFileName += "." + fileExtension;

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

        return targetFileName;
      } else {
        throw Error("server response is not ok");
      }
    } catch (error) {
      console.error(`Error downloading globalImageId ${globalImageId}:`, error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(true);
    }
    return null;
  }

  //   const importGlobalImageIfNotExists = async (
  //     globalImageId: number
  //   ): Promise<number> => {
  //     const newImageId = -globalImageId;
  //     const imageData = await getImageById(newImageId);
  //     if (imageData === null) {
  //       const fileName = `media/images/-${globalImageId}`; // "-" for global files
  //       await downloadImage(globalImageId, fileName);
  //       await newImageWithId(newImageId, fileName, null, null);
  //     } else {
  //       //console.log("sound data exists", soundData);
  //     }
  //     return newImageId;
  //   };

  const getImageSource = async (imageId: number): Promise<string | null> => {
    const imageData = await getImageById(imageId);

    var fileName: string | null;
    if (!imageData) {
      if (imageId < 0) {
        console.log("image missing, download");
        fileName = `media/images/${imageId}`; // "-" for global files
        fileName = await downloadImage(-imageId, fileName);
        console.log("fileName downloaded", fileName);
        if (fileName === null) return null;
        await newImageWithId(imageId, fileName, null, null);
      } else {
        console.error("cant find media image", imageId);
        return null;
      }
    } else {
      fileName = imageData.file;
    }

    return getMediaUriByName(fileName);
  };

  //   const importGlobalSoundIfNotExists = async (
  //     globalSoundId: number
  //   ): Promise<number> => {
  //     const newSoundId = -globalSoundId;
  //     const soundData = await getSoundById(newSoundId);
  //     if (soundData === null) {
  //       const fileName = `media/sounds/-${globalSoundId}.mp3`; // "-" for global files
  //       await downloadSound(globalSoundId, fileName);
  //       await newSoundWithId(newSoundId, fileName, null, null);
  //     } else {
  //       //console.log("sound data exists", soundData);
  //     }
  //     return newSoundId;
  //   };

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

    // importGlobalSoundIfNotExists,
    playSound,
    // importGlobalImageIfNotExists,
    getImageSource,
  };
}
