import { Path } from "slate";
import { ReactEditor, RenderElementProps, useSlateStatic } from "slate-react";

export const CodeElement = (props: RenderElementProps) => {
  const { element } = props;
  const editor = useSlateStatic();
  const empty =
    element.children.length === 0 ||
    (element.children.length === 1 && element.children[0].text.length === 0);

  // 判断元素是否被选中
  const path = ReactEditor.findPath(editor, element);
  const isSelected =
    ReactEditor.isFocused(editor) &&
    editor.selection &&
    Path.equals(editor.selection.anchor.path, editor.selection.focus.path) &&
    editor.selection.anchor.offset === editor.selection.focus.offset &&
    Path.isAncestor(path, editor.selection?.anchor.path);

  if (props.element.type !== "code") {
    return <div>类型出错</div>;
  }
  return (
    <pre
      {...props.attributes}
      style={{
        background: "rgba(9, 28, 65, 0.05)",
        fontSize: "16px",
        textWrap: "wrap",
        margin: "0px 0px",
        padding: "2px 4px",
        fontFamily: "cursive",
        position: "relative",
      }}
    >
      <code className="language-javascript">{props.children}</code>
      {empty && isSelected && (
        <span
          className="empty-placeholder"
          contentEditable="false"
          style={{
            padding: "2px 4px",
            userSelect: "none",
            pointerEvents: "none",
            position: "absolute",
            top: "0px",
            left: "0px",
            textWrap: "nowrap",
            fontWeight: "normal",
            color: "rgba(180, 180, 180, 0.6)",
          }}
        >
          Enter code...
        </span>
      )}
    </pre>
  );
};
