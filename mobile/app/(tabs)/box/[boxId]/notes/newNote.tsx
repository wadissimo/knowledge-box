import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Href } from 'expo-router';
import { i18n } from '@/src/lib/i18n';

const NewNote = () => {
  const router = useRouter();
  const { boxId } = useLocalSearchParams();
  const handleNewTextNote = () => {
    router.replace(`/(tabs)/box/${boxId}/notes/editTextNote` as Href);
  };
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.btnContainer}>
          <TouchableOpacity onPress={() => handleNewTextNote()}>
            <View style={[styles.btn, styles.shadowProp, styles.elevation]}>
              <View style={styles.btnIcon}>
                <Icon name="note-text-outline" size={48} color="white" />
              </View>
              <Text style={styles.btnText}>{i18n.t('notes.text')}</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.btnContainer}>
          <TouchableOpacity>
            <View style={[styles.btn, styles.shadowProp, styles.elevation]}>
              <View style={styles.btnIcon}>
                <Icon name="camera" size={48} color="white" />
              </View>
              <Text style={styles.btnText}>{i18n.t('notes.photo')}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.btnContainer}>
          <TouchableOpacity>
            <View style={[styles.btn, styles.shadowProp, styles.elevation]}>
              <View style={styles.btnIcon}>
                <Icon name="record-rec" size={48} color="white" />
              </View>
              <Text style={styles.btnText}>{i18n.t('notes.audio')}</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.btnContainer}>
          <TouchableOpacity>
            <View style={[styles.btn, styles.shadowProp, styles.elevation]}>
              <View style={styles.btnIcon}>
                <Icon name="upload" size={48} color="white" />
              </View>
              <Text style={styles.btnText}>{i18n.t('notes.upload')}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
  // return null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btn: {
    height: 120,
    width: 120,
    backgroundColor: '#1da422',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
    paddingTop: 10,
  },
  btnText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  btnIcon: { flex: 1, justifyContent: 'center' },
  btnContainer: {
    margin: 20,
  },
  row: { flexDirection: 'row' },
  shadowProp: {
    shadowColor: '#171717',
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  elevation: {
    elevation: 10,
    shadowColor: '#52006A',
  },
});
export default NewNote;
