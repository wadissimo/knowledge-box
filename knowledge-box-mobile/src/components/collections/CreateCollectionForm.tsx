import { View, Text, StyleSheet, TextInput, Alert } from 'react-native';
import React, { useState } from 'react';
import { i18n } from '@/src/lib/i18n';
import PrimaryButton from '../common/PrimaryButton';
import { useThemeColors } from '@/src/context/ThemeContext';

const CreateCollectionForm: React.FC<{
  onCreate: Function;
}> = ({ onCreate }) => {
  const { themeColors } = useThemeColors();
  const [name, setName] = useState<string>('');

  const handleSave = async () => {
    if (!name) {
      Alert.alert('Error', 'Name must be filled.');
      return;
    }
    onCreate(name);
  };

  return (
    <View style={styles.newColContainer}>
      <Text style={[styles.label, { color: themeColors.text }]}>
        {i18n.t('cards.createCollection')}
      </Text>

      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder={i18n.t('cards.collectionName')}
      />

      <PrimaryButton text={i18n.t('common.create')} onClick={handleSave} />
    </View>
  );
};

const styles = StyleSheet.create({
  newColContainer: {},

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

  label: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
    //textAlign: "center",
    color: '#333',
  },
  multilineInput: {},
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'grey',
    marginVertical: 1,
  },
});

export default CreateCollectionForm;
