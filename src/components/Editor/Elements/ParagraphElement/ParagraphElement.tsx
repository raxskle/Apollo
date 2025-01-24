import { Path } from "slate";
import { ReactEditor, RenderElementProps, useSlateStatic } from "slate-react";

export const ParagraphElement = (props: RenderElementProps) => {
  const { attributes, element, children } = props;

  const empty =
    element.children.length === 0 ||
    (element.children.length === 1 && element.children[0].text.length === 0);

  const editor = useSlateStatic();

  // 判断元素是否被选中
  const path = ReactEditor.findPath(editor, element);
  const isSelected =
    ReactEditor.isFocused(editor) &&
    editor.selection &&
    Path.equals(editor.selection.anchor.path, editor.selection.focus.path) &&
    editor.selection.anchor.offset === editor.selection.focus.offset &&
    Path.isAncestor(path, editor.selection?.anchor.path);

  if (element.type !== "paragraph") {
    return <div>类型出错</div>;
  }
  return (
    <p
      {...attributes}
      style={{
        position: "relative",
        fontSize: "16px",
        padding: "4px 0px",
        margin: "0px",
        textAlign: element.align,
      }}
    >
      {children}
      {empty && isSelected && (
        <span
          className="empty-placeholder"
          contentEditable="false"
          style={{
            userSelect: "none",
            pointerEvents: "none",
            position: "absolute",
            top: "0px",
            left: "0px",
            fontSize: "16px",
            padding: "4px 0px",
            margin: "0px",
            color: "rgba(180, 180, 180, 0.6)",
          }}
        >
          Enter text...
        </span>
      )}
    </p>
  );
};
