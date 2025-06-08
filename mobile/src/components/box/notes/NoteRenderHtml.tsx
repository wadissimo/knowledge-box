import { Note } from '@/src/data/NoteModel';
import { View } from 'react-native';
import RenderHtml from 'react-native-render-html';

export default function NoteRenderHtml({ note, width }: { note: Note; width: number }) {
  return (
    <RenderHtml
      source={{ html: note.content }}
      tagsStyles={customTagsStyles}
      contentWidth={width}
    />
  );
}

const customTagsStyles = {
  h1: {
    fontSize: 24,
    fontWeight: 'bold' as 'bold',
    marginBottom: 10,
    color: '#333',
  },
  p: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 5,
    color: '#555',
  },
  strong: {
    fontWeight: 'bold' as 'bold',
  },
  em: {
    fontStyle: 'italic' as 'italic',
  },
  a: {
    color: 'blue',
    textDecorationLine: 'underline' as 'underline',
  },
  b: {
    fontWeight: 'bold' as 'bold',
  },
  i: {
    fontStyle: 'italic' as 'italic',
  },
  u: {
    textDecorationLine: 'underline' as 'underline',
  },
  s: {
    textDecorationLine: 'line-through' as 'line-through',
  },
  strike: {
    textDecorationLine: 'line-through' as 'line-through',
  },
};
