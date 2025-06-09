import { View, Text, TextInput, StyleSheet, Button, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Box, useBoxModel } from '@/src/data/BoxModel';

import { i18n } from '@/src/lib/i18n';
import { useThemeColors } from '@/src/context/ThemeContext';
import ScreenContainer from '@/src/components/common/ScreenContainer';
import PrimaryButton from '@/src/components/common/PrimaryButton';
import DeleteButton from '@/src/components/common/DeleteButton';

const ManageBox = () => {
  const { themeColors } = useThemeColors();
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const { boxId } = useLocalSearchParams();
  const [box, setBox] = useState<Box | null>(null);

  const { newBox, updateBox, getBoxById, deleteBox } = useBoxModel();

  const router = useRouter();

  useEffect(() => {
    getBoxById(Number(boxId)).then(res => {
      if (res) {
        setBox(res);
        setName(res.name);
        setDescription(res.description ?? '');
      }
    });
  }, [boxId]);

  async function handleSave() {
    if (!box) return;
    box.name = name;
    box.description = description;
    await updateBox(box);
    router.back();
  }
  async function handleDelete() {
    if (!box) return;
    Alert.alert(
      i18n.t('common.confirm.deletion'),
      i18n.t('boxes.confirmDeletionText'),
      [
        {
          text: i18n.t('common.cancel'),
          onPress: () => console.log('Deletion cancelled'),
          style: 'cancel',
        },
        {
          text: i18n.t('common.delete'),
          onPress: () => {
            console.log('Deleting box...');
            deleteBox(box.id).then(() => {
              router.back();
              router.replace('../boxes');
            });
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  }

  if (box === null) return null;

  return (
    <ScreenContainer>
      {/* <View style={styles.boxTitle}>
        <Text style={styles.boxTitleText}>Create Box</Text>
      </View> */}
      <View>
        <Text style={[styles.formText, { color: themeColors.text }]}>
          {i18n.t('boxes.boxName')}
        </Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder={i18n.t('boxes.boxName')}
        />
      </View>
      <View>
        <Text style={[styles.formText, { color: themeColors.text }]}>
          {i18n.t('boxes.description')}
        </Text>

        <TextInput
          style={[styles.input, { height: 150 }]}
          value={description}
          onChangeText={setDescription}
          placeholder={i18n.t('boxes.description')}
          multiline
          numberOfLines={4}
        />
      </View>
      <View style={styles.btn}>
        <PrimaryButton text={i18n.t('boxes.save')} onClick={handleSave} />
      </View>
      <View style={styles.btn}>
        <DeleteButton text={i18n.t('boxes.delete')} onClick={handleDelete} />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
  },
  formText: {
    fontSize: 24,
  },
  boxTitle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  boxTitleText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#FFF',
    borderColor: '#DDD',
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
    color: '#333',
    textAlignVertical: 'top',
  },
  btn: {
    marginVertical: 2,
  },
});

export default ManageBox;
