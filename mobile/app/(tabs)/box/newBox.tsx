import { View, StyleSheet, Platform, TextInput, Text } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { useBoxModel } from '@/src/data/BoxModel';
import { useThemeColors } from '@/src/context/ThemeContext';
import { i18n } from '@/src/lib/i18n';
import { LinearGradient } from 'expo-linear-gradient';
import PrimaryButton from '@/src/components/common/PrimaryButton';
import TextInputCard from '@/src/components/common/TextInputCard';
import ScreenContainer from '@/src/components/common/ScreenContainer';
import TextInputField from '@/src/components/common/TextInputField';

const NewBox = () => {
  const { themeColors } = useThemeColors();
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const { newBox } = useBoxModel();

  const router = useRouter();

  async function handleSave() {
    await newBox(name, description, null);
    router.back();
  }

  return (
    <ScreenContainer>
      <TextInputField
        header={i18n.t('boxes.boxName')}
        value={name}
        setValue={setName}
        placeholder={i18n.t('boxes.boxName')}
      />
      <TextInputField
        header={i18n.t('boxes.description')}
        value={description}
        setValue={setDescription}
        placeholder={i18n.t('boxes.description')}
        multiline
        numberOfLines={8}
        style={{ height: 100 }}
      />

      <PrimaryButton text={i18n.t('boxes.create')} onClick={handleSave} />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    paddingHorizontal: 8,
  },
  label: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    //textAlign: "center",
    color: '#333',
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
});

export default NewBox;
