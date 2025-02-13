import { BaseEditor, BaseOperation, BaseRange, Descendant, Node } from "slate";
import { ReactEditor } from "slate-react";
import { HistoryEditor } from "slate-history";

export enum AlignType {
  Left = "left",
  Center = "center",
  Right = "right",
}

export type CustomEditorType = BaseEditor &
  ReactEditor &
  HistoryEditor & {
    nodeToDecorations: Map<CustomElement, BaseRange[]>;
  };
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
  highlight?: boolean;
  isSelection?: boolean; // 其他用户选中光标
  selectionUser?: {
    userName: string;
    displayColor: string;
  };
};

export const isCustomText = (
  node: Node | Descendant | CustomElement
): node is CustomText => {
  return "text" in node;
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

export type NumberedListElement = {
  type: "numbered-list";
  children: ListItemElement[];
};

export type BulletedListElement = {
  type: "bulleted-list";
  children: ListItemElement[];
};

export type ListItemElement = {
  type: "list-item";
  children: CustomText[];
};

export type DividerElement = {
  type: "divider";
  children: CustomText[]; // 占位
};

export type CodeBlockElement = {
  type: "code-block";
  language: string;
  children: CodeLineElement[];
};

export type CodeLineElement = {
  type: "code-line";
  children: CustomText[];
};

export type CustomElement =
  | ParagraphElement
  | HeadingElement
  | blockQuoteElement
  | CheckListItemElement
  | ImageElement
  | NumberedListElement
  | BulletedListElement
  | ListItemElement
  | DividerElement
  | CodeBlockElement
  | CodeLineElement;

export type CustomOperation = BaseOperation & {
  applyServer?: boolean;
  undo?: boolean;
};

export function isCustomElement(
  node: Descendant | CustomEditorType
): node is CustomElement {
  return "type" in node && node.type !== undefined && !("text" in node);
}

export function isCodeBlockElement(node: Descendant): node is CodeBlockElement {
  return node.type === "code-block";
}

declare module "slate" {
  interface CustomTypes {
    Editor: CustomEditorType;
    Element: CustomElement;
    Text: CustomText;
    Node: CustomElement | CustomText;
    Operation: CustomOperation;
  }
}
