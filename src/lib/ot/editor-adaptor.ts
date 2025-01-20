import { Editor, withoutNormalizing } from "slate";
import { Operation } from "./operation";
import { Client } from "./client";

export class EditorAdaptor {
  editor: Editor;
  constructor(editor: Editor) {
    this.editor = editor;
  }
  applyOperation(client: Client, operation: Operation) {
    // todo：校验op的版本号，虽然applayServer已经做了transform
    console.log("editorAdaptor---------operation", operation);
    // 设置当前版本号
    client.setRevision(operation.targetVersion);

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

    console.log("op执行完成");
  }
}
