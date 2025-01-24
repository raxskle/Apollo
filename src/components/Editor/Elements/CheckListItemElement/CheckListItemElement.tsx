import { ReactEditor, RenderElementProps, useSlateStatic } from "slate-react";
import { Transforms, Element as SlateElement, Path } from "slate";

export const CheckListItemElement = (props: RenderElementProps) => {
  const editor = useSlateStatic();
  if (props.element.type !== "check-list-item") {
    return <div>类型出错</div>;
  }

  const { element } = props;
  const checked = element.checked;

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

  return (
    <>
      <div
        {...props.attributes}
        contentEditable="false"
        style={{
          display: "inline-flex",
          position: "absolute",
          top: "50%",
          left: "50px",
          transform: "translateY(-50%)",
          justifyContent: "center",
          alignItems: "center",
          margin: "0px",
          padding: "0px",
        }}
      >
        <input
          type="checkbox"
          contentEditable="true"
          style={{
            display: "inline-flex",
            margin: "0px",
            width: "16px",
            height: "16px",
            padding: "0px",
          }}
          checked={checked}
          onChange={(event) => {
            const path = ReactEditor.findPath(editor, element);
            const newProperties: Partial<SlateElement> = {
              checked: event.target.checked,
            };
            Transforms.setNodes(editor, newProperties, { at: path });
          }}
        />
      </div>
      <div
        style={{
          margin: "4px",
          marginTop: "8px",
          marginBottom: "8px",
          marginLeft: "26px",
          padding: "0px",
          position: "relative",
          textDecoration: `${!checked ? "none" : "line-through"}`,
        }}
        contentEditable="true"
      >
        {props.children}
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
              textWrap: "nowrap",
              fontWeight: "normal",
              color: "rgba(180, 180, 180, 0.6)",
            }}
          >
            Enter text...
          </span>
        )}
      </div>
    </>
  );
};
