import Image from '@tiptap/extension-image';
import { BridgeExtension, Plugin, EditorView } from '@10play/tentap-editor';
import { Node as ProseMirrorNode } from 'prosemirror-model';

type ImageEditorState = {};

type ImageEditorInstance = {
  setImage: (src: string) => void;
};

export enum ImageEditorActionType {
  SetImage = 'set-image1',
}

type ImageMessage = {
  type: ImageEditorActionType.SetImage;
  payload: string;
};

export const CustomImageBridge = new BridgeExtension<
  ImageEditorState,
  ImageEditorInstance,
  ImageMessage
>({
  tiptapExtension: Image.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        id: {
          default: null,
        },
        width: {
          default: null,
          parseHTML: el => el.getAttribute('width'),
          renderHTML: attrs => (attrs.width ? { width: attrs.width } : {}),
        },
        height: {
          default: null,
          parseHTML: el => el.getAttribute('height'),
          renderHTML: attrs => (attrs.height ? { height: attrs.height } : {}),
        },
      };
    },

    addProseMirrorPlugins() {
      return [
        new Plugin({
          props: {
            handleClickOn(
              view: EditorView,
              pos: number,
              node: ProseMirrorNode,
              nodePos: number,
              event: MouseEvent
            ) {
              console.log('click');
              window.ReactNativeWebView?.postMessage(
                JSON.stringify({
                  type: 'click',
                })
              );
              if (node.type.name === 'image') {
                const attrs = node.attrs;
                console.log('addProseMirrorPlugins image-tap', attrs);
                window.ReactNativeWebView?.postMessage(
                  JSON.stringify({
                    type: 'image-tap',
                    id: attrs.id,
                    src: attrs.src,
                    width: attrs.width,
                    height: attrs.height,
                  })
                );
                return true;
              }
              return false;
            },
          },
        }),
      ];
    },
  }).configure({
    allowBase64: true,
    HTMLAttributes: {
      style: 'max-width: 100%; height: auto;',
    },
  }),

  extendEditorState: () => {
    return {};
  },
  extendCSS: `
  img {
    height: auto;
    max-width: 100%;
  }

  img &.ProseMirror-selectednode {
    outline: 3px solid #68cef8;
  }
  `,
});
