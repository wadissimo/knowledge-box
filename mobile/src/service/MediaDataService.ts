import { useBoxCollectionModel } from '@/src/data/BoxCollectionModel';
import { Card, useCardModel } from '@/src/data/CardModel';
import { Collection, useCollectionModel } from '@/src/data/CollectionModel';
import { SoundData, useSoundModel } from '@/src/data/SoundModel';
import * as SQLite from 'expo-sqlite';
import { useEffect, useState } from 'react';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';
import { ImageData, useImageModel } from '@/src/data/ImageModel';

const getMediaUriByName = (name: string) => {
  return FileSystem.documentDirectory + name;
};

async function ensureDirExists() {
  var isError = false;

  try {
    const dir = getMediaUriByName('media/');
    var { exists } = await FileSystem.getInfoAsync(dir);
    if (!exists) {
      console.log('Creating media directories', dir);
      await FileSystem.makeDirectoryAsync(dir);
    } else {
      console.log('Media dirs exist', dir);
    }
  } catch (error) {
    console.error(`Error creating media directory `, error);
    isError = true;
  }
  try {
    const dir = getMediaUriByName('media/sounds/');
    var { exists } = await FileSystem.getInfoAsync(dir);
    if (!exists) {
      console.log('Creating media directories', dir);

      await FileSystem.makeDirectoryAsync(dir);
    } else {
      console.log('Sound dirs exist', dir);
    }
  } catch (error) {
    console.error(`Error creating sound directory `, error);
    isError = true;
  }
  try {
    const imgDir = getMediaUriByName('media/images/');
    var { exists } = await FileSystem.getInfoAsync(imgDir);
    if (!exists) {
      console.log('Creating media directories', imgDir);

      await FileSystem.makeDirectoryAsync(imgDir);
    } else {
      console.log('Image dirs exist', imgDir);
    }
  } catch (error) {
    console.error(`Error creating sound directory `, error);
    isError = true;
  }
  if (isError) {
    throw new Error("Can't create directories");
  }
}

export default function useMediaDataService() {
  const { newSound } = useSoundModel();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { newSoundWithId, getSoundById, updateSound } = useSoundModel();
  const { getImageById, newImageWithId, newImage, updateImage } = useImageModel();
  const [initialized, setInitialized] = useState<boolean>(false);
  const db = SQLite.useSQLiteContext();
  const [sound, setSound] = useState<Audio.Sound>();

  useEffect(() => {
    if (!initialized) {
      console.log('Init Media Service');
      ensureDirExists().then(() => setInitialized(true));
    }
  }, []);

  useEffect(() => {
    return sound
      ? () => {
          console.log('Unloading Sound');
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  async function downloadSound(globalSoundId: number, targetFileName: string): Promise<void> {
    console.log('downloadSound', globalSoundId);
    setError(null);
    setLoading(true);
    try {
      const URL = process.env.EXPO_PUBLIC_API_URL + '/sounds/download/' + globalSoundId;
      console.log('downloadSound URL', URL);
      const response = await fetch(URL);
      if (response.ok) {
        const fileBlob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64data = reader.result as string;
          const fileUri = getMediaUriByName(targetFileName);
          // Write the base64 string to the local file system
          await FileSystem.writeAsStringAsync(fileUri, base64data.split(',')[1], {
            encoding: FileSystem.EncodingType.Base64,
          });

          console.log(`Downloaded and saved ${fileUri}`);
        };
        reader.readAsDataURL(fileBlob);
      } else {
        throw Error('server response is not ok');
      }
    } catch (error) {
      console.error(`Error downloading soundId ${globalSoundId}:`, error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(true);
    }
  }

  async function downloadImage(
    globalImageId: number,
    targetFileName: string
  ): Promise<string | null> {
    console.log('downloadImage', globalImageId);
    setError(null);
    setLoading(true);
    try {
      const URL = process.env.EXPO_PUBLIC_API_URL + '/images/download/' + globalImageId;

      const response = await fetch(URL);
      if (response.ok) {
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = 'unknown';

        // Parse filename from Content-Disposition header
        if (contentDisposition) {
          const match = contentDisposition.match(/filename="(.+)"/);
          if (match && match.length > 1) {
            filename = match[1]; // Get the filename
          }
        }
        console.log('filename', filename);

        // Extract the file extension
        const fileExtension = filename.split('.').pop();

        if (fileExtension) targetFileName += '.' + fileExtension;

        const fileBlob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64data = reader.result as string;
          const fileUri = getMediaUriByName(targetFileName);
          // Write the base64 string to the local file system
          await FileSystem.writeAsStringAsync(fileUri, base64data.split(',')[1], {
            encoding: FileSystem.EncodingType.Base64,
          });

          console.log(`Downloaded and saved ${fileUri}`);
        };
        reader.readAsDataURL(fileBlob);

        return targetFileName;
      } else {
        throw Error('server response is not ok');
      }
    } catch (error) {
      console.error(`Error downloading globalImageId ${globalImageId}:`, error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(true);
    }
    return null;
  }

  const newImageFromLocalUri = async (localUri: string): Promise<ImageData | null> => {
    var res: ImageData | null = null;
    await db.withTransactionAsync(async () => {
      const imageId = await newImage('');
      const filePath = `media/images/${imageId}`;
      const imgDir = getMediaUriByName(filePath);
      // console.log("imgDir", imgDir);
      await FileSystem.copyAsync({
        from: localUri,
        to: imgDir,
      });
      const image: ImageData = {
        id: imageId,
        file: filePath,
        ref: localUri,
        comment: null,
      };
      await updateImage(image);
      res = image;
    });

    return res;
  };

  const newSoundFromLocalUri = async (localUri: string): Promise<SoundData | null> => {
    var res: SoundData | null = null;
    await db.withTransactionAsync(async () => {
      const soundId = await newSound('');
      const filePath = `media/sounds/${soundId}`;
      const soundDir = getMediaUriByName(filePath);
      // console.log("soundDir", soundDir);
      await FileSystem.copyAsync({
        from: localUri,
        to: soundDir,
      });
      const sound: SoundData = {
        id: soundId,
        file: filePath,
        ref: localUri,
        comment: null,
      };
      await updateSound(sound);
      res = sound;
    });

    return res;
  };

  const getImageSource = async (imageId: number): Promise<string | null> => {
    const imageData = await getImageById(imageId);

    var fileName: string | null = imageData ? imageData.file : null;
    if (fileName !== null) {
      const fileExists = await FileSystem.getInfoAsync(getMediaUriByName(fileName));
      if (!fileExists.exists) {
        console.error('MediaDataService.getImageSource: file does not exist', fileName);
        fileName = null;
      }
    }
    if (fileName === null) {
      if (imageId < 0) {
        fileName = await downloadImage(-imageId, `media/images/${imageId}`);
        console.log('MediaDataService.getImageSource: fileName downloaded', fileName);
        if (fileName !== null) {
          if (imageData) {
            await newImageWithId(imageId, fileName, null, null);
          } else {
            await updateImage({
              id: imageId,
              file: fileName,
              ref: null,
              comment: null,
            });
          }
        }
      } else {
        console.error('MediaDataService.getImageSource: wrong imageId', imageId);
        return null;
      }
    }
    if (fileName === null) {
      console.error(
        'MediaDataService.getImageSource: cant find media image. filename is null',
        imageId
      );
      return null;
    }

    return getMediaUriByName(fileName);
  };

  const getSoundSource = async (soundId: number): Promise<string | null> => {
    const soundData = await getSoundById(soundId);

    var fileName: string;
    if (!soundData) {
      if (soundId < 0) {
        console.log('sound missing, download');
        fileName = `media/sounds/${soundId}.mp3`; // "-" for global files
        await downloadSound(-soundId, fileName);
        await newSoundWithId(soundId, fileName, null, null);
      } else {
        console.error('cant find media sound', soundId);
        return null;
      }
    } else {
      fileName = soundData.file;
    }

    return getMediaUriByName(fileName);
  };

  const playSoundFromUri = async (uri: string) => {
    const { sound } = await Audio.Sound.createAsync({
      uri,
    });
    setSound(sound);
    console.log('Playing Sound ', uri);
    await sound.setVolumeAsync(1.0); // Set volume to max
    await sound.playAsync();
  };

  const attemptDownloadSound = async (
    soundId: number,
    existingSound: SoundData | null
  ): Promise<string | null> => {
    try {
      console.log('sound missing, download');
      const fileName = `media/sounds/${soundId}.mp3`; // "-" for global files
      await downloadSound(-soundId, fileName);
      if (existingSound) {
        await newSoundWithId(soundId, fileName, null, null);
      } else {
        await updateSound({
          id: soundId,
          file: fileName,
          ref: null,
          comment: null,
        });
      }
      return fileName;
    } catch (error) {
      console.error('Error downloading sound', error);
      return null;
    }
  };
  const playSound = async (soundId: number) => {
    try {
      const soundData = await getSoundById(soundId);
      console.log('playSound', soundId, soundData);

      var fileName: string | null = null;
      if (!soundData) {
        if (soundId < 0) {
          console.log('MediaDataService.playSound: sound missing, download');
          fileName = await attemptDownloadSound(soundId, null);
        } else {
          console.error('MediaDataService.playSound: wrong soundId', soundId);
          return;
        }
      } else {
        fileName = soundData.file;
      }
      if (fileName === null) {
        console.error('MediaDataService.playSound: cant find media sound. empty fileName', soundId);
        return;
      }

      const fileExists = await FileSystem.getInfoAsync(getMediaUriByName(fileName));
      if (!fileExists.exists) {
        console.log(
          'MediaDataService.playSound: cant find media sound. file does not exist',
          soundId
        );
        fileName = await attemptDownloadSound(soundId, soundData);
        if (fileName === null) {
          console.error(
            'MediaDataService.playSound: Download attempt 2: failed. filename is null',
            soundId
          );
          return;
        } else {
          const fileExists = await FileSystem.getInfoAsync(getMediaUriByName(fileName));
          if (!fileExists.exists) {
            console.error(
              'MediaDataService.playSound: Download attempt 2: failed.  file does not exist',
              soundId
            );
            return;
          }
        }
      }

      const { sound } = await Audio.Sound.createAsync({
        uri: getMediaUriByName(fileName),
      });
      setSound(sound);
      // console.log('Playing Sound ', fileName);
      await sound.setVolumeAsync(1.0); // Set volume to max
      await sound.playAsync();
      //await sound.unloadAsync();
    } catch (error) {
      console.error('Error playing sound', error);
    }
  };

  return {
    loading,
    error,
    getMediaUriByName,
    playSound,
    playSoundFromUri,
    getSoundSource,
    getImageSource,
    newImageFromLocalUri,
    newSoundFromLocalUri,
  };
}
