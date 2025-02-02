/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC, ReactNode, Ref } from "react";
import { cx, css } from "@emotion/css";
import {
  AlignType,
  CustomEditorType,
  CustomElement,
  CustomTextDecoration,
} from "../../../../../types/editor";
import { ReactEditor, useSlate } from "slate-react";

import { Editor, Element as SlateElement, Transforms } from "slate";
export const Button = React.forwardRef(
  (
    { className, active, reversed, ...props }: any,
    ref: Ref<HTMLSpanElement>
  ) => (
    <div
      {...props}
      ref={ref}
      className={cx(
        className,
        css`
          cursor: pointer;
          padding: 4px;
          box-sizing: border-box;
          border-radius: 4px;
          &:hover {
            background-color: rgb(230, 230, 230);
          }
          color: ${reversed
            ? active
              ? "black"
              : "rgb(180, 180, 180)"
            : active
              ? "black"
              : "rgb(180, 180, 180)"};
          height: 26px;

          svg,
          path {
            fill: ${reversed
              ? active
                ? "black"
                : "rgb(180, 180, 180)"
              : active
                ? "black"
                : "rgb(180, 180, 180)"};
            stroke: ${reversed
              ? active
                ? "black"
                : "rgb(180, 180, 180)"
              : active
                ? "black"
                : "rgb(180, 180, 180)"};
          }
        `
      )}
    />
  )
);

type ElementAttr = "align";

// 判断是否是Element的属性
const isElementAttr = (value: any): value is ElementAttr => {
  return ["align"].includes(value);
};

export const ToggleButton: FC<{
  format: CustomTextDecoration | ElementAttr;
  icon: string;
  value?: string;
  children?: ReactNode;
}> = ({ format, children, value }) => {
  const editor = useSlate();

  return (
    <Button
      active={
        isElementAttr(format)
          ? isAttrActive(editor, format, value)
          : isMarkActive(editor, format, value)
      }
      onClick={
        isElementAttr(format)
          ? () => toggleAttr(editor, format, value)
          : () => toggleMark(editor, format, value)
      }
    >
      {children}
    </Button>
  );
};

function isAlignType(value: any): value is AlignType {
  return Object.values(AlignType).includes(value);
}

// Element的属性
const toggleAttr = (
  editor: CustomEditorType,
  format: ElementAttr,
  value?: string
) => {
  const [currentNode] = Editor.nodes(editor, {
    match: (n) => SlateElement.isElement(n) && Editor.isBlock(editor, n),
  });

  const element = currentNode[0];
  const path = ReactEditor.findPath(editor, element);
  if (isAlignType(value)) {
    Transforms.setNodes(editor, { [format]: value }, { at: path });
  }
};

const isAlignElement = (
  element: CustomElement | null
): element is CustomElement & { align: AlignType } => {
  return element
    ? ["heading-one", "heading-two", "heading-three", "paragraph"].includes(
        element.type
      )
    : false;
};

// Element的属性
const isAttrActive = (
  editor: CustomEditorType,
  format: ElementAttr,
  value?: string
) => {
  // 需要比较节点的属性
  const [currentNode] = Editor.nodes(editor, {
    match: (n) => SlateElement.isElement(n) && Editor.isBlock(editor, n),
  });

  const element = currentNode[0] as CustomElement;

  if (isAlignElement(element)) {
    return element?.[format] === value;
  }

  return false;
};

// CustomText的mark
const toggleMark = (
  editor: CustomEditorType,
  format: CustomTextDecoration,
  value?: string
) => {
  const isActive = isMarkActive(editor, format);

  if (value) {
    if (isActive) {
      Editor.addMark(editor, format, "");
    } else {
      Editor.addMark(editor, format, value);
    }
    return;
  }

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const isMarkActive = (
  editor: CustomEditorType,
  format: CustomTextDecoration,
  value?: string | boolean | number
) => {
  if (!editor.selection) {
    return false;
  }

  let marks;
  try {
    marks = Editor.marks(editor);
  } catch {
    Transforms.select(editor, {
      anchor: { path: editor.selection.anchor.path.concat([0]), offset: 0 },
      focus: { path: editor.selection.focus.path.concat([0]), offset: 0 },
    });
    marks = Editor.marks(editor);
  }

  if (value) {
    return marks ? marks[format] === value : false;
  }
  return marks ? marks[format] === true : false;
};
