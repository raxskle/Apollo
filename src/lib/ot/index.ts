import { Editor } from "slate";
import { getSocket } from "../../network";
import { Client } from "./client";

export * from "./client";
export * from "./editor-adaptor";
export * from "./operation";
export * from "./socket-adaptor";

let client: Client;

export const getClient = (editor: Editor) => {
  if (!client) {
    client = new Client(editor, getSocket());
  }
  return client;
};
