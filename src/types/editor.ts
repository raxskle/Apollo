import { BaseEditor, BaseOperation } from "slate";
import { ReactEditor } from "slate-react";
import { HistoryEditor } from "slate-history";

export enum AlignType {
  Left = "left",
  Center = "center",
  Right = "right",
}

export type CustomEditorType = BaseEditor & ReactEditor & HistoryEditor;
export type CustomTextDecoration = "bold" | "italic" | "underlined" | "code";
export type CustomText = {
  text: string;
  type?: string;
  placeholder?: string;
  bold?: boolean;
  italic?: boolean;
  underlined?: boolean;
  code?: boolean;
  color?: string;
  backgroundColor?: string;
};

export type ParagraphElement = {
  type: "paragraph";
  align: AlignType;
  children: CustomText[];
};

export type HeadingElement = {
  type: "heading-one" | "heading-two" | "heading-three";
  level: number;
  align: AlignType;
  children: CustomText[];
};

export type blockQuoteElement = {
  type: "block-quote";
  children: CustomText[];
};

export type CodeElement = {
  type: "code";
  children: CustomText[];
};

export type CheckListItemElement = {
  type: "check-list-item";
  checked: boolean;
  children: CustomText[];
};

export type ImageElement = {
  type: "image";
  url: string;
  alt: string;
  width: number;
  align: AlignType;
  children: CustomText[];
};

export type CustomElement =
  | ParagraphElement
  | HeadingElement
  | CodeElement
  | blockQuoteElement
  | CheckListItemElement
  | ImageElement;

export type CustomOperation = BaseOperation & {
  applyServer?: boolean;
  undo?: boolean;
};

declare module "slate" {
  interface CustomTypes {
    Editor: CustomEditorType;
    Element: CustomElement;
    Text: CustomText;
    Node: CustomElement | CustomText;
    Operation: CustomOperation;
  }
}
