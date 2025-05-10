import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { Collection, useCollectionModel } from '@/src/data/CollectionModel';
import { i18n } from '@/src/lib/i18n';
import ScreenContainer from '@/src/components/common/ScreenContainer';
import { useThemeColors } from '@/src/context/ThemeContext';
import PrimaryButton from '@/src/components/common/PrimaryButton';

const EditCollection = () => {
  const { themeColors } = useThemeColors();
  const router = useRouter();

  const { collectionId } = useLocalSearchParams();

  const [name, setName] = useState<string>('');
  const [collection, setCollection] = useState<Collection | null>(null);
  const { updateCollection, getCollectionById } = useCollectionModel();

  useEffect(() => {
    async function updateName() {
      const col = await getCollectionById(Number(collectionId));
      if (col) {
        setName(col.name);
      }
      setCollection(col);
    }
    updateName();
  }, [collectionId]);

  const handleSave = () => {
    if (!name) {
      Alert.alert('Error', 'Name must be filled.');
      return;
    }
    if (collection !== null) {
      collection.name = name;
      updateCollection(collection);
    } else {
      throw Error('Empty Collection');
    }

    router.back();
  };

  return (
    <ScreenContainer>
      <Text style={[styles.label, { color: themeColors.text }]}>
        {i18n.t('cards.collectionName')}
      </Text>

      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder={i18n.t('cards.collectionName')}
      />

      <PrimaryButton text={i18n.t('common.save')} onClick={handleSave} />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  label: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    //textAlign: "center",
    color: '#333',
  },
  multilineInput: {},
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
});

export default EditCollection;
