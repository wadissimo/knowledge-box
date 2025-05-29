import React, { useState, useEffect, useRef } from 'react';
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
} from 'react-native';
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';

import { Card, useCardModel } from '@/src/data/CardModel';

import useMediaDataService from '@/src/service/MediaDataService';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { i18n } from '@/src/lib/i18n';

import * as ImagePicker from 'expo-image-picker';
import { useImageModel } from '@/src/data/ImageModel';
import LocalImage from '@/src/components/utils/LocalImage';
import * as DocumentPicker from 'expo-document-picker';
import { useThemeColors } from '@/src/context/ThemeContext';
import ScreenContainer from '@/src/components/common/ScreenContainer';
import PrimaryButton from '@/src/components/common/PrimaryButton';

const EditFlashcard = () => {
  const router = useRouter();
  const { themeColors } = useThemeColors();
  const { collectionId, cardId } = useLocalSearchParams();

  const { getCardById, newCard, updateCardFrontBack, updateCard } = useCardModel();

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

  const [selectedTab, setSelectedTab] = useState<string>('front');
  const [card, setCard] = useState<Partial<Card> | null>(null);

  async function handlePlaySound(soundUri: string) {
    playSoundFromUri(soundUri);
  }
  useEffect(() => {
    async function fetchCards() {
      if (cardId === 'new') {
        navigation.setOptions({
          title: i18n.t('cards.newCardTitle'),
        });
        setCard({
          front: '',
          back: '',
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
          title: i18n.t('cards.editCardTitle'),
        });
      }
    }
    fetchCards();
  }, [collectionId, cardId]);

  const handleSave = async () => {
    if (card === null) return;
    var dbCardId: number;
    if (cardId === 'new') {
      const cardId = await newCard(Number(collectionId), card.front ?? '', card.back ?? '');
      if (cardId === null) throw new Error("can't find card");
      dbCardId = cardId;
    } else {
      dbCardId = Number(cardId);
    }
    var updatedCard: Card | null = await getCardById(dbCardId);
    if (updatedCard !== null) {
      updatedCard = {
        ...updatedCard,
        ...card,
      };
      if (updateImgFront) {
        console.log('uploading front');
        if (imageUriFront !== null) {
          const imgData = await newImageFromLocalUri(imageUriFront);
          if (imgData === null) {
            throw new Error('error uploading image');
          }
          updatedCard.frontImg = imgData.id;
        } else {
          updatedCard.frontImg = null;
        }
      }
      if (updateImgBack) {
        console.log('uploading back');
        if (imageUriBack !== null) {
          const imgData = await newImageFromLocalUri(imageUriBack);
          if (imgData === null) {
            throw new Error('error uploading image');
          }
          updatedCard.backImg = imgData.id;
        } else {
          updatedCard.backImg = null;
        }
      }

      if (updateSoundFront) {
        if (soundUriFront !== null) {
          const soundData = await newSoundFromLocalUri(soundUriFront);
          if (soundData === null) {
            throw new Error('error uploading sound');
          }
          updatedCard.frontSound = soundData.id;
        } else {
          updatedCard.frontSound = null;
        }
      }
      if (updateSoundBack) {
        if (soundUriBack !== null) {
          const soundData = await newSoundFromLocalUri(soundUriBack);
          if (soundData === null) {
            throw new Error('error uploading sound');
          }
          updatedCard.backSound = soundData.id;
        } else {
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
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <ScreenContainer>
        <View style={styles.tabBarContainer}>
          <TouchableOpacity
            style={[
              styles.tabBarItem,
              selectedTab === 'front' && styles.tabBarItemActive,
              {
                backgroundColor:
                  selectedTab === 'front' ? themeColors.headerBg : themeColors.subHeaderBg,
              },
            ]}
            onPress={() => handleSelectedTabClick('front')}
          >
            <Text
              style={[
                selectedTab === 'front' ? styles.tabBarTextActive : styles.tabBarText,
                {
                  color:
                    selectedTab === 'front' ? themeColors.headerText : themeColors.subHeaderText,
                },
              ]}
            >
              {i18n.t('cards.frontSide')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabBarItem,
              selectedTab === 'back' && styles.tabBarItemActive,
              {
                backgroundColor:
                  selectedTab === 'back' ? themeColors.headerBg : themeColors.subHeaderBg,
              },
            ]}
            onPress={() => handleSelectedTabClick('back')}
          >
            <Text
              style={[
                selectedTab === 'back' ? styles.tabBarTextActive : styles.tabBarText,
                {
                  color:
                    selectedTab === 'back' ? themeColors.headerText : themeColors.subHeaderText,
                },
              ]}
            >
              {i18n.t('cards.backSide')}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 1, flexDirection: 'row' }}>
          <View
            style={{
              backgroundColor: selectedTab === 'back' ? themeColors.headerText : 'transparent',
              width: '50%',
            }}
          />
          <View
            style={{
              backgroundColor: selectedTab === 'front' ? themeColors.headerText : 'transparent',
              width: '50%',
            }}
          />
        </View>
        <ScrollView
          contentContainerStyle={styles.cardContentContainer}
          keyboardShouldPersistTaps="handled"
        >
          {selectedTab === 'front' && (
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
          {selectedTab === 'back' && (
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
        </ScrollView>
        <View style={styles.saveButtonContainer}>
          <PrimaryButton
            text={i18n.t(cardId === 'new' ? 'cards.createCardBtn' : 'cards.saveCardBtn')}
            onClick={handleSave}
          />
        </View>
      </ScreenContainer>
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
  const { themeColors } = useThemeColors();

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
      console.log('image selected', result.assets[0].uri);
    }
  };
  const clearImage = () => {
    setUploadedImage(null);
  };
  const pickSound = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'audio/*',
      copyToCacheDirectory: true,
    });
    if (!result.canceled) {
      console.log('pick sound', result.assets[0].uri);
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
        placeholder={i18n.t('common.text')}
        multiline
        numberOfLines={3}
      />

      <View style={styles.imageUploadContainer}>
        <View style={styles.mediaView}>
          {image ? (
            <LocalImage uri={image} maxHeight={120} maxWidth={200} />
          ) : (
            <Text style={[{ color: themeColors.text }]}>{i18n.t('cards.noImage')}</Text>
          )}
        </View>
        {image ? (
          <TouchableOpacity onPress={clearImage} style={styles.iconView}>
            <View style={[styles.uploadIcon, { backgroundColor: themeColors.primaryBtnBg }]}>
              <Icon name="close-circle" size={42} color={themeColors.primaryBtnText} />
              <Text style={[styles.iconTxt, { color: themeColors.primaryBtnText }]}>
                {i18n.t('common.remove')}
              </Text>
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={pickImage} style={styles.iconView}>
            <View style={[styles.uploadIcon, { backgroundColor: themeColors.primaryBtnBg }]}>
              <Icon name="file-upload-outline" size={42} color={themeColors.primaryBtnText} />
              <Text style={[styles.iconTxt, { color: themeColors.primaryBtnText }]}>
                {i18n.t('common.image')}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      <View style={[styles.soundUploadContainer]}>
        <View style={[styles.mediaView]}>
          {sound ? (
            <TouchableOpacity onPress={() => playSound(sound)}>
              <View style={[styles.playIcon, { backgroundColor: themeColors.primaryBtnBg }]}>
                <Icon name="play-circle-outline" size={42} color={themeColors.primaryBtnText} />
              </View>
            </TouchableOpacity>
          ) : (
            <Text style={[{ color: themeColors.text }]}>{i18n.t('cards.noSound')}</Text>
          )}
        </View>
        {sound ? (
          <TouchableOpacity onPress={clearSound} style={styles.iconView}>
            <View style={[styles.uploadIcon, { backgroundColor: themeColors.primaryBtnBg }]}>
              <Icon name="close-circle" size={42} color={themeColors.primaryBtnText} />
              <Text style={[styles.iconTxt, { color: themeColors.primaryBtnText }]}>
                {i18n.t('common.remove')}
              </Text>
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={pickSound} style={styles.iconView}>
            <View style={[styles.uploadIcon, { backgroundColor: themeColors.primaryBtnBg }]}>
              <Icon name="file-upload-outline" size={42} color={themeColors.primaryBtnText} />
              <Text style={[styles.iconTxt, { color: themeColors.primaryBtnText }]}>
                {i18n.t('common.sound')}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    marginTop: 12,
    marginBottom: 0,
    backgroundColor: 'transparent',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    overflow: 'hidden',
    alignSelf: 'center',
    width: '95%',
    elevation: 2,
  },
  tabBarItem: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  tabBarItemActive: {
    backgroundColor: '#222',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  tabBarText: {
    color: '#444',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tabBarTextActive: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardContentContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  saveButtonContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    alignItems: 'center',
  },

  input: {
    backgroundColor: '#FFF',
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
    color: '#555',
    textAlignVertical: 'top',
    height: 120,
  },
  imageUploadContainer: {
    height: 120,
    marginBottom: 20,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  soundUploadContainer: {
    height: 120,
    marginBottom: 20,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaView: {
    flex: 0.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconView: {
    flex: 0.4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadIcon: {
    padding: 5,
    borderRadius: 16,
    alignItems: 'center',
    flexDirection: 'row',
    minWidth: 120,
    minHeight: 44,
    justifyContent: 'center',
    elevation: 10,
    shadowColor: '#0288d1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },

  playIcon: {
    padding: 5,
    borderRadius: 32,
    alignItems: 'center',
    flexDirection: 'row',

    justifyContent: 'center',
    elevation: 10,
    shadowColor: '#0288d1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  iconTxt: {
    color: '#444',
    fontSize: 15,
    marginLeft: 8,
    fontWeight: '500',
  },
});

export default EditFlashcard;
