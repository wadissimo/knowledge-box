import { BridgeExtension } from '@10play/tentap-editor';
import { Mathematics } from '@tiptap/extension-mathematics';
type MathematicsEditorState = {};

type MathematicsEditorInstance = {
  setFormula: (formula: string) => void;
};

export enum MathematicsEditorActionType {
  SetFormula = 'set-formula',
}

type MathematicsMessage = {
  type: MathematicsEditorActionType.SetFormula;
  payload: string;
};

export const MathematicsBridge = new BridgeExtension<
  MathematicsEditorState,
  MathematicsEditorInstance,
  MathematicsMessage
>({
  forceName: 'mathematics',
  tiptapExtension: Mathematics,

  extendEditorState: () => {
    return {};
  },
  extendEditorInstance(sendBridgeMessage) {
    return {
      setFormula: (formula: string) => {
        sendBridgeMessage({
          type: MathematicsEditorActionType.SetFormula,
          payload: formula,
        });
      },
    };
  },
});
