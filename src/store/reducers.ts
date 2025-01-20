import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AlignType, CustomElement } from "../types/editor";
import { Descendant } from "slate";

type Comment = {
  content: string;
  time: number;
  user: User;
};

export type Document = {
  id: string;
  title: string;
  content: CustomElement[] | Descendant[];
  lastModified: number;
  createdTime: number;
  comments: Comment[];
};

type User = {
  id: string;
  name: string;
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

const initialContent: CustomElement[] | Descendant[] = [
  {
    type: "heading-one",
    level: 1,
    align: AlignType.Left,
    children: [{ text: "This is editable heading-one!", italic: true }],
  },
  {
    type: "heading-two",
    level: 2,
    align: AlignType.Left,
    children: [{ text: "This is editable heading-two!" }],
  },
  {
    type: "heading-three",
    level: 3,
    align: AlignType.Left,
    children: [{ text: "This is editable heading-three!" }],
  },
  {
    type: "paragraph",
    align: AlignType.Left,
    children: [
      {
        text: "This is editable plain text, just like a <textarea>!",
      },
    ],
  },

  {
    type: "code",
    children: [
      { text: "This is editable plain text, just like a <textarea>!" },
    ],
  },
  {
    type: "block-quote",
    children: [
      { text: "This is editable plain text, just like a <textarea>!" },
    ],
  },
  {
    type: "paragraph",
    align: AlignType.Center,
    children: [
      { text: "This is editable ", bold: true },
      { text: "code", type: "code" },
      { text: " text, just like a <textarea>!" },
    ],
  },
  {
    type: "check-list-item",
    checked: true,
    children: [{ text: "This is a To-do item." }],
  },
  {
    type: "paragraph",
    align: AlignType.Left,
    children: [{ text: "Enjoy the world" }],
  },
];

export const initialDocument = {
  id: "0001",
  title: "文档1",
  content: initialContent,
  lastModified: 1736776606249,
  createdTime: 1736776400000,
  comments: [],
};

const initialState: SystemState = {
  // 初始状态
  document: {
    id: "0001",
    title: "文档0",
    content: [],
    lastModified: 1736776606249,
    createdTime: 1736776400000,
    comments: [],
  },
  user: {
    id: "abc",
    name: "Raxskle",
  },
  collaborator: [],
};

const rootSlice = createSlice({
  name: "root",
  initialState,
  reducers: {
    initDocument: (state, action: PayloadAction<{ document: Document }>) => {
      state.document = action.payload.document;
    },
    changeDocumentTitle: (state, action: PayloadAction<{ title: string }>) => {
      state.document.title = action.payload.title;
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
  },
});

export const {
  initDocument,
  changeDocumentTitle,
  changeDocumentContent,
  updateCollaborators,
} = rootSlice.actions;
export default rootSlice.reducer;
export type RootState = ReturnType<typeof rootSlice.reducer>;
