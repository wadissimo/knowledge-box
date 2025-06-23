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
    RichEditor,
    RichToolbar,
  } from "react-native-pell-rich-editor";
import { useSafeAreaInsets } from "react-native-safe-area-context";
  
  
  const EditTextNote = () => {
    const richText = useRef<RichEditor>(null);
  
    const handleForeColor = useCallback(() => {
      richText.current?.setForeColor("blue");
    }, []);
    const insets = useSafeAreaInsets();
    console.log("insets", insets);
    const onPressAddImage = useCallback(() => {
      // insert URL
      console.log("inserted image");
      richText.current?.insertImage(
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/100px-React-icon.svg.png",
        "background: gray;"
      );
      console.log("inserted image");
      // insert base64
      // this.richText.current?.insertImage(`data:${image.mime};base64,${image.data}`);
    }, []);
  
    return (
      <SafeAreaView style={{ flex: 1 }} >
        <ScrollView style={{ flex: 1, backgroundColor: "white" }}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <View>
              <Text>title</Text>
            </View>
            <View style={styles.notesView}>
              
              <RichEditor
                ref={richText}
                style={{ flex: 1, height: 500, marginBottom: insets.bottom }}
                initialContentHTML={
                  "Hello <b>World</b> <p>this is a new paragraph</p> <p>this is another new paragraph</p>"
                }
              />
              {/* <WebView
              style={styles.webView}
              originWhitelist={["*"]}
              source={{ html: "<h1>Hello</h1>" }}
            /> */}
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
            </View>
          </KeyboardAvoidingView>
        </ScrollView>
      </SafeAreaView>
    );
    // return null;
  };
  
  const styles = StyleSheet.create({
    notesView: {
      flex: 1,
      backgroundColor: "white",
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
  export default EditTextNote;