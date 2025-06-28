import { Image } from '@tiptap/extension-image';
import { BridgeExtension } from '@10play/tentap-editor';
import { Plugin } from 'prosemirror-state';
import { Node as ProseMirrorNode } from 'prosemirror-model';
import { EditorView } from 'prosemirror-view';

export enum ImageEditorActionType {
  ResizeImage = 'resize-image',
  // other types if needed
}

type ResizeImageMessage = {
  type: ImageEditorActionType.ResizeImage;
  payload: {
    id: string;
    width: string;
    height: string;
  };
};

type ImageEditorInstance = {
  resizeImage: (id: string, width: string, height: string) => void;
};

export const NativeCustomImageBridge = new BridgeExtension<
  {}, // No editor state needed here
  ImageEditorInstance,
  ResizeImageMessage
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

  onBridgeMessage(editor, message) {
    if (message.type === ImageEditorActionType.ResizeImage) {
      const { id, width, height } = message.payload;

      editor.commands.command(({ tr, state }) => {
        state.doc.descendants((node, pos) => {
          if (node.type.name === 'image' && node.attrs.id === id) {
            tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              width,
              height,
            });
            editor.view.dispatch(tr);
            return false; // stop traversal
          }
          return true;
        });
        return true;
      });

      return true;
    }

    return false;
  },

  extendEditorInstance(sendBridgeMessage) {
    return {
      resizeImage: (id: string, width: string, height: string) => {
        sendBridgeMessage({
          type: ImageEditorActionType.ResizeImage,
          payload: { id, width, height },
        });
      },
    };
  },

  extendEditorState() {
    return {};
  },

  extendCSS: `
    img {
      max-width: 100%;
      height: auto;
    }

    img.ProseMirror-selectednode {
      outline: 3px solid #68cef8;
    }
  `,
});
