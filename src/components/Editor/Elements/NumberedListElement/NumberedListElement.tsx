import { Transforms } from "slate";
import "./NumberedListElement.scss";

import { ReactEditor, RenderElementProps, useSlateStatic } from "slate-react";

export const NumberedListElement = (props: RenderElementProps) => {
  const { element, attributes, children } = props;
  const editor = useSlateStatic();

  if (element.children.length === 0) {
    const nodePath = ReactEditor.findPath(editor, element);
    Transforms.removeNodes(editor, { at: nodePath });

    return;
  }

  if (element.type !== "numbered-list") {
    return <div>类型出错</div>;
  }
  return (
    <ol
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
    </ol>
  );
};
