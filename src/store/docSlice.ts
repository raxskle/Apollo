import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CustomElement } from "../types/editor";
import { Descendant } from "slate";

export type Comment = {
  ref?: CustomElement;
  content: string;
  time: number;
  author: User;
  id: string;
};

export enum DocFont {
  Default = " ",
  Serif = '"Times New Roman", serif',
}

export type Document = {
  id: string;
  title: string;
  fontFamily: DocFont;
  content: CustomElement[] | Descendant[];
  lastModified: number;
  createdTime: number;
  comments: Comment[];
  version: number; // 文档的版本号
  author: User;
  allCollaborators: Collaborator[];
};

export type User = {
  id: string;
  name: string;
  displayColor: string;
};

export class Collaborator {
  id: string;
  name: string;
  displayColor: string;
  constructor(id: string, name: string, displayColor: string) {
    this.id = id;
    this.name = name;
    this.displayColor = displayColor;
  }
}

type SystemState = {
  document: Document;
  user: User;
  collaborator: Collaborator[];
};

const initialState: SystemState = {
  // 初始状态
  document: {
    id: "0000",
    title: " ",
    fontFamily: DocFont.Default,
    content: [],
    lastModified: 0,
    createdTime: 0,
    comments: [],
    version: 0,
    author: {
      id: "",
      name: "User",
      displayColor: "grey",
    },
    allCollaborators: [],
  },
  user: {
    id: "",
    name: "User",
    displayColor: "grey",
  },
  collaborator: [],
};

const docSlice = createSlice({
  name: "root",
  initialState,
  reducers: {
    init(state) {
      state.collaborator = initialState.collaborator;
      state.document = initialState.document;
    },
    initDocument: (state, action: PayloadAction<{ document: Document }>) => {
      state.document = action.payload.document;
    },
    updateLastModified: (
      state,
      action: PayloadAction<{ lastModified: number }>
    ) => {
      state.document.lastModified = action.payload.lastModified;
    },
    changeDocumentTitle: (state, action: PayloadAction<{ title: string }>) => {
      state.document.title = action.payload.title;
      state.document.lastModified = Date.now();
    },
    changeDocumentFontFamily: (state, action: PayloadAction<DocFont>) => {
      state.document.fontFamily = action.payload;
    },
    changeDocumentContent: (
      state,
      action: PayloadAction<{ content: CustomElement[] | Descendant[] }>
    ) => {
      state.document.content = action.payload.content;
    },
    updateCollaborators: (
      state,
      action: PayloadAction<{
        collaborators: Collaborator[];
      }>
    ) => {
      state.collaborator = action.payload.collaborators;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
  },
});

export const {
  initDocument,
  changeDocumentTitle,
  changeDocumentContent,
  updateCollaborators,
  updateLastModified,
  changeDocumentFontFamily,
  init,
  setUser,
} = docSlice.actions;
export default docSlice.reducer;
export type DocState = ReturnType<typeof docSlice.reducer>;
