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
import { useLocalSearchParams } from 'expo-router';

const EditTextNote = () => {
  const saveIcon = require('@/assets/icons/content-save-outline.png');
  const { textNoteId, boxId } = useLocalSearchParams();
  const editor = useEditorBridge({
    autofocus: true,
    avoidIosKeyboard: true,
    initialContent: '',
  });
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

          editor.initialContent = note.content;
          editor.setContent(note.content);
        }

        //editor.setImage('file:///data/user/0/com.wadissimo.knowledgebox/files/media/images/-2.png');
        editor.focus();
      } catch (e) {
        console.error(e);
        throw e;
      }
    };
    run();
  }, [textNoteId, boxId]);

  const handleSave = async () => {
    try {
      console.log('save');
      const content = await editor.getHTML();
      console.log(content);
      if (textNoteId === 'new') {
        const noteId = await newNote('New Note', content, '');
        await newBoxNote(Number(boxId), noteId);
        console.log('new note created:', noteId);
      } else {
        const note = await getNoteById(Number(textNoteId));
        if (note === null) {
          console.error("Can't find a note:" + textNoteId);
          throw Error("Can't find a note:" + textNoteId);
        }
        note.content = content;
        await updateNote(note);
        console.log('note updated:', note.id);
      }
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

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
