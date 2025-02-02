import { Transforms } from "slate";
import { ReactEditor, RenderElementProps, useSlateStatic } from "slate-react";

export const BulletedListElement = (props: RenderElementProps) => {
  const { element, attributes, children } = props;
  const editor = useSlateStatic();

  if (element.children.length === 0) {
    const nodePath = ReactEditor.findPath(editor, element);
    Transforms.removeNodes(editor, { at: nodePath });

    return;
  }

  if (element.type !== "bulleted-list") {
    return <div>类型出错</div>;
  }
  return (
    <ul
      {...attributes}
      style={{
        paddingLeft: "20px",
        margin: "0px",
        marginTop: "10px",
        marginBottom: "10px",
        position: "relative",
      }}
    >
      {children}
    </ul>
  );
};
