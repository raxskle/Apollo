import { ReactEditor, RenderElementProps, useSlateStatic } from "slate-react";
import "./DividerElement.scss";
import { useEffect, useState } from "react";
import { Transforms } from "slate";

export const DividerElement = (props: RenderElementProps) => {
  const { attributes, element, children } = props;
  const editor = useSlateStatic();

  const [selected, setSelected] = useState<boolean>(false);

  useEffect(() => {
    // 监听删除
    const handleDelete = (e: KeyboardEvent) => {
      if (selected && (e.key === "Delete" || e.key === "Backspace")) {
        e.preventDefault();
        e.stopPropagation();
        const path = ReactEditor.findPath(editor, element);
        Transforms.removeNodes(editor, { at: path });
      }
    };

    window.addEventListener("keydown", handleDelete);

    return () => {
      window.removeEventListener("keydown", handleDelete);
    };
  }, [editor, element, selected]);

  if (element.type !== "divider") {
    return <div>类型出错</div>;
  }

  return (
    <div {...attributes} contentEditable={false} className="divider-element">
      <div className="divider-element-hide-children">{children}</div>
      <div
        className="divider-element-container"
        tabIndex={0}
        onFocus={() => {
          console.log(">>>>>>>>>>>>> focus ");
          setSelected(true);
        }}
        onBlur={() => {
          console.log(">>>>>>>>>>>>> blur ");
          setSelected(false);
        }}
      >
        <div className="divider-element-content"></div>
      </div>
    </div>
  );
};
