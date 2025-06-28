import {
  Button,
  GestureResponderEvent,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  CoreBridge,
  DEFAULT_TOOLBAR_ITEMS,
  EditorBridge,
  ImageBridge,
  RichText,
  TenTapStartKit,
  Toolbar,
  UnderlineBridge,
  useBridgeState,
  useEditorBridge,
  useEditorContent,
} from '@10play/tentap-editor';
import { Note, useNoteModel } from '@/src/data/NoteModel';
import { useLocalSearchParams } from 'expo-router';
import ViewShot, { captureRef } from 'react-native-view-shot';
import { MathJaxSvg } from 'react-native-mathjax-html-to-svg';
import PrimaryButton from '@/src/components/common/PrimaryButton';
import * as FileSystem from 'expo-file-system';
import { NativeCustomImageBridge } from './NativeCustomImageBridge';

import { editorHtml } from '@/editor-web/build/editorHtml';
import { MathematicsBridge } from '@/src/editor/MathematicsBridge';

const TEST = 'x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}';

const Counter = ({ editor }: { editor: EditorBridge }) => {
  const { wordCount } = useBridgeState(editor);
  return <Text>{wordCount}</Text>;
};

const EditTextNote = () => {
  const saveIcon = require('@/assets/icons/content-save-outline.png');
  const fxIcon = require('@/assets/icons/fx3.png');

  const { textNoteId, boxId } = useLocalSearchParams();
  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [formulaModalVisible, setFormulaModalVisible] = useState(false);

  const editor = useEditorBridge({
    customSource: editorHtml,
    autofocus: true,
    avoidIosKeyboard: true,
    initialContent: '',
    bridgeExtensions: [
      ...TenTapStartKit,
      NativeCustomImageBridge.configureExtension({ inline: true }),
      MathematicsBridge,
    ],
  });
  const bridgeState = useBridgeState(editor);
  const editorContent = useEditorContent(editor);

  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);

  const [resizeModalVisible, setResizeModalVisible] = useState(false);
  const [resizeWidth, setResizeWidth] = useState('');
  const [resizeHeight, setResizeHeight] = useState('');

  const { newNote, updateNote, getNoteById, newBoxNote } = useNoteModel();

  useEffect(() => {
    const run = async () => {
      try {
        console.log('editTextNote useEffect', textNoteId, boxId);
        if (textNoteId === 'new') {
        } else {
          const note = await getNoteById(Number(textNoteId));
          if (note === null) {
            console.error("Can't find a note:" + textNoteId);
            throw Error("Can't find a note:" + textNoteId);
          }
          console.log('note found:', note);
          setNote(note);
          editor.initialContent = note.content;
          editor.setContent(note.content);
          setTitle(note.title);
        }

        editor.focus();
      } catch (e) {
        console.error(e);
        throw e;
      }
    };
    run();
  }, [textNoteId, boxId]);

  // console.log('render: bridgeState', bridgeState);

  useEffect(() => {
    if (
      note !== null &&
      note.content !== undefined &&
      note.content !== '' &&
      note.content !== '<p></p>' &&
      (editorContent === undefined || editorContent === '' || editorContent === '<p></p>')
    ) {
      //workaround for initial content not being set
      //test
      editor.setContent(note.content);
      // console.log('setting note content workaround');
    }
  }, [editorContent, note]);

  const handleResizeImage = () => {
    try {
      console.log('handleResizeImage', selectedImageSrc, resizeWidth, resizeHeight);
      // editor.resizeImage(selectedImageSrc, resizeWidth, resizeHeight);
    } catch (e) {
      console.error(e);
    }

    setResizeModalVisible(false);
  };

  const handleSave = async () => {
    try {
      console.log('save');
      console.log('editorContent', editorContent);
      const content = await editor.getHTML();
      console.log('content', content);
      if (note === null) {
        const noteId = await newNote(title, content, '');
        await newBoxNote(Number(boxId), noteId);
        console.log('new note created:', noteId);
        const note = await getNoteById(noteId);
        setNote(note);
      } else {
        note.content = content;
        note.title = title;
        await updateNote(note);
        console.log('note updated:', note.id);
      }
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const handleInsertFormula = async () => {
    setFormulaModalVisible(true);
  };

  const handleSaveFormula = (uri: string) => {
    //editor.injectJS(`insertImage("${uri}")`);
    editor.setImage(uri);
    console.log('setImage', uri);
    // editor.setImage(
    //   'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/100px-React-icon.svg.png'
    // );
    setFormulaModalVisible(false);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TextInput
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, width: '100%' }}
        placeholder="Note title"
        value={title}
        onChangeText={setTitle}
      />

      <RichText
        editor={editor}
        allowFileAccess
        allowFileAccessFromFileURLs
        allowUniversalAccessFromFileURLs
        originWhitelist={['*']}
        exclusivelyUseCustomOnMessage={false}
        onMessage={event => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            console.log('onMessage', data.type);
            if (data.type === 'image-tap') {
              console.log('image-tap', data);
              setSelectedImageSrc(data.src);
              setResizeWidth(data.width.toString());
              setResizeHeight(data.height.toString());
              setResizeModalVisible(true);
            } else if (data.type === 'clear-selection') {
              setSelectedImageSrc(null);
            }
          } catch (e) {
            console.warn('Message parsing error:', e);
          }
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{
          position: 'absolute',
          width: '100%',
          bottom: 0,
        }}
      >
        <Toolbar
          editor={editor}
          hidden={false}
          items={[
            {
              onPress: () => handleSave,
              active: () => false,
              disabled: () => false,
              image: () => saveIcon,
            },
            {
              onPress: () => handleInsertFormula,
              active: () => false,
              disabled: () => false,
              image: () => fxIcon,
            },
            ...DEFAULT_TOOLBAR_ITEMS,
          ]}
        />
        <InsertFormulaDialog
          visible={formulaModalVisible}
          onClose={() => setFormulaModalVisible(false)}
          onSave={handleSaveFormula}
        />
        <Modal
          animationType="fade"
          transparent={true}
          visible={resizeModalVisible}
          onRequestClose={() => setResizeModalVisible(false)}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.5)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <View
              style={{
                backgroundColor: '#fff',
                padding: 20,
                borderRadius: 10,
                width: '80%',
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
                Resize Image
              </Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="Width"
                value={resizeWidth}
                onChangeText={setResizeWidth}
              />
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="Height"
                value={resizeHeight}
                onChangeText={setResizeHeight}
              />
              <View
                style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}
              >
                <PrimaryButton
                  text="Cancel"
                  onClick={() => setResizeModalVisible(false)}
                  style={{ width: 100 }}
                />
                <PrimaryButton text="Resize" onClick={handleResizeImage} style={{ width: 100 }} />
              </View>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
export default EditTextNote;

function InsertFormulaDialog({
  visible,
  onClose,
  onSave,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (uri: string) => void;
}) {
  const [formula, setFormula] = useState<string>('');
  const [previewFormula, setPreviewFormula] = useState<boolean>(false);
  const formulaViewRef = useRef<ViewShot>(null);

  const handlePreviewFormula = () => {
    console.log('preview formula');
    console.log(formula);
    setPreviewFormula(true);
  };
  const handlePreviewBack = () => {
    console.log('preview back');
    setPreviewFormula(false);
  };
  const handleFormulaSave = async () => {
    try {
      const tempUri = await captureRef(formulaViewRef, {
        format: 'png',
        quality: 1.0,
        result: 'tmpfile',
      });

      const fileName = `formula_${Date.now()}.png`;
      const permanentUri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.moveAsync({ from: tempUri, to: permanentUri });
      onSave(permanentUri);
      setPreviewFormula(false);
      console.log('formula saved to', permanentUri);
    } catch (e) {
      console.error(e);
      throw e;
    }
  };
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      onDismiss={onClose}
    >
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.4)',
        }}
      >
        <Pressable
          onPress={onClose}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        />
        {previewFormula ? (
          <View
            style={{
              backgroundColor: '#fff',
              borderRadius: 18,
              padding: 16,
              maxHeight: '80%',
            }}
          >
            <Text style={styles.title}>Preview formula</Text>
            <ViewShot
              ref={formulaViewRef}
              options={{ format: 'png', quality: 1.0 }}
              style={styles.formulaContainer}
            >
              <MathJaxSvg fontSize={24} color="black" fontCache={true}>
                {`$$${formula}$$`}
              </MathJaxSvg>
            </ViewShot>
            <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'space-between' }}>
              <PrimaryButton text="Back" onClick={handlePreviewBack} style={{ width: 100 }} />
              <PrimaryButton text="Save" onClick={handleFormulaSave} style={{ width: 100 }} />
            </View>
          </View>
        ) : (
          <View
            style={{
              width: '90%',
              backgroundColor: '#fff',
              borderRadius: 18,
              padding: 16,
              maxHeight: '80%',
            }}
          >
            <Text style={styles.title}>Insert formula</Text>
            <TextInput
              style={styles.input}
              placeholder="LaTeX formula"
              value={formula}
              onChangeText={setFormula}
              multiline
            />
            <View
              style={{ flexDirection: 'row', gap: 10, marginTop: 10, justifyContent: 'center' }}
            >
              <PrimaryButton text="Preview" onClick={handlePreviewFormula} style={{ width: 100 }} />
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  formulaContainer: {
    backgroundColor: '#fff',
    padding: 20,

    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    borderColor: 'gray',
    borderWidth: 0.5,
    width: '100%',
    textAlign: 'left',
    textAlignVertical: 'top',
    marginTop: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});
