import React from 'react';
import { EditorContent } from '@tiptap/react';
import { useTenTap, TenTapStartKit, BoldBridge } from '@10play/tentap-editor';

import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { CounterBridge } from '../src/editor/CounterBridge';
import { CustomImageBridge } from './CustomImageBridge';
import { MathematicsBridge } from '../src/editor/MathematicsBridge';
import { Mathematics } from '@tiptap/extension-mathematics';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import 'katex/dist/katex.min.css';

// // Helper: Check if this is the default ImageBridge
// const isImageBridge = (bridge: any) => {
//   // Typical pattern used in @10play/tentap-editor bridge objects
//   const actionType = bridge?.reducer?.({} as any, { type: '__check__' })?.type;
//   return typeof actionType === 'string' && actionType.startsWith('image');
// };

// // Filter out image bridge
// const filteredBridges = TenTapStartKit.filter(bridge => !isImageBridge(bridge));

export const AdvancedEditor = () => {
  const editor = useTenTap({
    bridges: [...TenTapStartKit, MathematicsBridge],
    // tiptapOptions: {
    //   extensions: [Document, Paragraph, Text, Bold, Italic, Mathematics],
    // },
  });

  return (
    <EditorContent
      editor={editor}
      className={window.dynamicHeight ? 'dynamic-height' : undefined}
    />
  );
};
