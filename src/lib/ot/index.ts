import { Editor } from "slate";
import { getSocket } from "../../network";
import { Client } from "./client";

export * from "./client";
export * from "./editor-adaptor";
export * from "./operation";
export * from "./socket-adaptor";

let client: Client | undefined;

export const getClient = (editor: Editor, docId?: string, userId?: string) => {
  if (!client) {
    console.log("new Client!!");
    client = new Client(editor, getSocket(docId, userId));
  }
  return client as Client;
};

export const distoryClient = () => {
  if (client) {
    client.destroy();
  }
  client = undefined;
};
