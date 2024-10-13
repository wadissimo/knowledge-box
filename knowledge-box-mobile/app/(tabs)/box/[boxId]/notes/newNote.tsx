import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import React, { useCallback, useRef } from "react";
import {
  actions,
  FONT_SIZE,
  getContentCSS,
  RichEditor,
  RichToolbar,
} from "react-native-pell-rich-editor";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Href } from "expo-router";

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
              <Text style={styles.btnText}>Text</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.btnContainer}>
          <TouchableOpacity>
            <View style={[styles.btn, styles.shadowProp, styles.elevation]}>
              <View style={styles.btnIcon}>
                <Icon name="camera" size={48} color="white" />
              </View>
              <Text style={styles.btnText}>Photo</Text>
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
              <Text style={styles.btnText}>Audio</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.btnContainer}>
          <TouchableOpacity>
            <View style={[styles.btn, styles.shadowProp, styles.elevation]}>
              <View style={styles.btnIcon}>
                <Icon name="upload" size={48} color="white" />
              </View>
              <Text style={styles.btnText}>Upload</Text>
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
    justifyContent: "center",
    alignItems: "center",
  },
  btn: {
    height: 120,
    width: 120,
    backgroundColor: "#1da422",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    padding: 5,
    paddingTop: 10,
  },
  btnText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  btnIcon: { flex: 1, justifyContent: "center" },
  btnContainer: {
    margin: 20,
  },
  row: { flexDirection: "row" },
  shadowProp: {
    shadowColor: "#171717",
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  elevation: {
    elevation: 10,
    shadowColor: "#52006A",
  },
});
export default NewNote;
