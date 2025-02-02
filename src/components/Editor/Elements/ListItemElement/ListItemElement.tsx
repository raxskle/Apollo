import "./ListItemElement.scss";
import { Path } from "slate";
import { ReactEditor, RenderElementProps, useSlateStatic } from "slate-react";
import { isCustomText } from "../../../../types/editor";

export const ListItemElement = (props: RenderElementProps) => {
  const { element } = props;
  const editor = useSlateStatic();
  const empty =
    element.children.length === 0 ||
    (element.children.length === 1 &&
      isCustomText(element.children[0]) &&
      element.children[0].text.length === 0);

  // 判断元素是否被选中
  const path = ReactEditor.findPath(editor, element);
  const isSelected =
    ReactEditor.isFocused(editor) &&
    editor.selection &&
    Path.equals(editor.selection.anchor.path, editor.selection.focus.path) &&
    editor.selection.anchor.offset === editor.selection.focus.offset &&
    Path.isAncestor(path, editor.selection?.anchor.path);

  if (props.element.type !== "list-item") {
    return <div>类型出错</div>;
  }
  return (
    <li
      {...props.attributes}
      style={{
        textWrap: "wrap",
        padding: "2px",
        margin: "0px",
        fontSize: "16px",
        position: "relative",
      }}
    >
      {props.children}
      {empty && isSelected && (
        <span
          className="empty-placeholder"
          contentEditable="false"
          style={{
            padding: "2px",
            userSelect: "none",
            pointerEvents: "none",
            position: "absolute",
            top: "0px",
            left: "0px",
            fontSize: "16px",
            textWrap: "nowrap",
            fontWeight: "normal",
            color: "rgba(180, 180, 180, 0.6)",
          }}
        >
          Numbered list...
        </span>
      )}
    </li>
  );
};
