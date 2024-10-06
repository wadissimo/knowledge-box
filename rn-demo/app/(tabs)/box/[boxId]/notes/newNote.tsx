import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import React, { useCallback, useRef } from "react";
import {
  actions,
  FONT_SIZE,
  getContentCSS,
  RichEditor,
  RichToolbar,
} from "react-native-pell-rich-editor";

const NewNote = () => {
  const richText = useRef<RichEditor>(null);

  const handleForeColor = useCallback(() => {
    richText.current?.setForeColor("blue");
  }, []);

  const onPressAddImage = useCallback(() => {
    // insert URL
    richText.current?.insertImage(
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/100px-React-icon.svg.png",
      "background: gray;"
    );
    // insert base64
    // this.richText.current?.insertImage(`data:${image.mime};base64,${image.data}`);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View style={styles.notesView}>
            <RichToolbar
              editor={richText}
              selectedIconTint={"#2095F2"}
              disabledIconTint={"#bfbfbf"}
              onPressAddImage={onPressAddImage}
              actions={[
                actions.undo,
                actions.redo,

                actions.insertImage,

                actions.insertOrderedList,

                actions.code,

                actions.foreColor,
                actions.hiliteColor,
              ]}
              iconMap={{
                [actions.foreColor]: () => (
                  <Text style={[styles.tib, { color: "blue" }]}>FC</Text>
                ),
              }}
              foreColor={handleForeColor}
            />
            <RichEditor
              ref={richText}
              initialContentHTML={
                "Hello <b>World</b> <p>this is a new paragraph</p> <p>this is another new paragraph</p>"
              }
            />
            {/* <WebView
          style={styles.webView}
          originWhitelist={["*"]}
          source={{ html: "<h1>Hello</h1>" }}
        /> */}
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  notesView: {
    flex: 1,
  },
  webView: {
    flex: 1,
    elevation: 4,
    backgroundColor: "orange",
  },
  tib: {
    textAlign: "center",
    color: "#515156",
  },
});
export default NewNote;
