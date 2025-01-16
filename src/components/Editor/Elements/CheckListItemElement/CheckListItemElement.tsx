import { ReactEditor, RenderElementProps, useSlateStatic } from "slate-react";
import { Transforms, Element as SlateElement } from "slate";

export const CheckListItemElement = (props: RenderElementProps) => {
  const editor = useSlateStatic();
  if (props.element.type !== "check-list-item") {
    return <div>类型出错</div>;
  }

  const { element } = props;
  const checked = element.checked;

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
          display: "inline-block",
          margin: "4px",
          marginLeft: "26px",
          padding: "0px",
          textDecoration: `${!checked ? "none" : "line-through"}`,
        }}
      >
        {props.children}
      </div>
    </>
  );
};
