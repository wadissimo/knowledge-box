import { View, StyleSheet, Platform } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { useBoxModel } from '@/src/data/BoxModel';
import { useThemeColors } from '@/src/context/ThemeContext';
import { i18n } from '@/src/lib/i18n';
import { LinearGradient } from 'expo-linear-gradient';
import PrimaryButton from '@/src/components/common/PrimaryButton';
import TextInputCard from '@/src/components/common/TextInputCard';
import ScreenContainer from '@/src/components/common/ScreenContainer';

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
      <TextInputCard
        header={i18n.t('boxes.boxName')}
        value={name}
        setValue={setName}
        placeholder={i18n.t('boxes.boxName')}
      />
      <TextInputCard
        header={i18n.t('boxes.description')}
        value={description}
        setValue={setDescription}
        placeholder={i18n.t('boxes.description')}
        multiline
        numberOfLines={8}
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
});

export default NewBox;
