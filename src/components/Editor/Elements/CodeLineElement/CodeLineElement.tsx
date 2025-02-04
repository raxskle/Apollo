import { Path, Transforms } from "slate";
import { ReactEditor, RenderElementProps, useSlateStatic } from "slate-react";
import { isCustomText } from "../../../../types/editor";
import { useEffect } from "react";

export const CodeLineElement = (props: RenderElementProps) => {
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

  useEffect(() => {
    // 列表第一项删除后，外层元素会被意外删除掉，path掉到顶层，需要手动清除
    if (path.length === 1 && element.type === "code-line") {
      Transforms.removeNodes(editor, { at: path });
    }
  });

  if (props.element.type !== "code-line") {
    return <div>类型出错</div>;
  }
  return (
    <div
      {...props.attributes}
      style={{
        textWrap: "wrap",
        wordBreak: "break-all",
        position: "relative",
      }}
    >
      {props.children}
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
            textWrap: "wrap",
            fontWeight: "normal",
            color: "rgb(180, 180, 180)",
          }}
        >
          Enter code...
        </span>
      )}
    </div>
  );
};
