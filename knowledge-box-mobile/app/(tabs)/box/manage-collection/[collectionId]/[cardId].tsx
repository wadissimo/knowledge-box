import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Image,
} from "react-native";
import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";

import { Card, useCardModel } from "@/src/data/CardModel";

import useMediaDataService from "@/src/service/MediaDataService";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { i18n } from "@/src/lib/i18n";
import { useAppTheme } from "@/src/hooks/useAppTheme";
import * as ImagePicker from "expo-image-picker";
import { useImageModel } from "@/src/data/ImageModel";
import LocalImage from "@/src/components/utils/LocalImage";
import * as DocumentPicker from "expo-document-picker";

const EditFlashcard = () => {
  const router = useRouter();
  const { colors } = useAppTheme();

  const { collectionId, cardId } = useLocalSearchParams();

  const { getCardById, newCard, updateCardFrontBack, updateCard } =
    useCardModel();

  const navigation = useNavigation();
  const { getImageById } = useImageModel();
  const {
    loading,
    newImageFromLocalUri,
    newSoundFromLocalUri,
    getImageSource,
    getSoundSource,
    playSoundFromUri,
  } = useMediaDataService();

  const [updateImgFront, setUpdateImgFront] = useState<boolean>(false);
  const [updateImgBack, setUpdateImgBack] = useState<boolean>(false);
  const [updateSoundFront, setUpdateSoundFront] = useState<boolean>(false);
  const [updateSoundBack, setUpdateSoundBack] = useState<boolean>(false);

  const [imageUriFront, setImageUriFront] = useState<string | null>(null);
  const [imageUriBack, setImageUriBack] = useState<string | null>(null);
  const [soundUriFront, setSoundUriFront] = useState<string | null>(null);
  const [soundUriBack, setSoundUriBack] = useState<string | null>(null);

  // const [uplImgUriFront, setUplImgUriFront] = useState<string | null>(null);
  // const [uplImgUriBack, setUplImgUriBack] = useState<string | null>(null);
  // const [cardImgUriFront, setCardImgUriFront] = useState<string | null>(null);
  // const [cardImgUriBack, setCardImgUriBack] = useState<string | null>(null);

  // const [uplSoundUriFront, setUplSoundUriFront] = useState<string | null>(null);
  // const [uplSoundUriBack, setUplSoundUriBack] = useState<string | null>(null);
  // const [cardSoundUriFront, setCardSoundUriFront] = useState<string | null>(
  //   null
  // );
  // const [cardSoundUriBack, setCardSoundUriBack] = useState<string | null>(null);

  const [selectedTab, setSelectedTab] = useState<string>("front");
  // Media
  const [card, setCard] = useState<Partial<Card> | null>(null);

  async function handlePlaySound(soundUri: string) {
    playSoundFromUri(soundUri);
  }
  useEffect(() => {
    async function fetchCards() {
      if (cardId === "new") {
        navigation.setOptions({
          title: i18n.t("cards.newCardTitle"),
        });
        setCard({
          front: "",
          back: "",
        });
      } else {
        const card = await getCardById(Number(cardId));
        if (card === null) throw Error("Can't find a card:" + cardId);

        setCard(card);
        if (card.frontImg !== null) {
          setImageUriFront(await getImageSource(card.frontImg));
        }
        if (card.backImg !== null) {
          setImageUriBack(await getImageSource(card.backImg));
        }
        if (card.frontSound !== null) {
          setSoundUriFront(await getSoundSource(card.frontSound));
        }
        if (card.backSound !== null) {
          setSoundUriBack(await getSoundSource(card.backSound));
        }
        setUpdateImgFront(false);
        setUpdateImgBack(false);
        setUpdateSoundFront(false);
        setUpdateSoundBack(false);

        navigation.setOptions({
          title: i18n.t("cards.editCardTitle"),
        });
      }
    }
    fetchCards();
  }, [collectionId, cardId]);

  const handleSave = async () => {
    if (card === null) return;
    // if (!card.front || !card.back) {
    //   Alert.alert(i18n.t("common.error"), i18n.t("cards.error.emptySides"));
    //   return;
    // }
    var dbCardId: number;
    if (cardId === "new") {
      const cardId = await newCard(
        Number(collectionId),
        card.front ?? "",
        card.back ?? ""
      );
      if (cardId === null) throw new Error("can't find card");
      dbCardId = cardId;
    } else {
      dbCardId = Number(cardId);
    }
    var updatedCard: Card | null = await getCardById(dbCardId);
    if (updatedCard !== null) {
      // update card props
      updatedCard = {
        ...updatedCard,
        ...card,
      };
      // update media
      // Image Front
      if (updateImgFront) {
        console.log("uploading front");
        if (imageUriFront !== null) {
          const imgData = await newImageFromLocalUri(imageUriFront);
          if (imgData === null) {
            throw new Error("error uploading image");
          }
          updatedCard.frontImg = imgData.id;
        } else {
          //TODO: clean up files
          updatedCard.frontImg = null;
        }
      }
      // Image Back
      if (updateImgBack) {
        console.log("uploading back");
        if (imageUriBack !== null) {
          const imgData = await newImageFromLocalUri(imageUriBack);
          if (imgData === null) {
            throw new Error("error uploading image");
          }
          updatedCard.frontImg = imgData.id;
        } else {
          //TODO: clean up files
          updatedCard.backImg = null;
        }
      }

      // Sound Front
      if (updateSoundFront) {
        if (soundUriFront !== null) {
          const soundData = await newSoundFromLocalUri(soundUriFront);
          if (soundData === null) {
            throw new Error("error uploading sound");
          }
          updatedCard.frontSound = soundData.id;
        } else {
          //TODO: clean up files
          updatedCard.frontSound = null;
        }
      }
      // Sound Back
      if (updateSoundBack) {
        if (soundUriBack !== null) {
          const soundData = await newSoundFromLocalUri(soundUriBack);
          if (soundData === null) {
            throw new Error("error uploading sound");
          }
          updatedCard.backSound = soundData.id;
        } else {
          //TODO: clean up files
          updatedCard.backSound = null;
        }
      }

      await updateCard(updatedCard);
    }
    router.back();
  };

  function updateUploadedImageFront(uri: string) {
    setImageUriFront(uri);
    setUpdateImgFront(true);
  }
  function updateUploadedImageBack(uri: string) {
    setImageUriBack(uri);
    setUpdateImgBack(true);
  }
  function updateUploadedSoundFront(uri: string) {
    setSoundUriFront(uri);
    setUpdateSoundFront(true);
  }
  function updateUploadedSoundBack(uri: string) {
    setSoundUriBack(uri);
    setUpdateSoundBack(true);
  }

  function handleSelectedTabClick(tab: string) {
    setSelectedTab(tab);
  }

  if (card === null) return null;
  return (
    // <KeyboardAwareScrollView style={styles.container} enableOnAndroid={true}>
    <KeyboardAvoidingView style={{ flex: 1 }}>
      {/* <ScrollView style={{ flex: 0.8 }}> */}
      <View style={[styles.topBar, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={[
            styles.topBarItem,
            {
              backgroundColor:
                selectedTab === "front" ? colors.primary : colors.card,
              borderTopRightRadius: 10,
            },
          ]}
          onPress={() => handleSelectedTabClick("front")}
        >
          <Text
            style={
              selectedTab === "front"
                ? {
                    color: colors.primaryText,
                    fontWeight: "bold",
                  }
                : {
                    color: colors.text,
                    fontWeight: "normal",
                  }
            }
          >
            {i18n.t("cards.frontSide")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.topBarItem,
            {
              backgroundColor:
                selectedTab === "back" ? colors.primary : colors.card,
              borderTopLeftRadius: 10,
            },
          ]}
          onPress={() => handleSelectedTabClick("back")}
        >
          <Text
            style={
              selectedTab === "back"
                ? {
                    color: colors.primaryText,
                    fontWeight: "bold",
                  }
                : {
                    color: colors.text,
                    fontWeight: "normal",
                  }
            }
          >
            {i18n.t("cards.backSide")}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={{ backgroundColor: colors.primary, height: 5 }}></View>
      {selectedTab === "front" && (
        <FrontBackEdit
          card={card}
          front={true}
          setCard={setCard}
          image={imageUriFront}
          setUploadedImage={updateUploadedImageFront}
          sound={soundUriFront}
          setUploadSound={updateUploadedSoundFront}
          playSound={handlePlaySound}
        />
      )}

      {selectedTab === "back" && (
        <FrontBackEdit
          card={card}
          front={false}
          setCard={setCard}
          image={imageUriBack}
          setUploadedImage={updateUploadedImageBack}
          sound={soundUriBack}
          setUploadSound={updateUploadedSoundBack}
          playSound={handlePlaySound}
        />
      )}

      {/* </ScrollView> */}

      <Button
        title={i18n.t("common.save")}
        onPress={handleSave}
        color={colors.primary}
      />
    </KeyboardAvoidingView>
  );
};

const FrontBackEdit = ({
  card,
  front,
  setCard,
  image,
  setUploadedImage,
  sound,
  setUploadSound,
  playSound,
}: {
  card: Partial<Card>;
  front: boolean;
  setCard: Function;
  image: string | null;
  setUploadedImage: Function;
  sound: string | null;
  setUploadSound: Function;
  playSound: Function;
}) => {
  const { colors } = useAppTheme();

  const textValue = front ? card.front : card.back;
  const setTextValue = (val: string) => {
    if (front) {
      setCard({
        ...card,
        front: val,
      });
    } else {
      setCard({
        ...card,
        back: val,
      });
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true, // aspect: [4, 3], quality: 1,
    });
    if (!result.canceled) {
      setUploadedImage(result.assets[0].uri);
      console.log("image selected", result.assets[0].uri);
    }
  };
  const clearImage = () => {
    setUploadedImage(null);
  };
  const pickSound = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "audio/*",
      copyToCacheDirectory: true,
    });
    if (!result.canceled) {
      console.log("pick sound", result.assets[0].uri);
      setUploadSound(result.assets[0].uri);
    }
  };
  const clearSound = () => {
    setUploadSound(null);
  };
  return (
    <ScrollView>
      <TextInput
        style={styles.input}
        value={textValue}
        onChangeText={setTextValue}
        placeholder={i18n.t("common.text")}
        multiline
        numberOfLines={3}
      />

      <View style={styles.imageUploadContainer}>
        <View style={styles.mediaView}>
          {image ? (
            <LocalImage uri={image} maxHeight={120} maxWidth={200} />
          ) : (
            <Text>{i18n.t("cards.noImage")}</Text>
          )}
        </View>
        {image ? (
          <TouchableOpacity onPress={clearImage} style={styles.iconView}>
            <View
              style={[styles.uploadIcon, { backgroundColor: colors.primary }]}
            >
              <Icon name="close-circle" size={42} color={"white"} />
              <Text style={styles.iconTxt}>{i18n.t("common.remove")}</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={pickImage} style={styles.iconView}>
            <View
              style={[styles.uploadIcon, { backgroundColor: colors.primary }]}
            >
              <Icon name="file-upload-outline" size={42} color={"white"} />
              <Text style={styles.iconTxt}>{i18n.t("common.image")}</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.soundUploadContainer}>
        <View style={styles.mediaView}>
          {sound ? (
            <TouchableOpacity onPress={() => playSound(sound)}>
              <Icon name="play-circle-outline" size={42} color="black" />
            </TouchableOpacity>
          ) : (
            <Text>{i18n.t("cards.noSound")}</Text>
          )}
        </View>
        {sound ? (
          <TouchableOpacity onPress={clearSound} style={styles.iconView}>
            <View
              style={[styles.uploadIcon, { backgroundColor: colors.primary }]}
            >
              <Icon name="close-circle" size={42} color={"white"} />
              <Text style={styles.iconTxt}>{i18n.t("common.remove")}</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={pickSound} style={styles.iconView}>
            <View
              style={[styles.uploadIcon, { backgroundColor: colors.primary }]}
            >
              <Icon name="file-upload-outline" size={42} color={"white"} />
              <Text style={styles.iconTxt}>{i18n.t("common.sound")}</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    //backgroundColor: "#F5F5F5",
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    //textAlign: "center",
  },
  multilineInput: {},
  input: {
    backgroundColor: "#FFF",
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
    color: "#555",
    textAlignVertical: "top",
    height: 120,
  },

  headerLine: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    // backgroundColor: "orange",
    marginBottom: 5,
    marginTop: 5,
  },
  headerIcon: {
    marginHorizontal: 10,
  },
  imageUploadContainer: {
    height: 120,
    marginBottom: 20,
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
  },

  soundUploadContainer: {
    height: 120,
    marginBottom: 20,
    padding: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  mediaView: {
    flex: 0.8,
    justifyContent: "center",
    alignItems: "center",
  },
  iconView: {
    flex: 0.3,
    justifyContent: "center",
    alignItems: "center",
  },
  uploadIcon: {
    padding: 3,
    margin: 5,
    borderRadius: 5,
    alignItems: "center",
  },
  iconTxt: {
    color: "white",
    fontSize: 12,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  topBarItem: {
    height: 30,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default EditFlashcard;
