import { View, Text, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { Button } from "react-native";
import { useTheme } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet } from "react-native";
import { Collection, useCollectionModel } from "@/data/CollectionModel";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import * as FileSystem from "expo-file-system";
import { Audio } from "expo-av";
import { Sound } from "expo-av/build/Audio";
import { Asset, useAssets } from "expo-asset";

const copyTestAssetAsync = async (asset: Asset) => {
  const targetName = `test_${asset.name}.${asset.type}`;

  if (!asset.localUri) return;
  const targetDir = FileSystem.documentDirectory + "media/" + targetName;
  console.log("targetDir", targetDir);
  // Check if the database already exists in the document directory
  const { exists } = await FileSystem.getInfoAsync(targetDir);

  if (!exists || FORCE_COPY_TEST_ASSET) {
    console.log("file doesn't exist: copy");
    // console.log("src", assetDbName);
    // console.log("dist", dbDir);

    await FileSystem.copyAsync({
      from: asset.localUri,
      to: targetDir,
    });
  } else {
    console.log("database already exists: ignore");
  }
  return targetDir;
};

const getTestAssetUri = (asset: Asset) => {
  const targetName = `test_${asset.name}.${asset.type}`;
  const targetDir = FileSystem.documentDirectory + "media/" + targetName;
  return targetDir;
};

const getMediaUriByName = (name: string) => {
  return FileSystem.documentDirectory + "media/" + name;
};
const FORCE_COPY_TEST_ASSET = false;

const CollectionView = () => {
  const { colors } = useTheme();
  const { collectionId } = useLocalSearchParams();
  const { getCollectionById } = useCollectionModel();
  const [collection, setCollection] = useState<Collection | null>(null);
  const router = useRouter();

  const [sound, setSound] = useState<Sound>();
  const [assets, error] = useAssets([
    require("@/assets/voices/fr-FR-Standard-A.mp3"),
    require("@/assets/voices/fr-FR-Standard-A.wav"),
  ]);

  useEffect(() => {
    async function setup() {
      if (assets && assets.length === 2) {
        await copyTestAssetAsync(assets[0]);
        await copyTestAssetAsync(assets[1]);
      }
    }
    setup();
  }, [assets]);

  useEffect(() => {
    return sound
      ? () => {
          console.log("Unloading Sound");
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  useEffect(() => {
    if (collectionId) {
      getCollectionById(Number(collectionId)).then((col) => setCollection(col));
    }
  }, [collectionId]);

  function handleManageCollectionPress() {
    router.push(`/(tabs)/box/manage-collection/${collectionId}/manage`);
  }
  function handleTrainPress() {
    router.push(`/(tabs)/box/manage-collection/${collectionId}/train`);
  }
  async function playSound(soundName: string) {
    console.log("Loading Sound");
    //sound.loadAsync({ uri: Expo.FileSystem.documentDirectory+filename })

    const { sound } = await Audio.Sound.createAsync({
      uri: getMediaUriByName(soundName),
    });
    //require("@/assets/voices/fr-FR-Neural2-A.wav")
    //require(`@/assets/voices/${soundName}`)
    //require("@/assets/voices/fr-FR-Standard-B.mp3")

    setSound(sound);

    console.log("Playing Sound");
    await sound.playAsync();
  }
  function handlePlay(soundName: string) {
    playSound(soundName);
  }
  if (collection === null) return null;
  return (
    <View style={styles.container}>
      <View style={styles.colNameContainer}>
        <Text style={styles.colNameTxt}>{collection.name}</Text>
      </View>
      <View style={styles.trainBtnContainer}>
        <Text>Train Stats:</Text>
        <Button
          title="Train"
          color={colors.primary}
          onPress={handleTrainPress}
        />
      </View>
      <View>
        <TouchableOpacity
          onPress={() => handlePlay("test_fr-FR-Standard-A.mp3")}
        >
          <Icon name="play-circle-outline" size={42} color="black" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handlePlay("test_fr-FR-Standard-A.wav")}
        >
          <Icon name="play-circle-outline" size={42} color="black" />
        </TouchableOpacity>
      </View>
      <View style={styles.mngBtnContainer}>
        <Button
          title="Manage Collection"
          color={colors.primary}
          onPress={handleManageCollectionPress}
        />
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
  },
  colNameContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#c2fbc4",
  },
  colNameTxt: {
    fontWeight: "bold",
    fontSize: 24,
  },
  trainBtnContainer: {
    flex: 1,
    justifyContent: "center",
    margin: 5,
  },
  mngBtnContainer: {
    margin: 5,
  },
});

export default CollectionView;
