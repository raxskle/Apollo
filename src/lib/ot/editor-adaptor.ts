import { Operation } from "./operation";

export class EditorAdaptor {
  constructor() {}
  applyOperation(operation: Operation) {
    console.log("editorAdaptor", operation);
  }
}
