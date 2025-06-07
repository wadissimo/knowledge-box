import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView } from 'react-native';
import React, { useEffect, useRef } from 'react';
import {
  DEFAULT_TOOLBAR_ITEMS,
  editorHtml,
  RichText,
  Toolbar,
  useEditorBridge,
} from '@10play/tentap-editor';
import { useNoteModel } from '@/src/data/NoteModel';

const EditTextNote = () => {
  const saveIcon = require('@/assets/icons/content-save-outline.png');
  const editor = useEditorBridge({
    autofocus: true,
    avoidIosKeyboard: true,
    initialContent: 'Start editing!',
  });
  const { newNote, updateNote } = useNoteModel();
  useEffect(() => {
    console.log('editTextNote useEffect2');
    //editor.setImage('file:///data/user/0/com.wadissimo.knowledgebox/files/media/images/-2.png');
    editor.focus();
  }, []);

  const handleSave = async () => {
    console.log('save');

    console.log(await editor.getHTML());
  };

  console.log('editTextNote render');
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <RichText
        editor={editor}
        allowFileAccess={true}
        allowFileAccessFromFileURLs={true}
        allowUniversalAccessFromFileURLs={true}
        originWhitelist={['*']}
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
          items={[
            {
              onPress: () => handleSave,
              active: () => false,
              disabled: () => false,
              image: () => saveIcon,
            },
            ...DEFAULT_TOOLBAR_ITEMS,
          ]}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
export default EditTextNote;
