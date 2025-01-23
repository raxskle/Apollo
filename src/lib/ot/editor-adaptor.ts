import { Editor, withoutNormalizing } from "slate";
import { Operation } from "./operation";
import { Client } from "./client";

export class EditorAdaptor {
  editor: Editor;
  constructor(editor: Editor) {
    this.editor = editor;
  }
  applyOperation(_client: Client, operation: Operation) {
    if (operation.actions.length > 0 && operation.actions[0].undo) {
      this.editor.undo();
    } else {
      // op的每个action直接执行
      withoutNormalizing(this.editor, () => {
        for (const action of operation.actions) {
          this.editor.apply({ ...action, applyServer: true });
        }
      });
    }
  }
}
